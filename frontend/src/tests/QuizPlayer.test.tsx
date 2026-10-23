import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuizPlayer } from '../features/practice/quiz/QuizPlayer';
import { practiceService } from '../services/practiceService';
import type { QuizQuestion, QuizConfig } from '../types/practice';

const mockQuestions: QuizQuestion[] = [
  {
    id: 'ai-test-q1',
    bank_type: 'ai',
    statement: 'What is the attribute closure {A}+ given A -> B, B -> C?',
    options: ['A) {A}', 'B) {A, B}', 'C) {A, B, C}', 'D) {C}'],
    correct_answer: 'C',
    explanation: '{A}+ = {A, B, C} by applying transitivity.',
    topic: 'Closure Lab',
    difficulty: 'Easy',
    hints: ['Apply Armstrong reflexivity first.', 'Follow the chain A -> B then B -> C.'],
    question_type: 'MCQ',
    status: 'playable',
  },
];

const mockConfig: QuizConfig = {
  question_count: 1,
  untimed: true,
  mode: 'practice',
};

describe('QuizPlayer with Gentle Retry Feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles gentle retry on attempt 1 and offers Hint 1 without revealing answer', async () => {
    vi.spyOn(practiceService, 'verifyAttempt').mockResolvedValueOnce({
      is_correct: false,
      attempt_number: 1,
      attempts_remaining: 2,
      gentle_message: "Not quite yet, but you're on the right track! Let's take another look at the relational rules.",
      hint: 'Apply Armstrong reflexivity first.',
      revealed_answer: null,
      explanation: null,
      concept_summary: null,
    });

    render(
      <QuizPlayer
        questions={mockQuestions}
        config={mockConfig}
        bankType="ai"
        onComplete={vi.fn()}
        onExit={vi.fn()}
      />
    );

    expect(screen.getByText('What is the attribute closure {A}+ given A -> B, B -> C?')).toBeInTheDocument();

    // Select Option A (incorrect)
    const optionA = screen.getByText('{A}');
    fireEvent.click(optionA);

    // Verify Answer
    const verifyBtn = screen.getByText('Verify Answer');
    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(screen.getByText(/Attempt 1 of 3 • Gentle Retry/i)).toBeInTheDocument();
      expect(screen.getByText(/Not quite yet, but you're on the right track/i)).toBeInTheDocument();
      expect(screen.getByText('Apply Armstrong reflexivity first.')).toBeInTheDocument();
      expect(screen.getByText(/2 retry attempts left/i)).toBeInTheDocument();
      expect(screen.getByText(/Try Again \(Attempt 2 of 3\)/i)).toBeInTheDocument();
    });
  });

  it('reveals correct answer and step-by-step proof when attempt 3 is reached', async () => {
    vi.spyOn(practiceService, 'verifyAttempt').mockResolvedValueOnce({
      is_correct: false,
      attempt_number: 3,
      attempts_remaining: 0,
      gentle_message: 'Good effort! Normalization questions can be tricky. Here is the complete step-by-step mathematical proof and explanation.',
      hint: null,
      revealed_answer: 'C',
      explanation: '{A}+ = {A, B, C} by applying transitivity.',
      concept_summary: 'Concept Recap: Closure Lab principles successfully verified.',
    });

    render(
      <QuizPlayer
        questions={mockQuestions}
        config={mockConfig}
        bankType="ai"
        onComplete={vi.fn()}
        onExit={vi.fn()}
      />
    );

    // Select Option B
    fireEvent.click(screen.getByText('{A, B}'));
    fireEvent.click(screen.getByText('Verify Answer'));

    await waitFor(() => {
      expect(screen.getByText(/Complete Proof & Resolution/i)).toBeInTheDocument();
      expect(screen.getByText(/Option C/i)).toBeInTheDocument();
      expect(screen.getByText('{A}+ = {A, B, C} by applying transitivity.')).toBeInTheDocument();
      expect(screen.getByText(/Finish & Review/i)).toBeInTheDocument();
    });
  });
});
