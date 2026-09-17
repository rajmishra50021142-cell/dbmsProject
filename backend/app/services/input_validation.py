"""
Authoritative Input Validation Service for Normalization Lab.

Implements layered validation:
- Layer 1: Field validation (naming, non-emptiness, trimming)
- Layer 2: Cross-field referential validation (keys and FDs reference existing attributes)
- Layer 3: Logical and collection validation (duplicates, trivialities, set equivalence)
- Warnings: Educational notices (missing keys, trivial FDs, unverified user keys)
"""

from typing import List, Set, Dict, Any, Tuple
import re
from app.schemas.domain_contracts import (
    CanonicalSchemaInput,
    FunctionalDependency,
    MultivaluedDependency,
    ValidationIssue,
    ValidationResult,
    ValidationSummary,
)

IDENTIFIER_REGEX = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


def validate_schema_input(raw_input: CanonicalSchemaInput) -> ValidationResult:
    """
    Validates a canonical schema input and returns structured errors and warnings.
    Zero normalization math (closure/keys) is performed here; strictly input integrity.
    """
    errors: List[ValidationIssue] = []
    warnings: List[ValidationIssue] = []

    # Cleaned canonical data
    clean_name = raw_input.name.strip() if raw_input.name else ""
    clean_attrs: List[str] = [a.strip() for a in raw_input.attributes if a and a.strip()]
    
    # -------------------------------------------------------------------------
    # Layer 1: Relation Name Validation
    # -------------------------------------------------------------------------
    if not clean_name:
        errors.append(
            ValidationIssue(
                code="EMPTY_RELATION_NAME",
                path="name",
                message="Relation name is required. Please specify a name such as ENROLLMENT or R.",
                severity="error",
            )
        )
    elif not IDENTIFIER_REGEX.match(clean_name):
        errors.append(
            ValidationIssue(
                code="INVALID_RELATION_NAME",
                path="name",
                message=(
                    f"Relation name '{clean_name}' contains invalid characters. "
                    "Use alphanumeric characters and underscores (e.g. STUDENT_GRADES)."
                ),
                severity="error",
            )
        )

    # -------------------------------------------------------------------------
    # Layer 1 & 3: Attributes Validation
    # -------------------------------------------------------------------------
    if not clean_attrs:
        errors.append(
            ValidationIssue(
                code="NO_ATTRIBUTES",
                path="attributes",
                message="A relation must define at least one attribute to be analyzed.",
                severity="error",
            )
        )

    seen_attrs: Set[str] = set()
    attr_lookup: Set[str] = set()

    for idx, attr in enumerate(clean_attrs):
        if not attr:
            errors.append(
                ValidationIssue(
                    code="EMPTY_ATTRIBUTE",
                    path=f"attributes[{idx}]",
                    message="Attribute name cannot be blank.",
                    severity="error",
                )
            )
            continue

        if not IDENTIFIER_REGEX.match(attr):
            errors.append(
                ValidationIssue(
                    code="INVALID_ATTRIBUTE_IDENTIFIER",
                    path=f"attributes[{idx}]",
                    message=(
                        f"Attribute '{attr}' contains invalid characters. "
                        "Attribute names should start with a letter and contain letters, digits, or underscores."
                    ),
                    severity="error",
                )
            )

        if attr in seen_attrs:
            errors.append(
                ValidationIssue(
                    code="DUPLICATE_ATTRIBUTE",
                    path=f"attributes[{idx}]",
                    message=(
                        f"Duplicate attribute '{attr}'. "
                        "Attribute names must be unique within a relation."
                    ),
                    severity="error",
                )
            )
        else:
            seen_attrs.add(attr)
            attr_lookup.add(attr)

    # -------------------------------------------------------------------------
    # Layer 2 & 3: Candidate Keys Validation
    # -------------------------------------------------------------------------
    clean_keys: List[List[str]] = []
    seen_key_sets: List[Set[str]] = []

    if not raw_input.candidate_keys:
        warnings.append(
            ValidationIssue(
                code="NO_CANDIDATE_KEYS_SUPPLIED",
                path="candidate_keys",
                message=(
                    "No candidate keys provided. The engine will automatically derive all candidate keys "
                    "from functional dependencies."
                ),
                severity="warning",
            )
        )
    else:
        for k_idx, key in enumerate(raw_input.candidate_keys):
            cleaned_key_attrs = [k.strip() for k in key if k and k.strip()]
            if not cleaned_key_attrs:
                errors.append(
                    ValidationIssue(
                        code="EMPTY_CANDIDATE_KEY",
                        path=f"candidate_keys[{k_idx}]",
                        message=f"Candidate Key #{k_idx + 1} contains no attributes. Please specify at least one attribute or remove it.",
                        severity="error",
                    )
                )
                continue

            # Check duplicates within the key
            key_set: Set[str] = set()
            for ka in cleaned_key_attrs:
                if ka not in attr_lookup:
                    errors.append(
                        ValidationIssue(
                            code="UNKNOWN_KEY_ATTRIBUTE",
                            path=f"candidate_keys[{k_idx}]",
                            message=(
                                f"Candidate Key #{k_idx + 1} references attribute '{ka}', "
                                f"which is not defined in relation '{clean_name}'."
                            ),
                            severity="error",
                        )
                    )
                if ka in key_set:
                    errors.append(
                        ValidationIssue(
                            code="DUPLICATE_KEY_ATTRIBUTE",
                            path=f"candidate_keys[{k_idx}]",
                            message=f"Attribute '{ka}' is duplicated inside Candidate Key #{k_idx + 1}.",
                            severity="error",
                        )
                    )
                key_set.add(ka)

            # Check duplicate candidate keys
            if any(key_set == existing_set for existing_set in seen_key_sets):
                errors.append(
                    ValidationIssue(
                        code="DUPLICATE_CANDIDATE_KEY",
                        path=f"candidate_keys[{k_idx}]",
                        message=f"Candidate Key ({', '.join(cleaned_key_attrs)}) is equivalent to an already defined candidate key.",
                        severity="error",
                    )
                )
            else:
                seen_key_sets.append(key_set)
                clean_keys.append(cleaned_key_attrs)

        if clean_keys and not any(e.path.startswith("candidate_keys") for e in errors):
            warnings.append(
                ValidationIssue(
                    code="UNVERIFIED_CANDIDATE_KEYS",
                    path="candidate_keys",
                    message=(
                        f"{len(clean_keys)} candidate key(s) supplied by user. "
                        "These will be mathematically verified against functional dependencies."
                    ),
                    severity="warning",
                )
            )

    # -------------------------------------------------------------------------
    # Layer 2 & 3: Functional Dependencies Validation
    # -------------------------------------------------------------------------
    clean_fds: List[FunctionalDependency] = []
    seen_fd_signatures: Set[Tuple[frozenset, frozenset]] = set()

    if not raw_input.functional_dependencies:
        warnings.append(
            ValidationIssue(
                code="NO_FUNCTIONAL_DEPENDENCIES",
                path="functional_dependencies",
                message=(
                    "No functional dependencies defined. Without dependencies, all non-key attributes "
                    "are assumed independent and 2NF/3NF cannot be fully evaluated."
                ),
                severity="warning",
            )
        )
    else:
        for f_idx, fd in enumerate(raw_input.functional_dependencies):
            lhs = [a.strip() for a in fd.left if a and a.strip()]
            rhs = [a.strip() for a in fd.right if a and a.strip()]

            if not lhs:
                errors.append(
                    ValidationIssue(
                        code="EMPTY_FD_LHS",
                        path=f"functional_dependencies[{f_idx}].left",
                        message=f"Functional Dependency #{f_idx + 1} has an empty determinant (LHS).",
                        severity="error",
                    )
                )
            if not rhs:
                errors.append(
                    ValidationIssue(
                        code="EMPTY_FD_RHS",
                        path=f"functional_dependencies[{f_idx}].right",
                        message=f"Functional Dependency #{f_idx + 1} ({', '.join(lhs)} → ...) has an empty dependent side (RHS).",
                        severity="error",
                    )
                )

            # Check attribute existence
            for la in lhs:
                if la not in attr_lookup:
                    errors.append(
                        ValidationIssue(
                            code="UNKNOWN_FD_ATTRIBUTE",
                            path=f"functional_dependencies[{f_idx}].left",
                            message=f"FD #{f_idx + 1} references unknown determinant attribute '{la}'.",
                            severity="error",
                        )
                    )
            for ra in rhs:
                if ra not in attr_lookup:
                    errors.append(
                        ValidationIssue(
                            code="UNKNOWN_FD_ATTRIBUTE",
                            path=f"functional_dependencies[{f_idx}].right",
                            message=f"FD #{f_idx + 1} references unknown dependent attribute '{ra}'.",
                            severity="error",
                        )
                    )

            # Check duplicate attributes on same side
            if len(lhs) != len(set(lhs)):
                errors.append(
                    ValidationIssue(
                        code="DUPLICATE_FD_ATTRIBUTE",
                        path=f"functional_dependencies[{f_idx}].left",
                        message=f"FD #{f_idx + 1} determinant contains duplicate attribute references.",
                        severity="error",
                    )
                )
            if len(rhs) != len(set(rhs)):
                errors.append(
                    ValidationIssue(
                        code="DUPLICATE_FD_ATTRIBUTE",
                        path=f"functional_dependencies[{f_idx}].right",
                        message=f"FD #{f_idx + 1} dependent side contains duplicate attribute references.",
                        severity="error",
                    )
                )

            # Check duplicate / logically identical FD
            lhs_set = frozenset(lhs)
            rhs_set = frozenset(rhs)
            fd_sig = (lhs_set, rhs_set)

            if fd_sig in seen_fd_signatures:
                errors.append(
                    ValidationIssue(
                        code="DUPLICATE_FUNCTIONAL_DEPENDENCY",
                        path=f"functional_dependencies[{f_idx}]",
                        message=(
                            f"Functional Dependency '{', '.join(lhs)} → {', '.join(rhs)}' "
                            "is duplicated or logically identical to an earlier dependency."
                        ),
                        severity="error",
                    )
                )
            else:
                seen_fd_signatures.add(fd_sig)
                clean_fds.append(FunctionalDependency(id=fd.id or f"fd-{f_idx+1}", left=lhs, right=rhs))

            # Triviality warning (if RHS is a subset of LHS)
            if lhs_set and rhs_set and rhs_set.issubset(lhs_set):
                warnings.append(
                    ValidationIssue(
                        code="TRIVIAL_FUNCTIONAL_DEPENDENCY",
                        path=f"functional_dependencies[{f_idx}]",
                        message=(
                            f"FD #{f_idx + 1} ({', '.join(lhs)} → {', '.join(rhs)}) is trivial "
                            "because the dependent attributes are already present in the determinant."
                        ),
                        severity="warning",
                    )
                )

    # -------------------------------------------------------------------------
    # Layer 2 & 3: Multivalued Dependencies Validation
    # -------------------------------------------------------------------------
    clean_mvds: List[MultivaluedDependency] = []
    seen_mvd_signatures: Set[Tuple[frozenset, frozenset]] = set()

    for m_idx, mvd in enumerate(raw_input.multivalued_dependencies):
        lhs = [a.strip() for a in mvd.left if a and a.strip()]
        rhs = [a.strip() for a in mvd.right if a and a.strip()]

        if not lhs:
            errors.append(
                ValidationIssue(
                    code="EMPTY_MVD_LHS",
                    path=f"multivalued_dependencies[{m_idx}].left",
                    message=f"Multivalued Dependency #{m_idx + 1} has an empty determinant (LHS).",
                    severity="error",
                )
            )
        if not rhs:
            errors.append(
                ValidationIssue(
                    code="EMPTY_MVD_RHS",
                    path=f"multivalued_dependencies[{m_idx}].right",
                    message=f"Multivalued Dependency #{m_idx + 1} has an empty dependent side (RHS).",
                    severity="error",
                )
            )

        for la in lhs:
            if la not in attr_lookup:
                errors.append(
                    ValidationIssue(
                        code="UNKNOWN_MVD_ATTRIBUTE",
                        path=f"multivalued_dependencies[{m_idx}].left",
                        message=f"MVD #{m_idx + 1} references unknown determinant attribute '{la}'.",
                        severity="error",
                    )
                )
        for ra in rhs:
            if ra not in attr_lookup:
                errors.append(
                    ValidationIssue(
                        code="UNKNOWN_MVD_ATTRIBUTE",
                        path=f"multivalued_dependencies[{m_idx}].right",
                        message=f"MVD #{m_idx + 1} references unknown dependent attribute '{ra}'.",
                        severity="error",
                    )
                )

        lhs_set = frozenset(lhs)
        rhs_set = frozenset(rhs)
        mvd_sig = (lhs_set, rhs_set)

        if mvd_sig in seen_mvd_signatures:
            errors.append(
                ValidationIssue(
                    code="DUPLICATE_MULTIVALUED_DEPENDENCY",
                    path=f"multivalued_dependencies[{m_idx}]",
                    message=(
                        f"Multivalued Dependency '{', '.join(lhs)} ↠ {', '.join(rhs)}' "
                        "is duplicated or logically identical to an earlier MVD."
                    ),
                    severity="error",
                )
            )
        else:
            seen_mvd_signatures.add(mvd_sig)
            clean_mvds.append(MultivaluedDependency(id=mvd.id or f"mvd-{m_idx+1}", left=lhs, right=rhs))

    # -------------------------------------------------------------------------
    # Layer 2: Sample Data Validation
    # -------------------------------------------------------------------------
    clean_sample_data: List[Dict[str, Any]] = []
    for r_idx, row in enumerate(raw_input.sample_data):
        clean_row: Dict[str, Any] = {}
        for k, v in row.items():
            if k in attr_lookup:
                clean_row[k] = v
            else:
                warnings.append(
                    ValidationIssue(
                        code="SAMPLE_DATA_UNKNOWN_COLUMN",
                        path=f"sample_data[{r_idx}].{k}",
                        message=f"Sample row #{r_idx + 1} contains column '{k}' which is not in relation attributes.",
                        severity="warning",
                    )
                )
        clean_sample_data.append(clean_row)

    is_valid = len(errors) == 0

    canonical_result = CanonicalSchemaInput(
        name=clean_name or "R",
        attributes=clean_attrs,
        candidate_keys=clean_keys,
        functional_dependencies=clean_fds,
        multivalued_dependencies=clean_mvds,
        sample_data=clean_sample_data,
    ) if is_valid else None

    summary = ValidationSummary(
        relation_name=clean_name or "R",
        attribute_count=len(clean_attrs),
        candidate_key_count=len(clean_keys),
        fd_count=len(clean_fds),
        mvd_count=len(clean_mvds),
        sample_row_count=len(clean_sample_data),
        is_ready_for_analysis=is_valid and len(clean_attrs) > 0,
    )

    return ValidationResult(
        valid=is_valid,
        errors=errors,
        warnings=warnings,
        canonical_input=canonical_result,
        summary=summary,
    )
