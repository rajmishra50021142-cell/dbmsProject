import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PracticePage } from '../pages/PracticePage';
import { practiceService } from '../services/practiceService';

describe('PracticePage Interactive PYQ Clicks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens QuizConfigModal when clicking Start PYQ Session button in PYQ tab', async () => {
    render(<PracticePage />);

    // Switch to PYQ tab
    const pyqTab = screen.getByRole('button', { name: /Competitive Exam PYQs/i });
    fireEvent.click(pyqTab);

    // Click "Start PYQ Session"
    const startPyqBtn = document.getElementById('start-pyq-session-btn')!;
    expect(startPyqBtn).toBeInTheDocument();
    fireEvent.click(startPyqBtn);

    // Modal should immediately be visible
    expect(screen.getByText('Start Competitive PYQ Session')).toBeInTheDocument();
    expect(screen.getByText('Interaction Style')).toBeInTheDocument();
    expect(screen.getByText('Start Quiz Session')).toBeInTheDocument();
  });

  it('opens QuizConfigModal when clicking Start PYQ Simulation in hero overview card', async () => {
    render(<PracticePage />);

    const heroPyqBtn = document.getElementById('start-pyq-quiz-btn')!;
    expect(heroPyqBtn).toBeInTheDocument();
    fireEvent.click(heroPyqBtn);

    expect(screen.getByText('Start Competitive PYQ Session')).toBeInTheDocument();
  });

  it('directly starts GATE FD & Normalization quiz when clicking FD Focus card', async () => {
    render(<PracticePage />);

    // Switch to PYQ tab
    const pyqTab = screen.getByRole('button', { name: /Competitive Exam PYQs/i });
    fireEvent.click(pyqTab);

    const gateBtn = document.getElementById('gate-fd-focus-btn')!;
    expect(gateBtn).toBeInTheDocument();
    fireEvent.click(gateBtn);

    // Should load the quiz player screen
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();
    });
  });

  it('directly starts Mixed GATE DBMS quiz when clicking mixed exam button', async () => {
    render(<PracticePage />);

    const pyqTab = screen.getByRole('button', { name: /Competitive Exam PYQs/i });
    fireEvent.click(pyqTab);

    const mockBtn = document.getElementById('mixed-gate-quiz-btn')!;
    expect(mockBtn).toBeInTheDocument();
    fireEvent.click(mockBtn);

    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();
    });
  });

  it('renders and allows expanding questions in the PYQ catalog on the PYQ tab', async () => {
    render(<PracticePage />);

    const pyqTab = screen.getByRole('button', { name: /Competitive Exam PYQs/i });
    fireEvent.click(pyqTab);

    // Check that PYQ catalog is rendered right below the banner
    expect(screen.getByText(/Competitive Exam Questions Catalog/i)).toBeInTheDocument();

    // Find first question expand trigger and click it
    const question1 = screen.getByText(/Let P, Q, R and S be the attributes/i);
    expect(question1).toBeInTheDocument();
    fireEvent.click(question1);

    // Should reveal Options and Verified Explanation
    await waitFor(() => {
      expect(screen.getByText(/Verified Explanation & Proof:/i)).toBeInTheDocument();
    });
  });
});
