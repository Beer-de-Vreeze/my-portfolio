import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouteError } from '@/components/features/RouteError';

describe('RouteError', () => {
  const mockError = { name: 'Error', message: 'Something failed', digest: 'abc123' } as Error & { digest: string };

  it('renders the heading', () => {
    render(<RouteError error={mockError} reset={() => {}} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows the pageName in the subheading', () => {
    render(<RouteError error={mockError} reset={() => {}} pageName="Projects" />);
    expect(screen.getByText('Projects encountered an unexpected error.')).toBeInTheDocument();
  });

  it('defaults to "Page" when no pageName is provided', () => {
    render(<RouteError error={mockError} reset={() => {}} />);
    expect(screen.getByText('Page encountered an unexpected error.')).toBeInTheDocument();
  });

  it('calls reset when "Try again" is clicked', async () => {
    const reset = vi.fn();
    render(<RouteError error={mockError} reset={reset} />);
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it('renders a "Go home" link pointing to /', () => {
    render(<RouteError error={mockError} reset={() => {}} />);
    const link = screen.getByRole('link', { name: /go home/i });
    expect(link).toHaveAttribute('href', '/');
  });
});
