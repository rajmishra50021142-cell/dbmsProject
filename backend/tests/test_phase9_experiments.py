"""
Unit and integration tests for Phase 9 What-If / Experiment Mode.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.domain_contracts import CanonicalSchemaInput, FunctionalDependency
from app.experiments.schemas import ExperimentAnalyzeRequest
from app.experiments.service import ExperimentService

client = TestClient(app)


def test_experiment_diff_fd_added_and_violation():
    orig = CanonicalSchemaInput(
        name="ENROLLMENT",
        attributes=["StudentID", "CourseID", "Grade"],
        functional_dependencies=[],
    )
    # Modified: Add StudentName attribute and StudentID -> StudentName (violating 2NF)
    mod = CanonicalSchemaInput(
        name="ENROLLMENT",
        attributes=["StudentID", "CourseID", "Grade", "StudentName"],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID"], right=["StudentName"]),
        ],
    )

    req = ExperimentAnalyzeRequest(original_input=orig, modified_input=mod)
    res = ExperimentService.run_experiment(req)

    assert "StudentName" in res.diff.attributes_added
    assert len(res.diff.dependencies_added) == 1
    assert res.diff.dependencies_added[0]["left"] == ["StudentID"]
    assert res.diff.dependencies_added[0]["right"] == ["StudentName"]

    # 2NF should be satisfied in original (all key) and violated in modified (partial dependency)
    changed_stages = [c["stage"] for c in res.diff.normal_forms_changed]
    assert "2NF" in changed_stages

    # Reasoning changes must explain why
    assert any("2NF changed" in r for r in res.reasoning_changes)
    assert res.original_analysis.relation_name == "ENROLLMENT"
    assert res.modified_analysis.relation_name == "ENROLLMENT"


def test_experiment_api_endpoint():
    payload = {
        "original_input": {
            "name": "R",
            "attributes": ["A", "B", "C"],
            "functional_dependencies": [
                {"left": ["A"], "right": ["B", "C"]}
            ],
            "multivalued_dependencies": [],
            "candidate_keys": [],
            "sample_data": []
        },
        "modified_input": {
            "name": "R",
            "attributes": ["A", "B", "C", "D"],
            "functional_dependencies": [
                {"left": ["A"], "right": ["B", "C"]},
                {"left": ["B"], "right": ["D"]}
            ],
            "multivalued_dependencies": [],
            "candidate_keys": [],
            "sample_data": []
        }
    }
    response = client.post("/api/v1/experiments/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "D" in data["diff"]["attributes_added"]
    assert len(data["diff"]["dependencies_added"]) == 1
    assert len(data["reasoning_changes"]) > 0
