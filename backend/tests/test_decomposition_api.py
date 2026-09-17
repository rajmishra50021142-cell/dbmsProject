"""
Integration Tests for Phase 7 Decomposition & Verification Endpoints.

Tests:
- POST /api/v1/decomposition/verify-lossless
- POST /api/v1/decomposition/verify-dependencies
- POST /api/v1/decomposition/verify
- POST /api/v1/decomposition/2nf
- POST /api/v1/decomposition/3nf
- POST /api/v1/decomposition/4nf
- POST /api/v1/decomposition/minimal-cover
- POST /api/v1/decomposition/analyze
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_api_verify_lossless():
    payload = {
        "attributes": ["A", "B", "C", "D"],
        "functionalDependencies": [
            {"lhs": ["A"], "rhs": ["B"]},
            {"lhs": ["B"], "rhs": ["C"]},
        ],
        "decomposedRelations": [
            ["A", "B"],
            ["B", "C"],
            ["A", "D"],
        ],
    }
    response = client.post("/api/v1/decomposition/verify-lossless", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_lossless"] is True
    assert data["method"] == "TABLEAU_CHASE"
    assert len(data["chase_steps"]) >= 1


def test_api_verify_dependencies():
    payload = {
        "attributes": ["A", "B", "C"],
        "functionalDependencies": [
            {"lhs": ["A"], "rhs": ["B"]},
            {"lhs": ["B"], "rhs": ["C"]},
        ],
        "decomposedRelations": [
            ["A", "B"],
            ["B", "C"],
        ],
    }
    response = client.post("/api/v1/decomposition/verify-dependencies", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_preserved"] is True
    assert len(data["preserved_dependencies"]) == 2


def test_api_verify_combined():
    payload = {
        "relation_name": "ENROLLMENT",
        "attributes": ["StudentID", "CourseID", "StudentName", "CourseName", "Grade"],
        "functional_dependencies": [
            {"lhs": ["StudentID"], "rhs": ["StudentName"]},
            {"lhs": ["CourseID"], "rhs": ["CourseName"]},
            {"lhs": ["StudentID", "CourseID"], "rhs": ["Grade"]},
        ],
        "decomposed_relations": [
            {"name": "STUDENT", "attributes": ["StudentID", "StudentName"]},
            {"name": "COURSE", "attributes": ["CourseID", "CourseName"]},
            {"name": "ENROLLMENT_CORE", "attributes": ["StudentID", "CourseID", "Grade"]},
        ],
    }
    response = client.post("/api/v1/decomposition/verify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_status"] == "VERIFIED_BOTH"
    assert data["lossless_join"]["is_lossless"] is True
    assert data["dependency_preservation"]["is_preserved"] is True


def test_api_2nf():
    payload = {
        "relation_name": "STUDENT_COURSE",
        "attributes": ["StudentID", "CourseID", "StudentName", "Grade"],
        "functional_dependencies": [
            {"lhs": ["StudentID"], "rhs": ["StudentName"]},
            {"lhs": ["StudentID", "CourseID"], "rhs": ["Grade"]},
        ],
    }
    response = client.post("/api/v1/decomposition/2nf", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["stage"] == "2NF"
    assert len(data["proposed_relations"]) == 2
    assert data["lossless_join"]["is_lossless"] is True


def test_api_3nf():
    payload = {
        "relation_name": "EMPLOYEE",
        "attributes": ["EmpID", "EmpName", "DeptID", "DeptName"],
        "functional_dependencies": [
            {"lhs": ["EmpID"], "rhs": ["EmpName", "DeptID"]},
            {"lhs": ["DeptID"], "rhs": ["DeptName"]},
        ],
    }
    response = client.post("/api/v1/decomposition/3nf", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["stage"] == "3NF"
    assert len(data["proposed_relations"]) == 2
    assert data["dependency_preservation"]["is_preserved"] is True


def test_api_4nf():
    payload = {
        "relation_name": "STUDENT_ACTIVITIES",
        "attributes": ["Student", "Hobby", "Language"],
        "multivalued_dependencies": [
            {"lhs": ["Student"], "rhs": ["Hobby"]},
        ],
    }
    response = client.post("/api/v1/decomposition/4nf", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["stage"] == "4NF"
    assert len(data["proposed_relations"]) == 2
    assert data["lossless_join"]["is_lossless"] is True


def test_api_minimal_cover():
    payload = {
        "attributes": ["A", "B", "C"],
        "functional_dependencies": [
            {"lhs": ["A"], "rhs": ["B", "C"]},
            {"lhs": ["B"], "rhs": ["C"]},
            {"lhs": ["A"], "rhs": ["C"]},
        ],
    }
    response = client.post("/api/v1/decomposition/minimal-cover", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["minimal_fds"]) == 2
    assert len(data["removed_redundant_fds"]) == 1


def test_api_analyze_pipeline():
    payload = {
        "relation_name": "R",
        "attributes": ["A", "B", "C", "D"],
        "functional_dependencies": [
            {"lhs": ["A"], "rhs": ["B"]},
            {"lhs": ["B"], "rhs": ["C"]},
            {"lhs": ["C"], "rhs": ["D"]},
        ],
        "target_normal_form": "3NF",
    }
    response = client.post("/api/v1/decomposition/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["target_normal_form"] == "3NF"
    assert len(data["final_relations"]) >= 2
    assert data["verification"]["overall_status"] == "VERIFIED_BOTH"
