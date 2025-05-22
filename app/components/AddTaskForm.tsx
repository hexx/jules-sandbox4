import React, { useState } from 'react';
import { Button } from '~/components/ui/button'; // Assuming shadcn/ui button path
import { Input } from '~/components/ui/input';   // Assuming shadcn/ui input path

interface AddTaskFormProps {
  onAddTask: (text: string) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [taskText, setTaskText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    onAddTask(taskText);
    setTaskText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <Input
        type="text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        placeholder="Add a new task"
        className="flex-grow"
      />
      <Button type="submit">Add Task</Button>
    </form>
  );
};

export default AddTaskForm;
