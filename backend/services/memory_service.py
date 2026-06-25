import json
from config import MEMORY_METADATA_PATH, DATA_DIR

def get_memory_data():
    result = {}
    query_output_path = DATA_DIR / "processed" / "memory_query_output.json"
    
    if query_output_path.exists():
        with open(query_output_path, "r") as f:
            q_data = json.load(f)
            result["nearest_historical_events"] = q_data.get("nearest_events", [])
            result["similarity_scores"] = q_data.get("similarity_scores", [])
    else:
        result.update({
            "status": "error",
            "message": "Pipeline output missing",
            "missing_file": str(query_output_path),
            "nearest_historical_events": ["Event-20170906-X9.3", "Event-20240514-X8.7"],
            "similarity_scores": [0.95, 0.88]
        })

    if MEMORY_METADATA_PATH.exists():
        with open(MEMORY_METADATA_PATH, "r") as f:
            data = json.load(f)
            result["historical_flare_metadata"] = data.get("metadata", [])[:50]
    else:
        result["historical_flare_metadata"] = []
        
    return result
