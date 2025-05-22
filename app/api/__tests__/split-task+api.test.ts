import { describe, it, expect, vi, beforeEach } from 'vitest';
import app from '../split-task+api'; // Assuming default export of Hono app
import { Hono } from 'hono';

// Mock the Vercel AI SDK
const mockGenerateObject = vi.fn();
vi.mock('ai', () => ({
  experimental_generateObject: (options: any) => mockGenerateObject(options),
}));

// Mock the AI provider (e.g., OpenAI) if it's instantiated within the API file
// For this test, we are focusing on the mockCoreProvider used in split-task+api.ts
// so we don't need to mock createOpenAI directly here if it's not used when OPENAI_API_KEY is absent.
// The mockCoreProvider is already part of the 'app/api/split-task+api.ts' module.


describe('API Route: /api/split-task', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if request body is invalid (empty)', async () => {
    const req = new Request('http://localhost/api/split-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // Missing taskDescription
    });

    const res = await app.request(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid request body');
    expect(json.details.fieldErrors.taskDescription).toContain('Task description cannot be empty');
  });

  it('should return 400 if taskDescription is empty string', async () => {
    const req = new Request('http://localhost/api/split-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskDescription: '' }),
    });

    const res = await app.request(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.details.fieldErrors.taskDescription).toContain('Task description cannot be empty');

  });

  it('should call AI generation and return subtasks on valid request', async () => {
    const mockSubtasks = { subtasks: ['Subtask 1', 'Subtask 2'] };
    mockGenerateObject.mockResolvedValue({ object: mockSubtasks });

    const req = new Request('http://localhost/api/split-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskDescription: 'Test splitting this task' }),
    });

    const res = await app.request(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(mockSubtasks);

    expect(mockGenerateObject).toHaveBeenCalledTimes(1);
    expect(mockGenerateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        // model: expect.any(Object), // This would be the mocked provider
        schema: expect.any(Object), // Zod schema for subtasks
        prompt: 'Split the task "Test splitting this task" into a list of smaller, actionable subtasks. Focus on breaking it down into manageable steps.',
      })
    );
  });

  it('should return 500 if AI generation fails (returns unexpected structure)', async () => {
    mockGenerateObject.mockResolvedValue({ object: null }); // Simulate AI failure

    const req = new Request('http://localhost/api/split-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskDescription: 'Another task' }),
    });

    const res = await app.request(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Failed to split task using AI');
  });
  
  it('should return 500 if AI generation throws an error', async () => {
    mockGenerateObject.mockRejectedValue(new Error('AI Provider Error'));

    const req = new Request('http://localhost/api/split-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskDescription: 'Error task' }),
    });

    const res = await app.request(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Internal server error');
    expect(json.message).toBe('AI Provider Error');
  });

  it('should handle non-JSON request body gracefully (Hono default behavior)', async () => {
    const req = new Request('http://localhost/api/split-task', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'This is not JSON',
    });

    // Hono's default behavior for c.req.json() on invalid JSON is to throw,
    // which should be caught by the catch block and return a 500 or a specific Hono error.
    // In this case, our catch block returns a generic 500.
    const res = await app.request(req);
    expect(res.status).toBe(500); // Or 400 depending on Hono's specific error for parsing
    const json = await res.json();
    // The error message might vary based on Hono's parsing failure
    expect(json.error).toBe('Internal server error'); 
  });

});
