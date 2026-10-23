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

import fallbackPracticeData from '../data/fallbackPracticeData.json';

export const practiceService = {
  /**
   * Fetch aggregate summary of practice questions and exams.
   */
  async getSummary(): Promise<PracticeSummary> {
    try {
      return await apiClient.get<PracticeSummary>('/practice/summary');
    } catch (err) {
      console.warn('Practice summary API unavailable, using verified offline dataset', err);
      return fallbackPracticeData.summary as PracticeSummary;
    }
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
    try {
      return await apiClient.get<QuizQuestion[]>(endpoint);
    } catch (err) {
      console.warn('AI questions API unavailable, filtering offline dataset', err);
      let qs = (fallbackPracticeData.ai as unknown) as QuizQuestion[];
      if (params?.topic) {
        qs = qs.filter((q) => q.topic.toLowerCase() === params.topic!.toLowerCase());
      }
      if (params?.difficulty) {
        qs = qs.filter((q) => q.difficulty.toLowerCase() === params.difficulty!.toLowerCase());
      }
      if (params?.count && params.count > 0) {
        qs = qs.slice(0, params.count);
      }
      return qs;
    }
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
    try {
      return await apiClient.get<QuizQuestion[]>(endpoint);
    } catch (err) {
      console.warn('PYQ questions API unavailable, filtering offline dataset', err);
      let qs = (fallbackPracticeData.pyqs as unknown) as QuizQuestion[];
      if (params?.playableOnly) {
        qs = qs.filter((q) => q.status === 'playable');
      }
      if (params?.exam) {
        qs = qs.filter((q) => q.exam && q.exam.toLowerCase() === params.exam!.toLowerCase());
      }
      if (params?.topic) {
        qs = qs.filter((q) => q.topic.toLowerCase() === params.topic!.toLowerCase());
      }
      if (params?.count && params.count > 0) {
        qs = qs.slice(0, params.count);
      }
      return qs;
    }
  },

  /**
   * Evaluate a question attempt with progressive gentle feedback (hints on attempts 1-2, reveal on attempt 3).
   */
  async verifyAttempt(payload: VerifyAttemptRequest): Promise<GentleFeedbackResponse> {
    try {
      return await apiClient.post<GentleFeedbackResponse>('/practice/verify-attempt', payload);
    } catch (err) {
      console.warn('Verify attempt API unavailable, evaluating offline', err);
      const allQuestions = [
        ...fallbackPracticeData.pyqs,
        ...fallbackPracticeData.ai,
      ] as unknown as QuizQuestion[];
      const q = allQuestions.find((item) => item.id === payload.question_id);
      if (!q) {
        return {
          is_correct: false,
          attempt_number: payload.attempt_number,
          attempts_remaining: Math.max(0, 3 - payload.attempt_number),
          gentle_message: 'Question not found.',
        };
      }
      const selected = (payload.selected_option || '').trim().toUpperCase();
      const selectedLetter = selected.length > 0 ? selected[0] : '';
      const isCorrect = selectedLetter === (q.correct_answer || '').trim().toUpperCase();
      const attempt = payload.attempt_number;
      const attemptsRemaining = Math.max(0, 3 - attempt);

      if (isCorrect) {
        const msg =
          attempt === 1
            ? 'Outstanding! You got it right on your first attempt.'
            : attempt === 2
            ? 'Excellent work! Your second attempt hit the mark.'
            : 'Spot on! Persistence pays off — great job solving it.';
        return {
          is_correct: true,
          attempt_number: attempt,
          attempts_remaining: attemptsRemaining,
          gentle_message: msg,
          hint: null,
          revealed_answer: q.correct_answer,
          explanation: q.explanation,
          concept_summary: `Concept Recap: ${q.topic} principles successfully verified.`,
        };
      }

      if (attempt === 1) {
        const hint1 = q.hints && q.hints[0] ? q.hints[0] : 'Review the relational schema and candidate key definition.';
        return {
          is_correct: false,
          attempt_number: 1,
          attempts_remaining: 2,
          gentle_message: "Not quite yet, but you're on the right track! Take another look at the relational rules.",
          hint: hint1,
        };
      } else if (attempt === 2) {
        const hint2 = q.hints && q.hints[1] ? q.hints[1] : (q.hints && q.hints[0] ? q.hints[0] : 'Consider how the functional dependencies isolate prime attributes.');
        return {
          is_correct: false,
          attempt_number: 2,
          attempts_remaining: 1,
          gentle_message: "Close, but still not quite right. Analyze the dependency structure carefully with this extra hint.",
          hint: hint2,
        };
      } else {
        return {
          is_correct: false,
          attempt_number: 3,
          attempts_remaining: 0,
          gentle_message: "Good effort! Here is the complete step-by-step mathematical proof and explanation to clarify the concept.",
          hint: null,
          revealed_answer: q.correct_answer,
          explanation: q.explanation,
          concept_summary: `Mastery Takeaway: For questions on ${q.topic}, always determine candidate keys first and verify whether every non-trivial dependency satisfies the required normal form condition.`,
        };
      }
    }
  },

  /**
   * Submit and score a full quiz session.
   */
  async submitQuiz(payload: QuizSubmissionRequest): Promise<QuizSubmissionResponse> {
    try {
      return await apiClient.post<QuizSubmissionResponse>('/practice/submit-quiz', payload);
    } catch (err) {
      console.warn('Submit quiz API unavailable, scoring offline', err);
      const bank = payload.bank_type === 'ai' ? fallbackPracticeData.ai : fallbackPracticeData.pyqs;
      const qMap = new Map<string, QuizQuestion>();
      ((bank as unknown) as QuizQuestion[]).forEach((q) => qMap.set(q.id, q));

      const targetIds = Object.keys(payload.answers);
      const total = targetIds.length || 1;
      let correct = 0;
      let answered = 0;
      const topicStats: Record<string, { total: number; correct: number }> = {};
      const reviews = [];

      for (const qId of targetIds) {
        const q = qMap.get(qId);
        if (!q) continue;

        const ans = payload.answers[qId];
        const hasAnswered = !!(ans && ans.trim());
        const userLetter = hasAnswered ? ans.trim().toUpperCase()[0] : null;
        const isCorrect = userLetter === (q.correct_answer || '').trim().toUpperCase();

        if (hasAnswered) answered++;
        if (isCorrect) correct++;

        if (!topicStats[q.topic]) {
          topicStats[q.topic] = { total: 0, correct: 0 };
        }
        topicStats[q.topic].total += 1;
        if (isCorrect) topicStats[q.topic].correct += 1;

        reviews.push({
          question_id: q.id,
          source_number: q.source_number || null,
          statement: q.statement,
          options: q.options,
          selected_option: userLetter,
          correct_answer: q.correct_answer || 'A',
          is_correct: isCorrect,
          explanation: q.explanation || 'Refer to normal form definitions.',
          topic: q.topic,
          exam: q.exam || null,
          year: q.year || null,
          note: q.note || null,
        });
      }

      const scorePct = Math.round((correct / total) * 100);
      return {
        total_questions: total,
        answered_count: answered,
        correct_count: correct,
        incorrect_count: answered - correct,
        unanswered_count: total - answered,
        score_percentage: scorePct,
        time_spent_seconds: payload.time_spent_seconds,
        topic_breakdown: topicStats,
        question_reviews: reviews,
        supportive_summary: `You scored ${scorePct}%. Great job completing this practice session!`,
      };
    }
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
