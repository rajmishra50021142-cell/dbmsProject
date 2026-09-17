"""
FastAPI Endpoint for What-If / Experiment Mode (Phase 9).

Executes parallel analysis of original and modified schemas, computing an authoritative
diff and step-by-step reasoning derivation.
"""

from fastapi import APIRouter, HTTPException, status
from app.experiments.schemas import ExperimentAnalyzeRequest, ExperimentAnalyzeResponse
from app.experiments.service import ExperimentService

router = APIRouter()


@router.post(
    "/analyze",
    response_model=ExperimentAnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Run What-If experiment analysis and compute mathematical diff",
    description="Compares original and modified schemas using actual normalization engines and returns a structured diff.",
)
async def api_analyze_experiment(payload: ExperimentAnalyzeRequest) -> ExperimentAnalyzeResponse:
    try:
        return ExperimentService.run_experiment(payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during experiment re-analysis: {str(e)}",
        )
