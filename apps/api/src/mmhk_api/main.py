"""FastAPI public boundary. Only authenticated read-only world gameplay exists."""
from __future__ import annotations

from datetime import datetime
from typing import Annotated
from uuid import UUID

import psycopg
from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict, Field

from .construction import (
    ConstructionConflict, ConstructionNotFound, catalog_for_city, start_construction,
)
from .map_views import MapNotFound, own_region, world_overview
from .timeline import timeline_for_player
from .artifacts import artifact_inventory, move_artifact
from .forces import city_forces, recruit_units, hire_hero, RecruitmentNotFound, RecruitmentConflict, transfer_units
from .login_limits import (
    RateLimitConfigurationError, reserve_login_attempt, audit_login,
    reset_account_limit_after_login,
)
from .db import connection
from .security import get_authenticated_id, revoke_session, start_session
from .worlds import owned_cities, owned_city_detail, owned_worlds

app = FastAPI(
    title="MMHK-like API",
    version="0.2.0",
    description="Authenticated experimental world viewer; worker-only economic credits, no public combat or economy writes.",
)

_db = Annotated[psycopg.Connection, Depends(connection)]
_bearer = HTTPBearer(auto_error=False)


class StrictDTO(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Health(StrictDTO):
    status: str
    service: str


class JactariStatus(StrictDTO):
    engine: str
    python_port_scope: str
    js_oracle_retained: bool
    historically_certified_s2: bool
    public_battle_api_enabled: bool


class Login(StrictDTO):
    username: str = Field(min_length=3, max_length=32)
    password: str = Field(min_length=1, max_length=128)


class Token(StrictDTO):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 28800


class World(StrictDTO):
    world_id: str
    name: str
    world_size: int


class City(StrictDTO):
    city_id: UUID
    name: str
    x: int
    y: int
    first_city: bool


class CityDetail(City):
    world_id: str
    stocks: dict[str, int]
    mines: list[str]
    production_active: bool
    production_per_day: dict[str, str]
    stock_capacities: dict[str, int | None]
    building_effects: dict
    tick_seconds: int | None
    next_credit_at: datetime | None
    historical_economy_certified: bool


def current_account(
    db: _db,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(_bearer)
    ],
) -> UUID:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Authentication required")
    player_id = get_authenticated_id(db, credentials.credentials)
    if player_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return player_id


_player = Annotated[UUID, Depends(current_account)]


@app.get("/api/v1/health", response_model=Health)
def health() -> Health:
    return Health(status="ok", service="mmhk-api")


@app.get("/api/v1/jactari/status", response_model=JactariStatus)
def jactari_status() -> JactariStatus:
    return JactariStatus(
        engine="Jactari",
        python_port_scope="single-stack-experimental",
        js_oracle_retained=True,
        historically_certified_s2=False,
        public_battle_api_enabled=False,
    )


@app.post("/api/v1/sessions", response_model=Token)
def login(payload: Login, db: _db, response: Response, request: Request) -> Token:
    response.headers["Cache-Control"] = "no-store"
    # Only the trusted ASGI peer address. No unverified X-Forwarded-For.
    remote = request.client.host if request.client is not None else "unknown"
    try:
        retry_after = reserve_login_attempt(
            db, username=payload.username, source_ip=remote,
        )
    except RateLimitConfigurationError as exc:
        raise HTTPException(status_code=503, detail="Authentication unavailable") from exc
    if retry_after:
        audit_login(db, username=payload.username, kind="limited")
        db.commit()  # Keep the audit event despite the HTTPException.
        raise HTTPException(
            status_code=429, detail="Too many login attempts",
            headers={"Retry-After": str(retry_after), "Cache-Control": "no-store"},
        )
    token = start_session(db, payload.username, payload.password)
    audit_login(db, username=payload.username,
                kind="accepted" if token is not None else "rejected")
    if token is not None:
        reset_account_limit_after_login(db, username=payload.username)
    # Rate limit / audit data must remain durable after a 401. The current
    # generator connection otherwise rolls back on raised HTTPException.
    db.commit()
    if token is None:
        raise HTTPException(
            status_code=401, detail="Invalid credentials",
            headers={"Cache-Control": "no-store"},
        )
    return Token(access_token=token)


@app.delete("/api/v1/sessions/current", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    db: _db,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> Response:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    player_id = get_authenticated_id(db, credentials.credentials)
    if player_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    revoke_session(db, credentials.credentials)
    return Response(status_code=204, headers={"Cache-Control": "no-store"})


class TimelineEvent(StrictDTO):
    id: str
    type: str
    title: str
    occurs_at: datetime
    world_id: str
    city_id: UUID
    city_name: str
    target_url: str
    icon: str
    priority: str


class TimelineResponse(StrictDTO):
    server_now: datetime
    horizon_hours: int
    truncated: bool
    events: list[TimelineEvent]


@app.get("/api/v1/me/timeline", response_model=TimelineResponse)
def my_timeline(
    db: _db, player: _player,
    hours: int = 12,
) -> TimelineResponse:
    if not 1 <= hours <= 48:
        raise HTTPException(status_code=422, detail="hours must be between 1 and 48")
    return TimelineResponse(**timeline_for_player(db, player, hours=hours))


@app.get("/api/v1/me/worlds", response_model=list[World])
def my_worlds(db: _db, player: _player) -> list[World]:
    return [World(**w) for w in owned_worlds(db, player)]


@app.get("/api/v1/me/worlds/{world_id}/cities", response_model=list[City])
def my_cities(world_id: str, db: _db, player: _player) -> list[City]:
    if world_id not in {w["world_id"] for w in owned_worlds(db, player)}:
        raise HTTPException(status_code=404, detail="World not found")
    return [City(**c) for c in owned_cities(db, player, world_id)]


@app.get("/api/v1/me/cities/{city_id}", response_model=CityDetail)
def my_city(city_id: UUID, db: _db, player: _player) -> CityDetail:
    detail = owned_city_detail(db, player, city_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="City not found")
    return CityDetail(**detail)


class ConstructionRequest(StrictDTO):
    order_id: UUID
    building_code: str = Field(pattern=r"^[a-z][a-z0-9_]{1,47}$")
    mode: str = Field(pattern=r"^(normal|rapid|economic)$")


class ConstructionReceipt(StrictDTO):
    order_id: UUID
    building_code: str
    target_level: int
    mode: str
    policy_id: str
    applied_costs: dict[str, int]
    started_at: datetime
    due_at: datetime
    status: str
    completed_at: datetime | None
    historically_certified: bool
    replayed: bool


@app.get("/api/v1/me/cities/{city_id}/construction")
def my_city_construction(city_id: UUID, db: _db, player: _player) -> dict:
    try:
        return catalog_for_city(db, player, city_id)
    except ConstructionNotFound as exc:
        raise HTTPException(status_code=404, detail="City not found") from exc


@app.post(
    "/api/v1/me/cities/{city_id}/construction",
    response_model=ConstructionReceipt,
    status_code=status.HTTP_201_CREATED,
)
def start_my_city_construction(
    city_id: UUID, command: ConstructionRequest, db: _db, player: _player,
    response: Response,
) -> ConstructionReceipt:
    response.headers["Cache-Control"] = "no-store"
    try:
        receipt = start_construction(
            db, account_id=player, city_id=city_id,
            order_id=command.order_id, building_code=command.building_code,
            mode=command.mode,
        )
        if receipt["replayed"]:
            response.status_code = 200
        return ConstructionReceipt(**receipt)
    except ConstructionNotFound as exc:
        raise HTTPException(status_code=404, detail="City not found") from exc
    except ConstructionConflict as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


# First urban military vertical slice; all costs, pools and hero offers are
# resolved on the server. No Jactari combat endpoint is activated.
class UnitRecruitRequest(StrictDTO):
    order_id: UUID
    unit_code: str = Field(pattern=r"^[a-z][a-z0-9_]{1,47}$")
    quantity: int = Field(ge=1, le=1000)


class HeroHireRequest(StrictDTO):
    order_id: UUID
    offer_id: UUID


@app.get("/api/v1/me/cities/{city_id}/forces")
def my_city_forces(city_id: UUID, db: _db, player: _player) -> dict:
    try:
        return city_forces(db, owner=player, city_id=city_id)
    except RecruitmentNotFound as exc:
        raise HTTPException(status_code=404, detail="City not found") from exc


@app.post("/api/v1/me/cities/{city_id}/recruit", status_code=201)
def my_city_recruit(city_id: UUID, data: UnitRecruitRequest, db: _db,
                    player: _player, response: Response) -> dict:
    response.headers["Cache-Control"] = "no-store"
    try:
        receipt = recruit_units(db, owner=player, city_id=city_id,
            order_id=data.order_id, unit_code=data.unit_code, quantity=data.quantity)
        if receipt["replayed"]:
            response.status_code = 200
        return receipt
    except RecruitmentNotFound as exc:
        raise HTTPException(status_code=404, detail="City not found") from exc
    except RecruitmentConflict as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.post("/api/v1/me/cities/{city_id}/heroes/hire", status_code=201)
def my_city_hero_hire(city_id: UUID, data: HeroHireRequest, db: _db,
                      player: _player, response: Response) -> dict:
    response.headers["Cache-Control"] = "no-store"
    try:
        receipt = hire_hero(db, owner=player, city_id=city_id,
            order_id=data.order_id, offer_id=data.offer_id)
        if receipt["replayed"]:
            response.status_code = 200
        return receipt
    except RecruitmentNotFound as exc:
        raise HTTPException(status_code=404, detail="City not found") from exc
    except RecruitmentConflict as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


class UnitTransferRequest(StrictDTO):
    order_id: UUID
    hero_id: UUID
    unit_code: str = Field(pattern=r"^[a-z][a-z0-9_]{1,47}$")
    quantity: int = Field(ge=1, le=1000)
    direction: str = Field(pattern=r"^(to_hero|to_garrison)$")


@app.post("/api/v1/me/cities/{city_id}/forces/transfer", status_code=201)
def my_city_transfer(city_id: UUID, data: UnitTransferRequest, db: _db,
                     player: _player, response: Response) -> dict:
    response.headers["Cache-Control"] = "no-store"
    try:
        result=transfer_units(db,owner=player,city_id=city_id,order_id=data.order_id,
            hero_id=data.hero_id,unit_code=data.unit_code,quantity=data.quantity,
            direction=data.direction)
        if result["replayed"]:
            response.status_code=200
        return result
    except RecruitmentNotFound as exc:
        raise HTTPException(status_code=404,detail="City or hero not found") from exc
    except RecruitmentConflict as exc:
        raise HTTPException(status_code=409,detail=str(exc)) from exc


class ArtifactMoveCommand(StrictDTO):
    order_id: UUID
    artifact_id: UUID
    operation: str = Field(pattern=r"^(equip|unequip|to_reserve|to_bag|to_hero)$")
    target_hero_id: UUID | None = None


@app.get("/api/v1/me/cities/{city_id}/artifacts")
def my_artifacts(city_id:UUID,db:_db,player:_player)->dict:
    try:
        return artifact_inventory(db,player,city_id)
    except RecruitmentNotFound as exc:
        raise HTTPException(status_code=404,detail="City not found") from exc


@app.post("/api/v1/me/cities/{city_id}/artifacts/move",status_code=201)
def my_artifact_move(city_id:UUID,command:ArtifactMoveCommand,db:_db,
                     player:_player,response:Response)->dict:
    response.headers["Cache-Control"]="no-store"
    try:
        receipt=move_artifact(db,owner=player,city_id=city_id,
            order_id=command.order_id,artifact_id=command.artifact_id,
            operation=command.operation,target_hero_id=command.target_hero_id)
        if receipt["replayed"]:response.status_code=200
        return receipt
    except RecruitmentNotFound as exc:
        raise HTTPException(status_code=404,detail="City, hero or object not found") from exc
    except RecruitmentConflict as exc:
        raise HTTPException(status_code=409,detail=str(exc)) from exc


# Read-only map prototypes. No foreign city, fog-of-war intelligence or
# unverified regional resource placements can be requested through these.
@app.get("/api/v1/me/worlds/{world_id}/overview")
def my_world_overview(world_id: str, db: _db, player: _player) -> dict:
    try:
        return world_overview(db, player, world_id)
    except MapNotFound as exc:
        raise HTTPException(status_code=404, detail="World not found") from exc


@app.get("/api/v1/me/cities/{city_id}/region")
def my_region(city_id: UUID, db: _db, player: _player) -> dict:
    try:
        return own_region(db, player, city_id)
    except MapNotFound as exc:
        raise HTTPException(status_code=404, detail="City not found") from exc


@app.middleware("http")
async def prevent_sensitive_response_caching(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault("X-Frame-Options", "DENY")
    if request.url.path.startswith("/api/v1/me/") or request.url.path.startswith("/api/v1/sessions"):
        response.headers["Cache-Control"] = "no-store"
    return response
