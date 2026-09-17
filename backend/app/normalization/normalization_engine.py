"""
Normalization Engine (1NF & 2NF Analysis).

Implements deterministic evaluation of:
  - First Normal Form (1NF):
      * Cell atomicity across sample data tuples.
      * Multi-valued cell detection (delimiters ',', ';', '|', newline).
      * Repeating-group detection in schema attributes (e.g., Phone1, Phone2).
      * Unnested 1NF conceptual transformation preview.
      * Honest limitation handling for schema-only inputs (INSUFFICIENT_DATA).
  - Second Normal Form (2NF):
      * 1NF prerequisite enforcement (BLOCKED_BY_PREREQUISITE if 1NF violated).
      * Reuses Phase 4 verified candidate keys and prime/non-prime attributes.
      * Single-attribute key handling (no proper subsets, cannot violate 2NF).
      * Composite key analysis across all candidate keys.
      * Partial dependency detection on proper subsets (X ⊂ K -> A where A is non-prime).
      * Multi-attribute RHS filtering (isolates non-prime attributes).
      * Direct and implied partial dependencies via Phase 3 closure engine.
      * Structured 2NF decomposition proposal generation (NOT_YET_VERIFIED).
      * Step-by-step educational reasoning trace.

Architectural Rule:
Zero LLM dependencies. All logic is 100% deterministic DBMS relational theory.
"""

import re
import hashlib
import json
from typing import List, Dict, Set, Optional, Any, Tuple
from itertools import combinations

from app.schemas.domain_contracts import (
    CanonicalSchemaInput,
    FunctionalDependency,
    MultivaluedDependency,
    SampleTuple,
    NFStatus,
    NormalForm,
    NF1Violation,
    NF1Transformation,
    NF1Result,
    PartialDependency,
    ProposedRelation,
    DecompositionProposal,
    NF2Result,
    BasicNormalizationAnalysisResult,
    KeyReasoningStep,
    NF3Violation,
    NF3DependencyAnalysis,
    NF3Result,
    NF4Violation,
    NF4MVDAnalysis,
    NF4Result,
    FullNormalizationAnalysisResult,
)
from app.normalization.attribute_set import (
    normalize_attribute_set,
    to_attribute_set,
    is_proper_subset,
)
from app.normalization.fd_engine import FDSet
from app.normalization.closure_engine import compute_attribute_closure
from app.normalization.candidate_key_engine import (
    find_all_candidate_keys,
    check_is_superkey,
)


class NormalizationEngineError(ValueError):
    """Base exception for normalization analysis failures."""
    pass


# =====================================================================
# Input Fingerprinting (Stale-Result Protection)
# =====================================================================

def compute_input_fingerprint(schema: CanonicalSchemaInput) -> str:
    """
    Computes a deterministic SHA-256 fingerprint of the input schema.
    Used by clients to detect when schema edits invalidate previous analysis results.
    """
    norm_attrs = sorted(schema.attributes)
    norm_keys = sorted([sorted(k) for k in schema.candidate_keys])
    norm_fds = sorted([f"{sorted(fd.left)}->{sorted(fd.right)}" for fd in schema.functional_dependencies])
    norm_mvds = sorted([f"{sorted(mvd.left)}->>{sorted(mvd.right)}" for mvd in schema.multivalued_dependencies])
    
    sample_repr = []
    if schema.sample_data:
        for st in schema.sample_data:
            row = extract_row_dict(st)
            sample_repr.append(sorted([(k, str(v)) for k, v in row.items()]))

    payload = {
        "name": schema.name.strip().upper(),
        "attributes": norm_attrs,
        "candidate_keys": norm_keys,
        "fds": norm_fds,
        "mvds": norm_mvds,
        "samples": sample_repr,
    }
    encoded = json.dumps(payload, sort_keys=True).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()[:16]


# =====================================================================
# 1NF Analysis Engine
# =====================================================================

# Delimiters indicating non-atomic values within a string
MULTI_VALUE_DELIMITERS_PATTERN = re.compile(r"[,;|]|\n")

# Pattern detecting repeating group attribute naming like Phone1, Phone2 or Skill_1, Skill_2
REPEATING_GROUP_PATTERN = re.compile(r"^([a-zA-Z_]+?)[-_]?(\d+)$", re.IGNORECASE)


def detect_repeating_groups(attributes: List[str]) -> Dict[str, List[str]]:
    """
    Identifies attributes that appear to form numbered repeating groups (e.g. Phone1, Phone2).
    Returns mapping of prefix -> list of attribute names if 2 or more numbered variants exist.
    """
    groups: Dict[str, List[str]] = {}
    for attr in attributes:
        match = REPEATING_GROUP_PATTERN.match(attr)
        if match:
            prefix = match.group(1).lower()
            groups.setdefault(prefix, []).append(attr)

    return {prefix: attrs for prefix, attrs in groups.items() if len(attrs) >= 2}


def split_cell_value(val: Any) -> List[str]:
    """
    Parses a cell value into atomic items if it represents a multi-valued string or sequence.
    """
    if val is None:
        return []
    if isinstance(val, (list, tuple, set)):
        return [str(item).strip() for item in val if str(item).strip()]
    
    s = str(val).strip()
    if not s:
        return []
        
    parts = MULTI_VALUE_DELIMITERS_PATTERN.split(s)
    cleaned = [p.strip() for p in parts if p.strip()]
    return cleaned if len(cleaned) > 1 else [s]


def extract_row_dict(row: Any) -> Dict[str, Any]:
    """Safely extracts a dictionary mapping attribute names to values from dict or SampleTuple."""
    if isinstance(row, dict):
        if "values" in row and isinstance(row["values"], dict):
            return row["values"]
        return row
    if hasattr(row, "values") and isinstance(row.values, dict):
        return row.values
    return {}


def analyze_1nf(schema: CanonicalSchemaInput) -> NF1Result:
    """
    Evaluates First Normal Form (1NF) on schema structure and sample tuples.
    
    Principles:
      1. Every cell in a relation must contain only single, indivisible (atomic) values.
      2. No repeating attribute groups (e.g. Phone1, Phone2, Phone3).
      3. If no sample tuples are provided, the engine reports INSUFFICIENT_DATA because
         data-level cell atomicity cannot be proven from attribute names alone.
    """
    attributes = normalize_attribute_set(schema.attributes)
    if not attributes:
        raise NormalizationEngineError("Cannot evaluate 1NF: relation has no attributes.")

    reasoning_steps: List[str] = []
    violations: List[NF1Violation] = []
    attributes_involved: Set[str] = set()
    sample_cells_involved: List[Dict[str, Any]] = []
    limitations: List[str] = []

    # Step 1: Check for repeating groups in attribute names
    repeating_groups = detect_repeating_groups(attributes)
    if repeating_groups:
        for prefix, group_attrs in repeating_groups.items():
            attributes_involved.update(group_attrs)
            violations.append(
                NF1Violation(
                    attribute=", ".join(group_attrs),
                    row_index=None,
                    observed_value=group_attrs,
                    reason_code="REPEATING_GROUP_ATTRIBUTES",
                    explanation=(
                        f"Attributes {{{', '.join(group_attrs)}}} form a repeating group with prefix '{prefix}'. "
                        "Representing repeated values as multiple columns violates 1NF principles."
                    ),
                )
            )
        reasoning_steps.append(
            f"Detected {len(repeating_groups)} repeating attribute group(s): "
            + "; ".join(f"{{{', '.join(attrs)}}}" for attrs in repeating_groups.values())
        )
    else:
        reasoning_steps.append("No repeating attribute groups detected in schema column definitions.")

    # Step 2: Inspect sample tuples if provided
    sample_data = schema.sample_data or []
    transformation: Optional[NF1Transformation] = None

    if not sample_data:
        limitations.append(
            "No sample tuples were supplied. 1NF data-level atomicity cannot be fully inspected from schema metadata alone."
        )
        reasoning_steps.append(
            "Sample data evaluation skipped: no tuples supplied by user. Cell-level atomicity remains unverified."
        )

        if violations:
            # Repeating groups were already found in column names
            return NF1Result(
                status=NFStatus.VIOLATED,
                is_satisfied=False,
                reason_code="REPEATING_GROUPS_IN_SCHEMA",
                message="1NF is violated due to repeating attribute groups in the schema definition.",
                violations=violations,
                attributes_involved=sorted(attributes_involved),
                sample_cells_involved=[],
                reasoning_steps=reasoning_steps,
                transformation=None,
                limitations=limitations,
            )

        return NF1Result(
            status=NFStatus.INSUFFICIENT_DATA,
            is_satisfied=False,
            reason_code="NO_SAMPLE_DATA_PROVIDED",
            message="No sample tuples were supplied. 1NF data-level atomicity cannot be fully evaluated without data.",
            violations=[],
            attributes_involved=[],
            sample_cells_involved=[],
            reasoning_steps=reasoning_steps,
            transformation=None,
            limitations=limitations,
        )

    # Inspect each row for multi-valued cells
    reasoning_steps.append(f"Inspecting {len(sample_data)} sample tuple(s) for multi-valued cell values...")
    multi_valued_row_count = 0

    for row_idx, row_obj in enumerate(sample_data):
        row = extract_row_dict(row_obj)
        row_has_violation = False
        for attr in attributes:
            val = row.get(attr)
            split_items = split_cell_value(val)
            if len(split_items) > 1:
                row_has_violation = True
                attributes_involved.add(attr)
                sample_cells_involved.append({
                    "row_index": row_idx,
                    "attribute": attr,
                    "value": str(val),
                    "split_values": split_items,
                })
                violations.append(
                    NF1Violation(
                        attribute=attr,
                        row_index=row_idx,
                        observed_value=str(val),
                        reason_code="NON_ATOMIC_VALUE",
                        explanation=(
                            f"Row #{row_idx + 1} attribute '{attr}' contains multi-valued cell: \"{val}\" "
                            f"(parsed into {len(split_items)} values: {split_items}). Each cell must hold exactly one atomic value."
                        ),
                    )
                )
        if row_has_violation:
            multi_valued_row_count += 1

    # If non-atomic values found, build conceptual 1NF transformation
    if multi_valued_row_count > 0:
        reasoning_steps.append(
            f"Detected non-atomic values in {multi_valued_row_count} sample row(s) across attribute(s): "
            f"{{{', '.join(sorted(attributes_involved))}}}."
        )

        original_tuples = [extract_row_dict(st) for st in sample_data]
        transformed_tuples: List[Dict[str, Any]] = []

        for row_obj in sample_data:
            row = extract_row_dict(row_obj)
            # Compute Cartesian expansion of any split cells in this row
            base_rows: List[Dict[str, Any]] = [{}]
            for attr in attributes:
                val = row.get(attr)
                items = split_cell_value(val) if val is not None else [""]
                new_base: List[Dict[str, Any]] = []
                for b in base_rows:
                    for item in items:
                        new_dict = dict(b)
                        new_dict[attr] = item
                        new_base.append(new_dict)
                base_rows = new_base
            transformed_tuples.extend(base_rows)

        transformation = NF1Transformation(
            original_tuples=original_tuples,
            transformed_tuples=transformed_tuples,
            explanation=(
                f"Flattened multi-valued attributes {{{', '.join(sorted(attributes_involved))}}} "
                f"from {len(original_tuples)} original row(s) into {len(transformed_tuples)} atomic 1NF row(s)."
            ),
        )

        return NF1Result(
            status=NFStatus.VIOLATED,
            is_satisfied=False,
            reason_code="NON_ATOMIC_VALUES_DETECTED",
            message=f"1NF is violated: found {len(violations)} non-atomic cell representation(s) across {multi_valued_row_count} row(s).",
            violations=violations,
            attributes_involved=sorted(attributes_involved),
            sample_cells_involved=sample_cells_involved,
            reasoning_steps=reasoning_steps,
            transformation=transformation,
            limitations=limitations,
        )

    # If repeating groups were found, it's violated even if cell strings look single
    if violations:
        return NF1Result(
            status=NFStatus.VIOLATED,
            is_satisfied=False,
            reason_code="REPEATING_GROUPS_IN_SCHEMA",
            message="1NF is violated due to repeating attribute groups in schema columns.",
            violations=violations,
            attributes_involved=sorted(attributes_involved),
            sample_cells_involved=[],
            reasoning_steps=reasoning_steps,
            transformation=None,
            limitations=limitations,
        )

    # All sample data checked and atomic
    reasoning_steps.append("All inspected sample data cells contain single atomic values with no repeating groups.")
    return NF1Result(
        status=NFStatus.SATISFIED,
        is_satisfied=True,
        reason_code="ATOMIC_CELLS_VERIFIED",
        message="All inspected sample data cells satisfy 1NF atomicity requirements.",
        violations=[],
        attributes_involved=[],
        sample_cells_involved=[],
        reasoning_steps=reasoning_steps,
        transformation=None,
        limitations=limitations,
    )


# =====================================================================
# 2NF Analysis Engine
# =====================================================================

def analyze_2nf(
    schema: CanonicalSchemaInput,
    nf1_result: Optional[NF1Result] = None,
    candidate_keys_override: Optional[List[List[str]]] = None,
) -> NF2Result:
    """
    Evaluates Second Normal Form (2NF) on the relation schema.
    
    Formal Definition:
      A relation schema R is in 2NF if:
        1. It is in 1NF (1NF prerequisite).
        2. No non-prime attribute is partially dependent on any proper subset of any candidate key.
        
    Mathematical Rules:
      - Single-attribute Candidate Keys:
        If all candidate keys have size 1, no non-empty proper subset exists.
        Therefore, partial dependencies cannot mathematically occur.
      - All-Prime Attributes:
        If all attributes in R are prime (belong to at least one candidate key),
        no non-prime attribute exists to be partially dependent. 2NF is satisfied.
      - Composite Candidate Keys:
        For each composite candidate key K (|K| >= 2) and every non-empty proper subset S ⊂ K:
          Compute S+ under F.
          Every attribute A in (S+ \\ S) that is NON-PRIME represents a partial dependency S -> A.
    """
    attributes = normalize_attribute_set(schema.attributes)
    if not attributes:
        raise NormalizationEngineError("Cannot evaluate 2NF: relation has no attributes.")

    relation_name = schema.name.strip() or "R"
    rel_set = to_attribute_set(attributes)
    fds = schema.functional_dependencies

    limitations: List[str] = []
    reasoning_steps: List[KeyReasoningStep] = []
    step_num = 1

    # Step 1: 1NF Prerequisite Assessment
    if nf1_result is None:
        nf1_result = analyze_1nf(schema)

    prereq_status = nf1_result.status

    reasoning_steps.append(
        KeyReasoningStep(
            step_number=step_num,
            title="1NF Prerequisite Assessment",
            description=(
                f"1NF status evaluated as {prereq_status.value}. "
                + (
                    "Prerequisite satisfied."
                    if prereq_status == NFStatus.SATISFIED
                    else (
                        "Warning: 2NF formally requires 1NF compliance. Because 1NF was violated, "
                        "official 2NF status is blocked by prerequisite, though functional dependency structure will still be analyzed."
                        if prereq_status == NFStatus.VIOLATED
                        else "Notice: 1NF data-level atomicity is unverified (insufficient sample data). 2NF dependency analysis proceeds conditionally."
                    )
                )
            ),
            details={"1nf_status": prereq_status.value},
        )
    )
    step_num += 1

    # Step 2: Retrieve Verified Candidate Keys from Phase 4
    if candidate_keys_override:
        candidate_keys = [normalize_attribute_set(k) for k in candidate_keys_override]
        prime_set = set()
        for k in candidate_keys:
            prime_set.update(k)
        prime_attrs = [a for a in attributes if a in prime_set]
        non_prime_attrs = [a for a in attributes if a not in prime_set]
    else:
        key_res = find_all_candidate_keys(
            attributes=attributes,
            fds=fds,
            relation_name=relation_name,
        )
        candidate_keys = key_res.candidate_keys
        prime_attrs = key_res.prime_attributes
        non_prime_attrs = key_res.non_prime_attributes

    prime_set = set(prime_attrs)
    non_prime_set = set(non_prime_attrs)

    reasoning_steps.append(
        KeyReasoningStep(
            step_number=step_num,
            title="Candidate Keys & Attribute Classification",
            description=(
                f"Identified {len(candidate_keys)} candidate key(s): "
                + ", ".join(f"({', '.join(k)})" for k in candidate_keys)
                + f". Prime attributes (participating in at least one candidate key) = {{{', '.join(prime_attrs) or '∅'}}}. "
                + f"Non-prime attributes = {{{', '.join(non_prime_attrs) or '∅'}}}."
            ),
            details={
                "candidate_keys": candidate_keys,
                "prime_attributes": prime_attrs,
                "non_prime_attributes": non_prime_attrs,
            },
        )
    )
    step_num += 1

    # Step 3: Check for Composite Candidate Keys
    composite_keys = [k for k in candidate_keys if len(k) > 1]

    if not composite_keys:
        # All keys are single-attribute keys!
        reasoning_steps.append(
            KeyReasoningStep(
                step_number=step_num,
                title="Candidate Key Arity Check",
                description=(
                    "All candidate keys consist of single attributes (arity 1). "
                    "A non-empty proper subset of a single-attribute key is mathematically impossible. "
                    "Therefore, no partial dependency can exist."
                ),
                details={"composite_keys": []},
            )
        )

        final_status = NFStatus.SATISFIED if prereq_status != NFStatus.VIOLATED else NFStatus.BLOCKED_BY_PREREQUISITE
        return NF2Result(
            status=final_status,
            is_satisfied=(final_status == NFStatus.SATISFIED),
            reason_code="SINGLE_ATTRIBUTE_KEYS_NO_PARTIAL_DEPENDENCY",
            message=(
                "All candidate keys are single-attribute keys. Partial dependencies cannot mathematically occur."
                + (" (Blocked by 1NF prerequisite)." if final_status == NFStatus.BLOCKED_BY_PREREQUISITE else "")
            ),
            prerequisite_1nf_status=prereq_status,
            candidate_keys=candidate_keys,
            composite_keys=[],
            prime_attributes=prime_attrs,
            non_prime_attributes=non_prime_attrs,
            partial_dependencies=[],
            reasoning_steps=reasoning_steps,
            decomposition_proposal=None,
            limitations=limitations,
        )

    # Step 4: Check if any non-prime attributes exist
    if not non_prime_attrs:
        reasoning_steps.append(
            KeyReasoningStep(
                step_number=step_num,
                title="Non-Prime Attribute Check",
                description=(
                    "Every attribute in the relation belongs to at least one candidate key (all attributes are prime). "
                    "Because 2NF only forbids non-prime attributes from depending on proper subsets of candidate keys, "
                    "2NF is automatically satisfied."
                ),
                details={"non_prime_attributes": []},
            )
        )

        final_status = NFStatus.SATISFIED if prereq_status != NFStatus.VIOLATED else NFStatus.BLOCKED_BY_PREREQUISITE
        return NF2Result(
            status=final_status,
            is_satisfied=(final_status == NFStatus.SATISFIED),
            reason_code="ALL_ATTRIBUTES_PRIME",
            message=(
                "All attributes are prime. No non-prime attributes exist to form partial dependencies."
                + (" (Blocked by 1NF prerequisite)." if final_status == NFStatus.BLOCKED_BY_PREREQUISITE else "")
            ),
            prerequisite_1nf_status=prereq_status,
            candidate_keys=candidate_keys,
            composite_keys=composite_keys,
            prime_attributes=prime_attrs,
            non_prime_attributes=[],
            partial_dependencies=[],
            reasoning_steps=reasoning_steps,
            decomposition_proposal=None,
            limitations=limitations,
        )

    # Step 5: Partial Dependency Detection across all Composite Candidate Keys
    partial_dependencies: List[PartialDependency] = []
    seen_pd_signatures: Set[Tuple[Tuple[str, ...], Tuple[str, ...]]] = set()

    for ck in composite_keys:
        ck_set = to_attribute_set(ck)
        # Generate proper non-empty subsets of composite key ck
        for subset_size in range(1, len(ck)):
            for subset_tuple in combinations(ck, subset_size):
                subset = list(subset_tuple)
                subset_set = to_attribute_set(subset)

                # Compute closure of subset under F
                closure_res = compute_attribute_closure(
                    attributes=attributes,
                    fds=fds,
                    target_attributes=subset,
                    relation_name=relation_name,
                )
                closure_set = to_attribute_set(closure_res.closure)

                # Identify non-prime attributes determined by subset
                determined_non_prime = sorted(list((closure_set - subset_set) & non_prime_set))
                if determined_non_prime:
                    pd_sig = (tuple(sorted(subset)), tuple(sorted(determined_non_prime)))
                    if pd_sig in seen_pd_signatures:
                        continue
                    seen_pd_signatures.add(pd_sig)

                    # Check if directly stated in an FD or implied via closure
                    direct_fd = None
                    for fd in fds:
                        if to_attribute_set(fd.left) == subset_set and any(r in determined_non_prime for r in fd.right):
                            direct_fd = fd
                            break

                    is_implied = direct_fd is None
                    source_fd_str = direct_fd.notation() if direct_fd else f"({', '.join(subset)})+ ⊇ {{{', '.join(determined_non_prime)}}}"

                    explanation = (
                        f"Determinant ({', '.join(subset)}) is a proper subset of candidate key ({', '.join(ck)}) "
                        f"and functionally determines non-prime attribute(s) {{{', '.join(determined_non_prime)}}}. "
                        f"{'Directly specified by FD: ' + source_fd_str if not is_implied else 'Derived through attribute closure: ' + source_fd_str}."
                    )

                    partial_dependencies.append(
                        PartialDependency(
                            determinant=subset,
                            dependent_attributes=determined_non_prime,
                            affected_candidate_key=ck,
                            is_implied=is_implied,
                            source_fd=source_fd_str,
                            explanation=explanation,
                        )
                    )

    # Step 6: Formulate Result and Decomposition Proposal
    if partial_dependencies:
        reasoning_steps.append(
            KeyReasoningStep(
                step_number=step_num,
                title="Partial Dependency Analysis",
                description=(
                    f"Detected {len(partial_dependencies)} partial dependency violation(s): "
                    + "; ".join(f"({', '.join(pd.determinant)}) → {{{', '.join(pd.dependent_attributes)}}}" for pd in partial_dependencies)
                    + ". These non-prime attributes depend on only part of a composite candidate key."
                ),
                details={"partial_dependencies": [pd.model_dump() for pd in partial_dependencies]},
            )
        )
        step_num += 1

        # Generate 2NF Decomposition Proposal
        proposed_relations: List[ProposedRelation] = []
        extracted_non_prime: Set[str] = set()

        # Create a sub-relation for each partial dependency determinant
        for idx, pd in enumerate(partial_dependencies, 1):
            sub_name = f"{relation_name}_{'_'.join(pd.determinant)}"
            sub_attrs = sorted(list(set(pd.determinant + pd.dependent_attributes)))
            extracted_non_prime.update(pd.dependent_attributes)

            # Relevant FDs for this sub-relation
            sub_fds = [
                fd for fd in fds
                if set(fd.left).issubset(set(sub_attrs)) and set(fd.right).issubset(set(sub_attrs))
            ]

            proposed_relations.append(
                ProposedRelation(
                    name=sub_name,
                    attributes=sub_attrs,
                    primary_key=pd.determinant,
                    functional_dependencies=sub_fds,
                    purpose=f"Isolates partial dependency ({', '.join(pd.determinant)}) → {{{', '.join(pd.dependent_attributes)}}} into its own entity relation.",
                )
            )

        # Remainder relation containing candidate key(s) and remaining non-prime attributes
        primary_ck = candidate_keys[0]
        remaining_non_prime = sorted(list(non_prime_set - extracted_non_prime))
        remainder_attrs = sorted(list(set(primary_ck + remaining_non_prime)))
        remainder_name = f"{relation_name}_REMAINDER" if remaining_non_prime else f"{relation_name}_ASSIGNMENT"

        remainder_fds = [
            fd for fd in fds
            if set(fd.left).issubset(set(remainder_attrs)) and set(fd.right).issubset(set(remainder_attrs))
        ]

        proposed_relations.append(
            ProposedRelation(
                name=remainder_name,
                attributes=remainder_attrs,
                primary_key=primary_ck,
                functional_dependencies=remainder_fds,
                purpose=f"Preserves primary candidate key ({', '.join(primary_ck)}) and remaining attributes.",
            )
        )

        decomposition_proposal = DecompositionProposal(
            source_relation=relation_name,
            proposed_relations=proposed_relations,
            reason_code="DECOMPOSE_PARTIAL_DEPENDENCIES",
            explanation=(
                f"Decomposed relation '{relation_name}' into {len(proposed_relations)} sub-relations to eliminate partial dependencies. "
                "Each partial dependency determinant forms the primary key of its own sub-relation, while the original candidate key is retained in the remainder relation."
            ),
            verification_status="NOT_YET_VERIFIED",
        )

        reasoning_steps.append(
            KeyReasoningStep(
                step_number=step_num,
                title="2NF Decomposition Proposal",
                description=(
                    f"Generated conceptual decomposition proposing {len(proposed_relations)} sub-relations: "
                    + ", ".join(f"{pr.name}({', '.join(pr.attributes)})" for pr in proposed_relations)
                    + ". (Formal lossless-join and dependency-preservation verification will be evaluated in the Decomposition Workspace)."
                ),
                details={"proposed_relations": [pr.model_dump() for pr in proposed_relations]},
            )
        )

        final_status = NFStatus.BLOCKED_BY_PREREQUISITE if prereq_status == NFStatus.VIOLATED else NFStatus.VIOLATED

        return NF2Result(
            status=final_status,
            is_satisfied=False,
            reason_code="PARTIAL_DEPENDENCIES_DETECTED" if final_status == NFStatus.VIOLATED else "PREREQUISITE_1NF_VIOLATED",
            message=(
                f"2NF is violated: detected {len(partial_dependencies)} partial dependency relationship(s)."
                if final_status == NFStatus.VIOLATED
                else "2NF analysis is blocked by 1NF prerequisite violations, though partial dependencies were detected in schema dependencies."
            ),
            prerequisite_1nf_status=prereq_status,
            candidate_keys=candidate_keys,
            composite_keys=composite_keys,
            prime_attributes=prime_attrs,
            non_prime_attributes=non_prime_attrs,
            partial_dependencies=partial_dependencies,
            reasoning_steps=reasoning_steps,
            decomposition_proposal=decomposition_proposal,
            limitations=limitations,
        )

    # No partial dependencies found
    reasoning_steps.append(
        KeyReasoningStep(
            step_number=step_num,
            title="Partial Dependency Analysis",
            description=(
                "Evaluated all proper subsets of composite candidate key(s). "
                "No proper subset functionally determines any non-prime attribute. "
                "All non-prime attributes are fully functionally dependent on the entire candidate key."
            ),
            details={"partial_dependencies": []},
        )
    )

    final_status = NFStatus.SATISFIED if prereq_status != NFStatus.VIOLATED else NFStatus.BLOCKED_BY_PREREQUISITE

    return NF2Result(
        status=final_status,
        is_satisfied=(final_status == NFStatus.SATISFIED),
        reason_code="NO_PARTIAL_DEPENDENCIES" if final_status == NFStatus.SATISFIED else "PREREQUISITE_1NF_VIOLATED",
        message=(
            "No partial dependencies detected. Every non-prime attribute is fully functionally dependent on the complete candidate key(s)."
            if final_status == NFStatus.SATISFIED
            else "No partial dependencies detected in schema FDs, but 2NF status is blocked because 1NF prerequisite is violated."
        ),
        prerequisite_1nf_status=prereq_status,
        candidate_keys=candidate_keys,
        composite_keys=composite_keys,
        prime_attributes=prime_attrs,
        non_prime_attributes=non_prime_attrs,
        partial_dependencies=[],
        reasoning_steps=reasoning_steps,
        decomposition_proposal=None,
        limitations=limitations,
    )


# =====================================================================
# 3NF Analysis Engine
# =====================================================================

def analyze_3nf(
    schema: CanonicalSchemaInput,
    nf1_result: Optional[NF1Result] = None,
    nf2_result: Optional[NF2Result] = None,
    candidate_keys_override: Optional[List[List[str]]] = None,
) -> NF3Result:
    """
    Evaluates Third Normal Form (3NF) on the relation schema.
    
    Formal Definition:
      A relation schema R is in 3NF if:
        1. It is in 2NF (2NF prerequisite).
        2. For every non-trivial functional dependency X -> A in F+:
           EITHER X is a superkey of R
           OR A is a prime attribute of R (belongs to some candidate key).
           
    Mathematical Rules:
      - Trivial FDs (Y ⊆ X):
        Satisfied vacuously by Armstrong's Reflexivity Axiom.
      - Superkey Determinant:
        If X+ = R, the dependency does not cause transitive redundancy. Satisfied.
      - Prime Dependent Attribute (Prime Exception):
        If X is not a superkey, but A ∈ Prime, the dependency is permissible in 3NF.
      - 3NF Violation:
        If X is NOT a superkey AND dependent attribute A is NON-PRIME,
        a transitive dependency anomaly is present. Violates 3NF.
    """
    attributes = normalize_attribute_set(schema.attributes)
    if not attributes:
        raise NormalizationEngineError("Cannot evaluate 3NF: relation has no attributes.")

    relation_name = schema.name.strip() or "R"
    rel_set = to_attribute_set(attributes)
    fds = schema.functional_dependencies

    limitations: List[str] = []
    reasoning_steps: List[KeyReasoningStep] = []
    step_num = 1

    # Step 1: 2NF Prerequisite Assessment
    if nf1_result is None:
        nf1_result = analyze_1nf(schema)
    if nf2_result is None:
        nf2_result = analyze_2nf(schema, nf1_result=nf1_result, candidate_keys_override=candidate_keys_override)

    prereq_2nf_status = nf2_result.status

    reasoning_steps.append(
        KeyReasoningStep(
            step_number=step_num,
            title="2NF Prerequisite Assessment",
            description=(
                f"2NF status evaluated as {prereq_2nf_status.value}. "
                + (
                    "Prerequisite satisfied."
                    if prereq_2nf_status == NFStatus.SATISFIED
                    else (
                        "Warning: 3NF formally requires 2NF compliance. Because 2NF was violated, "
                        "official 3NF status is blocked by prerequisite, though functional dependencies will still be inspected for educational clarity."
                        if prereq_2nf_status in (NFStatus.VIOLATED, NFStatus.BLOCKED_BY_PREREQUISITE)
                        else "Notice: 2NF dependency analysis is conditional. 3NF analysis proceeds conditionally."
                    )
                )
            ),
            details={"2nf_status": prereq_2nf_status.value},
        )
    )
    step_num += 1

    # Step 2: Retrieve Candidate Keys and Prime/Non-Prime Attributes
    candidate_keys = nf2_result.candidate_keys
    prime_attrs = nf2_result.prime_attributes
    non_prime_attrs = nf2_result.non_prime_attributes
    prime_set = set(prime_attrs)
    non_prime_set = set(non_prime_attrs)

    reasoning_steps.append(
        KeyReasoningStep(
            step_number=step_num,
            title="Candidate Keys & Prime Classification Context",
            description=(
                f"Using verified candidate keys: "
                + ", ".join(f"({', '.join(k)})" for k in candidate_keys)
                + f". Prime attributes = {{{', '.join(prime_attrs) or '∅'}}}. "
                + f"Non-prime attributes = {{{', '.join(non_prime_attrs) or '∅'}}}."
            ),
            details={
                "candidate_keys": candidate_keys,
                "prime_attributes": prime_attrs,
                "non_prime_attributes": non_prime_attrs,
            },
        )
    )
    step_num += 1

    # Step 3: Analyze each Functional Dependency for 3NF Conditions
    dependencies_analyzed: List[NF3DependencyAnalysis] = []
    trivial_dependencies: List[FunctionalDependency] = []
    satisfied_dependencies: List[FunctionalDependency] = []
    violations: List[NF3Violation] = []
    transitive_patterns: List[str] = []

    # Cache superkey checks for efficiency within this analysis
    superkey_cache: Dict[Tuple[str, ...], bool] = {}

    def is_det_superkey(lhs_attrs: List[str]) -> bool:
        cache_key = tuple(sorted(lhs_attrs))
        if cache_key not in superkey_cache:
            res = check_is_superkey(attributes, fds, lhs_attrs, relation_name)
            superkey_cache[cache_key] = res.is_superkey
        return superkey_cache[cache_key]

    for fd in fds:
        lhs_norm = normalize_attribute_set(fd.left)
        rhs_norm = normalize_attribute_set(fd.right)
        lhs_set = set(lhs_norm)
        rhs_set = set(rhs_norm)

        # Check triviality: RHS ⊆ LHS
        is_trivial = rhs_set.issubset(lhs_set)
        if is_trivial:
            trivial_dependencies.append(fd)
            dependencies_analyzed.append(
                NF3DependencyAnalysis(
                    functional_dependency=fd,
                    is_trivial=True,
                    determinant_is_superkey=False,
                    rhs_prime_status={a: (a in prime_set) for a in rhs_norm},
                    satisfies_3nf=True,
                    reason_code="TRIVIAL_FD",
                    explanation=f"Dependency {fd.notation()} is trivial (RHS ⊆ LHS). Trivial dependencies satisfy 3NF vacuously.",
                )
            )
            continue

        # Check if determinant is superkey
        det_is_superkey = is_det_superkey(lhs_norm)
        rhs_prime_status = {a: (a in prime_set) for a in rhs_norm}

        if det_is_superkey:
            satisfied_dependencies.append(fd)
            dependencies_analyzed.append(
                NF3DependencyAnalysis(
                    functional_dependency=fd,
                    is_trivial=False,
                    determinant_is_superkey=True,
                    rhs_prime_status=rhs_prime_status,
                    satisfies_3nf=True,
                    reason_code="SUPERKEY_DETERMINANT",
                    explanation=f"Determinant ({', '.join(lhs_norm)}) is a superkey of relation {relation_name}. Satisfies 3NF condition.",
                )
            )
            continue

        # Determinant is NOT a superkey: check each non-trivial dependent attribute
        violating_attrs = [a for a in rhs_norm if a not in lhs_set and a not in prime_set]
        prime_rhs_attrs = [a for a in rhs_norm if a not in lhs_set and a in prime_set]

        if not violating_attrs:
            # All non-trivial RHS attributes are prime!
            satisfied_dependencies.append(fd)
            dependencies_analyzed.append(
                NF3DependencyAnalysis(
                    functional_dependency=fd,
                    is_trivial=False,
                    determinant_is_superkey=False,
                    rhs_prime_status=rhs_prime_status,
                    satisfies_3nf=True,
                    reason_code="PRIME_DEPENDENT_ATTRIBUTE",
                    explanation=(
                        f"Determinant ({', '.join(lhs_norm)}) is not a superkey, but all non-trivial dependent attribute(s) "
                        f"{{{', '.join(prime_rhs_attrs)}}} are prime attributes (belong to at least one candidate key). "
                        "Satisfies 3NF condition via the prime-attribute exception."
                    ),
                )
            )
        else:
            # 3NF Violation: Determinant is not superkey AND non-prime dependent attributes exist
            # Synthesize transitive dependency pattern: Find a candidate key K where K -> lhs and lhs -> violating_attrs
            transitive_chain = None
            for ck in candidate_keys:
                ck_set = set(ck)
                # If determinant does not contain candidate key K and violating attrs are not in K
                if not ck_set.issubset(lhs_set) and not any(v in ck_set for v in violating_attrs):
                    transitive_chain = [", ".join(ck), ", ".join(lhs_norm), ", ".join(violating_attrs)]
                    pattern_str = f"({', '.join(ck)}) → ({', '.join(lhs_norm)}) → {{{', '.join(violating_attrs)}}}"
                    if pattern_str not in transitive_patterns:
                        transitive_patterns.append(pattern_str)
                    break

            exp = (
                f"Determinant ({', '.join(lhs_norm)}) is not a superkey of relation '{relation_name}', "
                f"and dependent attribute(s) {{{', '.join(violating_attrs)}}} are non-prime (do not belong to any candidate key). "
                + (
                    f"Forms a transitive dependency chain: {transitive_chain[0]} → {transitive_chain[1]} → {transitive_chain[2]}."
                    if transitive_chain
                    else "Neither 3NF condition is satisfied."
                )
            )

            violation = NF3Violation(
                functional_dependency=fd,
                determinant=lhs_norm,
                dependent_attributes=violating_attrs,
                determinant_is_superkey=False,
                dependent_attribute_prime_status=rhs_prime_status,
                reason_code="NON_SUPERKEY_NON_PRIME_DEPENDENT",
                transitive_chain=transitive_chain,
                explanation=exp,
            )
            violations.append(violation)

            dependencies_analyzed.append(
                NF3DependencyAnalysis(
                    functional_dependency=fd,
                    is_trivial=False,
                    determinant_is_superkey=False,
                    rhs_prime_status=rhs_prime_status,
                    satisfies_3nf=False,
                    reason_code="NON_SUPERKEY_NON_PRIME_DEPENDENT",
                    explanation=exp,
                )
            )

    # Step 4: Step-by-Step Reasoning Trace
    if violations:
        reasoning_steps.append(
            KeyReasoningStep(
                step_number=step_num,
                title="3NF Violation Detection",
                description=(
                    f"Detected {len(violations)} functional dependency violation(s) of 3NF: "
                    + "; ".join(f"({', '.join(v.determinant)}) → {{{', '.join(v.dependent_attributes)}}}" for v in violations)
                    + ". In each case, determinant is not a superkey and dependent attribute is non-prime."
                ),
                details={"violations": [v.model_dump() for v in violations]},
            )
        )
        step_num += 1
    else:
        reasoning_steps.append(
            KeyReasoningStep(
                step_number=step_num,
                title="3NF Condition Verification",
                description=(
                    f"Analyzed {len(fds)} functional dependency/dependencies. "
                    "For every non-trivial FD X → A, either X is a superkey or A is a prime attribute. "
                    "No transitive dependency violations detected."
                ),
                details={"dependencies_analyzed_count": len(dependencies_analyzed)},
            )
        )
        step_num += 1

    # Step 5: 3NF Decomposition Proposal
    decomposition_proposal = None
    if violations:
        proposed_relations: List[ProposedRelation] = []
        extracted_non_prime: Set[str] = set()

        # Group violations by determinant
        grouped_violating_deps: Dict[Tuple[str, ...], Set[str]] = {}
        for v in violations:
            key = tuple(sorted(v.determinant))
            grouped_violating_deps.setdefault(key, set()).update(v.dependent_attributes)

        for det_tuple, dep_set in grouped_violating_deps.items():
            det_list = list(det_tuple)
            dep_list = sorted(list(dep_set))
            extracted_non_prime.update(dep_list)

            sub_name = f"{relation_name}_{'_'.join(det_list)}"
            sub_attrs = sorted(list(set(det_list + dep_list)))

            sub_fds = [
                fd for fd in fds
                if set(fd.left).issubset(set(sub_attrs)) and set(fd.right).issubset(set(sub_attrs))
            ]

            proposed_relations.append(
                ProposedRelation(
                    name=sub_name,
                    attributes=sub_attrs,
                    primary_key=det_list,
                    functional_dependencies=sub_fds,
                    purpose=f"Isolates transitive dependency ({', '.join(det_list)}) → {{{', '.join(dep_list)}}} into its own entity relation.",
                )
            )

        # Remainder relation preserving original candidate key
        primary_ck = candidate_keys[0] if candidate_keys else attributes[:1]
        remaining_non_prime = sorted(list(non_prime_set - extracted_non_prime))
        remainder_attrs = sorted(list(set(primary_ck + remaining_non_prime)))
        remainder_name = f"{relation_name}_REMAINDER" if remaining_non_prime else f"{relation_name}_CORE"

        remainder_fds = [
            fd for fd in fds
            if set(fd.left).issubset(set(remainder_attrs)) and set(fd.right).issubset(set(remainder_attrs))
        ]

        proposed_relations.append(
            ProposedRelation(
                name=remainder_name,
                attributes=remainder_attrs,
                primary_key=primary_ck,
                functional_dependencies=remainder_fds,
                purpose=f"Preserves primary candidate key ({', '.join(primary_ck)}) and remaining attributes.",
            )
        )

        decomposition_proposal = DecompositionProposal(
            source_relation=relation_name,
            proposed_relations=proposed_relations,
            reason_code="DECOMPOSE_TRANSITIVE_DEPENDENCIES",
            explanation=(
                f"Decomposed relation '{relation_name}' into {len(proposed_relations)} sub-relations to eliminate 3NF transitive dependencies. "
                "Each non-superkey determinant forms the primary key of its own relation, while the candidate key is retained in the remainder relation."
            ),
            verification_status="NOT_YET_VERIFIED",
        )

        reasoning_steps.append(
            KeyReasoningStep(
                step_number=step_num,
                title="3NF Decomposition Proposal",
                description=(
                    f"Generated conceptual decomposition proposing {len(proposed_relations)} sub-relations: "
                    + ", ".join(f"{pr.name}({', '.join(pr.attributes)})" for pr in proposed_relations)
                    + ". (Formal lossless-join and dependency-preservation verification will be evaluated in the Decomposition Workspace)."
                ),
                details={"proposed_relations": [pr.model_dump() for pr in proposed_relations]},
            )
        )

    # Step 6: Determine Final Status
    if prereq_2nf_status in (NFStatus.VIOLATED, NFStatus.BLOCKED_BY_PREREQUISITE):
        final_status = NFStatus.BLOCKED_BY_PREREQUISITE
        is_satisfied = False
        message = "3NF analysis is blocked because 2NF prerequisite is not satisfied, though functional dependencies were inspected."
        reason_code = "PREREQUISITE_2NF_NOT_SATISFIED"
    elif violations:
        final_status = NFStatus.VIOLATED
        is_satisfied = False
        message = f"3NF is violated: detected {len(violations)} non-superkey dependency/dependencies determining non-prime attribute(s)."
        reason_code = "TRANSITIVE_DEPENDENCIES_DETECTED"
    else:
        final_status = NFStatus.SATISFIED
        is_satisfied = True
        message = "3NF is satisfied: for all non-trivial functional dependencies, the determinant is a superkey or the dependent attribute is prime."
        reason_code = "ALL_FDS_SATISFY_3NF"

    return NF3Result(
        status=final_status,
        is_satisfied=is_satisfied,
        reason_code=reason_code,
        message=message,
        prerequisite_2nf_status=prereq_2nf_status,
        candidate_keys=candidate_keys,
        prime_attributes=prime_attrs,
        non_prime_attributes=non_prime_attrs,
        dependencies_analyzed=dependencies_analyzed,
        trivial_dependencies=trivial_dependencies,
        satisfied_dependencies=satisfied_dependencies,
        violations=violations,
        transitive_patterns=transitive_patterns,
        reasoning_steps=reasoning_steps,
        decomposition_proposal=decomposition_proposal,
        limitations=limitations,
    )


# =====================================================================
# 4NF Analysis Engine
# =====================================================================

def analyze_4nf(
    schema: CanonicalSchemaInput,
    nf1_result: Optional[NF1Result] = None,
    nf2_result: Optional[NF2Result] = None,
    nf3_result: Optional[NF3Result] = None,
    candidate_keys_override: Optional[List[List[str]]] = None,
) -> NF4Result:
    """
    Evaluates Fourth Normal Form (4NF) on the relation schema.
    
    Formal Definition:
      A relation schema R is in 4NF if:
        1. It is in 3NF (3NF prerequisite).
        2. For every non-trivial multivalued dependency X ->> Y:
           X is a superkey of R.
           
    Mathematical Rules:
      - Trivial MVDs:
        An MVD X ->> Y is trivial if:
          (a) Y ⊆ X (dependent set is subset of determinant), OR
          (b) X ∪ Y = R (determinant and dependent set together equal relation schema).
        Trivial MVDs cannot cause 4NF violations.
      - Non-Trivial MVDs:
        If X ->> Y is non-trivial, X must be a superkey of R (X+ = R under F).
        If X is not a superkey, 4NF is violated due to independent multivalued facts
        generating Cartesian product tuple redundancy.
      - Absence of MVDs:
        If no MVDs are supplied in the schema, 4NF status is INSUFFICIENT_DATA.
    """
    attributes = normalize_attribute_set(schema.attributes)
    if not attributes:
        raise NormalizationEngineError("Cannot evaluate 4NF: relation has no attributes.")

    relation_name = schema.name.strip() or "R"
    rel_set = to_attribute_set(attributes)
    fds = schema.functional_dependencies
    mvds = schema.multivalued_dependencies or []

    limitations: List[str] = []
    reasoning_steps: List[KeyReasoningStep] = []
    step_num = 1

    # Step 1: 3NF Prerequisite Assessment
    if nf1_result is None:
        nf1_result = analyze_1nf(schema)
    if nf2_result is None:
        nf2_result = analyze_2nf(schema, nf1_result=nf1_result, candidate_keys_override=candidate_keys_override)
    if nf3_result is None:
        nf3_result = analyze_3nf(schema, nf1_result=nf1_result, nf2_result=nf2_result, candidate_keys_override=candidate_keys_override)

    prereq_3nf_status = nf3_result.status

    reasoning_steps.append(
        KeyReasoningStep(
            step_number=step_num,
            title="3NF Prerequisite Assessment",
            description=(
                f"3NF status evaluated as {prereq_3nf_status.value}. "
                + (
                    "Prerequisite satisfied."
                    if prereq_3nf_status == NFStatus.SATISFIED
                    else (
                        "Warning: 4NF formally requires 3NF compliance. Because 3NF (or earlier) was violated, "
                        "official 4NF status is blocked by prerequisite, though MVDs will still be evaluated for educational guidance."
                        if prereq_3nf_status in (NFStatus.VIOLATED, NFStatus.BLOCKED_BY_PREREQUISITE)
                        else "Notice: 3NF evaluation is conditional. 4NF analysis proceeds conditionally."
                    )
                )
            ),
            details={"3nf_status": prereq_3nf_status.value},
        )
    )
    step_num += 1

    # Candidate keys from previous phases
    candidate_keys = nf3_result.candidate_keys

    # Step 2: Check if any MVDs were supplied
    if not mvds:
        limitations.append(
            "No multivalued dependencies (MVDs) were supplied in the schema input. "
            "4NF analysis requires user-defined MVDs to evaluate."
        )
        reasoning_steps.append(
            KeyReasoningStep(
                step_number=step_num,
                title="MVD Input Check",
                description="No explicit multivalued dependencies were provided. 4NF status cannot be confirmed without MVD inputs.",
                details={"mvd_count": 0},
            )
        )

        final_status = NFStatus.BLOCKED_BY_PREREQUISITE if prereq_3nf_status in (NFStatus.VIOLATED, NFStatus.BLOCKED_BY_PREREQUISITE) else NFStatus.INSUFFICIENT_DATA

        return NF4Result(
            status=final_status,
            is_satisfied=False,
            reason_code="NO_MVDS_PROVIDED" if final_status == NFStatus.INSUFFICIENT_DATA else "PREREQUISITE_3NF_NOT_SATISFIED",
            message=(
                "No multivalued dependencies were provided for explicit 4NF analysis."
                if final_status == NFStatus.INSUFFICIENT_DATA
                else "4NF is blocked by prerequisite, and no MVDs were supplied."
            ),
            prerequisite_3nf_status=prereq_3nf_status,
            candidate_keys=candidate_keys,
            mvds_analyzed=[],
            trivial_mvds=[],
            non_trivial_mvds=[],
            violations=[],
            reasoning_steps=reasoning_steps,
            decomposition_proposal=None,
            limitations=limitations,
        )

    # Step 3: Evaluate each MVD
    mvds_analyzed: List[NF4MVDAnalysis] = []
    trivial_mvds: List[MultivaluedDependency] = []
    non_trivial_mvds: List[MultivaluedDependency] = []
    violations: List[NF4Violation] = []

    # Superkey cache
    superkey_cache: Dict[Tuple[str, ...], bool] = {}

    def is_det_superkey(lhs_attrs: List[str]) -> bool:
        cache_key = tuple(sorted(lhs_attrs))
        if cache_key not in superkey_cache:
            res = check_is_superkey(attributes, fds, lhs_attrs, relation_name)
            superkey_cache[cache_key] = res.is_superkey
        return superkey_cache[cache_key]

    for mvd in mvds:
        lhs_norm = normalize_attribute_set(mvd.left)
        rhs_norm = normalize_attribute_set(mvd.right)
        lhs_set = set(lhs_norm)
        rhs_set = set(rhs_norm)

        # Check Triviality Condition 1: Y ⊆ X
        if rhs_set.issubset(lhs_set):
            trivial_mvds.append(mvd)
            mvds_analyzed.append(
                NF4MVDAnalysis(
                    mvd=mvd,
                    is_trivial=True,
                    triviality_reason="RHS_SUBSET_OF_LHS",
                    determinant_is_superkey=False,
                    satisfies_4nf=True,
                    reason_code="TRIVIAL_MVD_SUBSET",
                    explanation=f"MVD {mvd.notation()} is trivial because dependent attribute set {{{', '.join(rhs_norm)}}} is a subset of determinant ({', '.join(lhs_norm)}). Trivial MVDs cannot violate 4NF.",
                )
            )
            continue

        # Check Triviality Condition 2: X ∪ Y = R
        if (lhs_set | rhs_set) == rel_set:
            trivial_mvds.append(mvd)
            mvds_analyzed.append(
                NF4MVDAnalysis(
                    mvd=mvd,
                    is_trivial=True,
                    triviality_reason="UNION_EQUALS_RELATION",
                    determinant_is_superkey=False,
                    satisfies_4nf=True,
                    reason_code="TRIVIAL_MVD_COMPLEMENT",
                    explanation=f"MVD {mvd.notation()} is trivial because X ∪ Y equals the entire relation schema R. Trivial MVDs cannot violate 4NF.",
                )
            )
            continue

        # Non-Trivial MVD: Test whether X is a superkey
        non_trivial_mvds.append(mvd)
        det_is_superkey = is_det_superkey(lhs_norm)

        if det_is_superkey:
            mvds_analyzed.append(
                NF4MVDAnalysis(
                    mvd=mvd,
                    is_trivial=False,
                    triviality_reason=None,
                    determinant_is_superkey=True,
                    satisfies_4nf=True,
                    reason_code="NONTRIVIAL_MVD_SUPERKEY",
                    explanation=f"Determinant ({', '.join(lhs_norm)}) of non-trivial MVD {mvd.notation()} is a superkey of relation {relation_name}. Satisfies 4NF.",
                )
            )
        else:
            # 4NF VIOLATION!
            exp = (
                f"Non-trivial multivalued dependency {mvd.notation()} violates 4NF because determinant "
                f"({', '.join(lhs_norm)}) is not a superkey of relation {relation_name}. "
                f"Storing independent multivalued attribute(s) {{{', '.join(rhs_norm)}}} alongside other attributes "
                f"in a single relation causes Cartesian product tuple redundancy."
            )
            violation = NF4Violation(
                mvd=mvd,
                determinant=lhs_norm,
                dependent_attributes=rhs_norm,
                is_trivial=False,
                determinant_is_superkey=False,
                reason_code="NONTRIVIAL_MVD_NON_SUPERKEY",
                explanation=exp,
            )
            violations.append(violation)

            mvds_analyzed.append(
                NF4MVDAnalysis(
                    mvd=mvd,
                    is_trivial=False,
                    triviality_reason=None,
                    determinant_is_superkey=False,
                    satisfies_4nf=False,
                    reason_code="NONTRIVIAL_MVD_NON_SUPERKEY",
                    explanation=exp,
                )
            )

    # Step 4: Step-by-Step Reasoning Trace
    if violations:
        reasoning_steps.append(
            KeyReasoningStep(
                step_number=step_num,
                title="4NF Violation Detection",
                description=(
                    f"Detected {len(violations)} non-trivial multivalued dependency violation(s): "
                    + "; ".join(f"({', '.join(v.determinant)}) ↠ {{{', '.join(v.dependent_attributes)}}}" for v in violations)
                    + ". The determinants are not superkeys of the relation, violating Fourth Normal Form."
                ),
                details={"violations": [v.model_dump() for v in violations]},
            )
        )
        step_num += 1
    else:
        reasoning_steps.append(
            KeyReasoningStep(
                step_number=step_num,
                title="4NF MVD Evaluation",
                description=(
                    f"Analyzed {len(mvds)} multivalued dependency/dependencies. "
                    f"Found {len(trivial_mvds)} trivial MVD(s) and {len(non_trivial_mvds)} non-trivial MVD(s) with superkey determinants. "
                    "No 4NF violations detected."
                ),
                details={"mvds_analyzed_count": len(mvds_analyzed)},
            )
        )
        step_num += 1

    # Step 5: 4NF Decomposition Proposal
    decomposition_proposal = None
    if violations:
        proposed_relations: List[ProposedRelation] = []
        for idx, v in enumerate(violations, 1):
            det = v.determinant
            dep = v.dependent_attributes
            rem_attrs = sorted(list((rel_set - set(dep)) | set(det)))

            r1_name = f"{relation_name}_{'_'.join(det)}_{'_'.join(dep)}"
            r1_attrs = sorted(list(set(det + dep)))

            r2_name = f"{relation_name}_REMAINDER_{idx}" if len(violations) > 1 else f"{relation_name}_REMAINDER"

            proposed_relations.append(
                ProposedRelation(
                    name=r1_name,
                    attributes=r1_attrs,
                    primary_key=r1_attrs,
                    functional_dependencies=[],
                    purpose=f"Isolates multivalued dependency ({', '.join(det)}) ↠ ({', '.join(dep)}) into its own binary/independent relation.",
                )
            )
            proposed_relations.append(
                ProposedRelation(
                    name=r2_name,
                    attributes=rem_attrs,
                    primary_key=rem_attrs,
                    functional_dependencies=[],
                    purpose=f"Preserves determinant ({', '.join(det)}) alongside remaining independent attributes.",
                )
            )

        decomposition_proposal = DecompositionProposal(
            source_relation=relation_name,
            proposed_relations=proposed_relations,
            reason_code="DECOMPOSE_MULTIVALUED_DEPENDENCIES",
            explanation=(
                f"Decomposed relation '{relation_name}' to resolve 4NF multivalued dependency violations. "
                "Each independent multivalued fact is isolated into its own relation with its determinant."
            ),
            verification_status="NOT_YET_VERIFIED",
        )

        reasoning_steps.append(
            KeyReasoningStep(
                step_number=step_num,
                title="4NF Decomposition Proposal",
                description=(
                    f"Generated conceptual 4NF decomposition proposing {len(proposed_relations)} sub-relations: "
                    + ", ".join(f"{pr.name}({', '.join(pr.attributes)})" for pr in proposed_relations)
                    + ". (Formal lossless-join and dependency-preservation verification will be evaluated in the Decomposition Workspace)."
                ),
                details={"proposed_relations": [pr.model_dump() for pr in proposed_relations]},
            )
        )

    # Step 6: Determine Final Status
    if prereq_3nf_status in (NFStatus.VIOLATED, NFStatus.BLOCKED_BY_PREREQUISITE):
        final_status = NFStatus.BLOCKED_BY_PREREQUISITE
        is_satisfied = False
        message = "4NF analysis is blocked because 3NF or earlier prerequisites are not satisfied, though MVDs were inspected."
        reason_code = "PREREQUISITE_3NF_NOT_SATISFIED"
    elif violations:
        final_status = NFStatus.VIOLATED
        is_satisfied = False
        message = f"4NF is violated: detected {len(violations)} non-trivial multivalued dependency/dependencies with non-superkey determinants."
        reason_code = "MULTIVALUED_DEPENDENCIES_DETECTED"
    else:
        final_status = NFStatus.SATISFIED
        is_satisfied = True
        message = "4NF is satisfied: all non-trivial multivalued dependencies have superkey determinants, and all trivial MVDs satisfy 4NF vacuously."
        reason_code = "ALL_MVDS_SATISFY_4NF"

    return NF4Result(
        status=final_status,
        is_satisfied=is_satisfied,
        reason_code=reason_code,
        message=message,
        prerequisite_3nf_status=prereq_3nf_status,
        candidate_keys=candidate_keys,
        mvds_analyzed=mvds_analyzed,
        trivial_mvds=trivial_mvds,
        non_trivial_mvds=non_trivial_mvds,
        violations=violations,
        reasoning_steps=reasoning_steps,
        decomposition_proposal=decomposition_proposal,
        limitations=limitations,
    )


# =====================================================================
# Full Normalization Analysis (1NF - 4NF)
# =====================================================================

def analyze_full_normalization(schema: CanonicalSchemaInput) -> FullNormalizationAnalysisResult:
    """
    Executes unified 1NF, 2NF, 3NF, and 4NF normalization analysis for Normalization Lab.
    Enforces the formal normal form hierarchy and stale-result fingerprinting.
    """
    fingerprint = compute_input_fingerprint(schema)
    attributes = normalize_attribute_set(schema.attributes)
    relation_name = schema.name.strip() or "R"

    # Stage 1: 1NF
    nf1_res = analyze_1nf(schema)

    # Stage 2: 2NF
    nf2_res = analyze_2nf(schema, nf1_result=nf1_res)

    # Stage 3: 3NF
    nf3_res = analyze_3nf(schema, nf1_result=nf1_res, nf2_result=nf2_res)

    # Stage 4: 4NF
    nf4_res = analyze_4nf(schema, nf1_result=nf1_res, nf2_result=nf2_res, nf3_result=nf3_res)

    # Determine highest confirmed normal form strictly respecting prerequisites
    if nf1_res.status != NFStatus.SATISFIED:
        highest_nf = NormalForm.UNNORMALIZED
        verdict = f"Relation '{relation_name}' is UNNORMALIZED (violates 1NF). Resolve repeating groups or multi-valued cells before proceeding."
    elif nf2_res.status != NFStatus.SATISFIED:
        highest_nf = NormalForm.ONE_NF
        verdict = f"Relation '{relation_name}' is in 1NF, but violates 2NF due to {len(nf2_res.partial_dependencies)} partial dependency violation(s)."
    elif nf3_res.status != NFStatus.SATISFIED:
        highest_nf = NormalForm.TWO_NF
        verdict = f"Relation '{relation_name}' is in 2NF, but violates 3NF due to {len(nf3_res.violations)} transitive / non-superkey dependency violation(s)."
    elif nf4_res.status == NFStatus.VIOLATED:
        highest_nf = NormalForm.THREE_NF
        verdict = f"Relation '{relation_name}' is in 3NF, but violates 4NF due to {len(nf4_res.violations)} non-trivial multivalued dependency violation(s)."
    elif nf4_res.status == NFStatus.INSUFFICIENT_DATA:
        highest_nf = NormalForm.THREE_NF
        verdict = f"Relation '{relation_name}' is confirmed in 3NF. 4NF could not be verified because no multivalued dependencies (MVDs) were supplied."
    elif nf4_res.status == NFStatus.SATISFIED:
        highest_nf = NormalForm.FOUR_NF
        verdict = f"Relation '{relation_name}' satisfies all requirements through Fourth Normal Form (4NF)."
    else:
        highest_nf = NormalForm.THREE_NF
        verdict = f"Relation '{relation_name}' normalization analysis complete up to 3NF."

    return FullNormalizationAnalysisResult(
        relation_name=relation_name,
        attributes=attributes,
        input_fingerprint=fingerprint,
        nf1=nf1_res,
        nf2=nf2_res,
        nf3=nf3_res,
        nf4=nf4_res,
        candidate_keys=nf2_res.candidate_keys,
        prime_attributes=nf2_res.prime_attributes,
        non_prime_attributes=nf2_res.non_prime_attributes,
        highest_confirmed_normal_form=highest_nf,
        summary_verdict=verdict,
    )


def analyze_basic_normalization(schema: CanonicalSchemaInput) -> FullNormalizationAnalysisResult:
    """
    Backwards-compatible wrapper that returns the full normalization analysis result
    (which subclasses BasicNormalizationAnalysisResult).
    """
    return analyze_full_normalization(schema)
