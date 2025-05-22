import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SplitTaskButton from '../SplitTaskButton';
import { Task } from '~/app/types';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocking fetch
global.fetch = vi.fn();

const createFetchResponse = (ok: boolean, data: any, status = 200) => {
  return {
    ok,
    json: () => new Promise((resolve) => resolve(data)),
    status,
  } as Response;
};

describe('SplitTaskButton', () => {
  const mockTask: Task = {
    id: 'task1',
    text: 'Complex Task to Split',
    completed: false,
  };
  const mockOnSubtasksGenerated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as vi.Mock).mockReset();
  });

  const renderComponent = (task = mockTask) => {
    render(
      <SplitTaskButton task={task} onSubtasksGenerated={mockOnSubtasksGenerated} />
    );
  };

  it('renders the "Split Task" button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /split task/i })).toBeInTheDocument();
  });

  it('calls fetch with task description when "Split Task" button is clicked', async () => {
    const user = userEvent.setup();
    (global.fetch as vi.Mock).mockResolvedValue(createFetchResponse(true, { subtasks: ['Subtask 1'] }));
    renderComponent();

    const splitButton = screen.getByRole('button', { name: /split task/i });
    await user.click(splitButton);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/split-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskDescription: mockTask.text }),
    });
  });

  it('displays "Splitting..." text and disables button during fetch', async () => {
    const user = userEvent.setup();
    // Make the fetch promise hang to check loading state
    (global.fetch as vi.Mock).mockImplementation(() => new Promise(() => {}));
    renderComponent();

    const splitButton = screen.getByRole('button', { name: /split task/i });
    await user.click(splitButton);

    expect(screen.getByRole('button', { name: /splitting.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /splitting.../i })).toBeDisabled();
  });

  it('displays suggested subtasks and "Add these as new tasks" button on successful fetch', async () => {
    const user = userEvent.setup();
    const subtasks = ['Subtask Alpha', 'Subtask Beta'];
    (global.fetch as vi.Mock).mockResolvedValue(createFetchResponse(true, { subtasks }));
    renderComponent();

    const splitButton = screen.getByRole('button', { name: /split task/i });
    await user.click(splitButton);

    await waitFor(() => {
      expect(screen.getByText('Suggested Subtasks:')).toBeInTheDocument();
      expect(screen.getByText('Subtask Alpha')).toBeInTheDocument();
      expect(screen.getByText('Subtask Beta')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add these as new tasks/i })).toBeInTheDocument();
    });
  });

  it('calls onSubtasksGenerated when "Add these as new tasks" button is clicked', async () => {
    const user = userEvent.setup();
    const subtasks = ['Generated Sub 1', 'Generated Sub 2'];
    (global.fetch as vi.Mock).mockResolvedValue(createFetchResponse(true, { subtasks }));
    renderComponent();

    const splitButton = screen.getByRole('button', { name: /split task/i });
    await user.click(splitButton); // First click to fetch and show subtasks

    const addSubtasksButton = await screen.findByRole('button', { name: /add these as new tasks/i });
    await user.click(addSubtasksButton);

    expect(mockOnSubtasksGenerated).toHaveBeenCalledTimes(1);
    expect(mockOnSubtasksGenerated).toHaveBeenCalledWith(mockTask.id, subtasks);
  });

  it('displays error message if fetch fails', async () => {
    const user = userEvent.setup();
    (global.fetch as vi.Mock).mockResolvedValue(createFetchResponse(false, { error: 'AI failed' }, 500));
    renderComponent();

    const splitButton = screen.getByRole('button', { name: /split task/i });
    await user.click(splitButton);

    await waitFor(() => {
      expect(screen.getByText('AI failed')).toBeInTheDocument();
    });
  });

  it('displays "No subtasks were generated." if fetch is ok but no subtasks in response', async () => {
    const user = userEvent.setup();
    (global.fetch as vi.Mock).mockResolvedValue(createFetchResponse(true, { subtasks: [] }));
    renderComponent();

    const splitButton = screen.getByRole('button', { name: /split task/i });
    await user.click(splitButton);

    await waitFor(() => {
      expect(screen.getByText('No subtasks were generated.')).toBeInTheDocument();
    });
  });
    
  it('displays generic error if response.json() fails or network error', async () => {
    const user = userEvent.setup();
    (global.fetch as vi.Mock).mockRejectedValue(new Error('Network error'));
    renderComponent();

    const splitButton = screen.getByRole('button', { name: /split task/i });
    await user.click(splitButton);

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
    });
  });

});
