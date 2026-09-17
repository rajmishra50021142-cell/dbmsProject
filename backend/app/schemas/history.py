"""
Pydantic Schemas for Execution & Analysis History.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class HistoryCreateRequest(BaseModel):
    """Payload to record an analysis run in history."""
    id: Optional[str] = Field(default=None, description="Optional client-generated UUID")
    title: str = Field(..., description="Human-readable title for the analysis run")
    analysis_type: str = Field(
        ...,
        description="Type of analysis: 'normalization', 'keys', 'closure', 'snapshot'"
    )
    relation_name: str = Field(..., description="Target relation name")
    highest_normal_form: Optional[str] = Field(default=None, description="Highest confirmed normal form if applicable")
    schema_data: Dict[str, Any] = Field(..., description="Canonical schema definition")
    analysis_result: Optional[Dict[str, Any]] = Field(default=None, description="Detailed analysis output")
    summary: Optional[Dict[str, Any]] = Field(default=None, description="Lightweight summary metrics")


class HistoryItemResponse(BaseModel):
    """Historical analysis record response."""
    id: str
    title: str
    analysis_type: str
    relation_name: str
    highest_normal_form: Optional[str] = None
    schema_data: Dict[str, Any]
    analysis_result: Optional[Dict[str, Any]] = None
    summary: Optional[Dict[str, Any]] = None
    created_at: str


class HistoryListResponse(BaseModel):
    """Paginated or listed history records."""
    total: int
    items: List[HistoryItemResponse]
