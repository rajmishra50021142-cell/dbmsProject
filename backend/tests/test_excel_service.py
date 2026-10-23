"""
Unit and integration tests for Excel workbook ingestion, heuristic suggestions,
and normalized spreadsheet export.
"""

import io
import pytest
import openpyxl
from fastapi.testclient import TestClient
from app.main import app
from app.services.excel_service import ExcelService
from app.schemas.domain_contracts import FunctionalDependency

client = TestClient(app)


def create_test_excel_bytes(sheets_data: dict) -> bytes:
    """Helper to generate an in-memory .xlsx file with specified sheets and rows."""
    wb = openpyxl.Workbook()
    wb.remove(wb.active)  # remove default sheet
    for sheet_name, rows in sheets_data.items():
        ws = wb.create_sheet(title=sheet_name)
        for r in rows:
            ws.append(r)
    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


def test_inspect_valid_workbook():
    data = {
        "Students": [
            ["StudentID", "StudentName", "Department"],
            ["S101", "Alice Smith", "CSE"],
            ["S102", "Bob Jones", "ECE"],
            ["S103", "Charlie Brown", "ME"],
        ]
    }
    b = create_test_excel_bytes(data)
    res = ExcelService.inspect_workbook(b, "test.xlsx", "Students")
    assert res.filename == "test.xlsx"
    assert res.selected_sheet == "Students"
    assert res.headers == ["StudentID", "StudentName", "Department"]
    assert res.total_rows == 3
    assert len(res.preview_rows) == 3
    assert res.preview_rows[0]["StudentID"] == "S101"
    assert len(res.issues) == 0


def test_inspect_multiple_sheets():
    data = {
        "Courses": [
            ["CourseID", "CourseTitle"],
            ["CS101", "Database Systems"],
        ],
        "Enrollments": [
            ["StudentID", "CourseID", "Grade"],
            ["S101", "CS101", "A"],
        ],
    }
    b = create_test_excel_bytes(data)
    res1 = ExcelService.inspect_workbook(b, "multi.xlsx", "Courses")
    assert res1.sheets == ["Courses", "Enrollments"]
    assert res1.selected_sheet == "Courses"
    assert res1.headers == ["CourseID", "CourseTitle"]

    res2 = ExcelService.inspect_workbook(b, "multi.xlsx", "Enrollments")
    assert res2.selected_sheet == "Enrollments"
    assert res2.headers == ["StudentID", "CourseID", "Grade"]


def test_inspect_blank_and_duplicate_headers():
    data = {
        "Sheet1": [
            ["ID", "", "Name", "ID"],  # Blank header in col 2, duplicate 'ID' in col 4
            [1, "val", "Alice", 1],
        ]
    }
    b = create_test_excel_bytes(data)
    res = ExcelService.inspect_workbook(b, "bad_headers.xlsx")
    assert len(res.headers) == 4
    assert res.headers[0] == "ID"
    assert res.headers[1] == "Column_B"  # Auto-assigned column name
    assert res.headers[2] == "Name"
    assert res.headers[3] == "ID_D"  # Disambiguated duplicate
    assert any(i.code == "EMPTY_COLUMN_HEADER" for i in res.issues)
    assert any(i.code == "DUPLICATE_HEADER" for i in res.issues)


def test_inspect_empty_worksheet():
    data = {"Empty": []}
    b = create_test_excel_bytes(data)
    res = ExcelService.inspect_workbook(b, "empty.xlsx")
    assert res.total_rows == 0
    assert len(res.headers) == 0
    assert any(i.code == "EMPTY_WORKSHEET" for i in res.issues)


def test_heuristic_suggestions_mode_b():
    attributes = ["StudentID", "CourseID", "StudentName", "CourseName", "Grade"]
    rows = [
        {"StudentID": "S1", "CourseID": "C1", "StudentName": "Alice", "CourseName": "DBMS", "Grade": "A"},
        {"StudentID": "S1", "CourseID": "C2", "StudentName": "Alice", "CourseName": "OS", "Grade": "B"},
        {"StudentID": "S2", "CourseID": "C1", "StudentName": "Bob", "CourseName": "DBMS", "Grade": "A"},
        {"StudentID": "S3", "CourseID": "C3", "StudentName": "Charlie", "CourseName": "AI, ML", "Grade": "A"},
    ]
    res = ExcelService.suggest_schema_and_dependencies(attributes, rows, "STUDENT_ENROLLMENT")
    assert res.relation_name == "STUDENT_ENROLLMENT"
    # Composite key {StudentID, CourseID} is unique across all rows
    assert any(set(k.attributes) == {"StudentID", "CourseID"} for k in res.suggested_keys)
    # Observed FDs: StudentID -> StudentName, CourseID -> CourseName
    assert any(fd.left == ["StudentID"] and fd.right == ["StudentName"] for fd in res.suggested_fds)
    assert any(fd.left == ["CourseID"] and fd.right == ["CourseName"] for fd in res.suggested_fds)
    # Check atomicity review flag for 'AI, ML'
    assert any(item.attribute == "CourseName" and item.delimiter_detected == "," for item in res.atomicity_reviews)
    assert "Important: These dependencies and keys are suggestions" in res.caveat


def test_validate_rows_contradicting_declared_fd():
    attributes = ["StudentID", "StudentName"]
    fds = [FunctionalDependency(left=["StudentID"], right=["StudentName"])]
    # S1 has two different student names (Alice vs Bob)
    rows = [
        {"StudentID": "S1", "StudentName": "Alice"},
        {"StudentID": "S1", "StudentName": "Bob"},
    ]
    contradictions = ExcelService.validate_rows_against_dependencies(attributes, fds, rows)
    assert len(contradictions) == 1
    assert "Row 1 and Row 2 share identical determinant" in contradictions[0]["message"]


def test_generate_normalized_workbook():
    # Relation ENROLLMENT with partial dependencies
    relation_name = "ENROLLMENT"
    attributes = ["StudentID", "CourseID", "StudentName", "CourseTitle", "Grade"]
    fds = [
        FunctionalDependency(left=["StudentID"], right=["StudentName"]),
        FunctionalDependency(left=["CourseID"], right=["CourseTitle"]),
    ]
    candidate_keys = [["StudentID", "CourseID"]]
    rows = [
        {"StudentID": "S1", "CourseID": "C101", "StudentName": "Alice", "CourseTitle": "Database", "Grade": "A"},
        {"StudentID": "S1", "CourseID": "C102", "StudentName": "Alice", "CourseTitle": "Networks", "Grade": "B"},
        {"StudentID": "S2", "CourseID": "C101", "StudentName": "Bob", "CourseTitle": "Database", "Grade": "A"},
        # Duplicate row to verify projection deduplication
        {"StudentID": "S1", "CourseID": "C101", "StudentName": "Alice", "CourseTitle": "Database", "Grade": "A"},
    ]

    xlsx_bytes = ExcelService.generate_normalized_workbook(
        relation_name=relation_name,
        attributes=attributes,
        functional_dependencies=fds,
        multivalued_dependencies=[],
        candidate_keys=candidate_keys,
        rows=rows,
        target_normal_form="2NF",
    )
    assert len(xlsx_bytes) > 0

    # Load back the generated workbook to verify contents
    wb = openpyxl.load_workbook(io.BytesIO(xlsx_bytes))
    sheet_names = wb.sheetnames
    assert "Normalization Summary" in sheet_names
    assert len(sheet_names) >= 3  # At least 2 sub-relations + Normalization Summary

    # Check that projection removed duplicate rows in sub-relations
    summary_sheet = wb["Normalization Summary"]
    summary_text = "\n".join(
        str(cell.value) for row in summary_sheet.iter_rows() for cell in row if cell.value is not None
    )
    assert "NORMALIZATION LAB" in summary_text
    assert "ENROLLMENT" in summary_text
    assert "VERIFIED LOSSLESS" in summary_text


def test_excel_api_endpoints():
    data = {
        "TestSheet": [
            ["ID", "Name"],
            ["1", "Item A"],
            ["2", "Item B"],
        ]
    }
    b = create_test_excel_bytes(data)

    # 1. Test POST /api/v1/excel/inspect
    res = client.post(
        "/api/v1/excel/inspect",
        files={"file": ("test.xlsx", b, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
    )
    assert res.status_code == 200
    inspect_data = res.json()
    assert inspect_data["headers"] == ["ID", "Name"]
    assert inspect_data["total_rows"] == 2

    # 2. Test POST /api/v1/excel/suggest
    suggest_payload = {
        "relation_name": "ITEMS",
        "attributes": ["ID", "Name"],
        "rows": [{"ID": "1", "Name": "Item A"}, {"ID": "2", "Name": "Item B"}],
    }
    res_sug = client.post("/api/v1/excel/suggest", json=suggest_payload)
    assert res_sug.status_code == 200
    sug_data = res_sug.json()
    assert len(sug_data["suggested_keys"]) > 0

    # 3. Test POST /api/v1/excel/export-normalized
    export_payload = {
        "relation_name": "ITEMS",
        "attributes": ["ID", "Name"],
        "functionalDependencies": [{"left": ["ID"], "right": ["Name"]}],
        "multivaluedDependencies": [],
        "candidateKeys": [["ID"]],
        "rows": [{"ID": "1", "Name": "Item A"}, {"ID": "2", "Name": "Item B"}],
        "target_normal_form": "3NF",
    }
    res_exp = client.post("/api/v1/excel/export-normalized", json=export_payload)
    assert res_exp.status_code == 200
    assert res_exp.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert "attachment" in res_exp.headers["content-disposition"]
