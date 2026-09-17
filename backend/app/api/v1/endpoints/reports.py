"""
FastAPI Report Generation Endpoints for Phase 10.
Provides downloadable PDF, DOCX, and TXT reports based directly on active normalization analysis.
"""

from typing import Any, Dict, Literal, Optional
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.reports.report_builder import (
    ReportSectionSelection,
    generate_text_report,
    generate_docx_report,
    generate_pdf_report,
    sanitize_filename,
)

router = APIRouter()


class ReportRequestPayload(BaseModel):
    """Payload for requesting an exported normalization report."""
    format: Literal["pdf", "docx", "txt"] = Field(default="pdf", description="Requested document format")
    sections: Optional[ReportSectionSelection] = Field(default_factory=ReportSectionSelection, description="Included report sections")
    schema_definition: Optional[Dict[str, Any]] = Field(default=None, description="Canonical relation schema and user inputs")
    analysis_result: Dict[str, Any] = Field(..., description="Active FullNormalizationAnalysisResult")


@router.post("/generate", summary="Generate academic normalization report in chosen format")
async def generate_report(payload: ReportRequestPayload):
    """
    Generate a full academic report (PDF, DOCX, or TXT) directly from the active analysis result.
    Does not duplicate or recompute normalization logic.
    """
    fmt = payload.format.lower()
    sections = payload.sections or ReportSectionSelection()
    result_data = payload.analysis_result
    schema_data = payload.schema_definition or {
        "name": result_data.get("relation_name", "Relation"),
        "attributes": result_data.get("attributes", []),
        "functional_dependencies": result_data.get("functional_dependencies", []),
        "multivalued_dependencies": result_data.get("multivalued_dependencies", []),
    }
    rel_name = schema_data.get("name") or schema_data.get("relation_name") or result_data.get("relation_name", "Relation")

    if fmt == "txt":
        text_content = generate_text_report(schema_data, result_data, sections)
        filename = sanitize_filename(rel_name, "txt")
        return Response(
            content=text_content,
            media_type="text/plain; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    elif fmt == "docx":
        buffer = generate_docx_report(schema_data, result_data, sections)
        filename = sanitize_filename(rel_name, "docx")
        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    elif fmt == "pdf":
        buffer = generate_pdf_report(schema_data, result_data, sections)
        filename = sanitize_filename(rel_name, "pdf")
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {fmt}. Must be one of 'pdf', 'docx', 'txt'.")


@router.post("/pdf", summary="Generate academic normalization report in PDF format")
async def generate_pdf(payload: ReportRequestPayload):
    payload.format = "pdf"
    return await generate_report(payload)


@router.post("/docx", summary="Generate academic normalization report in DOCX format")
async def generate_docx(payload: ReportRequestPayload):
    payload.format = "docx"
    return await generate_report(payload)


@router.post("/txt", summary="Generate academic normalization report in plain TXT format")
async def generate_txt(payload: ReportRequestPayload):
    payload.format = "txt"
    return await generate_report(payload)
