import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouteLoading } from '@/components/performance/RouteLoading';

describe('RouteLoading', () => {
  it('renders the default label', () => {
    render(<RouteLoading />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('renders a custom label', () => {
    render(<RouteLoading label="Loading Projects" />);
    expect(screen.getByText('Loading Projects')).toBeInTheDocument();
  });
});
