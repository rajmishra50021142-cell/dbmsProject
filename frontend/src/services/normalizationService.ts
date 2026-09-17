import { apiClient } from './apiClient';
import type {
  RelationSchema,
  NF1Result,
  NF2Result,
  NF3Result,
  NF4Result,
  BasicNormalizationAnalysisResult,
  FullNormalizationAnalysisResult,
} from '../types';

export const normalizationService = {
  /**
   * Evaluates First Normal Form (1NF) on schema attributes and sample tuples.
   */
  analyze1NF: async (schema: RelationSchema): Promise<NF1Result> => {
    return await apiClient.post<NF1Result>('/normalize/1nf', schema);
  },

  /**
   * Evaluates Second Normal Form (2NF) on schema composite candidate keys and functional dependencies.
   */
  analyze2NF: async (schema: RelationSchema): Promise<NF2Result> => {
    return await apiClient.post<NF2Result>('/normalize/2nf', schema);
  },

  /**
   * Evaluates Third Normal Form (3NF) on schema functional dependencies and candidate keys.
   */
  analyze3NF: async (schema: RelationSchema): Promise<NF3Result> => {
    return await apiClient.post<NF3Result>('/normalize/3nf', schema);
  },

  /**
   * Evaluates Fourth Normal Form (4NF) on schema multivalued dependencies.
   */
  analyze4NF: async (schema: RelationSchema): Promise<NF4Result> => {
    return await apiClient.post<NF4Result>('/normalize/4nf', schema);
  },

  /**
   * Unified 1NF through 4NF normalization analysis with stale-result protection.
   */
  analyzeFullNormalization: async (schema: RelationSchema): Promise<FullNormalizationAnalysisResult> => {
    return await apiClient.post<FullNormalizationAnalysisResult>('/normalize/analyze', schema);
  },

  /**
   * Backwards-compatible alias for unified analysis.
   */
  analyzeBasicNormalization: async (schema: RelationSchema): Promise<BasicNormalizationAnalysisResult> => {
    return await apiClient.post<FullNormalizationAnalysisResult>('/normalize/analyze', schema);
  },
};
