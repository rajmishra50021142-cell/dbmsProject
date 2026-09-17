"""
Tests for Visualization Layout Engine (Phase 8).

Verifies:
1. Deterministic node and edge construction from schema.
2. Composite determinant grouping (e.g. StudentID, CourseID).
3. FD and MVD edge classification and violation highlighting.
4. Step-by-step closure visualization model generation.
5. Hierarchical decomposition tree generation.
"""

import pytest
from app.schemas.domain_contracts import (
    FunctionalDependency,
    MultivaluedDependency,
    DecompositionPlan,
    DecomposedRelation,
    LosslessJoinResult,
    DependencyPreservationResult,
)
from app.normalization.closure_engine import compute_attribute_closure
from app.visualization.layout_engine import (
    build_dependency_graph,
    build_closure_visualization,
    build_decomposition_tree,
)


def test_build_dependency_graph_composite_determinant():
    """Test graph builder with composite determinant (StudentID, CourseID) -> Grade."""
    attrs = ["StudentID", "CourseID", "StudentName", "CourseName", "Grade"]
    fds = [
        FunctionalDependency(left=["StudentID"], right=["StudentName"]),
        FunctionalDependency(left=["CourseID"], right=["CourseName"]),
        FunctionalDependency(left=["StudentID", "CourseID"], right=["Grade"]),
    ]
    candidate_keys = [["StudentID", "CourseID"]]
    prime_attrs = ["StudentID", "CourseID"]
    violations = {"fd_violations": ["StudentID → StudentName", "CourseID → CourseName"]}

    graph = build_dependency_graph(
        relation_name="ENROLLMENT",
        attributes=attrs,
        fds=fds,
        candidate_keys=candidate_keys,
        prime_attributes=prime_attrs,
        violations=violations,
    )

    assert graph.relation_name == "ENROLLMENT"
    # Should have 5 attribute nodes + 1 composite determinant node
    assert len(graph.nodes) == 6

    comp_nodes = [n for n in graph.nodes if n.type == "composite_determinant"]
    assert len(comp_nodes) == 1
    assert set(comp_nodes[0].attributes) == {"StudentID", "CourseID"}
    assert comp_nodes[0].is_candidate_key is True

    # Check edges
    assert len(graph.edges) == 3
    violation_edges = [e for e in graph.edges if e.is_violation]
    assert len(violation_edges) == 2


def test_build_dependency_graph_mvd():
    """Test graph builder with MVD edges."""
    attrs = ["Student", "Hobby", "Language"]
    mvds = [
        MultivaluedDependency(left=["Student"], right=["Hobby"]),
        MultivaluedDependency(left=["Student"], right=["Language"]),
    ]

    graph = build_dependency_graph(
        relation_name="STUDENT_ACTIVITIES",
        attributes=attrs,
        fds=[],
        mvds=mvds,
        candidate_keys=[["Student", "Hobby", "Language"]],
    )

    mvd_edges = [e for e in graph.edges if e.type == "mvd"]
    assert len(mvd_edges) == 2
    assert all(e.label == "↠" for e in mvd_edges)


def test_build_closure_visualization():
    """Test closure player data model derivation."""
    attrs = ["A", "B", "C", "D"]
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
        FunctionalDependency(left=["B"], right=["C"]),
        FunctionalDependency(left=["C"], right=["D"]),
    ]
    closure_res = compute_attribute_closure(attrs, fds, ["A"])
    closure_vis = build_closure_visualization(["A"], closure_res, attrs)

    assert closure_vis.is_superkey is True
    assert closure_vis.final_closure == ["A", "B", "C", "D"]
    assert len(closure_vis.steps) == 4  # Step 0 (initial), Step 1 (A->B), Step 2 (B->C), Step 3 (C->D)
    assert closure_vis.steps[0].is_starting is True
    assert closure_vis.steps[-1].is_fixed_point is True
    assert closure_vis.steps[-1].is_superkey is True


def test_build_decomposition_tree():
    """Test decomposition tree construction from DecompositionPlan."""
    source_attrs = ["StudentID", "CourseID", "StudentName", "CourseName", "Grade"]
    sub_rels = [
        DecomposedRelation(name="STUDENT", attributes=["StudentID", "StudentName"], primary_key=["StudentID"], purpose="Partial dependency"),
        DecomposedRelation(name="COURSE", attributes=["CourseID", "CourseName"], primary_key=["CourseID"], purpose="Partial dependency"),
        DecomposedRelation(name="ENROLLMENT", attributes=["StudentID", "CourseID", "Grade"], primary_key=["StudentID", "CourseID"], purpose="Remainder"),
    ]
    plan = DecompositionPlan(
        id="plan-2nf-test",
        trigger_type="PARTIAL_DEPENDENCY",
        stage="2NF",
        source_relation="ENROLLMENT",
        source_attributes=source_attrs,
        proposed_relations=sub_rels,
        lossless_join=LosslessJoinResult(
            is_lossless=True,
            method="TABLEAU_CHASE",
            attributes=source_attrs,
            relations=[r.name for r in sub_rels],
            reasoning="Lossless verification",
        ),
        dependency_preservation=DependencyPreservationResult(
            is_preserved=True,
            reasoning="Preserved verification",
        ),
        summary="2NF plan",
    )

    tree = build_decomposition_tree(
        source_relation="ENROLLMENT",
        source_attributes=source_attrs,
        candidate_keys=[["StudentID", "CourseID"]],
        plans=[plan],
    )

    # Root + 3 sub-relations = 4 nodes
    assert len(tree) == 4
    root = tree[0]
    assert root.parent_id is None
    assert all(n.is_lossless is True for n in tree[1:])


def test_build_dependency_graph_automatic_candidate_keys_and_primes():
    """Verifies that if candidate keys are omitted/empty, graph builder derives CK and prime attributes."""
    attrs = ["PatientID", "DoctorID", "TreatmentCode", "PatientName", "DoctorName", "Department", "TreatmentDesc", "Fee"]
    fds = [
        FunctionalDependency(id="1", left=["PatientID"], right=["PatientName"]),
        FunctionalDependency(id="2", left=["DoctorID"], right=["DoctorName", "Department"]),
        FunctionalDependency(id="3", left=["TreatmentCode"], right=["TreatmentDesc", "Fee"]),
    ]

    # Candidate keys and prime attributes intentionally empty
    graph = build_dependency_graph(
        relation_name="HOSPITAL_VISIT",
        attributes=attrs,
        fds=fds,
        candidate_keys=[],
        prime_attributes=[],
    )

    assert graph.candidate_keys == [["PatientID", "DoctorID", "TreatmentCode"]]
    assert set(graph.prime_attributes) == {"PatientID", "DoctorID", "TreatmentCode"}
    assert set(graph.non_prime_attributes) == {"PatientName", "DoctorName", "Department", "TreatmentDesc", "Fee"}

    # Prime nodes must have is_prime=True and position in Column 1 (X=360)
    prime_nodes = [n for n in graph.nodes if n.label in {"PatientID", "DoctorID", "TreatmentCode"}]
    assert len(prime_nodes) == 3
    for pn in prime_nodes:
        assert pn.is_prime is True
        assert pn.data.get("isPrime") is True
        assert pn.position["x"] == 360.0

    # Non-prime nodes must have is_prime=False and position in Column 2 (X=680)
    non_prime_nodes = [n for n in graph.nodes if n.label in {"PatientName", "DoctorName", "Department", "TreatmentDesc", "Fee"}]
    assert len(non_prime_nodes) == 5
    for npn in non_prime_nodes:
        assert npn.is_prime is False
        assert npn.data.get("isPrime") is False
        assert npn.position["x"] == 680.0
