import sys
import json
import os
from ultralytics import YOLO

def predict(image_path):
    try:
        # Load the segmentation model (will download yolov8n-seg.pt if not present)
        model = YOLO('yolov8n-seg.pt') 
        
        results = model(image_path, verbose=False)
        
        has_detection = False
        max_conf = 0.0
        detections = []
        
        for result in results:
            if len(result.boxes) > 0:
                has_detection = True
                
                # Get boxes in [x1, y1, x2, y2] format and normalize them
                img_width, img_height = result.orig_shape[1], result.orig_shape[0]
                
                for box in result.boxes:
                    conf = float(box.conf[0])
                    max_conf = max(max_conf, conf)
                    
                    # Convert to list [x1, y1, x2, y2]
                    coords = box.xyxy[0].tolist()
                    
                    # Normalize coordinates for the UI (0 to 1)
                    norm_coords = [
                        coords[0] / img_width,
                        coords[1] / img_height,
                        coords[2] / img_width,
                        coords[3] / img_height
                    ]
                    
                    detections.append({
                        "box": norm_coords,
                        "confidence": conf,
                        "class": int(box.cls[0])
                    })
        
        # Simplified mapping logic for this demonstration
        if not has_detection:
            return {
                "result": "Healthy Skin",
                "hasLesion": False,
                "confidence": 95,
                "detections": [],
                "metadata": {"source": "YOLOv8n-seg", "status": "no_detections"}
            }
        
        confidence_int = int(max_conf * 100)
        
        # Mapping logic (Mocking classification based on detection confidence)
        if max_conf > 0.8:
            res_str = "Melanoma"
            has_lesion = True
        else:
            res_str = "Not Melanoma"
            has_lesion = True
            
        return {
            "result": res_str,
            "hasLesion": has_lesion,
            "confidence": confidence_int,
            "detections": detections,
            "metadata": {
                "source": "YOLOv8n-seg",
                "status": "detection_found",
                "raw_conf": max_conf
            }
        }

    except Exception as e:
        return {
            "error": str(e),
            "result": "Error",
            "hasLesion": False,
            "confidence": 0,
            "detections": []
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
        
    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Image not found at {image_path}"}))
        sys.exit(1)
        
    output = predict(image_path)
    print(json.dumps(output))
