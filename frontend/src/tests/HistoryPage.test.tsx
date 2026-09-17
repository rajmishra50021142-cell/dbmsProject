import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HistoryPage } from '../pages/HistoryPage';
import { historyService } from '../services/historyService';
import type { RelationSchema } from '../types';

describe('Execution & Analysis History', () => {
  const sampleSchema: RelationSchema = {
    name: 'TEST_RELATION',
    attributes: ['A', 'B', 'C'],
    candidate_keys: [['A']],
    functional_dependencies: [{ left: ['A'], right: ['B', 'C'] }],
    multivalued_dependencies: [],
  };

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(historyService, 'getHistory').mockImplementation(async () => {
      return historyService.getLocalHistory();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders empty state initially with load sample history button', async () => {
    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Execution & Analysis History/i)).toBeInTheDocument();
      expect(screen.getByText(/No analysis history yet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Load Academic Sample History/i })).toBeInTheDocument();
    });
  });

  it('records and displays a normalization analysis in history', async () => {
    await historyService.recordNormalizationAnalysis(sampleSchema, {
      relation_name: 'TEST_RELATION',
      attributes: ['A', 'B', 'C'],
      functional_dependencies: [{ left: ['A'], right: ['B', 'C'] }],
      multivalued_dependencies: [],
      candidate_keys: [['A']],
      prime_attributes: ['A'],
      non_prime_attributes: ['B', 'C'],
      input_fingerprint: 'test-fingerprint',
      summary_verdict: 'Relation satisfies BCNF',
      nf1: { status: 'SATISFIED', is_satisfied: true, reason_code: 'ATOMIC', message: 'All atomic', violations: [], limitations: [] },
      nf2: { status: 'SATISFIED', is_satisfied: true, reason_code: 'NO_PARTIAL', message: 'No partial', prerequisite_1nf_status: 'SATISFIED', candidate_keys: [['A']], composite_keys: [], prime_attributes: ['A'], non_prime_attributes: ['B', 'C'], partial_dependencies: [], reasoning_steps: [], limitations: [] },
      nf3: { status: 'SATISFIED', is_satisfied: true, reason_code: 'SUPERKEY_LHS', message: 'All superkeys', prerequisite_2nf_status: 'SATISFIED', candidate_keys: [['A']], prime_attributes: ['A'], non_prime_attributes: ['B', 'C'], dependencies_analyzed: [], trivial_dependencies: [], satisfied_dependencies: [], violations: [], transitive_patterns: [], reasoning_steps: [], limitations: [] },
      nf4: { status: 'SATISFIED', is_satisfied: true, reason_code: 'NO_MVDS', message: 'No MVDs', prerequisite_3nf_status: 'SATISFIED', candidate_keys: [['A']], mvds_analyzed: [], trivial_mvds: [], non_trivial_mvds: [], violations: [], reasoning_steps: [], limitations: [] },
      highest_confirmed_normal_form: '4NF',
    });

    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('TEST_RELATION Normalization (4NF)')).toBeInTheDocument();
      expect(screen.getAllByText(/4NF/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/TEST_RELATION/i).length).toBeGreaterThan(0);
    });
  });

  it('loads academic sample history when button is clicked', async () => {
    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>
    );

    const loadSampleBtn = await screen.findByRole('button', { name: /Load Academic Sample History/i });
    fireEvent.click(loadSampleBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/ENROLLMENT/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/STAFF_BRANCH/i).length).toBeGreaterThan(0);
      const stored = historyService.getLocalHistory();
      expect(stored.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('filters history items by search query', async () => {
    await historyService.recordSnapshot(sampleSchema, 'Alpha Snapshot', '2NF');
    await historyService.recordSnapshot({ ...sampleSchema, name: 'BETA_REL' }, 'Beta Snapshot', '3NF');

    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alpha Snapshot')).toBeInTheDocument();
      expect(screen.getByText('Beta Snapshot')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by relation name/i);
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    await waitFor(() => {
      expect(screen.getByText('Alpha Snapshot')).toBeInTheDocument();
      expect(screen.queryByText('Beta Snapshot')).not.toBeInTheDocument();
    });
  });

  it('restores schema to active workspace draft', async () => {
    historyService.restoreSchemaToWorkspace(sampleSchema);
    const draft = localStorage.getItem('normalization_lab_draft_v1');
    expect(draft).toBeTruthy();
    expect(JSON.parse(draft!).name).toBe('TEST_RELATION');
  });
});
