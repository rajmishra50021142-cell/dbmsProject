"""
Practice Mode Service for Normalization Lab.

Provides predefined academic normalization exercises and grades student submissions
using the actual relational normalization engines from Phases 2–7.
"""

from typing import List, Dict, Any
from app.practice.schemas import PracticeExercise, PracticeVerifyRequest, PracticeVerifyResponse
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
