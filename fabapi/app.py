import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from services.fabricdetection.detector import FabricDefectDetector

# Load environment variables
load_dotenv()

# Configuration
MODEL_PATH = os.getenv("MODEL_PATH", "models/best.pt")
CLASS_MAPPING_PATH = os.getenv("CLASS_MAPPING_PATH", "models/class_mapping.json")
DEFAULT_CONFIDENCE = float(os.getenv("CONFIDENCE", "0.25"))

# Initialize FastAPI app
app = FastAPI(
    title="Fabric Defect Detection API",
    description="Upload fabric images and detect defects in real-time",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global detector instance
detector = None

@app.on_event("startup")
async def startup_event():
    """Initialize detector on startup."""
    global detector
    try:
        detector = FabricDefectDetector(MODEL_PATH, CLASS_MAPPING_PATH)
        print("🚀 Fabric Defect Detector initialized successfully!")
    except Exception as e:
        print(f"❌ Failed to initialize detector: {e}")
        detector = None

# API Endpoints
@app.get("/", include_in_schema=False)
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

@app.get("/health")
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

@app.get("/defect-types")
async def get_defect_types():
    """Get all available defect types."""
    if not detector:
        raise HTTPException(status_code=503, detail="Detector not available")
    
    return {
        "defect_types": detector.get_defect_types(),
        "total": len(detector.get_defect_types())
    }

@app.post("/detect")
async def detect_defects(
    file: UploadFile = File(..., description="Image file (jpg, jpeg, png, bmp)"),
    confidence: float = Query(
        DEFAULT_CONFIDENCE, 
        ge=0.0, 
        le=1.0,
        description="Confidence threshold (0.0 to 1.0)"
    )
):
    """
    Detect fabric defects in uploaded image.
    
    **Example using curl:**
    ```bash
    curl -X POST "http://localhost:8000/detect?confidence=0.3" \
         -F "file=@image.jpg"
    ```
    
    **Postman Instructions:**
    1. Method: POST
    2. URL: http://localhost:8000/detect?confidence=0.3
    3. Body: form-data
       - Key: file
       - Value: Select image file
    """
    if not detector or not detector.is_ready():
        raise HTTPException(status_code=503, detail="Detector not available")
    
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file extension
    allowed_extensions = {'jpg', 'jpeg', 'png', 'bmp', 'webp'}
    file_ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Read file
        contents = await file.read()
        
        # Run detection
        result = detector.detect_from_bytes(contents, confidence)
        
        # Add file info to result
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

@app.post("/detect-batch")
async def detect_batch(
    files: list[UploadFile] = File(..., description="Multiple image files")
):
    """
    Detect defects in multiple images (batch processing).
    
    **Note:** This is a basic implementation. For production,
    consider using background tasks or a queue system.
    """
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

# Error handlers
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )