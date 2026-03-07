import os
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from pathlib import Path
import socketio
import uvicorn
import json
from typing import Optional
from pathlib import Path


# ===============================
# Component 1 services
# ===============================
from fabapi.services.framecapture.motion_api import router as motion_router
from fabapi.services.framecapture.anomaly_api import router as anomaly_router
from fabapi.services.framecapture.quality_api import router as quality_router

# ===============================
# Component 2 services
# ===============================
from fabapi.services.fogcomputing.router import router as fog_router
# ===============================
# Component 3 services
# ===============================
from fabapi.services.fabricdetection.routes import defect_router, init_detector
from fabapi.services.fabricdetection.realtime import realtime_router, realtime_manager
from fabapi.services.encoder.routes import encoder_router
from fabapi.services.encoder.encoder_logic import encoder_system
# Component 4 services
# ===============================

from fabapi.services.futurepredict.router import router as modelA_router
from fabapi.services.modelb.router import router as modelB_router

# ===============================
# ENVIRONMENT SETUP
# ===============================
load_dotenv()
# Create Socket.IO server with CORS enabled
sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    async_mode='asgi',
    ping_timeout=30,
    ping_interval=25,
    engineio_logger=True
)

# ===============================
# MAIN FASTAPI APP (SINGLE APP)
# ===============================
app = FastAPI(
    title="FabricVision Unified Analytics API",
    description="""
    A unified backend for FabricVision research platform.
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
# Frame Capture Routers (Janindu)
# ===============================
app.include_router(motion_router)
app.include_router(anomaly_router)
app.include_router(quality_router)

# ===============================
# Fog Computing router
# ===============================
app.include_router(fog_router)

# ===============================
# Defect Detection router
# ===============================
app.include_router(defect_router)
app.include_router(realtime_router)
app.include_router(encoder_router) 

# ===============================
# defects prediction Routers (Duvidu)
# ===============================

app.include_router(modelA_router)
app.include_router(modelB_router)

# ===============================
# Socket.IO ASGI app
# ===============================
# Wrap FastAPI with Socket.IO
socket_app = socketio.ASGIApp(
    socketio_server=sio,
    other_asgi_app=app,
    socketio_path="socket.io"
)

# Set Socket.IO instance in encoder
encoder_system.set_socket(sio)


# ==========================================================
# ROOT-LEVEL ENDPOINTS 
# ==========================================================
SAVE_DIR = Path(r"E:\fabric_images\input")
SAVE_DIR.mkdir(parents=True, exist_ok=True)

@app.post("/receive-enhanced-frame")
async def receive_enhanced_frame_root(
    file: UploadFile = File(...),
    frame_name: str = Form(...),
    timestamp: str = Form(""),
    pattern: Optional[str] = Form(None),
    pattern_type: Optional[str] = Form(None),
    dominant_color: Optional[str] = Form(None),
    secondary_color: Optional[str] = Form(None),
    quality_score: Optional[str] = Form(None),
    enhancement_mode: Optional[str] = Form(None),
    frames_processed: Optional[str] = Form(None),
    fps: Optional[str] = Form(None)
):
    """
    Receive enhanced frame from component 2 with metadata
    Saves the file and updates state (matches Flask version)
    """
    try:
        # Get filename safely
        safe_name = encoder_system.get_safe_filename(frame_name)
        
        # SAVE THE FILE (FIX: Added this line)
        save_path = SAVE_DIR / safe_name
        contents = await file.read()
        with open(save_path, "wb") as f:
            f.write(contents)
        
        # Update fabric state with received metadata
        fabric_data = {
            "pattern": pattern,
            "pattern_type": pattern_type,
            "dominant_color": dominant_color,
            "secondary_color": secondary_color,
            "quality_score": quality_score,
            "enhancement_mode": enhancement_mode,
            "frames_processed": int(frames_processed) if frames_processed else 0,
            "fps": float(fps) if fps else 0,
            "last_filename": safe_name,
            "timestamp": timestamp,
            "saved_filename": str(save_path)  # Add saved path
        }
        
        encoder_system.update_fabric_state(fabric_data)
        
        # Debug log
        print("\n===== FRAME RECEIVED =====")
        print("Saved:", save_path)
        print("Filename:", safe_name)
        print("Pattern:", pattern)
        print("Pattern Type:", pattern_type)
        print("Dominant Color:", dominant_color)
        print("Secondary Color:", secondary_color)
        print("Quality Score:", quality_score)
        print("Enhancement Mode:", enhancement_mode)
        print("Frames Processed:", frames_processed)
        print("FPS:", fps)
        
        return JSONResponse(content={
            "status": "success",
            "filename": safe_name,
            "saved_path": str(save_path)
        }, status_code=200)
        
    except Exception as e:
        print("Receiver error:", e)
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/fabric-state")
async def http_fabric_state():
    """Get latest fabric detection state via HTTP"""
    try:
        return JSONResponse(content=encoder_system.get_fabric_state())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/motor/stop")
async def http_motor_stop_post():
    """Stop the motor via HTTP POST"""
    try:
        print(f" Motor STOP requested via POST")
        success = encoder_system.stop_motor()
        return JSONResponse(content={
            "success": success,
            "message": "Motor Stopped"
        })
    except Exception as e:
        print(f" Error in motor stop POST: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/motor/stop")
async def http_motor_stop_get():
    """Stop the motor via HTTP GET (for browser compatibility)"""
    try:
        print(f" Motor STOP requested via GET")
        success = encoder_system.stop_motor()
        return JSONResponse(content={
            "success": success,
            "message": "Motor Stopped"
        })
    except Exception as e:
        print(f" Error in motor stop GET: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/motor/start")
async def http_motor_start_post():
    """Start the motor via HTTP POST"""
    try:
        print(f" Motor START requested via POST")
        success = encoder_system.start_motor()
        return JSONResponse(content={
            "success": success,
            "message": "Motor Started"
        })
    except Exception as e:
        print(f" Error in motor start POST: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/motor/start")
async def http_motor_start_get():
    """Start the motor via HTTP GET (for browser compatibility)"""
    try:
        print(f"Motor START requested via GET")
        success = encoder_system.start_motor()
        return JSONResponse(content={
            "success": success,
            "message": "Motor Started"
        })
    except Exception as e:
        print(f"Error in motor start GET: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/pulse-count")
async def http_pulse_count():
    """Simple endpoint that returns just the current pulse count"""
    try:
        return str(encoder_system.data["pulses"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Startup event
@app.on_event("startup")
async def startup_event():
    init_detector()
    await realtime_manager.initialize(sio)
    print(" Socket.IO server ready at http://localhost:8000/socket.io")
    print(" FastAPI server ready at http://localhost:8000")
    print(" Encoder system ready at http://localhost:8000/encoder")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    await realtime_manager.shutdown()
    encoder_system.shutdown()
    print(" Server shutdown complete")

# Socket.IO event handlers
@sio.event
async def connect(sid, environ, auth=None):
    """Handle client connection"""
    print(f" Client connected: {sid}")
    await realtime_manager.on_connect(sid)
    
    # Send initial status
    await sio.emit('status', {
        'is_running': realtime_manager.is_running,
        'is_paused': realtime_manager.is_paused,
        'current_file': realtime_manager.current_file,
        'pending_count': len(realtime_manager.pending_files),
        'processed_count': len(realtime_manager.processed_files),
        'connected_clients': len(realtime_manager.connected_clients),
        'timestamp': datetime.now().isoformat()
    }, room=sid)
    
    # Send welcome message
    await sio.emit('welcome', {
        'message': 'Connected to fabric defect detection server with encoder',
        'client_id': sid,
        'timestamp': datetime.now().isoformat()
    }, room=sid)
    
    # Send initial encoder data
    await sio.emit('encoder_update', encoder_system.get_status(), room=sid)

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    print(f" Client disconnected: {sid}")
    await realtime_manager.on_disconnect(sid)

@sio.event
async def ping(sid, data=None):
    """Handle ping from client"""
    await sio.emit('pong', {
        'timestamp': datetime.now().isoformat(),
        'sid': sid
    }, room=sid)

# ============ ENCODER SOCKET.IO HANDLERS ============
@sio.event
async def get_encoder_status(sid, data=None):
    """Client requested encoder status"""
    try:
        status = encoder_system.get_status()
        await sio.emit('encoder_update', status, room=sid)
        print(f" Sent encoder status to {sid}")
    except Exception as e:
        print(f" Error in get_encoder_status: {e}")

@sio.event
async def get_encoder_history(sid, data=None):
    """Client requested encoder history"""
    try:
        limit = data.get('limit', 100) if data else 100
        history = encoder_system.get_history(limit)
        await sio.emit('encoder_history', {
            'success': True,
            'history': history
        }, room=sid)
        print(f" Sent encoder history ({len(history)} points) to {sid}")
    except Exception as e:
        print(f" Error in get_encoder_history: {e}")
        await sio.emit('encoder_history', {
            'success': False,
            'error': str(e)
        }, room=sid)

@sio.event
async def reset_encoder(sid, data=None):
    """Client requested encoder reset"""
    try:
        encoder_system.reset_counter()
        await sio.emit('encoder_update', encoder_system.get_status(), room=sid)
        await sio.emit('encoder_reset_response', {
            'success': True,
            'message': 'Encoder reset successful'
        }, room=sid)
        print(f" Encoder reset by {sid}")
    except Exception as e:
        print(f" Error resetting encoder: {e}")
        await sio.emit('encoder_reset_response', {
            'success': False,
            'error': str(e)
        }, room=sid)
        
@sio.event
async def get_fabric_state(sid, data=None):
    """Client requested fabric detection state"""
    try:
        fabric_state = encoder_system.get_fabric_state()
        await sio.emit('fabric_state_update', fabric_state, room=sid)
        print(f" Sent fabric state to {sid}")
    except Exception as e:
        print(f" Error in get_fabric_state: {e}")

# ============ MOTOR CONTROL HANDLERS ============
@sio.event
async def motor_start(sid, data=None):
    """Start the motor"""
    try:
        print(f" Client {sid} requested motor start")
        success = encoder_system.start_motor()
        await sio.emit('motor_response', {
            'success': success,
            'action': 'start',
            'message': 'Motor started' if success else 'Failed to start motor',
            'timestamp': datetime.now().isoformat()
        }, room=sid)
    except Exception as e:
        print(f" Error in motor_start: {e}")

@sio.event
async def motor_stop(sid, data=None):
    """Stop the motor"""
    try:
        print(f" Client {sid} requested motor stop")
        success = encoder_system.stop_motor()
        await sio.emit('motor_response', {
            'success': success,
            'action': 'stop',
            'message': 'Motor stopped' if success else 'Failed to stop motor',
            'timestamp': datetime.now().isoformat()
        }, room=sid)
    except Exception as e:
        print(f" Error in motor_stop: {e}")
        
# ============ SCANNER CONTROL HANDLERS ============
@sio.event
async def start_scan(sid, data=None):
    """Client requested to start scanning"""
    print(f" Client {sid} requested to start scanning")
    result = await realtime_manager.start_scanning()
    await sio.emit('scan_response', result, room=sid)

@sio.event
async def pause_scan(sid, data=None):
    """Client requested to pause scanning"""
    print(f" Client {sid} requested to pause scanning")
    result = await realtime_manager.pause_scanning()
    await sio.emit('scan_response', result, room=sid)

@sio.event
async def resume_scan(sid, data=None):
    """Client requested to resume scanning"""
    print(f" Client {sid} requested to resume scanning")
    result = await realtime_manager.resume_scanning()
    await sio.emit('scan_response', result, room=sid)

@sio.event
async def stop_scan(sid, data=None):
    """Client requested to stop scanning"""
    print(f" Client {sid} requested to stop scanning")
    result = await realtime_manager.stop_scanning()
    await sio.emit('scan_response', result, room=sid)

@sio.event
async def get_status(sid, data=None):
    """Client requested current status"""
    try:
        pending_files_info = [{"filename": f["filename"], "position_cm": f.get("position_cm", 0)} for f in realtime_manager.pending_files[:10]]
        await sio.emit('status', {
            'is_running': realtime_manager.is_running,
            'is_paused': realtime_manager.is_paused,
            'current_file': realtime_manager.current_file,
            'pending_count': len(realtime_manager.pending_files),
            'pending_files': pending_files_info,
            'processed_count': len(realtime_manager.processed_files),
            'connected_clients': len(realtime_manager.connected_clients),
            'timestamp': datetime.now().isoformat()
        }, room=sid)
    except Exception as e:
        print(f" Error in get_status: {e}")

@sio.event
async def get_stats(sid, data=None):
    """Client requested statistics"""
    try:
        if realtime_manager.stats_db:
            stats = await realtime_manager.stats_db.get_current_stats()
            
            if stats and 'last_updated' in stats and isinstance(stats['last_updated'], datetime):
                stats['last_updated'] = stats['last_updated'].isoformat()
            
            await sio.emit('stats_response', {
                'success': True,
                'stats': stats
            }, room=sid)
        else:
            await sio.emit('stats_response', {
                'success': False,
                'error': 'Statistics DB not connected'
            }, room=sid)
    except Exception as e:
        print(f" Error in get_stats: {e}")
        await sio.emit('stats_response', {
            'success': False,
            'error': str(e)
        }, room=sid)

@sio.event
async def get_history(sid, data=None):
    """Client requested detection history (only defect frames)"""
    try:
        if realtime_manager.mongodb:
            limit = data.get('limit', 20) if data else 20
            skip = data.get('skip', 0) if data else 0
            history = await realtime_manager.mongodb.get_detections(limit, skip)
            total = await realtime_manager.mongodb.get_count()
            
            for item in history:
                if 'timestamp' in item and isinstance(item['timestamp'], datetime):
                    item['timestamp'] = item['timestamp'].isoformat()
                if 'processed_at' in item and isinstance(item['processed_at'], datetime):
                    item['processed_at'] = item['processed_at'].isoformat()
            
            await sio.emit('history_response', {
                'success': True,
                'history': history,
                'total': total,
                'limit': limit,
                'skip': skip
            }, room=sid)
        else:
            await sio.emit('history_response', {
                'success': False,
                'error': 'MongoDB not connected'
            }, room=sid)
    except Exception as e:
        print(f"Error in get_history: {e}")
        await sio.emit('history_response', {
            'success': False,
            'error': str(e)
        }, room=sid)
        
# Regular HTTP endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    encoder_status = encoder_system.get_status()
    return {
        "status": "healthy",
        "socketio": "connected",
        "clients": len(realtime_manager.connected_clients),
        "encoder_connected": encoder_status.get("serial_connected", False),
        "encoder_status": encoder_status.get("status", "Unknown"),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/history")
async def api_history(limit: int = 20, skip: int = 0):
    """Get detection history via HTTP (only defect frames)"""
    try:
        if not realtime_manager.mongodb:
            raise HTTPException(status_code=503, detail="MongoDB not connected")
        history = await realtime_manager.mongodb.get_detections(limit, skip)
        total = await realtime_manager.mongodb.get_count()
        
        for item in history:
            if 'timestamp' in item and isinstance(item['timestamp'], datetime):
                item['timestamp'] = item['timestamp'].isoformat()
            if 'processed_at' in item and isinstance(item['processed_at'], datetime):
                item['processed_at'] = item['processed_at'].isoformat()
        
        return {
            "success": True,
            "history": history,
            "total": total,
            "limit": limit,
            "skip": skip
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
async def api_stats():
    """Get statistics via HTTP"""
    try:
        if not realtime_manager.stats_db:
            raise HTTPException(status_code=503, detail="Statistics DB not connected")
        stats = await realtime_manager.stats_db.get_current_stats()
        
        if stats and 'last_updated' in stats and isinstance(stats['last_updated'], datetime):
            stats['last_updated'] = stats['last_updated'].isoformat()
        
        return {
            "success": True,
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/socket-test")
async def socket_test():
    """Test Socket.IO connection"""
    return {
        "message": "Socket.IO is running",
        "connect_url": "http://localhost:8000/socket.io",
        "clients": len(realtime_manager.connected_clients),
        "status": "active"
    }

# ===============================
# ERROR HANDLER 
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
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": str(exc),
            "status_code": 500
        }
    )

# ===============================
# MAIN RUN
# ===============================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        socket_app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
