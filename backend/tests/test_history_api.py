"""
Unit tests for Analysis History API.
Tests recording, retrieving, filtering, and clearing analysis history items.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_history():
    # Clean history before and after each test
    client.delete("/api/v1/history")
    yield
    client.delete("/api/v1/history")


def test_record_normalization_history():
    payload = {
        "title": "ENROLLMENT Normalization Run",
        "analysis_type": "normalization",
        "relation_name": "ENROLLMENT",
        "highest_normal_form": "1NF",
        "schema_data": {
            "name": "ENROLLMENT",
            "attributes": ["StudentID", "CourseID", "StudentName", "Grade"],
            "functional_dependencies": [
                {"left": ["StudentID"], "right": ["StudentName"]},
            ],
            "candidate_keys": [["StudentID", "CourseID"]],
        },
        "analysis_result": {
            "relation_name": "ENROLLMENT",
            "highest_confirmed_normal_form": "1NF",
        },
        "summary": {
            "violations_count": 1,
            "candidate_keys": ["StudentID, CourseID"],
        },
    }

    res = client.post("/api/v1/history", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["relation_name"] == "ENROLLMENT"
    assert data["analysis_type"] == "normalization"
    assert data["highest_normal_form"] == "1NF"
    assert "id" in data


def test_list_and_filter_history():
    # Insert 2 items
    client.post("/api/v1/history", json={
        "id": "h-norm-1",
        "title": "Normalization Test",
        "analysis_type": "normalization",
        "relation_name": "R1",
        "highest_normal_form": "2NF",
        "schema_data": {"name": "R1", "attributes": ["A", "B"]},
    })
    client.post("/api/v1/history", json={
        "id": "h-keys-1",
        "title": "Keys Test",
        "analysis_type": "keys",
        "relation_name": "R2",
        "schema_data": {"name": "R2", "attributes": ["X", "Y"]},
    })

    # List all
    res_all = client.get("/api/v1/history")
    assert res_all.status_code == 200
    all_data = res_all.json()
    assert all_data["total"] == 2
    assert len(all_data["items"]) == 2

    # Filter by type
    res_keys = client.get("/api/v1/history?type=keys")
    assert res_keys.status_code == 200
    keys_data = res_keys.json()
    assert keys_data["total"] == 1
    assert keys_data["items"][0]["relation_name"] == "R2"

    # Get single item
    res_single = client.get("/api/v1/history/h-norm-1")
    assert res_single.status_code == 200
    assert res_single.json()["title"] == "Normalization Test"

    # Delete single item
    del_res = client.delete("/api/v1/history/h-norm-1")
    assert del_res.status_code == 204

    # Verify count is now 1
    res_after_del = client.get("/api/v1/history")
    assert res_after_del.json()["total"] == 1

    # Clear all
    clear_res = client.delete("/api/v1/history")
    assert clear_res.status_code == 204
    assert client.get("/api/v1/history").json()["total"] == 0
