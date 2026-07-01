from fastapi import APIRouter
from utils.data_provider import get_forecast, get_genome, get_memory
from datetime import datetime, timezone

router = APIRouter()

@router.get("/")
def get_health():
    fore = get_forecast()
    mem = get_memory()
    gen = get_genome()
    
    return {
        "pipeline": "ready",
        "forecast_available": fore.get("is_live_data", False),
        "memory_db_loaded": mem.get("is_live_data", False),
        "genome_available": gen.get("is_live_data", False),
        "last_update": datetime.now(timezone.utc).isoformat(),
        "api_version": "1.0"
    }
