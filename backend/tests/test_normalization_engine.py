"""
Unit tests for 1NF & 2NF Normalization Engine (Phase 5).
"""

import pytest
from app.schemas.domain_contracts import (
    CanonicalSchemaInput,
    FunctionalDependency,
    SampleTuple,
    NFStatus,
)
from app.normalization.normalization_engine import (
    analyze_1nf,
    analyze_2nf,
    analyze_basic_normalization,
    compute_input_fingerprint,
    detect_repeating_groups,
    split_cell_value,
    NormalizationEngineError,
)


def test_detect_repeating_groups():
    # Attributes with numbered patterns
    attrs = ["StudentID", "Phone1", "Phone2", "Phone3", "Email"]
    groups = detect_repeating_groups(attrs)
    assert "phone" in groups
    assert groups["phone"] == ["Phone1", "Phone2", "Phone3"]

    # Single numbered attribute is not a group
    attrs_single = ["StudentID", "Course1", "Grade"]
    assert detect_repeating_groups(attrs_single) == {}


def test_split_cell_value():
    assert split_cell_value("DBMS, OS, CN") == ["DBMS", "OS", "CN"]
    assert split_cell_value("Cricket | Music") == ["Cricket", "Music"]
    assert split_cell_value("SingleValue") == ["SingleValue"]
    assert split_cell_value(["A", "B"]) == ["A", "B"]
    assert split_cell_value(None) == []


def test_1nf_atomic_sample_data():
    schema = CanonicalSchemaInput(
        name="STUDENT",
        attributes=["StudentID", "Name", "Major"],
        sample_data=[
            {"StudentID": "101", "Name": "Alice", "Major": "CS"},
            {"StudentID": "102", "Name": "Bob", "Major": "EE"},
        ],
    )
    result = analyze_1nf(schema)
    assert result.status == NFStatus.SATISFIED
    assert result.is_satisfied is True
    assert result.reason_code == "ATOMIC_CELLS_VERIFIED"
    assert len(result.violations) == 0
    assert result.transformation is None


def test_1nf_multi_valued_cells_violation():
    schema = CanonicalSchemaInput(
        name="ENROLLMENT",
        attributes=["StudentID", "Name", "Courses"],
        sample_data=[
            {"StudentID": "101", "Name": "Raj", "Courses": "DBMS, OS, CN"},
            {"StudentID": "102", "Name": "Sam", "Courses": "AI"},
        ],
    )
    result = analyze_1nf(schema)
    assert result.status == NFStatus.VIOLATED
    assert result.is_satisfied is False
    assert result.reason_code == "NON_ATOMIC_VALUES_DETECTED"
    assert len(result.violations) == 1
    assert result.violations[0].attribute == "Courses"
    assert result.violations[0].row_index == 0

    # Verify conceptual unnesting transformation
    assert result.transformation is not None
    assert len(result.transformation.original_tuples) == 2
    # Row 1 expands to 3 rows, row 2 stays 1 row => 4 rows total
    assert len(result.transformation.transformed_tuples) == 4
    courses = [t["Courses"] for t in result.transformation.transformed_tuples if t["StudentID"] == "101"]
    assert set(courses) == {"DBMS", "OS", "CN"}


def test_1nf_repeating_groups_in_schema():
    schema = CanonicalSchemaInput(
        name="STUDENT_CONTACT",
        attributes=["StudentID", "Name", "Phone1", "Phone2"],
        sample_data=[
            {"StudentID": "1", "Name": "Alex", "Phone1": "111", "Phone2": "222"}
        ],
    )
    result = analyze_1nf(schema)
    assert result.status == NFStatus.VIOLATED
    assert result.is_satisfied is False
    assert "Phone1, Phone2" in result.violations[0].attribute
    assert result.violations[0].reason_code == "REPEATING_GROUP_ATTRIBUTES"


def test_1nf_no_sample_data_insufficient():
    schema = CanonicalSchemaInput(
        name="STUDENT",
        attributes=["StudentID", "Name", "Major"],
        sample_data=[],
    )
    result = analyze_1nf(schema)
    assert result.status == NFStatus.INSUFFICIENT_DATA
    assert result.is_satisfied is False
    assert result.reason_code == "NO_SAMPLE_DATA_PROVIDED"
    assert "No sample tuples were supplied" in result.message
    assert len(result.limitations) > 0


def test_2nf_classic_partial_dependency():
    # R(StudentID, CourseID, StudentName, CourseName, Grade)
    # Candidate Key = (StudentID, CourseID)
    # StudentID -> StudentName (partial)
    # CourseID -> CourseName (partial)
    # StudentID, CourseID -> Grade (full)
    schema = CanonicalSchemaInput(
        name="ENROLLMENT",
        attributes=["StudentID", "CourseID", "StudentName", "CourseName", "Grade"],
        candidate_keys=[["StudentID", "CourseID"]],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID"], right=["StudentName"]),
            FunctionalDependency(left=["CourseID"], right=["CourseName"]),
            FunctionalDependency(left=["StudentID", "CourseID"], right=["Grade"]),
        ],
    )
    result = analyze_2nf(schema)
    assert result.status == NFStatus.VIOLATED
    assert result.is_satisfied is False
    assert result.reason_code == "PARTIAL_DEPENDENCIES_DETECTED"
    assert len(result.partial_dependencies) == 2

    dets = [sorted(pd.determinant) for pd in result.partial_dependencies]
    assert ["StudentID"] in dets
    assert ["CourseID"] in dets

    # Decomposition proposal must be generated
    assert result.decomposition_proposal is not None
    assert result.decomposition_proposal.verification_status == "NOT_YET_VERIFIED"
    assert len(result.decomposition_proposal.proposed_relations) == 3


def test_2nf_single_attribute_key():
    # R(StudentID, Name, Major)
    # Key = StudentID
    # No proper subset can exist!
    schema = CanonicalSchemaInput(
        name="STUDENT",
        attributes=["StudentID", "Name", "Major"],
        candidate_keys=[["StudentID"]],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID"], right=["Name", "Major"]),
        ],
    )
    result = analyze_2nf(schema)
    assert result.status == NFStatus.SATISFIED
    assert result.is_satisfied is True
    assert result.reason_code == "SINGLE_ATTRIBUTE_KEYS_NO_PARTIAL_DEPENDENCY"
    assert len(result.partial_dependencies) == 0


def test_2nf_all_prime_attributes():
    # R(A, B, C) with cyclic dependencies: A -> B, B -> C, C -> A
    # Discovered keys: {A}, {B}, {C} -> all prime!
    schema = CanonicalSchemaInput(
        name="CYCLIC",
        attributes=["A", "B", "C"],
        functional_dependencies=[
            FunctionalDependency(left=["A"], right=["B"]),
            FunctionalDependency(left=["B"], right=["C"]),
            FunctionalDependency(left=["C"], right=["A"]),
        ],
    )
    result = analyze_2nf(schema)
    assert result.status == NFStatus.SATISFIED
    assert result.is_satisfied is True
    assert len(result.partial_dependencies) == 0


def test_2nf_implied_partial_dependency():
    # R(A, B, C, D)
    # Key = (A, D)
    # FDs: A -> B, B -> C
    # Then A -> C is implied!
    # B and C are non-prime.
    # Proper subset {A} determines non-prime {B, C}.
    schema = CanonicalSchemaInput(
        name="IMPLIED",
        attributes=["A", "B", "C", "D"],
        candidate_keys=[["A", "D"]],
        functional_dependencies=[
            FunctionalDependency(left=["A"], right=["B"]),
            FunctionalDependency(left=["B"], right=["C"]),
            FunctionalDependency(left=["A", "D"], right=["B", "C"]),
        ],
    )
    result = analyze_2nf(schema)
    assert result.status == NFStatus.VIOLATED
    assert result.is_satisfied is False
    assert any(pd.determinant == ["A"] and "C" in pd.dependent_attributes for pd in result.partial_dependencies)


def test_2nf_multiple_candidate_keys():
    # R(A, B, C, D)
    # K1 = (A, B), K2 = (B, C)
    # FD: A -> D (D is non-prime)
    # Partial dependency against K1!
    schema = CanonicalSchemaInput(
        name="MULTI_KEY",
        attributes=["A", "B", "C", "D"],
        candidate_keys=[["A", "B"], ["B", "C"]],
        functional_dependencies=[
            FunctionalDependency(left=["A", "B"], right=["C", "D"]),
            FunctionalDependency(left=["B", "C"], right=["A", "D"]),
            FunctionalDependency(left=["A"], right=["D"]),
        ],
    )
    result = analyze_2nf(schema)
    assert result.status == NFStatus.VIOLATED
    assert any(pd.determinant == ["A"] and pd.dependent_attributes == ["D"] for pd in result.partial_dependencies)


def test_2nf_blocked_by_1nf_prerequisite():
    schema = CanonicalSchemaInput(
        name="ENROLLMENT",
        attributes=["StudentID", "CourseID", "Grade"],
        candidate_keys=[["StudentID", "CourseID"]],
        sample_data=[
            {"StudentID": "101", "CourseID": "CS101, CS102", "Grade": "A"}
        ],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID", "CourseID"], right=["Grade"]),
        ],
    )
    # Run full normalization
    res = analyze_basic_normalization(schema)
    assert res.nf1.status == NFStatus.VIOLATED
    assert res.nf2.status == NFStatus.BLOCKED_BY_PREREQUISITE
    assert res.nf2.is_satisfied is False


def test_basic_normalization_fingerprinting():
    schema1 = CanonicalSchemaInput(
        name="R",
        attributes=["A", "B", "C"],
        functional_dependencies=[FunctionalDependency(left=["A"], right=["B"])],
    )
    fp1 = compute_input_fingerprint(schema1)

    schema2 = CanonicalSchemaInput(
        name="R",
        attributes=["A", "B", "C"],
        functional_dependencies=[FunctionalDependency(left=["A"], right=["C"])],
    )
    fp2 = compute_input_fingerprint(schema2)

    # Different FDs should produce different fingerprints
    assert fp1 != fp2
