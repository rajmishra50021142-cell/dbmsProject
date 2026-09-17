"""
Unit tests for Candidate-Key Engine, Superkeys & Prime/Non-Prime Attribute Analysis (Phase 4).
"""

import pytest
from app.schemas.domain_contracts import FunctionalDependency
from app.normalization.candidate_key_engine import (
    check_is_superkey,
    verify_candidate_key,
    find_all_candidate_keys,
    analyze_candidate_keys,
    CandidateKeyEngineError,
)


def test_single_candidate_key_chain():
    """R(A, B, C, D) with A -> B, B -> C, C -> D => Candidate Key is {A}."""
    attributes = ["A", "B", "C", "D"]
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
        FunctionalDependency(left=["B"], right=["C"]),
        FunctionalDependency(left=["C"], right=["D"]),
    ]

    res = find_all_candidate_keys(attributes=attributes, fds=fds, relation_name="R")
    assert res.candidate_keys == [["A"]]
    assert res.prime_attributes == ["A"]
    assert sorted(res.non_prime_attributes) == ["B", "C", "D"]
    assert res.essential_attributes == ["A"]
    assert len(res.reasoning_steps) >= 3


def test_composite_candidate_key():
    """R(StudentID, CourseID, Grade, CourseName) with StudentID, CourseID -> Grade; CourseID -> CourseName."""
    attributes = ["StudentID", "CourseID", "Grade", "CourseName"]
    fds = [
        FunctionalDependency(left=["StudentID", "CourseID"], right=["Grade"]),
        FunctionalDependency(left=["CourseID"], right=["CourseName"]),
    ]

    res = find_all_candidate_keys(attributes=attributes, fds=fds, relation_name="ENROLLMENT")
    assert len(res.candidate_keys) == 1
    assert set(res.candidate_keys[0]) == {"StudentID", "CourseID"}
    assert set(res.prime_attributes) == {"StudentID", "CourseID"}
    assert set(res.non_prime_attributes) == {"Grade", "CourseName"}


def test_multiple_candidate_keys():
    """R(A, B, C) with A -> B, C and C -> A, B => Candidate Keys are {A} and {C}."""
    attributes = ["A", "B", "C"]
    fds = [
        FunctionalDependency(left=["A"], right=["B", "C"]),
        FunctionalDependency(left=["C"], right=["A", "B"]),
    ]

    res = find_all_candidate_keys(attributes=attributes, fds=fds, relation_name="R")
    assert len(res.candidate_keys) == 2
    assert ["A"] in res.candidate_keys
    assert ["C"] in res.candidate_keys
    assert set(res.prime_attributes) == {"A", "C"}
    assert res.non_prime_attributes == ["B"]


def test_multiple_composite_keys():
    """R(A, B, C, D) with AB -> C, BC -> A, and D is an isolated attribute."""
    attributes = ["A", "B", "C", "D"]
    fds = [
        FunctionalDependency(left=["A", "B"], right=["C"]),
        FunctionalDependency(left=["B", "C"], right=["A"]),
    ]

    res = find_all_candidate_keys(attributes=attributes, fds=fds, relation_name="R")
    # Because D cannot be derived, D must be in every key.
    # The two minimal keys are {A, B, D} and {B, C, D}.
    assert len(res.candidate_keys) == 2
    key_sets = [set(k) for k in res.candidate_keys]
    assert {"A", "B", "D"} in key_sets
    assert {"B", "C", "D"} in key_sets
    assert set(res.prime_attributes) == {"A", "B", "C", "D"}
    assert res.non_prime_attributes == []


def test_superkey_check():
    """Verify superkey determination."""
    attributes = ["A", "B", "C"]
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
        FunctionalDependency(left=["B"], right=["C"]),
    ]

    # {A} is a superkey
    res_a = check_is_superkey(attributes, fds, ["A"])
    assert res_a.is_superkey is True
    assert res_a.missing_attributes == []

    # {A, B} is also a superkey
    res_ab = check_is_superkey(attributes, fds, ["A", "B"])
    assert res_ab.is_superkey is True

    # {B} is not a superkey (missing A)
    res_b = check_is_superkey(attributes, fds, ["B"])
    assert res_b.is_superkey is False
    assert "A" in res_b.missing_attributes


def test_candidate_key_verification_minimal_vs_redundant():
    """Verify candidate-key minimality distinguishes minimal keys from bloated superkeys."""
    attributes = ["A", "B", "C"]
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
        FunctionalDependency(left=["B"], right=["C"]),
    ]

    # {A} is minimal candidate key
    v_a = verify_candidate_key(attributes, fds, ["A"])
    assert v_a.is_superkey is True
    assert v_a.is_minimal is True
    assert v_a.is_candidate_key is True

    # {A, B} is a superkey, but NOT minimal because {A} is already a superkey
    v_ab = verify_candidate_key(attributes, fds, ["A", "B"])
    assert v_ab.is_superkey is True
    assert v_ab.is_minimal is False
    assert v_ab.is_candidate_key is False
    assert v_ab.violating_subset == ["A"]
    assert "redundant" in v_ab.explanation.lower()

    # {B} is neither
    v_b = verify_candidate_key(attributes, fds, ["B"])
    assert v_b.is_superkey is False
    assert v_b.is_candidate_key is False


def test_empty_fd_set_complete_relation_is_key():
    """When no FDs exist, the entire relation R is the sole minimal candidate key."""
    attributes = ["X", "Y", "Z"]
    fds = []

    res = find_all_candidate_keys(attributes=attributes, fds=fds, relation_name="EMPTY_FD")
    assert len(res.candidate_keys) == 1
    assert set(res.candidate_keys[0]) == {"X", "Y", "Z"}
    assert set(res.prime_attributes) == {"X", "Y", "Z"}
    assert res.non_prime_attributes == []


def test_cyclic_dependencies_candidate_keys():
    """Cyclic dependencies A -> B -> C -> A => Every attribute is an independent candidate key."""
    attributes = ["A", "B", "C"]
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
        FunctionalDependency(left=["B"], right=["C"]),
        FunctionalDependency(left=["C"], right=["A"]),
    ]

    res = find_all_candidate_keys(attributes=attributes, fds=fds, relation_name="CYCLE")
    assert len(res.candidate_keys) == 3
    assert ["A"] in res.candidate_keys
    assert ["B"] in res.candidate_keys
    assert ["C"] in res.candidate_keys
    assert set(res.prime_attributes) == {"A", "B", "C"}
    assert res.non_prime_attributes == []


def test_candidate_key_analysis_with_user_keys():
    """Comprehensive analysis combining auto-discovery and user verification."""
    attributes = ["StudentID", "CourseID", "Grade", "StudentName"]
    fds = [
        FunctionalDependency(left=["StudentID", "CourseID"], right=["Grade"]),
        FunctionalDependency(left=["StudentID"], right=["StudentName"]),
    ]

    user_keys = [
        ["StudentID", "CourseID"],  # Valid
        ["StudentID", "CourseID", "Grade"],  # Superkey but not minimal
        ["StudentID"],  # Not a superkey
    ]

    res = analyze_candidate_keys(
        attributes=attributes,
        fds=fds,
        user_candidate_keys=user_keys,
        relation_name="ENROLLMENT",
    )

    assert len(res.discovered_candidate_keys) == 1
    assert set(res.discovered_candidate_keys[0]) == {"StudentID", "CourseID"}
    assert len(res.user_key_verifications) == 3
    assert res.user_key_verifications[0].is_candidate_key is True
    assert res.user_key_verifications[1].is_superkey is True
    assert res.user_key_verifications[1].is_candidate_key is False
    assert res.user_key_verifications[2].is_superkey is False


def test_invalid_attributes_raise_engine_error():
    """Referencing non-existent attributes in candidate keys raises an error."""
    attributes = ["A", "B"]
    fds = []

    with pytest.raises(CandidateKeyEngineError, match="unknown attribute"):
        verify_candidate_key(attributes, fds, ["Z"])
