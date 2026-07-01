import json
from pathlib import Path
import os
import threading
from utils.logger import logger

ROOT = Path(__file__).parent.parent.parent
GENERATED_DIR = ROOT / "generated"

class DataProvider:
    def __init__(self):
        self._cache = {}
        self._lock = threading.Lock()

    def get_data(self, filename: str, fallback_data: dict) -> dict:
        file_path = GENERATED_DIR / filename
        
        with self._lock:
            # Check if file exists
            if not file_path.exists():
                logger.warning("Pipeline output missing", extra={"missing_file": str(file_path)})
                fallback_data["is_live_data"] = False
                fallback_data["status"] = "error"
                fallback_data["message"] = f"Pipeline output missing: {filename}"
                return fallback_data

            try:
                mtime = os.path.getmtime(file_path)
                
                # Check cache
                if filename in self._cache:
                    cached_mtime, cached_data = self._cache[filename]
                    if cached_mtime == mtime:
                        # Return cached version
                        return cached_data
                
                # Cache miss or file updated, read from disk
                with open(file_path, "r") as f:
                    data = json.load(f)
                    data["is_live_data"] = True
                    self._cache[filename] = (mtime, data)
                    logger.info("Pipeline file read successfully", extra={"path": str(file_path)})
                    return data
                    
            except Exception as e:
                logger.error("Failed to read pipeline output", extra={"path": str(file_path), "invalid_data": str(e)})
                fallback_data["is_live_data"] = False
                fallback_data["status"] = "error"
                fallback_data["message"] = f"Failed to read data: {str(e)}"
                return fallback_data

provider = DataProvider()

def get_dashboard():
    fallback = {
        "forecast_probability": 0.45,
        "active_alert": False,
        "hardening_index": 1.14,
        "last_update_time": "2026-06-03T12:00:00Z",
        "current_solar_status": "Quiet",
        "mission_status": "GOES-16 Online"
    }
    return provider.get_data("dashboard.json", fallback)

def get_forecast():
    fallback = {
        "flare_probability": 0.45,
        "predicted_flare_class": "unknown",
        "confidence_score": 0.0,
        "hardening_ratio": 1.14,
        "forecast_timestamp": "2026-06-03T12:00:00Z"
    }
    return provider.get_data("forecast.json", fallback)

def get_genome():
    fallback = {
        "flare_genome": "Mock-Genome-X",
        "latent_vector": [0.1, -0.2, 0.3, 0.5],
        "genome_metadata": []
    }
    return provider.get_data("genome.json", fallback)

def get_memory():
    fallback = {
        "nearest_historical_events": ["Event-20170906-X9.3"],
        "similarity_scores": [0.95],
        "historical_flare_metadata": []
    }
    return provider.get_data("memory.json", fallback)

def get_alerts():
    fallback = {
        "active_alerts": ["Mock M-Class Flare Alert"],
        "alert_severity": "High",
        "alert_time": "2026-06-03T12:05:00Z"
    }
    return provider.get_data("alerts.json", fallback)
