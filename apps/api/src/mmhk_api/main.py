"""FastAPI public boundary. Only authenticated read-only world gameplay exists."""
from __future__ import annotations

from typing import Annotated
from uuid import UUID

import psycopg
from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict, Field

from .db import connection
from .security import get_authenticated_id, revoke_session, start_session
from .worlds import owned_cities, owned_city_detail, owned_worlds

app = FastAPI(
    title="MMHK-like API",
    version="0.2.0",
    description="Authenticated experimental world viewer; no public combat or economy writes.",
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
def login(payload: Login, db: _db, response: Response) -> Token:
    response.headers["Cache-Control"] = "no-store"
    token = start_session(db, payload.username, payload.password)
    if token is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
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
