import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LearnPage } from '../pages/LearnPage';
import { HelpPage } from '../pages/HelpPage';
import { DevelopedByPage } from '../pages/DevelopedByPage';
import { ReportDownloadModal } from '../features/reports/ReportDownloadModal';
import { reportService } from '../services/reportService';
import type { RelationSchema, FullNormalizationAnalysisResult } from '../types';

const MOCK_SCHEMA: RelationSchema = {
  name: 'ENROLLMENT',
  attributes: ['StudentID', 'CourseID', 'StudentName', 'Grade'],
  candidate_keys: [['StudentID', 'CourseID']],
  functional_dependencies: [
    { left: ['StudentID'], right: ['StudentName'] },
    { left: ['StudentID', 'CourseID'], right: ['Grade'] },
  ],
  multivalued_dependencies: [],
};

const MOCK_ANALYSIS_RESULT: FullNormalizationAnalysisResult = {
  relation_name: 'ENROLLMENT',
  attributes: ['StudentID', 'CourseID', 'StudentName', 'Grade'],
  input_fingerprint: 'test-fingerprint',
  candidate_keys: [['StudentID', 'CourseID']],
  prime_attributes: ['StudentID', 'CourseID'],
  non_prime_attributes: ['StudentName', 'Grade'],
  summary_verdict: 'Relation satisfies 1NF but violates 2NF.',
  highest_confirmed_normal_form: '1NF' as any,
  nf1: {
    status: 'SATISFIED' as any,
    is_satisfied: true,
    reason_code: 'ATOMIC_DOMAINS',
    message: 'Domain values are atomic.',
    non_atomic_attributes: [],
    sample_data_evaluated: false,
    violations: [],
    reasoning_steps: [],
    limitations: [],
  },
  nf2: {
    status: 'VIOLATED' as any,
    is_satisfied: false,
    reason_code: 'PARTIAL_DEPENDENCY',
    message: 'Partial dependency detected.',
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
        reason: 'StudentID is proper subset',
      },
    ],
    reasoning_steps: [],
    limitations: [],
  },
  nf3: {
    status: 'BLOCKED_BY_PREREQUISITE' as any,
    is_satisfied: false,
    reason_code: 'BLOCKED',
    message: 'Blocked by 2NF violation.',
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

describe('Phase 10: Learn, Help, Developed By, and Report Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('LearnPage renders syllabus topics, search bar, and switches tabs', async () => {
    render(
      <BrowserRouter>
        <LearnPage />
      </BrowserRouter>
    );

    // Verify main headings
    expect(screen.getByText(/DBMS Normalization Learning Center/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Relational Model Foundations/i })).toBeInTheDocument();

    // Test search filter
    const searchInput = screen.getByPlaceholderText(/Search topics/i);
    fireEvent.change(searchInput, { target: { value: 'closure' } });
    expect(screen.getAllByText(/Attribute Closure/i).length).toBeGreaterThan(0);

    // Switch to Educational Video tab
    const videoTab = screen.getByRole('tab', { name: /Educational Video Lecture/i });
    fireEvent.click(videoTab);
    expect(screen.getByText(/Comprehensive DBMS Normalization Lecture/i)).toBeInTheDocument();

    // Switch to References tab
    const refsTab = screen.getByRole('tab', { name: /Textbooks & Research Papers/i });
    fireEvent.click(refsTab);
    expect(screen.getByText(/Database System Concepts/i)).toBeInTheDocument();
    expect(screen.getByText(/Abraham Silberschatz/i)).toBeInTheDocument();
  });

  it('HelpPage renders the complete 13-step workflow manual and syntax specs', () => {
    render(
      <BrowserRouter>
        <HelpPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/User Manual & Technical Documentation/i)).toBeInTheDocument();
    expect(screen.getByText(/Step-by-Step User Workflow/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Schema Builder/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Input Syntax Standards/i })).toBeInTheDocument();
    expect(screen.getByText(/Interface Controls & Button Glossary/i)).toBeInTheDocument();
  });

  it('DevelopedByPage displays exact supervisor metadata and student team', () => {
    render(
      <BrowserRouter>
        <DevelopedByPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Dr. Swaminathan A')).toBeInTheDocument();
    expect(screen.getByText('Assistant Professor')).toBeInTheDocument();
    expect(screen.getByText(/Department of Computer Science and Engineering/i)).toBeInTheDocument();
    expect(screen.getByText('Raj Mishra')).toBeInTheDocument();
    expect(screen.getByText(/25BCE1565/i)).toBeInTheDocument();
    expect(screen.getByText('Kunal Anil Deshmukh')).toBeInTheDocument();
    expect(screen.getByText(/25BCE1586/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Portrait of Dr\. Swaminathan A/i)).toBeInTheDocument();
  });

  it('ReportDownloadModal renders format options and executes report generation', async () => {
    const triggerSpy = vi.spyOn(reportService, 'triggerDownload').mockImplementation(() => {});
    const generateSpy = vi.spyOn(reportService, 'generateReport').mockResolvedValue({
      blob: new Blob(['fake report']),
      filename: 'normalization-report-ENROLLMENT.pdf',
    });

    const onClose = vi.fn();

    render(
      <ReportDownloadModal
        isOpen={true}
        onClose={onClose}
        schema={MOCK_SCHEMA}
        analysisResult={MOCK_ANALYSIS_RESULT}
      />
    );

    expect(screen.getByText(/Generate Academic Normalization Report/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF Document/i)).toBeInTheDocument();
    expect(screen.getByText(/Microsoft Word/i)).toBeInTheDocument();
    expect(screen.getByText(/Plain Text/i)).toBeInTheDocument();

    // Select DOCX format
    const docxBtn = screen.getByText(/Microsoft Word/i);
    fireEvent.click(docxBtn);

    // Trigger download
    const downloadBtn = screen.getByRole('button', { name: /Generate & Download/i });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(generateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'docx',
        })
      );
      expect(triggerSpy).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('ReportDownloadModal allows toggling section checkboxes', async () => {
    const generateSpy = vi.spyOn(reportService, 'generateReport').mockResolvedValue({
      blob: new Blob(['fake report']),
      filename: 'normalization-report-ENROLLMENT.pdf',
    });
    vi.spyOn(reportService, 'triggerDownload').mockImplementation(() => {});

    render(
      <ReportDownloadModal
        isOpen={true}
        onClose={vi.fn()}
        schema={MOCK_SCHEMA}
        analysisResult={MOCK_ANALYSIS_RESULT}
      />
    );

    // Toggle off a section (e.g., decomposition)
    const decompToggle = screen.getByText('Decomposition Proposals');
    fireEvent.click(decompToggle);

    const downloadBtn = screen.getByRole('button', { name: /Generate & Download/i });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(generateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          sections: expect.objectContaining({
            decomposition: false,
          }),
        })
      );
    });
  });

  it('DevelopedByPage displays academic evaluation attestation and project details', () => {
    render(
      <BrowserRouter>
        <DevelopedByPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Institutional Evaluation Attestation/i)).toBeInTheDocument();
    expect(screen.getByText(/Project Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/Assistant Professor/i)).toBeInTheDocument();
  });
});

