"""
Attribute Closure Engine ($X^+$) & Dependency Implication.

Implements the deterministic attribute closure algorithm, step-by-step reasoning
traces, fixed-point convergence, and functional determination queries according
to standard relational database theory.
"""

from typing import List, Set, Optional
from app.schemas.domain_contracts import (
    FunctionalDependency,
    ClosureStep,
    ClosureResult,
    DeterminationResult,
)
from app.normalization.attribute_set import (
    normalize_attribute_set,
    to_attribute_set,
    is_subset,
    set_difference,
)
from app.normalization.fd_engine import FDSet, canonicalize_fd


class ClosureEngineError(ValueError):
    """Raised when schema attributes or dependency references are semantically invalid."""
    pass


def compute_attribute_closure(
    attributes: List[str],
    fds: List[FunctionalDependency],
    target_attributes: List[str],
    relation_name: str = "R",
) -> ClosureResult:
    """
    Computes the attribute closure X+ of target_attributes under functional dependency set F.
    
    Algorithm:
      1. closure = X
      2. repeat:
           for each Y -> Z in F:
             if Y ⊆ closure and (Z \\ closure) != ∅:
               closure = closure ∪ Z
               record step with explanation
         until closure does not change (fixed point reached)
    """
    rel_attrs = normalize_attribute_set(attributes)
    if not rel_attrs:
        raise ClosureEngineError("Relation must contain at least one attribute to compute closure.")

    rel_set = to_attribute_set(rel_attrs)
    target_attrs = normalize_attribute_set(target_attributes)
    if not target_attrs:
        raise ClosureEngineError("Target attribute set X cannot be empty.")

    # Validate referential integrity
    invalid_targets = [a for a in target_attrs if a not in rel_set]
    if invalid_targets:
        raise ClosureEngineError(
            f"Target attribute(s) {{{', '.join(invalid_targets)}}} do not exist in relation {relation_name} attributes."
        )

    # Canonicalize and validate FDs
    fd_set = FDSet(fds)
    for fd in fd_set:
        unknown_left = [a for a in fd.left if a not in rel_set]
        unknown_right = [a for a in fd.right if a not in rel_set]
        if unknown_left or unknown_right:
            unknown = unknown_left + unknown_right
            raise ClosureEngineError(
                f"Dependency {fd.notation()} references unknown attribute(s): {{{', '.join(unknown)}}}."
            )

    steps: List[ClosureStep] = []
    current_closure: List[str] = list(target_attrs)
    closure_set: Set[str] = to_attribute_set(current_closure)
    applied_fds: List[FunctionalDependency] = []

    # Step 1: Initial starting set
    steps.append(
        ClosureStep(
            step_number=1,
            before_attributes=[],
            applied_fd=None,
            added_attributes=list(current_closure),
            after_attributes=list(current_closure),
            explanation=(
                f"Initial attribute set: ({', '.join(target_attrs)})+ begins with its starting attributes "
                f"{{{', '.join(target_attrs)}}} by reflexivity."
            ),
        )
    )

    iteration_count = 0
    changed = True

    while changed:
        changed = False
        iteration_count += 1

        for fd in fd_set:
            left_set = to_attribute_set(fd.left)
            # Check if determinant is satisfied
            if left_set.issubset(closure_set):
                # Find attributes that are not yet in the closure
                new_attrs = [a for a in fd.right if a not in closure_set]
                if new_attrs:
                    before_snapshot = list(current_closure)
                    for a in new_attrs:
                        current_closure.append(a)
                        closure_set.add(a)

                    step_num = len(steps) + 1
                    applied_contract = fd.to_contract()
                    applied_fds.append(applied_contract)

                    steps.append(
                        ClosureStep(
                            step_number=step_num,
                            before_attributes=before_snapshot,
                            applied_fd=applied_contract,
                            added_attributes=new_attrs,
                            after_attributes=list(current_closure),
                            explanation=(
                                f"Applied {fd.notation()}: Determinant {{{', '.join(fd.left)}}} is contained in "
                                f"current closure {{{', '.join(before_snapshot)}}}. Added newly determined "
                                f"attribute(s): {{{', '.join(new_attrs)}}}."
                            ),
                        )
                    )
                    changed = True

    # Check superkey status
    is_superkey = rel_set.issubset(closure_set)
    missing_attrs = [a for a in rel_attrs if a not in closure_set]

    if is_superkey:
        superkey_reason = (
            f"The closure ({', '.join(target_attrs)})+ contains all {len(rel_attrs)} attributes of "
            f"relation {relation_name}. Therefore, ({', '.join(target_attrs)}) is a superkey of {relation_name}. "
            f"Note: Whether it is a minimal candidate key will be verified during candidate key discovery."
        )
    else:
        superkey_reason = (
            f"The closure ({', '.join(target_attrs)})+ contains {len(current_closure)} of {len(rel_attrs)} attributes "
            f"(missing: {{{', '.join(missing_attrs)}}}). Therefore, ({', '.join(target_attrs)}) is not a superkey."
        )

    return ClosureResult(
        relation_name=relation_name,
        input_attributes=target_attrs,
        closure_attributes=current_closure,
        steps=steps,
        iterations=iteration_count,
        applied_fds=applied_fds,
        fixed_point_reached=True,
        is_superkey=is_superkey,
        superkey_reason=superkey_reason,
    )


def check_functional_determination(
    attributes: List[str],
    fds: List[FunctionalDependency],
    lhs: List[str],
    rhs: List[str],
    relation_name: str = "R",
) -> DeterminationResult:
    """
    Checks whether X functionally determines Y (X -> Y) under dependency set F.
    
    Theorem:
      X -> Y is logically implied by F if and only if Y ⊆ X+.
    """
    norm_lhs = normalize_attribute_set(lhs)
    norm_rhs = normalize_attribute_set(rhs)
    
    if not norm_lhs:
        raise ClosureEngineError("Determinant attribute set X cannot be empty.")
    if not norm_rhs:
        raise ClosureEngineError("Dependent attribute set Y cannot be empty.")

    closure_result = compute_attribute_closure(
        attributes=attributes,
        fds=fds,
        target_attributes=norm_lhs,
        relation_name=relation_name,
    )

    closure_set = to_attribute_set(closure_result.closure_attributes)
    missing_attrs = [a for a in norm_rhs if a not in closure_set]
    is_determined = len(missing_attrs) == 0

    if is_determined:
        explanation = (
            f"Yes: ({', '.join(norm_lhs)}) functionally determines ({', '.join(norm_rhs)}) under F. "
            f"Evidence: the closure ({', '.join(norm_lhs)})+ = {{{', '.join(closure_result.closure_attributes)}}}, "
            f"which contains all attributes of {{{', '.join(norm_rhs)}}}."
        )
    else:
        explanation = (
            f"No: ({', '.join(norm_lhs)}) does not determine ({', '.join(norm_rhs)}) under F. "
            f"The closure ({', '.join(norm_lhs)})+ = {{{', '.join(closure_result.closure_attributes)}}} "
            f"is missing attribute(s): {{{', '.join(missing_attrs)}}}."
        )

    return DeterminationResult(
        determined=is_determined,
        lhs=norm_lhs,
        rhs=norm_rhs,
        lhs_closure=closure_result.closure_attributes,
        missing_attributes=missing_attrs,
        explanation=explanation,
        closure_result=closure_result,
    )
