import json
from config import DATA_DIR

def get_alerts_data():
    alerts_path = DATA_DIR / "processed" / "alerts_output.json"
    if alerts_path.exists():
        with open(alerts_path, "r") as f:
            return json.load(f)
            
    return {
        "status": "error",
        "message": "Pipeline output missing",
        "missing_file": str(alerts_path),
        "active_alerts": ["Mock M-Class Flare Alert", "Geomagnetic Storm Warning"],
        "alert_severity": "High",
        "alert_time": "2026-06-03T12:05:00Z"
    }
