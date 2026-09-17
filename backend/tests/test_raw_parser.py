import pytest
from httpx import AsyncClient
from app.services.raw_parser import parse_raw_schema


def test_parse_valid_raw_schema():
    raw = """
    Relation: ENROLLMENT(StudentID, CourseID, StudentName, CourseName, Grade)

    Candidate Keys:
    (StudentID, CourseID)

    FDs:
    StudentID -> StudentName
    CourseID -> CourseName
    (StudentID, CourseID) -> Grade
    """
    result = parse_raw_schema(raw)
    assert result.valid is True
    assert result.canonical_input is not None
    assert result.canonical_input.name == "ENROLLMENT"
    assert len(result.canonical_input.attributes) == 5
    assert len(result.canonical_input.functional_dependencies) == 3
    assert result.canonical_input.candidate_keys == [["StudentID", "CourseID"]]


def test_parse_mvd_syntax():
    raw = """
    Relation: RESTAURANT(Restaurant, PizzaVariety, DeliveryArea)

    Candidate Keys:
    (Restaurant, PizzaVariety, DeliveryArea)

    MVDs:
    Restaurant ->> PizzaVariety
    Restaurant ↠ DeliveryArea
    """
    result = parse_raw_schema(raw)
    assert result.valid is True
    assert len(result.canonical_input.multivalued_dependencies) == 2


def test_parse_invalid_arrow():
    raw = """
    Relation: R(A, B, C)
    FDs:
    A ->>> B
    """
    result = parse_raw_schema(raw)
    assert result.valid is False
    assert any(e.code == "INVALID_ARROW_SYNTAX" for e in result.errors)


def test_parse_missing_rhs():
    raw = """
    Relation: R(A, B)
    FDs:
    A ->
    """
    result = parse_raw_schema(raw)
    assert result.valid is False
    assert any(e.code == "MISSING_RHS" for e in result.errors)


@pytest.mark.anyio
async def test_api_parse_raw_endpoint(client: AsyncClient):
    payload = {
        "raw_text": "ENROLLMENT(StudentID, CourseID, Grade)\nFDs:\nStudentID, CourseID -> Grade"
    }
    response = await client.post("/api/v1/schema/parse-raw", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["canonical_input"]["name"] == "ENROLLMENT"
    assert len(data["canonical_input"]["attributes"]) == 3
    assert len(data["canonical_input"]["functional_dependencies"]) == 1
