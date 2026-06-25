from fastapi import APIRouter
from services import alert_service

router = APIRouter()

@router.get("/")
def get_alerts():
    return alert_service.get_alerts_data()
