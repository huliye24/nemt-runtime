"""Pydantic request models for NEMT API."""
from pydantic import BaseModel, Field
from typing import Optional, List


class KlineItem(BaseModel):
    open_time: int
    open: float
    high: float
    low: float
    close: float
    volume: float


class OnchainData(BaseModel):
    mvrv_zscore: Optional[float] = None
    nupl: Optional[float] = None
    exchange_balance: Optional[float] = None
    lth_sth_ratio: Optional[float] = None
    funding_rate: Optional[float] = None


class AccountState(BaseModel):
    balance: float = 100000.0
    current_positions: list = Field(default_factory=list)


class AnalyzeConfig(BaseModel):
    use_economic_analysis: bool = False
    use_volatility_model: bool = False
    use_spatial_temporal: bool = False


class AnalyzeRequest(BaseModel):
    symbol: str = "BTCUSDT"
    timeframe: str = "1h"
    klines: List[KlineItem] = Field(..., min_length=20)
    onchain_data: Optional[OnchainData] = None
    account: Optional[AccountState] = None
    config: Optional[AnalyzeConfig] = None


class SignalsRequest(BaseModel):
    klines: List[KlineItem] = Field(..., min_length=20)
    dci_window: int = Field(default=20, ge=5, le=200)
    vortex_threshold: float = Field(default=0.6, ge=0.1, le=1.0)


class PhaseRequest(BaseModel):
    klines: List[KlineItem] = Field(..., min_length=30)
    onchain_data: Optional[OnchainData] = None
