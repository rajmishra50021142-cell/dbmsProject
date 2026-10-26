"""
Domain models and DTOs for Practice Mode, AI Practice, Competitive Exam PYQs,
and the Shared Gentle Retry Quiz Engine.
"""

from typing import List, Optional, Any, Literal, Dict
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.domain_contracts import FunctionalDependency, MultivaluedDependency


# Legacy models preserved for backward compatibility
class PracticeExercise(BaseModel):
    """Academic normalization practice exercise (Phase 9 legacy)."""
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., description="Unique exercise identifier")
    type: Literal["candidate-key", "closure", "highest-normal-form", "nf-violation", "mvd-analysis"] = Field(
        ..., description="Category of problem"
    )
    title: str = Field(..., description="Short exercise title")
    prompt: str = Field(..., description="Instructions for the student")
    schema_name: str = Field(default="R", description="Relation name")
    attributes: List[str] = Field(..., description="Relation attributes")
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list)
    multivalued_dependencies: List[MultivaluedDependency] = Field(default_factory=list)
    options: Optional[List[str]] = Field(default=None, description="Selectable options for multiple choice questions")
    hint: Optional[str] = Field(default=None, description="Pedagogical hint")
    target_attributes: Optional[List[str]] = Field(default=None, description="Target attributes if closure exercise")


class PracticeVerifyRequest(BaseModel):
    """Request payload for grading a student's practice exercise answer."""
    model_config = ConfigDict(populate_by_name=True)

    exercise_id: str = Field(..., description="Exercise ID")
    exercise_type: str = Field(..., description="Exercise type category")
    submitted_answer: Any = Field(..., description="Answer provided by student (string, list, etc.)")
    attributes: List[str] = Field(..., description="Relation attributes")
    functional_dependencies: List[FunctionalDependency] = Field(default_factory=list)
    multivalued_dependencies: List[MultivaluedDependency] = Field(default_factory=list)
    metadata: Optional[dict] = Field(default=None, description="Additional context such as target attributes")


class PracticeVerifyResponse(BaseModel):
    """Result of grading a student's practice exercise answer."""
    model_config = ConfigDict(populate_by_name=True)

    is_correct: bool = Field(..., description="True if student answer is mathematically correct")
    expected_answer: Any = Field(..., description="The mathematically rigorous answer from the engine")
    feedback: str = Field(..., description="Academic feedback explaining why the answer is correct or incorrect")
    reasoning_steps: List[str] = Field(default_factory=list, description="Step-by-step mathematical proof trace")


# -------------------------------------------------------------
# Enhanced Quiz Engine Models (AI Practice & Competitive PYQs)
# -------------------------------------------------------------

class QuizQuestion(BaseModel):
    """Structured question model for AI Practice and PYQ banks."""
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., description="Stable unique identifier (e.g. 'ai-q01' or 'pyq-01')")
    bank_type: Literal["ai", "pyq"] = Field(..., description="Source bank category")
    statement: str = Field(..., description="Question statement or problem formulation")
    options: List[str] = Field(..., description="List of 4 formatted options A, B, C, D")
    correct_answer: Optional[str] = Field(default=None, description="Correct option key ('A', 'B', 'C', 'D')")
    explanation: Optional[str] = Field(default=None, description="Detailed pedagogical explanation and proof")
    topic: str = Field(..., description="DBMS topic / normal form category")
    difficulty: Literal["Easy", "Medium", "Hard"] = Field(default="Medium", description="Question difficulty")
    hints: List[str] = Field(default_factory=list, description="Progressive hints for gentle retry")
    question_type: str = Field(default="MCQ", description="Question type (MCQ, Figure-based, Memory-based)")
    exam: Optional[str] = Field(default=None, description="Source exam name (e.g. GATE CSE, ISRO CSE)")
    year: Optional[str] = Field(default=None, description="Exam year (e.g. 2026, 2024)")
    note: Optional[str] = Field(default=None, description="Source caveats or paraphrasing note")
    source_number: Optional[int] = Field(default=None, description="Original compilation question number")
    marks: Optional[int] = Field(default=None, description="Question mark value (1 or 2)")
    figure_url: Optional[str] = Field(default=None, description="Optional path to high-res question figure asset")
    status: Literal["playable", "incomplete"] = Field(default="playable", description="'playable' or 'incomplete'")
    incomplete_reason: Optional[str] = Field(default=None, description="Reason if missing diagram, table, or FDs")

    @property
    def is_playable(self) -> bool:
        return self.status == "playable"


class QuizConfig(BaseModel):
    """Configuration settings for starting a quiz session."""
    model_config = ConfigDict(populate_by_name=True)

    question_count: int = Field(default=10, ge=1, description="Number of questions in session")
    time_limit_seconds: Optional[int] = Field(default=600, description="Total time limit in seconds (or None)")
    untimed: bool = Field(default=False, description="True if no time limit")
    mode: Literal["practice", "exam_simulation"] = Field(
        default="practice", description="'practice' has instant gentle retries; 'exam_simulation' defers feedback"
    )
    topic: Optional[str] = Field(default=None, description="Topic filter (None for all)")
    difficulty: Optional[str] = Field(default=None, description="Difficulty filter (for AI Practice)")
    randomize: bool = Field(default=False, description="Randomize question presentation order")


class VerifyAttemptRequest(BaseModel):
    """Request for gentle retry verification of an answer in Practice mode."""
    model_config = ConfigDict(populate_by_name=True)

    question_id: str = Field(..., description="Question identifier")
    bank_type: Literal["ai", "pyq"] = Field(..., description="Source bank ('ai' or 'pyq')")
    selected_option: str = Field(..., description="Option letter chosen ('A', 'B', 'C', 'D')")
    attempt_number: int = Field(default=1, ge=1, le=3, description="Current attempt number (1, 2, or 3)")


class GentleFeedbackResponse(BaseModel):
    """Supportive, gentle feedback response for a practice attempt."""
    model_config = ConfigDict(populate_by_name=True)

    is_correct: bool = Field(..., description="True if student chose the correct option")
    attempt_number: int = Field(..., description="Attempt number just evaluated")
    attempts_remaining: int = Field(..., description="Remaining attempts allowed for this question")
    gentle_message: str = Field(..., description="Supportive feedback message without harsh shaming")
    hint: Optional[str] = Field(default=None, description="Helpful hint for attempt 1 or 2")
    revealed_answer: Optional[str] = Field(default=None, description="Correct answer letter if attempt 3 or correct")
    explanation: Optional[str] = Field(default=None, description="Educational proof if attempt 3 or correct")
    concept_summary: Optional[str] = Field(default=None, description="Brief DBMS concept recap")


class QuizSubmissionRequest(BaseModel):
    """Payload when submitting an entire quiz attempt for final scoring."""
    model_config = ConfigDict(populate_by_name=True)

    bank_type: Literal["ai", "pyq"] = Field(..., description="'ai' or 'pyq'")
    answers: Dict[str, str] = Field(default_factory=dict, description="Map of question_id -> selected_option")
    time_spent_seconds: int = Field(default=0, ge=0, description="Time spent on quiz in seconds")
    mode: Literal["practice", "exam_simulation"] = Field(default="practice")


class QuizQuestionReview(BaseModel):
    """Review item for a single question on the final results page."""
    model_config = ConfigDict(populate_by_name=True)

    question_id: str
    source_number: Optional[int] = None
    statement: str
    options: List[str]
    selected_option: Optional[str]
    correct_answer: str
    is_correct: bool
    explanation: str
    topic: str
    exam: Optional[str] = None
    year: Optional[str] = None
    note: Optional[str] = None


class QuizSubmissionResponse(BaseModel):
    """Complete summary and review breakdown after submitting a quiz."""
    model_config = ConfigDict(populate_by_name=True)

    total_questions: int
    answered_count: int
    correct_count: int
    incorrect_count: int
    unanswered_count: int
    score_percentage: float
    time_spent_seconds: int
    topic_breakdown: Dict[str, Dict[str, int]] = Field(
        default_factory=dict, description="Topic -> {'total': int, 'correct': int}"
    )
    question_reviews: List[QuizQuestionReview]
    supportive_summary: str
