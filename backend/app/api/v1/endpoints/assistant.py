"""
FastAPI Endpoint for Normalization Assistant (Phase 9).

Provides deterministic, offline-capable, educational DBMS assistant responses.
Strictly non-generative, grounded in active relational schema analysis.
"""

from fastapi import APIRouter, status
from app.assistant.schemas import AssistantAskRequest, AssistantAskResponse
from app.assistant.response_builder import ResponseBuilder

router = APIRouter()


@router.post(
    "/ask",
    response_model=AssistantAskResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask a deterministic question to the Normalization Assistant",
    description=(
        "Processes questions about 1NF-4NF concepts, current analysis results, "
        "candidate keys, closures, violations, and decompositions with mathematical rigor."
    ),
)
async def ask_assistant(payload: AssistantAskRequest) -> AssistantAskResponse:
    """Answers user queries grounded in active schema analysis."""
    return ResponseBuilder.build_response(
        question=payload.question,
        context=payload.context,
    )
