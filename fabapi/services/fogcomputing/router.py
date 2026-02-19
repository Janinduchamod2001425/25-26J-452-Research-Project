# new version
import base64
import time
from fastapi import APIRouter, File, UploadFile, HTTPException
from fabapi.services.fogcomputing.model_service import predict_patterned, predict_pattern_type
from fabapi.services.fogcomputing.enhancer import enhance_with_metadata, RunningStats
# from fabapi.services.fogcomputing.frame_sender import send_enhanced_frame # send enhanced frames (for later use)
from fabapi.services.fogcomputing.state import LATEST_STATUS, APP_START_TIME, update_status
from fabapi.services.fogcomputing.status_utils import quality_score_0_100, build_alerts

QUALITY_STATS = RunningStats(alpha=0.12)

router = APIRouter(prefix="/fog", tags=["Fog Computing"])

@router.post("/classify/patterned")
async def classify_patterned(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    image_bytes = await file.read()
    result = predict_patterned(image_bytes)
    return result


@router.post("/classify/pattern-type")
async def classify_pattern_type(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    image_bytes = await file.read()
    result = predict_pattern_type(image_bytes)
    return result


@router.post("/classify/full")
async def classify_full(file: UploadFile = File(...)):
    """
    One call gives you:
    - patterned/non_patterned
    - pattern type (only if patterned)
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    image_bytes = await file.read()

    p = predict_patterned(image_bytes)
    out = {"patterned_result": p}

    if p["label"] == "patterned":
        out["pattern_type_result"] = predict_pattern_type(image_bytes)
    else:
        out["pattern_type_result"] = {"label": "none", "confidence": 1.0, "top3": []}

    return out

# @router.post("/enhance")
# async def enhance_fabric_frame(file: UploadFile = File(...)):
#     """
#     Full fog-level enhancement pipeline:
#     - pattern vs non-patterned
#     - pattern type (if patterned)
#     - advanced quality analysis
#     - adaptive enhancement
#     """
#     if not file.content_type or not file.content_type.startswith("image/"):
#         raise HTTPException(status_code=400, detail="Please upload an image file")

#     image_bytes = await file.read()

#     # --------------------------------------------------
#     # 1) Pattern vs Non-patterned
#     # --------------------------------------------------
#     patterned_result = predict_patterned(image_bytes)

#     patterned_label = patterned_result["label"]

#     # --------------------------------------------------
#     # 2) Pattern Type (only if patterned)
#     # --------------------------------------------------
#     if patterned_label == "patterned":
#         pattern_type_result = predict_pattern_type(image_bytes)
#         pattern_type_label = pattern_type_result["label"]
#     else:
#         pattern_type_result = {
#             "label": "none",
#             "confidence": 1.0,
#             "top3": []
#         }
#         pattern_type_label = "none"

#     # --------------------------------------------------
#     # 3) Enhancement + Advanced Quality Metrics
#     # --------------------------------------------------
#     enhancement_result = enhance_with_metadata(
#         image_bytes=image_bytes,
#         patterned_label=patterned_label,
#         pattern_type=pattern_type_label,
#         stats=QUALITY_STATS
#     )

#     # --------------------------------------------------
#     # 4) Encode enhanced image for Swagger/UI
#     # --------------------------------------------------
#     enhanced_b64 = base64.b64encode(
#         enhancement_result["enhanced_image_jpeg_bytes"]
#     ).decode("utf-8")

#     # send enhanced images
# #     send_enhanced_frame(
# #     enhancement_result["enhanced_image_jpeg_bytes"]
# # )
#     # --------------------------------------------------
#     # 5) Final API Response
#     # --------------------------------------------------
#     return {
#         "patterned_result": patterned_result,
#         "pattern_type_result": pattern_type_result,
#         "enhancement": {
#             "strategy": enhancement_result["strategy"],
#             "decision": enhancement_result["decision"],
#             "metrics_before": enhancement_result["metrics_before"],
#             "metrics_after": enhancement_result["metrics_after"],
#             "delta": enhancement_result["delta"],
#             "enhanced_image_base64": enhanced_b64
#         }
#     }


@router.post("/enhance")
async def enhance_fabric_frame(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file")

    start = time.time()
    image_bytes = await file.read()

    # 1) Pattern vs Non-patterned
    patterned_result = predict_patterned(image_bytes)
    patterned_label = patterned_result["label"]
    patterned_conf = float(patterned_result["confidence"])

    # 2) Pattern type (if patterned)
    if patterned_label == "patterned":
        pattern_type_result = predict_pattern_type(image_bytes)
        pattern_type_label = pattern_type_result["label"]
        pattern_type_conf = float(pattern_type_result["confidence"])
    else:
        pattern_type_result = {"label": "none", "confidence": 1.0, "top3": []}
        pattern_type_label = "none"
        pattern_type_conf = 1.0

    # 3) Enhance + metrics
    enhancement_result = enhance_with_metadata(
        image_bytes=image_bytes,
        patterned_label=patterned_label,
        pattern_type=pattern_type_label,
        stats=QUALITY_STATS
    )

    # 4) Compute score + alerts
    score = quality_score_0_100(enhancement_result["metrics_after"])
    alerts = build_alerts(patterned_conf, pattern_type_conf, score)

    # 5) Performance stats
    latency_ms = (time.time() - start) * 1000.0
    frames_processed = int(LATEST_STATUS["performance"]["frames_processed"]) + 1
    uptime_sec = time.time() - APP_START_TIME
    fps = frames_processed / max(uptime_sec, 1e-6)

    # 6) Optional preview base64 (keep it small: use JPEG already)
    enhanced_b64 = base64.b64encode(
        enhancement_result["enhanced_image_jpeg_bytes"]
    ).decode("utf-8")

    # 7) Update global status for frontend polling
    update_status({
        "timestamp": time.time(),
        "uptime_sec": uptime_sec,
        "fabric": {
            "patterned_label": patterned_label,
            "patterned_confidence": patterned_conf,
            "pattern_type": pattern_type_label,
            "pattern_type_confidence": pattern_type_conf
        },
        "enhancement": {
            "strategy": enhancement_result["strategy"],
            "quality_score": score,
            "metrics_before": enhancement_result["metrics_before"],
            "metrics_after": enhancement_result["metrics_after"],
            "delta": enhancement_result["delta"]
        },
        "alerts": alerts,
        "performance": {
            "fps": fps,
            "latency_ms": latency_ms,
            "frames_processed": frames_processed
        },
        "preview": {
            "enabled": True,
            "enhanced_image_base64": enhanced_b64
        }
    })

    # Return same enhancement response (optional)
    return {
        "patterned_result": patterned_result,
        "pattern_type_result": pattern_type_result,
        "enhancement": {
            "strategy": enhancement_result["strategy"],
            "quality_score": score,
            "metrics_before": enhancement_result["metrics_before"],
            "metrics_after": enhancement_result["metrics_after"],
            "delta": enhancement_result["delta"],
            "enhanced_image_base64": enhanced_b64
        },
        "alerts": alerts,
        "performance": {
            "fps": fps,
            "latency_ms": latency_ms,
            "frames_processed": frames_processed
        }
    }

# get the status
@router.get("/status")
async def fog_status():
    """
    Frontend polls this endpoint every 1s to get real-time operator data.
    """
    return LATEST_STATUS
