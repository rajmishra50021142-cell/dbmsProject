import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { KeyAnalysisLab } from '../features/keys/KeyAnalysisLab';
import { keyService } from '../services/keyService';
import type { RelationSchema, CandidateKeyAnalysisResult, KeyVerificationResult } from '../types';

describe('KeyAnalysisLab Component (Phase 4)', () => {
  const sampleSchema: RelationSchema = {
    name: 'ENROLLMENT',
    attributes: ['StudentID', 'CourseID', 'Grade', 'StudentName'],
    candidate_keys: [['StudentID', 'CourseID'], ['StudentID', 'CourseID', 'Grade']],
    functional_dependencies: [
      { id: 'fd-1', left: ['StudentID', 'CourseID'], right: ['Grade'] },
      { id: 'fd-2', left: ['StudentID'], right: ['StudentName'] },
    ],
    multivalued_dependencies: [],
  };

  const mockAnalysisResult: CandidateKeyAnalysisResult = {
    relation_name: 'ENROLLMENT',
    discovered_candidate_keys: [['StudentID', 'CourseID']],
    prime_attributes: ['StudentID', 'CourseID'],
    non_prime_attributes: ['Grade', 'StudentName'],
    essential_attributes: ['StudentID', 'CourseID'],
    user_key_verifications: [
      {
        candidate_key: ['StudentID', 'CourseID'],
        is_superkey: true,
        is_minimal: true,
        is_candidate_key: true,
        closure: ['StudentID', 'CourseID', 'Grade', 'StudentName'],
        missing_attributes: [],
        violating_subset: null,
        minimality_checks: [],
        explanation: 'Valid Candidate Key! (StudentID, CourseID) is a minimal superkey.',
      },
      {
        candidate_key: ['StudentID', 'CourseID', 'Grade'],
        is_superkey: true,
        is_minimal: false,
        is_candidate_key: false,
        closure: ['StudentID', 'CourseID', 'Grade', 'StudentName'],
        missing_attributes: [],
        violating_subset: ['StudentID', 'CourseID'],
        minimality_checks: [],
        explanation: 'Superkey but NOT a Candidate Key! (StudentID, CourseID) is already a superkey.',
      },
    ],
    reasoning_steps: [
      {
        step_number: 1,
        title: 'Attribute Role Partitioning',
        description: 'Classified attributes into Left-Only, Right-Only, Both, and Neither.',
        details: { essential: ['StudentID', 'CourseID'] },
      },
      {
        step_number: 2,
        title: 'Essential Core Closure Evaluation',
        description: 'Closure of essential attributes covers all relation attributes.',
        details: { is_superkey: true },
      },
    ],
    warnings: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial schema details and action buttons', () => {
    render(
      <MemoryRouter>
        <KeyAnalysisLab initialSchema={sampleSchema} />
      </MemoryRouter>
    );

    expect(screen.getByText('ENROLLMENT')).toBeInTheDocument();
    expect(screen.getByText('(StudentID, CourseID, Grade, StudentName)')).toBeInTheDocument();
    expect(screen.getByText('2 FDs')).toBeInTheDocument();
    expect(screen.getByText('2 User Keys')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Find Candidate Keys/i })).toBeInTheDocument();
  });

  it('runs candidate key analysis and renders discovered keys and prime/non-prime attributes', async () => {
    const analyzeSpy = vi
      .spyOn(keyService, 'analyzeKeys')
      .mockResolvedValueOnce(mockAnalysisResult);

    render(
      <MemoryRouter>
        <KeyAnalysisLab initialSchema={sampleSchema} />
      </MemoryRouter>
    );

    const findBtn = screen.getByRole('button', { name: /Find Candidate Keys/i });
    fireEvent.click(findBtn);

    await waitFor(() => {
      expect(analyzeSpy).toHaveBeenCalledWith({
        relation_name: 'ENROLLMENT',
        attributes: sampleSchema.attributes,
        functional_dependencies: sampleSchema.functional_dependencies,
        user_candidate_keys: sampleSchema.candidate_keys,
      });
    });

    // Verify candidate key card
    await waitFor(() => {
      expect(screen.getByText('🔑 (StudentID, CourseID)')).toBeInTheDocument();
      expect(screen.getByText('Composite Key (2 attributes)')).toBeInTheDocument();
      expect(screen.getByText('✓ Minimal Superkey')).toBeInTheDocument();
    });

    // Verify prime and non-prime attributes
    expect(screen.getByText('Prime Attributes (2)')).toBeInTheDocument();
    expect(screen.getByText('Non-Prime Attributes (2)')).toBeInTheDocument();

    // Verify reasoning steps
    expect(screen.getByText('Attribute Role Partitioning')).toBeInTheDocument();
    expect(screen.getByText('Essential Core Closure Evaluation')).toBeInTheDocument();
  });

  it('verifies user-provided candidate keys and distinguishes minimal keys from bloated superkeys', async () => {
    vi.spyOn(keyService, 'analyzeKeys').mockResolvedValueOnce(mockAnalysisResult);

    render(
      <MemoryRouter>
        <KeyAnalysisLab initialSchema={sampleSchema} />
      </MemoryRouter>
    );

    const findBtn = screen.getByRole('button', { name: /Find Candidate Keys/i });
    fireEvent.click(findBtn);

    await waitFor(() => {
      // First key is valid
      expect(screen.getByText('Valid Key')).toBeInTheDocument();
      // Second key is superkey but not minimal
      expect(screen.getByText('Superkey (Not Minimal)')).toBeInTheDocument();
    });
  });

  it('verifies custom interactive attribute selection', async () => {
    const mockVerifyResult: KeyVerificationResult = {
      candidate_key: ['StudentID'],
      is_superkey: false,
      is_minimal: false,
      is_candidate_key: false,
      closure: ['StudentID', 'StudentName'],
      missing_attributes: ['CourseID', 'Grade'],
      violating_subset: null,
      minimality_checks: [],
      explanation: 'Not a superkey. Missing {CourseID, Grade}.',
    };

    const verifySpy = vi
      .spyOn(keyService, 'verifyKey')
      .mockResolvedValueOnce(mockVerifyResult);

    render(
      <MemoryRouter>
        <KeyAnalysisLab initialSchema={sampleSchema} />
      </MemoryRouter>
    );

    // Click StudentID pill in custom key tester
    const studentIdButtons = screen.getAllByRole('button', { name: 'StudentID' });
    // The custom tester button is one of them
    const customPill = studentIdButtons[studentIdButtons.length - 1];
    fireEvent.click(customPill);

    const verifyBtn = screen.getByRole('button', { name: /Verify \(StudentID\)/i });
    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(verifySpy).toHaveBeenCalledWith({
        relation_name: 'ENROLLMENT',
        attributes: sampleSchema.attributes,
        functional_dependencies: sampleSchema.functional_dependencies,
        candidate_key: ['StudentID'],
      });
      expect(screen.getByText('Not a Superkey')).toBeInTheDocument();
      expect(screen.getByText(/Not a superkey\. Missing {CourseID, Grade}\./i)).toBeInTheDocument();
    });
  });
});
