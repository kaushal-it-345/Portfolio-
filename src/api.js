// Central API module for backend communication (Practical 6: Step 2)
export const BASE_URL = 'http://localhost:5000';

/**
 * Fetch all tasks from the backend
 */
export const getTasks = async () => {
  const res = await fetch(`${BASE_URL}/tasks`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch tasks (HTTP ${res.status})`);
  }
  return data;
};

/**
 * Fetch a single task by ID
 */
export const getTaskById = async (id) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch task (HTTP ${res.status})`);
  }
  return data;
};

/**
 * Create a new task (POST /tasks)
 */
export const createTask = async (taskData) => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.details ? data.details.join('; ') : (data.error || 'Failed to create task');
    throw new Error(errorMsg);
  }
  return data;
};

/**
 * Update an existing task (PUT /tasks/:id)
 */
export const updateTask = async (id, updateData) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.details ? data.details.join('; ') : (data.error || 'Failed to update task');
    throw new Error(errorMsg);
  }
  return data;
};

/**
 * Delete a task (DELETE /tasks/:id)
 */
export const deleteTask = async (id) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete task');
  }
  return data;
};
