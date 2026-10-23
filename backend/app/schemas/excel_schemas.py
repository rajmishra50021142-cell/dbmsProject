"""
Pydantic models and DTOs for Excel upload, inspection, heuristic suggestions, and export.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.domain_contracts import FunctionalDependency, MultivaluedDependency


class ExcelIssue(BaseModel):
    """Data quality or structural issue identified in uploaded spreadsheet."""
    severity: str = Field(default="warning", description="'warning', 'error', or 'info'")
    code: str = Field(..., description="Issue code e.g. EMPTY_HEADER, DUPLICATE_HEADER, NON_ATOMIC_VALUE")
    message: str = Field(..., description="Human-readable explanation")
    row: Optional[int] = Field(default=None, description="1-indexed row number if applicable")
    column: Optional[str] = Field(default=None, description="Column name or header letter")


class ExcelInspectResponse(BaseModel):
    """Result of inspecting an uploaded Excel workbook."""
    model_config = ConfigDict(populate_by_name=True)

    filename: str = Field(..., description="Original filename")
    sheets: List[str] = Field(..., description="List of worksheet names in workbook")
    selected_sheet: str = Field(..., description="Active worksheet analyzed")
    headers: List[str] = Field(..., description="Column headings detected in sheet")
    total_rows: int = Field(..., description="Total data rows detected")
    preview_rows: List[Dict[str, Any]] = Field(default_factory=list, description="First N data rows")
    issues: List[ExcelIssue] = Field(default_factory=list, description="Parsing or formatting issues")


class ObservedKey(BaseModel):
    """Empirical candidate key suggested from observed worksheet uniqueness."""
    attributes: List[str] = Field(..., description="Attribute set with unique values across rows")
    is_unique: bool = Field(default=True, description="True if no duplicate combinations observed")
    explanation: str = Field(..., description="Pedagogical explanation of why this key is suggested")


class ObservedFD(BaseModel):
    """Empirical functional dependency that holds across observed spreadsheet rows."""
    left: List[str] = Field(..., description="Determinant attributes X")
    right: List[str] = Field(..., description="Dependent attributes Y")
    holds: bool = Field(default=True, description="True if X uniquely determines Y in all sample rows")
    explanation: str = Field(..., description="Explanation of observed relationship")
    is_heuristic: bool = Field(default=True, description="Distinguishes empirical observation from formal constraint")


class AtomicityReviewItem(BaseModel):
    """Column flagged for potential 1NF non-atomic values (delimiters, repeating values)."""
    attribute: str = Field(..., description="Attribute name")
    row_index: int = Field(..., description="Row number containing candidate non-atomic value")
    sample_value: str = Field(..., description="Observed cell content")
    delimiter_detected: str = Field(..., description="Delimiter detected (e.g. comma, semicolon, newline)")
    message: str = Field(..., description="Guidance for learner review")


class ExcelSuggestRequest(BaseModel):
    """Request to derive heuristic suggestions from observed spreadsheet rows."""
    model_config = ConfigDict(populate_by_name=True)

    relation_name: Optional[str] = Field(default="UPLOADED_RELATION", description="Proposed relation name")
    attributes: List[str] = Field(..., min_length=1, description="List of attributes/columns")
    rows: List[Dict[str, Any]] = Field(..., description="Worksheet data rows")


class ExcelSuggestResponse(BaseModel):
    """Heuristic suggestions for Mode B Excel-only schema discovery."""
    model_config = ConfigDict(populate_by_name=True)

    relation_name: str = Field(..., description="Proposed relation name")
    suggested_keys: List[ObservedKey] = Field(default_factory=list, description="Observed unique attribute sets")
    suggested_fds: List[ObservedFD] = Field(default_factory=list, description="Observed functional dependencies")
    atomicity_reviews: List[AtomicityReviewItem] = Field(default_factory=list, description="Potential 1NF violations")
    data_quality_notes: List[str] = Field(default_factory=list, description="Duplicate rows, missing cells, etc.")
    caveat: str = Field(
        default="Important: These dependencies and keys are suggestions derived from finite observed spreadsheet rows. In relational theory, genuine constraints must hold for all valid database instances, not merely the sample uploaded. Please review and confirm before running formal normalization.",
        description="Formal theory disclaimer"
    )


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
