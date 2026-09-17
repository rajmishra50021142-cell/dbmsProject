"""
Dependency Preservation Engine.

Implements:
1. Polynomial-time dependency preservation testing via closure fixed-point iteration
   under decomposed schema projections (Z = Z ∪ (((Z ∩ R_i)^+ ∩ R_i))).
2. Explicit functional dependency projection pi_{R_i}(F) for pedagogical inspection.
3. Step-by-step educational reasoning traces distinguishing directly-covered,
   transitively-preserved, and unpreserved dependencies.
"""

from itertools import combinations
from typing import List, Dict, Set, Tuple, Optional, Any
from app.schemas.domain_contracts import (
    FunctionalDependency,
    DependencyPreservationCheck,
    DependencyPreservationResult,
)
from app.normalization.attribute_set import (
    normalize_attribute_set,
    to_attribute_set,
    is_subset,
    set_difference,
    set_union,
    attribute_set_key,
)
from app.normalization.fd_engine import CanonicalFD
from app.normalization.closure_engine import compute_attribute_closure


def project_functional_dependencies(
    relation_attrs: List[str],
    original_fds: List[FunctionalDependency],
    all_relation_attrs: Optional[List[str]] = None,
    max_subset_size: int = 4,
) -> List[FunctionalDependency]:
    """
    Computes the projected functional dependencies pi_R(F) for a decomposed sub-relation.
    
    Includes:
    1. All original FDs whose LHS and RHS are entirely contained within relation_attrs.
    2. Any implied non-trivial FDs X -> Y where X ⊆ relation_attrs and Y ⊆ (X+_F ∩ relation_attrs).
    """
    sub_attrs = normalize_attribute_set(relation_attrs)
    sub_set = to_attribute_set(sub_attrs)
    all_attrs = normalize_attribute_set(all_relation_attrs or relation_attrs)

    projected: Dict[Tuple[Tuple[str, ...], Tuple[str, ...]], FunctionalDependency] = {}

    # 1. Direct dependencies: both LHS and RHS in sub_set
    for fd in original_fds:
        lhs_set = to_attribute_set(fd.left)
        rhs_in_sub = [a for a in fd.right if a in sub_set and a not in lhs_set]
        if lhs_set.issubset(sub_set) and rhs_in_sub:
            key = (tuple(sorted(fd.left)), tuple(sorted(rhs_in_sub)))
            if key not in projected:
                projected[key] = FunctionalDependency(
                    id=f"proj-direct-{len(projected) + 1}",
                    left=list(fd.left),
                    right=rhs_in_sub,
                )

    # 2. Implied dependencies for small sub-relations (up to max_subset_size LHS)
    # to find non-trivial projected dependencies like A -> C where B was dropped
    if len(sub_attrs) <= 10:
        for r in range(1, min(len(sub_attrs), max_subset_size + 1)):
            for lhs_comb in combinations(sub_attrs, r):
                lhs_list = list(lhs_comb)
                lhs_s = set(lhs_list)

                closure_res = compute_attribute_closure(
                    attributes=all_attrs,
                    fds=original_fds,
                    target_attributes=lhs_list,
                )
                closure_in_sub = [a for a in closure_res.closure_attributes if a in sub_set and a not in lhs_s]
                if closure_in_sub:
                    key = (tuple(sorted(lhs_list)), tuple(sorted(closure_in_sub)))
                    if key not in projected:
                        projected[key] = FunctionalDependency(
                            id=f"proj-implied-{len(projected) + 1}",
                            left=lhs_list,
                            right=closure_in_sub,
                        )

    return list(projected.values())


def check_fd_preservation_polynomial(
    target_fd: FunctionalDependency,
    original_attrs: List[str],
    original_fds: List[FunctionalDependency],
    decomposed_relations: List[List[str]],
    relation_names: Optional[List[str]] = None,
) -> DependencyPreservationCheck:
    """
    Tests whether an individual functional dependency X -> Y is preserved in
    the decomposition D = {R_1, ..., R_k} using the polynomial-time fixpoint algorithm:
    
      Z = X
      repeat:
        for each R_i in D:
          Z = Z ∪ (((Z ∩ R_i)+_F) ∩ R_i)
      until Z does not change
      
    X -> Y is preserved iff Y ⊆ Z.
    """
    all_attrs = normalize_attribute_set(original_attrs)
    rel_names = relation_names or [f"R{i+1}" for i in range(len(decomposed_relations))]
    rel_sets = [to_attribute_set(r) for r in decomposed_relations]

    target_lhs_set = to_attribute_set(target_fd.left)
    target_rhs_set = to_attribute_set(target_fd.right)

    # Check for direct coverage in a single relation
    covering_relations: List[str] = []
    for i, r_set in enumerate(rel_sets):
        if target_lhs_set.issubset(r_set) and target_rhs_set.issubset(r_set):
            covering_relations.append(rel_names[i])

    # Polynomial fixpoint closure check
    z: Set[str] = set(target_fd.left)
    changed = True
    iterations = 0
    max_iters = 50

    while changed and iterations < max_iters:
        changed = False
        iterations += 1
        for i, r_set in enumerate(rel_sets):
            intersection = z.intersection(r_set)
            if not intersection:
                continue

            closure_res = compute_attribute_closure(
                attributes=all_attrs,
                fds=original_fds,
                target_attributes=list(intersection),
            )
            derived = set(closure_res.closure_attributes).intersection(r_set)
            new_elements = derived.difference(z)
            if new_elements:
                z = z.union(new_elements)
                changed = True

    is_preserved = target_rhs_set.issubset(z)
    sorted_closure = sorted(list(z))

    if covering_relations:
        explanation = (
            f"Preserved directly: All attributes of {target_fd.notation()} are contained entirely "
            f"within relation(s) {{{', '.join(covering_relations)}}}. It can be enforced locally without joins."
        )
    elif is_preserved:
        explanation = (
            f"Preserved via projected dependencies: While no single sub-relation contains all attributes of "
            f"{target_fd.notation()}, the closure of {{{', '.join(target_fd.left)}}} under the projected dependencies "
            f"converges to {{{', '.join(sorted_closure)}}}, which covers {{{', '.join(target_fd.right)}}}."
        )
    else:
        missing = sorted(list(target_rhs_set.difference(z)))
        explanation = (
            f"NOT PRESERVED: The closure of {{{', '.join(target_fd.left)}}} under the projected dependencies "
            f"converges to {{{', '.join(sorted_closure)}}}, which fails to determine attribute(s) {{{', '.join(missing)}}}. "
            f"Enforcing {target_fd.notation()} requires an inter-relational join."
        )

    return DependencyPreservationCheck(
        target_fd=target_fd,
        is_preserved=is_preserved,
        closure_under_projected=sorted_closure,
        relevant_relations=covering_relations,
        explanation=explanation,
    )


def verify_dependency_preservation(
    original_attrs: List[str],
    original_fds: List[FunctionalDependency],
    decomposed_relations: List[List[str]],
    relation_names: Optional[List[str]] = None,
) -> DependencyPreservationResult:
    """
    Formally evaluates whether decomposition D = {R_1, ..., R_k} preserves all
    functional dependencies in F.
    """
    rel_names = relation_names or [f"R{i+1}" for i in range(len(decomposed_relations))]
    
    # 1. Project FDs for each decomposed relation
    projected_by_rel: Dict[str, List[FunctionalDependency]] = {}
    all_projected: List[FunctionalDependency] = []
    
    for i, r_attrs in enumerate(decomposed_relations):
        r_name = rel_names[i]
        proj_fds = project_functional_dependencies(
            relation_attrs=r_attrs,
            original_fds=original_fds,
            all_relation_attrs=original_attrs,
        )
        projected_by_rel[r_name] = proj_fds
        all_projected.extend(proj_fds)

    # 2. Check preservation of each original FD
    checks: List[DependencyPreservationCheck] = []
    preserved_fds: List[FunctionalDependency] = []
    non_preserved_fds: List[FunctionalDependency] = []

    for fd in original_fds:
        check = check_fd_preservation_polynomial(
            target_fd=fd,
            original_attrs=original_attrs,
            original_fds=original_fds,
            decomposed_relations=decomposed_relations,
            relation_names=rel_names,
        )
        checks.append(check)
        if check.is_preserved:
            preserved_fds.append(fd)
        else:
            non_preserved_fds.append(fd)

    all_preserved = len(non_preserved_fds) == 0

    if all_preserved:
        reasoning = (
            f"All {len(original_fds)} original functional dependencies are PRESERVED in the decomposition. "
            f"Every dependency can be validated and enforced locally on individual sub-relations without performing joins."
        )
    else:
        unpreserved_notations = [f.notation() for f in non_preserved_fds]
        reasoning = (
            f"Decomposition is NOT dependency-preserving: {len(non_preserved_fds)} of {len(original_fds)} dependency(ies) "
            f"cannot be enforced locally ({'; '.join(unpreserved_notations)}). "
            f"Validating these dependencies requires joining multiple decomposed tables."
        )

    return DependencyPreservationResult(
        is_preserved=all_preserved,
        original_dependencies=original_fds,
        projected_dependencies_by_relation=projected_by_rel,
        all_projected_dependencies=all_projected,
        checks=checks,
        preserved_dependencies=preserved_fds,
        non_preserved_dependencies=non_preserved_fds,
        reasoning=reasoning,
    )
