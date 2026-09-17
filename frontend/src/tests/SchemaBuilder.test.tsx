import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AttributeBuilder } from '../features/analyzer/AttributeBuilder';
import { CandidateKeyBuilder } from '../features/analyzer/CandidateKeyBuilder';
import { FDBuilder } from '../features/analyzer/FDBuilder';
import { MVDBuilder } from '../features/analyzer/MVDBuilder';
import { SampleDataEditor } from '../features/analyzer/SampleDataEditor';
import { SchemaPreview } from '../features/analyzer/SchemaPreview';

describe('Phase 2 Schema Builders & Validation Components', () => {
  describe('AttributeBuilder', () => {
    it('renders attributes and adds a new valid attribute', () => {
      const onChange = vi.fn();
      render(
        <AttributeBuilder
          attributes={['StudentID', 'CourseID']}
          onChange={onChange}
        />
      );

      expect(screen.getByText('StudentID')).toBeInTheDocument();
      expect(screen.getByText('CourseID')).toBeInTheDocument();
      expect(screen.getByText('2 attributes')).toBeInTheDocument();

      const input = screen.getByPlaceholderText(/e\.g\. StudentID/i);
      fireEvent.change(input, { target: { value: 'Grade' } });

      const addBtn = screen.getByRole('button', { name: /Add/i });
      fireEvent.click(addBtn);

      expect(onChange).toHaveBeenCalledWith(['StudentID', 'CourseID', 'Grade']);
    });

    it('rejects duplicate attribute names with an educational message', () => {
      const onChange = vi.fn();
      render(
        <AttributeBuilder
          attributes={['StudentID', 'CourseID']}
          onChange={onChange}
        />
      );

      const input = screen.getByPlaceholderText(/e\.g\. StudentID/i);
      fireEvent.change(input, { target: { value: 'studentid' } }); // case-insensitive check

      const addBtn = screen.getByRole('button', { name: /Add/i });
      fireEvent.click(addBtn);

      expect(onChange).not.toHaveBeenCalled();
      expect(
        screen.getByText(/Duplicate attribute "studentid"\. Attribute names must be unique within a relation\./i)
      ).toBeInTheDocument();
    });

    it('removes an attribute when delete button is clicked', () => {
      const onChange = vi.fn();
      render(
        <AttributeBuilder
          attributes={['StudentID', 'CourseID']}
          onChange={onChange}
        />
      );

      const removeBtn = screen.getByTitle('Remove StudentID');
      fireEvent.click(removeBtn);

      expect(onChange).toHaveBeenCalledWith(['CourseID']);
    });
  });

  describe('CandidateKeyBuilder', () => {
    it('supports composite candidate keys with unverified badge', () => {
      const onChange = vi.fn();
      render(
        <CandidateKeyBuilder
          attributes={['StudentID', 'CourseID', 'Grade']}
          candidateKeys={[['StudentID', 'CourseID']]}
          onChange={onChange}
        />
      );

      expect(screen.getByText('(StudentID, CourseID)')).toBeInTheDocument();
      expect(screen.getByText(/User-provided \(unverified\)/i)).toBeInTheDocument();

      // Select 'Grade' and add single attribute key
      const gradeBtn = screen.getByRole('button', { name: 'Grade' });
      fireEvent.click(gradeBtn);

      const addKeyBtn = screen.getByRole('button', { name: /Add Candidate Key/i });
      fireEvent.click(addKeyBtn);

      expect(onChange).toHaveBeenCalledWith([
        ['StudentID', 'CourseID'],
        ['Grade'],
      ]);
    });

    it('displays educational guidance when zero candidate keys are provided', () => {
      render(
        <CandidateKeyBuilder
          attributes={['A', 'B']}
          candidateKeys={[]}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText(/No candidate key provided/i)).toBeInTheDocument();
      expect(screen.getByText(/minimal candidate keys/i)).toBeInTheDocument();
    });
  });

  describe('FDBuilder', () => {
    it('builds multi-attribute LHS and RHS dependencies', () => {
      const onChange = vi.fn();
      render(
        <FDBuilder
          attributes={['StudentID', 'CourseID', 'Grade']}
          functionalDependencies={[]}
          onChange={onChange}
        />
      );

      // Select StudentID and CourseID on LHS
      const lhsSection = screen.getByText('Determinant (LHS):').closest('div');
      expect(lhsSection).not.toBeNull();

      const studentIdButtons = screen.getAllByRole('button', { name: 'StudentID' });
      fireEvent.click(studentIdButtons[0]); // LHS

      const courseIdButtons = screen.getAllByRole('button', { name: 'CourseID' });
      fireEvent.click(courseIdButtons[0]); // LHS

      // Select Grade on RHS
      const gradeButtons = screen.getAllByRole('button', { name: 'Grade' });
      fireEvent.click(gradeButtons[1]); // RHS

      const addFdBtn = screen.getByRole('button', { name: /Add Dependency/i });
      fireEvent.click(addFdBtn);

      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[0][0];
      expect(lastCall[0].left).toEqual(['StudentID', 'CourseID']);
      expect(lastCall[0].right).toEqual(['Grade']);
    });
  });

  describe('MVDBuilder', () => {
    it('renders and adds multivalued dependency X ↠ Y', () => {
      const onChange = vi.fn();
      render(
        <MVDBuilder
          attributes={['Student', 'Hobby', 'Language']}
          multivaluedDependencies={[
            { id: 'mvd-1', left: ['Student'], right: ['Hobby'] },
          ]}
          onChange={onChange}
        />
      );

      expect(screen.getAllByText('Student').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Hobby').length).toBeGreaterThan(0);
      expect(screen.getByText('↠')).toBeInTheDocument();
    });
  });

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
});
