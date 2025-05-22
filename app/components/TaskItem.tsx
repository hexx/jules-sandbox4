import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Input } from '~/components/ui/input';
import { Task } from '~/app/types';
import SplitTaskButton from './SplitTaskButton';
import { Trash2, Edit3, Save, XCircle } from 'lucide-react'; // Icons

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onSubtasksGenerated: (taskId: string, subtasks: string[]) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newText: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onSubtasksGenerated,
  onDeleteTask,
  onEditTask,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleSave = () => {
    if (editText.trim()) {
      onEditTask(task.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col p-2 border-b gap-1"> {/* Added gap-1 for spacing elements */}
      <div className="flex items-center gap-2">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          aria-label={`Mark task "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
          disabled={isEditing} // Disable checkbox when editing
        />
        {isEditing ? (
          <Input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex-grow h-8" // Adjusted height
            aria-label="Edit task text"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel();}}
          />
        ) : (
          <label
            htmlFor={`task-${task.id}`}
            className={`flex-grow ${task.completed ? 'line-through text-gray-500' : ''}`}
            onDoubleClick={() => { if (!task.completed) setIsEditing(true); }} // Optional: double click to edit
          >
            {task.text}
          </label>
        )}
        <div className="flex gap-1"> {/* Group buttons */}
          {isEditing ? (
            <>
              <Button variant="outline" size="icon" onClick={handleSave} aria-label="Save task">
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCancel} aria-label="Cancel editing">
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} aria-label="Edit task" disabled={task.completed}>
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteTask(task.id)}
                aria-label={`Delete task "${task.text}"`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Display subtasks and split button only when not editing */}
      {!isEditing && (
        <>
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="ml-8 mt-1 pl-2 border-l"> {/* Adjusted margin */}
              <h5 className="text-xs font-semibold text-gray-600">Sub-tasks:</h5>
              <ul className="list-disc list-inside pl-2 text-sm text-gray-700">
                {task.subtasks.map((sub, index) => (
                  <li key={index}>{sub}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="ml-8 mt-1"> {/* Adjusted margin */}
            <SplitTaskButton task={task} onSubtasksGenerated={onSubtasksGenerated} />
          </div>
        </>
      )}
    </div>
  );
};

export default TaskItem;
