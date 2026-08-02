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
// Routes
// ===========================

// GET all tasks
app.get('/api/tasks', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    next(error);
  }
});

// GET task by ID
app.get('/api/tasks/:id', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${taskId} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// CREATE new task (POST)
app.post('/api/tasks', (req, res, next) => {
  try {
    const { title, description } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title is required and must be a non-empty string'
      });
    }

    const newTask = {
      id: nextId++,
      title: title.trim(),
      description: description || '',
      completed: false
    };

    tasks.push(newTask);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE task (PUT)
app.put('/api/tasks/:id', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${taskId} not found`
      });
    }

    const { title, description, completed } = req.body;

    // Update only provided fields
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Title must be a non-empty string'
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
          error: 'Completed must be a boolean'
        });
      }
      task.completed = completed;
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// DELETE task
app.delete('/api/tasks/:id', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${taskId} not found`
      });
    }

    const deletedTask = tasks.splice(taskIndex, 1);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: deletedTask[0]
    });
  } catch (error) {
    next(error);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// ===========================
// 404 Handler (before error handler)
// ===========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`
  });
});

// ===========================
// Global Error Handling Middleware
// ===========================
app.use((error, req, res, next) => {
  console.error('Error:', error);

  // Default error status and message
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
});

// ===========================
// Server Startup
// ===========================
app.listen(PORT, () => {
  console.log(`Task Management API Server running on http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`Tasks Endpoint: http://localhost:${PORT}/api/tasks`);
});
