import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../components/common/ThemeToggle';

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('renders theme toggle button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('toggles dark class on documentElement when clicked', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    
    // Initial state might be light (or dark based on system, but let's click and check change)
    const initialIsDark = document.documentElement.classList.contains('dark');
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(!initialIsDark);

    // Second click reverts
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(initialIsDark);
  });
});
