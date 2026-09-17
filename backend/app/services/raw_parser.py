"""
Authoritative Raw DBMS Notation Parser for Normalization Lab.

Parses text-based relational specifications into CanonicalSchemaInput.
Provides line-by-line syntax error detection with exact line numbers and actionable feedback.
"""

from typing import List, Tuple, Optional
import re
from app.schemas.domain_contracts import (
    CanonicalSchemaInput,
    FunctionalDependency,
    MultivaluedDependency,
    ValidationIssue,
    ValidationResult,
)
from app.services.input_validation import validate_schema_input

# Section header patterns
SEC_RELATION = re.compile(r"^(?:relation|schema|table)\s*:\s*(.*)$", re.IGNORECASE)
SEC_KEYS = re.compile(r"^(?:candidate\s*keys?|keys?|pk|primary\s*key)\s*:\s*(.*)$", re.IGNORECASE)
SEC_FDS = re.compile(r"^(?:functional\s*dependencies|fds?)\s*:\s*(.*)$", re.IGNORECASE)
SEC_MVDS = re.compile(r"^(?:multivalued\s*dependencies|mvds?)\s*:\s*(.*)$", re.IGNORECASE)

# Inline relation header pattern: ENROLLMENT(A, B, C)
INLINE_RELATION_PATTERN = re.compile(r"^([A-Za-z_][A-Za-z0-9_]*)\s*\((.*)\)\s*$")


def _split_attributes(attr_str: str) -> List[str]:
    """Splits a comma or space separated list of attributes while respecting whitespace."""
    # Strip enclosing parentheses if any
    cleaned = attr_str.strip()
    if cleaned.startswith("(") and cleaned.endswith(")"):
        cleaned = cleaned[1:-1].strip()
    
    parts = [p.strip() for p in cleaned.split(",") if p.strip()]
    return parts


def parse_raw_schema(raw_text: str) -> ValidationResult:
    """
    Parses raw DBMS text notation into CanonicalSchemaInput and validates it.
    Returns structured ValidationResult with exact line numbers for syntax errors.
    """
    errors: List[ValidationIssue] = []
    warnings: List[ValidationIssue] = []

    lines = raw_text.splitlines()
    if not any(line.strip() for line in lines):
        return ValidationResult(
            valid=False,
            errors=[
                ValidationIssue(
                    code="EMPTY_RAW_TEXT",
                    path="raw_text",
                    message="Please enter a relation definition in DBMS notation.",
                    severity="error",
                )
            ],
            warnings=[],
            canonical_input=None,
            summary=None,
        )

    current_section = "INITIAL"
    relation_name = ""
    attributes: List[str] = []
    candidate_keys: List[List[str]] = []
    functional_dependencies: List[FunctionalDependency] = []
    multivalued_dependencies: List[MultivaluedDependency] = []

    for line_num, line_raw in enumerate(lines, start=1):
        line = line_raw.strip()
        # Skip empty lines and comment lines
        if not line or line.startswith("#") or line.startswith("//"):
            continue

        # Check section headers
        rel_match = SEC_RELATION.match(line)
        if rel_match:
            current_section = "RELATION"
            rest = rel_match.group(1).strip()
            if rest:
                inline_match = INLINE_RELATION_PATTERN.match(rest)
                if inline_match:
                    relation_name = inline_match.group(1).strip()
                    attributes = _split_attributes(inline_match.group(2))
                else:
                    relation_name = rest
            continue

        keys_match = SEC_KEYS.match(line)
        if keys_match:
            current_section = "KEYS"
            rest = keys_match.group(1).strip()
            if rest and rest.lower() != "none":
                # Multiple keys may be separated by semicolon or parentheses
                for key_part in re.findall(r"\(([^)]+)\)|([^,;]+)", rest):
                    k_str = key_part[0] or key_part[1]
                    k_attrs = _split_attributes(k_str)
                    if k_attrs:
                        candidate_keys.append(k_attrs)
            continue

        fds_match = SEC_FDS.match(line)
        if fds_match:
            current_section = "FDS"
            rest = fds_match.group(1).strip()
            if rest and rest.lower() != "none":
                # Inline FD on header line
                _parse_fd_line(rest, line_num, functional_dependencies, errors)
            continue

        mvds_match = SEC_MVDS.match(line)
        if mvds_match:
            current_section = "MVDS"
            rest = mvds_match.group(1).strip()
            if rest and rest.lower() != "none":
                _parse_mvd_line(rest, line_num, multivalued_dependencies, errors)
            continue

        # Section-specific line handling
        if current_section == "INITIAL" or current_section == "RELATION":
            inline_match = INLINE_RELATION_PATTERN.match(line)
            if inline_match:
                relation_name = inline_match.group(1).strip()
                attributes = _split_attributes(inline_match.group(2))
                current_section = "BODY"
            elif not relation_name:
                relation_name = line
                current_section = "BODY"
            elif not attributes:
                attributes = _split_attributes(line)
                current_section = "BODY"
            else:
                # Try parsing as an FD if arrow is present
                if "->" in line or "→" in line or "->>" in line or "↠" in line:
                    if "->>" in line or "↠" in line:
                        _parse_mvd_line(line, line_num, multivalued_dependencies, errors)
                    else:
                        _parse_fd_line(line, line_num, functional_dependencies, errors)
                else:
                    errors.append(
                        ValidationIssue(
                            code="UNRECOGNIZED_SYNTAX",
                            path=f"line_{line_num}",
                            message=f"Line {line_num}: Unrecognized syntax '{line}'. Expected Relation definition, 'FDs:', or 'Candidate Keys:'.",
                            severity="error",
                        )
                    )

        elif current_section == "KEYS":
            if line.lower() != "none":
                k_attrs = _split_attributes(line)
                if k_attrs:
                    candidate_keys.append(k_attrs)

        elif current_section == "FDS":
            if line.lower() != "none":
                _parse_fd_line(line, line_num, functional_dependencies, errors)

        elif current_section == "MVDS":
            if line.lower() != "none":
                _parse_mvd_line(line, line_num, multivalued_dependencies, errors)

        else:
            # In general body, inspect arrows
            if "->>" in line or "↠" in line:
                _parse_mvd_line(line, line_num, multivalued_dependencies, errors)
            elif "->" in line or "→" in line:
                _parse_fd_line(line, line_num, functional_dependencies, errors)
            else:
                errors.append(
                    ValidationIssue(
                        code="UNRECOGNIZED_LINE",
                        path=f"line_{line_num}",
                        message=f"Line {line_num}: Cannot parse '{line}'. Specify section headers (e.g. 'FDs:') or dependencies with '->'.",
                        severity="error",
                    )
                )

    if errors:
        return ValidationResult(
            valid=False,
            errors=errors,
            warnings=warnings,
            canonical_input=None,
            summary=None,
        )

    # Convert to canonical input model and run authoritative validation service
    raw_canonical = CanonicalSchemaInput(
        name=relation_name or "R",
        attributes=attributes,
        candidate_keys=candidate_keys,
        functional_dependencies=functional_dependencies,
        multivalued_dependencies=multivalued_dependencies,
        sample_data=[],
    )

    validation_result = validate_schema_input(raw_canonical)
    # Merge any warnings
    validation_result.warnings.extend(warnings)
    return validation_result


def _parse_fd_line(
    line: str,
    line_num: int,
    fd_list: List[FunctionalDependency],
    errors: List[ValidationIssue],
) -> None:
    # Check invalid arrows like ->>>
    if "->>>" in line or "->>>>" in line:
        errors.append(
            ValidationIssue(
                code="INVALID_ARROW_SYNTAX",
                path=f"line_{line_num}",
                message=f"Line {line_num}: '{line}' contains an invalid arrow operator. Use '->' for functional dependencies or '->>' for multivalued dependencies.",
                severity="error",
            )
        )
        return

    # Normalized split on arrow
    if "->" in line:
        parts = line.split("->", 1)
    elif "→" in line:
        parts = line.split("→", 1)
    else:
        errors.append(
            ValidationIssue(
                code="MISSING_ARROW",
                path=f"line_{line_num}",
                message=f"Line {line_num}: Missing dependency arrow '->' in '{line}'.",
                severity="error",
            )
        )
        return

    lhs_str = parts[0].strip()
    rhs_str = parts[1].strip()

    if not lhs_str:
        errors.append(
            ValidationIssue(
                code="MISSING_LHS",
                path=f"line_{line_num}",
                message=f"Line {line_num}: Determinant (left side) of dependency is empty: '{line}'.",
                severity="error",
            )
        )
        return

    if not rhs_str:
        errors.append(
            ValidationIssue(
                code="MISSING_RHS",
                path=f"line_{line_num}",
                message=f"Line {line_num}: Dependent (right side) of dependency is empty: '{line}'. Add at least one attribute on RHS.",
                severity="error",
            )
        )
        return

    lhs = _split_attributes(lhs_str)
    rhs = _split_attributes(rhs_str)

    fd_list.append(
        FunctionalDependency(
            id=f"fd-{len(fd_list) + 1}",
            left=lhs,
            right=rhs,
        )
    )


def _parse_mvd_line(
    line: str,
    line_num: int,
    mvd_list: List[MultivaluedDependency],
    errors: List[ValidationIssue],
) -> None:
    if "->>" in line:
        parts = line.split("->>", 1)
    elif "↠" in line:
        parts = line.split("↠", 1)
    else:
        errors.append(
            ValidationIssue(
                code="MISSING_MVD_ARROW",
                path=f"line_{line_num}",
                message=f"Line {line_num}: Missing multivalued dependency arrow '->>' in '{line}'.",
                severity="error",
            )
        )
        return

    lhs_str = parts[0].strip()
    rhs_str = parts[1].strip()

    if not lhs_str:
        errors.append(
            ValidationIssue(
                code="MISSING_MVD_LHS",
                path=f"line_{line_num}",
                message=f"Line {line_num}: Left side of multivalued dependency is empty: '{line}'.",
                severity="error",
            )
        )
        return

    if not rhs_str:
        errors.append(
            ValidationIssue(
                code="MISSING_MVD_RHS",
                path=f"line_{line_num}",
                message=f"Line {line_num}: Right side of multivalued dependency is empty: '{line}'.",
                severity="error",
            )
        )
        return

    lhs = _split_attributes(lhs_str)
    rhs = _split_attributes(rhs_str)

    mvd_list.append(
        MultivaluedDependency(
            id=f"mvd-{len(mvd_list) + 1}",
            left=lhs,
            right=rhs,
        )
    )
