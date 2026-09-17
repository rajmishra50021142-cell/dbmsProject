import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VisualizationWorkspace } from '../features/visualization/VisualizationWorkspace';
import type { RelationSchema, FullNormalizationAnalysisResult } from '../types';

describe('VisualizationWorkspace Component (Phase 8)', () => {
  const mockSchema: RelationSchema = {
    name: 'ENROLLMENT',
    attributes: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'Grade'],
    candidate_keys: [['StudentID', 'CourseID']],
    functional_dependencies: [
      { id: 'fd-1', left: ['StudentID'], right: ['StudentName'] },
      { id: 'fd-2', left: ['CourseID'], right: ['CourseName'] },
      { id: 'fd-3', left: ['StudentID', 'CourseID'], right: ['Grade'] },
    ],
    multivalued_dependencies: [],
  };

  const mockAnalysis: FullNormalizationAnalysisResult = {
    relation_name: 'ENROLLMENT',
    attributes: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'Grade'],
    input_fingerprint: 'test-fingerprint',
    candidate_keys: [['StudentID', 'CourseID']],
    prime_attributes: ['StudentID', 'CourseID'],
    non_prime_attributes: ['StudentName', 'CourseName', 'Grade'],
    summary_verdict: 'Relation violates 2NF due to partial dependencies.',
    nf1: {
      status: 'SATISFIED',
      is_satisfied: true,
      reason_code: 'ATOMIC_BY_DEFINITION',
      message: 'All attributes are atomic',
      violations: [],
      sample_rows_analyzed: 0,
      violating_cell_count: 0,
      reasoning_steps: [],
      limitations: [],
    },
    nf2: {
      status: 'VIOLATED',
      is_satisfied: false,
      reason_code: 'PARTIAL_DEPENDENCY_FOUND',
      message: '2NF Violated: Partial dependencies found',
      prerequisite_1nf_status: 'SATISFIED',
      candidate_keys: [['StudentID', 'CourseID']],
      prime_attributes: ['StudentID', 'CourseID'],
      non_prime_attributes: ['StudentName', 'CourseName', 'Grade'],
      partial_dependencies: [
        {
          functional_dependency: { left: ['StudentID'], right: ['StudentName'] },
          determinant: ['StudentID'],
          dependent_attributes: ['StudentName'],
          affected_candidate_key: ['StudentID', 'CourseID'],
          is_proper_subset: true,
          dependent_is_non_prime: true,
          reason_code: 'PARTIAL_DEPENDENCY',
          explanation: 'StudentID is a proper subset of candidate key and determines non-prime attribute StudentName',
        },
      ],
      full_dependencies: [],
      reasoning_steps: [],
      limitations: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders journey mode with stage hero and stage navigation tabs', () => {
    render(
      <VisualizationWorkspace
        schema={mockSchema}
        analysisResult={mockAnalysis}
        initialMode="journey"
        initialStage="2NF"
      />
    );

    // Mode buttons
    expect(screen.getByRole('button', { name: /Journey/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dependency Graph/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Closure Player/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Decomposition Lineage/i })).toBeInTheDocument();

    // Journey track stage buttons
    expect(screen.getByRole('button', { name: /1NF/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /2NF/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3NF/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /4NF/i })).toBeInTheDocument();

    // Active stage headline
    expect(screen.getByText(/Second Normal Form/i)).toBeInTheDocument();
  });

  it('switches between visualization modes smoothly', async () => {
    render(
      <VisualizationWorkspace
        schema={mockSchema}
        analysisResult={mockAnalysis}
        initialMode="journey"
      />
    );

    // Switch to Dependency Graph mode
    const graphModeBtn = screen.getByRole('button', { name: /Dependency Graph/i });
    fireEvent.click(graphModeBtn);

    // Switch to Closure Player mode
    const closureModeBtn = screen.getByRole('button', { name: /Closure Player/i });
    fireEvent.click(closureModeBtn);
    expect(screen.getByText(/Interactive Attribute Closure Player/i)).toBeInTheDocument();

    // Switch to Decomposition Lineage mode
    const decompModeBtn = screen.getByRole('button', { name: /Decomposition Lineage/i });
    fireEvent.click(decompModeBtn);
    expect(
      screen.getByText(/Hierarchical Decomposition Lineage Tree|No decomposition tree available/i)
    ).toBeInTheDocument();
  });

  it('displays synchronized detail panel inspector', () => {
    render(
      <VisualizationWorkspace
        schema={mockSchema}
        analysisResult={mockAnalysis}
        initialMode="journey"
      />
    );

    expect(screen.getByText(/Inspector \/ Detail Panel/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Click any attribute node, dependency edge, candidate key/i)
    ).toBeInTheDocument();
  });

  it('renders accessible legend with dependency indicators', () => {
    render(
      <VisualizationWorkspace
        schema={mockSchema}
        analysisResult={mockAnalysis}
      />
    );

    expect(screen.getByText(/Functional Dependency/i)).toBeInTheDocument();
    expect(screen.getByText(/Multivalued Dependency/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Candidate Key/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Prime Attribute/i).length).toBeGreaterThan(0);
  });

  it('allows maximizing and minimizing the dependency graph', async () => {
    render(
      <VisualizationWorkspace
        schema={mockSchema}
        analysisResult={mockAnalysis}
        initialMode="journey"
      />
    );

    const maximizeBtn = await screen.findByRole('button', { name: /Maximize Graph/i });
    expect(maximizeBtn).toBeInTheDocument();
    fireEvent.click(maximizeBtn);

    expect(screen.getByRole('dialog', { name: /Maximized Dependency Graph View/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Minimize Graph/i })).toBeInTheDocument();

    const exitBtn = screen.getByRole('button', { name: /Minimize Graph/i });
    fireEvent.click(exitBtn);

    expect(screen.queryByRole('dialog', { name: /Maximized Dependency Graph View/i })).not.toBeInTheDocument();
  });
});

