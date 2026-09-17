"""
Minimal Cover (Canonical Cover) Engine.

Computes the minimal cover F_min for a set of functional dependencies F:
1. Decomposes right-hand sides into singleton attributes (Armstrong's Decomposition Rule).
2. Eliminates extraneous left-hand side attributes using attribute closure.
3. Eliminates redundant functional dependencies that are implied by the remaining set.
4. Optionally groups identical determinants for clean relational synthesis.
"""

from typing import List, Dict, Any, Set, Optional
from app.schemas.domain_contracts import FunctionalDependency, MinimalCoverResult
from app.normalization.attribute_set import normalize_attribute_set, attribute_set_key
from app.normalization.fd_engine import CanonicalFD
from app.normalization.closure_engine import compute_attribute_closure


def compute_minimal_cover(
    fds: List[FunctionalDependency],
    all_attributes: List[str],
    relation_name: str = "R",
) -> MinimalCoverResult:
    """
    Computes the canonical / minimal cover of a set of functional dependencies F.
    
    Guarantees:
    - F_min is equivalent to F (F+ == F_min+)
    - Every RHS is a single attribute
    - No LHS contains extraneous attributes
    - No FD is redundant
    """
    normalized_attrs = normalize_attribute_set(all_attributes)
    reasoning_steps: List[str] = []

    # Step 1: Split RHS into singleton dependencies
    split_fds: List[CanonicalFD] = []
    seen_split: Set[Tuple[Any, Any]] = set()
    for fd in fds:
        canon = CanonicalFD(fd.left, fd.right)
        for single in canon.decompose_rhs():
            # Skip completely trivial dependencies like A -> A
            if single.is_completely_trivial():
                reasoning_steps.append(f"Dropped trivial dependency {single.notation()} during RHS splitting.")
                continue
            key = (single._left_set, single._right_set)
            if key in seen_split:
                reasoning_steps.append(f"Dropped duplicate dependency {single.notation()} during RHS splitting.")
                continue
            seen_split.add(key)
            split_fds.append(single)

    reasoning_steps.append(
        f"Step 1 (RHS Splitting): Decomposed {len(fds)} FD(s) into {len(split_fds)} singleton RHS dependency(ies)."
    )
    rhs_split_contracts = [f.to_contract() for f in split_fds]

    # Step 2: Remove extraneous LHS attributes
    # Attribute B in LHS(X) of X -> A is extraneous if A in (X - {B})+ under current FD set
    current_fds = list(split_fds)
    removed_extraneous: List[Dict[str, Any]] = []

    changed = True
    while changed:
        changed = False
        for i, fd in enumerate(current_fds):
            if len(fd.left) <= 1:
                continue
            
            target_attr = fd.right[0]
            current_contracts = [f.to_contract() for f in current_fds]

            for b in list(fd.left):
                reduced_lhs = [a for a in fd.left if a != b]
                if not reduced_lhs:
                    continue

                closure_res = compute_attribute_closure(
                    attributes=normalized_attrs,
                    fds=current_contracts,
                    target_attributes=reduced_lhs,
                    relation_name=relation_name,
                )

                if target_attr in closure_res.closure_attributes:
                    # B is extraneous!
                    old_notation = fd.notation()
                    new_fd = CanonicalFD(reduced_lhs, [target_attr])
                    current_fds[i] = new_fd
                    removed_extraneous.append({
                        "original_fd": old_notation,
                        "extraneous_attribute": b,
                        "reduced_fd": new_fd.notation(),
                        "reason": f"Attribute '{b}' is extraneous because '{target_attr}' is in closure of {{{', '.join(reduced_lhs)}}}."
                    })
                    reasoning_steps.append(
                        f"Step 2 (Extraneous LHS): Removed '{b}' from {old_notation} -> {new_fd.notation()}."
                    )
                    changed = True
                    break
            if changed:
                break

    extraneous_removed_contracts = [f.to_contract() for f in current_fds]

    # Step 3: Remove redundant dependencies
    # FD f: X -> A is redundant if A in X+ under (F - {f})
    minimal_fds_list: List[CanonicalFD] = []
    removed_redundant: List[FunctionalDependency] = []

    # Process each FD in deterministic order
    remaining_fds = list(current_fds)
    i = 0
    while i < len(remaining_fds):
        target_fd = remaining_fds[i]
        other_fds = remaining_fds[:i] + remaining_fds[i+1:]
        other_contracts = [f.to_contract() for f in other_fds]

        # Compute closure of target_fd.left under other_fds
        closure_res = compute_attribute_closure(
            attributes=normalized_attrs,
            fds=other_contracts,
            target_attributes=target_fd.left,
            relation_name=relation_name,
        )

        target_attr = target_fd.right[0]
        if target_attr in closure_res.closure_attributes:
            # target_fd is redundant!
            redundant_contract = target_fd.to_contract()
            removed_redundant.append(redundant_contract)
            reasoning_steps.append(
                f"Step 3 (Redundant FD): Pruned redundant {target_fd.notation()} because '{target_attr}' is in {{{', '.join(target_fd.left)}}}+ under remaining dependencies."
            )
            remaining_fds.pop(i)
            # do not increment i, as the list shifted
        else:
            i += 1

    minimal_contracts = [f.to_contract() for f in remaining_fds]
    reasoning_steps.append(
        f"Minimal Cover established with {len(minimal_contracts)} non-redundant dependency(ies)."
    )

    return MinimalCoverResult(
        original_fds=fds,
        rhs_split_fds=rhs_split_contracts,
        extraneous_removed_fds=extraneous_removed_contracts,
        minimal_fds=minimal_contracts,
        removed_extraneous_attributes=removed_extraneous,
        removed_redundant_fds=removed_redundant,
        reasoning_steps=reasoning_steps,
    )
