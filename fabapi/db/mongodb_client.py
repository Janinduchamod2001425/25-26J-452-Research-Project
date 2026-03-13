# mongodb_client.py (updated with StatsMongoDBClient)

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import asyncio
from bson import ObjectId

class MongoDBClient:
    """MongoDB client for storing detection results"""
    
    def __init__(self, uri: str, database: str, collection: str):
        self.uri = uri
        self.database_name = database
        self.collection_name = collection
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.collection = None
        
    async def connect(self):
        """Establish connection to MongoDB"""
        try:
            self.client = AsyncIOMotorClient(self.uri)
            # Ping the database
            await self.client.admin.command('ping')
            self.db = self.client[self.database_name]
            self.collection = self.db[self.collection_name]
            
            # Create indexes
            await self.create_indexes()
            
            print(f"✅ Connected to MongoDB: {self.database_name}.{self.collection_name}")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            raise
    
    async def create_indexes(self):
        """Create necessary indexes"""
        try:
            # Index for timestamp
            await self.collection.create_index("timestamp")
            # Index for defect types
            await self.collection.create_index("summary.defect_types_found")
            # Index for filename
            await self.collection.create_index("filename")
            # Compound index for time-based queries
            await self.collection.create_index([("timestamp", -1), ("summary.total_defects", -1)])
            print("✅ MongoDB indexes created")
        except Exception as e:
            print(f"⚠️ Index creation warning: {e}")
    
    async def disconnect(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            print("🔌 Disconnected from MongoDB")
    
    async def save_detection_result(self, result: Dict[str, Any]) -> str:
        """Save detection result to MongoDB"""
        try:
            # Add timestamps
            result["created_at"] = datetime.utcnow()
            
            # Ensure timestamp field exists
            if "timestamp" not in result:
                result["timestamp"] = datetime.utcnow().isoformat()
            
            # Insert into MongoDB
            insert_result = await self.collection.insert_one(result)
            return str(insert_result.inserted_id)
        except Exception as e:
            print(f"❌ Failed to save to MongoDB: {e}")
            raise
    
    async def get_detections(self, limit: int = 100, skip: int = 0) -> List[Dict[str, Any]]:
        """Get recent detections with pagination"""
        cursor = self.collection.find().sort("timestamp", -1).skip(skip).limit(limit)
        results = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for result in results:
            result["_id"] = str(result["_id"])
        
        return results
    
    async def get_count(self) -> int:
        """Get total number of detections"""
        return await self.collection.count_documents({})
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get statistics about detections"""
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_detections": {"$sum": 1},
                    "total_defects": {"$sum": "$summary.total_defects"},
                    "defect_free_count": {
                        "$sum": {"$cond": [{"$eq": ["$summary.is_defect_free", True]}, 1, 0]}
                    },
                    "defect_count": {
                        "$sum": {"$cond": [{"$eq": ["$summary.is_defect_free", False]}, 1, 0]}
                    }
                }
            }
        ]
        
        result = await self.collection.aggregate(pipeline).to_list(1)
        
        # Get defect type breakdown
        type_pipeline = [
            {"$unwind": "$summary.defect_types_found"},
            {"$group": {"_id": "$summary.defect_types_found", "count": {"$sum": 1}}}
        ]
        
        type_results = await self.collection.aggregate(type_pipeline).to_list(100)
        defect_types = {item["_id"]: item["count"] for item in type_results}
        
        if result:
            stats = result[0]
            stats["defect_types_breakdown"] = defect_types
            stats.pop("_id", None)
            return stats
        
        return {
            "total_detections": 0,
            "total_defects": 0,
            "defect_free_count": 0,
            "defect_count": 0,
            "defect_types_breakdown": {}
        }
    
    async def get_all_processed_filenames(self) -> List[str]:
        """Get list of all processed filenames"""
        cursor = self.collection.find({}, {"filename": 1})
        results = await cursor.to_list(length=None)
        return [r.get("filename") for r in results if r.get("filename")]
    
    async def get_defects_by_type(self, defect_type: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get detections with specific defect type"""
        cursor = self.collection.find({
            "summary.defect_types_found": defect_type
        }).sort("timestamp", -1).limit(limit)
        
        results = await cursor.to_list(length=limit)
        for result in results:
            result["_id"] = str(result["_id"])
        
        return results


class StatsMongoDBClient:
    """MongoDB client for storing aggregated statistics"""
    
    def __init__(self, uri: str, database: str, collection: str):
        self.uri = uri
        self.database_name = database
        self.collection_name = collection
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.collection = None
        self.stats_id = "current_stats"  # Fixed document ID for current stats
        
    async def connect(self):
        """Establish connection to MongoDB"""
        try:
            self.client = AsyncIOMotorClient(self.uri)
            # Ping the database
            await self.client.admin.command('ping')
            self.db = self.client[self.database_name]
            self.collection = self.db[self.collection_name]
            
            # Create indexes
            await self.create_indexes()
            
            print(f"✅ Connected to MongoDB Stats: {self.database_name}.{self.collection_name}")
        except Exception as e:
            print(f"❌ MongoDB Stats connection failed: {e}")
            raise
    
    async def create_indexes(self):
        """Create necessary indexes"""
        try:
            # Index for last_updated
            await self.collection.create_index("last_updated")
            # Index for the stats_id
            await self.collection.create_index("stats_id", unique=True)
            print("✅ MongoDB Stats indexes created")
        except Exception as e:
            print(f"⚠️ Stats index creation warning: {e}")
    
    async def disconnect(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            print("🔌 Disconnected from MongoDB Stats")
    
    async def initialize_stats(self):
        """Initialize the statistics document if it doesn't exist"""
        try:
            existing = await self.collection.find_one({"stats_id": self.stats_id})
            if not existing:
                initial_stats = {
                    "stats_id": self.stats_id,
                    "total_frames_processed": 0,
                    "total_defect_frames": 0,
                    "total_non_defect_frames": 0,
                    "defect_type_counts": {
                        "stain": 0,
                        "holes": 0,
                        "line": 0,
                        "cut": 0
                    },
                    "total_processing_time_ms": 0,
                    "avg_processing_time_ms": 0,
                    "defect_rate_percentage": 0,
                    "defect_free_rate_percentage": 100,
                    "last_updated": datetime.utcnow(),
                    "history": []
                }
                await self.collection.insert_one(initial_stats)
                print("✅ Initialized statistics document")
        except Exception as e:
            print(f"⚠️ Stats initialization warning: {e}")
    
    async def update_stats(self, result: Dict[str, Any], processing_time_ms: float, has_defects: bool):
        """Update statistics based on new detection result"""
        try:
            # Get current stats
            current = await self.collection.find_one({"stats_id": self.stats_id})
            if not current:
                await self.initialize_stats()
                current = await self.collection.find_one({"stats_id": self.stats_id})
            
            # Prepare update
            update = {
                "$inc": {
                    "total_frames_processed": 1,
                    "total_processing_time_ms": processing_time_ms
                },
                "$set": {
                    "last_updated": datetime.utcnow()
                }
            }
            
            # Update defect/non-defect counts
            if has_defects:
                update["$inc"]["total_defect_frames"] = 1
            else:
                update["$inc"]["total_non_defect_frames"] = 1
            
            # Update defect type counts
            defects = result.get("defects", [])
            defect_type_counts = {}
            
            for defect in defects:
                defect_type = defect.get("type", "").lower()
                if defect_type in ["stain", "holes", "line", "cut"]:
                    defect_type_counts[f"defect_type_counts.{defect_type}"] = 1
            
            if defect_type_counts:
                if "$inc" not in update:
                    update["$inc"] = {}
                for key, value in defect_type_counts.items():
                    update["$inc"][key] = value
            
            # Calculate averages and rates
            total_frames = current.get("total_frames_processed", 0) + 1
            total_processing_time = current.get("total_processing_time_ms", 0) + processing_time_ms
            avg_time = total_processing_time / total_frames
            
            defect_frames = current.get("total_defect_frames", 0) + (1 if has_defects else 0)
            non_defect_frames = current.get("total_non_defect_frames", 0) + (0 if has_defects else 1)
            
            defect_rate = (defect_frames / total_frames) * 100 if total_frames > 0 else 0
            defect_free_rate = (non_defect_frames / total_frames) * 100 if total_frames > 0 else 100
            
            # Add to update
            update["$set"]["avg_processing_time_ms"] = avg_time
            update["$set"]["defect_rate_percentage"] = defect_rate
            update["$set"]["defect_free_rate_percentage"] = defect_free_rate
            
            # Add to history (keep last 100 entries)
            history_entry = {
                "timestamp": datetime.utcnow(),
                "filename": result.get("filename", "unknown"),
                "has_defects": has_defects,
                "defect_count": len(defects),
                "defect_types": [d.get("type") for d in defects],
                "processing_time_ms": processing_time_ms
            }
            
            # Update the document
            await self.collection.update_one(
                {"stats_id": self.stats_id},
                update
            )
            
            # Add to history array (separate update to handle array size)
            await self.collection.update_one(
                {"stats_id": self.stats_id},
                {
                    "$push": {
                        "history": {
                            "$each": [history_entry],
                            "$slice": -100  # Keep only last 100 entries
                        }
                    }
                }
            )
            
        except Exception as e:
            print(f"❌ Failed to update statistics: {e}")
    
    async def get_current_stats(self) -> Dict[str, Any]:
        """Get current statistics for frontend display"""
        try:
            stats = await self.collection.find_one({"stats_id": self.stats_id})
            if not stats:
                await self.initialize_stats()
                stats = await self.collection.find_one({"stats_id": self.stats_id})
            
            if stats:
                # Remove MongoDB internal fields
                stats.pop("_id", None)
                stats.pop("stats_id", None)
                
                # Format for frontend
                formatted_stats = {
                    "total_frames_processed": stats.get("total_frames_processed", 0),
                    "total_defect_frames": stats.get("total_defect_frames", 0),
                    "total_non_defect_frames": stats.get("total_non_defect_frames", 0),
                    "defect_type_counts": stats.get("defect_type_counts", {
                        "stain": 0, "holes": 0, "line": 0, "cut": 0
                    }),
                    "avg_processing_time_ms": round(stats.get("avg_processing_time_ms", 0), 2),
                    "defect_rate_percentage": round(stats.get("defect_rate_percentage", 0), 1),
                    "defect_free_rate_percentage": round(stats.get("defect_free_rate_percentage", 100), 1),
                    "last_updated": stats.get("last_updated", datetime.utcnow()).isoformat() if isinstance(stats.get("last_updated"), datetime) else stats.get("last_updated"),
                    "recent_history": stats.get("history", [])[-10:]  # Last 10 entries
                }
                
                # Format history timestamps
                for entry in formatted_stats["recent_history"]:
                    if isinstance(entry.get("timestamp"), datetime):
                        entry["timestamp"] = entry["timestamp"].isoformat()
                
                return formatted_stats
            
            return self._get_default_stats()
            
        except Exception as e:
            print(f"❌ Failed to get statistics: {e}")
            return self._get_default_stats()
    
    def _get_default_stats(self) -> Dict[str, Any]:
        """Return default statistics when database is empty"""
        return {
            "total_frames_processed": 0,
            "total_defect_frames": 0,
            "total_non_defect_frames": 0,
            "defect_type_counts": {
                "stain": 0,
                "holes": 0,
                "line": 0,
                "cut": 0
            },
            "avg_processing_time_ms": 0,
            "defect_rate_percentage": 0,
            "defect_free_rate_percentage": 100,
            "last_updated": datetime.utcnow().isoformat(),
            "recent_history": []
        }
    
    async def get_defect_trends(self, days: int = 7) -> Dict[str, Any]:
        """Get defect trends over time"""
        try:
            # This would need a separate collection with time-series data
            # For now, return a simplified version
            stats = await self.get_current_stats()
            
            # Mock trend data (in production, you'd query historical data)
            from datetime import timedelta
            import random
            
            trends = []
            for i in range(days):
                date = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
                trends.append({
                    "date": date,
                    "defect_count": random.randint(5, 20) if stats["total_defect_frames"] > 0 else 0,
                    "non_defect_count": random.randint(50, 100) if stats["total_non_defect_frames"] > 0 else 0
                })
            
            return {
                "trends": trends,
                "period": f"last_{days}_days"
            }
        except Exception as e:
            print(f"❌ Failed to get trends: {e}")
            return {"trends": [], "period": f"last_{days}_days"}