from fastapi import APIRouter
from services.explain_service import generate_explanation

router = APIRouter(
    tags=["explain"]
)

@router.get("")
def get_explanation():
    return generate_explanation()
