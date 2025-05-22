import React from 'react';
import { Task } from '~/app/types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onSubtasksGenerated: (taskId: string, subtasks: string[]) => void;
  onDeleteTask: (taskId: string) => void; // New prop
  onEditTask: (taskId: string, newText: string) => void; // New prop
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onSubtasksGenerated,
  onDeleteTask,
  onEditTask,
}) => {
  if (tasks.length === 0) {
    return <p className="text-gray-500">No tasks yet. Add one above!</p>;
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onSubtasksGenerated={onSubtasksGenerated}
          onDeleteTask={onDeleteTask} // Pass down
          onEditTask={onEditTask}     // Pass down
        />
      ))}
    </div>
  );
};

export default TaskList;
