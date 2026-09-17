import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WhyModal } from '../features/explainability/WhyModal';
import { NormalizationAssistant } from '../features/assistant/NormalizationAssistant';
import { ExperimentDiff } from '../features/experiments/ExperimentDiff';
import { PracticeMode } from '../features/practice/PracticeMode';
import { assistantService } from '../services/assistantService';
import * as practiceService from '../services/practiceService';
import type {
  ExplainWhyData,
  RelationSchema,
  FullNormalizationAnalysisResult,
  ExperimentDiff as ExperimentDiffType,
  PracticeExercise,
} from '../types';

describe('Phase 9 Feature Components', () => {
  const sampleSchema: RelationSchema = {
    name: 'ENROLLMENT',
    attributes: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'Grade'],
    candidate_keys: [['StudentID', 'CourseID']],
    primary_key: ['StudentID', 'CourseID'],
    functional_dependencies: [
      { id: 'fd-1', left: ['StudentID'], right: ['StudentName'] },
      { id: 'fd-2', left: ['CourseID'], right: ['CourseName'] },
      { id: 'fd-3', left: ['StudentID', 'CourseID'], right: ['Grade'] },
    ],
    multivalued_dependencies: [],
    sample_data: [],
  };

  const sampleAnalysis: FullNormalizationAnalysisResult = {
    relation_name: 'ENROLLMENT',
    attributes: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'Grade'],
    input_fingerprint: 'test-fingerprint',
    candidate_keys: [['StudentID', 'CourseID']],
    prime_attributes: ['StudentID', 'CourseID'],
    non_prime_attributes: ['StudentName', 'CourseName', 'Grade'],
    highest_confirmed_normal_form: '1NF',
    summary_verdict: 'Violates 2NF due to partial dependencies.',
    nf1: {
      status: 'SATISFIED',
      is_satisfied: true,
      reason_code: 'ALL_VALUES_ATOMIC',
      message: 'All values atomic.',
      violations: [],
      attributes_involved: [],
      sample_cells_involved: [],
      reasoning_steps: ['All attributes atomic.'],
      limitations: [],
    },
    nf2: {
      status: 'VIOLATED',
      is_satisfied: false,
      reason_code: 'PARTIAL_DEPENDENCIES_FOUND',
      message: 'Partial dependencies detected.',
      prerequisite_1nf_status: 'SATISFIED',
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
          explanation: 'StudentID is a proper subset of key.',
        },
      ],
      reasoning_steps: [
        { step_number: 1, title: 'Step 1', description: 'Found partial dependency.' },
      ],
    },
    nf3: null,
    nf4: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('WhyModal', () => {
    const explainData: ExplainWhyData = {
      title: 'Why does ENROLLMENT violate 2NF?',
      stage: '2NF',
      status: 'VIOLATED',
      formalCondition: 'Every non-prime attribute must be fully functionally dependent on every candidate key.',
      checkedItem: 'StudentID → StudentName',
      evidence: {
        candidateKeys: [['StudentID', 'CourseID']],
        primeAttributes: ['StudentID', 'CourseID'],
        closure: 'StudentID⁺ = {StudentID, StudentName}',
        isSuperkey: false,
        isPrime: false,
      },
      conclusion: 'Determinant StudentID is a proper subset of candidate key (StudentID, CourseID).',
      remedy: 'Decompose relation into ENROLLMENT_1(StudentID, StudentName).',
    };

    it('renders explain-why details and formal condition', () => {
      const handleClose = vi.fn();
      const handleExperiment = vi.fn();

      render(
        <WhyModal
          isOpen={true}
          onClose={handleClose}
          data={explainData}
          onOpenExperiment={handleExperiment}
        />
      );

      expect(screen.getByText('Why does ENROLLMENT violate 2NF?')).toBeInTheDocument();
      expect(screen.getByText(/Formal Relational Condition/i)).toBeInTheDocument();
      expect(screen.getByText(/Every non-prime attribute must be fully functionally dependent/i)).toBeInTheDocument();
      expect(screen.getByText(/StudentID → StudentName/i)).toBeInTheDocument();
      expect(screen.getByText(/ENROLLMENT_1\(StudentID, StudentName\)/i)).toBeInTheDocument();

      // Click test in experiment
      const expBtn = screen.getByText(/Test in Experiment Mode/i);
      fireEvent.click(expBtn);
      expect(handleExperiment).toHaveBeenCalled();

      // Click close button
      const closeBtn = screen.getByLabelText(/Close explanation modal/i);
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    });

    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <WhyModal
          isOpen={false}
          onClose={() => {}}
          data={explainData}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('NormalizationAssistant', () => {
    it('renders suggested prompts and communicates with assistant service', async () => {
      vi.spyOn(assistantService, 'askAssistant').mockResolvedValue({
        answer: 'The candidate keys for ENROLLMENT are (StudentID, CourseID).',
        intent: 'candidate_keys',
        evidence_ids: ['ck-1'],
        suggested_actions: ['open_experiment'],
        supported: true,
      });

      render(
        <NormalizationAssistant
          isOpen={true}
          onClose={() => {}}
          schema={sampleSchema}
          analysis={sampleAnalysis}
          onOpenExperiment={() => {}}
        />
      );

      expect(screen.getByText(/DBMS Normalization Assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/Deterministic Engine • Grounded in Analysis/i)).toBeInTheDocument();

      // Click suggested chip
      const chip = screen.getByText('What are my candidate keys?');
      fireEvent.click(chip);

      await waitFor(() => {
        expect(assistantService.askAssistant).toHaveBeenCalledWith(
          expect.objectContaining({
            question: 'What are my candidate keys?',
            context: expect.objectContaining({
              relation: 'ENROLLMENT',
              highest_confirmed_normal_form: '1NF',
            }),
          })
        );
        expect(screen.getByText(/The candidate keys for ENROLLMENT are \(StudentID, CourseID\)\./i)).toBeInTheDocument();
        expect(screen.getByText(/Test in Experiment/i)).toBeInTheDocument();
      });
    });
  });

  describe('ExperimentDiff', () => {
    const modifiedAnalysis: FullNormalizationAnalysisResult = {
      ...sampleAnalysis,
      highest_confirmed_normal_form: '3NF',
      nf2: {
        ...sampleAnalysis.nf2!,
        status: 'SATISFIED',
        is_satisfied: true,
        partial_dependencies: [],
      },
    };

    const diff: ExperimentDiffType = {
      attributes_added: [],
      attributes_removed: [],
      dependencies_added: [],
      dependencies_removed: [{ left: ['StudentID'], right: ['StudentName'], notation: 'StudentID → StudentName' }],
      mvds_added: [],
      mvds_removed: [],
      candidate_keys_added: [],
      candidate_keys_removed: [],
      prime_attributes_added: [],
      prime_attributes_removed: [],
      normal_forms_changed: [{ stage: '2NF', before: 'VIOLATED', after: 'SATISFIED' }],
      violations_added: [],
      violations_removed: [],
      highest_normal_form_before: '1NF',
      highest_normal_form_after: '3NF',
    };

    it('renders progression shift and reasoning trace', () => {
      render(
        <ExperimentDiff
          originalAnalysis={sampleAnalysis}
          modifiedAnalysis={modifiedAnalysis}
          diff={diff}
          reasoningChanges={[
            'Removed partial dependency StudentID → StudentName.',
            'Eliminated non-prime partial dependencies, promoting relation to 2NF and 3NF.',
          ]}
        />
      );

      expect(screen.getByText(/Normal Form Progression Comparison/i)).toBeInTheDocument();
      expect(screen.getAllByText('1NF').length).toBeGreaterThan(0);
      expect(screen.getAllByText('3NF').length).toBeGreaterThan(0);
      expect(screen.getByText(/Why Did It Change\? \(Pedagogical Derivation\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Removed partial dependency StudentID → StudentName/i)).toBeInTheDocument();
    });
  });

  describe('PracticeMode', () => {
    const mockExercises: PracticeExercise[] = [
      {
        id: 'ex-1',
        type: 'candidate-key',
        title: 'Candidate Key Discovery',
        prompt: 'Given relation R(A, B, C) and F = {A -> B, B -> C}, what is the candidate key?',
        schema_name: 'R',
        attributes: ['A', 'B', 'C'],
        functional_dependencies: [
          { id: '1', left: ['A'], right: ['B'] },
          { id: '2', left: ['B'], right: ['C'] },
        ],
        multivalued_dependencies: [],
        options: ['A', 'B', 'C', 'AB'],
        hint: 'Compute closure of attribute A.',
      },
    ];

    it('loads and displays practice exercises and handles submission', async () => {
      vi.spyOn(practiceService, 'fetchPracticeExercises').mockResolvedValue(mockExercises);
      vi.spyOn(practiceService, 'verifyPracticeAnswer').mockResolvedValue({
        is_correct: true,
        expected_answer: 'A',
        feedback: 'A+ = {A, B, C}, which covers all attributes.',
        reasoning_steps: ['Closure calculation verified by real candidate key engine.'],
      });

      render(<PracticeMode />);

      await waitFor(() => {
        expect(screen.getAllByText(/Candidate Key Discovery/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/what is the candidate key\?/i).length).toBeGreaterThan(0);
      });

      // Show hint
      const hintBtn = screen.getByText(/Show Pedagogical Hint/i);
      fireEvent.click(hintBtn);
      expect(screen.getByText('Compute closure of attribute A.')).toBeInTheDocument();

      // Select option 'A'
      const optionA = screen.getByDisplayValue('A');
      fireEvent.click(optionA);

      // Submit
      const submitBtn = screen.getByText(/Check Answer/i);
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(practiceService.verifyPracticeAnswer).toHaveBeenCalledWith(
          expect.objectContaining({
            exercise_id: 'ex-1',
            submitted_answer: 'A',
          })
        );
        expect(screen.getByText(/Correct! Mathematically Verified/i)).toBeInTheDocument();
        expect(screen.getByText(/A\+ = \{A, B, C\}/i)).toBeInTheDocument();
      });
    });
  });
});
