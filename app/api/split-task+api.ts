import { Hono } from 'hono';
import { z } from 'zod';
import { experimental_generateObject } from 'ai'; // Vercel AI SDK
import { createOpenAI } from '@ai-sdk/openai'; // Assuming OpenAI, can be swapped

const app = new Hono();

// Zod schema for the expected request body
const splitTaskSchema = z.object({
  taskDescription: z.string().min(1, { message: "Task description cannot be empty" }),
});

// Zod schema for the expected AI output
const subtasksSchema = z.object({
  subtasks: z.array(z.string()).describe("A list of actionable subtasks."),
});

// Mock AI provider (replace with actual provider if API key is available)
const mockCoreProvider = {
  generateObject: async ({ prompt, schema }: { prompt: any, schema: any }) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Extract task description from the prompt (this is a simplified assumption)
    // A more robust way would be to parse the prompt messages array.
    let taskDescription = "the task";
    if (Array.isArray(prompt) && prompt.length > 0 && prompt[0].role === 'user' && typeof prompt[0].content === 'string') {
        const match = prompt[0].content.match(/split the task "([^"]+)"/);
        if (match && match[1]) {
            taskDescription = match[1];
        }
    }


    return {
      object: {
        subtasks: [
          `Mock Subtask 1 for: ${taskDescription}`,
          `Mock Subtask 2 for: ${taskDescription}`,
          `Mock Subtask 3 for: ${taskDescription}`,
        ],
      },
      // other properties that experimental_generateObject might return
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      finishReason: 'stop',
    };
  }
};


// Instantiate the AI client (using mock for now)
// const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY }); // Real OpenAI
const aiProvider = mockCoreProvider; // Using the mock provider

app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validationResult = splitTaskSchema.safeParse(body);

    if (!validationResult.success) {
      return c.json({ error: 'Invalid request body', details: validationResult.error.flatten() }, 400);
    }

    const { taskDescription } = validationResult.data;

    const { object: generatedSubtasks, ...rest } = await experimental_generateObject({
      // model: openai.chat('gpt-3.5-turbo'), // Real OpenAI model
      model: aiProvider as any, // Using the mock provider, cast to any to satisfy type
      schema: subtasksSchema,
      prompt: `Split the task "${taskDescription}" into a list of smaller, actionable subtasks. Focus on breaking it down into manageable steps.`,
    });

    if (generatedSubtasks && generatedSubtasks.subtasks) {
      return c.json({ subtasks: generatedSubtasks.subtasks });
    } else {
      console.error("AI generation failed or returned unexpected structure:", rest);
      return c.json({ error: 'Failed to split task using AI' }, 500);
    }

  } catch (error: any) {
    console.error('Error in /api/split-task:', error);
    // Check if error is from Zod or other known types for more specific messages
    if (error.issues) { // Zod validation error
        return c.json({ error: 'Request validation failed', details: error.flatten() }, 400);
    }
    return c.json({ error: 'Internal server error', message: error.message }, 500);
  }
});

export default app;
