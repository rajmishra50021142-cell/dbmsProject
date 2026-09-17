"""
Integration Tests for Attribute Closure FastAPI Endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_api_compute_closure(client: AsyncClient):
    payload = {
        "relation_name": "STUDENT_COURSE",
        "attributes": ["StudentID", "CourseID", "Grade", "StudentName"],
        "functional_dependencies": [
            {"left": ["StudentID"], "right": ["StudentName"]},
            {"left": ["StudentID", "CourseID"], "right": ["Grade"]},
        ],
        "target_attributes": ["StudentID", "CourseID"],
    }
    response = await client.post("/api/v1/closure/compute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_superkey"] is True
    assert set(data["closure_attributes"]) == {"StudentID", "CourseID", "Grade", "StudentName"}
    assert len(data["steps"]) >= 2


@pytest.mark.anyio
async def test_api_determination(client: AsyncClient):
    payload = {
        "relation_name": "R",
        "attributes": ["A", "B", "C"],
        "functional_dependencies": [
            {"left": ["A"], "right": ["B"]},
            {"left": ["B"], "right": ["C"]},
        ],
        "lhs": ["A"],
        "rhs": ["C"],
    }
    response = await client.post("/api/v1/closure/determination", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["determined"] is True
    assert "Yes" in data["explanation"]


@pytest.mark.anyio
async def test_api_trivial_check(client: AsyncClient):
    payload = {
        "functional_dependency": {
            "left": ["A", "B"],
            "right": ["A"],
        }
    }
    response = await client.post("/api/v1/closure/trivial-check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_trivial"] is True
    assert data["is_completely_trivial"] is True
    assert "Reflexivity" in data["explanation"]


@pytest.mark.anyio
async def test_api_closure_validation_error(client: AsyncClient):
    payload = {
        "attributes": ["A", "B"],
        "functional_dependencies": [],
        "target_attributes": ["UNKNOWN_ATTR"],
    }
    response = await client.post("/api/v1/closure/compute", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert "do not exist in relation" in data["error"]["message"]
