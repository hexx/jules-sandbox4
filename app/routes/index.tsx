import React, { useState } from 'react';
import AddTaskForm from '~/app/components/AddTaskForm';
import TaskList from '~/app/components/TaskList';
import { Task } from '~/app/types';
// Button component is not directly used here anymore, but can remain if needed elsewhere.
// import { Button } from '~/components/ui/button';

function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleAddTask = (text: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleSubtasksGenerated = (taskId: string, subtaskTexts: string[]) => {
    const newSubtasks: Task[] = subtaskTexts.map(text => ({
      id: crypto.randomUUID(),
      text: `Sub: ${text}`,
      completed: false,
    }));
    setTasks(prevTasks => [...prevTasks, ...newSubtasks]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const handleEditTask = (taskId: string, newText: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, text: newText } : task
      )
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">My Tasks</h2>
      <AddTaskForm onAddTask={handleAddTask} />
      <TaskList
        tasks={tasks}
        onToggleComplete={handleToggleComplete}
        onSubtasksGenerated={handleSubtasksGenerated}
        onDeleteTask={handleDeleteTask} // Pass delete handler
        onEditTask={handleEditTask}     // Pass edit handler
      />
      {tasks.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          <p>Total tasks: {tasks.length}</p>
          <p>Completed tasks: {tasks.filter(task => task.completed).length}</p>
        </div>
      )}
    </div>
  );
}

export const Route = () => <HomePage />;
