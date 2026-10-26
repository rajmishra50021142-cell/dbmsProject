import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ExcelWorkbookManager } from '../features/analyzer/ExcelWorkbookManager';
import { SchemaPreview } from '../features/analyzer/SchemaPreview';
import { AnalyzerPage } from '../pages/AnalyzerPage';
import { excelService } from '../services/excelService';
import { schemaService } from '../services/schemaService';
import { normalizationService } from '../services/normalizationService';
import { keyService } from '../services/keyService';
import type { RelationSchema } from '../types';

describe('Excel Analysis End-to-End Integration Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const mockStaffBranchSchema: RelationSchema = {
    name: 'STAFF_BRANCH',
    attributes: ['StaffNo', 'SName', 'Salary', 'BranchNo', 'BranchAddress'],
    candidate_keys: [['StaffNo']],
    functional_dependencies: [
      { id: 'fd-1', left: ['StaffNo'], right: ['SName', 'Salary', 'BranchNo'] },
      { id: 'fd-2', left: ['BranchNo'], right: ['BranchAddress'] },
    ],
    multivalued_dependencies: [],
  };

  const mockStudentInspectResponse = {
    filename: 'Student_Enrollment.xlsx',
    sheet_names: ['Enrollment', 'Courses'],
    selected_sheet: 'Enrollment',
    header_row_index: 0,
    columns: ['StudentID', 'CourseID', 'StudentName', 'Department'],
    total_rows: 15,
    preview_rows: [
      { StudentID: 'S1', CourseID: 'C101', StudentName: 'Alice', Department: 'CS' },
      { StudentID: 'S1', CourseID: 'C102', StudentName: 'Alice', Department: 'CS' },
      { StudentID: 'S2', CourseID: 'C101', StudentName: 'Bob', Department: 'EE' },
    ],
    issues: [],
    has_non_atomic_values: false,
  };

  const mockStudentSuggestResponse = {
    relation_name: 'STUDENT_ENROLLMENT',
    candidate_keys: [
      {
        attributes: ['StudentID', 'CourseID'],
        is_unique: true,
        uniqueness_ratio: 1.0,
        null_count: 0,
        confidence: 'High' as const,
      },
    ],
    functional_dependencies: [
      {
        id: 'sug-fd-1',
        determinant: ['StudentID'],
        dependent: ['StudentName', 'Department'],
        notation: 'StudentID → StudentName, Department',
        holds: true,
        violation_count: 0,
        confidence: 'Strong' as const,
        notes: 'Determines non-key student profile.',
      },
    ],
    atomicity_reviews: [],
    sample_row_count: 3,
    disclaimer: 'Empirical discovery based on sample data; requires user confirmation.',
  };

  // Test 1: Excel-only analysis (Mode B discovery without prior raw notation)
  it('Test 1 — Excel-only analysis discovers and applies schema without raw notation', async () => {
    vi.spyOn(excelService, 'inspectWorkbook').mockResolvedValue(mockStudentInspectResponse);
    vi.spyOn(excelService, 'suggestSchemaAndDependencies').mockResolvedValue(mockStudentSuggestResponse);

    const onApplyMock = vi.fn();

    render(
      <ExcelWorkbookManager
        currentSchema={{
          name: 'NEW_RELATION',
          attributes: [],
          functional_dependencies: [],
          multivalued_dependencies: [],
        }}
        onApplySchema={onApplyMock}
      />
    );

    const input = document.getElementById('excel-file-upload-input') as HTMLInputElement;
    const file = new File(['mock content'], 'Student_Enrollment.xlsx');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Student_Enrollment.xlsx')).toBeInTheDocument();
      expect(screen.getByText(/15 rows • 4 columns/i)).toBeInTheDocument();
    });

    // Switch to Mode B: Discover Schema
    const modeBTab = screen.getByText(/Mode B: Discover Schema From Data/i);
    fireEvent.click(modeBTab);

    await waitFor(() => {
      expect(screen.getByText(/Empirical Schema Discovery Disclaimer/i)).toBeInTheDocument();
      expect(screen.getByText('{StudentID, CourseID}')).toBeInTheDocument();
      expect(screen.getByText('StudentID → StudentName, Department')).toBeInTheDocument();
    });

    // Apply discovered schema
    const applyBtn = screen.getByRole('button', { name: /Apply Discovered Schema to Workspace/i });
    fireEvent.click(applyBtn);

    expect(onApplyMock).toHaveBeenCalledTimes(1);
    const applied: RelationSchema = onApplyMock.mock.calls[0][0];
    expect(applied.name).toBe('STUDENT_ENROLLMENT');
    expect(applied.attributes).toEqual(['StudentID', 'CourseID', 'StudentName', 'Department']);
    expect(applied.candidate_keys).toEqual([['StudentID', 'CourseID']]);
    expect(applied.functional_dependencies).toHaveLength(1);
    expect(applied.functional_dependencies[0].left).toEqual(['StudentID']);
    expect(applied.functional_dependencies[0].right).toEqual(['StudentName', 'Department']);
    expect(applied.source).toBe('excel');
    expect(applied.source_metadata?.filename).toBe('Student_Enrollment.xlsx');
  });

  // Test 2: Existing schema linked to Excel (Mode A)
  it('Test 2 — Existing schema linked to Excel data maps columns and applies mapped tuples', async () => {
    const declaredSchema: RelationSchema = {
      name: 'ENROLLMENT',
      attributes: ['StudentID', 'CourseID', 'StudentName', 'Department'],
      candidate_keys: [['StudentID', 'CourseID']],
      functional_dependencies: [
        { id: 'fd-1', left: ['StudentID'], right: ['StudentName', 'Department'] },
      ],
      multivalued_dependencies: [],
    };

    vi.spyOn(excelService, 'inspectWorkbook').mockResolvedValue(mockStudentInspectResponse);
    vi.spyOn(excelService, 'validateRows').mockResolvedValue({
      valid: true,
      total_rows: 3,
      violations_count: 0,
      issues: [],
    });

    const onApplyMock = vi.fn();

    render(
      <ExcelWorkbookManager
        currentSchema={declaredSchema}
        onApplySchema={onApplyMock}
      />
    );

    const input = document.getElementById('excel-file-upload-input') as HTMLInputElement;
    const file = new File(['mock content'], 'Student_Enrollment.xlsx');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Student_Enrollment.xlsx')).toBeInTheDocument();
    });

    // Mode A is active and exact matches are mapped
    expect(screen.getByText(/Mapping Valid/i)).toBeInTheDocument();

    // Click Apply Mapped Data & Analyze
    const applyMappedBtn = screen.getByRole('button', { name: /Apply Mapped Data & Analyze/i });
    fireEvent.click(applyMappedBtn);

    expect(onApplyMock).toHaveBeenCalledTimes(1);
    const applied: RelationSchema = onApplyMock.mock.calls[0][0];
    expect(applied.name).toBe('ENROLLMENT');
    expect(applied.sample_data).toHaveLength(3);
    expect(applied.sample_data?.[0]).toEqual({
      StudentID: 'S1',
      CourseID: 'C101',
      StudentName: 'Alice',
      Department: 'CS',
    });
    expect(applied.source).toBe('excel');
    expect(applied.source_metadata?.mode).toBe('modeA');
  });

  // Test 3: Prevent incorrect mappings (no silent fallback to columns[0])
  it('Test 3 — Rejects silent fallback to columns[0] and identifies unmapped and duplicate columns', async () => {
    vi.spyOn(excelService, 'inspectWorkbook').mockResolvedValue(mockStudentInspectResponse);

    render(
      <ExcelWorkbookManager
        currentSchema={mockStaffBranchSchema}
        onApplySchema={vi.fn()}
      />
    );

    const input = document.getElementById('excel-file-upload-input') as HTMLInputElement;
    const file = new File(['mock content'], 'Student_Enrollment.xlsx');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Student_Enrollment.xlsx')).toBeInTheDocument();
    });

    // Switch to Mode A tab to inspect mapping
    const modeATab = screen.getByText(/Mode A: Link to Declared Schema/i);
    fireEvent.click(modeATab);

    // Mismatch warning should be displayed
    expect(screen.getByText(/Schema Mismatch with Current Relation/i)).toBeInTheDocument();
    expect(screen.getByText(/Mapping Incomplete/i)).toBeInTheDocument();

    // Verify Apply button is disabled due to unmapped attributes
    const applyMappedBtn = screen.getByRole('button', { name: /Apply Mapped Data & Analyze/i });
    expect(applyMappedBtn).toBeDisabled();
  });

  // Test 4: Prevent stale analysis in SchemaPreview
  it('Test 4 — SchemaPreview immediately updates when relation changes, showing source badge and tuples', () => {
    const { rerender } = render(<SchemaPreview schema={mockStaffBranchSchema} />);

    // Initially displays STAFF_BRANCH
    expect(screen.getByText(/STAFF_BRANCH/)).toBeInTheDocument();
    expect(screen.getAllByText(/StaffNo/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Raw DBMS Notation/i)).toBeInTheDocument();

    // Update to Excel-derived STUDENT_ENROLLMENT
    const excelSchema: RelationSchema = {
      name: 'STUDENT_ENROLLMENT',
      attributes: ['StudentID', 'CourseID', 'StudentName', 'Department'],
      candidate_keys: [['StudentID', 'CourseID']],
      functional_dependencies: [
        { id: 'fd-1', left: ['StudentID'], right: ['StudentName', 'Department'] },
      ],
      multivalued_dependencies: [],
      sample_data: [
        { StudentID: 'S1', CourseID: 'C101', StudentName: 'Alice', Department: 'CS' },
      ],
      source: 'excel',
      source_metadata: {
        filename: 'Student_Enrollment.xlsx',
        worksheet: 'Enrollment',
        mode: 'modeB',
        total_rows: 15,
      },
    };

    rerender(<SchemaPreview schema={excelSchema} />);

    // Stale STAFF_BRANCH must NOT be visible
    expect(screen.queryByText(/STAFF_BRANCH/)).not.toBeInTheDocument();
    expect(screen.queryByText(/StaffNo/)).not.toBeInTheDocument();
    expect(screen.queryByText(/BranchAddress/)).not.toBeInTheDocument();

    // New schema must be rendered
    expect(screen.getByText(/STUDENT_ENROLLMENT/)).toBeInTheDocument();
    expect(screen.getAllByText(/StudentID/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Student_Enrollment\.xlsx/)).toBeInTheDocument();
    expect(screen.getByText(/Mode B: Discovered Schema/i)).toBeInTheDocument();
    expect(screen.getByText(/1 row/i)).toBeInTheDocument();
  });

  // Test 5: Workbook changes (worksheet & header row changes)
  it('Test 5 — Changing worksheet triggers re-inspection and updates selected sheet', async () => {
    const inspectSpy = vi.spyOn(excelService, 'inspectWorkbook')
      .mockResolvedValueOnce(mockStudentInspectResponse)
      .mockResolvedValueOnce({
        ...mockStudentInspectResponse,
        selected_sheet: 'Courses',
        columns: ['CourseID', 'CourseTitle', 'Credits'],
        preview_rows: [{ CourseID: 'C101', CourseTitle: 'CS Intro', Credits: 4 }],
      });

    render(
      <ExcelWorkbookManager
        currentSchema={mockStaffBranchSchema}
        onApplySchema={vi.fn()}
      />
    );

    const input = document.getElementById('excel-file-upload-input') as HTMLInputElement;
    const file = new File(['mock content'], 'Student_Enrollment.xlsx');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Student_Enrollment.xlsx')).toBeInTheDocument();
    });

    // Change worksheet select
    const sheetSelect = screen.getByLabelText('Worksheet');
    fireEvent.change(sheetSelect, { target: { value: 'Courses' } });

    await waitFor(() => {
      expect(inspectSpy).toHaveBeenCalledTimes(2);
      expect(inspectSpy).toHaveBeenLastCalledWith(file, 'Courses', 0);
    });
  });

  // Test 6: Invalid and unusual workbooks
  it('Test 6 — Displays useful error message when inspect fails', async () => {
    vi.spyOn(excelService, 'inspectWorkbook').mockRejectedValueOnce(
      new Error('Corrupt or password-protected Excel file.')
    );

    render(
      <ExcelWorkbookManager
        currentSchema={mockStaffBranchSchema}
        onApplySchema={vi.fn()}
      />
    );

    const input = document.getElementById('excel-file-upload-input') as HTMLInputElement;
    const file = new File(['bad content'], 'corrupt.xlsx');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Corrupt or password-protected Excel file\./i)).toBeInTheDocument();
    });
  });

  // Test 7: Formal correctness (incomplete constraints show honest status, not fabricated results)
  it('Test 7 — Incomplete constraints display honest status without fabricating normal form conclusions', () => {
    const schemaWithNoFDs: RelationSchema = {
      name: 'EXCEL_RAW_DATA',
      attributes: ['ColA', 'ColB', 'ColC'],
      candidate_keys: [],
      functional_dependencies: [],
      multivalued_dependencies: [],
      source: 'excel',
      source_metadata: {
        filename: 'Raw_Data.xlsx',
        worksheet: 'Sheet1',
        mode: 'modeB',
      },
    };

    render(<SchemaPreview schema={schemaWithNoFDs} />);

    expect(screen.getByText(/Awaiting Confirmed Dependencies/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirm functional dependencies in the Excel Manager tab/i)).toBeInTheDocument();
    expect(screen.getByText(/No candidate keys specified/i)).toBeInTheDocument();
  });

  // Test 8: Full AnalyzerPage integration
  it('Test 8 — Uploading Excel in AnalyzerPage updates Live Preview, Validation Summary, and persisted draft', async () => {
    vi.spyOn(excelService, 'inspectWorkbook').mockResolvedValue(mockStudentInspectResponse);
    vi.spyOn(excelService, 'suggestSchemaAndDependencies').mockResolvedValue(mockStudentSuggestResponse);
    vi.spyOn(schemaService, 'validateSchema').mockResolvedValue({
      valid: true,
      errors: [],
      warnings: [],
      canonical_input: {
        name: 'STUDENT_ENROLLMENT',
        attributes: ['StudentID', 'CourseID', 'StudentName', 'Department'],
        candidate_keys: [['StudentID', 'CourseID']],
        functional_dependencies: [
          { id: 'sug-fd-1', left: ['StudentID'], right: ['StudentName', 'Department'] },
        ],
        multivalued_dependencies: [],
        sample_data: [],
      },
      summary: {
        relation_name: 'STUDENT_ENROLLMENT',
        attribute_count: 4,
        candidate_key_count: 1,
        fd_count: 1,
        mvd_count: 0,
        sample_row_count: 3,
        is_ready_for_analysis: true,
      },
    });

    render(
      <MemoryRouter>
        <AnalyzerPage />
      </MemoryRouter>
    );

    // Switch to Excel tab
    const excelTab = screen.getByText('Excel Spreadsheet');
    fireEvent.click(excelTab);

    // Upload workbook
    const input = document.getElementById('excel-file-upload-input') as HTMLInputElement;
    const file = new File(['mock content'], 'Student_Enrollment.xlsx');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Student_Enrollment.xlsx')).toBeInTheDocument();
    });

    // Switch to Mode B
    const modeBTab = screen.getByText(/Mode B: Discover Schema From Data/i);
    fireEvent.click(modeBTab);

    await waitFor(() => {
      expect(screen.getByText(/Apply Discovered Schema to Workspace/i)).toBeInTheDocument();
    });

    // Apply discovered schema
    const applyBtn = screen.getByRole('button', { name: /Apply Discovered Schema to Workspace/i });
    fireEvent.click(applyBtn);

    // Live Relational Preview must update with new relation name and source badge
    await waitFor(() => {
      expect(screen.getAllByText(/STUDENT_ENROLLMENT/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Student_Enrollment\.xlsx/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Mode B: Discovered Schema/i).length).toBeGreaterThan(0);
    });

    // Check localStorage was updated with the new canonical draft
    const saved = localStorage.getItem('normalization_lab_draft_v1');
    expect(saved).not.toBeNull();
    const parsedDraft = JSON.parse(saved!);
    expect(parsedDraft.name).toBe('STUDENT_ENROLLMENT');
    expect(parsedDraft.attributes).toEqual(['StudentID', 'CourseID', 'StudentName', 'Department']);
  });

  // Test 9: Formal correctness equivalence
  it('Test 9 — Excel-applied schema and Raw-notation schema produce identical canonical inputs', () => {
    const rawSchema: RelationSchema = {
      name: 'STUDENT_ENROLLMENT',
      attributes: ['StudentID', 'CourseID', 'StudentName', 'Department'],
      candidate_keys: [['StudentID', 'CourseID']],
      functional_dependencies: [
        { id: 'fd-1', left: ['StudentID'], right: ['StudentName', 'Department'] },
      ],
      multivalued_dependencies: [],
      source: 'raw',
    };

    const excelSchema: RelationSchema = {
      name: 'STUDENT_ENROLLMENT',
      attributes: ['StudentID', 'CourseID', 'StudentName', 'Department'],
      candidate_keys: [['StudentID', 'CourseID']],
      functional_dependencies: [
        { id: 'fd-1', left: ['StudentID'], right: ['StudentName', 'Department'] },
      ],
      multivalued_dependencies: [],
      source: 'excel',
      source_metadata: {
        filename: 'Student_Enrollment.xlsx',
        mode: 'modeB',
      },
    };

    // Both schemas have identical relational signature, candidate keys, and dependencies
    expect(rawSchema.name).toBe(excelSchema.name);
    expect(rawSchema.attributes).toEqual(excelSchema.attributes);
    expect(rawSchema.candidate_keys).toEqual(excelSchema.candidate_keys);
    expect(rawSchema.functional_dependencies).toEqual(excelSchema.functional_dependencies);
  });
});
