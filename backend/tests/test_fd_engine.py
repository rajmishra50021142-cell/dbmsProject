"""
Tests for Functional Dependency Engine and CanonicalFD Representation.
"""

from app.schemas.domain_contracts import FunctionalDependency
from app.normalization.fd_engine import (
    CanonicalFD,
    canonicalize_fd,
    check_trivial_fd,
    FDSet,
)


def test_canonical_fd_equality_and_hashing():
    fd1 = CanonicalFD(left=["A", "B"], right=["C"])
    fd2 = CanonicalFD(left=["B", "A"], right=["C"])
    fd3 = CanonicalFD(left=["A"], right=["C"])

    assert fd1 == fd2
    assert fd1 != fd3
    assert hash(fd1) == hash(fd2)


def test_fd_decomposition():
    fd = CanonicalFD(left=["A"], right=["B", "C"])
    decomposed = fd.decompose_rhs()
    assert len(decomposed) == 2
    assert decomposed[0].notation() == "A → B"
    assert decomposed[1].notation() == "A → C"


def test_trivial_fd_check():
    # Completely trivial: A, B -> A
    fd_comp = FunctionalDependency(left=["A", "B"], right=["A"])
    res_comp = check_trivial_fd(fd_comp)
    assert res_comp.is_trivial is True
    assert res_comp.is_completely_trivial is True
    assert res_comp.trivial_attributes == ["A"]

    # Partially trivial: A, B -> A, C
    fd_part = FunctionalDependency(left=["A", "B"], right=["A", "C"])
    res_part = check_trivial_fd(fd_part)
    assert res_part.is_trivial is True
    assert res_part.is_completely_trivial is False
    assert res_part.trivial_attributes == ["A"]
    assert res_part.non_trivial_attributes == ["C"]

    # Non-trivial: A -> B
    fd_non = FunctionalDependency(left=["A"], right=["B"])
    res_non = check_trivial_fd(fd_non)
    assert res_non.is_trivial is False
    assert res_non.is_completely_trivial is False
    assert res_non.non_trivial_attributes == ["B"]


def test_fd_set_deduplication():
    fd_set = FDSet()
    fd1 = CanonicalFD(left=["A", "B"], right=["C"])
    fd2 = CanonicalFD(left=["B", "A"], right=["C"])  # Permuted duplicate
    fd3 = CanonicalFD(left=["A"], right=["D"])

    assert fd_set.add(fd1) is True
    assert fd_set.add(fd2) is False  # Rejected duplicate
    assert fd_set.add(fd3) is True
    assert len(fd_set) == 2
