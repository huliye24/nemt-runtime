"""FastAPI dependency injection."""
from nemt_api.services.model_service import ModelService

_model_service: ModelService | None = None


def get_model_service() -> ModelService:
    global _model_service
    if _model_service is None:
        _model_service = ModelService()
        _model_service.initialize()
    return _model_service
