"""
Integration tests for Candidate-Key and Superkey API endpoints (Phase 4).
"""

import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_api_superkey_check(client: AsyncClient):
    payload = {
        "relation_name": "R",
        "attributes": ["A", "B", "C"],
        "functional_dependencies": [
            {"left": ["A"], "right": ["B"]},
            {"left": ["B"], "right": ["C"]},
        ],
        "target_attributes": ["A"],
    }
    response = await client.post("/api/v1/keys/superkey-check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_superkey"] is True
    assert data["missing_attributes"] == []
    assert set(data["closure"]) == {"A", "B", "C"}


@pytest.mark.anyio
async def test_api_verify_candidate_key(client: AsyncClient):
    payload = {
        "relation_name": "R",
        "attributes": ["A", "B", "C"],
        "functional_dependencies": [
            {"left": ["A"], "right": ["B"]},
            {"left": ["B"], "right": ["C"]},
        ],
        "candidate_key": ["A", "B"],
    }
    response = await client.post("/api/v1/keys/verify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_superkey"] is True
    assert data["is_minimal"] is False
    assert data["is_candidate_key"] is False
    assert data["violating_subset"] == ["A"]


@pytest.mark.anyio
async def test_api_find_candidate_keys(client: AsyncClient):
    payload = {
        "relation_name": "ENROLLMENT",
        "attributes": ["StudentID", "CourseID", "Grade", "StudentName"],
        "functional_dependencies": [
            {"left": ["StudentID", "CourseID"], "right": ["Grade"]},
            {"left": ["StudentID"], "right": ["StudentName"]},
        ],
    }
    response = await client.post("/api/v1/keys/find", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["candidate_keys"]) == 1
    assert set(data["candidate_keys"][0]) == {"StudentID", "CourseID"}
    assert set(data["prime_attributes"]) == {"StudentID", "CourseID"}
    assert set(data["non_prime_attributes"]) == {"Grade", "StudentName"}
    assert len(data["reasoning_steps"]) >= 3


@pytest.mark.anyio
async def test_api_candidate_key_analysis(client: AsyncClient):
    payload = {
        "relation_name": "ENROLLMENT",
        "attributes": ["StudentID", "CourseID", "Grade", "StudentName"],
        "functional_dependencies": [
            {"left": ["StudentID", "CourseID"], "right": ["Grade"]},
            {"left": ["StudentID"], "right": ["StudentName"]},
        ],
        "user_candidate_keys": [
            ["StudentID", "CourseID"],
        ],
    }
    response = await client.post("/api/v1/keys/analysis", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["discovered_candidate_keys"]) == 1
    assert len(data["user_key_verifications"]) == 1
    assert data["user_key_verifications"][0]["is_candidate_key"] is True


@pytest.mark.anyio
async def test_api_key_error_handling(client: AsyncClient):
    payload = {
        "relation_name": "R",
        "attributes": ["A", "B"],
        "functional_dependencies": [],
        "candidate_key": ["NonExistent"],
    }
    response = await client.post("/api/v1/keys/verify", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert "unknown attribute" in data["error"]["message"]
