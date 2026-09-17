"""
Tests for Visualization API Endpoints (Phase 8).

Verifies:
1. POST /api/v1/visualization/graph
2. POST /api/v1/visualization/closure-player
3. POST /api/v1/visualization/decomposition-tree
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.anyio
async def test_api_visualization_graph():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "relationName": "EMPLOYEE",
            "attributes": ["EmpID", "EmpName", "DeptID", "DeptName"],
            "functionalDependencies": [
                {"left": ["EmpID"], "right": ["EmpName", "DeptID"]},
                {"left": ["DeptID"], "right": ["DeptName"]},
            ],
            "candidateKeys": [["EmpID"]],
            "primeAttributes": ["EmpID"],
        }
        res = await client.post("/api/v1/visualization/graph", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["relationName"] == "EMPLOYEE"
        assert len(data["nodes"]) >= 4
        assert len(data["edges"]) >= 2


@pytest.mark.anyio
async def test_api_visualization_closure_player():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "attributes": ["A", "B", "C"],
            "functionalDependencies": [
                {"left": ["A"], "right": ["B"]},
                {"left": ["B"], "right": ["C"]},
            ],
            "targetAttributes": ["A"],
        }
        res = await client.post("/api/v1/visualization/closure-player", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["isSuperkey"] is True
        assert len(data["steps"]) >= 3
        assert data["finalClosure"] == ["A", "B", "C"]


@pytest.mark.anyio
async def test_api_visualization_decomposition_tree():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "sourceRelation": "R",
            "sourceAttributes": ["A", "B", "C"],
            "candidateKeys": [["A"]],
            "plans": [],
        }
        res = await client.post("/api/v1/visualization/decomposition-tree", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 1
        assert data[0]["name"] == "R"
