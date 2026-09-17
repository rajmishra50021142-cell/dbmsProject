import pytest
from httpx import AsyncClient
from app.schemas.domain_contracts import (
    CanonicalSchemaInput,
    FunctionalDependency,
    MultivaluedDependency,
)
from app.services.input_validation import validate_schema_input


def test_valid_schema():
    schema = CanonicalSchemaInput(
        name="ENROLLMENT",
        attributes=["StudentID", "CourseID", "StudentName", "CourseName", "Grade"],
        candidate_keys=[["StudentID", "CourseID"]],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID"], right=["StudentName"]),
            FunctionalDependency(left=["CourseID"], right=["CourseName"]),
            FunctionalDependency(left=["StudentID", "CourseID"], right=["Grade"]),
        ],
        multivalued_dependencies=[],
        sample_data=[{"StudentID": "S1", "CourseID": "C1", "Grade": "A"}],
    )
    result = validate_schema_input(schema)
    assert result.valid is True
    assert len(result.errors) == 0
    assert result.canonical_input is not None
    assert result.canonical_input.name == "ENROLLMENT"
    assert result.summary.attribute_count == 5
    assert result.summary.fd_count == 3
    assert result.summary.is_ready_for_analysis is True


def test_duplicate_attribute_rejection():
    schema = CanonicalSchemaInput(
        name="STUDENT",
        attributes=["StudentID", "StudentName", "StudentID"],
        candidate_keys=[["StudentID"]],
    )
    result = validate_schema_input(schema)
    assert result.valid is False
    assert any(e.code == "DUPLICATE_ATTRIBUTE" for e in result.errors)


def test_unknown_attribute_in_candidate_key():
    schema = CanonicalSchemaInput(
        name="STUDENT",
        attributes=["StudentID", "StudentName"],
        candidate_keys=[["StudentID", "DepartmentID"]],
    )
    result = validate_schema_input(schema)
    assert result.valid is False
    assert any(e.code == "UNKNOWN_KEY_ATTRIBUTE" for e in result.errors)


def test_duplicate_candidate_keys():
    schema = CanonicalSchemaInput(
        name="STUDENT",
        attributes=["A", "B", "C"],
        candidate_keys=[["A", "B"], ["B", "A"]],
    )
    result = validate_schema_input(schema)
    assert result.valid is False
    assert any(e.code == "DUPLICATE_CANDIDATE_KEY" for e in result.errors)


def test_unknown_attribute_in_fd():
    schema = CanonicalSchemaInput(
        name="STUDENT",
        attributes=["StudentID", "StudentName"],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID"], right=["Salary"])
        ],
    )
    result = validate_schema_input(schema)
    assert result.valid is False
    assert any(e.code == "UNKNOWN_FD_ATTRIBUTE" for e in result.errors)


def test_duplicate_and_equivalent_fd():
    schema = CanonicalSchemaInput(
        name="STUDENT",
        attributes=["A", "B", "C"],
        functional_dependencies=[
            FunctionalDependency(left=["A", "B"], right=["C"]),
            FunctionalDependency(left=["B", "A"], right=["C"]),
        ],
    )
    result = validate_schema_input(schema)
    assert result.valid is False
    assert any(e.code == "DUPLICATE_FUNCTIONAL_DEPENDENCY" for e in result.errors)


def test_trivial_fd_warning():
    schema = CanonicalSchemaInput(
        name="STUDENT",
        attributes=["A", "B"],
        functional_dependencies=[
            FunctionalDependency(left=["A", "B"], right=["A"])
        ],
    )
    result = validate_schema_input(schema)
    assert result.valid is True
    assert any(w.code == "TRIVIAL_FUNCTIONAL_DEPENDENCY" for w in result.warnings)


def test_zero_candidate_keys_warning():
    schema = CanonicalSchemaInput(
        name="STUDENT",
        attributes=["StudentID", "StudentName"],
        candidate_keys=[],
        functional_dependencies=[
            FunctionalDependency(left=["StudentID"], right=["StudentName"])
        ],
    )
    result = validate_schema_input(schema)
    assert result.valid is True
    assert any(w.code == "NO_CANDIDATE_KEYS_SUPPLIED" for w in result.warnings)


@pytest.mark.anyio
async def test_api_validate_endpoint(client: AsyncClient):
    payload = {
        "name": "STUDENT",
        "attributes": ["StudentID", "StudentName"],
        "candidate_keys": [["StudentID"]],
        "functional_dependencies": [
            {"left": ["StudentID"], "right": ["StudentName"]}
        ],
        "multivalued_dependencies": [],
        "sample_data": []
    }
    response = await client.post("/api/v1/schema/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["canonical_input"]["name"] == "STUDENT"
    assert data["summary"]["is_ready_for_analysis"] is True


@pytest.mark.anyio
async def test_api_examples_endpoint(client: AsyncClient):
    response = await client.get("/api/v1/schema/examples")
    assert response.status_code == 200
    examples = response.json()
    assert len(examples) >= 5
    ids = [ex["id"] for ex in examples]
    assert "1nf-atomicity" in ids
    assert "2nf-partial-dep" in ids
    assert "3nf-transitive-dep" in ids
    assert "4nf-mvd" in ids
    assert "normalized-schema" in ids
