"""
Tests for Dependency Preservation Engine.

Verifies:
1. Preserved case where all FDs are covered by projected dependencies.
2. Non-preserved case where an FD requires an inter-relational join.
3. Transitive preservation across multiple relations.
4. Mathematical closure checking without naive string comparison.
"""

import pytest
from app.schemas.domain_contracts import FunctionalDependency
from app.decomposition.dependency_preservation import (
    verify_dependency_preservation,
    project_functional_dependencies,
)


def test_dependency_preservation_preserved_case():
    """
    R(A, B, C)
    FDs: A -> B, B -> C
    Decomposition: R1(A, B), R2(B, C)
    A -> B is directly in R1.
    B -> C is directly in R2.
    All FDs preserved!
    """
    attrs = ["A", "B", "C"]
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
        FunctionalDependency(left=["B"], right=["C"]),
    ]
    decomposed = [
        ["A", "B"],
        ["B", "C"],
    ]
    res = verify_dependency_preservation(attrs, fds, decomposed)

    assert res.is_preserved is True
    assert len(res.preserved_dependencies) == 2
    assert len(res.non_preserved_dependencies) == 0


def test_dependency_preservation_non_preserved_case():
    """
    Classic textbook non-preserving decomposition:
    R(A, B, C)
    FDs:
      A, B -> C
      C -> B
    Candidate keys: (A, B) and (A, C)
    Decomposition into 3NF / BCNF:
      R1(A, C)
      R2(B, C)
    C -> B is preserved in R2.
    A, B -> C cannot be preserved without joining R1 and R2!
    """
    attrs = ["A", "B", "C"]
    fds = [
        FunctionalDependency(left=["A", "B"], right=["C"]),
        FunctionalDependency(left=["C"], right=["B"]),
    ]
    decomposed = [
        ["A", "C"],
        ["B", "C"],
    ]
    res = verify_dependency_preservation(attrs, fds, decomposed)

    assert res.is_preserved is False
    assert len(res.preserved_dependencies) == 1
    assert res.preserved_dependencies[0].left == ["C"]
    assert len(res.non_preserved_dependencies) == 1
    assert res.non_preserved_dependencies[0].left == ["A", "B"]


def test_transitive_preservation():
    """
    R(A, B, C, D)
    FDs:
      A -> B
      B -> C
      C -> D
      A -> D (implied)
    Decomposition:
      R1(A, B), R2(B, C), R3(C, D)
    FD A -> D is preserved because A+ under projected FDs {A->B, B->C, C->D} is {A, B, C, D}.
    """
    attrs = ["A", "B", "C", "D"]
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
        FunctionalDependency(left=["B"], right=["C"]),
        FunctionalDependency(left=["C"], right=["D"]),
        FunctionalDependency(left=["A"], right=["D"]),
    ]
    decomposed = [
        ["A", "B"],
        ["B", "C"],
        ["C", "D"],
    ]
    res = verify_dependency_preservation(attrs, fds, decomposed)

    assert res.is_preserved is True
    assert len(res.non_preserved_dependencies) == 0
    # Check that A -> D was checked and verified
    ad_check = next(c for c in res.checks if c.target_fd.left == ["A"] and c.target_fd.right == ["D"])
    assert ad_check.is_preserved is True
