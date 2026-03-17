import { render, screen } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

describe('App', () => {
  it('renders the main page', () => {
    render(<App />);
    expect(screen.getByText(/vite/i)).toBeInTheDocument();
  });
});
