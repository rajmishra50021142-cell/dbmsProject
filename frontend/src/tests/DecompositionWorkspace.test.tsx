import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DecompositionWorkspace } from '../features/decomposition/DecompositionWorkspace';
import { decompositionService } from '../services/decompositionService';
import type { RelationSchema, DecompositionAnalyzeResult } from '../types';

describe('DecompositionWorkspace Component (Phase 7)', () => {
  const mockSchema: RelationSchema = {
    name: 'ENROLLMENT',
    attributes: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'Grade'],
    candidate_keys: [['StudentID', 'CourseID']],
    functional_dependencies: [
      { left: ['StudentID'], right: ['StudentName'] },
      { left: ['CourseID'], right: ['CourseName'] },
      { left: ['StudentID', 'CourseID'], right: ['Grade'] },
    ],
    multivalued_dependencies: [],
  };

  const mockAnalyzeResult: DecompositionAnalyzeResult = {
    target_normal_form: '2NF',
    source_relation: 'ENROLLMENT',
    source_attributes: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'Grade'],
    candidate_keys: [['StudentID', 'CourseID']],
    plans: [
      {
        id: 'plan-2nf-123',
        source_relation: 'ENROLLMENT',
        stage: '2NF',
        trigger_type: 'PARTIAL_DEPENDENCY',
        trigger_dependency: 'StudentID -> StudentName; CourseID -> CourseName',
        proposed_relations: [
          {
            name: 'ENROLLMENT_StudentID',
            attributes: ['StudentID', 'StudentName'],
            primary_key: ['StudentID'],
            candidate_keys: [['StudentID']],
            functional_dependencies: [{ left: ['StudentID'], right: ['StudentName'] }],
            projected_fds: [{ left: ['StudentID'], right: ['StudentName'] }],
            purpose: 'Factored out partial dependency StudentID -> StudentName',
            source_relation: 'ENROLLMENT',
          },
          {
            name: 'ENROLLMENT_CourseID',
            attributes: ['CourseID', 'CourseName'],
            primary_key: ['CourseID'],
            candidate_keys: [['CourseID']],
            functional_dependencies: [{ left: ['CourseID'], right: ['CourseName'] }],
            projected_fds: [{ left: ['CourseID'], right: ['CourseName'] }],
            purpose: 'Factored out partial dependency CourseID -> CourseName',
            source_relation: 'ENROLLMENT',
          },
          {
            name: 'ENROLLMENT_CORE',
            attributes: ['CourseID', 'Grade', 'StudentID'],
            primary_key: ['CourseID', 'StudentID'],
            candidate_keys: [['CourseID', 'StudentID']],
            functional_dependencies: [{ left: ['CourseID', 'StudentID'], right: ['Grade'] }],
            projected_fds: [{ left: ['CourseID', 'StudentID'], right: ['Grade'] }],
            purpose: 'Core relation with candidate keys',
            source_relation: 'ENROLLMENT',
          },
        ],
        lossless_join: {
          is_lossless: true,
          method: 'TABLEAU_CHASE',
          attributes: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'Grade'],
          relations: ['ENROLLMENT_StudentID', 'ENROLLMENT_CourseID', 'ENROLLMENT_CORE'],
          initial_tableau: [
            ['a_1', 'b_1_2', 'a_3', 'b_1_4', 'b_1_5'],
            ['b_2_1', 'a_2', 'b_2_3', 'a_4', 'b_2_5'],
            ['a_1', 'a_2', 'b_3_3', 'b_3_4', 'a_5'],
          ],
          chase_steps: [
            {
              step_number: 1,
              applied_fd: { left: ['StudentID'], right: ['StudentName'] },
              matching_rows: [0, 2],
              target_attribute: 'StudentName',
              equated_symbol: 'a_3',
              replaced_symbols: ['b_3_3'],
              tableau_snapshot: [
                ['a_1', 'b_1_2', 'a_3', 'b_1_4', 'b_1_5'],
                ['b_2_1', 'a_2', 'b_2_3', 'a_4', 'b_2_5'],
                ['a_1', 'a_2', 'a_3', 'b_3_4', 'a_5'],
              ],
              explanation: 'Applied StudentID -> StudentName to equate symbols in StudentName.',
            },
          ],
          final_tableau: [
            ['a_1', 'b_1_2', 'a_3', 'b_1_4', 'b_1_5'],
            ['b_2_1', 'a_2', 'b_2_3', 'a_4', 'b_2_5'],
            ['a_1', 'a_2', 'a_3', 'a_4', 'a_5'],
          ],
          distinguished_row_index: 2,
          reasoning: 'Decomposition is LOSSLESS. Tableau Chase converged with distinguished row 3.',
        },
        dependency_preservation: {
          is_preserved: true,
          original_dependencies: [
            { left: ['StudentID'], right: ['StudentName'] },
            { left: ['CourseID'], right: ['CourseName'] },
            { left: ['StudentID', 'CourseID'], right: ['Grade'] },
          ],
          projected_dependencies_by_relation: {
            ENROLLMENT_StudentID: [{ left: ['StudentID'], right: ['StudentName'] }],
            ENROLLMENT_CourseID: [{ left: ['CourseID'], right: ['CourseName'] }],
            ENROLLMENT_CORE: [{ left: ['StudentID', 'CourseID'], right: ['Grade'] }],
          },
          all_projected_dependencies: [
            { left: ['StudentID'], right: ['StudentName'] },
            { left: ['CourseID'], right: ['CourseName'] },
            { left: ['StudentID', 'CourseID'], right: ['Grade'] },
          ],
          checks: [
            {
              target_fd: { left: ['StudentID'], right: ['StudentName'] },
              is_preserved: true,
              closure_under_projected: ['StudentID', 'StudentName'],
              relevant_relations: ['ENROLLMENT_StudentID'],
              explanation: 'Preserved directly in ENROLLMENT_StudentID.',
            },
          ],
          preserved_dependencies: [
            { left: ['StudentID'], right: ['StudentName'] },
            { left: ['CourseID'], right: ['CourseName'] },
            { left: ['StudentID', 'CourseID'], right: ['Grade'] },
          ],
          non_preserved_dependencies: [],
          reasoning: 'All 3 original functional dependencies are PRESERVED.',
        },
        lineage: { source: 'ENROLLMENT', stage: '2NF', children: ['R1', 'R2', 'R3'] },
        reasoning_steps: [
          {
            step_number: 1,
            title: 'Factor Out Partial Dependency',
            description: 'Created sub-relation for StudentID -> StudentName.',
          },
        ],
      },
    ],
    final_relations: [
      {
        name: 'ENROLLMENT_StudentID',
        attributes: ['StudentID', 'StudentName'],
        primary_key: ['StudentID'],
        candidate_keys: [['StudentID']],
        functional_dependencies: [{ left: ['StudentID'], right: ['StudentName'] }],
        projected_fds: [{ left: ['StudentID'], right: ['StudentName'] }],
        purpose: 'Factored out partial dependency',
        source_relation: 'ENROLLMENT',
      },
      {
        name: 'ENROLLMENT_CourseID',
        attributes: ['CourseID', 'CourseName'],
        primary_key: ['CourseID'],
        candidate_keys: [['CourseID']],
        functional_dependencies: [{ left: ['CourseID'], right: ['CourseName'] }],
        projected_fds: [{ left: ['CourseID'], right: ['CourseName'] }],
        purpose: 'Factored out partial dependency',
        source_relation: 'ENROLLMENT',
      },
    ],
    verification: {
      source_relation: 'ENROLLMENT',
      attributes: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'Grade'],
      decomposed_relations: [
        { name: 'ENROLLMENT_StudentID', attributes: ['StudentID', 'StudentName'] },
        { name: 'ENROLLMENT_CourseID', attributes: ['CourseID', 'CourseName'] },
      ],
      lossless_join: {
        is_lossless: true,
        method: 'TABLEAU_CHASE',
        attributes: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'Grade'],
        relations: ['ENROLLMENT_StudentID', 'ENROLLMENT_CourseID'],
        initial_tableau: [],
        chase_steps: [],
        final_tableau: [],
        distinguished_row_index: 0,
        reasoning: 'Lossless join established.',
      },
      dependency_preservation: {
        is_preserved: true,
        original_dependencies: [],
        projected_dependencies_by_relation: {},
        all_projected_dependencies: [],
        checks: [],
        preserved_dependencies: [],
        non_preserved_dependencies: [],
        reasoning: 'All dependencies preserved.',
      },
      overall_status: 'VERIFIED_BOTH',
      summary: 'Decomposition is BOTH Lossless and Dependency-Preserving.',
    },
    summary: 'Generated normalized sub-relations.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state with ready prompt', () => {
    render(<DecompositionWorkspace schema={mockSchema} initialTargetNF="2NF" />);
    expect(screen.getByText(/Formal Decomposition & Normalization Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Ready to Decompose Relation 'ENROLLMENT'/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Decompose & Verify/i })).toBeInTheDocument();
  });

  it('triggers decomposition and displays verification summary and decomposed relations', async () => {
    vi.spyOn(decompositionService, 'analyzeDecomposition').mockResolvedValue(mockAnalyzeResult);

    render(<DecompositionWorkspace schema={mockSchema} initialTargetNF="2NF" />);

    const decomposeBtn = screen.getByRole('button', { name: /Decompose & Verify/i });
    fireEvent.click(decomposeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Lossless \(Guaranteed\)/i)).toBeInTheDocument();
      expect(screen.getByText(/All Preserved \(100%\)/i)).toBeInTheDocument();
      expect(screen.getByText(/ENROLLMENT_StudentID/i)).toBeInTheDocument();
      expect(screen.getByText(/ENROLLMENT_CourseID/i)).toBeInTheDocument();
    });
  });

  it('toggles verification logic drawer and switches tabs', async () => {
    vi.spyOn(decompositionService, 'analyzeDecomposition').mockResolvedValue(mockAnalyzeResult);

    render(<DecompositionWorkspace schema={mockSchema} initialTargetNF="2NF" />);

    fireEvent.click(screen.getByRole('button', { name: /Decompose & Verify/i }));

    await waitFor(() => {
      expect(screen.getByText(/Show Formal Verification Details/i)).toBeInTheDocument();
    });

    // Expand logic drawer
    fireEvent.click(screen.getByText(/Show Formal Verification Details/i));

    expect(screen.getByRole('button', { name: /Tableau Chase Test/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dependency Preservation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Derivation & Lineage/i })).toBeInTheDocument();

    // Switch to Dependency Preservation tab
    fireEvent.click(screen.getByRole('button', { name: /Dependency Preservation/i }));
    expect(screen.getByText(/Dependency Preservation Analysis/i)).toBeInTheDocument();
  });
});
