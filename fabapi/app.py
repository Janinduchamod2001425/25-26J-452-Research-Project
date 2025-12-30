import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# ===============================
# EXISTING IMPORTS (DO NOT TOUCH)
# ===============================
from fabapi.services.fabricdetection.detector import FabricDefectDetector

# ===============================
# NEW IMPORTS (YOUR COMPONENT)
# ===============================
from fabapi.services.framecapture.motion_api import router as motion_router
from fabapi.services.framecapture.anomaly_api import router as anomaly_router


# ===============================
# ENVIRONMENT SETUP
# ===============================
load_dotenv()

MODEL_PATH = os.getenv("MODEL_PATH", "models/best.pt")
CLASS_MAPPING_PATH = os.getenv("CLASS_MAPPING_PATH", "models/class_mapping.json")
DEFAULT_CONFIDENCE = float(os.getenv("CONFIDENCE", "0.25"))


# ===============================
# MAIN FASTAPI APP (SINGLE APP)
# ===============================
app = FastAPI(
    title="FabricVision Unified Analytics API",
    description="""
    A unified backend for FabricVision research platform.

    Components:
    • Fabric Defect Detection (YOLO-based)
    • Motion Classification (Model 1)
    • Frame Anomaly & Quality Analytics (Model 2)
    """,
    version="2.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


# ===============================
# CORS CONFIG
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===============================
# EXISTING GLOBAL DETECTOR
# ===============================
detector = None


@app.on_event("startup")
async def startup_event():
    """Initialize Fabric Defect Detector on startup."""
    global detector
    try:
        detector = FabricDefectDetector(MODEL_PATH, CLASS_MAPPING_PATH)
        print("🚀 Fabric Defect Detector initialized successfully!")
    except Exception as e:
        print(f"❌ Failed to initialize detector: {e}")
        detector = None


# ===============================
# EXISTING ROOT & HEALTH APIs
# ===============================
@app.get("/", include_in_schema=False)
async def root():
    return JSONResponse(content={
        "message": "FabricVision Unified Analytics API",
        "status": "running",
        "version": "2.1.0",
        "docs": "/docs",
        "modules": {
            "fabric_defect_detection": "/detect",
            "motion_classification": "/motion/predict",
            "frame_anomaly_analysis": "/frame/analyze"
        }
    })


@app.get("/health")
async def health_check():
    if detector and detector.is_ready():
        return {
            "status": "healthy",
            "fabric_detector": "ready",
            "motion_model": "ready",
            "anomaly_model": "ready"
        }
    return {
        "status": "unhealthy",
        "message": "One or more services unavailable"
    }


# ===============================
# EXISTING FABRIC DEFECT APIs
# ===============================
@app.get("/defect-types")
async def get_defect_types():
    if not detector:
        raise HTTPException(status_code=503, detail="Detector not available")

    return {
        "defect_types": detector.get_defect_types(),
        "total": len(detector.get_defect_types())
    }


@app.post("/detect")
async def detect_defects(
    file: UploadFile = File(...),
    confidence: float = Query(DEFAULT_CONFIDENCE, ge=0.0, le=1.0)
):
    if not detector or not detector.is_ready():
        raise HTTPException(status_code=503, detail="Detector not available")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    allowed_extensions = {'jpg', 'jpeg', 'png', 'bmp', 'webp'}
    file_ext = file.filename.rsplit('.', 1)[-1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    contents = await file.read()
    result = detector.detect_from_bytes(contents, confidence)

    result["image_info"] = {
        "filename": file.filename,
        "size_bytes": len(contents),
        "content_type": file.content_type
    }

    return result


@app.post("/detect-batch")
async def detect_batch(files: list[UploadFile] = File(...)):
    if not detector or not detector.is_ready():
        raise HTTPException(status_code=503, detail="Detector not available")

    results = []
    for file in files:
        try:
            contents = await file.read()
            result = detector.detect_from_bytes(contents)
            result["filename"] = file.filename
            results.append(result)
        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })

    return {
        "total_files": len(files),
        "successful": sum(1 for r in results if r.get("success", False)),
        "failed": sum(1 for r in results if not r.get("success", True)),
        "results": results
    }


# ===============================
# 🔗 YOUR COMPONENT INTEGRATION
# ===============================
app.include_router(motion_router)
app.include_router(anomaly_router)


# ===============================
# ERROR HANDLER (EXISTING)
# ===============================
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )


# ===============================
# MAIN RUN
# ===============================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
