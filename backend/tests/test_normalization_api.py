"""
Integration tests for Normalization API endpoints (/api/v1/normalize/*).
"""

import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_api_analyze_1nf_endpoint(client: AsyncClient):
    payload = {
        "name": "STUDENT",
        "attributes": ["ID", "Name", "Courses"],
        "sample_data": [
            {"ID": "1", "Name": "Alice", "Courses": "CS101, CS102"},
        ],
        "functional_dependencies": [],
        "candidate_keys": [],
        "multivalued_dependencies": [],
    }
    response = await client.post("/api/v1/normalize/1nf", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "VIOLATED"
    assert data["is_satisfied"] is False
    assert len(data["violations"]) == 1
    assert data["transformation"] is not None


@pytest.mark.anyio
async def test_api_analyze_2nf_endpoint(client: AsyncClient):
    payload = {
        "name": "ENROLLMENT",
        "attributes": ["StudentID", "CourseID", "StudentName", "Grade"],
        "candidate_keys": [["StudentID", "CourseID"]],
        "functional_dependencies": [
            {"left": ["StudentID"], "right": ["StudentName"]},
            {"left": ["StudentID", "CourseID"], "right": ["Grade"]},
        ],
        "multivalued_dependencies": [],
        "sample_data": [],
    }
    response = await client.post("/api/v1/normalize/2nf", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "VIOLATED"
    assert len(data["partial_dependencies"]) == 1
    assert data["decomposition_proposal"] is not None
    assert data["decomposition_proposal"]["verification_status"] == "NOT_YET_VERIFIED"


@pytest.mark.anyio
async def test_api_analyze_basic_normalization_endpoint(client: AsyncClient):
    payload = {
        "name": "ENROLLMENT",
        "attributes": ["StudentID", "CourseID", "Grade"],
        "candidate_keys": [["StudentID", "CourseID"]],
        "functional_dependencies": [
            {"left": ["StudentID", "CourseID"], "right": ["Grade"]},
        ],
        "multivalued_dependencies": [],
        "sample_data": [
            {"StudentID": "101", "CourseID": "CS1", "Grade": "A"},
        ],
    }
    response = await client.post("/api/v1/normalize/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["nf1"]["status"] == "SATISFIED"
    assert data["nf2"]["status"] == "SATISFIED"
    assert "input_fingerprint" in data
    assert len(data["candidate_keys"]) == 1


@pytest.mark.anyio
async def test_api_normalization_error_handling(client: AsyncClient):
    # Empty attributes should trigger validation or engine error
    payload = {
        "name": "EMPTY",
        "attributes": [],
        "functional_dependencies": [],
        "candidate_keys": [],
        "multivalued_dependencies": [],
    }
    response = await client.post("/api/v1/normalize/analyze", json=payload)
    assert response.status_code in [400, 422]
