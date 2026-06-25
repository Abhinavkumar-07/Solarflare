from fastapi import APIRouter
from services import genome_service

router = APIRouter()

@router.get("/")
def get_genome():
    return genome_service.get_genome_data()
