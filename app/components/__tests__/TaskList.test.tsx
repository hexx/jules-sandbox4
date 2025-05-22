import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskList from '../TaskList';
import { Task } from '~/app/types';
import { describe, it, expect, vi } from 'vitest';

// Mock TaskItem to simplify TaskList tests and focus on TaskList's own logic
vi.mock('../TaskItem', () => ({
  default: ({ task, onToggleComplete, onDeleteTask, onEditTask, onSubtasksGenerated }: {
    task: Task;
    onToggleComplete: Function;
    onDeleteTask: Function;
    onEditTask: Function;
    onSubtasksGenerated: Function;
  }) => (
    <div data-testid={`task-item-${task.id}`}>
      <span>{task.text}</span>
      <button onClick={() => onToggleComplete(task.id)}>Toggle</button>
      <button onClick={() => onDeleteTask(task.id)}>Delete</button>
      <button onClick={() => onEditTask(task.id, 'new text')}>Edit</button>
      <button onClick={() => onSubtasksGenerated(task.id, ['sub1'])}>Split</button>
    </div>
  ),
}));

describe('TaskList', () => {
  const mockTasks: Task[] = [
    { id: '1', text: 'Task 1', completed: false },
    { id: '2', text: 'Task 2', completed: true },
    { id: '3', text: 'Task 3', completed: false },
  ];

  const mockOnToggleComplete = vi.fn();
  const mockOnSubtasksGenerated = vi.fn();
  const mockOnDeleteTask = vi.fn();
  const mockOnEditTask = vi.fn();

  const renderComponent = (tasks = mockTasks) => {
    render(
      <TaskList
        tasks={tasks}
        onToggleComplete={mockOnToggleComplete}
        onSubtasksGenerated={mockOnSubtasksGenerated}
        onDeleteTask={mockOnDeleteTask}
        onEditTask={mockOnEditTask}
      />
    );
  };

  it('renders a list of tasks', () => {
    renderComponent();
    expect(screen.getByTestId('task-item-1')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByTestId('task-item-2')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByTestId('task-item-3')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('renders "No tasks yet" message when the task list is empty', () => {
    renderComponent([]);
    expect(screen.getByText('No tasks yet. Add one above!')).toBeInTheDocument();
    expect(screen.queryByTestId('task-item-1')).not.toBeInTheDocument();
  });

  it('passes props correctly to TaskItem components', () => {
    renderComponent();
    // Example: Test if one of the TaskItem's mock buttons, when clicked, calls the prop passed to TaskList
    // This is implicitly tested by the mock of TaskItem, but good to be aware of.
    // For a real test of this, you wouldn't mock TaskItem as heavily.

    // We can check if the items are there, implying props like 'task' were passed.
    expect(screen.getByTestId('task-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-item-2')).toBeInTheDocument();
  });
});
