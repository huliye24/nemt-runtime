"""POST /api/v1/signals — 信号计算端点."""
import time
from fastapi import APIRouter, Depends
from nemt_api.services.model_service import ModelService
from nemt_api.dependencies import get_model_service
from nemt_api.schemas.request import SignalsRequest

router = APIRouter()


@router.post("/signals")
async def compute_signals(request: SignalsRequest, service: ModelService = Depends(get_model_service)):
    t0 = time.time()

    klines_dicts = [k.model_dump() for k in request.klines]
    result = service.compute_signals(klines_dicts)

    elapsed = (time.time() - t0) * 1000

    return {
        "success": True,
        "data": result,
        "meta": {
            "processing_time_ms": round(elapsed, 2),
            "model_version": "1.0.0",
        },
    }
