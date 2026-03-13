# realtime.py (updated with motor control)

import os
import asyncio
import time
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Set
from fastapi import APIRouter, HTTPException
import shutil
import json
import base64
from bson import ObjectId
from fabapi.services.fabricdetection.detector import FabricDefectDetector
from fabapi.db.mongodb_client import MongoDBClient, StatsMongoDBClient
from fabapi.db.config import (
    IMAGE_FOLDER, DEFECT_FOLDER, NON_DEFECT_FOLDER,
    PROCESSED_FOLDER, SCAN_INTERVAL, MONGO_URI, MONGO_DB, MONGO_COLLECTION, MONGO_STATS_COLLECTION
)
from fabapi.services.encoder.encoder_logic import encoder_system

# Initialize Router
realtime_router = APIRouter(prefix="/realtime", tags=["realtime"])

def convert_to_serializable(obj):
    """Convert non-serializable objects to serializable format"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, ObjectId):
        return str(obj)
    if hasattr(obj, '__dict__'):
        return str(obj)
    raise TypeError(f"Type {type(obj)} not serializable")

class RealtimeScanner:
    """Real-time folder scanner for defect detection with Socket.IO"""
    
    def __init__(self):
        self.is_running = False
        self.is_paused = False
        self.scan_task: Optional[asyncio.Task] = None
        self.detector: Optional[FabricDefectDetector] = None
        self.mongodb: Optional[MongoDBClient] = None
        self.stats_db: Optional[StatsMongoDBClient] = None
        self.sio = None  # Socket.IO instance
        self.connected_clients: Set[str] = set()
        self.processed_files: Set[str] = set()
        self.current_file: Optional[str] = None
        self.pending_files: List[Dict] = []  # List of {filename, timestamp, pulse, position_cm} in chronological order
        self.stats = {
            "total_scanned": 0,
            "total_defects": 0,
            "start_time": None,
            "last_scan": None
        }
        
    async def initialize(self, sio_instance=None):
        """Initialize detector, MongoDB and Socket.IO"""
        try:
            from .routes import detector as global_detector
            self.detector = global_detector
            
            # Store Socket.IO instance
            self.sio = sio_instance
            
            # Initialize MongoDB for detections
            self.mongodb = MongoDBClient(MONGO_URI, MONGO_DB, MONGO_COLLECTION)
            await self.mongodb.connect()
            
            # Initialize MongoDB for statistics
            self.stats_db = StatsMongoDBClient(MONGO_URI, MONGO_DB, MONGO_STATS_COLLECTION)
            await self.stats_db.connect()
            
            # Create necessary folders
            for folder in [IMAGE_FOLDER, DEFECT_FOLDER, NON_DEFECT_FOLDER, PROCESSED_FOLDER]:
                Path(folder).mkdir(parents=True, exist_ok=True)
                print(f" Ensured folder exists: {folder}")
            
            # Load processed files history
            await self.load_processed_files()
            
            # Initialize statistics document if not exists
            await self.stats_db.initialize_stats()
            
            print(" Realtime scanner initialized with Socket.IO and Statistics DB")
            print(f" Ready to accept connections")
            
        except Exception as e:
            print(f" Failed to initialize scanner: {e}")
            raise
        
    async def load_processed_files(self):
        """Load list of already processed files from MongoDB"""
        try:
            if self.mongodb:
                processed = await self.mongodb.get_all_processed_filenames()
                self.processed_files = set(processed)
                print(f" Loaded {len(self.processed_files)} processed files from history")
        except Exception as e:
            print(f" Could not load processed files: {e}")
            self.processed_files = set()
    
    async def shutdown(self):
        """Clean shutdown"""
        self.is_running = False
        self.is_paused = False
        
        # Cancel scan task
        if self.scan_task:
            self.scan_task.cancel()
            try:
                await self.scan_task
            except:
                pass
        
        # Disconnect MongoDB
        if self.mongodb:
            await self.mongodb.disconnect()
        if self.stats_db:
            await self.stats_db.disconnect()
        
        # Notify clients
        await self.broadcast("server_shutdown", {
            "message": "Server is shutting down",
            "timestamp": datetime.now().isoformat()
        })
        
        print(" Realtime scanner shutdown")
    
    async def on_connect(self, sid: str):
        """Handle client connection - FIXED: Convert data to serializable format"""
        self.connected_clients.add(sid)
        print(f"📡 Client connected. Total clients: {len(self.connected_clients)}")
        
        # Send welcome message with current stats - CONVERT TO SERIALIZABLE
        stats_data = await self.stats_db.get_current_stats() if self.stats_db else {}
        
        # Get recent history
        history = await self.mongodb.get_detections(10, 0) if self.mongodb else []
        
        # Convert all data to serializable format using the converter
        serializable_stats = json.loads(json.dumps(stats_data, default=convert_to_serializable))
        serializable_history = json.loads(json.dumps(history, default=convert_to_serializable))
        
        if self.sio:
            await self.sio.emit("welcome", {
                "message": "Connected to fabric defect detection server",
                "client_id": sid,
                "timestamp": datetime.now().isoformat(),
                "stats": self.stats,
                "aggregated_stats": serializable_stats,
                "recent_history": serializable_history
            }, room=sid)
    
    async def on_disconnect(self, sid: str):
        """Handle client disconnection"""
        self.connected_clients.discard(sid)
        print(f"📡 Client disconnected. Total clients: {len(self.connected_clients)}")
    
    async def broadcast(self, event: str, data: Dict):
        """Broadcast to all connected clients via Socket.IO"""
        if self.sio and self.connected_clients:
            try:
                json_str = json.dumps(data, default=convert_to_serializable)
                serializable_data = json.loads(json_str)
                await self.sio.emit(event, serializable_data)
            except Exception as e:
                print(f" Broadcast error: {e}")
                try:
                    json.dumps(data, default=convert_to_serializable)
                except Exception as inner_e:
                    print(f" JSON serialization error: {inner_e}")
                    import traceback
                    traceback.print_exc()
    
    async def start_scanning(self):
        """Start the real-time scanning process"""
        if self.is_running:
            return {"message": "Scanner already running", "success": False}
        
        self.is_running = True
        self.is_paused = False
        self.stats["start_time"] = datetime.now().isoformat()
        self.scan_task = asyncio.create_task(self._scan_loop())
        
        # Start the motor when scanning starts
        encoder_system.start_motor()
        
        await self.broadcast("status_change", {
            "is_running": True,
            "is_paused": False,
            "message": "Scanner started",
            "timestamp": datetime.now().isoformat(),
            "stats": self.stats
        })
        
        return {"message": "Scanner started successfully", "success": True}
    
    async def pause_scanning(self):
        """Pause the scanning process"""
        if not self.is_running:
            return {"message": "Scanner not running", "success": False}
        
        self.is_paused = True
        
        # Stop the motor when paused
        encoder_system.stop_motor()
        
        await self.broadcast("status_change", {
            "is_running": True,
            "is_paused": True,
            "message": "Scanner paused - waiting for resume",
            "timestamp": datetime.now().isoformat()
        })
        
        return {"message": "Scanner paused", "success": True}
    
    async def resume_scanning(self):
        """Resume the scanning process"""
        if not self.is_running:
            return {"message": "Scanner not running", "success": False}
        
        self.is_paused = False
        print(f" Scanner resumed - Pending files: {len(self.pending_files)}")
        
        # Start the motor when resumed
        encoder_system.start_motor()
        
        await self.broadcast("status_change", {
            "is_running": True,
            "is_paused": False,
            "message": "Scanner resumed",
            "timestamp": datetime.now().isoformat()
        })
        
        return {"message": "Scanner resumed", "success": True}
    
    async def stop_scanning(self):
        """Stop the scanning process"""
        self.is_running = False
        self.is_paused = False
        
        if self.scan_task:
            self.scan_task.cancel()
            try:
                await self.scan_task
            except:
                pass
        
        self.stats["last_scan"] = datetime.now().isoformat()
        
        # Stop the motor when stopped
        encoder_system.stop_motor()
        
        await self.broadcast("status_change", {
            "is_running": False,
            "is_paused": False,
            "message": "Scanner stopped",
            "timestamp": datetime.now().isoformat(),
            "stats": self.stats
        })
        
        return {"message": "Scanner stopped", "success": True}
    
    def parse_filename(self, filename: str) -> Dict:
        """
        Parse filename to extract frame number, pulse count, position in cm, and timestamp
        Format: frame_000011pulse6600pos132.00cm_20260305_101530_123456.jpg
        
        Returns dict with:
        - frame_number: int (e.g., 11)
        - pulse: int (e.g., 6600)
        - position_cm: float (e.g., 132.00)
        - timestamp: datetime
        - microseconds: int (e.g., 123456)
        """
        # Remove file extension
        name_without_ext = Path(filename).stem
        
        # Pattern: frame_000011pulse6600pos132.00cm_20260305_101530_123456
        pattern = r'frame_(\d+)pulse(\d+)pos([\d.]+)cm_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})_(\d+)'
        
        match = re.search(pattern, name_without_ext)
        if match:
            try:
                frame_num = int(match.group(1))
                pulse = int(match.group(2))
                position_cm = float(match.group(3))
                year = int(match.group(4))
                month = int(match.group(5))
                day = int(match.group(6))
                hour = int(match.group(7))
                minute = int(match.group(8))
                second = int(match.group(9))
                microseconds = int(match.group(10))
                
                # Validate values
                if (2000 <= year <= 2100 and 1 <= month <= 12 and 1 <= day <= 31 and
                    0 <= hour <= 23 and 0 <= minute <= 59 and 0 <= second <= 59):
                    
                    timestamp = datetime(year, month, day, hour, minute, second)
                    
                    return {
                        "frame_number": frame_num,
                        "pulse": pulse,
                        "position_cm": position_cm,
                        "timestamp": timestamp,
                        "microseconds": microseconds,
                        "sort_key": f"{year:04d}{month:02d}{day:02d}{hour:02d}{minute:02d}{second:02d}{microseconds:06d}"
                    }
            except (ValueError, TypeError) as e:
                print(f" Error parsing filename {filename}: {e}")
        
        # Fallback to file modification time
        try:
            file_path = os.path.join(IMAGE_FOLDER, filename)
            if os.path.exists(file_path):
                mtime = os.path.getmtime(file_path)
                return {
                    "frame_number": 0,
                    "pulse": 0,
                    "position_cm": 0.0,
                    "timestamp": datetime.fromtimestamp(mtime),
                    "microseconds": 0,
                    "sort_key": datetime.fromtimestamp(mtime).strftime("%Y%m%d%H%M%S%f")
                }
        except:
            pass
        
        # Last resort
        now = datetime.now()
        return {
            "frame_number": 0,
            "pulse": 0,
            "position_cm": 0.0,
            "timestamp": now,
            "microseconds": 0,
            "sort_key": now.strftime("%Y%m%d%H%M%S%f")
        }
    
    def get_image_files(self) -> List[Dict]:
        """Get all image files from the folder, sorted by timestamp (oldest first)"""
        if not os.path.exists(IMAGE_FOLDER):
            return []
        
        extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
        files_with_info = []
        
        try:
            for filename in os.listdir(IMAGE_FOLDER):
                file_path = os.path.join(IMAGE_FOLDER, filename)
                if os.path.isfile(file_path) and Path(file_path).suffix.lower() in extensions:
                    if filename in self.processed_files:
                        continue
                    
                    # Parse filename for all metadata
                    file_info = self.parse_filename(filename)
                    file_info["filename"] = filename
                    files_with_info.append(file_info)
                    
        except Exception as e:
            print(f"Error reading folder: {e}")
            return []
        
        # Sort by sort_key (chronological order - oldest first)
        files_with_info.sort(key=lambda x: x["sort_key"])
        
        # Log the sorted order for debugging
        if files_with_info:
            print(f" Sorted files by timestamp (oldest first):")
            for i, item in enumerate(files_with_info[:10]):
                print(f"  {i+1}. {item['filename']} -> Frame: {item['frame_number']}, Pulse: {item['pulse']}, Pos: {item['position_cm']:.2f}cm, Time: {item['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}.{item['microseconds']}")
            if len(files_with_info) > 10:
                print(f"  ... and {len(files_with_info) - 10} more")
        
        return files_with_info
    
    async def process_file(self, file_info: Dict):
        """Process a single image file"""
        filename = file_info["filename"]
        file_timestamp = file_info["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
        file_path = os.path.join(IMAGE_FOLDER, filename)
        
        # Extract encoder data for this frame
        frame_number = file_info.get("frame_number", 0)
        pulse_count = file_info.get("pulse", 0)
        position_cm = file_info.get("position_cm", 0.0)
        
        try:
            self.current_file = filename
            processing_start = time.time()
            
            # Broadcast processing started with encoder data
            await self.broadcast("processing", {
                "filename": filename,
                "frame_number": frame_number,
                "pulse": pulse_count,
                "position_cm": position_cm,
                "timestamp": file_timestamp,
                "status": "processing",
                "time": datetime.now().isoformat()
            })
            
            print(f" Processing: {filename} (Frame: {frame_number}, Pulse: {pulse_count}, Pos: {position_cm:.2f}cm)")
            
            # Read file
            with open(file_path, 'rb') as f:
                contents = f.read()
            
            # Detect defects - this returns the result with annotated_image as base64
            result = self.detector.detect_from_bytes(contents)
            
            # Calculate processing time
            processing_time = (time.time() - processing_start) * 1000  # Convert to ms
            
            # Add metadata including encoder data
            result["timestamp"] = file_timestamp
            result["filename"] = filename
            result["frame_number"] = frame_number
            result["pulse_count"] = pulse_count
            result["position_cm"] = position_cm
            result["processed_at"] = datetime.now().isoformat()
            result["processing_time_ms"] = processing_time
            
            # Ensure all datetime objects are converted to strings
            if "timestamp" in result and isinstance(result["timestamp"], datetime):
                result["timestamp"] = result["timestamp"].isoformat()
            
            # Ensure annotated_image is present and properly formatted
            if "annotated_image" not in result or not result["annotated_image"]:
                print(f" No annotated image in result for {filename}")
                import cv2
                import numpy as np
                from PIL import Image
                import io
                
                img = cv2.imread(file_path)
                if img is not None:
                    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                    pil_img = Image.fromarray(img_rgb)
                    buffer = io.BytesIO()
                    pil_img.save(buffer, format="JPEG")
                    img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
                    result["annotated_image"] = f"data:image/jpeg;base64,{img_str}"
            
            # Ensure annotated_image has the proper data URL format
            if result.get("annotated_image") and not result["annotated_image"].startswith("data:image"):
                result["annotated_image"] = f"data:image/jpeg;base64,{result['annotated_image']}"
            
            # Determine destination folder
            has_defects = len(result.get("defects", [])) > 0
            if has_defects:
                dest_folder = DEFECT_FOLDER
                result["classification"] = "defect"
                self.stats["total_defects"] += 1
            else:
                dest_folder = NON_DEFECT_FOLDER
                result["classification"] = "defect_free"
            
            self.stats["total_scanned"] += 1
            
            # Save to MongoDB ONLY if defects detected
            mongo_id = None
            if has_defects and self.mongodb:
                mongo_id = await self.mongodb.save_detection_result(result)
                # Convert ObjectId to string
                result["mongo_id"] = str(mongo_id)
                print(f" Saved defect frame to DB: {filename} (Pos: {position_cm:.2f}cm, Defects: {len(result.get('defects', []))})")
            
            # Update statistics in stats collection (always update stats regardless of defect status)
            if self.stats_db:
                await self.stats_db.update_stats(result, processing_time, has_defects)
            
            # Move file to appropriate folder
            dest_path = os.path.join(dest_folder, filename)
            shutil.move(file_path, dest_path)
            
            # Save a copy to processed folder with metadata
            processed_path = os.path.join(PROCESSED_FOLDER, filename)
            shutil.copy2(dest_path, processed_path)
            
            # Save metadata (always save metadata file)
            meta_path = os.path.join(PROCESSED_FOLDER, f"{filename}.json")
            with open(meta_path, 'w') as f:
                meta_result = result.copy()
                if "annotated_image" in meta_result:
                    meta_result["annotated_image"] = "[BASE64_IMAGE]"
                json.dump(meta_result, f, indent=2, default=convert_to_serializable)
            
            # Add to processed set
            self.processed_files.add(filename)
            
            # Log the result
            defect_count = len(result.get('defects', []))
            print(f" Processed {filename} - Defects: {defect_count} - Classification: {result['classification']} - Pos: {position_cm:.2f}cm - Time: {processing_time:.2f}ms")
            
            # Broadcast result for ALL images (both defect and non-defect)
            await self.broadcast("detection_result", result)
            
            # Get updated stats for broadcasting
            current_stats = await self.stats_db.get_current_stats() if self.stats_db else {}
            
            # Broadcast stats update
            await self.broadcast("stats_update", current_stats)
            
            # If defect detected, auto-pause scanning and stop motor
            if has_defects:
                self.is_paused = True
                # Stop the motor when defect detected
                encoder_system.stop_motor()
                
                # Broadcast defect detected with position data
                await self.broadcast("defect_detected", {
                    "message": f"Defect detected at {position_cm:.2f}cm - Scanner paused, motor stopped",
                    "filename": filename,
                    "frame_number": frame_number,
                    "pulse_count": pulse_count,
                    "position_cm": position_cm,
                    "defects": result["defects"],
                    "quality": result["quality_assessment"],
                    "timestamp": datetime.now().isoformat(),
                    "stats": current_stats
                })
                print(f" Defect detected in {filename} at {position_cm:.2f}cm - Scanner paused, motor stopped")
            
            self.current_file = None
            
        except Exception as e:
            print(f" Error processing {filename}: {e}")
            import traceback
            traceback.print_exc()
            await self.broadcast("error", {
                "filename": filename,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            })
    
    async def _scan_loop(self):
        """Main scanning loop - processes ALL images in chronological order, pauses on defect"""
        while self.is_running:
            try:
                if not self.is_paused:
                    # Get new files with parsed info (already sorted by timestamp)
                    new_files = self.get_image_files()
                    
                    if new_files:
                        # Filter out files already in pending queue
                        pending_filenames = {item["filename"] for item in self.pending_files}
                        truly_new = [f for f in new_files if f["filename"] not in pending_filenames]
                        
                        # Add new files to pending queue in chronological order
                        self.pending_files.extend(truly_new)
                        # Re-sort the entire queue by sort_key to ensure correct order
                        self.pending_files.sort(key=lambda x: x["sort_key"])
                        
                        if truly_new:
                            print(f" Found {len(truly_new)} new files to process. Total pending: {len(self.pending_files)}")
                        
                        # Process files one by one in chronological order
                        while self.pending_files and self.is_running and not self.is_paused:
                            # Get the next file (oldest first)
                            file_info = self.pending_files.pop(0)
                            
                            # Process the file (this will auto-pause if defect detected)
                            await self.process_file(file_info)
                            
                            # If paused due to defect, break out of the loop but keep remaining files in queue
                            if self.is_paused:
                                print(f"⏸ Scan paused due to defect. {len(self.pending_files)} files remaining in queue.")
                                break
                            
                            # Small delay between files to prevent overwhelming the system
                            await asyncio.sleep(0.5)
                    
                    # Broadcast status update with latest stats
                    current_stats = await self.stats_db.get_current_stats() if self.stats_db else {}
                    await self.broadcast("status_update", {
                        "is_running": self.is_running,
                        "is_paused": self.is_paused,
                        "current_file": self.current_file,
                        "pending_count": len(self.pending_files),
                        "processed_count": len(self.processed_files),
                        "stats": self.stats,
                        "aggregated_stats": current_stats,
                        "timestamp": datetime.now().isoformat()
                    })
                
                # Wait before next scan cycle
                if self.is_paused:
                    await asyncio.sleep(1)
                else:
                    await asyncio.sleep(SCAN_INTERVAL)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f" Scan loop error: {e}")
                await asyncio.sleep(5)

# Global scanner instance
realtime_manager = RealtimeScanner()

# HTTP endpoints for backward compatibility
@realtime_router.get("/status")
async def get_status():
    """Get current scanner status"""
    current_stats = await realtime_manager.stats_db.get_current_stats() if realtime_manager.stats_db else {}
    return {
        "is_running": realtime_manager.is_running,
        "is_paused": realtime_manager.is_paused,
        "current_file": realtime_manager.current_file,
        "pending_files": [{"filename": f["filename"], "position_cm": f.get("position_cm", 0)} for f in realtime_manager.pending_files[:10]],
        "pending_count": len(realtime_manager.pending_files),
        "processed_count": len(realtime_manager.processed_files),
        "connected_clients": len(realtime_manager.connected_clients),
        "stats": realtime_manager.stats,
        "aggregated_stats": current_stats,
        "timestamp": datetime.now().isoformat()
    }

@realtime_router.post("/start")
async def start_scanner():
    """Start the real-time scanner"""
    return await realtime_manager.start_scanning()

@realtime_router.post("/pause")
async def pause_scanner():
    """Pause the scanner"""
    return await realtime_manager.pause_scanning()

@realtime_router.post("/resume")
async def resume_scanner():
    """Resume the scanner"""
    return await realtime_manager.resume_scanning()

@realtime_router.post("/stop")
async def stop_scanner():
    """Stop the scanner"""
    return await realtime_manager.stop_scanning()

@realtime_router.get("/history")
async def get_history(limit: int = 100, skip: int = 0):
    """Get detection history from MongoDB (only defect frames)"""
    try:
        if not realtime_manager.mongodb:
            raise HTTPException(status_code=503, detail="MongoDB not connected")
        results = await realtime_manager.mongodb.get_detections(limit, skip)
        total = await realtime_manager.mongodb.get_count()
        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@realtime_router.get("/stats")
async def get_stats():
    """Get statistics from MongoDB (both collections)"""
    try:
        if not realtime_manager.mongodb:
            raise HTTPException(status_code=503, detail="MongoDB not connected")
        
        # Get detection statistics
        db_stats = await realtime_manager.mongodb.get_statistics()
        
        # Get aggregated statistics
        agg_stats = await realtime_manager.stats_db.get_current_stats() if realtime_manager.stats_db else {}
        
        return {
            **db_stats,
            "aggregated_stats": agg_stats,
            "live_stats": realtime_manager.stats,
            "connected_clients": len(realtime_manager.connected_clients),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@realtime_router.get("/stats/detailed")
async def get_detailed_stats():
    """Get detailed statistics for frontend display"""
    try:
        if not realtime_manager.stats_db:
            raise HTTPException(status_code=503, detail="Statistics DB not connected")
        
        stats = await realtime_manager.stats_db.get_current_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@realtime_router.get("/clients")
async def get_clients():
    """Get connected clients"""
    return {
        "connected_clients": len(realtime_manager.connected_clients),
        "clients": list(realtime_manager.connected_clients)[:10],
        "timestamp": datetime.now().isoformat()
    }