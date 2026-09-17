"""
Domain models and DTOs for Practice Mode (Phase 9).
"""

from typing import List, Optional, Any, Literal
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.domain_contracts import FunctionalDependency, MultivaluedDependency


class PracticeExercise(BaseModel):
    """Academic normalization practice exercise."""
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., description="Unique exercise identifier")
    type: Literal["candidate-key", "closure", "highest-normal-form", "nf-violation", "mvd-analysis"] = Field(
        ..., description="Category of problem"
    )
    title: str = Field(..., description="Short exercise title")
    prompt: str = Field(..., description="Instructions for the student")
    schema_name: str = Field(default="R", description="Relation name")
    attributes: List[str] = Field(..., description="Relation attributes")
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list)
    multivalued_dependencies: List[MultivaluedDependency] = Field(default_factory=list)
    options: Optional[List[str]] = Field(default=None, description="Selectable options for multiple choice questions")
    hint: Optional[str] = Field(default=None, description="Pedagogical hint")
    target_attributes: Optional[List[str]] = Field(default=None, description="Target attributes if closure exercise")


class PracticeVerifyRequest(BaseModel):
    """Request payload for grading a student's practice exercise answer."""
    model_config = ConfigDict(populate_by_name=True)

    exercise_id: str = Field(..., description="Exercise ID")
    exercise_type: str = Field(..., description="Exercise type category")
    submitted_answer: Any = Field(..., description="Answer provided by student (string, list, etc.)")
    attributes: List[str] = Field(..., description="Relation attributes")
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list)
    multivalued_dependencies: List[MultivaluedDependency] = Field(default_factory=list)
    metadata: Optional[dict] = Field(default=None, description="Additional context such as target attributes")


class PracticeVerifyResponse(BaseModel):
    """Result of grading a student's practice exercise answer."""
    model_config = ConfigDict(populate_by_name=True)

    is_correct: bool = Field(..., description="True if student answer is mathematically correct")
    expected_answer: Any = Field(..., description="The mathematically rigorous answer from the engine")
    feedback: str = Field(..., description="Academic feedback explaining why the answer is correct or incorrect")
    reasoning_steps: List[str] = Field(default_factory=list, description="Step-by-step mathematical proof trace")
