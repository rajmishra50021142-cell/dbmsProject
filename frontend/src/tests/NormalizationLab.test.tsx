import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NormalizationLab } from '../features/normalization/NormalizationLab';
import { normalizationService } from '../services/normalizationService';
import type { FullNormalizationAnalysisResult, RelationSchema } from '../types';

describe('NormalizationLab Component (Phase 6)', () => {
  const mockAnalysisResult: FullNormalizationAnalysisResult = {
    relation_name: 'ENROLLMENT',
    attributes: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'Grade'],
    input_fingerprint: 'abc123def456',
    candidate_keys: [['StudentID', 'CourseID']],
    prime_attributes: ['StudentID', 'CourseID'],
    non_prime_attributes: ['StudentName', 'CourseName', 'Grade'],
    highest_confirmed_normal_form: '1NF',
    summary_verdict: "Relation 'ENROLLMENT' violates 2NF due to 2 partial dependency violation(s). Decomposition recommended.",
    nf1: {
      status: 'VIOLATED',
      is_satisfied: false,
      reason_code: 'NON_ATOMIC_VALUES_DETECTED',
      message: '1NF is violated: found 1 non-atomic cell representation(s).',
      violations: [
        {
          attribute: 'CourseName',
          row_index: 0,
          observed_value: 'DBMS, OS',
          reason_code: 'NON_ATOMIC_VALUE',
          explanation: "Row #1 attribute 'CourseName' contains multi-valued cell: \"DBMS, OS\".",
        },
      ],
      attributes_involved: ['CourseName'],
      sample_cells_involved: [],
      reasoning_steps: ['Detected non-atomic values in 1 sample row(s) across attribute(s): CourseName.'],
      transformation: {
        original_tuples: [{ StudentID: '101', CourseName: 'DBMS, OS' }],
        transformed_tuples: [
          { StudentID: '101', CourseName: 'DBMS' },
          { StudentID: '101', CourseName: 'OS' },
        ],
        explanation: 'Flattened multi-valued attributes into 2 atomic 1NF row(s).',
      },
      limitations: [],
    },
    nf2: {
      status: 'BLOCKED_BY_PREREQUISITE',
      is_satisfied: false,
      reason_code: 'PREREQUISITE_1NF_VIOLATED',
      message: '2NF analysis is blocked by 1NF prerequisite violations, though partial dependencies were detected in schema dependencies.',
      prerequisite_1nf_status: 'VIOLATED',
      candidate_keys: [['StudentID', 'CourseID']],
      composite_keys: [['StudentID', 'CourseID']],
      prime_attributes: ['StudentID', 'CourseID'],
      non_prime_attributes: ['StudentName', 'CourseName', 'Grade'],
      partial_dependencies: [
        {
          determinant: ['StudentID'],
          dependent_attributes: ['StudentName'],
          affected_candidate_key: ['StudentID', 'CourseID'],
          is_implied: false,
          source_fd: 'StudentID → StudentName',
          explanation: 'Determinant (StudentID) is a proper subset of candidate key (StudentID, CourseID) and determines non-prime attribute(s) {StudentName}.',
        },
        {
          determinant: ['CourseID'],
          dependent_attributes: ['CourseName'],
          affected_candidate_key: ['StudentID', 'CourseID'],
          is_implied: false,
          source_fd: 'CourseID → CourseName',
          explanation: 'Determinant (CourseID) is a proper subset of candidate key (StudentID, CourseID) and determines non-prime attribute(s) {CourseName}.',
        },
      ],
      reasoning_steps: [
        {
          step_number: 1,
          title: '1NF Prerequisite Assessment',
          description: '1NF status evaluated as VIOLATED. Official 2NF status is blocked by prerequisite.',
        },
        {
          step_number: 2,
          title: 'Partial Dependency Analysis',
          description: 'Detected 2 partial dependency violation(s).',
        },
      ],
      decomposition_proposal: {
        source_relation: 'ENROLLMENT',
        proposed_relations: [
          {
            name: 'ENROLLMENT_StudentID',
            attributes: ['StudentID', 'StudentName'],
            primary_key: ['StudentID'],
            functional_dependencies: [],
            purpose: 'Isolates partial dependency (StudentID) → {StudentName}.',
          },
          {
            name: 'ENROLLMENT_CourseID',
            attributes: ['CourseID', 'CourseName'],
            primary_key: ['CourseID'],
            functional_dependencies: [],
            purpose: 'Isolates partial dependency (CourseID) → {CourseName}.',
          },
          {
            name: 'ENROLLMENT_ASSIGNMENT',
            attributes: ['StudentID', 'CourseID', 'Grade'],
            primary_key: ['StudentID', 'CourseID'],
            functional_dependencies: [],
            purpose: 'Preserves primary candidate key and remaining attributes.',
          },
        ],
        reason_code: 'DECOMPOSE_PARTIAL_DEPENDENCIES',
        explanation: "Decomposed relation 'ENROLLMENT' into 3 sub-relations to eliminate partial dependencies.",
        verification_status: 'NOT_YET_VERIFIED',
      },
      limitations: [],
    },
    nf3: {
      status: 'BLOCKED_BY_PREREQUISITE',
      is_satisfied: false,
      message: '3NF analysis is blocked because 2NF is not satisfied.',
      prerequisite_2nf_status: 'BLOCKED_BY_PREREQUISITE',
      candidate_keys: [['StudentID', 'CourseID']],
      prime_attributes: ['StudentID', 'CourseID'],
      non_prime_attributes: ['StudentName', 'CourseName', 'Grade'],
      violations: [
        {
          functional_dependency: { id: 'fd-1', left: ['StudentID'], right: ['StudentName'] },
          determinant: ['StudentID'],
          dependent_attributes: ['StudentName'],
          determinant_is_superkey: false,
          dependent_attribute_prime_status: { StudentName: false },
          reason_code: 'TRANSITIVE_DEPENDENCY_VIOLATION',
          explanation: "FD StudentID → StudentName violates 3NF: StudentID is not a superkey and StudentName is not prime.",
          transitive_chain: ['StudentID, CourseID', 'StudentID', 'StudentName'],
        },
      ],
      evaluated_dependencies: [
        {
          determinant: ['StudentID'],
          dependent: ['StudentName'],
          is_trivial: false,
          determinant_is_superkey: false,
          dependent_is_prime: false,
          satisfies_3nf: false,
          explanation: 'Non-trivial FD violates 3NF.',
        },
      ],
      proposed_decompositions: [
        {
          name: 'ENROLLMENT_DECOMP_1',
          attributes: ['StudentID', 'StudentName'],
          primary_key: ['StudentID'],
          purpose: 'Isolates transitive FD StudentID → StudentName.',
          verification_status: 'NOT_YET_VERIFIED',
        },
      ],
      reasoning_steps: [
        'Checked 2NF prerequisite: BLOCKED_BY_PREREQUISITE.',
        'Evaluated 1 relevant dependency against 3NF rules.',
      ],
    },
    nf4: {
      status: 'BLOCKED_BY_PREREQUISITE',
      is_satisfied: false,
      message: '4NF analysis is blocked because 3NF is not satisfied.',
      prerequisite_3nf_status: 'BLOCKED_BY_PREREQUISITE',
      violations: [],
      evaluated_mvds: [],
      proposed_decompositions: [],
      reasoning_steps: ['Checked 3NF prerequisite: BLOCKED_BY_PREREQUISITE.'],
    },
  };

  const sampleSchema: RelationSchema = {
    name: 'ENROLLMENT',
    attributes: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'Grade'],
    candidate_keys: [['StudentID', 'CourseID']],
    functional_dependencies: [
      { id: 'fd-1', left: ['StudentID'], right: ['StudentName'] },
      { id: 'fd-2', left: ['CourseID'], right: ['CourseName'] },
      { id: 'fd-3', left: ['StudentID', 'CourseID'], right: ['Grade'] },
    ],
    multivalued_dependencies: [],
    sample_data: [
      { StudentID: '101', CourseID: 'CS101', StudentName: 'Alice', CourseName: 'DBMS, OS', Grade: 'A' },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(normalizationService, 'analyzeFullNormalization').mockResolvedValue(mockAnalysisResult);
    vi.spyOn(normalizationService, 'analyzeBasicNormalization').mockResolvedValue(mockAnalysisResult);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the Normalization Lab header, phase badges, and stepper', async () => {
    render(
      <MemoryRouter>
        <NormalizationLab initialSchema={sampleSchema} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Normalization Lab: 1NF–4NF Engine/i)).toBeInTheDocument();
    expect(screen.getByText('1NF–4NF Engine')).toBeInTheDocument();
    await waitFor(() => {
      expect(normalizationService.analyzeFullNormalization).toHaveBeenCalled();
      expect(screen.getByText(/Highest Form: 1NF/i)).toBeInTheDocument();
    });
  });

  it('displays 1NF violation and transformation preview button', async () => {
    render(
      <MemoryRouter>
        <NormalizationLab initialSchema={sampleSchema} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/First Normal Form \(1NF\) Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/Second Normal Form \(2NF\) Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/1NF Violated/i)).toBeInTheDocument();
      expect(screen.getByText(/1NF Transformation Preview/i)).toBeInTheDocument();
    });

    // Click preview button to open transformation modal
    const previewBtn = screen.getByText(/1NF Transformation Preview/i);
    fireEvent.click(previewBtn);

    expect(screen.getByText(/Conceptual 1NF Transformation Preview/i)).toBeInTheDocument();
    expect(screen.getByText(/1NF Atomic Tuples \(Unnested\)/i)).toBeInTheDocument();

    // Close preview modal
    fireEvent.click(screen.getByText(/Close Preview/i));
    expect(screen.queryByText(/Conceptual 1NF Transformation Preview/i)).not.toBeInTheDocument();
  });

  it('displays 2NF partial dependencies and decomposition proposal', async () => {
    render(
      <MemoryRouter>
        <NormalizationLab initialSchema={sampleSchema} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Second Normal Form \(2NF\) Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/Detected Partial Dependencies/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/ENROLLMENT_StudentID/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ENROLLMENT_CourseID/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ENROLLMENT_ASSIGNMENT/i).length).toBeGreaterThan(0);
  });

  it('renders Third Normal Form (3NF) card when 3NF stage is clicked', async () => {
    render(
      <MemoryRouter>
        <NormalizationLab initialSchema={sampleSchema} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('stage-step-3nf')).toBeInTheDocument();
    });

    const btn3NF = screen.getByTestId('stage-step-3nf');
    fireEvent.click(btn3NF);

    expect(screen.getByText(/Third Normal Form \(3NF\) Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Blocked by 2NF/i)).toBeInTheDocument();
    expect(screen.getByText(/Detected 3NF Violations/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ENROLLMENT_DECOMP_1/i).length).toBeGreaterThan(0);
  });

  it('renders Fourth Normal Form (4NF) card when 4NF stage is clicked', async () => {
    render(
      <MemoryRouter>
        <NormalizationLab initialSchema={sampleSchema} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('stage-step-4nf')).toBeInTheDocument();
    });

    const btn4NF = screen.getByTestId('stage-step-4nf');
    fireEvent.click(btn4NF);

    expect(screen.getByText(/Fourth Normal Form \(4NF\) Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Blocked by 3NF/i)).toBeInTheDocument();
    expect(screen.getByText(/No multivalued dependencies \(MVDs\) specified in this schema/i)).toBeInTheDocument();
  });
});
