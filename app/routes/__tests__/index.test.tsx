import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route as HomePage } from '../index'; // The component to test
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API for SplitTaskButton
global.fetch = vi.fn();

const createFetchResponse = (ok: boolean, data: any, status = 200) => {
  return {
    ok,
    json: () => new Promise((resolve) => resolve(data)),
    status,
  } as Response;
};


// Mock SplitTaskButton's internal fetch and interaction
// We are testing the integration on the page, not the button itself here again.
// So, we simplify its behavior for these tests.
vi.mock('~/app/components/SplitTaskButton', () => ({
  default: ({ task, onSubtasksGenerated }: { task: any, onSubtasksGenerated: Function }) => (
    <button
      data-testid={`mock-split-button-${task.id}`}
      onClick={async () => {
        // Simulate API call within the page context if needed, or just call the callback
        // For these integration tests, directly calling the callback is simpler
        // if the actual API interaction isn't the focus.
        // If API interaction IS the focus, then the global.fetch mock above will be used.
        // For now, let's assume the button's own tests cover its fetch,
        // and here we just test if the page handles the callback.
        onSubtasksGenerated(task.id, [`Subtask for ${task.text} 1`, `Subtask for ${task.text} 2`]);
      }}
    >
      Split "{task.text}"
    </button>
  ),
}));


describe('HomePage (index.tsx) Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as vi.Mock).mockReset();
    // Default mock for split task API for tests that might trigger it
    (global.fetch as vi.Mock).mockResolvedValue(createFetchResponse(true, { subtasks: ['Mocked Sub 1', 'Mocked Sub 2'] }));
  });

  const renderPage = () => {
    render(<HomePage />);
  };

  it('adds a new task to the list', async () => {
    renderPage();
    const input = screen.getByPlaceholderText('Add a new task');
    const addButton = screen.getByRole('button', { name: /add task/i });

    await user.type(input, 'New Integrated Task');
    await user.click(addButton);

    expect(await screen.findByText('New Integrated Task')).toBeInTheDocument();
    // Check if total tasks count updated (if displayed)
    expect(screen.getByText(/total tasks: 1/i)).toBeInTheDocument();
  });

  it('toggles task completion', async () => {
    renderPage();
    // Add a task first
    const input = screen.getByPlaceholderText('Add a new task');
    const addButton = screen.getByRole('button', { name: /add task/i });
    await user.type(input, 'Task to Toggle');
    await user.click(addButton);
    const taskTextElement = await screen.findByText('Task to Toggle');

    // Find the checkbox associated with the task
    // Assuming checkbox is a sibling or parent contains it
    const taskItem = taskTextElement.closest('div[class*="flex items-center gap-2"]'); // Adjust selector based on actual DOM
    if (!taskItem) throw new Error("Task item container not found for toggle test");
    const checkbox = taskItem.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (!checkbox) throw new Error("Checkbox not found for toggle test");


    expect(checkbox).not.toBeChecked();
    expect(taskTextElement).not.toHaveClass('line-through');
    expect(screen.getByText(/completed tasks: 0/i)).toBeInTheDocument();


    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(taskTextElement).toHaveClass('line-through');
    expect(screen.getByText(/completed tasks: 1/i)).toBeInTheDocument();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(taskTextElement).not.toHaveClass('line-through');
    expect(screen.getByText(/completed tasks: 0/i)).toBeInTheDocument();
  });

  it('deletes a task', async () => {
    renderPage();
    // Add a task
    await user.type(screen.getByPlaceholderText('Add a new task'), 'Task to Delete');
    await user.click(screen.getByRole('button', { name: /add task/i }));
    const taskTextElement = await screen.findByText('Task to Delete');
    expect(taskTextElement).toBeInTheDocument();
    expect(screen.getByText(/total tasks: 1/i)).toBeInTheDocument();


    // Find delete button for this task
    const taskItemContainer = taskTextElement.closest('div[class*="flex flex-col"]'); // Adjust to your TaskItem's root
    if (!taskItemContainer) throw new Error("Task item container not found for delete test");
    const deleteButton = taskItemContainer.querySelector('button[aria-label*="Delete task"]') as HTMLButtonElement;
    if (!deleteButton) throw new Error("Delete button not found");

    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/total tasks: 0/i)).toBeInTheDocument();
  });

  it('edits a task', async () => {
    renderPage();
    // Add a task
    await user.type(screen.getByPlaceholderText('Add a new task'), 'Task to Edit');
    await user.click(screen.getByRole('button', { name: /add task/i }));
    const taskTextElement = await screen.findByText('Task to Edit');

    const taskItemContainer = taskTextElement.closest('div[class*="flex flex-col"]');
    if (!taskItemContainer) throw new Error("Task item container not found for edit test");
    const editButton = taskItemContainer.querySelector('button[aria-label*="Edit task"]') as HTMLButtonElement;
    if (!editButton) throw new Error("Edit button not found");

    await user.click(editButton);

    const inputField = await screen.findByRole('textbox', {name: /edit task text/i});
    expect(inputField).toHaveValue('Task to Edit');
    await user.clear(inputField);
    await user.type(inputField, 'Successfully Edited Task');

    const saveButton = taskItemContainer.querySelector('button[aria-label*="Save task"]') as HTMLButtonElement;
    if (!saveButton) throw new Error("Save button not found");
    await user.click(saveButton);

    expect(await screen.findByText('Successfully Edited Task')).toBeInTheDocument();
    expect(screen.queryByText('Task to Edit')).not.toBeInTheDocument();
  });

  it('splits a task and adds subtasks to the list', async () => {
    renderPage();
    // Add a task
    await user.type(screen.getByPlaceholderText('Add a new task'), 'Complex Task');
    await user.click(screen.getByRole('button', { name: /add task/i }));
    const taskTextElement = await screen.findByText('Complex Task');
    expect(taskTextElement).toBeInTheDocument();

    // Find the mocked split button for this task
    const splitButton = await screen.findByTestId('mock-split-button-task0'); // Assuming IDs are task0, task1 etc. or adjust mock
    // The mock SplitTaskButton above is generic, so we need to find it by its text content or a more robust test ID
    // Let's assume the first task added gets id 'task0' or similar in this test context
    // This part is tricky without knowing the exact ID generation in tests.
    // For a more robust approach, the mock could pass the task ID to the test ID:
    // data-testid={`mock-split-button-${task.id}`} (as done in the mock)

    // We need to find the task item and then the split button within it.
    // Let's re-add the task and assume it's the only one for simpler selection.
    // Clear existing tasks if any (or restart component for clean state - renderPage() does this due to beforeEach)

    const addedTask = await screen.findByText('Complex Task');
    const taskItemRoot = addedTask.closest('div[class*="flex flex-col"]'); // Root of TaskItem
    if (!taskItemRoot) throw new Error("Cannot find task item root for split test");
    
    const specificSplitButton = taskItemRoot.querySelector('button[data-testid*="mock-split-button-"]') as HTMLButtonElement;
    if(!specificSplitButton) throw new Error("Mocked split button not found in task item");

    await user.click(specificSplitButton);

    // The mock directly calls onSubtasksGenerated, which adds new tasks prefixed "Sub:"
    await waitFor(async () => {
      expect(await screen.findByText('Sub: Subtask for Complex Task 1')).toBeInTheDocument();
      expect(await screen.findByText('Sub: Subtask for Complex Task 2')).toBeInTheDocument();
    });

    // Original task might still be there or be replaced, depending on handleSubtasksGenerated
    expect(screen.getByText('Complex Task')).toBeInTheDocument(); // In current impl, original task remains
    expect(screen.getByText(/total tasks: 3/i)).toBeInTheDocument(); // Original + 2 subtasks
  });
});
