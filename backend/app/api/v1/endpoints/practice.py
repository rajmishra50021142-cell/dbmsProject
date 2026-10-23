"""
FastAPI Endpoint for Practice Mode (Phase 9).

Serves academic exercises and validates student answers using real normalization engines.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Query
from app.practice.schemas import (
    PracticeExercise,
    PracticeVerifyRequest,
    PracticeVerifyResponse,
    QuizQuestion,
    VerifyAttemptRequest,
    GentleFeedbackResponse,
    QuizSubmissionRequest,
    QuizSubmissionResponse,
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


@router.get(
    "/summary",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Fetch aggregate summary of practice question banks",
    description="Returns question counts, available topics, difficulties, and exam breakdowns.",
)
async def get_practice_summary() -> Dict[str, Any]:
    return PracticeService.get_summary()


@router.get(
    "/ai/questions",
    response_model=List[QuizQuestion],
    status_code=status.HTTP_200_OK,
    summary="Fetch AI practice question bank",
    description="Returns high-quality original DBMS normalization questions with progressive hints.",
)
async def get_ai_practice_questions(
    topic: Optional[str] = Query(None, description="Filter by topic"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty ('Easy', 'Medium', 'Hard')"),
    count: Optional[int] = Query(None, ge=1, description="Limit number of questions returned"),
) -> List[QuizQuestion]:
    return PracticeService.get_ai_questions(topic=topic, difficulty=difficulty, count=count)


@router.get(
    "/pyqs/questions",
    response_model=List[QuizQuestion],
    status_code=status.HTTP_200_OK,
    summary="Fetch Competitive Exam PYQ question bank",
    description="Returns all 80 questions parsed from competitive exam compilation with origin metadata.",
)
async def get_pyq_practice_questions(
    exam: Optional[str] = Query(None, description="Filter by exam name (e.g. 'GATE CSE')"),
    topic: Optional[str] = Query(None, description="Filter by topic"),
    playable_only: bool = Query(False, description="If true, return only verified playable questions (60)"),
    count: Optional[int] = Query(None, ge=1, description="Limit number of questions returned"),
) -> List[QuizQuestion]:
    return PracticeService.get_pyq_questions(exam=exam, topic=topic, playable_only=playable_only, count=count)


@router.post(
    "/verify-attempt",
    response_model=GentleFeedbackResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify practice attempt with gentle retry feedback",
    description="Grades an attempt without shaming: offers hints on attempts 1-2, reveals proof on attempt 3.",
)
async def verify_quiz_attempt(req: VerifyAttemptRequest) -> GentleFeedbackResponse:
    try:
        return PracticeService.verify_attempt(req)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while verifying attempt: {str(e)}",
        )


@router.post(
    "/submit-quiz",
    response_model=QuizSubmissionResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit and score full quiz session",
    description="Evaluates all answers, calculates score, topic breakdown, and comprehensive question reviews.",
)
async def submit_quiz_session(req: QuizSubmissionRequest) -> QuizSubmissionResponse:
    try:
        return PracticeService.submit_quiz(req)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while scoring quiz session: {str(e)}",
        )
