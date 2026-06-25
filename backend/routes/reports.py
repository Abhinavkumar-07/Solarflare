from fastapi import APIRouter
from services import report_service

router = APIRouter()

@router.get("/")
def get_reports():
    return report_service.get_reports_data()
