"""
FastAPI Route Handlers for Candidate Keys, Superkeys & Prime Attributes.

Endpoints:
- POST /api/v1/keys/superkey-check: Tests whether an attribute set is a superkey.
- POST /api/v1/keys/verify: Validates whether an attribute set is a minimal candidate key.
- POST /api/v1/keys/find: Automatically discovers all minimal candidate keys.
- POST /api/v1/keys/analysis: Full analysis combining discovery, user key verification, and prime/non-prime partition.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.domain_contracts import (
    SuperkeyCheckRequest,
    SuperkeyCheckResult,
    KeyVerificationRequest,
    KeyVerificationResult,
    KeyDiscoveryRequest,
    KeyDiscoveryResult,
    CandidateKeyAnalysisRequest,
    CandidateKeyAnalysisResult,
)
from app.normalization.candidate_key_engine import (
    check_is_superkey,
    verify_candidate_key,
    find_all_candidate_keys,
    analyze_candidate_keys,
    CandidateKeyEngineError,
)
from app.normalization.closure_engine import ClosureEngineError

router = APIRouter()


@router.post(
    "/superkey-check",
    response_model=SuperkeyCheckResult,
    status_code=status.HTTP_200_OK,
    summary="Check Superkey Property",
    description="Evaluates whether an attribute set determines all attributes in relation R.",
)
async def api_superkey_check(request: SuperkeyCheckRequest) -> SuperkeyCheckResult:
    try:
        return check_is_superkey(
            attributes=request.attributes,
            fds=request.functional_dependencies,
            target_attributes=request.target_attributes,
            relation_name=request.relation_name or "R",
        )
    except (CandidateKeyEngineError, ClosureEngineError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during superkey verification: {str(e)}",
        )


@router.post(
    "/verify",
    response_model=KeyVerificationResult,
    status_code=status.HTTP_200_OK,
    summary="Verify Candidate Key",
    description="Tests whether an attribute set is a minimal candidate key (both superkey and minimal).",
)
async def api_verify_key(request: KeyVerificationRequest) -> KeyVerificationResult:
    try:
        return verify_candidate_key(
            attributes=request.attributes,
            fds=request.functional_dependencies,
            candidate_key=request.candidate_key,
            relation_name=request.relation_name or "R",
        )
    except (CandidateKeyEngineError, ClosureEngineError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during key verification: {str(e)}",
        )


@router.post(
    "/find",
    response_model=KeyDiscoveryResult,
    status_code=status.HTTP_200_OK,
    summary="Find All Candidate Keys",
    description="Deterministically derives all minimal candidate keys, prime attributes, and non-prime attributes.",
)
async def api_find_candidate_keys(request: KeyDiscoveryRequest) -> KeyDiscoveryResult:
    try:
        return find_all_candidate_keys(
            attributes=request.attributes,
            fds=request.functional_dependencies,
            relation_name=request.relation_name or "R",
            max_combinations=request.max_combinations or 1000,
        )
    except (CandidateKeyEngineError, ClosureEngineError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during candidate-key discovery: {str(e)}",
        )


@router.post(
    "/analysis",
    response_model=CandidateKeyAnalysisResult,
    status_code=status.HTTP_200_OK,
    summary="Complete Candidate Key Analysis",
    description="Combines automatic key discovery with verification of user-provided keys and prime/non-prime partitioning.",
)
async def api_analyze_candidate_keys(request: CandidateKeyAnalysisRequest) -> CandidateKeyAnalysisResult:
    try:
        return analyze_candidate_keys(
            attributes=request.attributes,
            fds=request.functional_dependencies,
            user_candidate_keys=request.user_candidate_keys,
            relation_name=request.relation_name or "R",
            max_combinations=request.max_combinations or 1000,
        )
    except (CandidateKeyEngineError, ClosureEngineError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during candidate-key analysis: {str(e)}",
        )
