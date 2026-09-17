/**
 * Service for Practice Mode API.
 */

import { request } from './apiClient';
import {
  PracticeExercise,
  PracticeVerifyRequest,
  PracticeVerifyResponse,
} from '../types';

export async function fetchPracticeExercises(): Promise<PracticeExercise[]> {
  return request<PracticeExercise[]>('/practice/exercises');
}

export async function verifyPracticeAnswer(
  payload: PracticeVerifyRequest
): Promise<PracticeVerifyResponse> {
  return request<PracticeVerifyResponse>('/practice/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
