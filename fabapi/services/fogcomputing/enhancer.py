#new code after patterned_vs_nonpatterned classfication(26/02/08)
# fabapi/services/fogcomputing/enhancer.py

from __future__ import annotations

import io
import math
from dataclasses import dataclass, asdict
from typing import Dict, Any, Optional, Tuple

import numpy as np
import cv2
from PIL import Image


# =========================================================
# Helpers: Image I/O
# =========================================================

def bytes_to_bgr(image_bytes: bytes) -> np.ndarray:
    """Decode bytes -> BGR uint8 (OpenCV). Supports JPEG/PNG, etc."""
    # Use PIL for robust decoding, then convert to OpenCV BGR
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    rgb = np.array(img, dtype=np.uint8)
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    return bgr


def bgr_to_jpeg_bytes(bgr: np.ndarray, quality: int = 92) -> bytes:
    """Encode BGR uint8 -> JPEG bytes."""
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb)
    out = io.BytesIO()
    pil_img.save(out, format="JPEG", quality=int(np.clip(quality, 70, 98)))
    return out.getvalue()


# =========================================================
# Adaptive Stats (No fixed thresholds)
# =========================================================

@dataclass
class RunningStats:
    """
    EWMA running statistics for adaptive normalization.
    Store per-metric mean and variance (approx) to compute z-scores.
    """
    alpha: float = 0.12  # smoothing factor (0.05–0.2 reasonable)
    mu: Dict[str, float] = None
    var: Dict[str, float] = None
    initialized: bool = False

    def __post_init__(self):
        if self.mu is None:
            self.mu = {}
        if self.var is None:
            self.var = {}

    def update(self, metrics: Dict[str, float]) -> None:
        eps = 1e-8
        if not self.initialized:
            for k, v in metrics.items():
                self.mu[k] = float(v)
                self.var[k] = 1.0  # start with small variance
            self.initialized = True
            return

        for k, v in metrics.items():
            v = float(v)
            mu_old = self.mu.get(k, v)
            var_old = self.var.get(k, 1.0)

            mu_new = (1 - self.alpha) * mu_old + self.alpha * v
            # EWMA variance update (approx)
            var_new = (1 - self.alpha) * var_old + self.alpha * ((v - mu_new) ** 2)

            self.mu[k] = float(mu_new)
            self.var[k] = float(max(var_new, eps))

    def zscore(self, key: str, value: float) -> float:
        eps = 1e-8
        mu = self.mu.get(key, float(value))
        var = self.var.get(key, 1.0)
        return float((value - mu) / math.sqrt(var + eps))


# =========================================================
# Quality Metrics (Advanced + Robust)
# =========================================================

def _gray(bgr: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)


def _entropy(gray: np.ndarray) -> float:
    """Shannon entropy of grayscale histogram."""
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).astype(np.float64).ravel()
    p = hist / (hist.sum() + 1e-12)
    p = p[p > 1e-12]
    ent = -np.sum(p * np.log2(p))
    return float(ent)


def _tenengrad_sharpness(gray: np.ndarray) -> float:
    """Tenengrad (Sobel energy) sharpness measure."""
    gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    fm = (gx * gx + gy * gy).mean()
    return float(fm)


def _laplacian_var(gray: np.ndarray) -> float:
    """Variance of Laplacian for focus/blur indication."""
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def _local_contrast(gray: np.ndarray) -> float:
    """
    Local contrast proxy: mean of local stddev using a small window.
    More robust than global std on textured surfaces.
    """
    # Use box filter to estimate local mean and local mean of squares
    g = gray.astype(np.float32) / 255.0
    k = 9
    mean = cv2.boxFilter(g, ddepth=-1, ksize=(k, k), normalize=True)
    mean2 = cv2.boxFilter(g * g, ddepth=-1, ksize=(k, k), normalize=True)
    std = np.sqrt(np.maximum(mean2 - mean * mean, 1e-8))
    return float(std.mean())


def _noise_proxy(gray: np.ndarray) -> float:
    """
    Noise proxy: high-frequency residual energy.
    Use median blur to approximate "clean" image; residual captures noise + fine texture.
    """
    g = gray.astype(np.float32) / 255.0
    smooth = cv2.medianBlur((g * 255).astype(np.uint8), 3).astype(np.float32) / 255.0
    resid = g - smooth
    return float(np.mean(np.abs(resid)))


def compute_quality_metrics(bgr: np.ndarray) -> Dict[str, float]:
    """
    Metrics are continuous, robust, and do not require fixed thresholds.
    """
    gray = _gray(bgr)

    # Robust brightness: median intensity (less sensitive than mean)
    brightness_med = float(np.median(gray) / 255.0)

    # Global contrast: robust spread (p90 - p10)
    p10 = float(np.percentile(gray, 10) / 255.0)
    p90 = float(np.percentile(gray, 90) / 255.0)
    contrast_robust = float(np.clip(p90 - p10, 0.0, 1.0))

    # Texture/edge detail metrics
    lap_var = _laplacian_var(gray)
    tenengrad = _tenengrad_sharpness(gray)

    # Information richness
    ent = _entropy(gray)

    # Local contrast proxy
    lcon = _local_contrast(gray)

    # Noise proxy
    noise = _noise_proxy(gray)

    return {
        "brightness": brightness_med,         # 0–1
        "contrast": contrast_robust,          # 0–1
        "sharpness_lap": lap_var,             # unbounded
        "sharpness_ten": tenengrad,           # unbounded
        "entropy": ent,                       # ~0–8
        "local_contrast": lcon,               # 0–1-ish
        "noise_proxy": noise,                 # 0–1-ish
        "p10": p10,
        "p90": p90,
    }


# =========================================================
# Enhancement Operators (Parametric)
# =========================================================

def _apply_clahe(bgr: np.ndarray, clip_limit: float, tile_grid: int = 8) -> np.ndarray:
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=float(clip_limit), tileGridSize=(tile_grid, tile_grid))
    l2 = clahe.apply(l)
    out = cv2.merge([l2, a, b])
    return cv2.cvtColor(out, cv2.COLOR_LAB2BGR)


def _apply_gamma(bgr: np.ndarray, gamma: float) -> np.ndarray:
    gamma = float(np.clip(gamma, 0.5, 2.0))
    inv = 1.0 / gamma
    table = (np.array([(i / 255.0) ** inv for i in range(256)]) * 255).astype("uint8")
    return cv2.LUT(bgr, table)


def _bilateral(bgr: np.ndarray, d: int, sigma_color: float, sigma_space: float) -> np.ndarray:
    return cv2.bilateralFilter(bgr, d=int(d), sigmaColor=float(sigma_color), sigmaSpace=float(sigma_space))


def _edge_preserve(bgr: np.ndarray, sigma_s: float, sigma_r: float) -> np.ndarray:
    # OpenCV edgePreservingFilter expects sigma_s in [0..200], sigma_r in [0..1]
    return cv2.edgePreservingFilter(bgr, flags=1, sigma_s=float(np.clip(sigma_s, 0, 200)), sigma_r=float(np.clip(sigma_r, 0.0, 1.0)))


def _unsharp_mask(bgr: np.ndarray, amount: float, radius: int = 3) -> np.ndarray:
    amount = float(np.clip(amount, 0.0, 2.0))
    blur = cv2.GaussianBlur(bgr, (0, 0), radius)
    out = cv2.addWeighted(bgr, 1.0 + amount, blur, -amount, 0)
    return out


def _auto_white_balance_grayworld(bgr: np.ndarray, strength: float) -> np.ndarray:
    """Gray-world white balance with strength [0..1]."""
    strength = float(np.clip(strength, 0.0, 1.0))
    b, g, r = cv2.split(bgr.astype(np.float32))
    mb, mg, mr = np.mean(b), np.mean(g), np.mean(r)
    mean = (mb + mg + mr) / 3.0 + 1e-6
    b2 = b * (mean / (mb + 1e-6))
    g2 = g * (mean / (mg + 1e-6))
    r2 = r * (mean / (mr + 1e-6))
    balanced = cv2.merge([b2, g2, r2])
    blended = (1 - strength) * bgr.astype(np.float32) + strength * balanced
    return np.clip(blended, 0, 255).astype(np.uint8)


# =========================================================
# Strategy Selection (No fixed thresholds; continuous scoring)
# =========================================================

def _sigmoid(x: float) -> float:
    return float(1.0 / (1.0 + math.exp(-x)))


def _clip01(x: float) -> float:
    return float(np.clip(x, 0.0, 1.0))


def select_strategy(
    patterned_label: str,
    pattern_type: str,
    metrics: Dict[str, float],
    stats: Optional[RunningStats] = None
) -> Tuple[str, Dict[str, Any]]:
    """
    Decide enhancement strategy + continuous parameters from metrics
    using adaptive normalization (z-scores) instead of fixed thresholds.
    """
    # Default stats if none: will behave more conservatively
    if stats is None or not stats.initialized:
        stats = stats or RunningStats()
        # initialize pseudo stats from current metrics to avoid NaNs
        stats.update(metrics)

    # Adaptive signals (z-scores)
    z_b = stats.zscore("brightness", metrics["brightness"])
    z_c = stats.zscore("contrast", metrics["contrast"])
    z_lc = stats.zscore("local_contrast", metrics["local_contrast"])
    z_n = stats.zscore("noise_proxy", metrics["noise_proxy"])
    z_s = stats.zscore("sharpness_lap", metrics["sharpness_lap"])

    # Convert to continuous needs:
    # If brightness is below running mean => brighten_need increases
    brighten_need = _sigmoid(-z_b)           # low brightness => high need
    contrast_need = _sigmoid(-z_c) * 0.7 + _sigmoid(-z_lc) * 0.3
    denoise_need = _sigmoid(z_n)             # high noise => high need
    sharpen_need = _sigmoid(-z_s)            # low sharpness => high need

    # Base parameters from needs (continuous, no if/else thresholds)
    gamma = 1.0 + 0.55 * brighten_need - 0.25 * _sigmoid(z_b)  # dark -> gamma < 1 (brighten)
    gamma = float(np.clip(gamma, 0.65, 1.55))

    clahe_clip = 1.2 + 2.0 * contrast_need   # 1.2..3.2
    clahe_clip = float(np.clip(clahe_clip, 1.0, 3.5))

    wb_strength = 0.15 + 0.55 * contrast_need  # 0.15..0.70
    wb_strength = _clip01(wb_strength)

    # Denoise: bilateral parameters
    bil_d = 7
    sigma_color = 35 + 55 * denoise_need      # 35..90
    sigma_space = 35 + 55 * denoise_need      # 35..90

    # Sharpen: unsharp amount
    sharpen_amount = 0.25 + 1.0 * sharpen_need  # 0.25..1.25
    sharpen_amount = float(np.clip(sharpen_amount, 0.0, 1.0))

    # Pattern-aware modulation:
    # Patterned fabrics: preserve edges, avoid heavy denoise, avoid too much CLAHE
    # Non-patterned: can denoise slightly more and apply CLAHE a bit more
    if patterned_label == "patterned":
        denoise_scale = 0.65
        clahe_scale = 0.85
        sharpen_scale = 1.05
    else:
        denoise_scale = 1.0
        clahe_scale = 1.0
        sharpen_scale = 0.95

    # Subtype tuning
    # - stripe/check: edges matter a lot => edge-preserving + moderate sharpen, mild denoise
    # - floral: preserve fine texture but can benefit from local contrast
    # - geometric/abstract: keep edges clean; avoid oversharpening halos
    subtype = (pattern_type or "none").lower()

    strategy = "non_patterned_pipeline"
    if patterned_label == "patterned":
        if subtype in ("stripe", "check"):
            strategy = "structured_pattern_pipeline"
            denoise_scale *= 0.55
            clahe_scale *= 0.85
            sharpen_scale *= 1.15
        elif subtype in ("floral",):
            strategy = "texture_pattern_pipeline"
            denoise_scale *= 0.70
            clahe_scale *= 1.05
            sharpen_scale *= 1.00
        elif subtype in ("geometric", "abstract", "geometric/abstract"):
            strategy = "edge_pattern_pipeline"
            denoise_scale *= 0.60
            clahe_scale *= 0.90
            sharpen_scale *= 1.05
        else:
            strategy = "generic_pattern_pipeline"
            denoise_scale *= 0.65
            clahe_scale *= 0.90
            sharpen_scale *= 1.05

    # Apply scaling
    sigma_color *= denoise_scale
    sigma_space *= denoise_scale
    clahe_clip *= clahe_scale
    sharpen_amount *= sharpen_scale

    params = {
        "needs": {
            "brighten_need": brighten_need,
            "contrast_need": contrast_need,
            "denoise_need": denoise_need,
            "sharpen_need": sharpen_need,
        },
        "params": {
            "gamma": gamma,
            "clahe_clip": clahe_clip,
            "wb_strength": wb_strength,
            "bilateral": {"d": bil_d, "sigma_color": sigma_color, "sigma_space": sigma_space},
            "unsharp_amount": sharpen_amount,
        },
        "pattern_context": {
            "patterned_label": patterned_label,
            "pattern_type": subtype,
        },
        "z_scores": {
            "brightness": z_b,
            "contrast": z_c,
            "local_contrast": z_lc,
            "noise_proxy": z_n,
            "sharpness_lap": z_s,
        }
    }
    return strategy, params


def apply_enhancement(
    bgr: np.ndarray,
    strategy: str,
    params: Dict[str, Any]
) -> np.ndarray:
    """
    Execute the selected enhancement pipeline.
    """
    p = params["params"]
    needs = params["needs"]

    out = bgr.copy()

    # Mild white balance first (helps downstream CLAHE)
    out = _auto_white_balance_grayworld(out, strength=p["wb_strength"])

    # Gamma correction (continuous)
    out = _apply_gamma(out, gamma=p["gamma"])

    # Pattern-aware branch
    if strategy in ("structured_pattern_pipeline", "edge_pattern_pipeline", "generic_pattern_pipeline", "texture_pattern_pipeline"):
        # Use edge-preserving filtering to avoid destroying patterns
        # Strength scales with denoise_need (continuous)
        sigma_s = 40 + 80 * needs["denoise_need"]      # 40..120
        sigma_r = 0.18 + 0.25 * needs["denoise_need"]  # 0.18..0.43
        out = _edge_preserve(out, sigma_s=sigma_s, sigma_r=sigma_r)

        # CLAHE but less aggressive for structured patterns
        out = _apply_clahe(out, clip_limit=p["clahe_clip"], tile_grid=8)

        # Controlled sharpening
        out = _unsharp_mask(out, amount=p["unsharp_amount"], radius=2)

    else:
        # Non-patterned pipeline: can denoise a bit more smoothly
        bil = p["bilateral"]
        out = _bilateral(out, d=bil["d"], sigma_color=bil["sigma_color"], sigma_space=bil["sigma_space"])
        out = _apply_clahe(out, clip_limit=p["clahe_clip"], tile_grid=8)
        out = _unsharp_mask(out, amount=p["unsharp_amount"], radius=2)

    return out


# =========================================================
# Public API for FastAPI route
# =========================================================

def enhance_with_metadata(
    image_bytes: bytes,
    patterned_label: str,
    pattern_type: str = "none",
    stats: Optional[RunningStats] = None,
    jpeg_quality: int = 92,
    update_stats: bool = True
) -> Dict[str, Any]:
    """
    End-to-end:
    - decode
    - compute metrics (before)
    - select strategy (adaptive)
    - enhance
    - compute metrics (after)
    - return bytes + metadata

    Note: stats is optional. If you pass a shared RunningStats instance,
          the system becomes adaptive over time (recommended).
    """
    bgr = bytes_to_bgr(image_bytes)

    metrics_before = compute_quality_metrics(bgr)

    # Initialize/update running stats for adaptive behavior
    if stats is None:
        stats = RunningStats()
        stats.update(metrics_before)
    else:
        if update_stats:
            stats.update(metrics_before)

    strategy, decision = select_strategy(patterned_label, pattern_type, metrics_before, stats=stats)

    enhanced = apply_enhancement(bgr, strategy=strategy, params=decision)

    metrics_after = compute_quality_metrics(enhanced)

    # Delta metrics (for UI & paper tables)
    delta = {k: float(metrics_after.get(k, 0.0) - metrics_before.get(k, 0.0)) for k in metrics_before.keys()}

    enhanced_bytes = bgr_to_jpeg_bytes(enhanced, quality=jpeg_quality)

    return {
        "strategy": strategy,
        "decision": decision,
        "metrics_before": metrics_before,
        "metrics_after": metrics_after,
        "delta": delta,
        "enhanced_image_jpeg_bytes": enhanced_bytes,
        "stats_snapshot": {
            "alpha": stats.alpha,
            "mu": dict(stats.mu),
            "var": dict(stats.var),
            "initialized": stats.initialized,
        }
    }
