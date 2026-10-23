import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExcelWorkbookManager } from '../features/analyzer/ExcelWorkbookManager';
import { excelService } from '../services/excelService';
import type { RelationSchema } from '../types';

const mockSchema: RelationSchema = {
  name: 'STUDENT_COURSE',
  attributes: ['StudentID', 'CourseID', 'StudentName', 'Grade'],
  candidate_keys: [['StudentID', 'CourseID']],
  functional_dependencies: [
    { id: 'fd-1', left: ['StudentID'], right: ['StudentName'] },
  ],
};

const mockInspectResponse = {
  filename: 'students_grades.xlsx',
  sheet_names: ['Sheet1', 'Archived'],
  selected_sheet: 'Sheet1',
  header_row_index: 0,
  columns: ['StudentID', 'CourseID', 'StudentName', 'Grade'],
  total_rows: 5,
  preview_rows: [
    { StudentID: '101', CourseID: 'CS101', StudentName: 'Alice', Grade: 'A' },
    { StudentID: '101', CourseID: 'CS102', StudentName: 'Alice', Grade: 'B' },
    { StudentID: '102', CourseID: 'CS101', StudentName: 'Bob', Grade: 'A' },
  ],
  issues: [],
  has_non_atomic_values: false,
};

const mockSuggestResponse = {
  relation_name: 'STUDENTS_GRADES',
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
      dependent: ['StudentName'],
      notation: 'StudentID → StudentName',
      holds: true,
      violation_count: 0,
      confidence: 'Strong' as const,
      notes: 'Determinant has unique image in 100% of rows.',
    },
  ],
  atomicity_reviews: [],
  sample_row_count: 3,
  disclaimer: 'Empirical discovery based on sample data; requires user confirmation.',
};

describe('ExcelWorkbookManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload dropzone initially', () => {
    render(
      <ExcelWorkbookManager
        currentSchema={mockSchema}
        onApplySchema={vi.fn()}
      />
    );

    expect(screen.getByText(/Click to upload or drag & drop Excel workbook/i)).toBeInTheDocument();
    expect(screen.getByText(/Supports Microsoft Excel/i)).toBeInTheDocument();
  });

  it('inspects workbook on file selection and displays sheets and preview table', async () => {
    vi.spyOn(excelService, 'inspectWorkbook').mockResolvedValueOnce(mockInspectResponse);

    render(
      <ExcelWorkbookManager
        currentSchema={mockSchema}
        onApplySchema={vi.fn()}
      />
    );

    const input = document.getElementById('excel-file-upload-input') as HTMLInputElement;
    const file = new File(['dummy content'], 'students_grades.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('students_grades.xlsx')).toBeInTheDocument();
      expect(screen.getByText(/rows.*columns/i)).toBeInTheDocument();
      expect(screen.getByText(/Worksheet Sample Rows/i)).toBeInTheDocument();
    });
  });

  it('switches to Mode B and displays empirical disclaimer and suggestions', async () => {
    vi.spyOn(excelService, 'inspectWorkbook').mockResolvedValueOnce(mockInspectResponse);
    vi.spyOn(excelService, 'suggestSchemaAndDependencies').mockResolvedValueOnce(mockSuggestResponse);

    const onApplyMock = vi.fn();

    render(
      <ExcelWorkbookManager
        currentSchema={mockSchema}
        onApplySchema={onApplyMock}
      />
    );

    const input = document.getElementById('excel-file-upload-input') as HTMLInputElement;
    const file = new File(['content'], 'students_grades.xlsx');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('students_grades.xlsx')).toBeInTheDocument();
    });

    // Switch to Mode B
    const modeBTab = screen.getByText(/Mode B: Discover Schema From Data/i);
    fireEvent.click(modeBTab);

    await waitFor(() => {
      expect(screen.getByText(/Empirical Schema Discovery Disclaimer/i)).toBeInTheDocument();
      expect(screen.getByText('{StudentID, CourseID}')).toBeInTheDocument();
      expect(screen.getByText('StudentID → StudentName')).toBeInTheDocument();
    });

    // Apply discovered schema
    const applyBtn = screen.getByText(/Apply Discovered Schema to Workspace/i);
    fireEvent.click(applyBtn);

    expect(onApplyMock).toHaveBeenCalledTimes(1);
    const appliedSchema = onApplyMock.mock.calls[0][0];
    expect(appliedSchema.name).toBe('STUDENTS_GRADES');
    expect(appliedSchema.attributes).toEqual(['StudentID', 'CourseID', 'StudentName', 'Grade']);
    expect(appliedSchema.candidate_keys).toEqual([['StudentID', 'CourseID']]);
  });
});
