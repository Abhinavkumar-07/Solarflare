import logging
import json
from datetime import datetime, timezone

class StructuredFormatter(logging.Formatter):
    def format(self, record):
        log_obj = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "name": record.name
        }
        
        if hasattr(record, "missing_file"):
            log_obj["missing_file"] = record.missing_file
            
        if hasattr(record, "invalid_data"):
            log_obj["invalid_data"] = record.invalid_data

        if hasattr(record, "path"):
            log_obj["path"] = record.path

        return json.dumps(log_obj)

def get_logger(name="SolarGuardBackend"):
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        handler.setFormatter(StructuredFormatter())
        logger.addHandler(handler)
    return logger

logger = get_logger()
