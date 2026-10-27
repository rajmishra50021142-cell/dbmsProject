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
    marks: 1,
    exam: 'GATE CSE',
    year: '2024',
  },
];

const mockConfig: QuizConfig = {
  question_count: 1,
  untimed: true,
  mode: 'practice',
};

describe('QuizPlayer Direct Answer Recording and Submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders question statement, marks, topic, and does NOT render difficulty at the top', () => {
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
    expect(screen.getByText('Closure Lab')).toBeInTheDocument();
    expect(screen.getByText('1 Mark')).toBeInTheDocument();
    expect(screen.getByText("GATE CSE '2024")).toBeInTheDocument();
    // Verify difficulty is NOT rendered at the top
    expect(screen.queryByText('Easy')).not.toBeInTheDocument();
    // Verify "Verify Answer" button from old gentle retry is NOT rendered
    expect(screen.queryByText('Verify Answer')).not.toBeInTheDocument();
  });

  it('records option directly and submits quiz to receive marks at the end', async () => {
    const onCompleteMock = vi.fn();
    const submitSpy = vi.spyOn(practiceService, 'submitQuiz').mockResolvedValueOnce({
      total_questions: 1,
      answered_count: 1,
      correct_count: 1,
      incorrect_count: 0,
      unanswered_count: 0,
      total_marks: 1,
      earned_marks: 1,
      score_percentage: 100,
      time_spent_seconds: 15,
      topic_breakdown: { 'Closure Lab': { total: 1, correct: 1 } },
      question_reviews: [
        {
          question_id: 'ai-test-q1',
          statement: mockQuestions[0].statement,
          options: mockQuestions[0].options,
          selected_option: 'C',
          correct_answer: 'C',
          is_correct: true,
          explanation: mockQuestions[0].explanation,
          topic: 'Closure Lab',
          marks: 1,
        },
      ],
      supportive_summary: 'Outstanding mastery!',
    });

    render(
      <QuizPlayer
        questions={mockQuestions}
        config={mockConfig}
        bankType="ai"
        onComplete={onCompleteMock}
        onExit={vi.fn()}
      />
    );

    // Select Option C
    const optionC = screen.getByText('{A, B, C}');
    fireEvent.click(optionC);

    // Submit All Answers
    const submitBtn = screen.getByText('Submit All Answers');
    fireEvent.click(submitBtn);

    // Confirm submission modal
    const confirmBtn = screen.getByText('Yes, Submit Quiz');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          bank_type: 'ai',
          answers: { 'ai-test-q1': 'C' },
        })
      );
      expect(onCompleteMock).toHaveBeenCalled();
    });
  });
});
