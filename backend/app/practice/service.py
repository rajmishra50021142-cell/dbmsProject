"""
Practice Mode Service for Normalization Lab.

Provides predefined academic normalization exercises and grades student submissions
using the actual relational normalization engines from Phases 2–7.
"""

import random
import re
from typing import List, Dict, Any, Optional
from app.practice.schemas import (
    PracticeExercise,
    PracticeVerifyRequest,
    PracticeVerifyResponse,
    QuizQuestion,
    QuizConfig,
    VerifyAttemptRequest,
    GentleFeedbackResponse,
    QuizSubmissionRequest,
    QuizQuestionReview,
    QuizSubmissionResponse,
)
from app.practice.ai_questions import AI_PRACTICE_QUESTIONS
from app.practice.pyq_questions import PYQ_QUESTIONS
from app.schemas.domain_contracts import (
    CanonicalSchemaInput,
    FunctionalDependency,
    MultivaluedDependency,
)
from app.normalization.closure_engine import compute_attribute_closure
from app.normalization.candidate_key_engine import find_all_candidate_keys, check_is_superkey
from app.normalization.normalization_engine import analyze_full_normalization
from app.normalization.attribute_set import normalize_attribute_set, set_equals


PREDEFINED_EXERCISES: List[PracticeExercise] = [
    # 1. Candidate Key
    PracticeExercise(
        id="ex-ck-enrollment",
        type="candidate-key",
        title="Candidate Key in Student Enrollment",
        prompt="Given relation ENROLLMENT(StudentID, CourseID, StudentName, CourseTitle, Grade) with FDs: StudentID → StudentName, CourseID → CourseTitle. What is the candidate key?",
        schema_name="ENROLLMENT",
        attributes=["StudentID", "CourseID", "StudentName", "CourseTitle", "Grade"],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID"], right=["StudentName"]),
            FunctionalDependency(left=["CourseID"], right=["CourseTitle"]),
        ],
        options=[
            "StudentID",
            "StudentID, CourseID",
            "CourseID, Grade",
            "StudentID, CourseID, Grade",
        ],
        hint="Grade does not appear on any RHS. What must every superkey contain?",
    ),
    # 2. Attribute Closure
    PracticeExercise(
        id="ex-closure-basic",
        type="closure",
        title="Attribute Closure Derivation",
        prompt="Given relation R(A, B, C, D, E) and FDs: A → B, BC → D, D → E. Calculate the attribute closure {A, C}⁺.",
        schema_name="R",
        attributes=["A", "B", "C", "D", "E"],
        functional_dependencies=[
            FunctionalDependency(left=["A"], right=["B"]),
            FunctionalDependency(left=["B", "C"], right=["D"]),
            FunctionalDependency(left=["D"], right=["E"]),
        ],
        target_attributes=["A", "C"],
        options=[
            "A, B, C",
            "A, B, C, D",
            "A, B, C, D, E",
            "A, C, D",
        ],
        hint="Start with {A, C}. Which dependencies can fire first using attributes already in the closure?",
    ),
    # 3. 2NF Partial Dependency Violation
    PracticeExercise(
        id="ex-hnf-employee",
        type="highest-normal-form",
        title="Highest Normal Form for Project Assignments",
        prompt="Given EMP_PROJ(EmpID, ProjID, EmpName, Hours) with key {EmpID, ProjID} and FD: EmpID → EmpName. What is the highest confirmed normal form of this relation?",
        schema_name="EMP_PROJ",
        attributes=["EmpID", "ProjID", "EmpName", "Hours"],
        functional_dependencies=[
            FunctionalDependency(left=["EmpID"], right=["EmpName"]),
        ],
        options=["1NF", "2NF", "3NF", "4NF"],
        hint="EmpName depends on only EmpID, which is a proper subset of composite candidate key {EmpID, ProjID}.",
    ),
    # 4. 3NF Transitive Dependency Violation
    PracticeExercise(
        id="ex-violation-course",
        type="nf-violation",
        title="3NF Transitive Dependency Identification",
        prompt="Given COURSE_OFFERING(CourseID, Instructor, Department) with candidate key {CourseID} and FDs: CourseID → Instructor, Instructor → Department. Which dependency directly violates 3NF?",
        schema_name="COURSE_OFFERING",
        attributes=["CourseID", "Instructor", "Department"],
        functional_dependencies=[
            FunctionalDependency(left=["CourseID"], right=["Instructor"]),
            FunctionalDependency(left=["Instructor"], right=["Department"]),
        ],
        options=[
            "CourseID → Instructor",
            "Instructor → Department",
            "CourseID → Department",
        ],
        hint="In 3NF, for every X → A, X must be a superkey or A must be prime. Is Instructor a superkey?",
    ),
    # 5. 4NF Multivalued Dependency Analysis
    PracticeExercise(
        id="ex-mvd-restaurant",
        type="mvd-analysis",
        title="4NF Multivalued Dependency Analysis",
        prompt="Given RESTAURANT(Restaurant, Dish, DeliveryArea) with MVDs: Restaurant ↠ Dish, Restaurant ↠ DeliveryArea. Candidate key is all attributes. What is the highest confirmed normal form?",
        schema_name="RESTAURANT",
        attributes=["Restaurant", "Dish", "DeliveryArea"],
        functional_dependencies=[],
        multivalued_dependencies=[
            MultivaluedDependency(left=["Restaurant"], right=["Dish"]),
            MultivaluedDependency(left=["Restaurant"], right=["DeliveryArea"]),
        ],
        options=["1NF", "2NF", "3NF", "4NF"],
        hint="The MVDs are non-trivial, but the determinant {Restaurant} is NOT a superkey of the all-key relation.",
    ),
    # 6. Multiple Candidate Keys (Vehicle Registration)
    PracticeExercise(
        id="ex-ck-vehicle",
        type="candidate-key",
        title="Multiple Candidate Keys in Vehicle Registry",
        prompt="Given VEHICLE(VIN, LicensePlate, Make, Model, OwnerSSN) where VIN uniquely identifies all attributes and LicensePlate uniquely identifies all attributes. Which of the following is a minimal candidate key?",
        schema_name="VEHICLE",
        attributes=["VIN", "LicensePlate", "Make", "Model", "OwnerSSN"],
        functional_dependencies=[
            FunctionalDependency(left=["VIN"], right=["LicensePlate", "Make", "Model", "OwnerSSN"]),
            FunctionalDependency(left=["LicensePlate"], right=["VIN", "Make", "Model", "OwnerSSN"]),
        ],
        options=[
            "VIN",
            "VIN, LicensePlate",
            "Make, Model",
            "OwnerSSN",
        ],
        hint="Both VIN and LicensePlate are individual candidate keys. Either one is a valid minimal candidate key.",
    ),
    # 7. Multi-Attribute Composite Candidate Key (Flight Booking)
    PracticeExercise(
        id="ex-ck-flight",
        type="candidate-key",
        title="Composite Candidate Key in Flight Reservations",
        prompt="Given FLIGHT_BOOKING(FlightNo, FlightDate, SeatNo, PassengerName, Gate) with FDs: {FlightNo, FlightDate} → Gate, and {FlightNo, FlightDate, SeatNo} → PassengerName. What is the minimal candidate key?",
        schema_name="FLIGHT_BOOKING",
        attributes=["FlightNo", "FlightDate", "SeatNo", "PassengerName", "Gate"],
        functional_dependencies=[
            FunctionalDependency(left=["FlightNo", "FlightDate"], right=["Gate"]),
            FunctionalDependency(left=["FlightNo", "FlightDate", "SeatNo"], right=["PassengerName"]),
        ],
        options=[
            "FlightNo, FlightDate",
            "FlightNo, SeatNo",
            "FlightNo, FlightDate, SeatNo",
            "FlightNo, FlightDate, SeatNo, Gate",
        ],
        hint="A seat can have different passengers on different dates, and a flight has multiple seats. What minimal set of attributes determines every attribute?",
    ),
    # 8. Multi-Step Cascading Attribute Closure
    PracticeExercise(
        id="ex-closure-cascade",
        type="closure",
        title="Cascading Functional Dependency Closure",
        prompt="Given relation R(A, B, C, D, E, F) and FDs: A → B, BC → D, D → E, CE → F. Compute the attribute closure {A, C}⁺.",
        schema_name="R",
        attributes=["A", "B", "C", "D", "E", "F"],
        functional_dependencies=[
            FunctionalDependency(left=["A"], right=["B"]),
            FunctionalDependency(left=["B", "C"], right=["D"]),
            FunctionalDependency(left=["D"], right=["E"]),
            FunctionalDependency(left=["C", "E"], right=["F"]),
        ],
        target_attributes=["A", "C"],
        options=[
            "A, B, C, D",
            "A, B, C, D, E",
            "A, B, C, D, E, F",
            "A, C, E, F",
        ],
        hint="Follow the cascade: {A, C} derives B via A → B, then BC derives D, D derives E, and CE derives F.",
    ),
    # 9. 2NF Partial Dependency Identification in Orders
    PracticeExercise(
        id="ex-violation-order",
        type="nf-violation",
        title="2NF Partial Dependency Identification",
        prompt="Given ORDER_LINE(OrderID, ProductID, OrderDate, Quantity) with candidate key {OrderID, ProductID} and FDs: OrderID → OrderDate, and {OrderID, ProductID} → Quantity. Which dependency violates Second Normal Form (2NF)?",
        schema_name="ORDER_LINE",
        attributes=["OrderID", "ProductID", "OrderDate", "Quantity"],
        functional_dependencies=[
            FunctionalDependency(left=["OrderID"], right=["OrderDate"]),
            FunctionalDependency(left=["OrderID", "ProductID"], right=["Quantity"]),
        ],
        options=[
            "OrderID → OrderDate",
            "OrderID, ProductID → Quantity",
            "OrderID → ProductID",
            "OrderDate → Quantity",
        ],
        hint="In 2NF, no non-prime attribute (like OrderDate) may depend on a proper subset of any composite candidate key.",
    ),
    # 10. Highest Normal Form for Property & Tax Rates
    PracticeExercise(
        id="ex-hnf-property",
        type="highest-normal-form",
        title="Transitive Dependency & Highest Normal Form",
        prompt="Given PROPERTY_TAX(PropertyID, CountyName, TaxRate) with candidate key {PropertyID} and FDs: PropertyID → CountyName, CountyName → TaxRate. What is the highest confirmed normal form?",
        schema_name="PROPERTY_TAX",
        attributes=["PropertyID", "CountyName", "TaxRate"],
        functional_dependencies=[
            FunctionalDependency(left=["PropertyID"], right=["CountyName"]),
            FunctionalDependency(left=["CountyName"], right=["TaxRate"]),
        ],
        options=["1NF", "2NF", "3NF", "4NF"],
        hint="Because CountyName → TaxRate is a transitive dependency between non-prime attributes and CountyName is not a superkey, 3NF is violated. But 2NF holds because the key is a single attribute.",
    ),
]


class PracticeService:
    """Provides exercises and grades user answers using real normalization engines."""

    @classmethod
    def get_exercises(cls) -> List[PracticeExercise]:
        return PREDEFINED_EXERCISES

    @classmethod
    def verify_answer(cls, req: PracticeVerifyRequest) -> PracticeVerifyResponse:
        # Grade using actual relational normalization algorithms
        # Provide synthetic atomic sample data so cell atomicity passes and theoretical 1NF-4NF evaluation proceeds
        dummy_sample = [{a: f"val_{a}" for a in req.attributes}]
        schema_input = CanonicalSchemaInput(
            name="PRACTICE_R",
            attributes=req.attributes,
            functional_dependencies=req.functional_dependencies,
            multivalued_dependencies=req.multivalued_dependencies,
            sample_data=dummy_sample,
        )

        user_ans = str(req.submitted_answer).strip()

        # 1. Candidate Key Exercise
        if req.exercise_type == "candidate-key":
            key_res = find_all_candidate_keys(req.attributes, req.functional_dependencies)
            expected_keys = [", ".join(k) for k in key_res.candidate_keys]
            user_tokens = normalize_attribute_set([t.strip() for t in user_ans.replace("{", "").replace("}", "").split(",") if t.strip()])
            
            is_correct = any(set_equals(user_tokens, k) for k in key_res.candidate_keys)
            expected_repr = " OR ".join(f"{{{k}}}" for k in expected_keys)
            
            steps = [f"Step {s.step_number}: {s.title} - {s.description}" for s in key_res.reasoning_steps]
            feedback = (
                f"Correct! {{{', '.join(user_tokens)}}} is a minimal candidate key."
                if is_correct
                else f"Incorrect. The valid candidate key(s) are: {expected_repr}."
            )
            return PracticeVerifyResponse(
                is_correct=is_correct,
                expected_answer=expected_repr,
                feedback=feedback,
                reasoning_steps=steps,
            )

        # 2. Attribute Closure Exercise
        if req.exercise_type == "closure":
            target = req.metadata.get("target_attributes") if req.metadata else ["A", "C"]
            closure_res = compute_attribute_closure(
                attributes=req.attributes,
                fds=req.functional_dependencies,
                target_attributes=target,
            )
            expected_closure = normalize_attribute_set(closure_res.closure_attributes)
            user_tokens = normalize_attribute_set([t.strip() for t in user_ans.replace("{", "").replace("}", "").split(",") if t.strip()])
            
            is_correct = set_equals(user_tokens, expected_closure)
            steps = [s.explanation for s in closure_res.steps]
            expected_str = f"{{{', '.join(expected_closure)}}}"
            feedback = (
                f"Correct! {{{', '.join(target)}}}⁺ = {expected_str}."
                if is_correct
                else f"Incorrect. The calculated closure is {expected_str}."
            )
            return PracticeVerifyResponse(
                is_correct=is_correct,
                expected_answer=expected_str,
                feedback=feedback,
                reasoning_steps=steps,
            )

        # 3. Highest Normal Form
        if req.exercise_type in ["highest-normal-form", "mvd-analysis"]:
            norm_res = analyze_full_normalization(schema_input)
            expected_nf = norm_res.highest_confirmed_normal_form.value
            is_correct = user_ans.upper() == expected_nf.upper()
            
            reasoning = []
            if norm_res.nf1.violations:
                reasoning.append("1NF failed due to non-atomic attributes or repeating groups.")
            if norm_res.nf2.partial_dependencies:
                p = norm_res.nf2.partial_dependencies[0]
                reasoning.append(f"2NF violated by partial dependency: {', '.join(p.determinant)} → {', '.join(p.dependent_attributes)}.")
            if norm_res.nf3.violations:
                v = norm_res.nf3.violations[0]
                reasoning.append(f"3NF violated by transitive dependency: {v.functional_dependency.notation()}.")
            if norm_res.nf4.violations:
                m = norm_res.nf4.violations[0]
                reasoning.append(f"4NF violated by non-superkey MVD: {m.mvd.notation()}.")
            if not reasoning:
                reasoning.append("All normal form criteria satisfied up to 4NF.")

            feedback = (
                f"Correct! The relation is in {expected_nf}."
                if is_correct
                else f"Incorrect. The highest confirmed normal form is {expected_nf}."
            )
            return PracticeVerifyResponse(
                is_correct=is_correct,
                expected_answer=expected_nf,
                feedback=feedback,
                reasoning_steps=reasoning,
            )

        # 4. NF Violation Identification
        if req.exercise_type == "nf-violation":
            norm_res = analyze_full_normalization(schema_input)
            expected_violating_deps = []
            for p in norm_res.nf2.partial_dependencies:
                expected_violating_deps.append(f"{', '.join(p.determinant)} → {', '.join(p.dependent_attributes)}")
                if p.source_fd:
                    expected_violating_deps.append(p.source_fd)
            for v in norm_res.nf3.violations:
                expected_violating_deps.append(v.functional_dependency.notation())
            for m in norm_res.nf4.violations:
                expected_violating_deps.append(m.mvd.notation())

            clean_user = user_ans.replace("->", "→").replace(" ", "").upper()
            is_correct = any(clean_user == dep.replace("->", "→").replace(" ", "").upper() for dep in expected_violating_deps)
            # Pick a clean representation for display
            display_list = list(dict.fromkeys(expected_violating_deps))
            expected_str = ", ".join(display_list) if display_list else "None"
            
            feedback = (
                f"Correct! `{user_ans}` is the violating dependency."
                if is_correct
                else f"Incorrect. The violating dependency is: `{expected_str}`."
            )
            return PracticeVerifyResponse(
                is_correct=is_correct,
                expected_answer=expected_str,
                feedback=feedback,
                reasoning_steps=[f"Detected violation: {dep}" for dep in display_list],
            )

        return PracticeVerifyResponse(
            is_correct=False,
            expected_answer="Unknown",
            feedback="Exercise type not recognized.",
            reasoning_steps=[],
        )

    @staticmethod
    def get_ai_questions(
        topic: Optional[str] = None,
        difficulty: Optional[str] = None,
        count: Optional[int] = None,
    ) -> List[QuizQuestion]:
        """Fetch AI practice questions filtered by optional topic or difficulty."""
        results = AI_PRACTICE_QUESTIONS
        if topic and topic.strip():
            results = [q for q in results if q.topic.lower() == topic.strip().lower()]
        if difficulty and difficulty.strip():
            results = [q for q in results if q.difficulty.lower() == difficulty.strip().lower()]
        if count is not None and count > 0:
            results = results[:count]
        return results

    @staticmethod
    def get_pyq_questions(
        exam: Optional[str] = None,
        topic: Optional[str] = None,
        playable_only: bool = False,
        count: Optional[int] = None,
        randomize: bool = False,
    ) -> List[QuizQuestion]:
        """Fetch Competitive Exam PYQs with authentic GATE CSE selection rules."""
        pool = PYQ_QUESTIONS
        if playable_only:
            pool = [q for q in pool if q.is_playable]
        if exam and exam.strip() and exam.strip().lower() != 'all':
            pool = [q for q in pool if q.exam and q.exam.lower() == exam.strip().lower()]

        is_mixed = not topic or topic.strip().lower() in ['all', 'mixed', 'mixed gate dbms quiz']

        if is_mixed:
            if not randomize and (count is None or count >= len(pool)):
                return pool[:count] if count else pool

            # Mixed selection:
            # 1. First 4-5 questions from Functional Dependencies & Normalization (randomized)
            fd_pool = [q for q in pool if 'functional' in q.topic.lower() or 'normalization' in q.topic.lower()]
            target_count = count if count and count > 0 else len(pool)
            fd_target = min(5, min(len(fd_pool), target_count))
            if target_count < 5:
                fd_target = min(len(fd_pool), target_count)

            selected_fd = random.sample(fd_pool, fd_target) if len(fd_pool) >= fd_target else list(fd_pool)
            remaining_needed = target_count - len(selected_fd)

            # Remaining from other categories + remaining FD
            remaining_pool = [q for q in pool if q not in selected_fd]
            selected_rest = random.sample(remaining_pool, min(remaining_needed, len(remaining_pool))) if remaining_needed > 0 else []

            return selected_fd + selected_rest
        else:
            # Topic-specific selection (100% from that category)
            filtered = [q for q in pool if topic.strip().lower() in q.topic.lower() or q.topic.lower() in topic.strip().lower()]
            if not filtered:
                filtered = [q for q in pool if q.topic.strip().lower() == topic.strip().lower()]

            if randomize:
                sample_count = min(count, len(filtered)) if count else len(filtered)
                return random.sample(filtered, sample_count)
            if count is not None and count > 0:
                return filtered[:count]
            return filtered

    @staticmethod
    def get_question_by_id(question_id: str, bank_type: Optional[str] = None) -> Optional[QuizQuestion]:
        """Find a question by ID across or within banks."""
        if bank_type == "ai":
            for q in AI_PRACTICE_QUESTIONS:
                if q.id == question_id:
                    return q
            return None
        elif bank_type == "pyq":
            for q in PYQ_QUESTIONS:
                if q.id == question_id:
                    return q
            return None
        # Search all
        for q in AI_PRACTICE_QUESTIONS:
            if q.id == question_id:
                return q
        for q in PYQ_QUESTIONS:
            if q.id == question_id:
                return q
        return None

    @staticmethod
    def check_answer_correctness(q: QuizQuestion, user_ans: Optional[str]) -> bool:
        """Grading logic supporting MCQ, MSQ (multiple-select), and NAT (numerical)."""
        if not user_ans or not q.correct_answer:
            return False

        user_str = user_ans.strip()
        correct_str = q.correct_answer.strip()

        # 1. Multiple-Select Question (MSQ)
        if q.question_type == "MSQ" or "," in correct_str:
            user_letters = set(re.findall(r'[A-D]', user_str.upper()))
            correct_letters = set(re.findall(r'[A-D]', correct_str.upper()))
            return user_letters == correct_letters and len(correct_letters) > 0

        # 2. Numerical Answer Question (NAT)
        if q.question_type == "NAT" or re.match(r'^-?\d+(?:\.\d+)?$', correct_str):
            clean_user = re.sub(r'[^\d.-]', '', user_str)
            try:
                val_user = float(clean_user)
                val_expected = float(correct_str)
                return abs(val_user - val_expected) < 1e-2
            except (ValueError, TypeError):
                return clean_user == correct_str

        # 3. Single-choice MCQ
        clean_u = user_str.upper()
        if len(clean_u) > 1 and clean_u[1] in [")", ".", " "]:
            user_letter = clean_u[0]
        elif clean_u in ["A", "B", "C", "D"]:
            user_letter = clean_u
        else:
            user_letter = clean_u[0] if clean_u else ""
        return user_letter == correct_str.upper()

    @staticmethod
    def verify_attempt(req: VerifyAttemptRequest) -> GentleFeedbackResponse:
        """
        Evaluate an answer attempt with gentle, non-shaming, progressive feedback.
        Attempt 1: Friendly check + Hint 1.
        Attempt 2: Encouraging prompt + Hint 2.
        Attempt 3: Warm resolution + Full proof, answer reveal, and concept summary.
        """
        q = PracticeService.get_question_by_id(req.question_id, req.bank_type)
        if not q:
            return GentleFeedbackResponse(
                is_correct=False,
                attempt_number=req.attempt_number,
                attempts_remaining=max(0, 3 - req.attempt_number),
                gentle_message="Question not found. Please refresh the practice session.",
                hint=None,
            )

        if not q.correct_answer or q.status == "incomplete":
            return GentleFeedbackResponse(
                is_correct=False,
                attempt_number=req.attempt_number,
                attempts_remaining=0,
                gentle_message=f"This question is marked as incomplete: {q.incomplete_reason or 'No verified key available.'}",
                hint=None,
            )

        is_correct = PracticeService.check_answer_correctness(q, req.selected_option)
        current_attempt = req.attempt_number
        attempts_left = max(0, 3 - current_attempt)

        if is_correct:
            if current_attempt == 1:
                message = "Outstanding! You got it right on your first attempt."
            elif current_attempt == 2:
                message = "Excellent work! Your second attempt hit the mark."
            else:
                message = "Spot on! Persistence pays off — great job solving it."

            return GentleFeedbackResponse(
                is_correct=True,
                attempt_number=current_attempt,
                attempts_remaining=attempts_left,
                gentle_message=message,
                hint=None,
                revealed_answer=q.correct_answer,
                explanation=q.explanation,
                concept_summary=f"Concept Recap: {q.topic} principles successfully verified.",
            )

        # Incorrect answers
        if current_attempt == 1:
            hint1 = q.hints[0] if (q.hints and len(q.hints) > 0) else "Review the relation schema and candidate key definition."
            return GentleFeedbackResponse(
                is_correct=False,
                attempt_number=1,
                attempts_remaining=2,
                gentle_message="Not quite yet, but you're on the right track! Take another look at the rules.",
                hint=hint1,
                revealed_answer=None,
                explanation=None,
                concept_summary=None,
            )
        elif current_attempt == 2:
            hint2 = q.hints[1] if (q.hints and len(q.hints) > 1) else (q.hints[0] if q.hints else "Consider the relational schema constraints carefully.")
            return GentleFeedbackResponse(
                is_correct=False,
                attempt_number=2,
                attempts_remaining=1,
                gentle_message="Close, but still not quite right. Analyze the problem carefully with this extra hint.",
                hint=hint2,
                revealed_answer=None,
                explanation=None,
                concept_summary=None,
            )
        else:
            return GentleFeedbackResponse(
                is_correct=False,
                attempt_number=3,
                attempts_remaining=0,
                gentle_message="Good effort! Competitive exam questions can be challenging. Here is the verified answer and explanation.",
                hint=None,
                revealed_answer=q.correct_answer,
                explanation=q.explanation,
                concept_summary=f"Mastery Takeaway: For questions on {q.topic}, always determine candidate keys or schema definitions first and verify each condition step-by-step.",
            )

    @staticmethod
    def submit_quiz(req: QuizSubmissionRequest) -> QuizSubmissionResponse:
        """
        Grade a full quiz submission session, computing overall score,
        per-question reviews, topic breakdown, and supportive guidance.
        """
        bank = AI_PRACTICE_QUESTIONS if req.bank_type == "ai" else PYQ_QUESTIONS
        q_map = {q.id: q for q in bank}

        target_ids = list(req.answers.keys()) if req.answers else [q.id for q in bank if q.is_playable]

        total_questions = len(target_ids)
        answered_count = 0
        correct_count = 0
        incorrect_count = 0
        unanswered_count = 0

        topic_stats: Dict[str, Dict[str, int]] = {}
        reviews: List[QuizQuestionReview] = []

        for q_id in target_ids:
            q = q_map.get(q_id)
            if not q:
                continue

            user_ans = req.answers.get(q_id)
            has_answered = bool(user_ans and user_ans.strip())

            if has_answered:
                answered_count += 1
            else:
                unanswered_count += 1

            is_corr = PracticeService.check_answer_correctness(q, user_ans) if has_answered else False

            if has_answered:
                if is_corr:
                    correct_count += 1
                else:
                    incorrect_count += 1

            topic = q.topic or "Relational DBMS"
            if topic not in topic_stats:
                topic_stats[topic] = {"total": 0, "correct": 0}
            topic_stats[topic]["total"] += 1
            if is_corr:
                topic_stats[topic]["correct"] += 1

            reviews.append(
                QuizQuestionReview(
                    question_id=q.id,
                    source_number=q.source_number,
                    statement=q.statement,
                    options=q.options,
                    selected_option=user_ans if has_answered else None,
                    correct_answer=q.correct_answer or "N/A",
                    is_correct=is_corr,
                    explanation=q.explanation or (q.incomplete_reason or "No explanation available."),
                    topic=q.topic,
                    exam=q.exam,
                    year=q.year,
                    note=q.note,
                )
            )

        score_pct = round((correct_count / total_questions * 100), 1) if total_questions > 0 else 0.0

        if score_pct >= 85:
            summary_msg = "Outstanding mastery! You have demonstrated exceptional command of GATE CSE Database Management System problem solving."
        elif score_pct >= 70:
            summary_msg = "Great performance! You have a solid grasp of DBMS principles. Review the few questions missed below to reach full mastery."
        elif score_pct >= 50:
            summary_msg = "Good effort! You understand the core concepts. Take time to study the step-by-step proofs for the questions you missed."
        else:
            summary_msg = "Valuable practice session! GATE questions require thorough practice with keys, queries, and constraints. Review the solutions below and try again."

        return QuizSubmissionResponse(
            total_questions=total_questions,
            answered_count=answered_count,
            correct_count=correct_count,
            incorrect_count=incorrect_count,
            unanswered_count=unanswered_count,
            score_percentage=score_pct,
            time_spent_seconds=req.time_spent_seconds,
            topic_breakdown=topic_stats,
            question_reviews=reviews,
            supportive_summary=summary_msg,
        )

    @staticmethod
    def get_summary() -> Dict[str, Any]:
        """Provides an aggregate summary of available practice banks."""
        ai_topics = sorted(list({q.topic for q in AI_PRACTICE_QUESTIONS}))
        pyq_topics = [
            "Functional Dependencies and Normalization",
            "Structured Query Language (SQL)",
            "ER Diagrams",
        ]
        pyq_exams = ["GATE CSE"]
        playable_pyq = sum(1 for q in PYQ_QUESTIONS if q.is_playable)
        incomplete_pyq = sum(1 for q in PYQ_QUESTIONS if not q.is_playable)

        return {
            "ai_practice": {
                "total_questions": len(AI_PRACTICE_QUESTIONS),
                "topics": ai_topics,
                "difficulties": ["Easy", "Medium", "Hard"],
            },
            "pyq_practice": {
                "total_questions": len(PYQ_QUESTIONS),
                "playable_questions": playable_pyq,
                "incomplete_questions": incomplete_pyq,
                "topics": pyq_topics,
                "exams": pyq_exams,
            },
        }
