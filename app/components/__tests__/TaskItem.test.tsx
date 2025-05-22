import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskItem from '../TaskItem';
import { Task } from '~/app/types';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock SplitTaskButton as its functionality is tested separately
vi.mock('../SplitTaskButton', () => ({
  default: ({ task, onSubtasksGenerated }: { task: Task, onSubtasksGenerated: Function }) => (
    <button data-testid={`split-button-${task.id}`} onClick={() => onSubtasksGenerated(task.id, ['mock subtask'])}>
      Mock Split Task
    </button>
  )
}));


describe('TaskItem', () => {
  const mockTask: Task = {
    id: '1',
    text: 'Test Task',
    completed: false,
  };

  const mockOnToggleComplete = vi.fn();
  const mockOnSubtasksGenerated = vi.fn();
  const mockOnDeleteTask = vi.fn();
  const mockOnEditTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  const renderComponent = (task = mockTask) => {
    render(
      <TaskItem
        task={task}
        onToggleComplete={mockOnToggleComplete}
        onSubtasksGenerated={mockOnSubtasksGenerated}
        onDeleteTask={mockOnDeleteTask}
        onEditTask={mockOnEditTask}
      />
    );
  };

  it('renders task text and checkbox', () => {
    renderComponent();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('renders a completed task correctly', () => {
    renderComponent({ ...mockTask, completed: true });
    expect(screen.getByText('Test Task')).toHaveClass('line-through');
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onToggleComplete when checkbox is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(mockOnToggleComplete).toHaveBeenCalledTimes(1);
    expect(mockOnToggleComplete).toHaveBeenCalledWith('1');
  });

  it('calls onDeleteTask when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    await user.click(deleteButton);
    expect(mockOnDeleteTask).toHaveBeenCalledTimes(1);
    expect(mockOnDeleteTask).toHaveBeenCalledWith('1');
  });

  describe('Editing Mode', () => {
    it('enters editing mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      const editButton = screen.getByRole('button', { name: /edit task/i });
      await user.click(editButton);

      expect(screen.getByRole('textbox', {name: /edit task text/i})).toBeInTheDocument();
      expect(screen.getByRole('textbox', {name: /edit task text/i})).toHaveValue('Test Task');
      expect(screen.getByRole('button', { name: /save task/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel editing/i })).toBeInTheDocument();
      expect(screen.queryByText('Test Task')).not.toBeInTheDocument(); // Original label should be hidden
    });

    it('calls onEditTask with updated text when save button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      const editButton = screen.getByRole('button', { name: /edit task/i });
      await user.click(editButton);

      const inputField = screen.getByRole('textbox', {name: /edit task text/i});
      await user.clear(inputField);
      await user.type(inputField, 'Updated Task Text');

      const saveButton = screen.getByRole('button', { name: /save task/i });
      await user.click(saveButton);

      expect(mockOnEditTask).toHaveBeenCalledTimes(1);
      expect(mockOnEditTask).toHaveBeenCalledWith('1', 'Updated Task Text');
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument(); // Input field should be gone
      expect(screen.getByText('Updated Task Text')).toBeInTheDocument(); // Display updated text
    });

    it('does not call onEditTask if input is empty when saving', async () => {
        const user = userEvent.setup();
        renderComponent();
        const editButton = screen.getByRole('button', { name: /edit task/i });
        await user.click(editButton);

        const inputField = screen.getByRole('textbox', {name: /edit task text/i});
        await user.clear(inputField);
        await user.type(inputField, '   '); // Empty or whitespace

        const saveButton = screen.getByRole('button', { name: /save task/i });
        await user.click(saveButton);
        expect(mockOnEditTask).not.toHaveBeenCalled();
        // Stays in editing mode
        expect(screen.getByRole('textbox', {name: /edit task text/i})).toBeInTheDocument();
    });


    it('reverts to original text and exits editing mode on cancel', async () => {
      const user = userEvent.setup();
      renderComponent();
      const editButton = screen.getByRole('button', { name: /edit task/i });
      await user.click(editButton);

      const inputField = screen.getByRole('textbox', {name: /edit task text/i});
      await user.clear(inputField);
      await user.type(inputField, 'Temporary Edit');

      const cancelButton = screen.getByRole('button', { name: /cancel editing/i });
      await user.click(cancelButton);

      expect(mockOnEditTask).not.toHaveBeenCalled();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByText('Test Task')).toBeInTheDocument(); // Original text
    });

    it('saves on Enter key press in edit mode', async () => {
        const user = userEvent.setup();
        renderComponent();
        const editButton = screen.getByRole('button', { name: /edit task/i });
        await user.click(editButton);

        const inputField = screen.getByRole('textbox', {name: /edit task text/i});
        await user.clear(inputField);
        await user.type(inputField, 'Edited with Enter');
        await user.keyboard('{Enter}');

        expect(mockOnEditTask).toHaveBeenCalledWith('1', 'Edited with Enter');
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('cancels on Escape key press in edit mode', async () => {
        const user = userEvent.setup();
        renderComponent();
        const editButton = screen.getByRole('button', { name: /edit task/i });
        await user.click(editButton);

        const inputField = screen.getByRole('textbox', {name: /edit task text/i});
        await user.type(inputField, '{Escape}');

        expect(mockOnEditTask).not.toHaveBeenCalled();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('disables edit button for completed tasks', () => {
        renderComponent({ ...mockTask, completed: true });
        const editButton = screen.getByRole('button', { name: /edit task/i });
        expect(editButton).toBeDisabled();
    });
  });

  it('renders subtasks if present', () => {
    const taskWithSubtasks: Task = { ...mockTask, subtasks: ['Sub 1', 'Sub 2'] };
    renderComponent(taskWithSubtasks);
    expect(screen.getByText('Sub-tasks:')).toBeInTheDocument();
    expect(screen.getByText('Sub 1')).toBeInTheDocument();
    expect(screen.getByText('Sub 2')).toBeInTheDocument();
  });

  it('calls onSubtasksGenerated when mock split task button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    // The mock SplitTaskButton uses the task.id in its test id
    const splitButton = screen.getByTestId(`split-button-${mockTask.id}`);
    await user.click(splitButton);

    expect(mockOnSubtasksGenerated).toHaveBeenCalledTimes(1);
    expect(mockOnSubtasksGenerated).toHaveBeenCalledWith(mockTask.id, ['mock subtask']);
  });
});
