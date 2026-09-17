"""
FastAPI Route Handlers for Normalization Analysis (1NF through 4NF).

Endpoints:
- POST /api/v1/normalize/1nf: Evaluates First Normal Form (atomicity, repeating groups, sample data).
- POST /api/v1/normalize/2nf: Evaluates Second Normal Form (partial dependencies, candidate keys, prime attributes).
- POST /api/v1/normalize/3nf: Evaluates Third Normal Form (transitive dependencies, superkey determinants, prime exception).
- POST /api/v1/normalize/4nf: Evaluates Fourth Normal Form (multivalued dependencies, triviality, superkey determinants).
- POST /api/v1/normalize/analyze: Unified 1NF-4NF normalization analysis with stale-result protection.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.domain_contracts import (
    CanonicalSchemaInput,
    NF1Result,
    NF2Result,
    NF3Result,
    NF4Result,
    FullNormalizationAnalysisResult,
    BasicNormalizationAnalysisResult,
)
from app.normalization.normalization_engine import (
    analyze_1nf,
    analyze_2nf,
    analyze_3nf,
    analyze_4nf,
    analyze_full_normalization,
    analyze_basic_normalization,
    NormalizationEngineError,
)
from app.normalization.candidate_key_engine import CandidateKeyEngineError
from app.normalization.closure_engine import ClosureEngineError

router = APIRouter()


@router.post(
    "/1nf",
    response_model=NF1Result,
    status_code=status.HTTP_200_OK,
    summary="Evaluate First Normal Form (1NF)",
    description="Inspects cell atomicity across sample tuples and repeating groups in schema attributes.",
)
async def api_analyze_1nf(schema: CanonicalSchemaInput) -> NF1Result:
    try:
        return analyze_1nf(schema)
    except NormalizationEngineError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during 1NF analysis: {str(e)}",
        )


@router.post(
    "/2nf",
    response_model=NF2Result,
    status_code=status.HTTP_200_OK,
    summary="Evaluate Second Normal Form (2NF)",
    description="Evaluates composite candidate keys, detects partial dependencies on non-prime attributes, and proposes decomposition.",
)
async def api_analyze_2nf(schema: CanonicalSchemaInput) -> NF2Result:
    try:
        return analyze_2nf(schema)
    except (NormalizationEngineError, CandidateKeyEngineError, ClosureEngineError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during 2NF analysis: {str(e)}",
        )


@router.post(
    "/3nf",
    response_model=NF3Result,
    status_code=status.HTTP_200_OK,
    summary="Evaluate Third Normal Form (3NF)",
    description="Evaluates non-trivial functional dependencies against 3NF formal condition (superkey determinant OR prime dependent attribute) and derives transitive dependency reasoning.",
)
async def api_analyze_3nf(schema: CanonicalSchemaInput) -> NF3Result:
    try:
        return analyze_3nf(schema)
    except (NormalizationEngineError, CandidateKeyEngineError, ClosureEngineError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during 3NF analysis: {str(e)}",
        )


@router.post(
    "/4nf",
    response_model=NF4Result,
    status_code=status.HTTP_200_OK,
    summary="Evaluate Fourth Normal Form (4NF)",
    description="Evaluates multivalued dependencies (MVDs) for triviality and superkey determinants to eliminate independent multivalued fact redundancy.",
)
async def api_analyze_4nf(schema: CanonicalSchemaInput) -> NF4Result:
    try:
        return analyze_4nf(schema)
    except (NormalizationEngineError, CandidateKeyEngineError, ClosureEngineError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during 4NF analysis: {str(e)}",
        )


@router.post(
    "/analyze",
    response_model=FullNormalizationAnalysisResult,
    status_code=status.HTTP_200_OK,
    summary="Comprehensive 1NF - 4NF Normalization Analysis",
    description="Executes complete 1NF through 4NF normalization analysis, determines highest confirmed normal form respecting the hierarchy, and generates decomposition proposals.",
)
async def api_analyze_normalization(schema: CanonicalSchemaInput) -> FullNormalizationAnalysisResult:
    try:
        return analyze_full_normalization(schema)
    except (NormalizationEngineError, CandidateKeyEngineError, ClosureEngineError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during normalization analysis: {str(e)}",
        )
