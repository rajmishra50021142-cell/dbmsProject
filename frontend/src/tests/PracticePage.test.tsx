import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PracticePage } from '../pages/PracticePage';
import { practiceService } from '../services/practiceService';
import type { PracticeSummary, QuizQuestion } from '../types/practice';

const mockSummary: PracticeSummary = {
  ai_practice: {
    total_questions: 30,
    topics: ['Candidate Keys', 'Closure', '2NF', '3NF', 'BCNF'],
    difficulties: ['Easy', 'Medium', 'Hard'],
  },
  pyq_practice: {
    total_questions: 115,
    playable_questions: 110,
    incomplete_questions: 5,
    topics: ['Functional Dependencies and Normalization', 'Structured Query Language (SQL)', 'ER Diagrams'],
    exams: ['GATE CSE'],
  },
};

const mockAiQuestions: QuizQuestion[] = [
  {
    id: 'ai-q01',
    bank_type: 'ai',
    statement: 'What is the candidate key of R(A, B, C) with A -> B, B -> C?',
    options: ['A) A', 'B) B', 'C) C', 'D) AB'],
    correct_answer: 'A',
    explanation: 'A closure is {A, B, C}, so A is a candidate key.',
    topic: 'Candidate Keys',
    difficulty: 'Easy',
    hints: ['Compute attribute closure of each option.', 'A determines all attributes.'],
    question_type: 'MCQ',
    status: 'playable',
  },
];

describe('PracticePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(practiceService, 'getSummary').mockResolvedValue(mockSummary);
    vi.spyOn(practiceService, 'getPyqQuestions').mockResolvedValue([]);
    vi.spyOn(practiceService, 'getAiQuestions').mockResolvedValue(mockAiQuestions);
  });

  it('renders hero banner and question bank badges without gentle retry engine', async () => {
    render(<PracticePage />);

    expect(screen.getByText('DBMS Practice & Competitive Exam Lab')).toBeInTheDocument();
    expect(screen.getByText('AI Practice Bank')).toBeInTheDocument();
    expect(screen.getAllByText('Competitive Exam PYQs').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('PYQ Library Archive').length).toBeGreaterThanOrEqual(1);

    // Verify Gentle Retry is NOT present
    expect(screen.queryByText('Gentle Retry Feedback')).not.toBeInTheDocument();
    expect(screen.queryByText(/3-Attempt Gentle Retry Engine/i)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('30 Questions')).toBeInTheDocument();
      expect(screen.getByText('115 GATE Questions (110 Playable)')).toBeInTheDocument();
    });
  });

  it('switches tabs between AI Practice, PYQs, and Library and does not contain legacy exercises tab', async () => {
    render(<PracticePage />);

    // Click PYQs Tab
    const pyqTab = document.getElementById('tab-pyq-practice')!;
    fireEvent.click(pyqTab);

    expect(screen.getByText(/Competitive Exam PYQ Simulations/i)).toBeInTheDocument();

    // Click Question Library Tab
    const libraryTab = document.getElementById('tab-pyq-library')!;
    fireEvent.click(libraryTab);

    await waitFor(() => {
      expect(screen.getByText(/110 Scored \/ Playable • 5 Historical Subjective/i)).toBeInTheDocument();
    });

    // Verify Academic Exercises Tab is removed
    expect(document.getElementById('tab-academic-exercises')).toBeNull();
    expect(screen.queryByText(/Academic Normalization Exercises/i)).not.toBeInTheDocument();
  });

  it('opens config modal and launches a practice session', async () => {
    render(<PracticePage />);

    const startBtn = screen.getByText('Start AI Practice');
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(screen.getByText('Start AI Practice Session')).toBeInTheDocument();
      expect(screen.getByText('Interaction Style')).toBeInTheDocument();
    });

    const confirmStart = screen.getByText('Start Quiz Session');
    fireEvent.click(confirmStart);

    await waitFor(() => {
      expect(screen.getByText(/Question 1 of 1/i)).toBeInTheDocument();
      expect(screen.getByText('What is the candidate key of R(A, B, C) with A -> B, B -> C?')).toBeInTheDocument();
    });
  });
});
