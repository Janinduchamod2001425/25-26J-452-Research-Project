import os
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from pathlib import Path
import socketio
import uvicorn
import json


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
        await sio.emit('status', {
            'is_running': realtime_manager.is_running,
            'is_paused': realtime_manager.is_paused,
            'current_file': realtime_manager.current_file,
            'pending_count': len(realtime_manager.pending_files),
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
            
            # Convert datetime objects to strings
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
    """Client requested detection history"""
    try:
        if realtime_manager.mongodb:
            limit = data.get('limit', 20) if data else 20
            skip = data.get('skip', 0) if data else 0
            history = await realtime_manager.mongodb.get_detections(limit, skip)
            total = await realtime_manager.mongodb.get_count()
            
            # Convert datetime objects to strings in history
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
        print(f" Error in get_history: {e}")
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
    """Get detection history via HTTP"""
    try:
        if not realtime_manager.mongodb:
            raise HTTPException(status_code=503, detail="MongoDB not connected")
        history = await realtime_manager.mongodb.get_detections(limit, skip)
        total = await realtime_manager.mongodb.get_count()
        
        # Convert datetime objects to strings
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
        
        # Convert datetime objects to strings
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
        socket_app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
