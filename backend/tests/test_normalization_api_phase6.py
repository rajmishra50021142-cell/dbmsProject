import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_api_analyze_3nf_endpoint(client: AsyncClient):
    # 3NF violation test: EMPLOYEE
    payload = {
        "name": "EMPLOYEE",
        "attributes": ["EmpID", "EmpName", "DeptID", "DeptName"],
        "functional_dependencies": [
            {"lhs": ["EmpID"], "rhs": ["EmpName", "DeptID"]},
            {"lhs": ["DeptID"], "rhs": ["DeptName"]},
        ],
    }
    response = await client.post("/api/v1/normalize/3nf", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "VIOLATED"
    assert data["is_satisfied"] is False
    assert len(data["violations"]) == 1
    assert data["violations"][0]["determinant"] == ["DeptID"]
    assert data["violations"][0]["dependent_attributes"] == ["DeptName"]
    assert data["decomposition_proposal"] is not None


@pytest.mark.anyio
async def test_api_analyze_4nf_endpoint(client: AsyncClient):
    # 4NF violation test: STUDENT
    payload = {
        "name": "STUDENT",
        "attributes": ["Student", "Hobby", "Language"],
        "multivalued_dependencies": [
            {"lhs": ["Student"], "rhs": ["Hobby"]},
            {"lhs": ["Student"], "rhs": ["Language"]},
        ],
    }
    response = await client.post("/api/v1/normalize/4nf", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "VIOLATED"
    assert data["is_satisfied"] is False
    assert len(data["violations"]) == 2
    assert data["decomposition_proposal"] is not None


@pytest.mark.anyio
async def test_api_analyze_full_normalization_endpoint(client: AsyncClient):
    payload = {
        "name": "STUDENT",
        "attributes": ["Student", "Hobby", "Language"],
        "multivalued_dependencies": [
            {"lhs": ["Student"], "rhs": ["Hobby"]},
            {"lhs": ["Student"], "rhs": ["Language"]},
        ],
        "sample_data": [
            {"Student": "Alice", "Hobby": "Chess", "Language": "Python"},
        ],
    }
    response = await client.post("/api/v1/normalize/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "nf1" in data
    assert "nf2" in data
    assert "nf3" in data
    assert "nf4" in data
    assert "highest_confirmed_normal_form" in data
    assert data["nf1"]["status"] == "SATISFIED"
    assert data["nf2"]["status"] == "SATISFIED"
    assert data["nf3"]["status"] == "SATISFIED"
    assert data["nf4"]["status"] == "VIOLATED"
    assert data["highest_confirmed_normal_form"] == "3NF"
