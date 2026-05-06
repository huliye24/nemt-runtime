"""Pydantic response models for NEMT API."""
from pydantic import BaseModel, Field
from typing import Optional, Any


class MetaInfo(BaseModel):
    processing_time_ms: float = 0
    model_version: str = "1.0.0"


class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[dict] = None
    meta: MetaInfo = Field(default_factory=MetaInfo)


class HealthResponse(BaseModel):
    status: str
    modules_loaded: bool
    version: str
