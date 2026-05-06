"""NEMT API configuration."""
import os

NEMT_SRC = os.getenv("NEMT_SRC", "/root/NEMT-Simulator2")
API_HOST = os.getenv("NEMT_API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("NEMT_API_PORT", "9000"))

MODEL_CONFIG = {
    "use_economic_analysis": False,
    "use_volatility_model": False,
    "use_spatial_temporal": False,
    "cache_size": 100,
    "cache_ttl": 300,
}

BINANCE_CONFIG = {
    "default_symbol": "BTCUSDT",
    "default_interval": "1h",
    "request_timeout": 10,
}
