"""
Candidate-Key Engine, Superkeys & Prime/Non-Prime Attribute Analysis.

Implements:
1. Superkey verification ($X^+ = R$).
2. Candidate-key minimality testing (no proper subset is a superkey).
3. Deterministic candidate-key discovery with attribute role partitioning
   (L, R, B, N) and superset pruning.
4. Prime and non-prime attribute classification.
5. User-provided candidate key verification with educational feedback.
6. Step-by-step discovery reasoning traces.
"""

from itertools import combinations
from typing import List, Set, Dict, Any, Optional, Tuple
from app.schemas.domain_contracts import (
    FunctionalDependency,
    SuperkeyCheckResult,
    MinimalityCheck,
    KeyVerificationResult,
    KeyReasoningStep,
    KeyDiscoveryResult,
    CandidateKeyAnalysisResult,
)
from app.normalization.attribute_set import (
    normalize_attribute_set,
    to_attribute_set,
    is_subset,
    is_proper_subset,
    set_equals,
    set_difference,
    set_union,
    attribute_set_key,
)
from app.normalization.fd_engine import FDSet
from app.normalization.closure_engine import compute_attribute_closure, ClosureEngineError


class CandidateKeyEngineError(ValueError):
    """Raised when relation schema or candidate key references are semantically invalid."""
    pass


def check_is_superkey(
    attributes: List[str],
    fds: List[FunctionalDependency],
    target_attributes: List[str],
    relation_name: str = "R",
) -> SuperkeyCheckResult:
    """
    Verifies whether target_attributes forms a superkey of relation R.
    A set X is a superkey iff X+ contains all attributes of R.
    """
    rel_attrs = normalize_attribute_set(attributes)
    target_attrs = normalize_attribute_set(target_attributes)

    closure_res = compute_attribute_closure(
        attributes=rel_attrs,
        fds=fds,
        target_attributes=target_attrs,
        relation_name=relation_name,
    )

    rel_set = to_attribute_set(rel_attrs)
    closure_set = to_attribute_set(closure_res.closure_attributes)
    missing = sorted(list(rel_set - closure_set))

    is_super = len(missing) == 0

    if is_super:
        explanation = (
            f"The attribute set ({', '.join(target_attrs)}) is a superkey of relation {relation_name}. "
            f"Its functional closure ({', '.join(target_attrs)})+ contains all {len(rel_attrs)} attributes "
            f"of the relation {{{', '.join(closure_res.closure_attributes)}}}."
        )
    else:
        explanation = (
            f"The attribute set ({', '.join(target_attrs)}) is NOT a superkey of relation {relation_name}. "
            f"Its closure ({', '.join(target_attrs)})+ = {{{', '.join(closure_res.closure_attributes)}}} "
            f"fails to determine the following {len(missing)} attribute(s): {{{', '.join(missing)}}}."
        )

    return SuperkeyCheckResult(
        target_attributes=target_attrs,
        is_superkey=is_super,
        closure=closure_res.closure_attributes,
        missing_attributes=missing,
        explanation=explanation,
    )


def verify_candidate_key(
    attributes: List[str],
    fds: List[FunctionalDependency],
    candidate_key: List[str],
    relation_name: str = "R",
) -> KeyVerificationResult:
    """
    Validates whether a proposed attribute set K is a genuine minimal candidate key.
    
    Conditions:
      1. K must be a superkey (K+ = R).
      2. K must be minimal (no non-empty proper subset S ⊂ K is a superkey).
    """
    rel_attrs = normalize_attribute_set(attributes)
    cand_attrs = normalize_attribute_set(candidate_key)

    if not cand_attrs:
        raise CandidateKeyEngineError("Candidate key candidate cannot be empty.")

    rel_set = to_attribute_set(rel_attrs)
    invalid_attrs = [a for a in cand_attrs if a not in rel_set]
    if invalid_attrs:
        raise CandidateKeyEngineError(
            f"Proposed key ({', '.join(cand_attrs)}) contains unknown attribute(s): {{{', '.join(invalid_attrs)}}}."
        )

    # 1. Superkey Test
    superkey_check = check_is_superkey(
        attributes=rel_attrs,
        fds=fds,
        target_attributes=cand_attrs,
        relation_name=relation_name,
    )

    if not superkey_check.is_superkey:
        explanation = (
            f"Proposed key ({', '.join(cand_attrs)}) is NOT a candidate key because it is not even a superkey. "
            f"Its closure ({', '.join(cand_attrs)})+ = {{{', '.join(superkey_check.closure)}}} "
            f"is missing: {{{', '.join(superkey_check.missing_attributes)}}}."
        )
        return KeyVerificationResult(
            candidate_key=cand_attrs,
            is_superkey=False,
            is_minimal=False,
            is_candidate_key=False,
            closure=superkey_check.closure,
            missing_attributes=superkey_check.missing_attributes,
            violating_subset=None,
            minimality_checks=[],
            explanation=explanation,
        )

    # 2. Minimality Test
    # If the key has size 1, it has no non-empty proper subsets; therefore it is automatically minimal.
    minimality_checks: List[MinimalityCheck] = []
    violating_subset: Optional[List[str]] = None

    if len(cand_attrs) == 1:
        is_minimal = True
        explanation = (
            f"✓ Valid Candidate Key! ({', '.join(cand_attrs)}) is a single-attribute superkey with no "
            f"non-empty proper subsets. Therefore, it is strictly minimal and forms a valid candidate key of {relation_name}."
        )
    else:
        # Check proper subsets of size len(cand_attrs) - 1 down to 1
        # For efficiency, if removing any single attribute still yields a superkey, it's non-minimal.
        is_minimal = True
        cand_set = set(cand_attrs)

        for r in range(len(cand_attrs) - 1, 0, -1):
            for sub_tuple in combinations(cand_attrs, r):
                sub_list = list(sub_tuple)
                sub_closure_res = compute_attribute_closure(
                    attributes=rel_attrs,
                    fds=fds,
                    target_attributes=sub_list,
                    relation_name=relation_name,
                )
                sub_closure_set = to_attribute_set(sub_closure_res.closure_attributes)
                sub_is_super = rel_set.issubset(sub_closure_set)

                if sub_is_super:
                    check_expl = (
                        f"Proper subset ({', '.join(sub_list)}) is also a superkey! "
                        f"Its closure contains all relation attributes."
                    )
                    if violating_subset is None:
                        violating_subset = sub_list
                        is_minimal = False
                else:
                    sub_missing = sorted(list(rel_set - sub_closure_set))
                    check_expl = (
                        f"Proper subset ({', '.join(sub_list)}) is not a superkey (missing: {{{', '.join(sub_missing)}}})."
                    )

                minimality_checks.append(
                    MinimalityCheck(
                        subset=sub_list,
                        subset_closure=sub_closure_res.closure_attributes,
                        is_superkey=sub_is_super,
                        explanation=check_expl,
                    )
                )

        if is_minimal:
            explanation = (
                f"✓ Valid Candidate Key! ({', '.join(cand_attrs)}) is a superkey, and all tested proper subsets "
                f"fail to cover the entire relation. Therefore, ({', '.join(cand_attrs)}) is minimal."
            )
        else:
            redundant_attrs = sorted(list(cand_set - set(violating_subset or [])))
            explanation = (
                f"⚠ Superkey but NOT a Candidate Key! Proposed key ({', '.join(cand_attrs)}) determines all attributes, "
                f"but proper subset ({', '.join(violating_subset or [])}) is already a superkey on its own. "
                f"Attribute(s) {{{', '.join(redundant_attrs)}}} are redundant and violate the minimality requirement."
            )

    return KeyVerificationResult(
        candidate_key=cand_attrs,
        is_superkey=True,
        is_minimal=is_minimal,
        is_candidate_key=is_minimal,
        closure=superkey_check.closure,
        missing_attributes=[],
        violating_subset=violating_subset,
        minimality_checks=minimality_checks,
        explanation=explanation,
    )


def find_all_candidate_keys(
    attributes: List[str],
    fds: List[FunctionalDependency],
    relation_name: str = "R",
    max_combinations: int = 1000,
) -> KeyDiscoveryResult:
    r"""
    Discovers all candidate keys for a relational schema (R, F) using attribute-role partitioning
    and incremental subset search with superset pruning.
    
    Mathematical Principles:
      1. Attribute Roles:
         - Left-only (L): Attributes appearing on LHS of non-trivial FDs, but never RHS.
         - Right-only (R_only): Attributes appearing on RHS of non-trivial FDs, but never LHS.
         - Both (B): Attributes appearing on both LHS and RHS.
         - Neither (N): Attributes appearing in neither LHS nor RHS.
      2. Essential Core (E = L ∪ N):
         Attributes in E cannot be derived by any dependency and must belong to EVERY candidate key.
      3. Closure of E:
         If E+ = R, E is the unique minimal candidate key.
      4. Incremental Combination Search:
         If E+ ⊂ R, candidates must be formed by E ∪ S, where S ⊆ B.
         Explores S in increasing size order with superset pruning.
      5. Prime & Non-Prime Partitioning:
         Prime = ∪ K_i; Non-Prime = R \ Prime.
    """
    rel_attrs = normalize_attribute_set(attributes)
    if not rel_attrs:
        raise CandidateKeyEngineError("Relation must contain at least one attribute.")

    rel_set = to_attribute_set(rel_attrs)
    fd_set = FDSet(fds)

    reasoning_steps: List[KeyReasoningStep] = []
    warnings: List[str] = []

    # Step 1: Analyze attribute roles
    all_lhs: Set[str] = set()
    all_rhs: Set[str] = set()

    for fd in fd_set:
        all_lhs.update(fd.left)
        all_rhs.update(fd.right)

    # Restrict to valid attributes in R
    all_lhs = all_lhs.intersection(rel_set)
    all_rhs = all_rhs.intersection(rel_set)

    rel_index_map = {attr: i for i, attr in enumerate(rel_attrs)}
    left_only = [a for a in rel_attrs if a in (all_lhs - all_rhs)]
    right_only = [a for a in rel_attrs if a in (all_rhs - all_lhs)]
    both = [a for a in rel_attrs if a in (all_lhs & all_rhs)]
    neither = [a for a in rel_attrs if a in (rel_set - (all_lhs | all_rhs))]
    essential = [a for a in rel_attrs if a in set(left_only).union(set(neither))]

    reasoning_steps.append(
        KeyReasoningStep(
            step_number=1,
            title="Attribute Role Partitioning",
            description=(
                f"Classified all {len(rel_attrs)} attributes into functional roles: "
                f"Left-Only (L) = {{{', '.join(left_only) or '∅'}}}, "
                f"Right-Only (R_only) = {{{', '.join(right_only) or '∅'}}}, "
                f"Both LHS & RHS (B) = {{{', '.join(both) or '∅'}}}, "
                f"Neither (N) = {{{', '.join(neither) or '∅'}}}. "
                f"Attributes in L and N can never be derived on the RHS of any dependency and must be present in every candidate key."
            ),
            details={
                "left_only": left_only,
                "right_only": right_only,
                "both": both,
                "neither": neither,
                "essential": essential,
            },
        )
    )

    candidate_keys: List[List[str]] = []
    explored_count = 0

    # Step 2: Test Essential Core
    if essential:
        essential_closure_res = compute_attribute_closure(
            attributes=rel_attrs,
            fds=fds,
            target_attributes=essential,
            relation_name=relation_name,
        )
        explored_count += 1
        essential_closure_set = to_attribute_set(essential_closure_res.closure_attributes)

        if rel_set.issubset(essential_closure_set):
            # Essential set already covers R!
            candidate_keys.append(essential)
            reasoning_steps.append(
                KeyReasoningStep(
                    step_number=2,
                    title="Essential Core Closure Evaluation",
                    description=(
                        f"Computed the closure of essential attributes ({', '.join(essential)})+ = "
                        f"{{{', '.join(essential_closure_res.closure_attributes)}}}. "
                        f"Because the essential core covers all relation attributes and every candidate key must contain "
                        f"these attributes, ({', '.join(essential)}) is the UNIQUE minimal candidate key."
                    ),
                    details={
                        "tested_set": essential,
                        "closure": essential_closure_res.closure_attributes,
                        "is_superkey": True,
                    },
                )
            )
        else:
            missing = sorted(list(rel_set - essential_closure_set))
            reasoning_steps.append(
                KeyReasoningStep(
                    step_number=2,
                    title="Essential Core Closure Evaluation",
                    description=(
                        f"Computed the closure of essential attributes ({', '.join(essential)})+ = "
                        f"{{{', '.join(essential_closure_res.closure_attributes)}}}. "
                        f"Missing attributes: {{{', '.join(missing)}}}. "
                        f"Candidate keys must combine the essential core with subsets of intermediate attributes (B = {{{', '.join(both)}}})."
                    ),
                    details={
                        "tested_set": essential,
                        "closure": essential_closure_res.closure_attributes,
                        "missing_attributes": missing,
                        "is_superkey": False,
                    },
                )
            )
    else:
        # Essential set is empty (all attributes appear on RHS or both)
        reasoning_steps.append(
            KeyReasoningStep(
                step_number=2,
                title="Essential Core Evaluation",
                description=(
                    f"No attributes are strictly essential (L ∪ N = ∅). All attributes can potentially be derived. "
                    f"Searching combinations from candidate pool (B = {{{', '.join(both)}}})."
                ),
                details={"tested_set": [], "is_superkey": False},
            )
        )

    # Step 3: Incremental combination search if essential core was not a superkey
    if not candidate_keys:
        # Attributes from right_only never need to be added to candidate keys because they do not appear on LHS of any FD.
        # We only need to explore subsets of 'both'.
        search_pool = both
        if not search_pool and not essential:
            # Extreme edge case: all attributes are right_only (syntactically invalid without LHS, but handled safely)
            search_pool = rel_attrs

        found_key_sets: List[Set[str]] = []

        for r in range(1, len(search_pool) + 1):
            if explored_count >= max_combinations:
                warnings.append(
                    f"Search space safety limit reached ({max_combinations} combinations evaluated). "
                    f"Exhaustive candidate-key enumeration was paused to protect performance."
                )
                break

            for comb_tuple in combinations(search_pool, r):
                explored_count += 1
                if explored_count >= max_combinations:
                    break

                current_candidate_set = set(essential).union(comb_tuple)

                # Superset pruning: if an already found candidate key is a subset, prune current candidate!
                if any(k_set.issubset(current_candidate_set) for k_set in found_key_sets):
                    continue

                current_candidate_list = sorted(list(current_candidate_set), key=lambda a: rel_index_map.get(a, 0))
                closure_res = compute_attribute_closure(
                    attributes=rel_attrs,
                    fds=fds,
                    target_attributes=current_candidate_list,
                    relation_name=relation_name,
                )
                closure_set = to_attribute_set(closure_res.closure_attributes)

                if rel_set.issubset(closure_set):
                    # Found a superkey! Because we search in increasing order of size and prune supersets,
                    # current_candidate_set is guaranteed to be minimal.
                    found_key_sets.append(current_candidate_set)
                    candidate_keys.append(current_candidate_list)

        reasoning_steps.append(
            KeyReasoningStep(
                step_number=3,
                title="Incremental Candidate Search & Superset Pruning",
                description=(
                    f"Explored {explored_count} attribute combinations combining the essential core with "
                    f"intermediate attributes in increasing size order. "
                    f"Found {len(candidate_keys)} minimal candidate key(s) with superset pruning."
                ),
                details={
                    "explored_count": explored_count,
                    "discovered_keys": candidate_keys,
                },
            )
        )

    # If no candidate keys found yet (e.g. empty relation or isolated edge case), fallback to entire relation
    if not candidate_keys:
        candidate_keys.append(rel_attrs)
        reasoning_steps.append(
            KeyReasoningStep(
                step_number=len(reasoning_steps) + 1,
                title="Full Relation Fallback",
                description=(
                    f"No smaller minimal superkey exists. The entire relation ({', '.join(rel_attrs)}) "
                    f"is required to uniquely determine all attributes."
                ),
                details={"candidate_keys": [rel_attrs]},
            )
        )

    # Sort candidate keys deterministically: first by length, then by schema attribute sequence
    candidate_keys.sort(key=lambda k: (len(k), [rel_index_map.get(a, 0) for a in k]))

    # Step 4: Prime and Non-Prime classification
    prime_set: Set[str] = set()
    for k in candidate_keys:
        prime_set.update(k)

    prime_attrs = [a for a in rel_attrs if a in prime_set]
    non_prime_attrs = [a for a in rel_attrs if a not in prime_set]

    reasoning_steps.append(
        KeyReasoningStep(
            step_number=len(reasoning_steps) + 1,
            title="Prime & Non-Prime Attribute Partitioning",
            description=(
                f"Identified {len(prime_attrs)} prime attribute(s) {{{', '.join(prime_attrs) or 'none'}}} "
                f"(union of all attributes participating in at least one candidate key), "
                f"and {len(non_prime_attrs)} non-prime attribute(s) {{{', '.join(non_prime_attrs) or 'none'}}} "
                f"which do not participate in any candidate key."
            ),
            details={
                "prime_attributes": prime_attrs,
                "non_prime_attributes": non_prime_attrs,
            },
        )
    )

    return KeyDiscoveryResult(
        relation_name=relation_name,
        candidate_keys=candidate_keys,
        prime_attributes=prime_attrs,
        non_prime_attributes=non_prime_attrs,
        essential_attributes=essential,
        explored_combinations_count=explored_count,
        reasoning_steps=reasoning_steps,
        warnings=warnings,
    )


def analyze_candidate_keys(
    attributes: List[str],
    fds: List[FunctionalDependency],
    user_candidate_keys: Optional[List[List[str]]] = None,
    relation_name: str = "R",
    max_combinations: int = 1000,
) -> CandidateKeyAnalysisResult:
    """
    Comprehensive candidate-key analysis combining automatic discovery, prime/non-prime
    classification, and verification of user-provided keys.
    """
    discovery_res = find_all_candidate_keys(
        attributes=attributes,
        fds=fds,
        relation_name=relation_name,
        max_combinations=max_combinations,
    )

    user_verifications: List[KeyVerificationResult] = []
    if user_candidate_keys:
        for u_key in user_candidate_keys:
            if u_key:
                v_res = verify_candidate_key(
                    attributes=attributes,
                    fds=fds,
                    candidate_key=u_key,
                    relation_name=relation_name,
                )
                user_verifications.append(v_res)

    return CandidateKeyAnalysisResult(
        relation_name=relation_name,
        discovered_candidate_keys=discovery_res.candidate_keys,
        prime_attributes=discovery_res.prime_attributes,
        non_prime_attributes=discovery_res.non_prime_attributes,
        essential_attributes=discovery_res.essential_attributes,
        user_key_verifications=user_verifications,
        reasoning_steps=discovery_res.reasoning_steps,
        warnings=discovery_res.warnings,
    )
