"""
FastAPI Endpoint for Practice Mode (Phase 9).

Serves academic exercises and validates student answers using real normalization engines.
"""

from typing import List
from fastapi import APIRouter, HTTPException, status
from app.practice.schemas import (
    PracticeExercise,
    PracticeVerifyRequest,
    PracticeVerifyResponse,
)
from app.practice.service import PracticeService

router = APIRouter()


@router.get(
    "/exercises",
    response_model=List[PracticeExercise],
    status_code=status.HTTP_200_OK,
    summary="Fetch predefined academic normalization exercises",
    description="Returns interactive exercises testing candidate keys, closures, and normal form violations.",
)
async def get_practice_exercises() -> List[PracticeExercise]:
    return PracticeService.get_exercises()


@router.post(
    "/verify",
    response_model=PracticeVerifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify student exercise submission",
    description="Grades student answer mathematically using the actual DBMS normalization engines.",
)
async def verify_practice_answer(req: PracticeVerifyRequest) -> PracticeVerifyResponse:
    try:
        return PracticeService.verify_answer(req)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while verifying answer: {str(e)}",
        )
