export interface Task {
  id: string;
  text: string;
  completed: boolean;
  subtasks?: string[]; // Optional array of subtask descriptions
}
