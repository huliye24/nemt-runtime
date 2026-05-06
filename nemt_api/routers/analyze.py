"""POST /api/v1/analyze — 统一分析端点."""
import time
from fastapi import APIRouter, Depends
from nemt_api.services.model_service import ModelService
from nemt_api.dependencies import get_model_service
from nemt_api.schemas.request import AnalyzeRequest

router = APIRouter()


@router.post("/analyze")
async def analyze(request: AnalyzeRequest, service: ModelService = Depends(get_model_service)):
    t0 = time.time()

    klines_dicts = [k.model_dump() for k in request.klines]
    onchain = request.onchain_data.model_dump() if request.onchain_data else None
    account = request.account.model_dump() if request.account else None

    result = service.analyze(klines_dicts, onchain_data=onchain, account=account)

    elapsed = (time.time() - t0) * 1000

    return {
        "success": True,
        "data": result,
        "meta": {
            "processing_time_ms": round(elapsed, 2),
            "model_version": "1.0.0",
            "symbol": request.symbol,
            "timeframe": request.timeframe,
        },
    }
