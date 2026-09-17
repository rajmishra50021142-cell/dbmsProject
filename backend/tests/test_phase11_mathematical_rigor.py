"""
Phase 11: Deep Mathematical Rigor & Formal Normalization Engine Tests.

This test suite rigorously verifies:
1. The 5 Mandatory Syllabus Scenarios (Section 62 of Master Reference):
   - Case 1: Clean 4NF (Already Normalized).
   - Case 2: 1NF Violation (Non-atomic values / repeating groups).
   - Case 3: 2NF Violation (Composite candidate key with partial dependencies).
   - Case 4: 3NF Violation (Transitive dependency with non-superkey determinant & non-prime RHS).
   - Case 5: 4NF Violation (All-key schema with independent non-trivial MVDs).
2. Formal 3NF Prime Attribute Exception:
   - Determinant is not a superkey, but RHS is prime -> 3NF is SATISFIED.
3. Cyclic Dependency Networks:
   - Circular FDs creating multiple single-attribute candidate keys.
4. Formal 4NF & MVD Axioms:
   - Triviality rules (subset, complementation).
   - Multi-attribute determinants and dependents.
5. Tableau Chase Formalism:
   - Verifies formal matrix unification for lossless join vs lossy join failure.
6. Dependency Preservation Rigor:
   - Projection of dependencies and detection of unpreserved FDs (e.g., AB -> C, C -> B).
"""

import pytest
from app.schemas.domain_contracts import (
    CanonicalSchemaInput,
    FunctionalDependency,
    MultivaluedDependency,
    NFStatus,
    NormalForm,
    DecompositionProposal,
)
from app.normalization.normalization_engine import (
    analyze_1nf,
    analyze_2nf,
    analyze_3nf,
    analyze_4nf,
    analyze_full_normalization,
)
from app.normalization.candidate_key_engine import find_all_candidate_keys
from app.normalization.closure_engine import compute_attribute_closure
from app.decomposition.lossless_join import verify_lossless_join_chase
from app.decomposition.dependency_preservation import verify_dependency_preservation


# =====================================================================
# 1. THE 5 MANDATORY SYLLABUS SCENARIOS
# =====================================================================


def test_case1_clean_4nf_schema():
    """
    Case 1: Already normalized schema in 4NF.
    R(StudentID, Major)
    StudentID -> Major
    Candidate Key: (StudentID)
    Expected: 1NF SATISFIED, 2NF SATISFIED, 3NF SATISFIED, 4NF SATISFIED.
    Highest Confirmed NF: 4NF.
    """
    schema = CanonicalSchemaInput(
        name="STUDENT_MAJOR",
        attributes=["StudentID", "Major"],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID"], right=["Major"]),
        ],
        multivalued_dependencies=[
            MultivaluedDependency(left=["StudentID"], right=["Major"]),
        ],
        sample_data=[
            {"StudentID": "S101", "Major": "CS"},
            {"StudentID": "S102", "Major": "IT"},
        ],
    )

    result = analyze_full_normalization(schema)

    assert result.nf1.status == NFStatus.SATISFIED
    assert result.nf2.status == NFStatus.SATISFIED
    assert result.nf3.status == NFStatus.SATISFIED
    assert result.nf4.status == NFStatus.SATISFIED
    assert result.highest_confirmed_normal_form == NormalForm.FOUR_NF
    assert [["StudentID"]] in [sorted(k) for k in [result.candidate_keys]] or result.candidate_keys == [["StudentID"]]


def test_case2_1nf_violation_with_non_atomic_data():
    """
    Case 2: 1NF violation due to non-atomic domain values.
    R(StudentID, StudentName, PhoneNumber)
    Sample data contains comma-separated multi-valued phones: '9876543210, 9123456780'.
    Expected: 1NF VIOLATED; 2NF, 3NF, 4NF BLOCKED by prerequisite.
    """
    schema = CanonicalSchemaInput(
        name="STUDENT_CONTACT",
        attributes=["StudentID", "StudentName", "PhoneNumber"],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID"], right=["StudentName"]),
        ],
        multivalued_dependencies=[],
        sample_data=[
            {"StudentID": "S101", "StudentName": "Alice", "PhoneNumber": "9876543210, 9123456780"},
            {"StudentID": "S102", "StudentName": "Bob", "PhoneNumber": "9998887776"},
        ],
    )

    result = analyze_full_normalization(schema)

    assert result.nf1.status == NFStatus.VIOLATED
    assert result.nf1.is_satisfied is False
    assert "PhoneNumber" in result.nf1.attributes_involved
    # Hierarchy blocked
    assert result.nf2.status == NFStatus.BLOCKED_BY_PREREQUISITE
    assert result.nf3.status == NFStatus.BLOCKED_BY_PREREQUISITE
    assert result.nf4.status == NFStatus.BLOCKED_BY_PREREQUISITE
    assert result.highest_confirmed_normal_form == NormalForm.UNNORMALIZED


def test_case3_2nf_violation_composite_key_partial_dependency():
    """
    Case 3: 2NF violation with composite candidate key.
    ENROLLMENT(StudentID, CourseID, StudentName, CourseName, Grade)
    (StudentID, CourseID) -> Grade
    StudentID -> StudentName (Partial Dependency on proper subset of candidate key)
    CourseID -> CourseName (Partial Dependency on proper subset of candidate key)
    Expected: 1NF SATISFIED, 2NF VIOLATED, 3NF & 4NF BLOCKED.
    """
    schema = CanonicalSchemaInput(
        name="ENROLLMENT",
        attributes=["StudentID", "CourseID", "StudentName", "CourseName", "Grade"],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID", "CourseID"], right=["Grade"]),
            FunctionalDependency(left=["StudentID"], right=["StudentName"]),
            FunctionalDependency(left=["CourseID"], right=["CourseName"]),
        ],
        multivalued_dependencies=[],
        sample_data=[
            {"StudentID": "S1", "CourseID": "C1", "StudentName": "Alice", "CourseName": "DBMS", "Grade": "A"},
            {"StudentID": "S2", "CourseID": "C2", "StudentName": "Bob", "CourseName": "OS", "Grade": "B"},
        ],
    )

    result = analyze_full_normalization(schema)

    assert result.nf1.status == NFStatus.SATISFIED
    assert result.nf2.status == NFStatus.VIOLATED
    assert result.nf2.is_satisfied is False
    assert len(result.nf2.partial_dependencies) == 2

    # Check partial determinants
    partial_dets = [set(p.determinant) for p in result.nf2.partial_dependencies]
    assert {"StudentID"} in partial_dets
    assert {"CourseID"} in partial_dets

    # 3NF and 4NF must be blocked by 2NF prerequisite
    assert result.nf3.status == NFStatus.BLOCKED_BY_PREREQUISITE
    assert result.nf4.status == NFStatus.BLOCKED_BY_PREREQUISITE
    assert result.highest_confirmed_normal_form == NormalForm.ONE_NF


def test_case4_3nf_transitive_dependency_violation():
    """
    Case 4: 3NF violation via transitive dependency.
    EMPLOYEE(EmpID, EmpName, DeptID, DeptName)
    EmpID -> EmpName, DeptID
    DeptID -> DeptName
    Candidate Key: EmpID (Single attribute key -> 2NF is trivially satisfied!)
    DeptID -> DeptName: DeptID is NOT superkey, DeptName is NON-PRIME.
    Expected: 1NF SATISFIED, 2NF SATISFIED, 3NF VIOLATED, 4NF BLOCKED.
    """
    schema = CanonicalSchemaInput(
        name="EMPLOYEE",
        attributes=["EmpID", "EmpName", "DeptID", "DeptName"],
        functional_dependencies=[
            FunctionalDependency(left=["EmpID"], right=["EmpName", "DeptID"]),
            FunctionalDependency(left=["DeptID"], right=["DeptName"]),
        ],
        multivalued_dependencies=[],
        sample_data=[
            {"EmpID": "E1", "EmpName": "John", "DeptID": "D1", "DeptName": "Engineering"},
            {"EmpID": "E2", "EmpName": "Jane", "DeptID": "D2", "DeptName": "HR"},
        ],
    )

    result = analyze_full_normalization(schema)

    assert result.nf1.status == NFStatus.SATISFIED
    assert result.nf2.status == NFStatus.SATISFIED
    assert result.nf3.status == NFStatus.VIOLATED
    assert result.nf3.is_satisfied is False
    assert len(result.nf3.violations) >= 1

    viol = result.nf3.violations[0]
    assert set(viol.determinant) == {"DeptID"}
    assert "DeptName" in viol.dependent_attributes
    assert viol.determinant_is_superkey is False
    assert viol.dependent_attribute_prime_status.get("DeptName") is False

    # 4NF blocked by 3NF prerequisite
    assert result.nf4.status == NFStatus.BLOCKED_BY_PREREQUISITE
    assert result.highest_confirmed_normal_form == NormalForm.TWO_NF


def test_case5_4nf_independent_multivalued_dependencies():
    """
    Case 5: 4NF violation via independent multivalued dependencies in all-key relation.
    COURSE_OFFERING(Course, Teacher, TextBook)
    No FDs. Entire tuple (Course, Teacher, TextBook) is the candidate key.
    MVDs:
      Course ->> Teacher
      Course ->> TextBook
    Expected: 1NF SATISFIED, 2NF SATISFIED, 3NF SATISFIED, 4NF VIOLATED.
    Highest confirmed NF: 3NF.
    """
    schema = CanonicalSchemaInput(
        name="COURSE_OFFERING",
        attributes=["Course", "Teacher", "TextBook"],
        functional_dependencies=[],
        multivalued_dependencies=[
            MultivaluedDependency(left=["Course"], right=["Teacher"]),
            MultivaluedDependency(left=["Course"], right=["TextBook"]),
        ],
        sample_data=[
            {"Course": "CS101", "Teacher": "Smith", "TextBook": "Intro to CS"},
            {"Course": "CS101", "Teacher": "Jones", "TextBook": "CS Basics"},
        ],
    )

    result = analyze_full_normalization(schema)

    assert result.nf1.status == NFStatus.SATISFIED
    assert result.nf2.status == NFStatus.SATISFIED
    assert result.nf3.status == NFStatus.SATISFIED
    assert result.nf4.status == NFStatus.VIOLATED
    assert result.nf4.is_satisfied is False
    assert len(result.nf4.violations) == 2
    assert result.highest_confirmed_normal_form == NormalForm.THREE_NF


# =====================================================================
# 2. 3NF PRIME ATTRIBUTE EXCEPTION & ADVANCED KEY TOPOLOGY
# =====================================================================

def test_3nf_prime_attribute_exception_satisfied():
    """
    Formal 3NF Rule Test:
    A relation R is in 3NF if for every non-trivial FD X -> A:
      1) X is a superkey, OR
      2) A is a prime attribute (belongs to ANY candidate key).
    
    Relation: R(A, B, C)
    Candidate Keys: (A, B) and (B, C)
    Prime attributes: {A, B, C} (every attribute belongs to at least one key!)
    FD: C -> A
    Here: C is NOT a superkey (C+ = {C, A} != {A, B, C}),
    BUT A is prime because A belongs to candidate key (A, B)!
    Therefore, R satisfies 3NF!
    """
    schema = CanonicalSchemaInput(
        name="PRIME_EXCEPTION_RELATION",
        attributes=["A", "B", "C"],
        functional_dependencies=[
            FunctionalDependency(left=["A", "B"], right=["C"]),
            FunctionalDependency(left=["B", "C"], right=["A"]),
            FunctionalDependency(left=["C"], right=["A"]),
        ],
        multivalued_dependencies=[],
    )

    result = analyze_full_normalization(schema)

    # Both (A, B) and (B, C) must be recognized as candidate keys
    keys = [set(k) for k in result.candidate_keys]
    assert {"A", "B"} in keys
    assert {"B", "C"} in keys
    assert set(result.prime_attributes) == {"A", "B", "C"}
    assert set(result.non_prime_attributes) == set()

    # 3NF must be satisfied because RHS attribute 'A' is prime!
    assert result.nf3.status == NFStatus.SATISFIED
    assert result.nf3.is_satisfied is True
    assert len(result.nf3.violations) == 0


def test_3nf_cyclic_dependency_network():
    """
    Cyclic dependencies creating 4 single-attribute candidate keys.
    R(A, B, C, D)
    A -> B, B -> C, C -> D, D -> A
    Each attribute determines all other attributes via cycle:
    A+ = {A,B,C,D}, B+ = {A,B,C,D}, C+ = {A,B,C,D}, D+ = {A,B,C,D}.
    Candidate keys: {A}, {B}, {C}, {D}.
    Every single attribute is prime.
    Expected: 1NF SATISFIED, 2NF SATISFIED, 3NF SATISFIED.
    """
    schema = CanonicalSchemaInput(
        name="CYCLIC_RELATION",
        attributes=["A", "B", "C", "D"],
        functional_dependencies=[
            FunctionalDependency(left=["A"], right=["B"]),
            FunctionalDependency(left=["B"], right=["C"]),
            FunctionalDependency(left=["C"], right=["D"]),
            FunctionalDependency(left=["D"], right=["A"]),
        ],
        multivalued_dependencies=[],
    )

    result = analyze_full_normalization(schema)

    keys = [sorted(k) for k in result.candidate_keys]
    assert [["A"], ["B"], ["C"], ["D"]] == sorted(keys)
    assert set(result.prime_attributes) == {"A", "B", "C", "D"}
    assert set(result.non_prime_attributes) == set()
    assert result.nf2.status == NFStatus.SATISFIED
    assert result.nf3.status == NFStatus.SATISFIED


def test_multiple_overlapping_candidate_keys():
    """
    Overlapping composite candidate keys:
    R(A, B, C, D, E)
    AB -> CDE
    AC -> BDE
    BC -> ADE
    Candidate keys: (A, B), (A, C), (B, C).
    Prime attributes: {A, B, C}.
    Non-prime attributes: {D, E}.
    
    Add FD: D -> E (D is non-superkey, E is non-prime -> VIOLATES 3NF).
    """
    schema = CanonicalSchemaInput(
        name="OVERLAPPING_KEYS",
        attributes=["A", "B", "C", "D", "E"],
        functional_dependencies=[
            FunctionalDependency(left=["A", "B"], right=["C", "D", "E"]),
            FunctionalDependency(left=["A", "C"], right=["B", "D", "E"]),
            FunctionalDependency(left=["B", "C"], right=["A", "D", "E"]),
            FunctionalDependency(left=["D"], right=["E"]),  # 3NF violation (E is non-prime)
        ],
        multivalued_dependencies=[],
    )

    result = analyze_full_normalization(schema)

    assert set(result.prime_attributes) == {"A", "B", "C"}
    assert set(result.non_prime_attributes) == {"D", "E"}
    assert result.nf3.status == NFStatus.VIOLATED

    viol_dets = [set(v.determinant) for v in result.nf3.violations]
    assert {"D"} in viol_dets


# =====================================================================
# 3. 4NF MVD FORMAL AXIOMS & COMPLEMENTATION
# =====================================================================

def test_4nf_trivial_mvd_rules():
    """
    MVD Triviality Rules:
    An MVD X ->> Y is trivial in R if:
      1) Y ⊆ X (subset rule), OR
      2) X ∪ Y = R (complementation / entire relation rule).
    Trivial MVDs cannot cause 4NF violations!
    """
    schema = CanonicalSchemaInput(
        name="TRIVIAL_MVDS",
        attributes=["Course", "Teacher", "Semester"],
        functional_dependencies=[
            FunctionalDependency(left=["Course", "Semester"], right=["Teacher"]),
        ],
        multivalued_dependencies=[
            # Trivial by subset: {Course} ->> {Course}
            MultivaluedDependency(left=["Course"], right=["Course"]),
            # Trivial by complement: {Course, Semester} ->> {Teacher}
            MultivaluedDependency(left=["Course", "Semester"], right=["Teacher"]),
        ],
    )

    result = analyze_full_normalization(schema)

    assert result.nf4.status == NFStatus.SATISFIED
    assert result.nf4.is_satisfied is True
    assert len(result.nf4.violations) == 0
    assert len(result.nf4.trivial_mvds) >= 2


def test_4nf_mvd_complementation_rule():
    """
    MVD Complementation Axiom:
    In relation R, if X ->> Y holds, then X ->> (R - X - Y) also holds.
    Relation: R(A, B, C) with no FDs.
    MVD: A ->> B.
    Complemented MVD: A ->> C.
    Both should be recognized as non-trivial violations of 4NF when A is not a superkey.
    """
    schema = CanonicalSchemaInput(
        name="COMPLEMENTATION_RELATION",
        attributes=["A", "B", "C"],
        functional_dependencies=[],
        multivalued_dependencies=[
            MultivaluedDependency(left=["A"], right=["B"]),
        ],
    )

    result = analyze_full_normalization(schema)

    assert result.nf4.status == NFStatus.VIOLATED
    assert len(result.nf4.violations) >= 1
    assert any(set(v.determinant) == {"A"} for v in result.nf4.violations)


# =====================================================================
# 4. TABLEAU CHASE FORMAL LOSSLESS JOIN TESTS
# =====================================================================

def test_tableau_chase_lossless_join_positive():
    """
    Tableau Chase formal verification on a lossless decomposition.
    Relation: R(A, B, C)
    FD: A -> B
    Decomposed into: R1(A, B) and R2(A, C)
    Common attribute: A
    Since A -> B, row 2 can equate its B symbol to row 1.
    Row 2 achieves full distinguished symbol unification (a_1, a_2, a_3).
    Expected: Lossless join confirmed with step-by-step matrix evidence!
    """
    attributes = ["A", "B", "C"]
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
    ]
    decomposed = [
        ["A", "B"],
        ["A", "C"],
    ]

    res = verify_lossless_join_chase(attributes, fds, decomposed)

    assert res.is_lossless is True
    assert res.method == "TABLEAU_CHASE"
    assert len(res.chase_steps) >= 1
    assert res.distinguished_row_index is not None
    assert 0 <= res.distinguished_row_index < len(decomposed)


def test_tableau_chase_lossy_join_negative():
    """
    Tableau Chase formal verification on a LOSSY decomposition.
    Relation: R(A, B, C)
    FD: B -> C (Common attribute between R1 and R2 is A, but A does NOT determine B or C!)
    Decomposed into: R1(A, B) and R2(A, C)
    Tableau Chase cannot propagate symbols to complete any single row.
    Expected: Lossless verification FAILS (is_lossless == False)!
    """
    attributes = ["A", "B", "C"]
    fds = [
        FunctionalDependency(left=["B"], right=["C"]),
    ]
    decomposed = [
        ["A", "B"],
        ["A", "C"],
    ]

    res = verify_lossless_join_chase(attributes, fds, decomposed)

    assert res.is_lossless is False
    assert res.distinguished_row_index is None
    assert res.reasoning is not None


# =====================================================================
# 5. DEPENDENCY PRESERVATION RIGOR
# =====================================================================

def test_dependency_preservation_positive():
    """
    Dependency Preservation positive case:
    R(A, B, C)
    FDs: A -> B, B -> C
    Decomposition: R1(A, B), R2(B, C)
    R1 preserves A -> B directly.
    R2 preserves B -> C directly.
    All FDs are preserved!
    """
    attributes = ["A", "B", "C"]
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
        FunctionalDependency(left=["B"], right=["C"]),
    ]
    decomposed = [
        ["A", "B"],
        ["B", "C"],
    ]

    res = verify_dependency_preservation(attributes, fds, decomposed)

    assert res.is_preserved is True
    assert len(res.non_preserved_dependencies) == 0
    assert len(res.preserved_dependencies) == 2


def test_dependency_preservation_negative_classic_3nf_bcnf_tradeoff():
    """
    Classic Dependency Preservation Negative Case:
    R(A, B, C)
    FDs:
      (A, B) -> C
      C -> B
    Candidate Keys: (A, B) and (A, C)
    Decomposition into BCNF:
      R1(C, B) with C -> B
      R2(A, C) with (A, C) as key
    Notice: The original dependency (A, B) -> C cannot be derived from {C -> B}
    projected onto R1 and R2 without performing an inter-relational join!
    Expected: is_preserved == False, and (A, B) -> C is identified as non-preserved.
    """
    attributes = ["A", "B", "C"]
    fds = [
        FunctionalDependency(left=["A", "B"], right=["C"]),
        FunctionalDependency(left=["C"], right=["B"]),
    ]
    decomposed = [
        ["C", "B"],
        ["A", "C"],
    ]

    res = verify_dependency_preservation(attributes, fds, decomposed)

    assert res.is_preserved is False
    assert len(res.non_preserved_dependencies) >= 1
    lost_dets = [set(d.left) for d in res.non_preserved_dependencies]
    assert {"A", "B"} in lost_dets
