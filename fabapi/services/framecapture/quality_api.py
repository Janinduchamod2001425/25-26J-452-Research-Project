from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/quality",
    tags=["Component 1 Novelty 3 – Quality Intelligence"]
)

# -------------------------
# Input Schema
# -------------------------
class MotionInput(BaseModel):
    prediction: str
    confidence: float

class FrameAnalysisInput(BaseModel):
    frame_type: str
    fis: float
    threshold: float

class QualityRequest(BaseModel):
    motion: MotionInput
    frame_analysis: FrameAnalysisInput

# -------------------------
# API Endpoint
# -------------------------
@router.post("/assess")
def assess_quality(data: QualityRequest):
    reasons: List[str] = []
    risk = "low"
    action = "continue"
    quality = "good"

    # Rule 1: Irregular frame
    if data.frame_analysis.frame_type == "irregular":
        risk = "high"
        quality = "poor"
        reasons.append("High frame irregularity detected")

    # Rule 2: Motion during anomaly
    if (
        data.motion.prediction == "active"
        and data.motion.confidence > 0.7
        and data.frame_analysis.frame_type == "irregular"
    ):
        risk = "critical"
        action = "alert_operator"
        reasons.append("Motion detected during fabric irregularity")

    return {
        "success": True,
        "quality_assessment": {
            "frame_quality": quality,
            "risk_level": risk,
            "action": action,
            "confidence_reason": reasons
        },
        "meta": {
            "novelty": "Novelty 3 – Quality Intelligence",
            "type": "rule_based_analytics"
        }
    }
