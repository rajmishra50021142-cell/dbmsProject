"""
Pydantic models and DTOs for Excel upload, inspection, heuristic suggestions, and export.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict, model_validator
from app.schemas.domain_contracts import FunctionalDependency, MultivaluedDependency


class ExcelIssue(BaseModel):
    """Data quality or structural issue identified in uploaded spreadsheet."""
    severity: str = Field(default="warning", description="'warning', 'error', or 'info'")
    code: str = Field(..., description="Issue code e.g. EMPTY_HEADER, DUPLICATE_HEADER, NON_ATOMIC_VALUE")
    category: Optional[str] = Field(default="header", description="Category for frontend issue mapping")
    message: str = Field(..., description="Human-readable explanation")
    row: Optional[int] = Field(default=None, description="1-indexed row number if applicable")
    column: Optional[str] = Field(default=None, description="Column name or header letter")

    @model_validator(mode="before")
    @classmethod
    def set_category(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "category" not in data or not data["category"]:
                code = str(data.get("code", "")).upper()
                if "ATOMIC" in code:
                    data["category"] = "atomic"
                elif "HEADER" in code:
                    data["category"] = "header"
                elif "DUPLICATE" in code:
                    data["category"] = "duplicate"
                elif "EMPTY" in code:
                    data["category"] = "missing"
                else:
                    data["category"] = "header"
        return data


class ExcelInspectResponse(BaseModel):
    """Result of inspecting an uploaded Excel workbook."""
    model_config = ConfigDict(populate_by_name=True)

    filename: str = Field(..., description="Original filename")
    # Both field names are always populated so the frontend can use either.
    sheets: List[str] = Field(default_factory=list, description="List of worksheet names in workbook")
    sheet_names: List[str] = Field(default_factory=list, description="Alias for sheets, always equal to sheets")
    selected_sheet: str = Field(..., description="Active worksheet analyzed")
    headers: List[str] = Field(default_factory=list, description="Column headings detected in sheet")
    columns: List[str] = Field(default_factory=list, description="Alias for headers, always equal to headers")
    header_row_index: int = Field(default=0, description="0-indexed row used for headers")
    total_rows: int = Field(..., description="Total data rows detected")
    preview_rows: List[Dict[str, Any]] = Field(default_factory=list, description="First N data rows")
    issues: List[ExcelIssue] = Field(default_factory=list, description="Parsing or formatting issues")
    has_non_atomic_values: bool = Field(default=False, description="Whether non-atomic cell values were detected")

    @model_validator(mode="before")
    @classmethod
    def populate_aliases(cls, data: Any) -> Any:
        """Ensure both alias pairs always carry the same value so the JSON response
        includes every field the frontend may access regardless of which variant
        the service layer used when constructing the dict."""
        if isinstance(data, dict):
            # Synchronise sheets / sheet_names
            sheets = data.get("sheets") or data.get("sheet_names") or []
            data["sheets"] = sheets
            data["sheet_names"] = sheets
            # Synchronise headers / columns
            headers = data.get("headers") or data.get("columns") or []
            data["headers"] = headers
            data["columns"] = headers
            # Default header_row_index
            if "header_row_index" not in data or data["header_row_index"] is None:
                data["header_row_index"] = 0
            # Derive has_non_atomic_values from issues if not explicitly provided
            if "has_non_atomic_values" not in data or data["has_non_atomic_values"] is None:
                issues = data.get("issues") or []
                data["has_non_atomic_values"] = any(
                    (isinstance(i, dict) and i.get("code") == "POTENTIAL_NON_ATOMIC")
                    or (hasattr(i, "code") and getattr(i, "code") == "POTENTIAL_NON_ATOMIC")
                    for i in issues
                )
        return data


class ObservedKey(BaseModel):
    """Empirical candidate key suggested from observed worksheet uniqueness."""
    attributes: List[str] = Field(..., description="Attribute set with unique values across rows")
    is_unique: bool = Field(default=True, description="True if no duplicate combinations observed")
    uniqueness_ratio: float = Field(default=1.0, description="Ratio of unique combinations to total rows")
    null_count: int = Field(default=0, description="Number of null or blank occurrences")
    confidence: str = Field(default="High", description="'High', 'Moderate', or 'Weak'")
    explanation: str = Field(..., description="Pedagogical explanation of why this key is suggested")


class ObservedFD(BaseModel):
    """Empirical functional dependency that holds across observed spreadsheet rows."""
    id: Optional[str] = Field(default=None, description="Unique identifier for suggestion")
    left: List[str] = Field(..., description="Determinant attributes X")
    right: List[str] = Field(..., description="Dependent attributes Y")
    determinant: List[str] = Field(default_factory=list, description="Alias for left")
    dependent: List[str] = Field(default_factory=list, description="Alias for right")
    notation: str = Field(default="", description="Human-readable notation e.g. X → Y")
    holds: bool = Field(default=True, description="True if X uniquely determines Y in all sample rows")
    violation_count: int = Field(default=0, description="Count of violating rows")
    confidence: str = Field(default="Strong", description="'Strong', 'Empirical', or 'Weak'")
    explanation: str = Field(..., description="Explanation of observed relationship")
    notes: str = Field(default="", description="Alias for explanation")
    is_heuristic: bool = Field(default=True, description="Distinguishes empirical observation from formal constraint")

    @model_validator(mode="before")
    @classmethod
    def populate_fd_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            left = data.get("left") or data.get("determinant") or []
            right = data.get("right") or data.get("dependent") or []
            data["left"] = left
            data["determinant"] = left
            data["right"] = right
            data["dependent"] = right
            if not data.get("notation"):
                data["notation"] = f"{', '.join(left)} → {', '.join(right)}"
            if not data.get("notes"):
                data["notes"] = data.get("explanation", "")
            if not data.get("explanation"):
                data["explanation"] = data.get("notes", "")
        return data


class AtomicityReviewItem(BaseModel):
    """Column flagged for potential 1NF non-atomic values (delimiters, repeating values)."""
    attribute: str = Field(..., description="Attribute name")
    row_index: int = Field(default=1, description="Row number containing candidate non-atomic value")
    sample_value: str = Field(..., description="Observed cell content")
    delimiter_detected: str = Field(..., description="Delimiter detected (e.g. comma, semicolon, newline)")
    message: str = Field(default="", description="Guidance for learner review")
    reason: str = Field(default="", description="Reason for 1NF flag")
    suggested_action: str = Field(default="", description="Recommended decomposition or cleanup action")

    @model_validator(mode="before")
    @classmethod
    def populate_atomicity_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            msg = data.get("message") or data.get("reason") or "Contains delimited multi-value entries"
            data["message"] = msg
            data["reason"] = data.get("reason") or msg
            data["suggested_action"] = data.get("suggested_action") or "Normalize to 1NF by splitting delimited values into individual rows."
        return data


class ExcelSuggestRequest(BaseModel):
    """Request to derive heuristic suggestions from observed spreadsheet rows."""
    model_config = ConfigDict(populate_by_name=True)

    relation_name: Optional[str] = Field(default="UPLOADED_RELATION", description="Proposed relation name")
    attributes: Optional[List[str]] = Field(default=None, description="List of attributes/columns")
    columns: Optional[List[str]] = Field(default=None, description="Alias for attributes")
    rows: List[Dict[str, Any]] = Field(default_factory=list, description="Worksheet data rows")

    @model_validator(mode="before")
    @classmethod
    def resolve_attrs(cls, data: Any) -> Any:
        if isinstance(data, dict):
            attrs = data.get("attributes") or data.get("columns") or []
            data["attributes"] = attrs
            data["columns"] = attrs
        return data


class ExcelSuggestResponse(BaseModel):
    """Heuristic suggestions for Mode B Excel-only schema discovery."""
    model_config = ConfigDict(populate_by_name=True)

    relation_name: str = Field(..., description="Proposed relation name")
    candidate_keys: List[ObservedKey] = Field(default_factory=list, description="Observed unique attribute sets")
    suggested_keys: List[ObservedKey] = Field(default_factory=list, description="Alias for candidate_keys")
    functional_dependencies: List[ObservedFD] = Field(default_factory=list, description="Observed functional dependencies")
    suggested_fds: List[ObservedFD] = Field(default_factory=list, description="Alias for functional_dependencies")
    atomicity_reviews: List[AtomicityReviewItem] = Field(default_factory=list, description="Potential 1NF violations")
    data_quality_notes: List[str] = Field(default_factory=list, description="Duplicate rows, missing cells, etc.")
    sample_row_count: int = Field(default=0, description="Number of observed rows analyzed")
    disclaimer: str = Field(
        default="Important: These dependencies and keys are suggestions derived from finite observed spreadsheet rows. In relational theory, genuine constraints must hold for all valid database instances, not merely the sample uploaded. Please review and confirm before running formal normalization.",
        description="Formal theory disclaimer"
    )
    caveat: str = Field(
        default="Important: These dependencies and keys are suggestions derived from finite observed spreadsheet rows. In relational theory, genuine constraints must hold for all valid database instances, not merely the sample uploaded. Please review and confirm before running formal normalization.",
        description="Alias for disclaimer"
    )

    @model_validator(mode="before")
    @classmethod
    def populate_suggest_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            keys = data.get("candidate_keys") or data.get("suggested_keys") or []
            data["candidate_keys"] = keys
            data["suggested_keys"] = keys
            fds = data.get("functional_dependencies") or data.get("suggested_fds") or []
            data["functional_dependencies"] = fds
            data["suggested_fds"] = fds
            disc = data.get("disclaimer") or data.get("caveat") or "Empirical suggestions derived from observed spreadsheet sample."
            data["disclaimer"] = disc
            data["caveat"] = disc
            if "sample_row_count" not in data:
                data["sample_row_count"] = len(data.get("rows", []))
        return data


class ValidateRowsRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    relation_name: Optional[str] = Field(default="UPLOADED_RELATION", description="Proposed relation name")
    attributes: Optional[List[str]] = Field(default=None, description="List of attributes/columns")
    columns: Optional[List[str]] = Field(default=None, description="Alias for attributes")
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list, alias="functionalDependencies")
    rows: List[Dict[str, Any]] = Field(default_factory=list)
    column_mapping: Optional[Dict[str, str]] = Field(default=None, alias="columnMapping")

    @model_validator(mode="before")
    @classmethod
    def resolve_attrs(cls, data: Any) -> Any:
        if isinstance(data, dict):
            attrs = data.get("attributes") or data.get("columns") or []
            data["attributes"] = attrs
            data["columns"] = attrs
        return data


class ExcelExportRequest(BaseModel):
    """Request to export normalized relational data as an Excel workbook."""
    model_config = ConfigDict(populate_by_name=True)

    relation_name: str = Field(default="R", description="Source relation name")
    attributes: List[str] = Field(..., min_length=1, description="Source relation attributes")
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list, alias="functionalDependencies")
    multivalued_dependencies: List[MultivaluedDependency] = Field(default_factory=list, alias="multivaluedDependencies")
    candidate_keys: List[List[str]] = Field(default_factory=list, alias="candidateKeys")
    rows: List[Dict[str, Any]] = Field(..., description="Uploaded raw data rows")
    target_normal_form: Optional[str] = Field(default="3NF", description="Target normal form (2NF, 3NF, 4NF)")
    column_mapping: Optional[Dict[str, str]] = Field(default=None, alias="columnMapping")
