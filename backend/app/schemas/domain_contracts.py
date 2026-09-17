"""
Domain Contracts & Data Transfer Objects (DTOs) for Normalization Lab.

These models define the architectural contracts for all future phases (Phases 2 through 12).
They guarantee that input validation, normalization reasoning, decomposition, and visualization
share a unified, structured representation without coupling domain logic to the FastAPI routes
or frontend UI.
"""

from typing import List, Dict, Optional, Any, Literal
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict, AliasChoices, computed_field


class NormalForm(str, Enum):
    UNNORMALIZED = "UNNORMALIZED"
    ONE_NF = "1NF"
    TWO_NF = "2NF"
    THREE_NF = "3NF"
    FOUR_NF = "4NF"


class FunctionalDependency(BaseModel):
    """Represents X -> Y where X (left) functionally determines Y (right)."""
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, description="Client or server identifier for UI tracking")
    left: List[str] = Field(..., validation_alias=AliasChoices("left", "lhs"), min_length=1, description="Determinant attributes (LHS)")
    right: List[str] = Field(..., validation_alias=AliasChoices("right", "rhs"), min_length=1, description="Dependent attributes (RHS)")

    @computed_field
    @property
    def lhs(self) -> List[str]:
        return self.left

    @computed_field
    @property
    def rhs(self) -> List[str]:
        return self.right

    def notation(self) -> str:
        return f"{', '.join(self.left)} → {', '.join(self.right)}"


class MultivaluedDependency(BaseModel):
    """Represents X ->> Y where X multidetermines Y independently of other attributes."""
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, description="Client or server identifier for UI tracking")
    left: List[str] = Field(..., validation_alias=AliasChoices("left", "lhs"), min_length=1, description="Determinant attributes (LHS)")
    right: List[str] = Field(..., validation_alias=AliasChoices("right", "rhs"), min_length=1, description="Multivalued dependent attributes (RHS)")

    @computed_field
    @property
    def lhs(self) -> List[str]:
        return self.left

    @computed_field
    @property
    def rhs(self) -> List[str]:
        return self.right

    def notation(self) -> str:
        return f"{', '.join(self.left)} ↠ {', '.join(self.right)}"


class SampleTuple(BaseModel):
    """Optional data tuple to support 1NF atomicity verification and visual examples."""
    values: Dict[str, Any] = Field(default_factory=dict, description="Attribute name to cell value mapping")


class CanonicalSchemaInput(BaseModel):
    """
    The canonical schema representation produced by both Guided Mode and Raw Mode.
    Consumed by all downstream engines (Phases 3 through 7).
    """
    name: str = Field(default="R", description="Relation name, e.g., ENROLLMENT")
    attributes: List[str] = Field(default_factory=list, description="List of unique attribute names in display order")
    candidate_keys: List[List[str]] = Field(
        default_factory=list,
        description="User-supplied candidate keys. Empty list if none supplied (engine auto-finds in Phase 4)."
    )
    functional_dependencies: List[FunctionalDependency] = Field(
        default_factory=list,
        description="List of functional dependencies"
    )
    multivalued_dependencies: List[MultivaluedDependency] = Field(
        default_factory=list,
        description="List of multivalued dependencies for 4NF analysis"
    )
    sample_data: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Optional sample rows for atomicity and data demonstration"
    )

    def to_signature(self) -> str:
        attrs = ", ".join(self.attributes)
        return f"{self.name}({attrs})"


# Alias RelationInput to CanonicalSchemaInput for backwards compatibility
RelationInput = CanonicalSchemaInput


class ValidationIssue(BaseModel):
    """Structured validation finding with precise location, severity, and actionable message."""
    code: str = Field(..., description="Machine-readable issue code, e.g. UNKNOWN_ATTRIBUTE")
    path: str = Field(..., description="Path to invalid property, e.g. functional_dependencies[0].right")
    message: str = Field(..., description="Actionable, educational explanation for the student")
    severity: Literal["error", "warning"] = Field(default="error", description="Blocking error or non-blocking warning")


class ValidationSummary(BaseModel):
    """High-level readiness overview for the Analyzer workspace."""
    relation_name: str
    attribute_count: int
    candidate_key_count: int
    fd_count: int
    mvd_count: int
    sample_row_count: int
    is_ready_for_analysis: bool


class ValidationResult(BaseModel):
    """Authoritative response returned by POST /api/v1/schema/validate."""
    valid: bool = Field(..., description="True if there are zero blocking errors")
    errors: List[ValidationIssue] = Field(default_factory=list, description="Blocking issues preventing analysis")
    warnings: List[ValidationIssue] = Field(default_factory=list, description="Non-blocking educational notices")
    canonical_input: Optional[CanonicalSchemaInput] = Field(
        default=None,
        description="Normalized, sanitized canonical model"
    )
    summary: Optional[ValidationSummary] = Field(default=None, description="Overview of validated schema components")


class RawParseRequest(BaseModel):
    """Request payload for raw notation parsing."""
    raw_text: str = Field(..., description="Raw relational text notation entered by the student")


# --- Future Normalization Engine Result Contracts (Phases 3 - 7) ---

class Violation(BaseModel):
    """Details of a specific normal form violation."""
    normal_form: NormalForm
    violating_element: str = Field(..., description="The specific FD, MVD, or attribute violating the normal form")
    reason: str = Field(..., description="Academic explanation of why the requirement failed")
    remedy: Optional[str] = Field(default=None, description="Suggested decomposition or fix")


class ReasoningStep(BaseModel):
    """Step-by-step reasoning record for educational display and report generation."""
    step_number: int
    stage: NormalForm
    title: str
    explanation: str
    intermediate_data: Optional[Dict[str, Any]] = None


class DecomposedRelation(BaseModel):
    """Resulting relation after decomposition to satisfy a normal form."""
    model_config = ConfigDict(populate_by_name=True)

    name: str
    attributes: List[str]
    candidate_keys: List[List[str]] = Field(default_factory=list)
    primary_key: List[str] = Field(default_factory=list)
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list)
    projected_fds: List[FunctionalDependency] = Field(default_factory=list)
    projected_mvds: List[MultivaluedDependency] = Field(default_factory=list)
    purpose: str = Field(default="", description="Educational rationale for creating this relation")
    source_relation: str = Field(default="", description="Parent relation name before split")



class StageAnalysis(BaseModel):
    """Analysis result for a specific normal form stage (1NF, 2NF, 3NF, or 4NF)."""
    normal_form: NormalForm
    is_satisfied: bool
    violations: List[Violation] = Field(default_factory=list)
    explanation: str
    reasoning_steps: List[ReasoningStep] = Field(default_factory=list)
    decompositions: List[DecomposedRelation] = Field(default_factory=list)


class AnalysisResult(BaseModel):
    """
    Comprehensive structured response for a normalization analysis.
    This contract rejects simple boolean results in favor of rich academic explanations.
    """
    input_relation: CanonicalSchemaInput
    derived_candidate_keys: List[List[str]] = Field(default_factory=list)
    prime_attributes: List[str] = Field(default_factory=list)
    non_prime_attributes: List[str] = Field(default_factory=list)
    highest_normal_form: NormalForm
    stages: Dict[str, StageAnalysis] = Field(default_factory=dict)
    summary: str
    is_lossless: Optional[bool] = None
    is_dependency_preserving: Optional[bool] = None


# --- Phase 3: Attribute Closure & FD Engine Contracts ---

class ClosureStep(BaseModel):
    """A discrete, explainable step in the attribute closure calculation."""
    step_number: int = Field(..., description="1-indexed sequence number")
    before_attributes: List[str] = Field(..., description="Attributes in closure before this step")
    applied_fd: Optional[FunctionalDependency] = Field(default=None, description="The FD that fired, or None for initial step")
    added_attributes: List[str] = Field(default_factory=list, description="New attributes added by this FD")
    after_attributes: List[str] = Field(..., description="Attributes in closure after this step")
    explanation: str = Field(..., description="Deterministic educational explanation of why this step occurred")


class ClosureResult(BaseModel):
    """Authoritative result of an attribute closure computation X+."""
    relation_name: str = Field(default="R", description="Relation identifier")
    input_attributes: List[str] = Field(..., description="Starting attribute set X")
    closure_attributes: List[str] = Field(..., description="Final computed closure set X+")
    steps: List[ClosureStep] = Field(default_factory=list, description="Ordered step-by-step reasoning trace")
    iterations: int = Field(..., description="Number of passes over F before fixed point reached")
    applied_fds: List[FunctionalDependency] = Field(default_factory=list, description="List of FDs that contributed to the closure")
    fixed_point_reached: bool = Field(default=True, description="True if closure expansion stabilized")
    is_superkey: bool = Field(default=False, description="True if closure contains all relation attributes")
    superkey_reason: str = Field(..., description="Academic explanation of superkey status vs candidate-key minimality")

    @property
    def closure(self) -> List[str]:
        return self.closure_attributes


class ClosureRequest(BaseModel):
    """Payload for requesting an attribute closure computation."""
    relation_name: Optional[str] = Field(default="R", description="Relation name")
    attributes: List[str] = Field(..., min_length=1, description="All attributes in relation R")
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list, description="Set of functional dependencies F")
    target_attributes: List[str] = Field(..., min_length=1, description="Starting attribute set X to close")


class DeterminationRequest(BaseModel):
    """Payload for querying whether X -> Y is logically implied by F."""
    relation_name: Optional[str] = Field(default="R", description="Relation name")
    attributes: List[str] = Field(..., min_length=1, description="All attributes in relation R")
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list, description="Set of functional dependencies F")
    lhs: List[str] = Field(..., min_length=1, description="Determinant attribute set X")
    rhs: List[str] = Field(..., min_length=1, description="Dependent attribute set Y to test")


class DeterminationResult(BaseModel):
    """Result of an FD implication query X -> Y."""
    determined: bool = Field(..., description="True if Y is a subset of X+")
    lhs: List[str] = Field(..., description="Determinant attribute set X")
    rhs: List[str] = Field(..., description="Dependent attribute set Y")
    lhs_closure: List[str] = Field(..., description="Computed closure X+")
    missing_attributes: List[str] = Field(default_factory=list, description="Attributes in Y not determined by X+")
    explanation: str = Field(..., description="Academic explanation with closure evidence")
    closure_result: ClosureResult = Field(..., description="Underlying closure trace for X+")


class TrivialFDCheckRequest(BaseModel):
    """Payload for testing syntactic triviality of a functional dependency."""
    functional_dependency: FunctionalDependency


class TrivialFDCheckResult(BaseModel):
    """Result of checking whether an FD is trivial according to Armstrong's Reflexivity Axiom."""
    is_trivial: bool = Field(..., description="True if any dependent attribute is in determinant")
    is_completely_trivial: bool = Field(..., description="True if Y is a subset of X")
    trivial_attributes: List[str] = Field(default_factory=list, description="Attributes appearing in both LHS and RHS")
    non_trivial_attributes: List[str] = Field(default_factory=list, description="Attributes appearing only in RHS")
    explanation: str = Field(..., description="Educational explanation referencing Armstrong's axioms")


# --- Phase 4: Candidate-Key Engine, Superkeys & Prime/Non-Prime Contracts ---

class SuperkeyCheckRequest(BaseModel):
    """Payload for verifying if an attribute set is a superkey of relation R."""
    relation_name: Optional[str] = Field(default="R", description="Relation name")
    attributes: List[str] = Field(..., min_length=1, description="All attributes in relation R")
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list, description="Set of functional dependencies F")
    target_attributes: List[str] = Field(..., min_length=1, description="Attribute set to test")


class SuperkeyCheckResult(BaseModel):
    """Result of testing whether an attribute set is a superkey."""
    target_attributes: List[str] = Field(..., description="Attribute set tested")
    is_superkey: bool = Field(..., description="True if closure contains all relation attributes")
    closure: List[str] = Field(..., description="Computed closure of target attributes")
    missing_attributes: List[str] = Field(default_factory=list, description="Attributes in R not covered by closure")
    explanation: str = Field(..., description="Academic explanation with closure evidence")


class MinimalityCheck(BaseModel):
    """Result of testing a proper subset during candidate-key minimality evaluation."""
    subset: List[str] = Field(..., description="Proper subset evaluated")
    subset_closure: List[str] = Field(..., description="Closure of the proper subset")
    is_superkey: bool = Field(..., description="True if the proper subset is itself a superkey")
    explanation: str = Field(..., description="Educational note on minimality impact")


class KeyVerificationRequest(BaseModel):
    """Payload for validating a proposed candidate key."""
    relation_name: Optional[str] = Field(default="R", description="Relation name")
    attributes: List[str] = Field(..., min_length=1, description="All attributes in relation R")
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list, description="Set of functional dependencies F")
    candidate_key: List[str] = Field(..., min_length=1, description="Proposed candidate key attribute set")


class KeyVerificationResult(BaseModel):
    """Complete verification result for a user-provided or candidate key."""
    candidate_key: List[str] = Field(..., description="Attribute set evaluated")
    is_superkey: bool = Field(..., description="True if K+ = R")
    is_minimal: bool = Field(..., description="True if no proper subset is a superkey")
    is_candidate_key: bool = Field(..., description="True if both is_superkey and is_minimal are true")
    closure: List[str] = Field(..., description="Closure of candidate key")
    missing_attributes: List[str] = Field(default_factory=list, description="Attributes missing from closure if not superkey")
    violating_subset: Optional[List[str]] = Field(default=None, description="A proper subset that is already a superkey, proving non-minimality")
    minimality_checks: List[MinimalityCheck] = Field(default_factory=list, description="Details of tested proper subsets")
    explanation: str = Field(..., description="Detailed academic explanation")


class KeyReasoningStep(BaseModel):
    """Discrete step in the automatic candidate-key derivation trace."""
    step_number: int = Field(..., description="1-indexed sequence number")
    title: str = Field(..., description="Short title of this analysis phase")
    description: str = Field(..., description="Academic explanation of reasoning and mathematical results")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Intermediate structured data")


class KeyDiscoveryRequest(BaseModel):
    """Payload for requesting automatic candidate-key derivation."""
    relation_name: Optional[str] = Field(default="R", description="Relation name")
    attributes: List[str] = Field(..., min_length=1, description="All attributes in relation R")
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list, description="Set of functional dependencies F")
    max_combinations: Optional[int] = Field(default=1000, description="Safety limit for exponential search space")


class KeyDiscoveryResult(BaseModel):
    """Authoritative result of candidate-key discovery and prime/non-prime classification."""
    relation_name: str = Field(default="R", description="Relation name")
    candidate_keys: List[List[str]] = Field(..., description="List of all minimal superkeys discovered")
    prime_attributes: List[str] = Field(default_factory=list, description="Attributes present in at least one candidate key")
    non_prime_attributes: List[str] = Field(default_factory=list, description="Attributes not present in any candidate key")
    essential_attributes: List[str] = Field(default_factory=list, description="Attributes appearing only on LHS or in neither side")
    explored_combinations_count: int = Field(..., description="Number of attribute combinations examined")
    reasoning_steps: List[KeyReasoningStep] = Field(default_factory=list, description="Step-by-step discovery explanation")
    warnings: List[str] = Field(default_factory=list, description="Any search limit warnings or pedagogical advisories")


class CandidateKeyAnalysisRequest(BaseModel):
    """Comprehensive request combining automatic discovery and verification of user-provided keys."""
    relation_name: Optional[str] = Field(default="R", description="Relation name")
    attributes: List[str] = Field(..., min_length=1, description="All attributes in relation R")
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list, description="Set of functional dependencies F")
    user_candidate_keys: Optional[List[List[str]]] = Field(default=None, description="Optional candidate keys provided by student to verify")
    max_combinations: Optional[int] = Field(default=1000, description="Safety limit for search space")


class CandidateKeyAnalysisResult(BaseModel):
    """Comprehensive response for the Candidate Key Laboratory workspace."""
    relation_name: str = Field(default="R", description="Relation name")
    discovered_candidate_keys: List[List[str]] = Field(..., description="All minimal superkeys discovered")
    prime_attributes: List[str] = Field(default_factory=list, description="Prime attributes")
    non_prime_attributes: List[str] = Field(default_factory=list, description="Non-prime attributes")
    essential_attributes: List[str] = Field(default_factory=list, description="Attributes that must appear in every key")
    user_key_verifications: List[KeyVerificationResult] = Field(default_factory=list, description="Verification of user-entered candidate keys")
    reasoning_steps: List[KeyReasoningStep] = Field(default_factory=list, description="Step-by-step discovery explanation")
    warnings: List[str] = Field(default_factory=list, description="Search limits or pedagogical advisories")


# =====================================================================
# Phase 5: Normalization Analysis Contracts (1NF & 2NF)
# =====================================================================

class NFStatus(str, Enum):
    """Universal status classification for each normal form stage."""
    SATISFIED = "SATISFIED"
    VIOLATED = "VIOLATED"
    BLOCKED_BY_PREREQUISITE = "BLOCKED_BY_PREREQUISITE"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class NF1Violation(BaseModel):
    """Specific 1NF violation observed in data or repeating attributes."""
    attribute: str = Field(..., description="Offending attribute name")
    row_index: Optional[int] = Field(default=None, description="0-indexed sample tuple row number where violation occurred")
    observed_value: Any = Field(..., description="Observed multi-valued or non-atomic cell representation")
    reason_code: str = Field(..., description="Machine-readable violation reason code")
    explanation: str = Field(..., description="Human-readable academic explanation")


class NF1Transformation(BaseModel):
    """Conceptual 1NF unnested representation derived from sample tuples."""
    original_tuples: List[Dict[str, Any]] = Field(default_factory=list, description="Original user-provided sample tuples")
    transformed_tuples: List[Dict[str, Any]] = Field(default_factory=list, description="Conceptual unnested 1NF tuples")
    explanation: str = Field(..., description="Transformation explanation")


class NF1Result(BaseModel):
    """First Normal Form (1NF) analysis result."""
    status: NFStatus = Field(..., description="1NF status (SATISFIED, VIOLATED, or INSUFFICIENT_DATA)")
    is_satisfied: bool = Field(..., description="True only if status is SATISFIED")
    reason_code: str = Field(..., description="Machine-readable summary reason code")
    message: str = Field(..., description="Educational explanation of 1NF evaluation")
    violations: List[NF1Violation] = Field(default_factory=list, description="List of observed 1NF violations")
    attributes_involved: List[str] = Field(default_factory=list, description="Attribute names involved in violations")
    sample_cells_involved: List[Dict[str, Any]] = Field(default_factory=list, description="Cell references involved")
    reasoning_steps: List[str] = Field(default_factory=list, description="Sequential steps in 1NF assessment")
    transformation: Optional[NF1Transformation] = Field(default=None, description="Conceptual 1NF transformation preview if violated")
    limitations: List[str] = Field(default_factory=list, description="Explicit limitations (e.g. absent sample tuples)")


class PartialDependency(BaseModel):
    """Represents a 2NF partial dependency X -> A where X ⊂ K (composite candidate key) and A is non-prime."""
    determinant: List[str] = Field(..., description="Proper subset of candidate key acting as determinant (LHS)")
    dependent_attributes: List[str] = Field(..., description="Non-prime attributes determined by determinant (RHS)")
    affected_candidate_key: List[str] = Field(..., description="Composite candidate key from which determinant is a proper subset")
    is_implied: bool = Field(default=False, description="True if implied via closure rather than explicitly written in F")
    source_fd: Optional[str] = Field(default=None, description="String notation of source FD or implied closure derivation")
    explanation: str = Field(..., description="Pedagogical explanation of why this dependency violates 2NF")


class ProposedRelation(BaseModel):
    """Sub-relation in a 2NF decomposition proposal."""
    name: str = Field(..., description="Proposed relation name, e.g. STUDENT or ENROLLMENT_DETAIL")
    attributes: List[str] = Field(..., description="Attributes assigned to this proposed sub-relation")
    primary_key: List[str] = Field(..., description="Recommended primary key for this sub-relation")
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list, description="Dependencies assigned to this sub-relation")
    purpose: str = Field(..., description="Educational rationale for creating this relation")


class DecompositionProposal(BaseModel):
    """Structured decomposition plan to resolve 2NF violations."""
    source_relation: str = Field(..., description="Name of original unnormalized relation")
    proposed_relations: List[ProposedRelation] = Field(..., description="Set of proposed sub-relations")
    reason_code: str = Field(..., description="Decomposition intent code, e.g. DECOMPOSE_PARTIAL_DEPENDENCIES")
    explanation: str = Field(..., description="Academic explanation of the decomposition strategy")
    verification_status: Literal["NOT_YET_VERIFIED", "VERIFIED_LOSSLESS", "VERIFIED_PRESERVING", "VERIFIED_BOTH", "FAILED_VERIFICATION"] = Field(
        default="NOT_YET_VERIFIED",
        description="Verification state. Phase 5 proposes only; formal verification occurs in Phase 7."
    )
    lossless_join: Optional[Any] = Field(default=None, description="Formal lossless join verification result (Phase 7)")
    dependency_preservation: Optional[Any] = Field(default=None, description="Formal dependency preservation result (Phase 7)")


class NF2Result(BaseModel):
    """Second Normal Form (2NF) analysis result."""
    status: NFStatus = Field(..., description="2NF status (SATISFIED, VIOLATED, or BLOCKED_BY_PREREQUISITE)")
    is_satisfied: bool = Field(..., description="True only if status is SATISFIED")
    reason_code: str = Field(..., description="Machine-readable summary reason code")
    message: str = Field(..., description="Educational explanation of 2NF evaluation")
    prerequisite_1nf_status: NFStatus = Field(..., description="Status of the 1NF prerequisite")
    candidate_keys: List[List[str]] = Field(default_factory=list, description="Candidate keys from Phase 4")
    composite_keys: List[List[str]] = Field(default_factory=list, description="Composite candidate keys evaluated")
    prime_attributes: List[str] = Field(default_factory=list, description="Prime attributes from Phase 4")
    non_prime_attributes: List[str] = Field(default_factory=list, description="Non-prime attributes from Phase 4")
    partial_dependencies: List[PartialDependency] = Field(default_factory=list, description="All partial dependencies detected")
    reasoning_steps: List[KeyReasoningStep] = Field(default_factory=list, description="Step-by-step reasoning trace")
    decomposition_proposal: Optional[DecompositionProposal] = Field(default=None, description="Proposed 2NF decomposition relations")
    limitations: List[str] = Field(default_factory=list, description="Explicit analysis limitations and caveats")


class BasicNormalizationAnalysisRequest(BaseModel):
    """Request payload for 1NF & 2NF normalization analysis."""
    relation_name: Optional[str] = Field(default="R", description="Relation name, e.g. ENROLLMENT")
    attributes: List[str] = Field(..., min_length=1, description="Relation attribute set")
    candidate_keys: Optional[List[List[str]]] = Field(default=None, description="Optional user-supplied candidate keys")
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list, description="Functional dependencies")
    multivalued_dependencies: List[MultivaluedDependency] = Field(default_factory=list, description="MVDs preserved for Phase 6")
    sample_data: Optional[List[SampleTuple]] = Field(default=None, description="Optional sample tuples for 1NF atomicity check")


class BasicNormalizationAnalysisResult(BaseModel):
    """Combined 1NF & 2NF normalization analysis result for the Normalization Lab."""
    relation_name: str = Field(..., description="Relation name")
    attributes: List[str] = Field(..., description="Attributes of the relation")
    input_fingerprint: str = Field(..., description="Deterministic hash of input schema to track staleness")
    nf1: NF1Result = Field(..., description="1NF analysis result")
    nf2: NF2Result = Field(..., description="2NF analysis result")
    candidate_keys: List[List[str]] = Field(default_factory=list, description="Candidate keys of the relation")
    prime_attributes: List[str] = Field(default_factory=list, description="Prime attributes")
    non_prime_attributes: List[str] = Field(default_factory=list, description="Non-prime attributes")
    summary_verdict: str = Field(..., description="High-level pedagogical verdict across 1NF and 2NF")


# =====================================================================
# Phase 6: Advanced Normalization Contracts (3NF & 4NF)
# =====================================================================

class NF3Violation(BaseModel):
    """Specific 3NF violation for a non-trivial FD X -> Y where X is not superkey and RHS has non-prime attribute."""
    functional_dependency: FunctionalDependency = Field(..., description="Offending functional dependency")
    determinant: List[str] = Field(..., description="Determinant attributes (X)")
    dependent_attributes: List[str] = Field(..., description="Non-prime RHS attributes causing the violation")
    determinant_is_superkey: bool = Field(default=False, description="Superkey status of determinant (False for violations)")
    dependent_attribute_prime_status: Dict[str, bool] = Field(default_factory=dict, description="Prime status map of RHS attributes")
    reason_code: str = Field(..., description="Machine-readable violation reason code")
    transitive_chain: Optional[List[str]] = Field(default=None, description="Optional pedagogical transitive chain K -> X -> A")
    explanation: str = Field(..., description="Human-readable academic explanation")


class NF3DependencyAnalysis(BaseModel):
    """Evaluation breakdown for an individual functional dependency under 3NF rules."""
    functional_dependency: FunctionalDependency
    is_trivial: bool
    determinant_is_superkey: bool
    rhs_prime_status: Dict[str, bool]
    satisfies_3nf: bool
    reason_code: str
    explanation: str


class NF3Result(BaseModel):
    """Third Normal Form (3NF) analysis result."""
    status: NFStatus = Field(..., description="3NF status (SATISFIED, VIOLATED, or BLOCKED_BY_PREREQUISITE)")
    is_satisfied: bool = Field(..., description="True only if status is SATISFIED")
    reason_code: str = Field(..., description="Machine-readable summary reason code")
    message: str = Field(..., description="Educational explanation of 3NF evaluation")
    prerequisite_2nf_status: NFStatus = Field(..., description="Status of the 2NF prerequisite")
    candidate_keys: List[List[str]] = Field(default_factory=list, description="Verified candidate keys from Phase 4")
    prime_attributes: List[str] = Field(default_factory=list, description="Prime attributes")
    non_prime_attributes: List[str] = Field(default_factory=list, description="Non-prime attributes")
    dependencies_analyzed: List[NF3DependencyAnalysis] = Field(default_factory=list, description="Analysis of each FD")
    trivial_dependencies: List[FunctionalDependency] = Field(default_factory=list, description="Trivial dependencies (vacuously satisfied)")
    satisfied_dependencies: List[FunctionalDependency] = Field(default_factory=list, description="Non-trivial dependencies satisfying 3NF")
    violations: List[NF3Violation] = Field(default_factory=list, description="Detected 3NF violations")
    transitive_patterns: List[str] = Field(default_factory=list, description="Pedagogical transitive dependency chains detected")
    reasoning_steps: List[KeyReasoningStep] = Field(default_factory=list, description="Step-by-step reasoning trace")
    decomposition_proposal: Optional[DecompositionProposal] = Field(default=None, description="Proposed 3NF decomposition relations")
    limitations: List[str] = Field(default_factory=list, description="Explicit analysis limitations and caveats")


class NF4Violation(BaseModel):
    """Specific 4NF violation for a non-trivial MVD X ->> Y where X is not a superkey."""
    mvd: MultivaluedDependency = Field(..., description="Offending multivalued dependency")
    determinant: List[str] = Field(..., description="Determinant attributes (X)")
    dependent_attributes: List[str] = Field(..., description="Multivalued dependent attributes (Y)")
    is_trivial: bool = Field(default=False, description="Triviality of MVD (False for violations)")
    determinant_is_superkey: bool = Field(default=False, description="Superkey status of determinant (False for violations)")
    reason_code: str = Field(..., description="Machine-readable violation reason code")
    explanation: str = Field(..., description="Educational explanation connecting MVD to tuple redundancy")


class NF4MVDAnalysis(BaseModel):
    """Evaluation breakdown for an individual multivalued dependency under 4NF rules."""
    mvd: MultivaluedDependency
    is_trivial: bool
    triviality_reason: Optional[str] = Field(default=None, description="Why trivial (e.g. RHS_SUBSET_OF_LHS or UNION_EQUALS_RELATION)")
    determinant_is_superkey: bool
    satisfies_4nf: bool
    reason_code: str
    explanation: str


class NF4Result(BaseModel):
    """Fourth Normal Form (4NF) analysis result."""
    status: NFStatus = Field(..., description="4NF status (SATISFIED, VIOLATED, BLOCKED_BY_PREREQUISITE, or INSUFFICIENT_DATA)")
    is_satisfied: bool = Field(..., description="True only if status is SATISFIED")
    reason_code: str = Field(..., description="Machine-readable summary reason code")
    message: str = Field(..., description="Educational explanation of 4NF evaluation")
    prerequisite_3nf_status: NFStatus = Field(..., description="Status of the 3NF prerequisite")
    candidate_keys: List[List[str]] = Field(default_factory=list, description="Verified candidate keys from Phase 4")
    mvds_analyzed: List[NF4MVDAnalysis] = Field(default_factory=list, description="Analysis of each MVD")
    trivial_mvds: List[MultivaluedDependency] = Field(default_factory=list, description="Trivial MVDs")
    non_trivial_mvds: List[MultivaluedDependency] = Field(default_factory=list, description="Non-trivial MVDs")
    violations: List[NF4Violation] = Field(default_factory=list, description="Detected 4NF violations")
    reasoning_steps: List[KeyReasoningStep] = Field(default_factory=list, description="Step-by-step reasoning trace")
    decomposition_proposal: Optional[DecompositionProposal] = Field(default=None, description="Proposed 4NF decomposition relations")
    limitations: List[str] = Field(default_factory=list, description="Explicit analysis limitations and caveats")


class FullNormalizationAnalysisResult(BasicNormalizationAnalysisResult):
    """
    Comprehensive 1NF, 2NF, 3NF & 4NF normalization analysis result for the Normalization Lab.
    Extends BasicNormalizationAnalysisResult with full 3NF and 4NF stage results and overall normal form.
    """
    nf3: NF3Result = Field(..., description="3NF analysis result")
    nf4: NF4Result = Field(..., description="4NF analysis result")
    highest_confirmed_normal_form: NormalForm = Field(..., description="Highest confirmed normal form respecting the hierarchy")


# --- Phase 7: Formal Decomposition, Lossless Join & Dependency Preservation Contracts ---

class TableauChaseStep(BaseModel):
    """A discrete step during the Tableau Chase algorithm equating symbols."""
    step_number: int = Field(..., description="1-indexed sequence number of the chase step")
    applied_fd: FunctionalDependency = Field(..., description="The functional dependency applied to equate symbols")
    matching_rows: List[int] = Field(default_factory=list, description="0-indexed row indices that matched on determinant LHS")
    target_attribute: str = Field(..., description="Attribute in RHS whose symbols were equated")
    equated_symbol: str = Field(..., description="The winning symbol (preferring distinguished a_j, or lowest b_ij)")
    replaced_symbols: List[str] = Field(default_factory=list, description="Symbols that were replaced by equated_symbol")
    tableau_snapshot: List[List[str]] = Field(..., description="Matrix state after applying this step [row][col]")
    explanation: str = Field(..., description="Pedagogical explanation of this unification step")


class LosslessJoinResult(BaseModel):
    """Authoritative result of formal lossless-join verification."""
    is_lossless: bool = Field(..., description="True if natural join of decomposed relations yields original relation without spurious tuples")
    method: Literal["TABLEAU_CHASE", "FAGINS_THEOREM"] = Field(..., description="Formal method used for verification")
    attributes: List[str] = Field(..., description="Ordered attribute headers corresponding to tableau columns")
    relations: List[str] = Field(..., description="Names or schemas of decomposed relations corresponding to tableau rows")
    initial_tableau: List[List[str]] = Field(default_factory=list, description="Initial tableau with distinguished (a_j) and non-distinguished (b_ij) symbols")
    chase_steps: List[TableauChaseStep] = Field(default_factory=list, description="Sequence of symbol unification steps")
    final_tableau: List[List[str]] = Field(default_factory=list, description="Final tableau state at fixed point")
    distinguished_row_index: Optional[int] = Field(default=None, description="0-indexed row that became entirely distinguished (all a_j), proving losslessness")
    reasoning: str = Field(..., description="Academic explanation of lossless outcome")


class DependencyPreservationCheck(BaseModel):
    """Individual verification check for a single original functional dependency."""
    target_fd: FunctionalDependency = Field(..., description="Original functional dependency being tested for preservation")
    is_preserved: bool = Field(..., description="True if target_fd is in the closure of the union of projected dependencies")
    closure_under_projected: List[str] = Field(default_factory=list, description="Closure of target_fd LHS under projected dependencies")
    relevant_relations: List[str] = Field(default_factory=list, description="Decomposed relations that directly cover this FD without joining")
    explanation: str = Field(..., description="Step-by-step verification trace for this dependency")


class DependencyPreservationResult(BaseModel):
    """Authoritative result of formal dependency preservation verification."""
    is_preserved: bool = Field(..., description="True if all original functional dependencies can be enforced locally without joins")
    original_dependencies: List[FunctionalDependency] = Field(default_factory=list, description="Set of original dependencies F")
    projected_dependencies_by_relation: Dict[str, List[FunctionalDependency]] = Field(
        default_factory=dict,
        description="Projected dependencies pi_Ri(F) for each decomposed relation Ri"
    )
    all_projected_dependencies: List[FunctionalDependency] = Field(
        default_factory=list,
        description="Union of all projected functional dependencies"
    )
    checks: List[DependencyPreservationCheck] = Field(
        default_factory=list,
        description="Detailed verification check for each original FD"
    )
    preserved_dependencies: List[FunctionalDependency] = Field(
        default_factory=list,
        description="Subset of original FDs successfully preserved"
    )
    non_preserved_dependencies: List[FunctionalDependency] = Field(
        default_factory=list,
        description="Subset of original FDs that require inter-relational joins to enforce"
    )
    reasoning: str = Field(..., description="Educational explanation of dependency preservation findings")


class MinimalCoverResult(BaseModel):
    """Canonical / Minimal Cover computation result for a set of functional dependencies."""
    original_fds: List[FunctionalDependency] = Field(..., description="Original input functional dependencies")
    rhs_split_fds: List[FunctionalDependency] = Field(default_factory=list, description="Step 1: Dependencies with singleton RHS")
    extraneous_removed_fds: List[FunctionalDependency] = Field(default_factory=list, description="Step 2: Dependencies after removing extraneous LHS attributes")
    minimal_fds: List[FunctionalDependency] = Field(..., description="Step 3: Final minimal cover after eliminating redundant FDs")
    removed_extraneous_attributes: List[Dict[str, Any]] = Field(default_factory=list, description="Audit log of extraneous LHS attributes pruned")
    removed_redundant_fds: List[FunctionalDependency] = Field(default_factory=list, description="Audit log of redundant FDs pruned")
    reasoning_steps: List[str] = Field(default_factory=list, description="Educational trace of canonical cover derivation")


class DecompositionPlan(BaseModel):
    """Structured, verified decomposition plan for a specific normal form violation."""
    id: str = Field(..., description="Unique identifier for this decomposition plan")
    source_relation: str = Field(..., description="Source relation being decomposed")
    stage: Literal["1NF", "2NF", "3NF", "4NF"] = Field(..., description="Normalization stage triggering decomposition")
    trigger_type: str = Field(..., description="Category of violation (e.g. PARTIAL_DEPENDENCY, TRANSITIVE_DEPENDENCY, MULTIVALUED_DEPENDENCY)")
    trigger_dependency: Optional[str] = Field(default=None, description="Specific FD or MVD notation that triggered the split")
    proposed_relations: List[DecomposedRelation] = Field(..., description="Resulting sub-relations")
    lossless_join: LosslessJoinResult = Field(..., description="Formal lossless join verification result")
    dependency_preservation: DependencyPreservationResult = Field(..., description="Formal dependency preservation verification result")
    lineage: Dict[str, Any] = Field(default_factory=dict, description="Provenance and parent-child tree mapping")
    reasoning_steps: List[KeyReasoningStep] = Field(default_factory=list, description="Educational derivation steps")


class DecompositionVerificationRequest(BaseModel):
    """Payload for verifying an arbitrary proposed decomposition of a relation."""
    model_config = ConfigDict(populate_by_name=True)

    relation_name: Optional[str] = Field(default="R", alias="relationName", description="Source relation name")
    attributes: List[str] = Field(..., min_length=1, description="Original relation attributes")
    functional_dependencies: List[FunctionalDependency] = Field(
        default_factory=list, alias="functionalDependencies", description="Original functional dependencies"
    )
    multivalued_dependencies: List[MultivaluedDependency] = Field(
        default_factory=list, alias="multivaluedDependencies", description="Original multivalued dependencies"
    )
    candidate_keys: List[List[str]] = Field(
        default_factory=list, alias="candidateKeys", description="Original candidate keys (if known)"
    )
    decomposed_relations: List[Dict[str, Any]] = Field(
        ...,
        min_length=1,
        alias="decomposedRelations",
        description="List of proposed relations (each with at least 'name' and 'attributes')"
    )


class DecompositionVerificationResult(BaseModel):
    """Combined verification response for a proposed decomposition."""
    model_config = ConfigDict(populate_by_name=True)

    source_relation: str
    attributes: List[str]
    decomposed_relations: List[Dict[str, Any]]
    lossless_join: LosslessJoinResult
    dependency_preservation: DependencyPreservationResult
    overall_status: Literal["VERIFIED_BOTH", "VERIFIED_LOSSLESS_ONLY", "VERIFIED_PRESERVING_ONLY", "FAILED_VERIFICATION"]
    summary: str


class DecompositionAnalyzeRequest(BaseModel):
    """Payload for executing formal decomposition toward a target normal form."""
    model_config = ConfigDict(populate_by_name=True)

    relation_name: Optional[str] = Field(default="R", alias="relationName", description="Source relation name")
    attributes: List[str] = Field(..., min_length=1, description="Source relation attributes")
    functional_dependencies: List[FunctionalDependency] = Field(
        default_factory=list, alias="functionalDependencies", description="Source functional dependencies"
    )
    multivalued_dependencies: List[MultivaluedDependency] = Field(
        default_factory=list, alias="multivaluedDependencies", description="Source multivalued dependencies"
    )
    candidate_keys: List[List[str]] = Field(
        default_factory=list, alias="candidateKeys", description="Source candidate keys (optional, computed if empty)"
    )
    target_normal_form: Literal["2NF", "3NF", "4NF"] = Field(
        ..., alias="targetNormalForm", description="Target normal form for decomposition"
    )


class DecompositionAnalyzeResult(BaseModel):
    """Comprehensive result of formal decomposition analysis and verification."""
    model_config = ConfigDict(populate_by_name=True)

    target_normal_form: str
    source_relation: str
    source_attributes: List[str]
    candidate_keys: List[List[str]]
    plans: List[DecompositionPlan] = Field(default_factory=list, description="Decomposition plans generated")
    final_relations: List[DecomposedRelation] = Field(default_factory=list, description="Final normalized sub-relations")
    verification: DecompositionVerificationResult = Field(..., description="Overall verification of final relations")
    minimal_cover: Optional[MinimalCoverResult] = Field(default=None, description="Minimal cover if 3NF synthesis was performed")
    summary: str


# ============================================================================
# PHASE 8 DOMAIN CONTRACTS: VISUALIZATION ENGINE & NORMALIZATION JOURNEY
# ============================================================================

class VisualizationNode(BaseModel):
    """Represents a graph node (attribute, composite determinant group, or relation) for React Flow / D3."""
    model_config = ConfigDict(populate_by_name=True)

    id: str
    label: str
    type: Literal["attribute", "composite_determinant", "relation"] = "attribute"
    attributes: List[str] = Field(default_factory=list, description="Attributes represented by this node")
    is_prime: bool = Field(default=False, description="True if any represented attribute is prime")
    is_candidate_key: bool = Field(default=False, description="True if represented attributes constitute a candidate key")
    position: Dict[str, float] = Field(default_factory=lambda: {"x": 0.0, "y": 0.0}, description="Calculated 2D position")
    data: Dict[str, Any] = Field(default_factory=dict, description="Additional contextual metadata")


class VisualizationEdge(BaseModel):
    """Represents a directed dependency edge (FD, MVD, or decomposition lineage) for React Flow / D3."""
    model_config = ConfigDict(populate_by_name=True)

    id: str
    source: str
    target: str
    type: Literal["fd", "mvd", "decomposition"] = "fd"
    label: str = ""
    is_violation: bool = Field(default=False, description="True if this dependency violates a normal form")
    violation_stage: Optional[str] = Field(default=None, description="Normal form violated (e.g. '2NF', '3NF', '4NF')")
    data: Dict[str, Any] = Field(default_factory=dict, description="Additional contextual metadata")


class VisualizationGraphData(BaseModel):
    """Complete graph data payload ready for interactive React Flow rendering."""
    model_config = ConfigDict(populate_by_name=True)

    relation_name: str = Field(..., alias="relationName")
    nodes: List[VisualizationNode] = Field(default_factory=list)
    edges: List[VisualizationEdge] = Field(default_factory=list)
    candidate_keys: List[List[str]] = Field(default_factory=list, alias="candidateKeys")
    prime_attributes: List[str] = Field(default_factory=list, alias="primeAttributes")
    non_prime_attributes: List[str] = Field(default_factory=list, alias="nonPrimeAttributes")
    summary: str = ""


class DecompositionTreeNode(BaseModel):
    """Node in a hierarchical decomposition lineage tree."""
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    attributes: List[str]
    primary_key: List[str] = Field(default_factory=list, alias="primaryKey")
    parent_id: Optional[str] = Field(default=None, alias="parentId")
    children_ids: List[str] = Field(default_factory=list, alias="childrenIds")
    trigger_dependency: Optional[str] = Field(default=None, alias="triggerDependency")
    stage: Optional[str] = None
    is_lossless: Optional[bool] = Field(default=None, alias="isLossless")
    is_preserved: Optional[bool] = Field(default=None, alias="isPreserved")


class ClosureVisualizationStep(BaseModel):
    """Detailed visual step in an interactive attribute closure animation/playback."""
    model_config = ConfigDict(populate_by_name=True)

    step_number: int = Field(..., alias="stepNumber")
    current_closure: List[str] = Field(..., alias="currentClosure")
    applied_fd: Optional[FunctionalDependency] = Field(default=None, alias="appliedFd")
    newly_added: List[str] = Field(default_factory=list, alias="newlyAdded")
    is_starting: bool = Field(default=False, alias="isStarting")
    is_fixed_point: bool = Field(default=False, alias="isFixedPoint")
    is_superkey: bool = Field(default=False, alias="isSuperkey")
    explanation: str = ""


class ClosureVisualizationData(BaseModel):
    """Playback payload for the interactive attribute closure visualizer."""
    model_config = ConfigDict(populate_by_name=True)

    target_attributes: List[str] = Field(..., alias="targetAttributes")
    final_closure: List[str] = Field(..., alias="finalClosure")
    is_superkey: bool = Field(..., alias="isSuperkey")
    steps: List[ClosureVisualizationStep] = Field(default_factory=list)





