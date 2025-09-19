import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Ocean Notes header and empty state', () => {
  render(<App />);
  // Header brand title
  expect(screen.getByText(/Ocean Notes/i)).toBeInTheDocument();
  // Empty state when no note selected initially
  expect(screen.getByText(/No note selected/i)).toBeInTheDocument();
});
