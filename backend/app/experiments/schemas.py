"""
Domain models and DTOs for What-If / Experiment Mode (Phase 9).
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.domain_contracts import (
    CanonicalSchemaInput,
    FullNormalizationAnalysisResult,
    FunctionalDependency,
    MultivaluedDependency,
)


class ExperimentDiff(BaseModel):
    """Structured mathematical diff between original and modified schema/analysis."""
    model_config = ConfigDict(populate_by_name=True)

    attributes_added: List[str] = Field(default_factory=list)
    attributes_removed: List[str] = Field(default_factory=list)
    dependencies_added: List[Dict[str, Any]] = Field(default_factory=list)
    dependencies_removed: List[Dict[str, Any]] = Field(default_factory=list)
    mvds_added: List[Dict[str, Any]] = Field(default_factory=list)
    mvds_removed: List[Dict[str, Any]] = Field(default_factory=list)
    candidate_keys_added: List[List[str]] = Field(default_factory=list)
    candidate_keys_removed: List[List[str]] = Field(default_factory=list)
    prime_attributes_added: List[str] = Field(default_factory=list)
    prime_attributes_removed: List[str] = Field(default_factory=list)
    normal_forms_changed: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of changed stages with {stage, before, after}"
    )
    violations_added: List[Dict[str, Any]] = Field(default_factory=list)
    violations_removed: List[Dict[str, Any]] = Field(default_factory=list)
    highest_normal_form_before: str = Field(..., description="Original highest normal form")
    highest_normal_form_after: str = Field(..., description="Modified highest normal form")


class ExperimentAnalyzeRequest(BaseModel):
    """Payload for executing a What-If Experiment re-analysis."""
    model_config = ConfigDict(populate_by_name=True)

    original_input: CanonicalSchemaInput = Field(..., description="Immutable original schema input")
    modified_input: CanonicalSchemaInput = Field(..., description="Working copy modified schema input")


class ExperimentAnalyzeResponse(BaseModel):
    """Response containing original analysis, modified analysis, structured diff, and reasoning."""
    model_config = ConfigDict(populate_by_name=True)

    original_analysis: FullNormalizationAnalysisResult = Field(..., description="Full analysis of original schema")
    modified_analysis: FullNormalizationAnalysisResult = Field(..., description="Full analysis of modified schema")
    diff: ExperimentDiff = Field(..., description="Structured before-and-after comparison")
    reasoning_changes: List[str] = Field(
        default_factory=list,
        description="Step-by-step 'Why did it change?' pedagogical explanations"
    )
