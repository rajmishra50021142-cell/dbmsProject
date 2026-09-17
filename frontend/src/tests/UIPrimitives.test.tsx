import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

describe('UI Primitives', () => {
  it('renders Button with variants and handles disabled state', () => {
    const { rerender } = render(<Button variant="primary">Click Me</Button>);
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();

    rerender(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button', { name: 'Disabled Button' })).toBeDisabled();
  });

  it('renders Badge with custom content and variant styles', () => {
    render(<Badge variant="success">Normalized</Badge>);
    expect(screen.getByText('Normalized')).toBeInTheDocument();
  });

  it('renders Card with header and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Schema Title</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Schema Description Content</p>
        </CardContent>
      </Card>
    );
    expect(screen.getByText('Schema Title')).toBeInTheDocument();
    expect(screen.getByText('Schema Description Content')).toBeInTheDocument();
  });
});
