import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTaskForm from '../AddTaskForm';
import { describe, it, expect, vi } from 'vitest';

describe('AddTaskForm', () => {
  it('renders the input field and submit button', () => {
    render(<AddTaskForm onAddTask={() => {}} />);
    expect(screen.getByPlaceholderText('Add a new task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('updates input value on change', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm onAddTask={() => {}} />);
    const input = screen.getByPlaceholderText('Add a new task');
    await user.type(input, 'New Task');
    expect(input).toHaveValue('New Task');
  });

  it('calls onAddTask with the task text on form submission', async () => {
    const user = userEvent.setup();
    const mockOnAddTask = vi.fn();
    render(<AddTaskForm onAddTask={mockOnAddTask} />);
    const input = screen.getByPlaceholderText('Add a new task');
    const button = screen.getByRole('button', { name: /add task/i });

    await user.type(input, 'A new task to add');
    await user.click(button);

    expect(mockOnAddTask).toHaveBeenCalledTimes(1);
    expect(mockOnAddTask).toHaveBeenCalledWith('A new task to add');
    expect(input).toHaveValue(''); // Input should be cleared after submission
  });

  it('does not call onAddTask if the input is empty', async () => {
    const user = userEvent.setup();
    const mockOnAddTask = vi.fn();
    render(<AddTaskForm onAddTask={mockOnAddTask} />);
    const button = screen.getByRole('button', { name: /add task/i });

    await user.click(button);

    expect(mockOnAddTask).not.toHaveBeenCalled();
  });

  it('does not call onAddTask if the input is only whitespace', async () => {
    const user = userEvent.setup();
    const mockOnAddTask = vi.fn();
    render(<AddTaskForm onAddTask={mockOnAddTask} />);
    const input = screen.getByPlaceholderText('Add a new task');
    const button = screen.getByRole('button', { name: /add task/i });

    await user.type(input, '   ');
    await user.click(button);

    expect(mockOnAddTask).not.toHaveBeenCalled();
  });
});
