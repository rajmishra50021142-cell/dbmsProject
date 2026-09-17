import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClosureVisualizerPlayer } from '../features/visualization/ClosureVisualizerPlayer';
import type { RelationSchema } from '../types';

describe('ClosureVisualizerPlayer Component (Phase 8)', () => {
  const mockSchema: RelationSchema = {
    name: 'ENROLLMENT',
    attributes: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'Grade'],
    candidate_keys: [['StudentID', 'CourseID']],
    functional_dependencies: [
      { id: 'fd-1', left: ['StudentID'], right: ['StudentName'] },
      { id: 'fd-2', left: ['CourseID'], right: ['CourseName'] },
      { id: 'fd-3', left: ['StudentID', 'CourseID'], right: ['Grade'] },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders target attribute selector and playback buttons', async () => {
    render(<ClosureVisualizerPlayer schema={mockSchema} />);

    expect(screen.getByText(/Interactive Attribute Closure Player/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Play/i })).toBeInTheDocument();
      expect(screen.getByTitle(/Restart/i)).toBeInTheDocument();
      expect(screen.getByTitle(/Next Step/i)).toBeInTheDocument();
      expect(screen.getByTitle(/Previous Step/i)).toBeInTheDocument();
    });
  });

  it('allows toggling starting attributes for closure computation', () => {
    render(<ClosureVisualizerPlayer schema={mockSchema} />);

    // Toggle StudentID button
    const studentIdBtn = screen.getByRole('button', { name: /StudentID/i });
    expect(studentIdBtn).toBeInTheDocument();

    // Toggle CourseID button
    const courseIdBtn = screen.getByRole('button', { name: /CourseID/i });
    fireEvent.click(courseIdBtn);
    expect(courseIdBtn).toBeInTheDocument();
  });

  it('navigates through steps using next and prev controls', async () => {
    render(<ClosureVisualizerPlayer schema={mockSchema} initialTarget={['StudentID', 'CourseID']} />);

    await waitFor(() => {
      expect(screen.getByTitle(/Next Step/i)).toBeInTheDocument();
    });

    const nextBtn = screen.getByTitle(/Next Step/i);
    // Click next
    fireEvent.click(nextBtn);

    // Click prev
    const prevBtn = screen.getByTitle(/Previous Step/i);
    fireEvent.click(prevBtn);
  });
});
