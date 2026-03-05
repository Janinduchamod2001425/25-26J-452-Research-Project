# routes.py (updated with stats router)

import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from fabapi.services.fabricdetection.detector import FabricDefectDetector
from fabapi.services.fabricdetection.realtime import realtime_manager

# Load environment variables
load_dotenv()

# Configuration
MODEL_PATH = os.getenv("MODEL_PATH", "models/best.pt")
CLASS_MAPPING_PATH = os.getenv("CLASS_MAPPING_PATH", "models/class_mapping.json")
DEFAULT_CONFIDENCE = float(os.getenv("CONFIDENCE", "0.25"))

# Initialize Router
defect_router = APIRouter()

# Global detector instance
detector = None

def init_detector():
    """Initialize detector instance."""
    global detector
    try:
        detector = FabricDefectDetector(MODEL_PATH, CLASS_MAPPING_PATH)
        print("🚀 Fabric Defect Detector initialized successfully!")
    except Exception as e:
        print(f"❌ Failed to initialize detector: {e}")
        detector = None

# API Endpoints
@defect_router.get("/", include_in_schema=False)
async def root():
    """Root endpoint with API information."""
    return JSONResponse(content={
        "message": "Fabric Defect Detection API",
        "status": "running",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": {
            "GET /health": "Check API health status",
            "GET /defect-types": "Get all defect types",
            "POST /detect": "Upload image for defect detection"
        }
    })

@defect_router.get("/health")
async def health_check():
    """Health check endpoint."""
    if detector and detector.is_ready():
        return {
            "status": "healthy",
            "model_loaded": True,
            "detector_ready": True
        }
    else:
        return {
            "status": "unhealthy",
            "model_loaded": False,
            "detector_ready": False,
            "message": "Detector not initialized"
        }

@defect_router.get("/defect-types")
async def get_defect_types():
    """Get all available defect types."""
    if not detector:
        raise HTTPException(status_code=503, detail="Detector not available")
    
    return {
        "defect_types": detector.get_defect_types(),
        "total": len(detector.get_defect_types())
    }

@defect_router.post("/detect")
async def detect_defects(
    file: UploadFile = File(..., description="Image file (jpg, jpeg, png, bmp)"),
    confidence: float = Query(
        DEFAULT_CONFIDENCE, 
        ge=0.0, 
        le=1.0,
        description="Confidence threshold (0.0 to 1.0)"
    )
):
    """Detect fabric defects in uploaded image."""
    if not detector or not detector.is_ready():
        raise HTTPException(status_code=503, detail="Detector not available")
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    allowed_extensions = {'jpg', 'jpeg', 'png', 'bmp', 'webp'}
    file_ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    try:
        contents = await file.read()
        result = detector.detect_from_bytes(contents, confidence)
        result["image_info"] = {
            "filename": file.filename,
            "size_bytes": len(contents),
            "content_type": file.content_type
        }
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

@defect_router.post("/detect-batch")
async def detect_batch(
    files: list[UploadFile] = File(..., description="Multiple image files")
):
    """Detect defects in multiple images (batch processing)."""
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

# Statistics Router
stats_router = APIRouter(prefix="/stats", tags=["statistics"])

@stats_router.get("/current")
async def get_current_stats():
    """Get current aggregated statistics"""
    try:
        if not realtime_manager.stats_db:
            raise HTTPException(status_code=503, detail="Statistics DB not connected")
        
        stats = await realtime_manager.stats_db.get_current_stats()
        return stats
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@stats_router.get("/trends")
async def get_trends(days: int = 7):
    """Get defect trends over time"""
    try:
        if not realtime_manager.stats_db:
            raise HTTPException(status_code=503, detail="Statistics DB not connected")
        
        trends = await realtime_manager.stats_db.get_defect_trends(days)
        return trends
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))