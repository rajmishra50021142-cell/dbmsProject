"""
Unit tests for 3NF & 4NF Normalization Engine (Phase 6).

Covers:
- 3NF:
    * Classic 3NF violation (EmpID -> DeptID, DeptID -> DeptName).
    * Superkey determinant condition.
    * Prime attribute exception (non-superkey determinant with prime RHS).
    * Trivial functional dependencies (Armstrong reflexivity).
    * Multi-attribute determinants and multi-attribute RHS.
    * Multiple candidate keys.
    * Transitive pattern synthesis and decomposition proposals.
- 4NF:
    * Non-trivial MVD violation (Student ->> Hobby).
    * Trivial MVD via subset (Y ⊆ X).
    * Trivial MVD via relation complement (X ∪ Y = R).
    * Non-trivial MVD with superkey determinant.
    * Multiple MVDs.
    * Empty MVD set (INSUFFICIENT_DATA).
    * 4NF decomposition proposals.
- Normal Form Hierarchy & Orchestration:
    * 1NF violation blocks 2NF, 3NF, 4NF.
    * 2NF violation blocks 3NF, 4NF.
    * 3NF violation blocks 4NF.
    * highest_confirmed_normal_form calculation.
"""

import pytest
from app.schemas.domain_contracts import (
    CanonicalSchemaInput,
    FunctionalDependency,
    MultivaluedDependency,
    NFStatus,
    NormalForm,
)
from app.normalization.normalization_engine import (
    analyze_3nf,
    analyze_4nf,
    analyze_full_normalization,
    NormalizationEngineError,
)


# =====================================================================
# 3NF Engine Tests
# =====================================================================

def test_3nf_classic_transitive_violation():
    """
    R(EmpID, EmpName, DeptID, DeptName)
    EmpID -> EmpName, DeptID
    DeptID -> DeptName
    Candidate Key: EmpID
    DeptID -> DeptName violates 3NF: DeptID is not superkey and DeptName is non-prime.
    """
    schema = CanonicalSchemaInput(
        name="EMPLOYEE",
        attributes=["EmpID", "EmpName", "DeptID", "DeptName"],
        functional_dependencies=[
            FunctionalDependency(left=["EmpID"], right=["EmpName", "DeptID"]),
            FunctionalDependency(left=["DeptID"], right=["DeptName"]),
        ],
    )

    res = analyze_3nf(schema)
    assert res.status == NFStatus.VIOLATED
    assert res.is_satisfied is False
    assert res.reason_code == "TRANSITIVE_DEPENDENCIES_DETECTED"
    assert len(res.violations) == 1

    v = res.violations[0]
    assert v.determinant == ["DeptID"]
    assert v.dependent_attributes == ["DeptName"]
    assert v.determinant_is_superkey is False
    assert v.dependent_attribute_prime_status["DeptName"] is False
    assert v.transitive_chain is not None
    assert "EmpID" in v.transitive_chain[0]
    assert "DeptID" in v.transitive_chain[1]
    assert "DeptName" in v.transitive_chain[2]

    # Decomposition proposal check
    assert res.decomposition_proposal is not None
    assert res.decomposition_proposal.verification_status == "NOT_YET_VERIFIED"
    sub_names = [p.name for p in res.decomposition_proposal.proposed_relations]
    assert any("DeptID" in name for name in sub_names)
    assert any("REMAINDER" in name or "CORE" in name for name in sub_names)


def test_3nf_superkey_determinant_satisfied():
    """
    R(StudentID, CourseID, Grade)
    StudentID, CourseID -> Grade
    Candidate Key: (StudentID, CourseID)
    Determinant is a superkey => 3NF satisfied.
    """
    schema = CanonicalSchemaInput(
        name="ENROLLMENT",
        attributes=["StudentID", "CourseID", "Grade"],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID", "CourseID"], right=["Grade"]),
        ],
    )

    res = analyze_3nf(schema)
    assert res.status == NFStatus.SATISFIED
    assert res.is_satisfied is True
    assert res.reason_code == "ALL_FDS_SATISFY_3NF"
    assert len(res.violations) == 0
    assert len(res.satisfied_dependencies) == 1
    assert res.dependencies_analyzed[0].determinant_is_superkey is True


def test_3nf_prime_attribute_exception():
    """
    Classic textbook prime-attribute exception:
    R(City, Street, ZipCode)
    FDs:
      City, Street -> ZipCode
      ZipCode -> City
    Candidate Keys:
      CK1: (Street, ZipCode)
      CK2: (City, Street)
    Prime attributes: {City, Street, ZipCode} (all prime!)
    For ZipCode -> City:
      ZipCode is not a superkey (ZipCode+ = {ZipCode, City} != R)
      BUT City is prime (belongs to CK2)!
    Therefore 3NF is SATISFIED via prime-attribute exception.
    """
    schema = CanonicalSchemaInput(
        name="ADDRESS",
        attributes=["City", "Street", "ZipCode"],
        functional_dependencies=[
            FunctionalDependency(left=["City", "Street"], right=["ZipCode"]),
            FunctionalDependency(left=["ZipCode"], right=["City"]),
        ],
    )

    res = analyze_3nf(schema)
    assert res.status == NFStatus.SATISFIED
    assert res.is_satisfied is True
    assert len(res.violations) == 0

    # Locate ZipCode -> City in analyzed dependencies
    zip_analysis = next(
        a for a in res.dependencies_analyzed
        if a.functional_dependency.left == ["ZipCode"]
    )
    assert zip_analysis.determinant_is_superkey is False
    assert zip_analysis.satisfies_3nf is True
    assert zip_analysis.reason_code == "PRIME_DEPENDENT_ATTRIBUTE"


def test_3nf_trivial_fd():
    """
    Trivial FDs (Y ⊆ X) satisfy 3NF vacuously.
    """
    schema = CanonicalSchemaInput(
        name="ITEMS",
        attributes=["A", "B", "C"],
        functional_dependencies=[
            FunctionalDependency(left=["A", "B"], right=["C"]),
            FunctionalDependency(left=["A", "B"], right=["A"]),  # Trivial!
        ],
    )

    res = analyze_3nf(schema)
    assert res.status == NFStatus.SATISFIED
    assert len(res.trivial_dependencies) == 1
    trivial_analysis = next(
        a for a in res.dependencies_analyzed
        if a.functional_dependency.right == ["A"]
    )
    assert trivial_analysis.is_trivial is True
    assert trivial_analysis.satisfies_3nf is True
    assert trivial_analysis.reason_code == "TRIVIAL_FD"


def test_3nf_multi_attribute_rhs_mixed_prime():
    """
    Multi-attribute RHS where one attribute is prime and one is non-prime:
    R(A, B, C, D)
    Keys: (A, B) and (B, C) => Prime = {A, B, C}, Non-prime = {D}
    FD: C -> A, D
    Determinant C is not a superkey.
    RHS has A (prime) and D (non-prime).
    Should isolate D as violating and recognize A as prime.
    """
    from app.schemas.domain_contracts import NF2Result

    schema = CanonicalSchemaInput(
        name="MIXED_RHS",
        attributes=["A", "B", "C", "D"],
        functional_dependencies=[
            FunctionalDependency(left=["A", "B"], right=["C", "D"]),
            FunctionalDependency(left=["B", "C"], right=["A"]),
            FunctionalDependency(left=["C"], right=["A", "D"]),
        ],
    )

    mock_2nf = NF2Result(
        status=NFStatus.SATISFIED,
        is_satisfied=True,
        reason_code="NO_PARTIAL_DEPENDENCIES",
        message="2NF satisfied",
        prerequisite_1nf_status=NFStatus.SATISFIED,
        candidate_keys=[["A", "B"], ["B", "C"]],
        composite_keys=[["A", "B"], ["B", "C"]],
        prime_attributes=["A", "B", "C"],
        non_prime_attributes=["D"],
        partial_dependencies=[],
    )

    res = analyze_3nf(schema, nf2_result=mock_2nf)
    assert res.status == NFStatus.VIOLATED
    # Find violation for C -> A, D
    c_violation = next(v for v in res.violations if v.determinant == ["C"])
    assert "D" in c_violation.dependent_attributes
    assert "A" not in c_violation.dependent_attributes
    assert c_violation.dependent_attribute_prime_status["A"] is True
    assert c_violation.dependent_attribute_prime_status["D"] is False


def test_3nf_blocked_by_2nf_prerequisite():
    """
    Relation with partial dependency (violating 2NF) should have 3NF status BLOCKED_BY_PREREQUISITE.
    """
    schema = CanonicalSchemaInput(
        name="ENROLLMENT_PARTIAL",
        attributes=["StudentID", "CourseID", "StudentName", "Grade"],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID", "CourseID"], right=["Grade"]),
            FunctionalDependency(left=["StudentID"], right=["StudentName"]),  # 2NF partial dependency!
        ],
    )

    res = analyze_3nf(schema)
    assert res.status == NFStatus.BLOCKED_BY_PREREQUISITE
    assert res.is_satisfied is False
    assert res.prerequisite_2nf_status == NFStatus.VIOLATED


# =====================================================================
# 4NF Engine Tests
# =====================================================================

def test_4nf_classic_mvd_violation():
    """
    R(Student, Hobby, Language)
    Student ->> Hobby
    Student ->> Language
    Key: (Student, Hobby, Language)
    Student is NOT a superkey.
    Non-trivial MVDs with non-superkey determinant => 4NF violated!
    """
    schema = CanonicalSchemaInput(
        name="STUDENT",
        attributes=["Student", "Hobby", "Language"],
        multivalued_dependencies=[
            MultivaluedDependency(left=["Student"], right=["Hobby"]),
            MultivaluedDependency(left=["Student"], right=["Language"]),
        ],
    )

    res = analyze_4nf(schema)
    assert res.status == NFStatus.VIOLATED
    assert res.is_satisfied is False
    assert res.reason_code == "MULTIVALUED_DEPENDENCIES_DETECTED"
    assert len(res.violations) == 2
    assert res.decomposition_proposal is not None
    assert res.decomposition_proposal.verification_status == "NOT_YET_VERIFIED"
    assert len(res.decomposition_proposal.proposed_relations) >= 2


def test_4nf_trivial_mvd_subset():
    """
    MVD where RHS ⊆ LHS:
    A, B ->> A is trivial.
    """
    schema = CanonicalSchemaInput(
        name="MVD_TRIVIAL_SUBSET",
        attributes=["A", "B", "C"],
        multivalued_dependencies=[
            MultivaluedDependency(left=["A", "B"], right=["A"]),
        ],
    )

    res = analyze_4nf(schema)
    assert res.status == NFStatus.SATISFIED
    assert res.is_satisfied is True
    assert len(res.trivial_mvds) == 1
    assert res.mvds_analyzed[0].is_trivial is True
    assert res.mvds_analyzed[0].triviality_reason == "RHS_SUBSET_OF_LHS"


def test_4nf_trivial_mvd_complement_equals_relation():
    """
    MVD where X ∪ Y = R:
    R(A, B, C)
    A, B ->> C
    {A, B} ∪ {C} = {A, B, C} = R => Trivial!
    """
    schema = CanonicalSchemaInput(
        name="MVD_TRIVIAL_COMPLEMENT",
        attributes=["A", "B", "C"],
        multivalued_dependencies=[
            MultivaluedDependency(left=["A", "B"], right=["C"]),
        ],
    )

    res = analyze_4nf(schema)
    assert res.status == NFStatus.SATISFIED
    assert res.is_satisfied is True
    assert len(res.trivial_mvds) == 1
    assert res.mvds_analyzed[0].is_trivial is True
    assert res.mvds_analyzed[0].triviality_reason == "UNION_EQUALS_RELATION"


def test_4nf_superkey_determinant_satisfied():
    """
    Non-trivial MVD whose determinant is a superkey:
    R(EmpID, ProjectID, Skill)
    EmpID -> ProjectID, Skill (via FD) => EmpID is superkey!
    MVD: EmpID ->> Skill (non-trivial, EmpID is superkey) => 4NF satisfied!
    """
    schema = CanonicalSchemaInput(
        name="EMP_SUPERKEY",
        attributes=["EmpID", "ProjectID", "Skill"],
        functional_dependencies=[
            FunctionalDependency(left=["EmpID"], right=["ProjectID", "Skill"]),
        ],
        multivalued_dependencies=[
            MultivaluedDependency(left=["EmpID"], right=["Skill"]),
        ],
    )

    res = analyze_4nf(schema)
    assert res.status == NFStatus.SATISFIED
    assert res.is_satisfied is True
    assert len(res.violations) == 0
    assert len(res.non_trivial_mvds) == 1
    assert res.mvds_analyzed[0].determinant_is_superkey is True


def test_4nf_no_mvds_insufficient_data():
    """
    If no MVDs are provided in schema, 4NF engine returns INSUFFICIENT_DATA.
    """
    schema = CanonicalSchemaInput(
        name="NO_MVD",
        attributes=["A", "B", "C"],
        functional_dependencies=[
            FunctionalDependency(left=["A"], right=["B", "C"]),
        ],
        multivalued_dependencies=[],
    )

    res = analyze_4nf(schema)
    assert res.status == NFStatus.INSUFFICIENT_DATA
    assert res.is_satisfied is False
    assert res.reason_code == "NO_MVDS_PROVIDED"
    assert len(res.limitations) > 0


# =====================================================================
# Normal Form Hierarchy & Full Analysis Tests
# =====================================================================

def test_full_normalization_hierarchy_2nf_violation():
    """
    When 2NF is violated, highest confirmed normal form is 1NF,
    and 3NF & 4NF are blocked by prerequisite.
    """
    schema = CanonicalSchemaInput(
        name="ENROLLMENT",
        attributes=["StudentID", "CourseID", "StudentName", "Grade"],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID", "CourseID"], right=["Grade"]),
            FunctionalDependency(left=["StudentID"], right=["StudentName"]),
        ],
        sample_data=[
            {"StudentID": "1", "CourseID": "C1", "StudentName": "Raj", "Grade": "A"},
        ],
    )

    res = analyze_full_normalization(schema)
    assert res.nf1.status == NFStatus.SATISFIED
    assert res.nf2.status == NFStatus.VIOLATED
    assert res.nf3.status == NFStatus.BLOCKED_BY_PREREQUISITE
    assert res.nf4.status == NFStatus.BLOCKED_BY_PREREQUISITE
    assert res.highest_confirmed_normal_form == NormalForm.ONE_NF


def test_full_normalization_hierarchy_3nf_violation():
    """
    When 3NF is violated, highest confirmed normal form is 2NF,
    and 4NF is blocked by prerequisite.
    """
    schema = CanonicalSchemaInput(
        name="EMPLOYEE",
        attributes=["EmpID", "EmpName", "DeptID", "DeptName"],
        functional_dependencies=[
            FunctionalDependency(left=["EmpID"], right=["EmpName", "DeptID"]),
            FunctionalDependency(left=["DeptID"], right=["DeptName"]),
        ],
        sample_data=[
            {"EmpID": "E1", "EmpName": "Alice", "DeptID": "D1", "DeptName": "Engineering"},
        ],
    )

    res = analyze_full_normalization(schema)
    assert res.nf1.status == NFStatus.SATISFIED
    assert res.nf2.status == NFStatus.SATISFIED
    assert res.nf3.status == NFStatus.VIOLATED
    assert res.nf4.status == NFStatus.BLOCKED_BY_PREREQUISITE
    assert res.highest_confirmed_normal_form == NormalForm.TWO_NF


def test_full_normalization_hierarchy_4nf_satisfied():
    """
    When all stages satisfy requirements through 4NF, highest confirmed normal form is 4NF.
    """
    schema = CanonicalSchemaInput(
        name="CLEAN_RELATION",
        attributes=["EmpID", "Email", "Phone"],
        functional_dependencies=[
            FunctionalDependency(left=["EmpID"], right=["Email", "Phone"]),
        ],
        multivalued_dependencies=[
            MultivaluedDependency(left=["EmpID"], right=["Email"]),
        ],
        sample_data=[
            {"EmpID": "E1", "Email": "e1@test.com", "Phone": "555-0100"},
        ],
    )

    res = analyze_full_normalization(schema)
    assert res.nf1.status == NFStatus.SATISFIED
    assert res.nf2.status == NFStatus.SATISFIED
    assert res.nf3.status == NFStatus.SATISFIED
    assert res.nf4.status == NFStatus.SATISFIED
    assert res.highest_confirmed_normal_form == NormalForm.FOUR_NF
