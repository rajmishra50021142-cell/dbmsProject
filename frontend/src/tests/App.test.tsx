import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import App from '../App';

describe('App Root and Navigation', () => {
  it('renders the product title in the navbar', () => {
    render(<App />);
    const brandElements = screen.getAllByText('Normalization Lab');
    expect(brandElements.length).toBeGreaterThan(0);
  });

  it('renders all mandatory navigation links in main navigation', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(within(nav).getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /analyzer/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /closure lab/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /keys lab/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /learn/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /history/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /help/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /developed by/i })).toBeInTheDocument();
  });

  it('renders the 1NF to 4NF journey preview on the home page', () => {
    render(<App />);
    expect(screen.getByText('The 1NF → 2NF → 3NF → 4NF Normalization Journey')).toBeInTheDocument();
    expect(screen.getByText('First Normal Form')).toBeInTheDocument();
    expect(screen.getByText('Second Normal Form')).toBeInTheDocument();
    expect(screen.getByText('Third Normal Form')).toBeInTheDocument();
    expect(screen.getByText('Fourth Normal Form')).toBeInTheDocument();
  });
});
