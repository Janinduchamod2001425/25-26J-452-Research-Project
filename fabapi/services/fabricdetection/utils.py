import json
import os
from typing import Dict, Any

def load_class_mapping(class_mapping_path: str) -> Dict[int, str]:
    """Load class mapping from JSON file."""
    try:
        with open(class_mapping_path, 'r') as f:
            data = json.load(f)
        return {v: k for k, v in data.items()}
    except:
        # Default mapping if file not found
        return {
            0: "cut",
            1: "defect_free", 
            2: "holes",
            3: "stain",
            4: "lines"
        }

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'bmp', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def assess_severity(defect_type: str, confidence: float) -> str:
    """Assess defect severity based on type and confidence."""
    if defect_type == "defect_free":
        return "None"
    
    if defect_type in ["holes", "cut"]:
        if confidence > 0.8:
            return "High"
        elif confidence > 0.6:
            return "Medium"
        return "Low"
    
    if defect_type == "lines":
        if confidence > 0.7:
            return "High"
        elif confidence > 0.5:
            return "Medium"
        return "Low"
    
    if defect_type == "stain":
        if confidence > 0.7:
            return "High"
        elif confidence > 0.5:
            return "Medium"
        return "Low"
    
    if confidence > 0.8:
        return "High"
    elif confidence > 0.6:
        return "Medium"
    return "Low"

def calculate_location(x_center: float, y_center: float, 
                      img_width: int, img_height: int) -> Dict[str, str]:
    """Calculate physical location on fabric."""
    fabric_width = 1.5  # meters
    fabric_length = 100  # meters
    
    x_meters = (x_center / img_width) * fabric_width
    y_meters = (y_center / img_height) * fabric_length
    
    return {
        "fabricLength": f"{y_meters:.2f} m",
        "xPos": f"{x_meters:.2f} m from left edge",
        "yPos": f"{y_meters:.2f} m from start"
    }

def get_quality_assessment(defects: list) -> Dict[str, Any]:
    """Determine quality grade based on defects."""
    if len(defects) == 0:
        return {
            "grade": "A",
            "status": "Excellent",
            "description": "No defects detected"
        }
    elif len(defects) == 1 and defects[0]["severity"] == "Low":
        return {
            "grade": "B",
            "status": "Good",
            "description": "Minor defect detected"
        }
    else:
        severity_map = {"Low": 1, "Medium": 2, "High": 3}
        max_severity = max([severity_map.get(d["severity"], 0) for d in defects])
        
        if max_severity >= 3:
            grade = "D"
            status = "Critical"
        elif max_severity == 2:
            grade = "C"
            status = "Needs Review"
        else:
            grade = "B"
            status = "Good"
            
        return {
            "grade": grade,
            "status": status,
            "description": f"{len(defects)} defect(s) detected"
        }