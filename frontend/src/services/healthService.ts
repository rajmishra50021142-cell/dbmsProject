import { apiClient } from './apiClient';
import { HealthResponse } from '../types';

export async function fetchHealth(): Promise<HealthResponse> {
  return apiClient.get<HealthResponse>('/health');
}
