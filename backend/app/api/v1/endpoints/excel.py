"""
FastAPI route handlers for Excel workbook inspection, suggestions, and normalized export.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Response
from app.schemas.excel_schemas import (
    ExcelInspectResponse,
    ExcelSuggestRequest,
    ExcelSuggestResponse,
    ExcelExportRequest,
    ValidateRowsRequest,
)
from app.services.excel_service import ExcelService

router = APIRouter()

MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB

ALLOWED_EXTENSIONS = (".xlsx", ".xls", ".csv")


@router.post(
    "/inspect",
    response_model=ExcelInspectResponse,
    status_code=status.HTTP_200_OK,
    summary="Inspect uploaded Excel workbook",
    description=(
        "Extracts sheet names, headers, preview rows, and structural issues from an "
        "uploaded .xlsx, .xls, or .csv file."
    ),
)
async def inspect_excel(
    file: UploadFile = File(..., description="Uploaded Excel (.xlsx/.xls) or CSV (.csv) file"),
    sheet_name: Optional[str] = Form(default=None, description="Optional target worksheet name"),
    header_row_index: Optional[int] = Form(default=None, description="0-indexed row to treat as header"),
) -> ExcelInspectResponse:
    fname = (file.filename or "").strip()
    if not any(fname.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Unsupported file format. Please upload a valid Microsoft Excel "
                "(.xlsx, .xls) or CSV (.csv) file."
            ),
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 15 MB limit.",
        )

    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    try:
        return ExcelService.inspect_workbook(
            file_bytes=file_bytes,
            filename=fname,
            sheet_name=sheet_name or None,
            header_row_index=header_row_index,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while parsing the workbook: {str(e)}",
        )


@router.post(
    "/suggest",
    response_model=ExcelSuggestResponse,
    status_code=status.HTTP_200_OK,
    summary="Derive heuristic schema, key, and dependency suggestions",
    description=(
        "Mines observed uniqueness, potential FDs, and atomicity review flags from "
        "uploaded rows for Mode B discovery."
    ),
)
async def suggest_from_excel(req: ExcelSuggestRequest) -> ExcelSuggestResponse:
    try:
        attrs = req.attributes or req.columns or []
        return ExcelService.suggest_schema_and_dependencies(
            attributes=attrs,
            rows=req.rows,
            relation_name=req.relation_name,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compute heuristic suggestions: {str(e)}",
        )


@router.post(
    "/validate-rows",
    status_code=status.HTTP_200_OK,
    summary="Validate rows against declared functional dependencies",
    description="Identifies spreadsheet tuple pairs that contradict user-declared functional dependencies.",
)
async def validate_rows(req: ValidateRowsRequest) -> Dict[str, Any]:
    try:
        attrs = req.attributes or req.columns or []
        contradictions = ExcelService.validate_rows_against_dependencies(
            attributes=attrs,
            functional_dependencies=req.functional_dependencies,
            rows=req.rows,
            column_mapping=req.column_mapping,
        )
        return {
            "valid": len(contradictions) == 0,
            "violations_count": len(contradictions),
            "total_rows": len(req.rows),
            "issues": contradictions,
            "contradictions": contradictions,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate rows against dependencies: {str(e)}",
        )


@router.post(
    "/export-normalized",
    status_code=status.HTTP_200_OK,
    summary="Export normalized data workbook",
    description=(
        "Performs decomposition, projects uploaded tuples onto decomposed sub-relations, "
        "and returns a downloadable .xlsx workbook."
    ),
)
async def export_normalized_workbook(req: ExcelExportRequest) -> Response:
    try:
        workbook_bytes = ExcelService.generate_normalized_workbook(
            relation_name=req.relation_name,
            attributes=req.attributes,
            functional_dependencies=req.functional_dependencies,
            multivalued_dependencies=req.multivalued_dependencies,
            candidate_keys=req.candidate_keys,
            rows=req.rows,
            target_normal_form=req.target_normal_form or "3NF",
            column_mapping=req.column_mapping,
        )
        safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in req.relation_name)
        filename = f"{safe_name}_normalized.xlsx"

        return Response(
            content=workbook_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition",
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate normalized workbook: {str(e)}",
        )
