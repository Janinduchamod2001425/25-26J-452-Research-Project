# services/encoder/routes.py

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime
from fabapi.services.encoder.encoder_logic import encoder_system, init_encoder

# Create router
encoder_router = APIRouter(prefix="/encoder", tags=["encoder"])

# Initialize encoder on module load
init_encoder()

@encoder_router.get("/")
async def root():
    """Encoder API root endpoint"""
    return JSONResponse(content={
        "message": "Fabric Measurement Encoder API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "GET /encoder/status": "Get full encoder status",
            "GET /encoder/length": "Get current length in cm and inches",
            "GET /encoder/pulses": "Get pulse data for chart",
            "GET /encoder/history": "Get historical pulse data"
        }
    })

@encoder_router.get("/status")
async def get_status():
    """Get full encoder status including all measurements"""
    try:
        status = encoder_system.get_status()
        return JSONResponse(content=status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting encoder status: {str(e)}")

@encoder_router.get("/length")
async def get_length():
    """Get current length in cm and inches"""
    try:
        length_data = encoder_system.get_length()
        return JSONResponse(content=length_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting length: {str(e)}")

@encoder_router.get("/pulses")
async def get_pulses():
    """Get current pulse data for chart"""
    try:
        pulse_data = encoder_system.get_pulse_data()
        return JSONResponse(content=pulse_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting pulse data: {str(e)}")

@encoder_router.get("/history")
async def get_history(limit: int = 100):
    """Get historical pulse data for chart"""
    try:
        history = encoder_system.get_history(limit)
        return JSONResponse(content={
            "success": True,
            "history": history,
            "count": len(history)
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting history: {str(e)}")

@encoder_router.post("/reset")
async def reset_counter():
    """Reset the encoder counter to zero"""
    try:
        encoder_system.reset_counter()
        return JSONResponse(content={
            "success": True,
            "message": "Encoder counter reset to zero",
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting counter: {str(e)}")

@encoder_router.post("/calibrate")
async def calibrate(wheel_diameter: float = None, ppr: int = None):
    """Calibrate encoder settings"""
    try:
        result = encoder_system.calibrate(wheel_diameter, ppr)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calibrating: {str(e)}")