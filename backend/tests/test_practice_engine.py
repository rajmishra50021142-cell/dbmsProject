"""
Tests for Enhanced Practice Engine (Phase 9 & 10 Extensions).

Tests AI Practice question bank (30 questions), Competitive Exam PYQs (80 questions,
60 playable, 20 incomplete), gentle progressive retry logic, full quiz scoring,
and legacy practice exercise backward compatibility.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.practice.service import PracticeService
from app.practice.schemas import (
    VerifyAttemptRequest,
    QuizSubmissionRequest,
)

client = TestClient(app)


def test_practice_summary():
    response = client.get("/api/v1/practice/summary")
    assert response.status_code == 200
    data = response.json()
    assert "ai_practice" in data
    assert "pyq_practice" in data
    assert data["ai_practice"]["total_questions"] == 30
    assert data["pyq_practice"]["total_questions"] == 80
    assert data["pyq_practice"]["playable_questions"] == 60
    assert data["pyq_practice"]["incomplete_questions"] == 20
    assert len(data["ai_practice"]["topics"]) > 0
    assert len(data["pyq_practice"]["exams"]) > 0


def test_ai_practice_questions_fetch_and_filters():
    # Fetch all
    response = client.get("/api/v1/practice/ai/questions")
    assert response.status_code == 200
    all_ai = response.json()
    assert len(all_ai) == 30

    # Every AI question has required attributes
    for q in all_ai:
        assert q["bank_type"] == "ai"
        assert len(q["options"]) == 4
        assert q["correct_answer"] in ["A", "B", "C", "D"]
        assert len(q["explanation"]) > 10
        assert len(q["hints"]) >= 2
        assert q["status"] == "playable"

    # Filter by count
    resp_count = client.get("/api/v1/practice/ai/questions?count=5")
    assert resp_count.status_code == 200
    assert len(resp_count.json()) == 5

    # Filter by difficulty
    resp_diff = client.get("/api/v1/practice/ai/questions?difficulty=Easy")
    assert resp_diff.status_code == 200
    easy_qs = resp_diff.json()
    assert len(easy_qs) > 0
    assert all(q["difficulty"] == "Easy" for q in easy_qs)


def test_pyq_practice_questions_fetch_and_filters():
    # Fetch all 80
    response = client.get("/api/v1/practice/pyqs/questions")
    assert response.status_code == 200
    all_pyq = response.json()
    assert len(all_pyq) == 80

    # Exactly 60 playable and 20 incomplete
    playable = [q for q in all_pyq if q["status"] == "playable"]
    incomplete = [q for q in all_pyq if q["status"] == "incomplete"]
    assert len(playable) == 60
    assert len(incomplete) == 20

    # Incomplete questions must provide reason why omitted from scored pools
    for inc in incomplete:
        assert inc["incomplete_reason"] is not None
        assert len(inc["incomplete_reason"]) > 5

    # Test playable_only query param
    resp_playable = client.get("/api/v1/practice/pyqs/questions?playable_only=true")
    assert resp_playable.status_code == 200
    assert len(resp_playable.json()) == 60

    # Test exam filter (GATE CSE)
    resp_gate = client.get("/api/v1/practice/pyqs/questions?exam=GATE+CSE")
    assert resp_gate.status_code == 200
    gate_qs = resp_gate.json()
    assert len(gate_qs) > 0
    assert all(q["exam"] == "GATE CSE" for q in gate_qs)


def test_gentle_retry_progression():
    # Test Question ai-q01
    q1 = PracticeService.get_question_by_id("ai-q01", "ai")
    assert q1 is not None
    correct_ans = q1.correct_answer
    wrong_ans = "A" if correct_ans != "A" else "B"

    # Attempt 1 - Incorrect
    resp1 = client.post(
        "/api/v1/practice/verify-attempt",
        json={
            "question_id": "ai-q01",
            "bank_type": "ai",
            "selected_option": wrong_ans,
            "attempt_number": 1,
        },
    )
    assert resp1.status_code == 200
    d1 = resp1.json()
    assert d1["is_correct"] is False
    assert d1["attempt_number"] == 1
    assert d1["attempts_remaining"] == 2
    assert "not quite" in d1["gentle_message"].lower()
    assert d1["hint"] is not None
    assert d1["revealed_answer"] is None
    assert d1["explanation"] is None

    # Attempt 2 - Incorrect
    resp2 = client.post(
        "/api/v1/practice/verify-attempt",
        json={
            "question_id": "ai-q01",
            "bank_type": "ai",
            "selected_option": wrong_ans,
            "attempt_number": 2,
        },
    )
    assert resp2.status_code == 200
    d2 = resp2.json()
    assert d2["is_correct"] is False
    assert d2["attempt_number"] == 2
    assert d2["attempts_remaining"] == 1
    assert "close" in d2["gentle_message"].lower()
    assert d2["hint"] is not None
    assert d2["revealed_answer"] is None

    # Attempt 3 - Incorrect (Answer and proof revealed with supportive closure)
    resp3 = client.post(
        "/api/v1/practice/verify-attempt",
        json={
            "question_id": "ai-q01",
            "bank_type": "ai",
            "selected_option": wrong_ans,
            "attempt_number": 3,
        },
    )
    assert resp3.status_code == 200
    d3 = resp3.json()
    assert d3["is_correct"] is False
    assert d3["attempt_number"] == 3
    assert d3["attempts_remaining"] == 0
    assert d3["revealed_answer"] == correct_ans
    assert len(d3["explanation"]) > 10
    assert d3["concept_summary"] is not None

    # Correct Attempt (Attempt 1)
    resp_correct = client.post(
        "/api/v1/practice/verify-attempt",
        json={
            "question_id": "ai-q01",
            "bank_type": "ai",
            "selected_option": correct_ans,
            "attempt_number": 1,
        },
    )
    assert resp_correct.status_code == 200
    d_corr = resp_correct.json()
    assert d_corr["is_correct"] is True
    assert d_corr["revealed_answer"] == correct_ans
    assert len(d_corr["explanation"]) > 10


def test_submit_quiz_session():
    # Submit 3 questions: 2 correct, 1 wrong
    ai_qs = PracticeService.get_ai_questions(count=3)
    answers = {
        ai_qs[0].id: ai_qs[0].correct_answer,
        ai_qs[1].id: ai_qs[1].correct_answer,
        ai_qs[2].id: "A" if ai_qs[2].correct_answer != "A" else "B",
    }

    req_payload = {
        "bank_type": "ai",
        "answers": answers,
        "time_spent_seconds": 125,
        "mode": "practice",
    }

    response = client.post("/api/v1/practice/submit-quiz", json=req_payload)
    assert response.status_code == 200
    data = response.json()

    assert data["total_questions"] == 3
    assert data["answered_count"] == 3
    assert data["correct_count"] == 2
    assert data["incorrect_count"] == 1
    assert data["unanswered_count"] == 0
    assert data["score_percentage"] == 66.7
    assert data["time_spent_seconds"] == 125
    assert len(data["topic_breakdown"]) > 0
    assert len(data["question_reviews"]) == 3
    assert len(data["supportive_summary"]) > 10

    # Check that reviews contain correct and selected options
    rev0 = data["question_reviews"][0]
    assert rev0["question_id"] == ai_qs[0].id
    assert rev0["is_correct"] is True
    assert rev0["selected_option"] == ai_qs[0].correct_answer

    rev2 = data["question_reviews"][2]
    assert rev2["is_correct"] is False


def test_legacy_practice_exercises():
    # Verify legacy Phase 9 endpoint is unbroken
    response = client.get("/api/v1/practice/exercises")
    assert response.status_code == 200
    exercises = response.json()
    assert len(exercises) >= 5
