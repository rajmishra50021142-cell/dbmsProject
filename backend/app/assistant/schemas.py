"""
Domain models and DTOs for the Contextual Normalization Assistant (Phase 9).
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.domain_contracts import FunctionalDependency, MultivaluedDependency


class AssistantContext(BaseModel):
    """Structured context extracted from the current active normalization analysis."""
    model_config = ConfigDict(populate_by_name=True)

    relation: str = Field(default="R", description="Relation name, e.g., ENROLLMENT")
    attributes: List[str] = Field(default_factory=list, description="All schema attributes")
    candidate_keys: List[List[str]] = Field(default_factory=list, description="Discovered or confirmed candidate keys")
    superkeys: List[List[str]] = Field(default_factory=list, description="Verified superkeys")
    prime_attributes: List[str] = Field(default_factory=list, description="Prime attributes")
    non_prime_attributes: List[str] = Field(default_factory=list, description="Non-prime attributes")
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list, description="Active FDs")
    multivalued_dependencies: List[MultivaluedDependency] = Field(default_factory=list, description="Active MVDs")
    normal_forms: Dict[str, str] = Field(
        default_factory=dict,
        description="Status of normal forms e.g. {'1NF': 'SATISFIED', '2NF': 'VIOLATED', ...}"
    )
    highest_confirmed_normal_form: Optional[str] = Field(default=None, description="Highest confirmed normal form")
    violations: List[Dict[str, Any]] = Field(default_factory=list, description="All detected violations across stages")
    decomposition_summary: Optional[Dict[str, Any]] = Field(default=None, description="Decomposition proposal if available")
    last_selected_dependency: Optional[str] = Field(default=None, description="Notation of recently selected FD or MVD")
    last_selected_violation: Optional[str] = Field(default=None, description="Recently selected violation id or trigger")
    last_selected_stage: Optional[str] = Field(default=None, description="Recently selected normal form stage (1NF, 2NF, 3NF, 4NF)")
    last_opened_closure: Optional[Dict[str, Any]] = Field(default=None, description="Recently inspected closure")


class AssistantAskRequest(BaseModel):
    """Payload for asking a question to the Normalization Assistant."""
    model_config = ConfigDict(populate_by_name=True)

    question: str = Field(..., min_length=1, description="The user's question")
    analysis_id: Optional[str] = Field(default=None, description="Optional identifier of the current analysis")
    context: Optional[AssistantContext] = Field(default=None, description="Client analysis context")


class AssistantAskResponse(BaseModel):
    """Response returned by the deterministic Normalization Assistant."""
    model_config = ConfigDict(populate_by_name=True)

    intent: str = Field(..., description="Classified question intent")
    answer: str = Field(..., description="Pedagogical, grounded explanation")
    evidence_ids: List[str] = Field(default_factory=list, description="IDs of matching evidence/violations/dependencies")
    suggested_actions: List[str] = Field(default_factory=list, description="Suggested UI actions (e.g. open_experiment, show_graph)")
    supported: bool = Field(default=True, description="True if question is within supported deterministic domain")
    learning_topic: Optional[str] = Field(default=None, description="Learning reference topic slug e.g. '2nf', 'candidate-keys'")
    context_used: Dict[str, Any] = Field(default_factory=dict, description="Summary of context properties consulted")
