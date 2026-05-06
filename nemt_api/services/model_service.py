"""Model service wrapping NEMT core + signals + phase detection."""
import sys
import time
import logging
from typing import Optional

import numpy as np

NEMT_SRC = "/root/NEMT-Simulator2"
if NEMT_SRC not in sys.path:
    sys.path.insert(0, NEMT_SRC)

from nemt_core import NEMTSimulator, NEMTParams  # noqa: E402
from nemt_signals import NEMTSignalIndicators  # noqa: E402
from enhanced_phase_detector import EnhancedPhaseDetector  # noqa: E402

logger = logging.getLogger(__name__)


def _serialize(obj):
    """Convert dataclass/enum/list/dict to JSON-serializable dict."""
    if obj is None:
        return None
    if isinstance(obj, (int, float, str, bool, np.integer, np.floating)):
        return float(obj) if isinstance(obj, (np.integer, np.floating)) else obj
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if hasattr(obj, 'value'):
        return _serialize(obj.value)
    if hasattr(obj, '__dataclass_fields__'):
        result = {}
        for f in obj.__dataclass_fields__:
            v = getattr(obj, f)
            if not f.startswith('_'):
                result[f] = _serialize(v)
        return result
    if isinstance(obj, (list, tuple)):
        return [_serialize(v) for v in obj]
    if isinstance(obj, dict):
        return {str(k): _serialize(v) for k, v in obj.items()}
    if hasattr(obj, '__dict__'):
        return {k: _serialize(v) for k, v in obj.__dict__.items() if not k.startswith('_')}
    return str(obj)


class ModelService:
    """Unified model service wrapping NEMT core + signals + phase detection."""

    def __init__(self):
        self._simulator: Optional[NEMTSimulator] = None
        self._signals: Optional[NEMTSignalIndicators] = None
        self._phase_detector: Optional[EnhancedPhaseDetector] = None
        self._modules_ready = False
        self._last_prices_hash = None
        self._cached_spectral_width = None

    def initialize(self):
        """Initialize all NEMT modules."""
        try:
            params = NEMTParams(alpha=0.1, beta=1.0, noise_level=0.2,
                               dt=0.01, dx=1.0, steps=200)
            self._simulator = NEMTSimulator(params)
            logger.info("NEMTSimulator initialized")
        except Exception as e:
            logger.warning(f"NEMTSimulator init failed: {e}")

        try:
            self._signals = NEMTSignalIndicators()
            logger.info("NEMTSignalIndicators initialized")
        except Exception as e:
            logger.warning(f"Signal indicators init failed: {e}")

        try:
            self._phase_detector = EnhancedPhaseDetector()
            logger.info("EnhancedPhaseDetector initialized")
        except Exception as e:
            logger.warning(f"Phase detector init failed: {e}")

        self._modules_ready = True
        logger.info("ModelService ready")

    def is_ready(self) -> bool:
        return self._modules_ready

    def _ensure_core_pipeline(self, prices: list):
        """Run NEMT core pipeline if not cached."""
        prices_hash = hash(tuple(prices))
        if self._last_prices_hash == prices_hash and self._cached_spectral_width is not None:
            return

        psi = self._simulator.initialize_state(prices)
        self._simulator.spectral_analysis(psi)
        self._simulator.compute_spectral_width()
        self._simulator.evolve(psi)

        self._last_prices_hash = prices_hash
        self._cached_spectral_width = float(getattr(self._simulator, 'spectral_width', 0))

    def _klines_to_numpy(self, klines: list):
        """Convert kline dict list to numpy arrays."""
        prices = np.array([float(k['close']) for k in klines])
        volumes = np.array([float(k.get('volume', 0)) for k in klines])
        highs = np.array([float(k['high']) for k in klines])
        lows = np.array([float(k['low']) for k in klines])
        return prices, volumes, highs, lows

    def analyze(self, klines: list, onchain_data: dict = None,
                account: dict = None) -> dict:
        """Run unified analysis: signals + phase."""
        t0 = time.time()
        prices, volumes, highs, lows = self._klines_to_numpy(klines)
        self._ensure_core_pipeline(list(prices))

        signals_result = self._compute_signals_impl(prices, volumes)
        phase_result = self._detect_phase_impl(prices, volumes)
        elapsed = (time.time() - t0) * 1000

        return {
            "signals": signals_result,
            "phase": phase_result,
            "spectral_width": self._cached_spectral_width,
            "processing_time_ms": round(elapsed, 2),
        }

    def compute_signals(self, klines: list) -> dict:
        """Compute all NEMT signals."""
        prices, volumes, highs, lows = self._klines_to_numpy(klines)
        self._ensure_core_pipeline(list(prices))
        return self._compute_signals_impl(prices, volumes)

    def detect_phase(self, klines: list) -> dict:
        """Detect market phase."""
        prices, volumes, highs, lows = self._klines_to_numpy(klines)
        self._ensure_core_pipeline(list(prices))
        return self._detect_phase_impl(prices, volumes)

    def _compute_signals_impl(self, prices: np.ndarray, volumes: np.ndarray) -> dict:
        """Internal signal computation using individual method calls."""
        oi_values = volumes * 0.5
        funding_rates = np.zeros(len(prices))
        bbw_history = np.array([])

        # 1. Compute DCI
        try:
            dci = self._signals.compute_dci(list(prices))
            dci_result = _serialize(dci)
        except Exception as e:
            logger.warning(f"DCI failed: {e}")
            dci_result = None
            dci = None

        # 2. Detect vortex (numpy arrays required by original code)
        try:
            vortex = self._signals.detect_vortex(
                prices, volumes, oi_values, funding_rates, bbw_history
            )
            vortex_result = _serialize(vortex)
        except Exception as e:
            logger.warning(f"Vortex detection failed: {e}")
            vortex_result = None
            vortex = None

        # 3. Detect resonance
        try:
            resonance = self._signals.detect_resonance()
            resonance_result = _serialize(resonance)
        except Exception as e:
            logger.warning(f"Resonance detection failed: {e}")
            resonance_result = None
            resonance = None

        # 4. Determine phase
        try:
            if dci is not None and vortex is not None and resonance is not None:
                phase, confidence = self._signals.determine_phase(
                    dci, vortex, resonance
                )
                phase_str = phase.value if hasattr(phase, 'value') else str(phase)
            else:
                phase_str = "unknown"
                confidence = 0
        except Exception as e:
            logger.warning(f"Phase determination failed: {e}")
            phase_str = "unknown"
            confidence = 0

        return {
            "dci": dci_result,
            "vortex": vortex_result,
            "resonance": resonance_result,
            "phase": phase_str,
            "phase_confidence": confidence,
            "spectral_width": self._cached_spectral_width,
        }

    def _detect_phase_impl(self, prices: np.ndarray, volumes: np.ndarray) -> dict:
        """Internal phase detection via EnhancedPhaseDetector or fallback."""
        sw = self._cached_spectral_width or 0

        # Try EnhancedPhaseDetector first
        try:
            dci = self._signals.compute_dci(list(prices))
            dci_val = getattr(dci, 'dci', 0) or getattr(dci, 'value', 0)
            if dci_val is None:
                dci_val = 0

            result = self._phase_detector.analyze(
                prices=list(prices),
                volumes=list(volumes),
                dci=float(dci_val),
                spectral_width=float(sw),
                vortex_score=0.5,
                resonance_confidence=0.3,
                momentum=0.0,
            )
            return _serialize(result)
        except Exception as e:
            logger.warning(f"EnhancedPhaseDetector failed: {e}")

        # Fallback: use NEMTSignalIndicators.determine_phase
        try:
            oi_values = volumes * 0.5
            funding_rates = np.zeros(len(prices))
            dci = self._signals.compute_dci(list(prices))
            vortex = self._signals.detect_vortex(
                prices, volumes, oi_values, funding_rates, np.array([])
            )
            resonance = self._signals.detect_resonance()
            phase, confidence = self._signals.determine_phase(dci, vortex, resonance)
            phase_str = phase.value if hasattr(phase, 'value') else str(phase)
            return {
                "phase": phase_str,
                "phase_name": str(getattr(phase, 'name', phase_str)),
                "confidence": float(confidence) if confidence else 0,
                "spectral_width": sw,
            }
        except Exception as e2:
            logger.warning(f"Fallback phase also failed: {e2}")
            return {"phase": "unknown", "error": str(e2)}
