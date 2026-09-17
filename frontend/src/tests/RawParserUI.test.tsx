import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RawInputEditor, schemaToRawText } from '../features/analyzer/RawInputEditor';
import { schemaService } from '../services/schemaService';
import type { RelationSchema } from '../types';

describe('RawInputEditor & schemaToRawText', () => {
  const sampleSchema: RelationSchema = {
    name: 'ENROLLMENT',
    attributes: ['StudentID', 'CourseID', 'Grade'],
    candidate_keys: [['StudentID', 'CourseID']],
    functional_dependencies: [
      { id: 'fd-1', left: ['StudentID', 'CourseID'], right: ['Grade'] },
    ],
    multivalued_dependencies: [],
  };

  it('converts canonical schema into DBMS textbook notation', () => {
    const raw = schemaToRawText(sampleSchema);
    expect(raw).toContain('Relation:\nENROLLMENT(StudentID, CourseID, Grade)');
    expect(raw).toContain('Candidate Keys:\n(StudentID, CourseID)');
    expect(raw).toContain('FDs:\nStudentID, CourseID -> Grade');
  });

  it('renders textarea with formatted text and calls parse service on click', async () => {
    const onParsedSuccess = vi.fn();
    const parseSpy = vi.spyOn(schemaService, 'parseRawSchema').mockResolvedValueOnce({
      valid: true,
      errors: [],
      warnings: [],
      canonical_input: sampleSchema,
    });

    render(
      <RawInputEditor
        initialSchema={sampleSchema}
        onParsedSuccess={onParsedSuccess}
      />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(schemaToRawText(sampleSchema));

    const parseBtn = screen.getByRole('button', { name: /Parse Notation/i });
    fireEvent.click(parseBtn);

    await waitFor(() => {
      expect(parseSpy).toHaveBeenCalledWith(expect.stringContaining('ENROLLMENT'));
      expect(onParsedSuccess).toHaveBeenCalledWith(sampleSchema);
      expect(screen.getByText(/Notation successfully parsed and canonicalized!/i)).toBeInTheDocument();
    });
  });

  it('displays line-numbered actionable errors when backend parser returns errors', async () => {
    vi.spyOn(schemaService, 'parseRawSchema').mockResolvedValueOnce({
      valid: false,
      errors: [
        {
          code: 'INCOMPLETE_FD',
          path: 'functional_dependencies[0]',
          message: 'Line 4: Incomplete functional dependency',
          severity: 'error',
        },
      ],
      warnings: [],
    });

    render(
      <RawInputEditor
        initialSchema={sampleSchema}
        onParsedSuccess={vi.fn()}
      />
    );

    const parseBtn = screen.getByRole('button', { name: /Parse Notation/i });
    fireEvent.click(parseBtn);

    await waitFor(() => {
      expect(screen.getByText(/Parsing Failed/i)).toBeInTheDocument();
      expect(screen.getByText(/Line 4: Incomplete functional dependency/i)).toBeInTheDocument();
    });
  });
});
