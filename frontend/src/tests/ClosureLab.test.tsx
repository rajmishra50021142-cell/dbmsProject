import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ClosureLab } from '../features/closure/ClosureLab';
import { closureService } from '../services/closureService';
import type { RelationSchema, ClosureResult, DeterminationResult } from '../types';

describe('ClosureLab Component (Phase 3)', () => {
  const sampleSchema: RelationSchema = {
    name: 'TEST_RELATION',
    attributes: ['A', 'B', 'C', 'D'],
    candidate_keys: [['A']],
    functional_dependencies: [
      { id: 'fd-1', left: ['A'], right: ['B'] },
      { id: 'fd-2', left: ['B'], right: ['C'] },
      { id: 'fd-3', left: ['C'], right: ['D'] },
    ],
    multivalued_dependencies: [],
  };

  const mockClosureResult: ClosureResult = {
    relation_name: 'TEST_RELATION',
    input_attributes: ['A'],
    closure_attributes: ['A', 'B', 'C', 'D'],
    applied_fds: [
      { id: 'fd-1', left: ['A'], right: ['B'] },
      { id: 'fd-2', left: ['B'], right: ['C'] },
      { id: 'fd-3', left: ['C'], right: ['D'] },
    ],
    fixed_point_reached: true,
    steps: [
      {
        step_number: 1,
        before_attributes: [],
        after_attributes: ['A'],
        applied_fd: null,
        added_attributes: ['A'],
        explanation: 'Initialize closure with starting attribute set X = {A} (Reflexivity)',
      },
      {
        step_number: 2,
        before_attributes: ['A'],
        after_attributes: ['A', 'B'],
        applied_fd: { left: ['A'], right: ['B'] },
        added_attributes: ['B'],
        explanation: 'Applied A -> B because {A} ⊆ current closure',
      },
      {
        step_number: 3,
        before_attributes: ['A', 'B'],
        after_attributes: ['A', 'B', 'C'],
        applied_fd: { left: ['B'], right: ['C'] },
        added_attributes: ['C'],
        explanation: 'Applied B -> C because {B} ⊆ current closure',
      },
      {
        step_number: 4,
        before_attributes: ['A', 'B', 'C'],
        after_attributes: ['A', 'B', 'C', 'D'],
        applied_fd: { left: ['C'], right: ['D'] },
        added_attributes: ['D'],
        explanation: 'Applied C -> D because {C} ⊆ current closure',
      },
    ],
    iterations: 4,
    is_superkey: true,
    superkey_reason: '{A}+ = {A, B, C, D} which contains all attributes of relation TEST_RELATION. Therefore, {A} is a superkey.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders initial schema attributes and dependencies', () => {
    render(
      <MemoryRouter>
        <ClosureLab initialSchema={sampleSchema} />
      </MemoryRouter>
    );

    expect(screen.getByText('TEST_RELATION')).toBeInTheDocument();
    expect(screen.getByText('(A, B, C, D)')).toBeInTheDocument();
    expect(screen.getAllByText('3 FDs').length).toBe(2);

    // Check attribute toggle buttons
    expect(screen.getByRole('button', { name: /✓ A/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'B' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'C' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'D' })).toBeInTheDocument();
  });

  it('toggles target attributes and updates target selection display', () => {
    render(
      <MemoryRouter>
        <ClosureLab initialSchema={sampleSchema} />
      </MemoryRouter>
    );

    // Initially A is selected (default first attribute)
    expect(screen.getByText(/Target:/i)).toBeInTheDocument();

    // Click B to add to target
    const btnB = screen.getByRole('button', { name: 'B' });
    fireEvent.click(btnB);

    // Both A and B should now be selected
    expect(screen.getByRole('button', { name: /✓ B/i })).toBeInTheDocument();

    // Click Clear
    const clearBtn = screen.getByText('Clear');
    fireEvent.click(clearBtn);

    // Button should be disabled when empty
    const computeBtn = screen.getByRole('button', { name: /Calculate Closure/i });
    expect(computeBtn).toBeDisabled();
  });

  it('computes attribute closure and renders mathematical result and superkey badge', async () => {
    const computeSpy = vi
      .spyOn(closureService, 'computeClosure')
      .mockResolvedValueOnce(mockClosureResult);

    render(
      <MemoryRouter>
        <ClosureLab initialSchema={sampleSchema} />
      </MemoryRouter>
    );

    const computeBtn = screen.getByRole('button', { name: /Calculate Closure/i });
    fireEvent.click(computeBtn);

    await waitFor(() => {
      expect(computeSpy).toHaveBeenCalledWith({
        relation_name: 'TEST_RELATION',
        attributes: ['A', 'B', 'C', 'D'],
        functional_dependencies: sampleSchema.functional_dependencies,
        target_attributes: ['A'],
      });
    });

    // Check result elements
    await waitFor(() => {
      expect(screen.getByText('(A)⁺')).toBeInTheDocument();
      expect(screen.getByText('Superkey Criteria Satisfied')).toBeInTheDocument();
      expect(screen.getByText(/Therefore, {A} is a superkey/i)).toBeInTheDocument();
      expect(screen.getByText(/Closure Derivation Trace/i)).toBeInTheDocument();
    });
  });

  it('allows stepping through closure derivation trace steps', async () => {
    vi.spyOn(closureService, 'computeClosure').mockResolvedValueOnce(mockClosureResult);

    render(
      <MemoryRouter>
        <ClosureLab initialSchema={sampleSchema} />
      </MemoryRouter>
    );

    const computeBtn = screen.getByRole('button', { name: /Calculate Closure/i });
    fireEvent.click(computeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Step 4 of 4/i)).toBeInTheDocument();
    });

    // Step back to Step 3
    const prevButtons = screen.getAllByRole('button');
    const chevronLeftBtn = prevButtons.find((btn) => btn.querySelector('svg.lucide-chevron-left'));
    expect(chevronLeftBtn).toBeDefined();
    if (chevronLeftBtn) {
      fireEvent.click(chevronLeftBtn);
    }

    await waitFor(() => {
      expect(screen.getByText(/Step 3 of 4/i)).toBeInTheDocument();
    });
  });

  it('evaluates functional determination implication query (X -> Y)', async () => {
    const mockDetermination: DeterminationResult = {
      lhs: ['A'],
      rhs: ['D'],
      determined: true,
      closure: ['A', 'B', 'C', 'D'],
      explanation: 'Holds! {D} ⊆ {A}+ = {A, B, C, D}. Therefore, A -> D is logically implied by F.',
    };

    const querySpy = vi
      .spyOn(closureService, 'checkDetermination')
      .mockResolvedValueOnce(mockDetermination);

    render(
      <MemoryRouter>
        <ClosureLab initialSchema={sampleSchema} />
      </MemoryRouter>
    );

    // Select LHS = 'A' and RHS = 'D'
    const selects = screen.getAllByRole('listbox');
    const lhsSelect = selects[0] as HTMLSelectElement;
    const rhsSelect = selects[1] as HTMLSelectElement;

    const optA = within(lhsSelect).getByRole('option', { name: 'A' }) as HTMLOptionElement;
    optA.selected = true;
    fireEvent.change(lhsSelect);

    const optD = within(rhsSelect).getByRole('option', { name: 'D' }) as HTMLOptionElement;
    optD.selected = true;
    fireEvent.change(rhsSelect);

    const testBtn = screen.getByRole('button', { name: /Test Implication/i });
    fireEvent.click(testBtn);

    await waitFor(() => {
      expect(querySpy).toHaveBeenCalledWith({
        relation_name: 'TEST_RELATION',
        attributes: ['A', 'B', 'C', 'D'],
        functional_dependencies: sampleSchema.functional_dependencies,
        lhs: ['A'],
        rhs: ['D'],
      });
      expect(screen.getByText('Holds Under F')).toBeInTheDocument();
      expect(
        screen.getByText(/Holds! {D} ⊆ {A}\+ = {A, B, C, D}\. Therefore, A -> D is logically implied by F\./i)
      ).toBeInTheDocument();
    });
  });

  it('handles backend response with lhs/rhs aliases gracefully without crashing into blank screen', async () => {
    const rawBackendResult: any = {
      relation_name: 'TEST_RELATION',
      input_attributes: ['A'],
      closure_attributes: ['A', 'B'],
      applied_fds: [{ id: null, lhs: ['A'], rhs: ['B'] }],
      fixed_point_reached: true,
      iterations: 2,
      is_superkey: false,
      superkey_reason: 'Not all attributes covered',
      steps: [
        {
          step_number: 1,
          before_attributes: [],
          after_attributes: ['A'],
          applied_fd: null,
          added_attributes: ['A'],
          explanation: 'Initial set',
        },
        {
          step_number: 2,
          before_attributes: ['A'],
          after_attributes: ['A', 'B'],
          applied_fd: { id: null, lhs: ['A'], rhs: ['B'] },
          added_attributes: ['B'],
          explanation: 'Applied A -> B',
        },
      ],
    };

    const computeSpy = vi.spyOn(closureService, 'computeClosure').mockResolvedValueOnce(rawBackendResult);

    render(
      <MemoryRouter>
        <ClosureLab initialSchema={sampleSchema} />
      </MemoryRouter>
    );

    const computeBtn = screen.getByRole('button', { name: /Calculate Closure/i });
    fireEvent.click(computeBtn);

    await waitFor(() => {
      expect(computeSpy).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(/Closure Derivation Trace/i)).toBeInTheDocument();
      expect(screen.getAllByText(/A → B/i).length).toBeGreaterThan(0);
    });
  });
});
