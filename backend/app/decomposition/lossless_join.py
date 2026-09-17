"""
Lossless-Join Verification Engine.

Implements:
1. Formal Tableau Chase Algorithm for functional dependency decompositions.
2. Fagin's Theorem verification for binary multivalued dependency decompositions.
"""

from typing import List, Dict, Set, Tuple, Optional, Any, Literal
import copy
from app.schemas.domain_contracts import (
    FunctionalDependency,
    MultivaluedDependency,
    TableauChaseStep,
    LosslessJoinResult,
)
from app.normalization.attribute_set import (
    normalize_attribute_set,
    to_attribute_set,
    is_subset,
    attribute_set_key,
)


def verify_lossless_join_chase(
    attributes: List[str],
    fds: List[FunctionalDependency],
    decomposed_relations: List[List[str]],
    relation_names: Optional[List[str]] = None,
) -> LosslessJoinResult:
    """
    Formally verifies whether a decomposition D = {R_1, ..., R_k} of relation R
    has a lossless join with respect to functional dependencies F using the
    standard relational database Tableau Chase algorithm.

    Algorithm:
    1. Construct a k x n tableau where rows correspond to sub-relations R_i
       and columns correspond to attributes A_j in R.
    2. Cell (i, j) is assigned:
       - distinguished symbol 'a_j' if attribute A_j is in R_i
       - non-distinguished symbol 'b_{i+1, j+1}' otherwise
    3. For each FD X -> Y in F:
       - Find rows that agree on all attributes in X.
       - If they disagree on an attribute A in Y, equate their symbols in column A:
         * If any row has distinguished symbol a_j, change all others to a_j.
         * Otherwise, equate to the lexicographically lowest non-distinguished symbol.
    4. Repeat until fixed point.
    5. The decomposition is lossless iff at least one row becomes all distinguished symbols.
    """
    rel_attrs = normalize_attribute_set(attributes)
    num_cols = len(rel_attrs)
    num_rows = len(decomposed_relations)

    if num_cols == 0 or num_rows == 0:
        return LosslessJoinResult(
            is_lossless=False,
            method="TABLEAU_CHASE",
            attributes=rel_attrs,
            relations=[],
            initial_tableau=[],
            chase_steps=[],
            final_tableau=[],
            distinguished_row_index=None,
            reasoning="Cannot perform tableau chase on an empty relation or decomposition.",
        )

    # Prepare relation labels
    if not relation_names or len(relation_names) != num_rows:
        rel_labels = [f"R{i+1}({', '.join(sorted(r))})" for i, r in enumerate(decomposed_relations)]
    else:
        rel_labels = [f"{name}({', '.join(sorted(decomposed_relations[i]))})" for i, name in enumerate(relation_names)]

    # 1. Initialize Tableau
    # Column mapping: attr -> col index
    attr_to_col: Dict[str, int] = {attr: idx for idx, attr in enumerate(rel_attrs)}
    tableau: List[List[str]] = []

    for r_idx, r_attrs in enumerate(decomposed_relations):
        r_set = to_attribute_set(r_attrs)
        row: List[str] = []
        for c_idx, attr in enumerate(rel_attrs):
            if attr in r_set:
                row.append(f"a_{c_idx + 1}")
            else:
                row.append(f"b_{r_idx + 1}_{c_idx + 1}")
        tableau.append(row)

    initial_tableau = copy.deepcopy(tableau)
    chase_steps: List[TableauChaseStep] = []

    # Check if already lossless initially (e.g. one sub-relation contains all attributes)
    def check_distinguished_row(tab: List[List[str]]) -> Optional[int]:
        for r_i, row in enumerate(tab):
            if all(cell == f"a_{c_j + 1}" for c_j, cell in enumerate(row)):
                return r_i
        return None

    distinguished_idx = check_distinguished_row(tableau)
    if distinguished_idx is not None:
        return LosslessJoinResult(
            is_lossless=True,
            method="TABLEAU_CHASE",
            attributes=rel_attrs,
            relations=rel_labels,
            initial_tableau=initial_tableau,
            chase_steps=[],
            final_tableau=tableau,
            distinguished_row_index=distinguished_idx,
            reasoning=(
                f"Initial tableau row {distinguished_idx + 1} ({rel_labels[distinguished_idx]}) already contains all "
                f"distinguished symbols (a_1..a_{num_cols}), immediately proving a lossless join."
            ),
        )

    # 2. Chase loop
    step_count = 0
    max_steps = 100  # Guard against unexpected cyclic loops
    changed = True

    while changed and step_count < max_steps:
        changed = False

        for fd in fds:
            # Filter FD attributes to those present in R
            lhs_attrs = [a for a in fd.left if a in attr_to_col]
            rhs_attrs = [a for a in fd.right if a in attr_to_col]

            if not lhs_attrs or not rhs_attrs:
                continue

            lhs_col_indices = [attr_to_col[a] for a in lhs_attrs]

            # Group rows by identical values in LHS columns
            row_groups: Dict[Tuple[str, ...], List[int]] = {}
            for r_i in range(num_rows):
                lhs_tuple = tuple(tableau[r_i][c] for c in lhs_col_indices)
                row_groups.setdefault(lhs_tuple, []).append(r_i)

            # For each group with 2 or more rows
            for lhs_tuple, group_rows in row_groups.items():
                if len(group_rows) < 2:
                    continue

                for rhs_attr in rhs_attrs:
                    rhs_col = attr_to_col[rhs_attr]
                    symbols_in_col = [tableau[r][rhs_col] for r in group_rows]
                    unique_symbols = sorted(list(set(symbols_in_col)))

                    if len(unique_symbols) > 1:
                        # Equate symbols!
                        # Preference: distinguished symbol a_{rhs_col + 1} wins
                        target_distinguished = f"a_{rhs_col + 1}"
                        if target_distinguished in unique_symbols:
                            winning_symbol = target_distinguished
                        else:
                            # Lowest non-distinguished symbol wins
                            winning_symbol = unique_symbols[0]

                        replaced_symbols = [s for s in unique_symbols if s != winning_symbol]

                        # Apply symbol replacement across equivalence class in the entire tableau
                        # to respect transitivity of equality
                        for r_k in range(num_rows):
                            for c_k in range(num_cols):
                                if tableau[r_k][c_k] in replaced_symbols:
                                    tableau[r_k][c_k] = winning_symbol

                        step_count += 1
                        snapshot = copy.deepcopy(tableau)
                        explanation = (
                            f"Applied FD {fd.notation()}: Rows {', '.join(str(r + 1) for r in group_rows)} "
                            f"agree on LHS {{{', '.join(lhs_attrs)}}}. Equated symbol(s) "
                            f"{{{', '.join(replaced_symbols)}}} to '{winning_symbol}' on attribute '{rhs_attr}'."
                        )

                        chase_steps.append(
                            TableauChaseStep(
                                step_number=step_count,
                                applied_fd=fd,
                                matching_rows=group_rows,
                                target_attribute=rhs_attr,
                                equated_symbol=winning_symbol,
                                replaced_symbols=replaced_symbols,
                                tableau_snapshot=snapshot,
                                explanation=explanation,
                            )
                        )

                        changed = True

                        # Check if a row became all distinguished
                        distinguished_idx = check_distinguished_row(tableau)
                        if distinguished_idx is not None:
                            reasoning = (
                                f"Decomposition is LOSSLESS. At chase step {step_count}, row {distinguished_idx + 1} "
                                f"({rel_labels[distinguished_idx]}) achieved a complete sequence of distinguished symbols "
                                f"(a_1..a_{num_cols}), proving that joining the decomposed relations reproduces the original relation without spurious tuples."
                            )
                            return LosslessJoinResult(
                                is_lossless=True,
                                method="TABLEAU_CHASE",
                                attributes=rel_attrs,
                                relations=rel_labels,
                                initial_tableau=initial_tableau,
                                chase_steps=chase_steps,
                                final_tableau=tableau,
                                distinguished_row_index=distinguished_idx,
                                reasoning=reasoning,
                            )
                        break
                if changed:
                    break
            if changed:
                break

    distinguished_idx = check_distinguished_row(tableau)
    is_lossless = distinguished_idx is not None

    if is_lossless:
        reasoning = (
            f"Decomposition is LOSSLESS. Tableau Chase converged after {step_count} step(s); "
            f"row {distinguished_idx + 1} ({rel_labels[distinguished_idx]}) became entirely distinguished."
        )
    else:
        reasoning = (
            f"Decomposition is LOSSY. Tableau Chase reached a fixed point after {step_count} step(s) without "
            f"any row achieving all distinguished symbols (a_1..a_{num_cols}). Joining these relations will "
            f"produce spurious tuples that do not exist in the original relation."
        )

    return LosslessJoinResult(
        is_lossless=is_lossless,
        method="TABLEAU_CHASE",
        attributes=rel_attrs,
        relations=rel_labels,
        initial_tableau=initial_tableau,
        chase_steps=chase_steps,
        final_tableau=tableau,
        distinguished_row_index=distinguished_idx,
        reasoning=reasoning,
    )


def verify_lossless_join_mvd(
    attributes: List[str],
    mvds: List[MultivaluedDependency],
    decomposed_relations: List[List[str]],
    relation_names: Optional[List[str]] = None,
) -> LosslessJoinResult:
    """
    Verifies lossless join for binary decompositions R1, R2 under multivalued dependencies
    using Fagin's Theorem:
    A decomposition of R into (R1, R2) is lossless iff (R1 ∩ R2) ->> R1 or (R1 ∩ R2) ->> R2.
    """
    rel_attrs = normalize_attribute_set(attributes)
    num_rows = len(decomposed_relations)

    if not relation_names or len(relation_names) != num_rows:
        rel_labels = [f"R{i+1}({', '.join(sorted(r))})" for i, r in enumerate(decomposed_relations)]
    else:
        rel_labels = [f"{name}({', '.join(sorted(decomposed_relations[i]))})" for i, name in enumerate(relation_names)]

    if num_rows != 2:
        # Fallback explanation if more than 2 relations given for MVD
        return LosslessJoinResult(
            is_lossless=False,
            method="FAGINS_THEOREM",
            attributes=rel_attrs,
            relations=rel_labels,
            initial_tableau=[],
            chase_steps=[],
            final_tableau=[],
            distinguished_row_index=None,
            reasoning=(
                f"Fagin's theorem directly evaluates binary decompositions (2 sub-relations). "
                f"Received {num_rows} relations. Multiple-relation MVD decompositions require multi-stage binary decomposition."
            ),
        )

    r1_set = to_attribute_set(decomposed_relations[0])
    r2_set = to_attribute_set(decomposed_relations[1])
    intersection = r1_set.intersection(r2_set)

    if not intersection:
        return LosslessJoinResult(
            is_lossless=False,
            method="FAGINS_THEOREM",
            attributes=rel_attrs,
            relations=rel_labels,
            initial_tableau=[],
            chase_steps=[],
            final_tableau=[],
            distinguished_row_index=None,
            reasoning=(
                f"Decomposition is LOSSY: The sub-relations {rel_labels[0]} and {rel_labels[1]} "
                f"have no common attributes (intersection is empty). Natural join would degenerate to a Cartesian product."
            ),
        )

    # Check if intersection multidetermines (R1 - R2) or (R2 - R1)
    diff1 = r1_set.difference(r2_set)
    diff2 = r2_set.difference(r1_set)

    matched_mvd: Optional[MultivaluedDependency] = None
    for mvd in mvds:
        mvd_lhs = to_attribute_set(mvd.left)
        mvd_rhs = to_attribute_set(mvd.right)

        if mvd_lhs == intersection:
            if mvd_rhs == diff1 or mvd_rhs == diff2 or mvd_rhs == r1_set or mvd_rhs == r2_set:
                matched_mvd = mvd
                break

    is_lossless = matched_mvd is not None

    if is_lossless:
        reasoning = (
            f"Decomposition is LOSSLESS by Fagin's Theorem. The common attribute set "
            f"{{{', '.join(sorted(intersection))}}} multidetermines a sub-relation via {matched_mvd.notation()}."
        )
    else:
        reasoning = (
            f"Decomposition could not be proven lossless by Fagin's Theorem: The common attribute set "
            f"{{{', '.join(sorted(intersection))}}} does not multidetermine either decomposed component in the provided MVD set."
        )

    return LosslessJoinResult(
        is_lossless=is_lossless,
        method="FAGINS_THEOREM",
        attributes=rel_attrs,
        relations=rel_labels,
        initial_tableau=[],
        chase_steps=[],
        final_tableau=[],
        distinguished_row_index=0 if is_lossless else None,
        reasoning=reasoning,
    )
