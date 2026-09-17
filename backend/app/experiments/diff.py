"""
Structured Mathematical Diff Engine for What-If / Experiment Mode.

Normalizes sets before comparison to avoid false positives when ordering differs.
Generates step-by-step 'Why did it change?' reasoning traces based on actual engine results.
"""

from typing import List, Dict, Any, Tuple, Set
from app.schemas.domain_contracts import (
    CanonicalSchemaInput,
    FullNormalizationAnalysisResult,
    FunctionalDependency,
    MultivaluedDependency,
)
from app.experiments.schemas import ExperimentDiff
from app.normalization.attribute_set import (
    normalize_attribute_set,
    to_attribute_set,
    set_equals,
    attribute_set_key,
)


def _fd_key(fd: FunctionalDependency) -> str:
    """Canonical string key for a functional dependency (normalized LHS and RHS)."""
    lhs = ",".join(normalize_attribute_set(fd.left))
    rhs = ",".join(normalize_attribute_set(fd.right))
    return f"{lhs}→{rhs}"


def _mvd_key(mvd: MultivaluedDependency) -> str:
    """Canonical string key for a multivalued dependency (normalized LHS and RHS)."""
    lhs = ",".join(normalize_attribute_set(mvd.left))
    rhs = ",".join(normalize_attribute_set(mvd.right))
    return f"{lhs}↠{rhs}"


def _key_set_repr(key: List[str]) -> str:
    """Canonical string representation for a candidate key."""
    return ",".join(normalize_attribute_set(key))


class ExperimentDiffEngine:
    """Computes rigorous diffs and derivations between two normalization analyses."""

    @classmethod
    def compute_diff(
        cls,
        orig_input: CanonicalSchemaInput,
        mod_input: CanonicalSchemaInput,
        orig_res: FullNormalizationAnalysisResult,
        mod_res: FullNormalizationAnalysisResult,
    ) -> Tuple[ExperimentDiff, List[str]]:
        # 1. Attribute diff
        orig_attrs = normalize_attribute_set(orig_input.attributes)
        mod_attrs = normalize_attribute_set(mod_input.attributes)
        attrs_added = [a for a in mod_attrs if a not in orig_attrs]
        attrs_removed = [a for a in orig_attrs if a not in mod_attrs]

        # 2. FD diff
        orig_fd_map = {_fd_key(fd): fd for fd in orig_input.functional_dependencies}
        mod_fd_map = {_fd_key(fd): fd for fd in mod_input.functional_dependencies}
        fds_added = [
            {"left": fd.left, "right": fd.right, "notation": fd.notation()}
            for k, fd in mod_fd_map.items() if k not in orig_fd_map
        ]
        fds_removed = [
            {"left": fd.left, "right": fd.right, "notation": fd.notation()}
            for k, fd in orig_fd_map.items() if k not in mod_fd_map
        ]

        # 3. MVD diff
        orig_mvd_map = {_mvd_key(m): m for m in orig_input.multivalued_dependencies}
        mod_mvd_map = {_mvd_key(m): m for m in mod_input.multivalued_dependencies}
        mvds_added = [
            {"left": m.left, "right": m.right, "notation": m.notation()}
            for k, m in mod_mvd_map.items() if k not in orig_mvd_map
        ]
        mvds_removed = [
            {"left": m.left, "right": m.right, "notation": m.notation()}
            for k, m in orig_mvd_map.items() if k not in mod_mvd_map
        ]

        # 4. Candidate Key diff
        orig_keys = {attribute_set_key(k): k for k in orig_res.candidate_keys}
        mod_keys = {attribute_set_key(k): k for k in mod_res.candidate_keys}
        keys_added = [k for s, k in mod_keys.items() if s not in orig_keys]
        keys_removed = [k for s, k in orig_keys.items() if s not in mod_keys]

        # 5. Prime attributes diff
        orig_primes = normalize_attribute_set(orig_res.prime_attributes)
        mod_primes = normalize_attribute_set(mod_res.prime_attributes)
        primes_added = [p for p in mod_primes if p not in orig_primes]
        primes_removed = [p for p in orig_primes if p not in mod_primes]

        # 6. Normal Form status changes
        stages = ["1NF", "2NF", "3NF", "4NF"]
        nf_orig = {
            "1NF": orig_res.nf1.status.value,
            "2NF": orig_res.nf2.status.value,
            "3NF": orig_res.nf3.status.value,
            "4NF": orig_res.nf4.status.value,
        }
        nf_mod = {
            "1NF": mod_res.nf1.status.value,
            "2NF": mod_res.nf2.status.value,
            "3NF": mod_res.nf3.status.value,
            "4NF": mod_res.nf4.status.value,
        }
        nf_changed = []
        for s in stages:
            if nf_orig[s] != nf_mod[s]:
                nf_changed.append({
                    "stage": s,
                    "before": nf_orig[s],
                    "after": nf_mod[s],
                })

        # 7. Violations diff
        def _gather_violations(res: FullNormalizationAnalysisResult) -> List[Dict[str, Any]]:
            v_list = []
            if res.nf1.violations:
                for v in res.nf1.violations:
                    v_list.append({"stage": "1NF", "desc": str(v)})
            if res.nf2.partial_dependencies:
                for p in res.nf2.partial_dependencies:
                    v_list.append({"stage": "2NF", "desc": f"{', '.join(p.determinant)} → {', '.join(p.dependent_attributes)}"})
            if res.nf3.violations:
                for v in res.nf3.violations:
                    v_list.append({"stage": "3NF", "desc": v.functional_dependency.notation()})
            if res.nf4.violations:
                for v in res.nf4.violations:
                    v_list.append({"stage": "4NF", "desc": v.mvd.notation()})
            return v_list

        orig_v = _gather_violations(orig_res)
        mod_v = _gather_violations(mod_res)
        v_added = [v for v in mod_v if v not in orig_v]
        v_removed = [v for v in orig_v if v not in mod_v]

        diff = ExperimentDiff(
            attributes_added=attrs_added,
            attributes_removed=attrs_removed,
            dependencies_added=fds_added,
            dependencies_removed=fds_removed,
            mvds_added=mvds_added,
            mvds_removed=mvds_removed,
            candidate_keys_added=keys_added,
            candidate_keys_removed=keys_removed,
            prime_attributes_added=primes_added,
            prime_attributes_removed=primes_removed,
            normal_forms_changed=nf_changed,
            violations_added=v_added,
            violations_removed=v_removed,
            highest_normal_form_before=orig_res.highest_confirmed_normal_form.value,
            highest_normal_form_after=mod_res.highest_confirmed_normal_form.value,
        )

        # 8. Pedagogical "Why did it change?" reasoning traces
        reasoning_changes: List[str] = []

        if attrs_added:
            reasoning_changes.append(f"Attribute(s) added: {{{', '.join(attrs_added)}}}.")
        if attrs_removed:
            reasoning_changes.append(f"Attribute(s) removed: {{{', '.join(attrs_removed)}}}.")

        if fds_added:
            added_notations = ", ".join(f"`{f['notation']}`" for f in fds_added)
            reasoning_changes.append(f"Added functional dependency: {added_notations}.")
        if fds_removed:
            removed_notations = ", ".join(f"`{f['notation']}`" for f in fds_removed)
            reasoning_changes.append(f"Removed functional dependency: {removed_notations}.")

        if keys_added or keys_removed:
            orig_k_str = ", ".join(f"{{{', '.join(k)}}}" for k in orig_res.candidate_keys)
            mod_k_str = ", ".join(f"{{{', '.join(k)}}}" for k in mod_res.candidate_keys)
            reasoning_changes.append(f"Candidate keys updated from [{orig_k_str}] to [{mod_k_str}].")

        for ch in nf_changed:
            stage = ch["stage"]
            before = ch["before"]
            after = ch["after"]

            if stage == "2NF":
                if after == "VIOLATED":
                    reasoning_changes.append(
                        "Why 2NF changed to VIOLATED: Modifying dependencies introduced a partial dependency "
                        "where a proper subset of a composite candidate key determines a non-prime attribute."
                    )
                else:
                    reasoning_changes.append(
                        "Why 2NF changed to SATISFIED: Removing or adjusting partial dependencies ensured that "
                        "all non-prime attributes are fully dependent on the entire candidate key."
                    )
            elif stage == "3NF":
                if after == "VIOLATED":
                    reasoning_changes.append(
                        "Why 3NF changed to VIOLATED: A dependency now exists where the determinant is not a superkey "
                        "and the dependent attribute is non-prime, violating the 3NF condition."
                    )
                else:
                    reasoning_changes.append(
                        "Why 3NF changed to SATISFIED: All non-trivial dependencies now either possess superkey determinants "
                        "or contain only prime dependent attributes."
                    )
            elif stage == "4NF":
                if after == "VIOLATED":
                    reasoning_changes.append(
                        "Why 4NF changed to VIOLATED: An active non-trivial multivalued dependency exists whose determinant "
                        "is not a superkey of the relation."
                    )
                else:
                    reasoning_changes.append(
                        "Why 4NF changed to SATISFIED: Multivalued dependencies are now either trivial or their determinants "
                        "form superkeys."
                    )

        if orig_res.highest_confirmed_normal_form != mod_res.highest_confirmed_normal_form:
            reasoning_changes.append(
                f"Overall Highest Confirmed Normal Form shifted: "
                f"{orig_res.highest_confirmed_normal_form.value} → {mod_res.highest_confirmed_normal_form.value}."
            )

        return diff, reasoning_changes
