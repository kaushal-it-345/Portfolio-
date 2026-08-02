const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ===========================
// In-Memory Data Store
// ===========================
let tasks = [
  { id: 1, title: 'Learn Express', description: 'Study Express.js fundamentals', completed: false },
  { id: 2, title: 'Build Task API', description: 'Create REST endpoints for tasks', completed: false },
  { id: 3, title: 'Add Error Handling', description: 'Implement global error handler', completed: false }
];

let nextId = 4;

// ===========================
// HATEOAS Link Helper Functions
// ===========================

/**
 * Add HATEOAS links to a single task
 * @param {Object} task - Task object
 * @returns {Object} Task with _links property
 */
function addTaskLinks(task) {
  return {
    ...task,
    _links: {
      self: {
        href: `/api/tasks/${task.id}`,
        method: 'GET',
        title: 'Get this task'
      },
      update: {
        href: `/api/tasks/${task.id}`,
        method: 'PUT',
        title: 'Update this task'
      },
      delete: {
        href: `/api/tasks/${task.id}`,
        method: 'DELETE',
        title: 'Delete this task'
      },
      mark_complete: {
        href: `/api/tasks/${task.id}`,
        method: 'PUT',
        title: 'Mark as complete',
        body: { completed: true }
      },
      mark_incomplete: {
        href: `/api/tasks/${task.id}`,
        method: 'PUT',
        title: 'Mark as incomplete',
        body: { completed: false }
      },
      collection: {
        href: '/api/tasks',
        method: 'GET',
        title: 'Get all tasks'
      }
    }
  };
}

/**
 * Add collection links to task list response
 * @param {Array} taskList - Array of tasks with links
 * @returns {Object} Response with collection links
 */
function addCollectionLinks(taskList) {
  return {
    success: true,
    data: taskList,
    count: taskList.length,
    _links: {
      self: {
        href: '/api/tasks',
        method: 'GET',
        title: 'Get all tasks'
      },
      create: {
        href: '/api/tasks',
        method: 'POST',
        title: 'Create a new task',
        schema: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', description: 'Task title' },
            description: { type: 'string', description: 'Task description (optional)' }
          }
        }
      },
      'api-root': {
        href: '/',
        method: 'GET',
        title: 'API root and documentation'
      }
    }
  };
}

// ===========================
// Middleware
// ===========================

// CORS Middleware
app.use(cors());

// Body Parser Middleware (built-in to Express 4.16+)
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ===========================
// API Root Endpoint (API Discovery)
// ===========================

/**
 * GET / - API root with available resources and HATEOAS links
 * This is the entry point for API discovery
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Management API - Richardson Maturity Model Level 3 (HATEOAS)',
    version: '2.0.0',
    maturityLevel: 3,
    description: 'Fully RESTful API with hypermedia-driven resources',
    _links: {
      tasks: {
        href: '/api/tasks',
        method: 'GET',
        title: 'Get all tasks'
      },
      'create-task': {
        href: '/api/tasks',
        method: 'POST',
        title: 'Create a new task'
      },
      health: {
        href: '/health',
        method: 'GET',
        title: 'Health check'
      },
      documentation: {
        href: '/docs',
        method: 'GET',
        title: 'API Documentation'
      }
    }
  });
});

/**
 * GET /docs - API Documentation
 */
app.get('/docs', (req, res) => {
  res.status(200).json({
    success: true,
    title: 'Task Management API Documentation',
    maturityLevel: 'Level 3 (HATEOAS)',
    baseUrl: 'http://localhost:5000',
    endpoints: {
      'GET /api/tasks': {
        description: 'Retrieve all tasks',
        statusCode: 200,
        response: { success: true, data: 'array', count: 'number', _links: 'object' }
      },
      'GET /api/tasks/:id': {
        description: 'Retrieve a specific task',
        statusCode: 200,
        response: { success: true, data: 'object with _links', count: 'number' }
      },
      'POST /api/tasks': {
        description: 'Create a new task',
        statusCode: 201,
        body: { title: 'string (required)', description: 'string (optional)' },
        response: { success: true, message: 'string', data: 'object with _links' }
      },
      'PUT /api/tasks/:id': {
        description: 'Update a task',
        statusCode: 200,
        body: { title: 'string (optional)', description: 'string (optional)', completed: 'boolean (optional)' },
        response: { success: true, message: 'string', data: 'object with _links' }
      },
      'DELETE /api/tasks/:id': {
        description: 'Delete a task',
        statusCode: 200,
        response: { success: true, message: 'string', data: 'object' }
      }
    },
    _links: {
      'api-root': { href: '/', method: 'GET', title: 'Back to API root' },
      tasks: { href: '/api/tasks', method: 'GET', title: 'View all tasks' }
    }
  });
});

// ===========================
// Routes
// ===========================

/**
 * GET /api/tasks - Retrieve all tasks with HATEOAS links
 */
app.get('/api/tasks', (req, res) => {
  try {
    // Add HATEOAS links to each task
    const tasksWithLinks = tasks.map(task => addTaskLinks(task));
    // Wrap in collection response with collection-level links
    const response = addCollectionLinks(tasksWithLinks);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/**
 * GET /api/tasks/:id - Retrieve a single task with HATEOAS links
 */
app.get('/api/tasks/:id', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${taskId} not found`,
        _links: {
          'all-tasks': { href: '/api/tasks', method: 'GET', title: 'View all tasks' },
          'create-task': { href: '/api/tasks', method: 'POST', title: 'Create a new task' }
        }
      });
    }

    // Add HATEOAS links to task
    const taskWithLinks = addTaskLinks(task);

    res.status(200).json({
      success: true,
      data: taskWithLinks
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tasks - Create a new task
 */
app.post('/api/tasks', (req, res, next) => {
  try {
    const { title, description } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title is required and must be a non-empty string',
        _links: {
          'all-tasks': { href: '/api/tasks', method: 'GET', title: 'View all tasks' },
          'api-root': { href: '/', method: 'GET', title: 'Back to API root' }
        }
      });
    }

    const newTask = {
      id: nextId++,
      title: title.trim(),
      description: description || '',
      completed: false
    };

    tasks.push(newTask);

    // Add HATEOAS links to newly created task
    const taskWithLinks = addTaskLinks(newTask);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: taskWithLinks,
      _links: {
        'all-tasks': { href: '/api/tasks', method: 'GET', title: 'View all tasks' },
        'api-root': { href: '/', method: 'GET', title: 'Back to API root' }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/tasks/:id - Update a task
 */
app.put('/api/tasks/:id', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${taskId} not found`,
        _links: {
          'all-tasks': { href: '/api/tasks', method: 'GET', title: 'View all tasks' },
          'create-task': { href: '/api/tasks', method: 'POST', title: 'Create a new task' }
        }
      });
    }

    const { title, description, completed } = req.body;

    // Update only provided fields
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Title must be a non-empty string',
          _links: {
            'task': { href: `/api/tasks/${taskId}`, method: 'GET', title: 'View this task' }
          }
        });
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description;
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'Completed must be a boolean',
          _links: {
            'task': { href: `/api/tasks/${taskId}`, method: 'GET', title: 'View this task' }
          }
        });
      }
      task.completed = completed;
    }

    // Add HATEOAS links to updated task
    const taskWithLinks = addTaskLinks(task);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: taskWithLinks,
      _links: {
        'all-tasks': { href: '/api/tasks', method: 'GET', title: 'View all tasks' },
        'api-root': { href: '/', method: 'GET', title: 'Back to API root' }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/tasks/:id - Delete a task
 */
app.delete('/api/tasks/:id', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${taskId} not found`,
        _links: {
          'all-tasks': { href: '/api/tasks', method: 'GET', title: 'View all tasks' },
          'create-task': { href: '/api/tasks', method: 'POST', title: 'Create a new task' }
        }
      });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: deletedTask,
      _links: {
        'all-tasks': { href: '/api/tasks', method: 'GET', title: 'View all tasks' },
        'create-task': { href: '/api/tasks', method: 'POST', title: 'Create a new task' },
        'api-root': { href: '/', method: 'GET', title: 'Back to API root' }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /health - Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    _links: {
      'api-root': { href: '/', method: 'GET', title: 'Back to API root' }
    }
  });
});

// ===========================
// 404 Handler (before error handler)
// ===========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    _links: {
      'api-root': { href: '/', method: 'GET', title: 'API root and documentation' },
      'documentation': { href: '/docs', method: 'GET', title: 'API Documentation' },
      'all-tasks': { href: '/api/tasks', method: 'GET', title: 'View all tasks' }
    }
  });
});

// ===========================
// Global Error Handling Middleware
// ===========================
app.use((error, req, res, next) => {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    _links: {
      'api-root': { href: '/', method: 'GET', title: 'API root' },
      'documentation': { href: '/docs', method: 'GET', title: 'API Documentation' }
    }
  });
});

// ===========================
// Server Startup
// ===========================
app.listen(PORT, () => {
  console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
  console.log(`║  Task Management API - Richardson Maturity Model Level 3  ║`);
  console.log(`║              (HATEOAS-Driven REST API)                    ║`);
  console.log(`╚═══════════════════════════════════════════════════════════╝\n`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📋 Tasks Endpoint: http://localhost:${PORT}/api/tasks`);
  console.log(`📚 Full Docs: http://localhost:${PORT}/docs\n`);
});
