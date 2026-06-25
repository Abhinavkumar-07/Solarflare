from fastapi import APIRouter
from services import forecast_service

router = APIRouter()

@router.get("/")
def get_forecast():
    return forecast_service.get_forecast_data()
