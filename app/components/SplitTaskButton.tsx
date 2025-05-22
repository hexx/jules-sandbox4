import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Task } from '~/app/types';
// Mocking a Dialog component for now, replace with shadcn/ui later if needed
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";

interface SplitTaskButtonProps {
  task: Task;
  onSubtasksGenerated: (taskId: string, subtasks: string[]) => void;
}

const SplitTaskButton: React.FC<SplitTaskButtonProps> = ({ task, onSubtasksGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<string[] | null>(null);

  const handleSplitTask = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestedSubtasks(null);

    try {
      const response = await fetch('/api/split-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskDescription: task.text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to split task');
      }

      const result = await response.json();
      if (result.subtasks && result.subtasks.length > 0) {
        setSuggestedSubtasks(result.subtasks);
        // Optionally, call a prop function to lift these subtasks up
        // onSubtasksGenerated(task.id, result.subtasks);
      } else {
        setError('No subtasks were generated.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <Button onClick={handleSplitTask} disabled={isLoading} variant="outline" size="sm">
        {isLoading ? 'Splitting...' : 'Split Task'}
      </Button>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {suggestedSubtasks && (
        <div className="mt-2 p-2 border rounded-md bg-gray-50">
          <h4 className="text-sm font-semibold mb-1">Suggested Subtasks:</h4>
          <ul className="list-disc list-inside pl-2 text-sm">
            {suggestedSubtasks.map((sub, index) => (
              <li key={index}>{sub}</li>
            ))}
          </ul>
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 text-xs"
            onClick={() => onSubtasksGenerated(task.id, suggestedSubtasks)}
          >
            Add these as new tasks
          </Button>
        </div>
      )}
    </div>
  );
};

export default SplitTaskButton;
