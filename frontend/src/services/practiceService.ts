/**
 * Service for Practice Mode, AI Practice, Competitive Exam PYQs, and Gentle Retry Engine.
 */

import { apiClient } from './apiClient';
import {
  QuizQuestion,
  PracticeSummary,
  VerifyAttemptRequest,
  GentleFeedbackResponse,
  QuizSubmissionRequest,
  QuizSubmissionResponse,
  PracticeExercise,
  PracticeVerifyRequest,
  PracticeVerifyResponse,
} from '../types/practice';

export const practiceService = {
  /**
   * Fetch aggregate summary of practice questions and exams.
   */
  async getSummary(): Promise<PracticeSummary> {
    return apiClient.get<PracticeSummary>('/practice/summary');
  },

  /**
   * Fetch original AI practice questions with optional topic, difficulty, or count filters.
   */
  async getAiQuestions(params?: {
    topic?: string;
    difficulty?: string;
    count?: number;
  }): Promise<QuizQuestion[]> {
    const searchParams = new URLSearchParams();
    if (params?.topic) searchParams.append('topic', params.topic);
    if (params?.difficulty) searchParams.append('difficulty', params.difficulty);
    if (params?.count) searchParams.append('count', params.count.toString());
    const query = searchParams.toString();
    const endpoint = query ? `/practice/ai/questions?${query}` : '/practice/ai/questions';
    return apiClient.get<QuizQuestion[]>(endpoint);
  },

  /**
   * Fetch competitive exam PYQs with optional exam, topic, playable_only, or count filters.
   */
  async getPyqQuestions(params?: {
    exam?: string;
    topic?: string;
    playableOnly?: boolean;
    count?: number;
  }): Promise<QuizQuestion[]> {
    const searchParams = new URLSearchParams();
    if (params?.exam) searchParams.append('exam', params.exam);
    if (params?.topic) searchParams.append('topic', params.topic);
    if (params?.playableOnly !== undefined) searchParams.append('playable_only', String(params.playableOnly));
    if (params?.count) searchParams.append('count', params.count.toString());
    const query = searchParams.toString();
    const endpoint = query ? `/practice/pyqs/questions?${query}` : '/practice/pyqs/questions';
    return apiClient.get<QuizQuestion[]>(endpoint);
  },

  /**
   * Evaluate a question attempt with progressive gentle feedback (hints on attempts 1-2, reveal on attempt 3).
   */
  async verifyAttempt(payload: VerifyAttemptRequest): Promise<GentleFeedbackResponse> {
    return apiClient.post<GentleFeedbackResponse>('/practice/verify-attempt', payload);
  },

  /**
   * Submit and score a full quiz session.
   */
  async submitQuiz(payload: QuizSubmissionRequest): Promise<QuizSubmissionResponse> {
    return apiClient.post<QuizSubmissionResponse>('/practice/submit-quiz', payload);
  },

  /**
   * Legacy academic exercises (Phase 9)
   */
  async getExercises(): Promise<PracticeExercise[]> {
    return apiClient.get<PracticeExercise[]>('/practice/exercises');
  },

  async verifyLegacyAnswer(payload: PracticeVerifyRequest): Promise<PracticeVerifyResponse> {
    return apiClient.post<PracticeVerifyResponse>('/practice/verify', payload);
  },
};

// Backward-compatible individual exports
export const fetchPracticeExercises = practiceService.getExercises;
export const verifyPracticeAnswer = practiceService.verifyLegacyAnswer;
