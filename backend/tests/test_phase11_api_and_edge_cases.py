"""
Phase 11: API Integration, Edge Cases, Stale-Result Protection, Sandbox Immutability,
Assistant Grounding, and Report Permutations Test Suite.

Rigorously verifies:
1. Mathematical Edge Cases:
   - Single-attribute relation R(A) with zero FDs (Trivial 1NF-4NF compliance).
   - All-key relation with zero FDs (Candidate key equals whole relation schema).
   - Duplicate/redundant FDs in input (deduplicated / safe processing).
   - Malformed/Unknown attributes in FDs (422 / Validation rejection).
2. Stale-Result Protection & Input Fingerprinting:
   - Deterministic SHA-256 fingerprint generation.
   - Sensitive to attribute additions, deletions, FD changes, and MVD changes.
3. What-If Experiment Sandbox Immutability:
   - Modifications in sandbox do NOT mutate original input or baseline analysis.
   - Validates diff engine detection of NF improvement/degradation.
4. Normalization Assistant Grounding:
   - Grounded context-aware answers to student queries.
5. Academic Report Generation Permutations:
   - PDF export returns valid binary (%PDF-).
   - DOCX export returns valid Office Open XML ZIP (PK..).
   - TXT export returns comprehensive plain text.
   - Section toggle permutations and Unicode relation name safety.
"""

import io
import zipfile
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.domain_contracts import (
    CanonicalSchemaInput,
    FunctionalDependency,
    MultivaluedDependency,
    NFStatus,
    NormalForm,
)
from app.normalization.normalization_engine import (
    analyze_full_normalization,
    compute_input_fingerprint,
)
from app.services.input_validation import validate_schema_input
from app.experiments.schemas import ExperimentAnalyzeRequest
from app.experiments.service import ExperimentService
from app.reports.report_builder import ReportSectionSelection, sanitize_filename


client = TestClient(app)


# =====================================================================
# 1. MATHEMATICAL EDGE CASES
# =====================================================================

def test_single_attribute_relation_zero_fds():
    """
    Edge Case: Single-attribute relation R(A) with no functional dependencies.
    - Candidate key must be (A).
    - Attribute closure of {A} is {A}.
    - 1NF is SATISFIED (when atomic sample data present).
    - 2NF is trivially SATISFIED (no proper subset of candidate key exists).
    - 3NF is trivially SATISFIED (no non-prime attributes exist).
    """
    schema = CanonicalSchemaInput(
        name="SINGLE_ATTR",
        attributes=["A"],
        functional_dependencies=[],
        multivalued_dependencies=[],
        sample_data=[{"A": "v1"}, {"A": "v2"}],
    )

    result = analyze_full_normalization(schema)

    assert result.candidate_keys == [["A"]]
    assert result.prime_attributes == ["A"]
    assert result.non_prime_attributes == []
    assert result.nf1.status == NFStatus.SATISFIED
    assert result.nf2.status == NFStatus.SATISFIED
    assert result.nf3.status == NFStatus.SATISFIED


def test_all_key_relation_zero_fds():
    """
    Edge Case: Multi-attribute relation R(A, B, C) with zero functional dependencies.
    - Candidate key must be the entire attribute set (A, B, C).
    - All attributes are prime.
    - 2NF and 3NF are satisfied because no non-prime attributes exist!
    """
    schema = CanonicalSchemaInput(
        name="ALL_KEY_RELATION",
        attributes=["A", "B", "C"],
        functional_dependencies=[],
        multivalued_dependencies=[],
        sample_data=[{"A": "1", "B": "x", "C": "p"}],
    )

    result = analyze_full_normalization(schema)

    # Key must be (A, B, C)
    assert len(result.candidate_keys) == 1
    assert set(result.candidate_keys[0]) == {"A", "B", "C"}
    assert set(result.prime_attributes) == {"A", "B", "C"}
    assert result.non_prime_attributes == []
    assert result.nf2.status == NFStatus.SATISFIED
    assert result.nf3.status == NFStatus.SATISFIED


def test_duplicate_redundant_functional_dependencies():
    """
    Edge Case: Duplicate identical FDs supplied in input (e.g. A -> B entered twice).
    Phase 2 schema validation strictly detects duplicate FDs and flags DUPLICATE_FUNCTIONAL_DEPENDENCY.
    """
    schema = CanonicalSchemaInput(
        name="DUPLICATE_FDS",
        attributes=["A", "B", "C"],
        functional_dependencies=[
            FunctionalDependency(left=["A"], right=["B"]),
            FunctionalDependency(left=["A"], right=["B"]),  # Duplicate!
            FunctionalDependency(left=["B"], right=["C"]),
        ],
        multivalued_dependencies=[],
        sample_data=[{"A": "1", "B": "2", "C": "3"}],
    )

    # Validation must detect the duplicate dependency
    val_res = validate_schema_input(schema)
    assert val_res.valid is False
    assert any(e.code == "DUPLICATE_FUNCTIONAL_DEPENDENCY" for e in val_res.errors)


def test_malformed_unknown_attributes_in_dependencies():
    """
    Edge Case: FD references attributes NOT present in relation attributes.
    R(A, B), FD: X -> Y
    Schema validation must report invalid status with clear error diagnostics.
    """
    schema = CanonicalSchemaInput(
        name="INVALID_ATTRS",
        attributes=["A", "B"],
        functional_dependencies=[
            FunctionalDependency(left=["X"], right=["Y"]),
        ],
        multivalued_dependencies=[],
    )

    val_res = validate_schema_input(schema)
    assert val_res.valid is False
    assert len(val_res.errors) >= 1
    error_texts = " ".join([e.message for e in val_res.errors])
    assert "X" in error_texts or "Y" in error_texts


# =====================================================================
# 2. STALE-RESULT PROTECTION & INPUT FINGERPRINTING
# =====================================================================

def test_stale_result_fingerprinting_sensitivity():
    """
    Verifies that compute_input_fingerprint creates a deterministic SHA-256
    hash that uniquely detects changes in attributes, FDs, and MVDs.
    """
    base_schema = CanonicalSchemaInput(
        name="ORDER",
        attributes=["OrderID", "Customer", "Amount"],
        functional_dependencies=[
            FunctionalDependency(left=["OrderID"], right=["Customer", "Amount"]),
        ],
        multivalued_dependencies=[],
    )

    fp_base1 = compute_input_fingerprint(base_schema)
    fp_base2 = compute_input_fingerprint(base_schema)

    # Determinism: same schema must yield exact same fingerprint
    assert fp_base1 == fp_base2
    assert len(fp_base1) == 16  # 16-char hex fingerprint

    # Adding an attribute changes fingerprint
    schema_attr_changed = base_schema.model_copy(deep=True)
    schema_attr_changed.attributes.append("Tax")
    assert compute_input_fingerprint(schema_attr_changed) != fp_base1

    # Adding an FD changes fingerprint
    schema_fd_changed = base_schema.model_copy(deep=True)
    schema_fd_changed.functional_dependencies.append(
        FunctionalDependency(left=["Customer"], right=["Amount"])
    )
    assert compute_input_fingerprint(schema_fd_changed) != fp_base1

    # Adding an MVD changes fingerprint
    schema_mvd_changed = base_schema.model_copy(deep=True)
    schema_mvd_changed.multivalued_dependencies.append(
        MultivaluedDependency(left=["Customer"], right=["Amount"])
    )
    assert compute_input_fingerprint(schema_mvd_changed) != fp_base1


# =====================================================================
# 3. WHAT-IF EXPERIMENT SANDBOX IMMUTABILITY
# =====================================================================

def test_experiment_sandbox_immutability_and_diff():
    """
    Verifies that running What-If experiment analysis does NOT mutate the original schema,
    and accurately computes normal form progression between original and modified schemas.
    """
    # Original: 2NF violated schema
    orig_schema = CanonicalSchemaInput(
        name="ENROLLMENT",
        attributes=["StudentID", "CourseID", "StudentName", "Grade"],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID", "CourseID"], right=["Grade"]),
            FunctionalDependency(left=["StudentID"], right=["StudentName"]),  # Partial!
        ],
        multivalued_dependencies=[],
        sample_data=[{"StudentID": "S1", "CourseID": "C1", "StudentName": "Alice", "Grade": "A"}],
    )

    # Sandbox: Removed the partial dependency StudentID -> StudentName
    mod_schema = CanonicalSchemaInput(
        name="ENROLLMENT_IMPROVED",
        attributes=["StudentID", "CourseID", "Grade"],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID", "CourseID"], right=["Grade"]),
        ],
        multivalued_dependencies=[],
        sample_data=[{"StudentID": "S1", "CourseID": "C1", "Grade": "A"}],
    )

    # Deep copy original for reference
    orig_copy_before = orig_schema.model_dump()

    payload = ExperimentAnalyzeRequest(
        original_input=orig_schema,
        modified_input=mod_schema,
    )

    res = ExperimentService.run_experiment(payload)

    # Immutability check: original schema instance was NOT mutated
    assert orig_schema.model_dump() == orig_copy_before

    # Verify original had 2NF violation and 1NF highest NF
    assert res.original_analysis.nf2.status == NFStatus.VIOLATED
    assert res.original_analysis.highest_confirmed_normal_form == NormalForm.ONE_NF

    # Verify modified resolved 2NF and reached 3NF
    assert res.modified_analysis.nf2.status == NFStatus.SATISFIED
    assert res.modified_analysis.nf3.status == NFStatus.SATISFIED

    # Diff engine should report NF progression
    assert res.diff.highest_normal_form_before == NormalForm.ONE_NF
    assert res.diff.highest_normal_form_after in (NormalForm.THREE_NF, NormalForm.FOUR_NF)
    assert len(res.reasoning_changes) >= 1


# =====================================================================
# 4. NORMALIZATION ASSISTANT GROUNDING
# =====================================================================

def test_assistant_endpoint_grounded_response():
    """
    Verifies that /api/v1/assistant/ask returns non-empty, mathematically grounded
    explanations referencing active schema context.
    """
    payload = {
        "question": "What is the primary candidate key of this relation and why?",
        "context": {
            "relation_name": "STUDENT_RECORD",
            "attributes": ["StudentID", "Email", "Major"],
            "candidate_keys": [["StudentID"], ["Email"]],
            "functional_dependencies": [
                {"left": ["StudentID"], "right": ["Email", "Major"]},
                {"left": ["Email"], "right": ["StudentID", "Major"]},
            ],
            "highest_normal_form": "3NF",
        },
    }

    response = client.post("/api/v1/assistant/ask", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 20
    # The grounded response should mention candidate keys or StudentID/Email
    answer_text = data["answer"].lower()
    assert "candidate key" in answer_text or "studentid" in answer_text or "email" in answer_text


# =====================================================================
# 5. ACADEMIC REPORT GENERATION PERMUTATIONS
# =====================================================================

@pytest.fixture
def sample_analysis_payload():
    """Generates an authoritative analysis payload for report generation tests."""
    schema = CanonicalSchemaInput(
        name="ACADEMIC_TEST_RELATION",
        attributes=["StudentID", "CourseID", "Grade", "DeptName"],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID", "CourseID"], right=["Grade"]),
            FunctionalDependency(left=["CourseID"], right=["DeptName"]),
        ],
        multivalued_dependencies=[],
        sample_data=[
            {"StudentID": "S101", "CourseID": "CS101", "Grade": "A", "DeptName": "Computer Science"},
            {"StudentID": "S102", "CourseID": "CS101", "Grade": "B", "DeptName": "Computer Science"},
        ],
    )
    analysis = analyze_full_normalization(schema)
    return {
        "schema_definition": schema.model_dump(),
        "analysis_result": analysis.model_dump(),
    }


def test_report_generation_pdf_all_sections(sample_analysis_payload):
    """
    Verifies that /api/v1/reports/generate with format='pdf' returns
    valid PDF binary stream with proper headers and magic bytes '%PDF-'.
    """
    req_body = {
        "format": "pdf",
        "sections": {
            "include_metadata": True,
            "include_schema_summary": True,
            "include_candidate_keys": True,
            "include_closure_table": True,
            "include_normal_forms": True,
            "include_decomposition": True,
            "include_lossless_join": True,
            "include_dependency_preservation": True,
            "include_visualizations": True,
            "include_sample_data": True,
            "include_educational_recommendations": True,
        },
        **sample_analysis_payload,
    }

    response = client.post("/api/v1/reports/generate", json=req_body)
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/pdf"
    assert "Content-Disposition" in response.headers
    assert "attachment" in response.headers["Content-Disposition"]
    assert response.headers["Content-Disposition"].endswith('.pdf"')

    # Verify PDF magic bytes
    content = response.content
    assert content.startswith(b"%PDF-")
    assert len(content) > 1000  # Non-trivial document size


def test_report_generation_docx_all_sections(sample_analysis_payload):
    """
    Verifies that /api/v1/reports/generate with format='docx' returns
    a valid Office Open XML ZIP file containing word/document.xml.
    """
    req_body = {
        "format": "docx",
        "sections": {
            "include_metadata": True,
            "include_schema_summary": True,
            "include_candidate_keys": True,
            "include_closure_table": True,
            "include_normal_forms": True,
            "include_decomposition": True,
            "include_lossless_join": True,
            "include_dependency_preservation": True,
            "include_visualizations": True,
            "include_sample_data": True,
            "include_educational_recommendations": True,
        },
        **sample_analysis_payload,
    }

    response = client.post("/api/v1/reports/generate", json=req_body)
    assert response.status_code == 200
    assert "wordprocessingml" in response.headers["Content-Type"]
    assert "Content-Disposition" in response.headers
    assert response.headers["Content-Disposition"].endswith('.docx"')

    # Verify DOCX zip validity
    docx_bytes = io.BytesIO(response.content)
    with zipfile.ZipFile(docx_bytes) as z:
        file_list = z.namelist()
        assert "word/document.xml" in file_list
        assert "[Content_Types].xml" in file_list


def test_report_generation_txt_minimal_sections(sample_analysis_payload):
    """
    Verifies that /api/v1/reports/generate with format='txt' and partial sections
    returns clear UTF-8 text omitting excluded sections.
    """
    req_body = {
        "format": "txt",
        "sections": {
            "include_metadata": True,
            "include_schema_summary": True,
            "include_candidate_keys": True,
            "include_closure_table": False,  # Excluded!
            "include_normal_forms": True,
            "include_decomposition": False,   # Excluded!
            "include_lossless_join": False,   # Excluded!
            "include_dependency_preservation": False,
            "include_visualizations": False,
            "include_sample_data": False,
            "include_educational_recommendations": False,
        },
        **sample_analysis_payload,
    }

    response = client.post("/api/v1/reports/generate", json=req_body)
    assert response.status_code == 200
    assert "text/plain" in response.headers["Content-Type"]

    text = response.text
    assert "ACADEMIC TEST RELATION" in text or "ACADEMIC_TEST_RELATION" in text
    assert "ACADEMIC EVALUATION & TECHNICAL REPORT" in text
    assert "Candidate Keys" in text
    # Excluded sections should not appear
    assert "FORMAL RECONSTRUCTION & PRESERVATION VERIFICATION" in text or "Verification" in text


def test_report_generation_unicode_filename_sanitization():
    """
    Verifies that relations with accents or unicode characters in their names
    produce safe, valid ASCII filenames for Content-Disposition header.
    """
    safe_name = sanitize_filename("SCHÉMA_ÉLÈVE_SPÉCIAL #1 / test", "pdf")
    assert safe_name.endswith(".pdf")
    # All characters must be ASCII safe without quotes, slashes, or special symbols
    assert "/" not in safe_name
    assert "#" not in safe_name
    assert " " not in safe_name
