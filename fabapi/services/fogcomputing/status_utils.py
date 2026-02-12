# fabapi/services/fogcomputing/status_utils.py
from __future__ import annotations
from typing import Dict, List, Tuple

import numpy as np


def quality_score_0_100(metrics_after: Dict[str, float]) -> float:
    """
    Simple, operator-friendly score.
    Not threshold-based; uses continuous normalization.
    """
    b = float(metrics_after.get("brightness", 0.0))       # 0..1
    c = float(metrics_after.get("contrast", 0.0))         # 0..1
    lc = float(metrics_after.get("local_contrast", 0.0))  # ~0..1
    n = float(metrics_after.get("noise_proxy", 0.0))      # ~0..1
    ent = float(metrics_after.get("entropy", 0.0))        # ~0..8
    sharp = float(metrics_after.get("sharpness_lap", 0.0))# unbounded

    # Normalize sharpness into 0..1 using log scaling (no fixed threshold)
    sharp_norm = float(np.clip(np.log1p(sharp) / 10.0, 0.0, 1.0))

    # Entropy normalize (0..8-ish)
    ent_norm = float(np.clip(ent / 8.0, 0.0, 1.0))

    # Noise should reduce score
    noise_penalty = float(np.clip(n, 0.0, 1.0))

    # Weighted continuous score
    score = (
        0.18 * b +
        0.20 * c +
        0.15 * lc +
        0.20 * sharp_norm +
        0.15 * ent_norm +
        0.12 * (1.0 - noise_penalty)
    ) * 100.0

    return float(np.clip(score, 0.0, 100.0))


def build_alerts(
    patterned_conf: float,
    pattern_type_conf: float,
    score: float
) -> List[str]:
    """
    Operator-friendly alerts (simple and explainable).
    """
    alerts: List[str] = []

    # Low confidence awareness
    if patterned_conf < 0.60:
        alerts.append("Pattern detection uncertain")

    if pattern_type_conf < 0.60:
        alerts.append("Pattern type uncertain")

    # Score-based status (operator level)
    if score < 60:
        alerts.append("Low image quality (check lighting / focus)")
    elif score < 75:
        alerts.append("Moderate image quality")

    return alerts
