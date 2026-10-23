export interface QuizQuestion {
  id: string;
  bank_type: 'ai' | 'pyq';
  statement: string;
  options: string[];
  correct_answer?: string;
  explanation?: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hints: string[];
  question_type: string;
  exam?: string;
  year?: string;
  note?: string;
  source_number?: number;
  status: 'playable' | 'incomplete';
  incomplete_reason?: string;
}

export interface QuizConfig {
  question_count: number;
  time_limit_seconds?: number | null;
  untimed: boolean;
  mode: 'practice' | 'exam_simulation';
  topic?: string | null;
  difficulty?: string | null;
  exam?: string | null;
  randomize?: boolean;
}

export interface VerifyAttemptRequest {
  question_id: string;
  bank_type: 'ai' | 'pyq';
  selected_option: string;
  attempt_number: number;
}

export interface GentleFeedbackResponse {
  is_correct: boolean;
  attempt_number: number;
  attempts_remaining: number;
  gentle_message: string;
  hint?: string | null;
  revealed_answer?: string | null;
  explanation?: string | null;
  concept_summary?: string | null;
}

export interface QuizSubmissionRequest {
  bank_type: 'ai' | 'pyq';
  answers: Record<string, string>;
  time_spent_seconds: number;
  mode: 'practice' | 'exam_simulation';
}

export interface QuizQuestionReview {
  question_id: string;
  source_number?: number | null;
  statement: string;
  options: string[];
  selected_option?: string | null;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
  topic: string;
  exam?: string | null;
  year?: string | null;
  note?: string | null;
}

export interface QuizSubmissionResponse {
  total_questions: number;
  answered_count: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  score_percentage: number;
  time_spent_seconds: number;
  topic_breakdown: Record<string, { total: number; correct: number }>;
  question_reviews: QuizQuestionReview[];
  supportive_summary: string;
}

export interface PracticeSummary {
  ai_practice: {
    total_questions: number;
    topics: string[];
    difficulties: string[];
  };
  pyq_practice: {
    total_questions: number;
    playable_questions: number;
    incomplete_questions: number;
    topics: string[];
    exams: string[];
  };
}

export type {
  PracticeExercise,
  PracticeVerifyRequest,
  PracticeVerifyResponse,
} from './index';
