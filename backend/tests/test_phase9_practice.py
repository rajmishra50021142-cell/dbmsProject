"""
Unit and integration tests for Phase 9 Practice Mode.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.practice.service import PracticeService
from app.practice.schemas import PracticeVerifyRequest
from app.schemas.domain_contracts import FunctionalDependency

client = TestClient(app)


def test_get_exercises():
    exercises = PracticeService.get_exercises()
    assert len(exercises) == 10
    assert any(e.id == "ex-ck-vehicle" for e in exercises)
    assert any(e.id == "ex-ck-flight" for e in exercises)
    assert any(e.id == "ex-closure-cascade" for e in exercises)
    assert any(e.id == "ex-violation-order" for e in exercises)
    assert any(e.id == "ex-hnf-property" for e in exercises)
    assert any(e.type == "candidate-key" for e in exercises)
    assert any(e.type == "closure" for e in exercises)
    assert any(e.type == "highest-normal-form" for e in exercises)
    assert any(e.type == "nf-violation" for e in exercises)
    assert any(e.type == "mvd-analysis" for e in exercises)


def test_verify_candidate_key_correct():
    req = PracticeVerifyRequest(
        exercise_id="test-ck",
        exercise_type="candidate-key",
        submitted_answer="StudentID, CourseID",
        attributes=["StudentID", "CourseID", "StudentName"],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID"], right=["StudentName"]),
        ],
        multivalued_dependencies=[],
    )
    res = PracticeService.verify_answer(req)
    assert res.is_correct is True
    assert "StudentID" in res.feedback


def test_verify_closure():
    req = PracticeVerifyRequest(
        exercise_id="test-closure",
        exercise_type="closure",
        submitted_answer="A, B, C",
        attributes=["A", "B", "C", "D"],
        functional_dependencies=[
            FunctionalDependency(left=["A"], right=["B"]),
            FunctionalDependency(left=["B"], right=["C"]),
        ],
        multivalued_dependencies=[],
        metadata={"target_attributes": ["A"]},
    )
    res = PracticeService.verify_answer(req)
    assert res.is_correct is True
    assert "A, B, C" in res.expected_answer


def test_practice_api_endpoints():
    get_res = client.get("/api/v1/practice/exercises")
    assert get_res.status_code == 200
    ex_list = get_res.json()
    assert len(ex_list) > 0

    post_payload = {
        "exercise_id": ex_list[0]["id"],
        "exercise_type": ex_list[0]["type"],
        "submitted_answer": "StudentID, CourseID",
        "attributes": ex_list[0]["attributes"],
        "functional_dependencies": ex_list[0]["functional_dependencies"],
        "multivalued_dependencies": ex_list[0]["multivalued_dependencies"],
    }
    post_res = client.post("/api/v1/practice/verify", json=post_payload)
    assert post_res.status_code == 200
    data = post_res.json()
    assert "is_correct" in data
    assert "feedback" in data
