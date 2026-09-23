import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SampleDataEditor } from '../features/analyzer/SampleDataEditor';
import { SchemaPreview } from '../features/analyzer/SchemaPreview';
import { AnalyzerPage } from '../pages/AnalyzerPage';

describe('Analyzer Components & Raw Notation UI', () => {
  describe('SampleDataEditor', () => {
    it('renders sample table matching attributes and adds new row', () => {
      const onChange = vi.fn();
      render(
        <SampleDataEditor
          attributes={['StudentID', 'Courses']}
          sampleData={[{ StudentID: 'S101', Courses: 'DBMS, OS, CN' }]}
          onChange={onChange}
        />
      );

      expect(screen.getByDisplayValue('S101')).toBeInTheDocument();
      expect(screen.getByDisplayValue('DBMS, OS, CN')).toBeInTheDocument();

      const addRowBtn = screen.getByRole('button', { name: /Add Row/i });
      fireEvent.click(addRowBtn);

      expect(onChange).toHaveBeenCalledWith([
        { StudentID: 'S101', Courses: 'DBMS, OS, CN' },
        { StudentID: '', Courses: '' },
      ]);
    });

    it('shows empty state when no attributes exist', () => {
      render(
        <SampleDataEditor
          attributes={[]}
          sampleData={[]}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText(/Define attributes in the relation schema first/i)).toBeInTheDocument();
    });
  });

  describe('SchemaPreview', () => {
    it('renders relational signature R(...) and dependencies', () => {
      render(
        <SchemaPreview
          schema={{
            name: 'ENROLLMENT',
            attributes: ['StudentID', 'CourseID', 'Grade'],
            candidate_keys: [['StudentID', 'CourseID']],
            functional_dependencies: [
              { id: 'fd-1', left: ['StudentID', 'CourseID'], right: ['Grade'] },
            ],
            multivalued_dependencies: [],
          }}
        />
      );

      expect(screen.getByText('ENROLLMENT')).toBeInTheDocument();
      expect(screen.getByText('(StudentID, CourseID)')).toBeInTheDocument();
      expect(screen.getAllByText('StudentID, CourseID').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Grade').length).toBeGreaterThan(0);
    });
  });

  describe('AnalyzerPage Input Mode', () => {
    it('defaults to Raw Notation input and provides Raw and Sample Data tabs', () => {
      render(
        <MemoryRouter>
          <AnalyzerPage />
        </MemoryRouter>
      );

      // Verify Raw Mode badge and tabs
      expect(screen.getByText('Raw Mode')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Raw Notation/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Sample Data/i })).toBeInTheDocument();

      // Verify that Structured Builder tab does not exist
      expect(screen.queryByRole('tab', { name: /Structured Builder/i })).not.toBeInTheDocument();

      // Verify Raw textarea is present
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Parse Notation/i })).toBeInTheDocument();
    });
  });
});
