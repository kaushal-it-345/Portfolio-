// Central API module for backend communication (Practical 6 & Practical 7)
export const BASE_URL = 'http://localhost:5000';

const TOKEN_KEY = 'awdf_jwt_token';
const USER_KEY = 'awdf_user_profile';

/**
 * Token and Auth State Helpers
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) || '';
};

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getUserProfile = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setUserProfile = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Clear client-side authentication state (Supplementary Problem 3: Logout mechanism)
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new CustomEvent('auth:change', { detail: { isAuthenticated: false } }));
};

/**
 * Common request wrapper with Bearer token injection and 401 interception
 * (Supplementary Problem 2: Token expiry & 401 handling on frontend)
 */
const authFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  // Handle 401 Unauthorized globally
  if (response.status === 401) {
    const errorData = await response.json().catch(() => ({}));
    clearAuth();
    window.dispatchEvent(
      new CustomEvent('auth:expired', {
        detail: {
          message: errorData.error || 'Your session has expired. Please log in again.'
        }
      })
    );
    throw new Error(errorData.error || 'Authentication required (401 Unauthorized)');
  }

  return response;
};

// ==========================================
// Authentication API Endpoints (Practical 7)
// ==========================================

/**
 * Register a new user (POST /register)
 */
export const registerUser = async ({ email, password, name }) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errMsg = data.details ? data.details.join('; ') : (data.error || 'Registration failed');
    throw new Error(errMsg);
  }
  return data;
};

/**
 * Log in an existing user (POST /login)
 */
export const loginUser = async ({ email, password }) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errMsg = data.details ? data.details.join('; ') : (data.error || 'Login failed');
    throw new Error(errMsg);
  }

  if (data.token) {
    setToken(data.token);
    setUserProfile(data.user);
    window.dispatchEvent(new CustomEvent('auth:change', { detail: { isAuthenticated: true, user: data.user } }));
  }

  return data;
};

/**
 * Fetch current user profile using JWT token (GET /me) [Supplementary Problem 1]
 */
export const getMe = async () => {
  const res = await authFetch('/me');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch user profile');
  }
  if (data.data) {
    setUserProfile(data.data);
  }
  return data.data;
};

// ==========================================
// Task Management API Endpoints (Protected by JWT)
// ==========================================

/**
 * Fetch all tasks from the backend
 */
export const getTasks = async () => {
  const res = await authFetch('/tasks');
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
  const res = await authFetch(`/tasks/${id}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch task (HTTP ${res.status})`);
  }
  return data;
};

/**
 * Create a new task (POST /tasks) - Protected & Validated
 */
export const createTask = async (taskData) => {
  const res = await authFetch('/tasks', {
    method: 'POST',
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
 * Update an existing task (PUT /tasks/:id) - Protected & Validated
 */
export const updateTask = async (id, updateData) => {
  const res = await authFetch(`/tasks/${id}`, {
    method: 'PUT',
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
 * Delete a task (DELETE /tasks/:id) - Protected
 */
export const deleteTask = async (id) => {
  const res = await authFetch(`/tasks/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete task');
  }
  return data;
};
