"""
Tests for Lossless-Join Verification Engine (Tableau Chase & Fagin's Theorem).

Verifies:
1. Known lossless decomposition using Tableau Chase.
2. Known lossy decomposition using Tableau Chase.
3. Multi-relation decomposition with iterative symbol propagation.
4. Binary MVD decomposition using Fagin's theorem.
5. Structured traces and distinguished row identification.
"""

import pytest
from app.schemas.domain_contracts import FunctionalDependency, MultivaluedDependency
from app.decomposition.lossless_join import verify_lossless_join_chase, verify_lossless_join_mvd


def test_tableau_chase_known_lossless():
    """
    R(A, B, C, D)
    FDs: A -> B, B -> C
    Decomposition: R1(A, B), R2(B, C), R3(A, D)
    Should be proven LOSSLESS via chase equating symbols.
    """
    attributes = ["A", "B", "C", "D"]
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
        FunctionalDependency(left=["B"], right=["C"]),
    ]
    decomposed = [
        ["A", "B"],
        ["B", "C"],
        ["A", "D"],
    ]
    res = verify_lossless_join_chase(attributes, fds, decomposed)

    assert res.is_lossless is True
    assert res.method == "TABLEAU_CHASE"
    assert res.distinguished_row_index is not None
    assert len(res.chase_steps) >= 1
    # Check that the distinguished row has all 'a_j'
    final_row = res.final_tableau[res.distinguished_row_index]
    assert final_row == ["a_1", "a_2", "a_3", "a_4"]


def test_tableau_chase_known_lossy():
    """
    R(A, B, C)
    No FDs
    Decomposition: R1(A, B), R2(B, C)
    Natural join will create spurious tuples -> LOSSY.
    """
    attributes = ["A", "B", "C"]
    fds = []
    decomposed = [
        ["A", "B"],
        ["B", "C"],
    ]
    res = verify_lossless_join_chase(attributes, fds, decomposed)

    assert res.is_lossless is False
    assert res.distinguished_row_index is None
    assert "LOSSY" in res.reasoning


def test_tableau_chase_multi_relation_lossless():
    """
    R(StudentID, CourseID, StudentName, CourseName, Grade)
    StudentID -> StudentName
    CourseID -> CourseName
    (StudentID, CourseID) -> Grade
    Decomposition:
      R1(StudentID, StudentName)
      R2(CourseID, CourseName)
      R3(StudentID, CourseID, Grade)
    Should converge to lossless because R3 already contains (StudentID, CourseID),
    allowing StudentName and CourseName to equate to distinguished symbols in row 3.
    """
    attrs = ["StudentID", "CourseID", "StudentName", "CourseName", "Grade"]
    fds = [
        FunctionalDependency(left=["StudentID"], right=["StudentName"]),
        FunctionalDependency(left=["CourseID"], right=["CourseName"]),
        FunctionalDependency(left=["StudentID", "CourseID"], right=["Grade"]),
    ]
    decomposed = [
        ["StudentID", "StudentName"],
        ["CourseID", "CourseName"],
        ["StudentID", "CourseID", "Grade"],
    ]
    res = verify_lossless_join_chase(attrs, fds, decomposed)

    assert res.is_lossless is True
    assert res.distinguished_row_index == 2  # Row 3 becomes all distinguished
    assert len(res.chase_steps) >= 2


def test_fagins_theorem_mvd():
    """
    R(Student, Hobby, Language)
    MVD: Student ->> Hobby
    Decomposition:
      R1(Student, Hobby)
      R2(Student, Language)
    Lossless by Fagin's Theorem.
    """
    attrs = ["Student", "Hobby", "Language"]
    mvds = [
        MultivaluedDependency(left=["Student"], right=["Hobby"]),
    ]
    decomposed = [
        ["Student", "Hobby"],
        ["Student", "Language"],
    ]
    res = verify_lossless_join_mvd(attrs, mvds, decomposed)

    assert res.is_lossless is True
    assert res.method == "FAGINS_THEOREM"
    assert "Fagin's Theorem" in res.reasoning
