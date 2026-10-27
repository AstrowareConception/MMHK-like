"""First HTTP vertical slice. Jactari battle endpoints remain forbidden."""
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI(
    title="MMHK-like API",
    version="0.1.0",
    description="Experimental API skeleton. No authenticated game or PvP yet.",
)


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
