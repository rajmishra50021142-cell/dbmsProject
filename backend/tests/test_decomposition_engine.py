"""
Tests for Decomposition Engine & Multi-Stage Normalization Pipeline.

Verifies:
1. Section 115: 2NF decomposition fixture (StudentID, CourseID, StudentName, CourseName, Grade).
2. Section 116: 3NF decomposition fixture (EmpID, EmpName, DeptID, DeptName).
3. Section 117: 4NF decomposition fixture (Student, Hobby, Language).
4. Candidate-key preservation guarantee in 3NF synthesis.
5. Verification integration and lineage tracking.
"""

import pytest
from app.schemas.domain_contracts import FunctionalDependency, MultivaluedDependency
from app.decomposition.decomposition_engine import (
    decompose_2nf,
    decompose_3nf,
    decompose_4nf,
    analyze_decomposition_pipeline,
)


def test_section_115_2nf_decomposition_fixture():
    """
    R(StudentID, CourseID, StudentName, CourseName, Grade)
    K: (StudentID, CourseID)
    FDs:
      StudentID -> StudentName
      CourseID -> CourseName
      StudentID, CourseID -> Grade
    Expected:
      Sub-relations for Student, Course, and Enrollment.
      Verified Lossless Join and Dependency Preservation.
    """
    attrs = ["StudentID", "CourseID", "StudentName", "CourseName", "Grade"]
    fds = [
        FunctionalDependency(left=["StudentID"], right=["StudentName"]),
        FunctionalDependency(left=["CourseID"], right=["CourseName"]),
        FunctionalDependency(left=["StudentID", "CourseID"], right=["Grade"]),
    ]
    candidate_keys = [["StudentID", "CourseID"]]

    plan = decompose_2nf("ENROLLMENT", attrs, fds, candidate_keys)

    assert plan.stage == "2NF"
    assert len(plan.proposed_relations) == 3

    # Check attribute sets of decomposed relations
    attr_sets = [set(r.attributes) for r in plan.proposed_relations]
    assert {"StudentID", "StudentName"} in attr_sets
    assert {"CourseID", "CourseName"} in attr_sets
    assert {"StudentID", "CourseID", "Grade"} in attr_sets

    # Check formal verification
    assert plan.lossless_join.is_lossless is True
    assert plan.lossless_join.method == "TABLEAU_CHASE"
    assert plan.dependency_preservation.is_preserved is True


def test_section_116_3nf_synthesis_fixture():
    """
    R(EmpID, EmpName, DeptID, DeptName)
    FDs:
      EmpID -> EmpName, DeptID
      DeptID -> DeptName
    Expected:
      EMPLOYEE(EmpID, EmpName, DeptID)
      DEPARTMENT(DeptID, DeptName)
      Verified Lossless Join and Dependency Preservation.
    """
    attrs = ["EmpID", "EmpName", "DeptID", "DeptName"]
    fds = [
        FunctionalDependency(left=["EmpID"], right=["EmpName", "DeptID"]),
        FunctionalDependency(left=["DeptID"], right=["DeptName"]),
    ]
    candidate_keys = [["EmpID"]]

    plan, min_cover = decompose_3nf("EMPLOYEE_REGISTRY", attrs, fds, candidate_keys)

    assert plan.stage == "3NF"
    assert len(plan.proposed_relations) == 2

    attr_sets = [set(r.attributes) for r in plan.proposed_relations]
    assert {"EmpID", "EmpName", "DeptID"} in attr_sets
    assert {"DeptID", "DeptName"} in attr_sets

    # Check formal verification
    assert plan.lossless_join.is_lossless is True
    assert plan.dependency_preservation.is_preserved is True
    assert len(min_cover.minimal_fds) >= 3


def test_section_117_4nf_decomposition_fixture():
    """
    R(Student, Hobby, Language)
    MVD: Student ->> Hobby
    Expected:
      R1(Student, Hobby)
      R2(Student, Language)
    """
    attrs = ["Student", "Hobby", "Language"]
    fds = []
    mvds = [
        MultivaluedDependency(left=["Student"], right=["Hobby"]),
    ]
    candidate_keys = [["Student", "Hobby", "Language"]]

    plan = decompose_4nf("STUDENT_ACTIVITIES", attrs, fds, mvds, candidate_keys)

    assert plan.stage == "4NF"
    assert len(plan.proposed_relations) == 2

    attr_sets = [set(r.attributes) for r in plan.proposed_relations]
    assert {"Student", "Hobby"} in attr_sets
    assert {"Student", "Language"} in attr_sets

    assert plan.lossless_join.is_lossless is True
    assert plan.lossless_join.method == "FAGINS_THEOREM"


def test_3nf_candidate_key_relation_guarantee():
    """
    When minimal cover FDs do not cover an original candidate key,
    Bernstein's synthesis must explicitly add a relation containing an original candidate key.
    R(A, B, C, D)
    FDs:
      A -> B
      B -> C
    Candidate key: (A, D)
    Synthesized relations from FDs:
      R1(A, B), R2(B, C)
    Since neither contains (A, D), synthesis must add R_KEY(A, D).
    """
    attrs = ["A", "B", "C", "D"]
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
        FunctionalDependency(left=["B"], right=["C"]),
    ]
    candidate_keys = [["A", "D"]]

    plan, _ = decompose_3nf("TEST_REL", attrs, fds, candidate_keys)

    attr_sets = [set(r.attributes) for r in plan.proposed_relations]
    assert {"A", "B"} in attr_sets
    assert {"B", "C"} in attr_sets
    assert {"A", "D"} in attr_sets

    assert plan.lossless_join.is_lossless is True
    assert plan.dependency_preservation.is_preserved is True


def test_analyze_decomposition_pipeline_unified():
    """Test full analysis pipeline execution."""
    attrs = ["EmpID", "EmpName", "DeptID", "DeptName"]
    fds = [
        FunctionalDependency(left=["EmpID"], right=["EmpName", "DeptID"]),
        FunctionalDependency(left=["DeptID"], right=["DeptName"]),
    ]

    res = analyze_decomposition_pipeline(
        relation_name="EMPLOYEE",
        attributes=attrs,
        fds=fds,
        mvds=[],
        target_normal_form="3NF",
    )

    assert res.target_normal_form == "3NF"
    assert len(res.final_relations) == 2
    assert res.verification.overall_status == "VERIFIED_BOTH"
    assert res.minimal_cover is not None
