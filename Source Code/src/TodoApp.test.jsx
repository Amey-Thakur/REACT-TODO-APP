/**
 * ----------------------------------------------------------------------------
 * File: TodoApp.test.js
 * Authors:
 *      Amey Thakur
 *      GitHub: https://github.com/ameythakur
 *
 *      Mega Satish
 *      GitHub: https://github.com/msatmod
 *
 * Repository: https://github.com/Amey-Thakur/REACT-TODO-APP
 * License: MIT License
 * Release Date: June 25, 2022
 * ----------------------------------------------------------------------------
 *
 * File Overview:
 * Contains unit tests for the TodoApp component using React Testing Library.
 * Currently implements a smoke test to verify the application title renders correctly.
 *
 */

import { render, screen } from '@testing-library/react';
import TodoApp from './TodoApp';

/**
 * Smoke Test:
 * Verifies that the main application rendering logic is functioning
 * and the expected title is present in the document.
 */
test('renders todo app title', () => {
  render(<TodoApp />);
  const titleElement = screen.getByText(/React Todo App/i);
  expect(titleElement).toBeInTheDocument();
});
