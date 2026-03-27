import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tasks } from './Tasks';

describe('Tasks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the add task input', () => {
    render(<Tasks />);
    expect(screen.getByPlaceholderText('Add a task...')).toBeDefined();
  });

  it('renders the Add button', () => {
    render(<Tasks />);
    expect(screen.getByText('Add')).toBeDefined();
  });

  it('renders filter tabs', () => {
    render(<Tasks />);
    expect(screen.getByText('All')).toBeDefined();
    expect(screen.getByText('Active')).toBeDefined();
    expect(screen.getByText('Completed')).toBeDefined();
  });

  it('renders completed count', () => {
    render(<Tasks />);
    expect(screen.getByText(/of.*completed/)).toBeDefined();
  });

  it('shows empty state when no tasks', () => {
    render(<Tasks />);
    expect(screen.getByText('No tasks yet. Add one above!')).toBeDefined();
  });

  it('can add a task', () => {
    render(<Tasks />);
    const input = screen.getByPlaceholderText('Add a task...');
    const addBtn = screen.getByText('Add');

    fireEvent.change(input, { target: { value: 'Test task' } });
    fireEvent.click(addBtn);

    expect(screen.getByText('Test task')).toBeDefined();
  });

  it('can toggle a task', () => {
    render(<Tasks />);
    const input = screen.getByPlaceholderText('Add a task...');
    const addBtn = screen.getByText('Add');

    fireEvent.change(input, { target: { value: 'Toggle me' } });
    fireEvent.click(addBtn);

    // Find the checkbox button for this task
    const checkbox = screen.getByLabelText('Mark complete');
    fireEvent.click(checkbox);

    // Task text should now have line-through style
    const taskText = screen.getByText('Toggle me');
    expect(taskText.style.textDecoration).toBe('line-through');
  });

  it('can delete a task', () => {
    render(<Tasks />);
    const input = screen.getByPlaceholderText('Add a task...');
    const addBtn = screen.getByText('Add');

    fireEvent.change(input, { target: { value: 'Delete me' } });
    fireEvent.click(addBtn);

    expect(screen.getByText('Delete me')).toBeDefined();

    const deleteBtn = screen.getByTitle('Delete task');
    fireEvent.click(deleteBtn);

    // Back to empty state
    expect(screen.getByText('No tasks yet. Add one above!')).toBeDefined();
  });
});
