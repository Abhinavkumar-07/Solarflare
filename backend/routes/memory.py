from fastapi import APIRouter
from services import memory_service

router = APIRouter()

@router.get("/")
def get_memory():
    return memory_service.get_memory_data()
