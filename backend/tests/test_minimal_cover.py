"""
Tests for Minimal Cover (Canonical Cover) Algorithm.

Verifies:
1. RHS Splitting (A -> B,C becomes A -> B and A -> C).
2. Extraneous LHS Attribute Removal.
3. Redundant FD Pruning.
4. Determinism and Stability.
"""

import pytest
from app.schemas.domain_contracts import FunctionalDependency
from app.decomposition.minimal_cover import compute_minimal_cover


def test_rhs_splitting():
    """Verify that dependencies with multi-attribute RHS are split into singleton RHS FDs."""
    fds = [
        FunctionalDependency(left=["A"], right=["B", "C"]),
        FunctionalDependency(left=["B"], right=["D"]),
    ]
    res = compute_minimal_cover(fds=fds, all_attributes=["A", "B", "C", "D"])

    # RHS split contracts should contain A -> B and A -> C
    split_notations = [f.notation() for f in res.rhs_split_fds]
    assert "A → B" in split_notations
    assert "A → C" in split_notations
    assert "B → D" in split_notations

    # Final minimal cover
    min_notations = [f.notation() for f in res.minimal_fds]
    assert "A → B" in min_notations
    assert "A → C" in min_notations
    assert "B → D" in min_notations


def test_extraneous_lhs_attribute():
    """
    Given:
      AB -> C
      A -> B
    Attribute B is extraneous in AB -> C because A+ = {A, B, C}.
    Resulting minimal cover should have A -> C instead of AB -> C.
    """
    fds = [
        FunctionalDependency(left=["A", "B"], right=["C"]),
        FunctionalDependency(left=["A"], right=["B"]),
    ]
    res = compute_minimal_cover(fds=fds, all_attributes=["A", "B", "C"])

    min_notations = [f.notation() for f in res.minimal_fds]
    assert "A → C" in min_notations
    assert "A → B" in min_notations
    assert "A, B → C" not in min_notations

    assert len(res.removed_extraneous_attributes) >= 1
    assert res.removed_extraneous_attributes[0]["extraneous_attribute"] == "B"


def test_redundant_fd_elimination():
    """
    Given:
      A -> B
      B -> C
      A -> C  (redundant via transitivity)
    The dependency A -> C should be pruned.
    """
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
        FunctionalDependency(left=["B"], right=["C"]),
        FunctionalDependency(left=["A"], right=["C"]),
    ]
    res = compute_minimal_cover(fds=fds, all_attributes=["A", "B", "C"])

    min_notations = [f.notation() for f in res.minimal_fds]
    assert "A → B" in min_notations
    assert "B → C" in min_notations
    assert "A → C" not in min_notations
    assert len(res.removed_redundant_fds) == 1
    assert res.removed_redundant_fds[0].left == ["A"]
    assert res.removed_redundant_fds[0].right == ["C"]


def test_minimal_cover_stability():
    """Verify that identical inputs produce stable, identical minimal covers."""
    fds = [
        FunctionalDependency(left=["A"], right=["B", "C"]),
        FunctionalDependency(left=["B"], right=["C"]),
        FunctionalDependency(left=["A", "B"], right=["D"]),
    ]
    res1 = compute_minimal_cover(fds=fds, all_attributes=["A", "B", "C", "D"])
    res2 = compute_minimal_cover(fds=fds, all_attributes=["A", "B", "C", "D"])

    assert [f.notation() for f in res1.minimal_fds] == [f.notation() for f in res2.minimal_fds]
    assert len(res1.reasoning_steps) == len(res2.reasoning_steps)
