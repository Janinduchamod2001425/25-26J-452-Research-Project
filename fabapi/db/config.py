import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).parent.parent.parent
DRIVE_PATH = "E:/fabric_images"  # Change this to your actual path

# Image folders
IMAGE_FOLDER = os.getenv("IMAGE_FOLDER", os.path.join(DRIVE_PATH, "input"))
DEFECT_FOLDER = os.getenv("DEFECT_FOLDER", os.path.join(DRIVE_PATH, "defects"))
NON_DEFECT_FOLDER = os.getenv("NON_DEFECT_FOLDER", os.path.join(DRIVE_PATH, "non_defects"))
PROCESSED_FOLDER = os.getenv("PROCESSED_FOLDER", os.path.join(DRIVE_PATH, "processed"))

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://thisarajasonpaypal_db_user:1IkJ3AIcFqe5ZivC@cluster0.abr7w5e.mongodb.net/?appName=Cluster0")
MONGO_DB = os.getenv("MONGO_DB", "fabric_defect_db")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "detections")
MONGO_STATS_COLLECTION = os.getenv("MONGO_STATS_COLLECTION", "statistics") 

# Scanner settings
SCAN_INTERVAL = int(os.getenv("SCAN_INTERVAL", "2"))  # seconds between scans

# Create directories if they don't exist
for folder in [IMAGE_FOLDER, DEFECT_FOLDER, NON_DEFECT_FOLDER, PROCESSED_FOLDER]:
    Path(folder).mkdir(parents=True, exist_ok=True)
    print(f"📁 Ensured folder exists: {folder}")