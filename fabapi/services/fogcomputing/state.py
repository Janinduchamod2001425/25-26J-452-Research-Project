# fabapi/services/fogcomputing/state.py
from __future__ import annotations
import time
from typing import Any, Dict, Optional

LATEST_STATUS: Dict[str, Any] = {
    "timestamp": None,
    "uptime_sec": 0.0,
    "fabric": {
        "patterned_label": "unknown",
        "patterned_confidence": 0.0,
        "pattern_type": "none",
        "pattern_type_confidence": 0.0,
    },
    "enhancement": {
        "strategy": "none",
        "quality_score": 0.0,
        "metrics_before": {},
        "metrics_after": {},
        "delta": {},
    },
    "alerts": [],
    "performance": {
        "fps": 0.0,
        "latency_ms": 0.0,
        "frames_processed": 0,
    },
    # Optional: base64 preview (small)
    "preview": {
        "enabled": False,
        "enhanced_image_base64": None,
    }
}

APP_START_TIME = time.time()


def update_status(payload: Dict[str, Any]) -> None:
    LATEST_STATUS.update(payload)
