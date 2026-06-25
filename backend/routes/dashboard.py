from fastapi import APIRouter
from services import dashboard_service

router = APIRouter()

@router.get("/")
def get_dashboard():
    return dashboard_service.get_dashboard_data()
