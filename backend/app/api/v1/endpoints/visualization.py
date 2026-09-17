"""
Visualization API Endpoints (Phase 8).

Exposes endpoints for generating deterministic graph layouts, closure playback
timelines, and decomposition lineage trees.
"""

from typing import List, Dict, Optional, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.domain_contracts import (
    FunctionalDependency,
    MultivaluedDependency,
    VisualizationGraphData,
    ClosureVisualizationData,
    DecompositionTreeNode,
    DecompositionPlan,
)
from app.normalization.closure_engine import compute_attribute_closure
from app.visualization.layout_engine import (
    build_dependency_graph,
    build_closure_visualization,
    build_decomposition_tree,
)

router = APIRouter(prefix="/visualization", tags=["Visualization Engine"])


class GraphLayoutRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    relation_name: Optional[str] = Field(default="R", alias="relationName")
    attributes: List[str] = Field(..., min_length=1)
    functional_dependencies: List[FunctionalDependency] = Field(
        default_factory=list, alias="functionalDependencies"
    )
    multivalued_dependencies: List[MultivaluedDependency] = Field(
        default_factory=list, alias="multivaluedDependencies"
    )
    candidate_keys: List[List[str]] = Field(default_factory=list, alias="candidateKeys")
    prime_attributes: List[str] = Field(default_factory=list, alias="primeAttributes")
    violations: Optional[Dict[str, Any]] = Field(default_factory=dict)


class ClosurePlayerRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    attributes: List[str] = Field(..., min_length=1)
    functional_dependencies: List[FunctionalDependency] = Field(
        default_factory=list, alias="functionalDependencies"
    )
    target_attributes: List[str] = Field(..., min_length=1, alias="targetAttributes")


class DecompositionTreeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    source_relation: str = Field(default="R", alias="sourceRelation")
    source_attributes: List[str] = Field(..., min_length=1, alias="sourceAttributes")
    candidate_keys: List[List[str]] = Field(default_factory=list, alias="candidateKeys")
    plans: List[DecompositionPlan] = Field(default_factory=list)


@router.post(
    "/graph",
    response_model=VisualizationGraphData,
    summary="Compute 2D graph layout for relational dependencies",
)
async def get_dependency_graph_layout(req: GraphLayoutRequest) -> VisualizationGraphData:
    try:
        return build_dependency_graph(
            relation_name=req.relation_name or "R",
            attributes=req.attributes,
            fds=req.functional_dependencies,
            mvds=req.multivalued_dependencies,
            candidate_keys=req.candidate_keys,
            prime_attributes=req.prime_attributes,
            violations=req.violations,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate dependency graph: {str(e)}",
        )


@router.post(
    "/closure-player",
    response_model=ClosureVisualizationData,
    summary="Generate step-by-step playback data for attribute closure",
)
async def get_closure_player_data(req: ClosurePlayerRequest) -> ClosureVisualizationData:
    try:
        closure_result = compute_attribute_closure(
            attributes=req.attributes,
            fds=req.functional_dependencies,
            target_attributes=req.target_attributes,
        )
        return build_closure_visualization(
            target_attributes=req.target_attributes,
            closure_result=closure_result,
            universal_attributes=req.attributes,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to compute closure visualization: {str(e)}",
        )


@router.post(
    "/decomposition-tree",
    response_model=List[DecompositionTreeNode],
    summary="Generate hierarchical tree model for decomposition lineage",
)
async def get_decomposition_tree(req: DecompositionTreeRequest) -> List[DecompositionTreeNode]:
    try:
        return build_decomposition_tree(
            source_relation=req.source_relation,
            source_attributes=req.source_attributes,
            candidate_keys=req.candidate_keys,
            plans=req.plans,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate decomposition tree: {str(e)}",
        )
