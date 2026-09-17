import { apiClient } from './apiClient';
import type {
  LosslessJoinResult,
  DependencyPreservationResult,
  DecompositionVerificationResult,
  DecompositionPlan,
  MinimalCoverResult,
  DecompositionAnalyzeResult,
  FunctionalDependency,
  MultivaluedDependency,
} from '../types';

export const decompositionService = {
  /**
   * Verify lossless join using formal Tableau Chase (FDs) or Fagin's Theorem (MVDs).
   */
  verifyLossless: async (payload: {
    attributes: string[];
    functionalDependencies?: FunctionalDependency[];
    multivaluedDependencies?: MultivaluedDependency[];
    decomposedRelations: string[][];
    relationNames?: string[];
  }): Promise<LosslessJoinResult> => {
    return await apiClient.post<LosslessJoinResult>('/decomposition/verify-lossless', payload);
  },

  /**
   * Formally verify functional dependency preservation.
   */
  verifyDependencies: async (payload: {
    attributes: string[];
    functionalDependencies: FunctionalDependency[];
    decomposedRelations: string[][];
    relationNames?: string[];
  }): Promise<DependencyPreservationResult> => {
    return await apiClient.post<DependencyPreservationResult>('/decomposition/verify-dependencies', payload);
  },

  /**
   * Comprehensive verification of lossless-join and dependency preservation for a set of proposed relations.
   */
  verifyDecomposition: async (payload: {
    relationName?: string;
    attributes: string[];
    functionalDependencies?: FunctionalDependency[];
    multivaluedDependencies?: MultivaluedDependency[];
    candidateKeys?: string[][];
    decomposedRelations: Array<{ name: string; attributes: string[]; primary_key?: string[] }>;
  }): Promise<DecompositionVerificationResult> => {
    return await apiClient.post<DecompositionVerificationResult>('/decomposition/verify', payload);
  },

  /**
   * 2NF decomposition eliminating partial dependencies.
   */
  decompose2NF: async (payload: {
    relationName?: string;
    attributes: string[];
    functionalDependencies?: FunctionalDependency[];
    candidateKeys?: string[][];
  }): Promise<DecompositionPlan> => {
    return await apiClient.post<DecompositionPlan>('/decomposition/2nf', payload);
  },

  /**
   * 3NF synthesis using Bernstein's Synthesis with minimal cover and candidate key retention.
   */
  decompose3NF: async (payload: {
    relationName?: string;
    attributes: string[];
    functionalDependencies?: FunctionalDependency[];
    candidateKeys?: string[][];
  }): Promise<DecompositionPlan> => {
    return await apiClient.post<DecompositionPlan>('/decomposition/3nf', payload);
  },

  /**
   * 4NF decomposition resolving non-trivial multivalued dependencies.
   */
  decompose4NF: async (payload: {
    relationName?: string;
    attributes: string[];
    functionalDependencies?: FunctionalDependency[];
    multivaluedDependencies?: MultivaluedDependency[];
    candidateKeys?: string[][];
  }): Promise<DecompositionPlan> => {
    return await apiClient.post<DecompositionPlan>('/decomposition/4nf', payload);
  },

  /**
   * Calculate minimal (canonical) cover of functional dependencies.
   */
  getMinimalCover: async (payload: {
    attributes: string[];
    functionalDependencies: FunctionalDependency[];
    relationName?: string;
  }): Promise<MinimalCoverResult> => {
    return await apiClient.post<MinimalCoverResult>('/decomposition/minimal-cover', payload);
  },

  /**
   * Unified decomposition pipeline targeting 2NF, 3NF, or 4NF.
   */
  analyzeDecomposition: async (payload: {
    relationName?: string;
    attributes: string[];
    functionalDependencies?: FunctionalDependency[];
    multivaluedDependencies?: MultivaluedDependency[];
    candidateKeys?: string[][];
    targetNormalForm: '2NF' | '3NF' | '4NF';
  }): Promise<DecompositionAnalyzeResult> => {
    return await apiClient.post<DecompositionAnalyzeResult>('/decomposition/analyze', payload);
  },
};
