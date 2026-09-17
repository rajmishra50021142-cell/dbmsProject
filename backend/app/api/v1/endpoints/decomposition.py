"""
FastAPI Route Handlers for Formal Decomposition, Lossless-Join & Dependency Preservation (Phase 7).

Endpoints:
- POST /api/v1/decomposition/verify-lossless: Tableau Chase & Fagin's Theorem verification.
- POST /api/v1/decomposition/verify-dependencies: Polynomial-time preservation analysis.
- POST /api/v1/decomposition/verify: Comprehensive lossless and preservation evaluation.
- POST /api/v1/decomposition/2nf: Formal 2NF decomposition eliminating partial dependencies.
- POST /api/v1/decomposition/3nf: Bernstein's 3NF synthesis using minimal cover.
- POST /api/v1/decomposition/4nf: 4NF binary/recursive decomposition on non-trivial MVDs.
- POST /api/v1/decomposition/minimal-cover: Canonical cover derivation for FD sets.
- POST /api/v1/decomposition/analyze: Unified multi-stage decomposition pipeline.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status
from app.schemas.domain_contracts import (
    FunctionalDependency,
    MultivaluedDependency,
    LosslessJoinResult,
    DependencyPreservationResult,
    MinimalCoverResult,
    DecompositionPlan,
    DecompositionVerificationRequest,
    DecompositionVerificationResult,
    DecompositionAnalyzeRequest,
    DecompositionAnalyzeResult,
)
from app.decomposition.minimal_cover import compute_minimal_cover
from app.decomposition.lossless_join import verify_lossless_join_chase, verify_lossless_join_mvd
from app.decomposition.dependency_preservation import (
    verify_dependency_preservation,
    project_functional_dependencies,
)
from app.decomposition.decomposition_engine import (
    decompose_2nf,
    decompose_3nf,
    decompose_4nf,
    verify_decomposition,
    analyze_decomposition_pipeline,
)

router = APIRouter()


from pydantic import BaseModel, Field, ConfigDict

class VerifyLosslessRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    attributes: List[str] = Field(..., min_length=1, description="Original relation attributes")
    functional_dependencies: List[FunctionalDependency] = Field(
        default_factory=list, alias="functionalDependencies", description="Original functional dependencies"
    )
    multivalued_dependencies: List[MultivaluedDependency] = Field(
        default_factory=list, alias="multivaluedDependencies", description="Original multivalued dependencies"
    )
    decomposed_relations: List[List[str]] = Field(
        ..., min_length=1, alias="decomposedRelations", description="List of sub-relation attribute lists"
    )
    relation_names: Optional[List[str]] = Field(
        default=None, alias="relationNames", description="Optional labels for decomposed relations"
    )


class VerifyDependenciesRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    attributes: List[str] = Field(..., min_length=1, description="Original relation attributes")
    functional_dependencies: List[FunctionalDependency] = Field(
        default_factory=list, alias="functionalDependencies", description="Original functional dependencies"
    )
    decomposed_relations: List[List[str]] = Field(
        ..., min_length=1, alias="decomposedRelations", description="List of sub-relation attribute lists"
    )
    relation_names: Optional[List[str]] = Field(
        default=None, alias="relationNames", description="Optional labels for decomposed relations"
    )


class DecomposeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    relation_name: Optional[str] = Field(default="R", alias="relationName", description="Source relation name")
    attributes: List[str] = Field(..., min_length=1, description="Source relation attributes")
    functional_dependencies: List[FunctionalDependency] = Field(
        default_factory=list, alias="functionalDependencies", description="Functional dependencies"
    )
    multivalued_dependencies: List[MultivaluedDependency] = Field(
        default_factory=list, alias="multivaluedDependencies", description="Multivalued dependencies"
    )
    candidate_keys: Optional[List[List[str]]] = Field(
        default=None, alias="candidateKeys", description="Known candidate keys"
    )


class MinimalCoverRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    attributes: List[str] = Field(..., min_length=1, description="Relation attributes")
    functional_dependencies: List[FunctionalDependency] = Field(
        ..., alias="functionalDependencies", description="Functional dependencies to minimize"
    )
    relation_name: Optional[str] = Field(default="R", alias="relationName", description="Relation identifier")



@router.post(
    "/verify-lossless",
    response_model=LosslessJoinResult,
    status_code=status.HTTP_200_OK,
    summary="Verify Lossless Join",
    description="Formally verifies lossless join property using Tableau Chase (for FDs) or Fagin's Theorem (for MVDs).",
)
async def api_verify_lossless(req: VerifyLosslessRequest) -> LosslessJoinResult:
    try:
        if req.multivalued_dependencies and len(req.decomposed_relations) == 2:
            res = verify_lossless_join_mvd(
                attributes=req.attributes,
                mvds=req.multivalued_dependencies,
                decomposed_relations=req.decomposed_relations,
                relation_names=req.relation_names,
            )
            if res.is_lossless or not req.functional_dependencies:
                return res

        return verify_lossless_join_chase(
            attributes=req.attributes,
            fds=req.functional_dependencies,
            decomposed_relations=req.decomposed_relations,
            relation_names=req.relation_names,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error verifying lossless join: {str(e)}",
        )


@router.post(
    "/verify-dependencies",
    response_model=DependencyPreservationResult,
    status_code=status.HTTP_200_OK,
    summary="Verify Dependency Preservation",
    description="Formally verifies whether all functional dependencies are preserved without requiring joins.",
)
async def api_verify_dependencies(req: VerifyDependenciesRequest) -> DependencyPreservationResult:
    try:
        return verify_dependency_preservation(
            original_attrs=req.attributes,
            original_fds=req.functional_dependencies,
            decomposed_relations=req.decomposed_relations,
            relation_names=req.relation_names,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error verifying dependency preservation: {str(e)}",
        )


@router.post(
    "/verify",
    response_model=DecompositionVerificationResult,
    status_code=status.HTTP_200_OK,
    summary="Comprehensive Decomposition Verification",
    description="Evaluates both Lossless Join (Tableau Chase) and Dependency Preservation for proposed relations.",
)
async def api_verify(req: DecompositionVerificationRequest) -> DecompositionVerificationResult:
    try:
        return verify_decomposition(
            relation_name=req.relation_name or "R",
            attributes=req.attributes,
            fds=req.functional_dependencies,
            mvds=req.multivalued_dependencies,
            decomposed_relations=req.decomposed_relations,
            candidate_keys=req.candidate_keys,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during decomposition verification: {str(e)}",
        )


@router.post(
    "/2nf",
    response_model=DecompositionPlan,
    status_code=status.HTTP_200_OK,
    summary="Formal 2NF Decomposition",
    description="Decomposes relation to 2NF by isolating partial dependencies and verifies properties.",
)
async def api_decompose_2nf(req: DecomposeRequest) -> DecompositionPlan:
    try:
        return decompose_2nf(
            relation_name=req.relation_name or "R",
            attributes=req.attributes,
            fds=req.functional_dependencies,
            candidate_keys=req.candidate_keys,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error during 2NF decomposition: {str(e)}",
        )


@router.post(
    "/3nf",
    response_model=DecompositionPlan,
    status_code=status.HTTP_200_OK,
    summary="Formal 3NF Synthesis",
    description="Synthesizes 3NF sub-relations using Bernstein's Synthesis with minimal cover and candidate key retention.",
)
async def api_decompose_3nf(req: DecomposeRequest) -> DecompositionPlan:
    try:
        plan, _ = decompose_3nf(
            relation_name=req.relation_name or "R",
            attributes=req.attributes,
            fds=req.functional_dependencies,
            candidate_keys=req.candidate_keys,
        )
        return plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error during 3NF synthesis: {str(e)}",
        )


@router.post(
    "/4nf",
    response_model=DecompositionPlan,
    status_code=status.HTTP_200_OK,
    summary="Formal 4NF Decomposition",
    description="Decomposes relation to resolve non-trivial multivalued dependency violations.",
)
async def api_decompose_4nf(req: DecomposeRequest) -> DecompositionPlan:
    try:
        return decompose_4nf(
            relation_name=req.relation_name or "R",
            attributes=req.attributes,
            fds=req.functional_dependencies,
            mvds=req.multivalued_dependencies,
            candidate_keys=req.candidate_keys,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error during 4NF decomposition: {str(e)}",
        )


@router.post(
    "/minimal-cover",
    response_model=MinimalCoverResult,
    status_code=status.HTTP_200_OK,
    summary="Canonical Minimal Cover",
    description="Calculates the minimal cover for a set of functional dependencies.",
)
async def api_minimal_cover(req: MinimalCoverRequest) -> MinimalCoverResult:
    try:
        return compute_minimal_cover(
            fds=req.functional_dependencies,
            all_attributes=req.attributes,
            relation_name=req.relation_name or "R",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error calculating minimal cover: {str(e)}",
        )


@router.post(
    "/analyze",
    response_model=DecompositionAnalyzeResult,
    status_code=status.HTTP_200_OK,
    summary="Unified Decomposition Pipeline",
    description="Performs complete decomposition pipeline to target normal form with formal verification.",
)
async def api_analyze_decomposition(req: DecompositionAnalyzeRequest) -> DecompositionAnalyzeResult:
    try:
        return analyze_decomposition_pipeline(
            relation_name=req.relation_name or "R",
            attributes=req.attributes,
            fds=req.functional_dependencies,
            mvds=req.multivalued_dependencies,
            target_normal_form=req.target_normal_form,
            candidate_keys=req.candidate_keys,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during decomposition analysis: {str(e)}",
        )
