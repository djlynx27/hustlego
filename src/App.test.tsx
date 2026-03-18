import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the bottom navigation shell', async () => {
    render(<App />);
    expect(
      await screen.findByText(/Auj\.|Aujourd'hui|Today/i)
    ).toBeInTheDocument();
  });
});
