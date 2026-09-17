import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ReportDownloadModal } from '../features/reports/ReportDownloadModal';
import { reportService } from '../services/reportService';
import { NormalizationAssistant } from '../features/assistant/NormalizationAssistant';
import { assistantService } from '../services/assistantService';
import { ExperimentDiff } from '../features/experiments/ExperimentDiff';
import { LearnPage } from '../pages/LearnPage';
import { HelpPage } from '../pages/HelpPage';
import { DevelopedByPage } from '../pages/DevelopedByPage';
import type {
  RelationSchema,
  FullNormalizationAnalysisResult,
  ExperimentDiff as ExperimentDiffType,
} from '../types';

const MOCK_SCHEMA: RelationSchema = {
  name: 'ENROLLMENT',
  attributes: ['StudentID', 'CourseID', 'StudentName', 'Grade'],
  candidate_keys: [['StudentID', 'CourseID']],
  functional_dependencies: [
    { left: ['StudentID'], right: ['StudentName'] },
    { left: ['StudentID', 'CourseID'], right: ['Grade'] },
  ],
  multivalued_dependencies: [],
  sample_data: [
    { StudentID: 'S1', CourseID: 'CS101', StudentName: 'Alice', Grade: 'A' },
  ],
};

const MOCK_ANALYSIS_RESULT: FullNormalizationAnalysisResult = {
  relation_name: 'ENROLLMENT',
  attributes: ['StudentID', 'CourseID', 'StudentName', 'Grade'],
  input_fingerprint: 'fp-phase11-test',
  candidate_keys: [['StudentID', 'CourseID']],
  prime_attributes: ['StudentID', 'CourseID'],
  non_prime_attributes: ['StudentName', 'Grade'],
  summary_verdict: 'Relation satisfies 1NF but violates 2NF due to partial dependency.',
  highest_confirmed_normal_form: '1NF' as any,
  nf1: {
    status: 'SATISFIED' as any,
    is_satisfied: true,
    reason_code: 'ATOMIC_DOMAINS',
    message: 'Domain values are atomic.',
    non_atomic_attributes: [],
    sample_data_evaluated: true,
    violations: [],
    reasoning_steps: [],
    limitations: [],
  },
  nf2: {
    status: 'VIOLATED' as any,
    is_satisfied: false,
    reason_code: 'PARTIAL_DEPENDENCY',
    message: 'Partial dependency detected: StudentID -> StudentName.',
    prerequisite_1nf_status: 'SATISFIED' as any,
    candidate_keys: [['StudentID', 'CourseID']],
    composite_keys: [['StudentID', 'CourseID']],
    prime_attributes: ['StudentID', 'CourseID'],
    non_prime_attributes: ['StudentName', 'Grade'],
    partial_dependencies: [
      {
        determinant: ['StudentID'],
        dependent_attributes: ['StudentName'],
        composite_key: ['StudentID', 'CourseID'],
        is_partial: true,
        reason: 'StudentID is a proper subset of candidate key',
      },
    ],
    reasoning_steps: [],
    limitations: [],
  },
  nf3: {
    status: 'BLOCKED_BY_PREREQUISITE' as any,
    is_satisfied: false,
    reason_code: 'BLOCKED',
    message: 'Blocked by 2NF prerequisite.',
    prerequisite_2nf_status: 'VIOLATED' as any,
    candidate_keys: [['StudentID', 'CourseID']],
    prime_attributes: ['StudentID', 'CourseID'],
    non_prime_attributes: ['StudentName', 'Grade'],
    dependencies_analyzed: [],
    trivial_dependencies: [],
    satisfied_dependencies: [],
    violations: [],
    transitive_patterns: [],
    reasoning_steps: [],
    limitations: [],
  },
  nf4: {
    status: 'BLOCKED_BY_PREREQUISITE' as any,
    is_satisfied: false,
    reason_code: 'BLOCKED',
    message: 'Blocked by 3NF prerequisite.',
    prerequisite_3nf_status: 'BLOCKED_BY_PREREQUISITE' as any,
    candidate_keys: [['StudentID', 'CourseID']],
    mvds_analyzed: [],
    trivial_mvds: [],
    non_trivial_mvds: [],
    violations: [],
    reasoning_steps: [],
    limitations: [],
  },
};

describe('Phase 11: End-to-End QA & UI Integration Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------
  // 1. Report Download Modal: Formats, Section Toggles, Native Print
  // -------------------------------------------------------------------
  it('renders report download modal with all format options and section toggles', () => {
    render(
      <ReportDownloadModal
        isOpen={true}
        onClose={vi.fn()}
        schema={MOCK_SCHEMA}
        analysisResult={MOCK_ANALYSIS_RESULT}
      />
    );

    // Header & Format Buttons
    expect(screen.getByText(/Generate Academic Normalization Report/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF Document/i)).toBeInTheDocument();
    expect(screen.getByText(/Microsoft Word/i)).toBeInTheDocument();
    expect(screen.getByText(/Plain Text/i)).toBeInTheDocument();

    // Section checkboxes / labels
    expect(screen.getByText(/User Inputs/i)).toBeInTheDocument();
    expect(screen.getByText(/Intermediate Derivations/i)).toBeInTheDocument();
    expect(screen.getByText(/Final Output Verdicts/i)).toBeInTheDocument();
    expect(screen.getByText(/Decomposition Proposals/i)).toBeInTheDocument();
    expect(screen.getByText(/Reconstruction Verification/i)).toBeInTheDocument();

    // Native browser print button
    expect(screen.getByText(/Print \/ Save PDF/i)).toBeInTheDocument();
  });

  it('triggers report generation and download service when download button is clicked', async () => {
    const triggerSpy = vi.spyOn(reportService, 'triggerDownload').mockImplementation(() => {});
    const generateSpy = vi.spyOn(reportService, 'generateReport').mockResolvedValue({
      blob: new Blob(['fake-docx-content']),
      filename: 'normalization-report-ENROLLMENT.docx',
    });

    render(
      <ReportDownloadModal
        isOpen={true}
        onClose={vi.fn()}
        schema={MOCK_SCHEMA}
        analysisResult={MOCK_ANALYSIS_RESULT}
      />
    );

    // Switch format to Word
    const docxBtn = screen.getByText(/Microsoft Word/i);
    fireEvent.click(docxBtn);

    // Trigger download
    const downloadBtn = screen.getByRole('button', { name: /Generate & Download/i });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(generateSpy).toHaveBeenCalledTimes(1);
      expect(generateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'docx',
          schema_definition: MOCK_SCHEMA,
          analysis_result: MOCK_ANALYSIS_RESULT,
        })
      );
      expect(triggerSpy).toHaveBeenCalledWith(expect.any(Blob), 'normalization-report-ENROLLMENT.docx');
    });
  });

  it('triggers reportService.printHtmlReport when Print / Save PDF button is pressed', () => {
    const printSpy = vi.spyOn(reportService, 'printHtmlReport').mockImplementation(() => {});

    render(
      <ReportDownloadModal
        isOpen={true}
        onClose={vi.fn()}
        schema={MOCK_SCHEMA}
        analysisResult={MOCK_ANALYSIS_RESULT}
      />
    );

    const printBtn = screen.getByText(/Print \/ Save PDF/i);
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalledTimes(1);
    expect(printSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'pdf',
        schema_definition: MOCK_SCHEMA,
        analysis_result: MOCK_ANALYSIS_RESULT,
      })
    );
    printSpy.mockRestore();
  });

  // -------------------------------------------------------------------
  // 2. Contextual Assistant: Interactive Drawer & Grounded Responses
  // -------------------------------------------------------------------
  it('renders contextual assistant with suggested prompt chips and communicates with service', async () => {
    vi.spyOn(assistantService, 'askAssistant').mockResolvedValue({
      answer: '2NF is violated because StudentID determines StudentName, which is a partial dependency.',
      intent: 'why_2nf_fail',
      evidence_ids: ['fd-1'],
      suggested_actions: ['open_experiment'],
    });

    render(
      <NormalizationAssistant
        isOpen={true}
        onClose={vi.fn()}
        schema={MOCK_SCHEMA}
        analysis={MOCK_ANALYSIS_RESULT}
        onOpenExperiment={vi.fn()}
      />
    );

    // Header and suggested chips
    expect(screen.getByRole('heading', { name: /Normalization Assistant/i })).toBeInTheDocument();
    expect(screen.getByText(/Why is this relation not in 2NF\?/i)).toBeInTheDocument();

    // Click suggested chip
    const chipBtn = screen.getByText(/Why is this relation not in 2NF\?/i);
    fireEvent.click(chipBtn);

    await waitFor(() => {
      expect(assistantService.askAssistant).toHaveBeenCalled();
      expect(
        screen.getByText(/2NF is violated because StudentID determines StudentName/i)
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------
  // 3. What-If Experiment Sandbox: Immutability & Mathematical Diff
  // -------------------------------------------------------------------
  it('renders experiment diff showing normal form progression and reasoning steps', () => {
    const modifiedAnalysis: FullNormalizationAnalysisResult = {
      ...MOCK_ANALYSIS_RESULT,
      highest_confirmed_normal_form: '3NF' as any,
      nf2: {
        ...MOCK_ANALYSIS_RESULT.nf2!,
        status: 'SATISFIED' as any,
        is_satisfied: true,
        partial_dependencies: [],
      },
      nf3: {
        ...MOCK_ANALYSIS_RESULT.nf3!,
        status: 'SATISFIED' as any,
        is_satisfied: true,
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

    render(
      <ExperimentDiff
        originalAnalysis={MOCK_ANALYSIS_RESULT}
        modifiedAnalysis={modifiedAnalysis}
        diff={diff}
        reasoningChanges={[
          'Removed partial dependency StudentID → StudentName.',
          'Eliminated non-prime partial dependencies, promoting relation to 2NF and 3NF.',
        ]}
      />
    );

    // Verify progression comparison renders
    expect(screen.getByText(/Normal Form Progression Comparison/i)).toBeInTheDocument();
    expect(screen.getByText(/Why Did It Change\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Removed partial dependency StudentID → StudentName/i)).toBeInTheDocument();
  });

  // -------------------------------------------------------------------
  // 4. Accessibility & ARIA semantics
  // -------------------------------------------------------------------
  it('provides proper ARIA role and attributes on modal dialogs', () => {
    render(
      <ReportDownloadModal
        isOpen={true}
        onClose={vi.fn()}
        schema={MOCK_SCHEMA}
        analysisResult={MOCK_ANALYSIS_RESULT}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'report-modal-title');
  });

  // -------------------------------------------------------------------
  // 5. Educational Pages (Learn, Help, Developed By) Smoke Tests
  // -------------------------------------------------------------------
  it('renders Learn, Help, and Developed By pages with complete educational contents', () => {
    const { unmount: unmountLearn } = render(
      <BrowserRouter>
        <LearnPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/DBMS Normalization Learning Center/i)).toBeInTheDocument();
    unmountLearn();

    const { unmount: unmountHelp } = render(
      <BrowserRouter>
        <HelpPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/User Manual & Technical Documentation/i)).toBeInTheDocument();
    unmountHelp();

    const { unmount: unmountDev } = render(
      <BrowserRouter>
        <DevelopedByPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/Project Attribution & Academic Credits/i)).toBeInTheDocument();
    expect(screen.getByText(/Raj Mishra/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr\. Swaminathan A/i)).toBeInTheDocument();
    unmountDev();
  });
});
