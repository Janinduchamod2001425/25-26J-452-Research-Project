import time
import base64
import cv2
import numpy as np
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from ultralytics import YOLO
from .utils import (
    load_class_mapping, assess_severity, 
    calculate_location, get_quality_assessment
)

class FabricDefectDetector:
    """Main fabric defect detection class."""
    
    def __init__(self, model_path: str, class_mapping_path: str):
        """
        Initialize the detector.
        
        Args:
            model_path: Path to YOLO model (.pt file)
            class_mapping_path: Path to class mapping JSON file
        """
        self.model_path = model_path
        self.class_mapping_path = class_mapping_path
        self.model = None
        self.class_mapping = None
        self.color_map = {
            "cut": (255, 0, 0),      # Red
            "holes": (0, 0, 255),     # Blue
            "stain": (0, 255, 255),   # Cyan
            "lines": (255, 165, 0)    # Orange
        }
        
        self._load_model()
    
    def _load_model(self):
        """Load YOLO model and class mapping."""
        try:
            self.class_mapping = load_class_mapping(self.class_mapping_path)
            print(f"✅ Class mapping loaded: {self.class_mapping}")
            
            self.model = YOLO(self.model_path)
            print(f"✅ Model loaded successfully from {self.model_path}")
        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            raise
    
    def is_ready(self) -> bool:
        """Check if detector is ready."""
        return self.model is not None and self.class_mapping is not None
    
    def detect_from_bytes(self, image_bytes: bytes, confidence: float = 0.25) -> Dict[str, Any]:
        """
        Detect defects from image bytes.
        
        Args:
            image_bytes: Raw image bytes
            confidence: Confidence threshold
            
        Returns:
            Detection results dictionary
        """
        if not self.is_ready():
            raise RuntimeError("Detector not ready. Model not loaded.")
        
        start_time = time.time()
        
        # Decode image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Invalid image data")
        
        # Get image dimensions
        h, w = img.shape[:2]
        
        # Run detection
        results = self.model(img, conf=confidence, verbose=False)
        
        # Process results
        defects = self._process_detections(results[0], w, h)
        
        # Create annotated image
        annotated_img = self._create_annotated_image(img.copy(), defects)
        annotated_base64 = self._image_to_base64(annotated_img)
        
        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000
        
        # Prepare response
        response = {
            "success": True,
            "message": "Detection completed",
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_defects": len(defects),
                "is_defect_free": len(defects) == 0,
                "defect_types_found": list(set([d["type"] for d in defects])),
                "overall_severity": self._get_overall_severity(defects)
            },
            "defects": defects,
            "quality_assessment": get_quality_assessment(defects),
            "annotated_image": f"data:image/jpeg;base64,{annotated_base64}",
            "processing_time_ms": round(processing_time, 2)
        }
        
        return response
    
    def _process_detections(self, results, img_width: int, img_height: int) -> List[Dict[str, Any]]:
        """Process YOLO detection results."""
        defects = []
        
        if results.boxes is not None and len(results.boxes) > 0:
            for i, box in enumerate(results.boxes):
                class_id = int(box.cls[0])
                confidence_score = float(box.conf[0])
                bbox = box.xyxy[0].cpu().numpy().tolist()
                
                defect_name = self.class_mapping.get(class_id, f"class_{class_id}")
                
                # Skip defect_free
                if defect_name == "defect_free":
                    continue
                
                # Calculate center
                x_center = (bbox[0] + bbox[2]) / 2
                y_center = (bbox[1] + bbox[3]) / 2
                
                # Calculate area percentage
                bbox_area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
                image_area = img_width * img_height
                area_percent = (bbox_area / image_area) * 100
                
                # Assess severity
                severity = assess_severity(defect_name, confidence_score)
                
                # Calculate location
                location = calculate_location(x_center, y_center, img_width, img_height)
                
                # Create defect object
                defect = {
                    "id": i + 1,
                    "type": defect_name,
                    "confidence": f"{confidence_score * 100:.1f}%",
                    "severity": severity,
                    "area_percentage": round(area_percent, 2),
                    "bounding_box": {
                        "x1": round(bbox[0]),
                        "y1": round(bbox[1]),
                        "x2": round(bbox[2]),
                        "y2": round(bbox[3])
                    },
                    "location": location
                }
                defects.append(defect)
        
        return defects
    
    def _create_annotated_image(self, image: np.ndarray, defects: List[Dict[str, Any]]) -> np.ndarray:
        """Draw bounding boxes and labels on image."""
        for defect in defects:
            color = self.color_map.get(defect["type"], (255, 255, 255))
            x1, y1 = defect["bounding_box"]["x1"], defect["bounding_box"]["y1"]
            x2, y2 = defect["bounding_box"]["x2"], defect["bounding_box"]["y2"]
            
            # Draw rectangle
            cv2.rectangle(image, (x1, y1), (x2, y2), color, 3)
            
            # Add label
            label = f"{defect['type']} {defect['confidence']}"
            cv2.putText(image, label, (x1, y1-10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
        return image
    
    def _image_to_base64(self, image: np.ndarray) -> str:
        """Convert OpenCV image to base64 string."""
        _, buffer = cv2.imencode('.jpg', image)
        return base64.b64encode(buffer).decode('utf-8')
    
    def _get_overall_severity(self, defects: List[Dict[str, Any]]) -> str:
        """Calculate overall severity from all defects."""
        if len(defects) == 0:
            return "None"
        
        severity_values = {"Low": 1, "Medium": 2, "High": 3}
        return max([d["severity"] for d in defects], 
                  key=lambda x: severity_values.get(x, 0))
    
    def get_defect_types(self) -> List[str]:
        """Get list of available defect types."""
        return list(self.class_mapping.values()) if self.class_mapping else []