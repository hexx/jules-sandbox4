# Task Management Web Application

## Overview/Description

This is a modern task management web application built with Deno, Hono, React (via TanStack Router and shadcn/ui), and Vite. It allows users to manage their tasks efficiently with a clean and responsive user interface.

Key features include:
*   Adding new tasks
*   Editing existing tasks
*   Deleting tasks
*   Marking tasks as complete/incomplete
*   AI-powered task splitting to break down complex tasks into smaller, manageable subtasks (currently using a mock AI provider).

## Technologies Used

*   **Deno (2.x):** A modern runtime for JavaScript and TypeScript.
*   **Hono:** A small, simple, and ultrafast web framework for the Edges. Used for the backend API.
*   **React:** A JavaScript library for building user interfaces (used via TanStack Router and shadcn/ui).
*   **TanStack Router:** A fully typesafe router with first-class search-param APIs and built-in caching, built for React.
*   **Vite:** A next-generation frontend tooling that provides an extremely fast development environment and bundles for production.
    *   Used with Deno via `deno.jsonc` and npm specifiers.
*   **shadcn/ui:** Beautifully designed components that you can copy and paste into your apps.
*   **Vercel AI SDK:** An open-source library for building AI-powered user interfaces.
    *   *Currently configured to use a mock AI provider for the task splitting feature.*
*   **Vitest:** A blazing fast unit test framework powered by Vite.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
*   **Lucide React:** A simple and beautiful icon library.

## Project Structure

The project follows a standard structure for modern web applications:

*   `app/`: Contains the core application code.
    *   `app/api/`: Server-side API endpoints built with Hono.
    *   `app/components/`: Reusable React components (shadcn/ui based and custom).
    *   `app/routes/`: Application routes defined using TanStack Router.
    *   `app/types.ts`: TypeScript type definitions.
    *   `app/globals.css`: Global stylesheets and Tailwind CSS base directives.
*   `public/`: Static assets like `index.html`, images, etc.
*   `deno.jsonc`: Deno configuration file, including import maps and tasks.
*   `vite.config.ts`: Vite configuration.
*   `tailwind.config.ts`: Tailwind CSS configuration.
*   `postcss.config.js`: PostCSS configuration.
*   `components.json`: shadcn/ui configuration.
*   `vitest.setup.ts`: Vitest setup file.

## Prerequisites

*   **Deno:** Version 2.x or the latest stable version. Download and install from [deno.land](https://deno.land/).

## Setup and Installation

1.  **Clone the repository (if applicable):**
    ```bash
    # git clone <repository-url>
    # cd <repository-directory>
    ```
    (In the current context, the code is already present.)

2.  **Install Dependencies:**
    Deno manages dependencies through the `deno.jsonc` file. When you run Deno tasks, it will automatically fetch and cache the specified npm packages. There's no separate `npm install` step required for Deno-managed packages.

## Running the Application (Development)

1.  **Start the development server:**
    ```bash
    deno task dev
    ```
    This command utilizes Deno to run the development script (likely `dev.ts`), which in turn starts the Vite development server.

2.  **Access the application:**
    Open your web browser and navigate to `http://localhost:5173` (or the port specified in the console output, Vite's default is often 5173).

## Building the Application (Production)

*(Note: A specific `build` task is not explicitly defined in the current `deno.jsonc` but would typically involve Vite's build process.)*

To build the application for production, you would typically run a command like:
```bash
# Example: if a 'build' task is added to deno.jsonc that runs 'vite build'
# deno task build
```
This command would use Vite to bundle the application, optimize assets, and prepare it for deployment. The output is usually located in a `dist/` directory.

## Running Tests

1.  **Execute the test suite:**
    ```bash
    deno task test
    ```
    This command uses Vitest to run all unit and integration tests located in the `__tests__` directories.

2.  **Important Note on Test Execution:**
    Currently, there are known issues with running tests in this Deno + Vite/Vitest environment. While comprehensive test files have been written for components, API endpoints, and integration scenarios, their execution via `deno task test` has encountered persistent module resolution problems (e.g., for `jsdom` or other npm dependencies specified in `vite.config.ts`). These issues seem to stem from the interaction between Deno's Node.js compatibility layer, `npx` (if used as a workaround for `deno` command availability), and Vite's internal module resolution and execution process. The test code itself is structured correctly for Vitest.

## Key Features Implemented

*   **Add Task:**
    *   Use the input field at the top of the page and click "Add Task" or press Enter.
*   **View Tasks:**
    *   Tasks are listed below the input form. Each task shows its text and completion status.
*   **Complete Task:**
    *   Click the checkbox next to a task to toggle its completion status. Completed tasks are visually distinguished (e.g., line-through).
*   **Edit Task:**
    *   Click the "Edit" icon (pencil) next to a task. The text will become an input field.
    *   Modify the text and click "Save" (disk icon) or press Enter. Click "Cancel" (X icon) or press Escape to revert.
    *   Editing is disabled for completed tasks.
*   **Delete Task:**
    *   Click the "Delete" icon (trash can) next to a task to remove it from the list.
*   **Split Task (AI Powered):**
    *   Click the "Split Task" button available on each non-completed task.
    *   This feature is designed to break down the task into smaller, actionable subtasks using AI.
    *   **Currently, it uses a mock AI provider** that generates placeholder subtasks based on the task's description.
    *   The suggested subtasks will appear below the button, and you can click "Add these as new tasks" to add them to your main task list.

## Future Improvements/Known Issues

*   **Integrate Real AI for Task Splitting:**
    *   The Vercel AI SDK is currently configured with a mock provider. This could be replaced with a real AI service (e.g., OpenAI, Anthropic) by providing an API key and configuring the SDK accordingly in `app/api/split-task+api.ts`.
*   **Resolve Test Execution Issues:**
    *   Investigate and fix the module resolution problems encountered when running Vitest tests within the Deno environment to ensure the test suite can be reliably executed.
*   **Production Build Configuration:**
    *   Formalize and test a `deno task build` script for creating optimized production builds.
*   **Persistence:**
    *   Currently, tasks are stored in client-side state and are lost on page refresh. Implement a backend solution (e.g., using Deno KV, a database) to persist tasks.

This README provides a comprehensive guide to understanding, setting up, and using the Task Management Web Application.
