import { apiClient } from './apiClient';
import type {
  SuperkeyCheckRequest,
  SuperkeyCheckResult,
  KeyVerificationRequest,
  KeyVerificationResult,
  KeyDiscoveryRequest,
  KeyDiscoveryResult,
  CandidateKeyAnalysisRequest,
  CandidateKeyAnalysisResult,
} from '../types';

export const keyService = {
  /**
   * Test whether an attribute set is a superkey (closure contains all relation attributes).
   */
  checkSuperkey: async (req: SuperkeyCheckRequest): Promise<SuperkeyCheckResult> => {
    return await apiClient.post<SuperkeyCheckResult>('/keys/superkey-check', req);
  },

  /**
   * Validate whether an attribute set is a minimal candidate key.
   */
  verifyKey: async (req: KeyVerificationRequest): Promise<KeyVerificationResult> => {
    return await apiClient.post<KeyVerificationResult>('/keys/verify', req);
  },

  /**
   * Automatically discover all minimal candidate keys, prime, and non-prime attributes.
   */
  findCandidateKeys: async (req: KeyDiscoveryRequest): Promise<KeyDiscoveryResult> => {
    return await apiClient.post<KeyDiscoveryResult>('/keys/find', req);
  },

  /**
   * Complete analysis: Auto-discovery + verification of user-provided keys + prime/non-prime partition.
   */
  analyzeKeys: async (req: CandidateKeyAnalysisRequest): Promise<CandidateKeyAnalysisResult> => {
    return await apiClient.post<CandidateKeyAnalysisResult>('/keys/analysis', req);
  },
};
