"""
FastAPI Route Handlers for Attribute Closure & FD Implication.

Endpoints:
- POST /api/v1/closure/compute: Computes X+ with step-by-step educational trace.
- POST /api/v1/closure/determination: Tests whether X -> Y is implied by F using closure.
- POST /api/v1/closure/trivial-check: Tests syntactic triviality of a functional dependency.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.domain_contracts import (
    ClosureRequest,
    ClosureResult,
    DeterminationRequest,
    DeterminationResult,
    TrivialFDCheckRequest,
    TrivialFDCheckResult,
)
from app.normalization.closure_engine import (
    compute_attribute_closure,
    check_functional_determination,
    ClosureEngineError,
)
from app.normalization.fd_engine import check_trivial_fd

router = APIRouter()


@router.post(
    "/compute",
    response_model=ClosureResult,
    status_code=status.HTTP_200_OK,
    summary="Compute Attribute Closure (X+)",
    description="Computes the closure of a target attribute set under functional dependency set F with educational reasoning steps.",
)
async def api_compute_closure(request: ClosureRequest) -> ClosureResult:
    try:
        return compute_attribute_closure(
            attributes=request.attributes,
            fds=request.functional_dependencies,
            target_attributes=request.target_attributes,
            relation_name=request.relation_name or "R",
        )
    except ClosureEngineError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while computing closure: {str(e)}",
        )


@router.post(
    "/determination",
    response_model=DeterminationResult,
    status_code=status.HTTP_200_OK,
    summary="Check Functional Determination (X -> Y)",
    description="Determines whether an FD X -> Y is logically implied by F using attribute closure.",
)
async def api_check_determination(request: DeterminationRequest) -> DeterminationResult:
    try:
        return check_functional_determination(
            attributes=request.attributes,
            fds=request.functional_dependencies,
            lhs=request.lhs,
            rhs=request.rhs,
            relation_name=request.relation_name or "R",
        )
    except ClosureEngineError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while checking determination: {str(e)}",
        )


@router.post(
    "/trivial-check",
    response_model=TrivialFDCheckResult,
    status_code=status.HTTP_200_OK,
    summary="Check Trivial Dependency",
    description="Tests whether an FD is trivial or partially trivial according to Armstrong's Reflexivity Axiom.",
)
async def api_check_trivial_fd(request: TrivialFDCheckRequest) -> TrivialFDCheckResult:
    try:
        return check_trivial_fd(request.functional_dependency)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to analyze dependency triviality: {str(e)}",
        )
