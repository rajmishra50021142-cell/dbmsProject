"""
Unit and integration tests for Phase 9 Normalization Assistant.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.assistant.schemas import AssistantContext, AssistantAskRequest
from app.assistant.response_builder import ResponseBuilder
from app.schemas.domain_contracts import FunctionalDependency

client = TestClient(app)


def test_concept_question_3nf():
    res = ResponseBuilder.build_response("What is 3NF?")
    assert res.intent == "CONCEPT_3NF"
    assert res.supported is True
    assert "Third Normal Form" in res.answer
    assert "superkey" in res.answer


def test_concept_question_candidate_key():
    res = ResponseBuilder.build_response("Define candidate key")
    assert res.intent == "CONCEPT_CANDIDATE_KEY"
    assert res.supported is True
    assert "minimal superkey" in res.answer


def test_contextual_keys_question():
    ctx = AssistantContext(
        relation="STUDENT_COURSE",
        attributes=["StudentID", "CourseID", "Grade"],
        candidate_keys=[["StudentID", "CourseID"]],
        prime_attributes=["StudentID", "CourseID"],
        non_prime_attributes=["Grade"],
    )
    res = ResponseBuilder.build_response("What are my candidate keys?", ctx)
    assert res.intent == "CANDIDATE_KEYS"
    assert res.supported is True
    assert "StudentID, CourseID" in res.answer
    assert "STUDENT_COURSE" in res.answer


def test_why_2nf_fail():
    ctx = AssistantContext(
        relation="ENROLLMENT",
        attributes=["StudentID", "CourseID", "StudentName", "Grade"],
        candidate_keys=[["StudentID", "CourseID"]],
        prime_attributes=["StudentID", "CourseID"],
        non_prime_attributes=["StudentName", "Grade"],
        normal_forms={"1NF": "SATISFIED", "2NF": "VIOLATED", "3NF": "VIOLATED"},
        violations=[
            {
                "id": "v-partial-1",
                "stage": "2NF",
                "dependency": "StudentID → StudentName",
                "lhs": ["StudentID"],
                "rhs": ["StudentName"],
            }
        ],
    )
    res = ResponseBuilder.build_response("Why is this relation not in 2NF?", ctx)
    assert res.intent == "WHY_NF_FAIL"
    assert res.supported is True
    assert "StudentID → StudentName" in res.answer
    assert "partial dependency" in res.answer.lower()
    assert "v-partial-1" in res.evidence_ids


def test_attribute_closure_deterministic():
    ctx = AssistantContext(
        relation="R",
        attributes=["A", "B", "C", "D"],
        candidate_keys=[["A"]],
        prime_attributes=["A"],
        non_prime_attributes=["B", "C", "D"],
        functional_dependencies=[
            FunctionalDependency(left=["A"], right=["B"]),
            FunctionalDependency(left=["B"], right=["C"]),
        ],
    )
    res = ResponseBuilder.build_response("What is A closure?", ctx)
    assert res.intent == "CLOSURE"
    assert res.supported is True
    assert "A" in res.answer
    assert "B" in res.answer
    assert "C" in res.answer


def test_unsupported_question_graceful_fallback():
    res = ResponseBuilder.build_response("Write me a poem about databases.")
    assert res.intent == "UNKNOWN"
    assert res.supported is False
    assert "deterministic DBMS Normalization Assistant" in res.answer
    assert "Supported topics:" in res.answer


def test_assistant_api_endpoint():
    payload = {
        "question": "Why is this not in 3NF?",
        "context": {
            "relation": "R",
            "attributes": ["A", "B", "C"],
            "candidate_keys": [["A"]],
            "prime_attributes": ["A"],
            "non_prime_attributes": ["B", "C"],
            "normal_forms": {"1NF": "SATISFIED", "2NF": "SATISFIED", "3NF": "VIOLATED"},
            "violations": [
                {
                    "id": "v-3nf-1",
                    "stage": "3NF",
                    "dependency": "B → C",
                }
            ],
        },
    }
    response = client.post("/api/v1/assistant/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "WHY_NF_FAIL"
    assert data["supported"] is True
    assert "B → C" in data["answer"]
