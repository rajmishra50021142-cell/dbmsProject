import { apiClient } from './apiClient';
import type {
  ClosureRequest,
  ClosureResult,
  DeterminationRequest,
  DeterminationResult,
  FunctionalDependency,
  TrivialFDCheckResult,
} from '../types';

function normalizeFD(fd?: any): FunctionalDependency | null {
  if (!fd) return null;
  const left = Array.isArray(fd.left) ? fd.left : Array.isArray(fd.lhs) ? fd.lhs : [];
  const right = Array.isArray(fd.right) ? fd.right : Array.isArray(fd.rhs) ? fd.rhs : [];
  return {
    ...fd,
    left,
    right,
    lhs: left,
    rhs: right,
  };
}

export const closureService = {
  /**
   * Compute the full attribute closure (X+) with step-by-step reasoning.
   */
  computeClosure: async (req: ClosureRequest): Promise<ClosureResult> => {
    const res = await apiClient.post<ClosureResult>('/closure/compute', req);
    return {
      ...res,
      input_attributes: res.input_attributes || [],
      closure_attributes: res.closure_attributes || [],
      applied_fds: (res.applied_fds || []).map((fd) => normalizeFD(fd)!).filter(Boolean),
      steps: (res.steps || []).map((step) => ({
        ...step,
        before_attributes: step.before_attributes || [],
        after_attributes: step.after_attributes || [],
        added_attributes: step.added_attributes || [],
        applied_fd: normalizeFD(step.applied_fd),
      })),
    };
  },

  /**
   * Test whether determinant LHS functionally determines RHS (X -> Y) by closure.
   */
  checkDetermination: async (req: DeterminationRequest): Promise<DeterminationResult> => {
    return await apiClient.post<DeterminationResult>('/closure/determination', req);
  },

  /**
   * Check whether a given functional dependency is trivial according to Armstrong's axioms.
   */
  checkTrivialFD: async (fd: FunctionalDependency): Promise<TrivialFDCheckResult> => {
    return await apiClient.post<TrivialFDCheckResult>('/closure/trivial-check', {
      functional_dependency: fd,
    });
  },
};
