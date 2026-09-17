from typing import List, Dict, Any
from fastapi import APIRouter, status
from app.schemas.domain_contracts import (
    CanonicalSchemaInput,
    ValidationResult,
    RawParseRequest,
)
from app.services.input_validation import validate_schema_input
from app.services.raw_parser import parse_raw_schema
from app.core.examples import get_all_examples

router = APIRouter()


@router.post(
    "/validate",
    response_model=ValidationResult,
    status_code=status.HTTP_200_OK,
    summary="Validate structured schema input",
    description=(
        "Validates relation attributes, candidate keys, functional dependencies, "
        "multivalued dependencies, and sample tuples. Returns structured errors and educational warnings."
    ),
)
async def validate_schema(schema_input: CanonicalSchemaInput) -> ValidationResult:
    """Authoritative validation of relational schema input."""
    return validate_schema_input(schema_input)


@router.post(
    "/parse-raw",
    response_model=ValidationResult,
    status_code=status.HTTP_200_OK,
    summary="Parse and validate raw DBMS text notation",
    description=(
        "Parses text-based relational specifications (e.g. 'R(A, B, C)', 'FD: A -> B') "
        "into the canonical input model with line-numbered error diagnostics."
    ),
)
async def parse_raw(request: RawParseRequest) -> ValidationResult:
    """Parse raw DBMS text notation and validate resulting schema."""
    return parse_raw_schema(request.raw_text)


@router.get(
    "/examples",
    response_model=List[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Get pre-configured textbook normalization problems",
    description=(
        "Returns reference schemas (1NF atomicity, 2NF partial dependency, 3NF transitive dependency, "
        "4NF multivalued dependency, and normalized schemas) in canonical format."
    ),
)
async def list_examples() -> List[Dict[str, Any]]:
    """Retrieve pre-built educational example problems."""
    return get_all_examples()
