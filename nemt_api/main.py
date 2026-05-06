"""NEMT API Middle Platform — FastAPI entry point."""
import sys
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure NEMT-Simulator2 modules are importable
NEMT_SRC = os.getenv("NEMT_SRC", "/root/NEMT-Simulator2")
if NEMT_SRC not in sys.path:
    sys.path.insert(0, NEMT_SRC)

from nemt_api.routers import analyze, signals, phase  # noqa: E402
from nemt_api.dependencies import get_model_service  # noqa: E402


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[NEMT API] Starting up...")
    svc = get_model_service()
    svc.initialize()
    print(f"[NEMT API] Model service ready: {svc.is_ready()}")
    yield
    print("[NEMT API] Shutting down...")


app = FastAPI(
    title="NEMT API Middle Platform",
    version="1.0.0",
    description="Quantitative Trading Middle Platform — Signal, Risk, Execution API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api/v1", tags=["Analysis"])
app.include_router(signals.router, prefix="/api/v1", tags=["Signals"])
app.include_router(phase.router, prefix="/api/v1", tags=["Phase"])


@app.get("/health")
async def health():
    svc = get_model_service()
    return {
        "status": "ok" if svc.is_ready() else "degraded",
        "modules_loaded": svc.is_ready(),
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("nemt_api.main:app", host="0.0.0.0", port=9000, reload=True)
