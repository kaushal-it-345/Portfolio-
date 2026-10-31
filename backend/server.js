const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// In-Memory Data Store (Temporary Storage)
// ==========================================
let tasks = [
  { id: 1, title: 'Learn Express', description: 'Study Express.js fundamentals', completed: false },
  { id: 2, title: 'Build Task API', description: 'Create REST endpoints for tasks', completed: false },
  { id: 3, title: 'Add Error Handling', description: 'Implement global error handler', completed: false }
];

let nextId = 4;

// ==========================================
// Standard Middleware
// ==========================================

// Enable CORS for frontend integration
app.use(cors());

// Parse incoming JSON request bodies (req.body)
app.use(express.json());

// Step 3: Global Request Logging Middleware
// Logs method, URL, and timestamp for every incoming request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Supplementary Problem 1: Middleware that rejects POST/PUT requests missing Content-Type: application/json
const requireJsonContentType = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.toLowerCase().includes('application/json')) {
      return res.status(415).json({
        success: false,
        error: 'Unsupported Media Type: Content-Type header must be application/json'
      });
    }
  }
  next();
};

// Apply Content-Type validator globally for POST/PUT requests
app.use(requireJsonContentType);

// Supplementary Problem 2: Route-specific middleware that validates task ID format
const validateTaskId = (req, res, next) => {
  const { id } = req.params;
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      success: false,
      error: `Invalid task ID format: '${id}'. Task ID must be a positive integer.`
    });
  }

  req.taskId = parsedId;
  next();
};

// ==========================================
// Task Controller Functions
// ==========================================

// 1. GET /tasks → getAllTasks
const getAllTasks = (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /tasks/:id → getTaskById
const getTaskById = (req, res, next) => {
  try {
    const task = tasks.find(t => t.id === req.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.taskId} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// 3. POST /tasks → createTask
const createTask = (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: Title is required and must be a non-empty string'
      });
    }

    const newTask = {
      id: nextId++,
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
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
};

// 4. PUT /tasks/:id → updateTask
const updateTask = (req, res, next) => {
  try {
    const task = tasks.find(t => t.id === req.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.taskId} not found`
      });
    }

    const { title, description, completed } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Validation failed: Title must be a non-empty string'
        });
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = typeof description === 'string' ? description.trim() : description;
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'Validation failed: Completed must be a boolean (true/false)'
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
};

// 5. DELETE /tasks/:id → deleteTask
const deleteTask = (req, res, next) => {
  try {
    const taskIndex = tasks.findIndex(t => t.id === req.taskId);

    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.taskId} not found`
      });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: deletedTask
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Express Router Pipeline
// ==========================================
const taskRouter = express.Router();

taskRouter.get('/', getAllTasks);
taskRouter.get('/:id', validateTaskId, getTaskById);
taskRouter.post('/', createTask);
taskRouter.put('/:id', validateTaskId, updateTask);
taskRouter.delete('/:id', validateTaskId, deleteTask);

// Mount router on both '/tasks' (as in Practical 4 spec) and '/api/tasks'
app.use('/tasks', taskRouter);
app.use('/api/tasks', taskRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Deliberate error demonstration route for faculty testing
app.get('/error-test', (req, res, next) => {
  const testError = new Error('Demonstration error caught by global error handler');
  testError.status = 500;
  next(testError);
});

// Supplementary Problem 3: Custom 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.url}: Route not found`
  });
});

// Step 5: Global Error Handling Middleware (must be the LAST middleware in the chain)
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Something went wrong'
  });
});

// ==========================================
// Server Startup
// ==========================================
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Task Management API Server running on port ${PORT}`);
    console.log(`Available endpoints:`);
    console.log(`  - GET    http://localhost:${PORT}/tasks`);
    console.log(`  - GET    http://localhost:${PORT}/tasks/:id`);
    console.log(`  - POST   http://localhost:${PORT}/tasks`);
    console.log(`  - PUT    http://localhost:${PORT}/tasks/:id`);
    console.log(`  - DELETE http://localhost:${PORT}/tasks/:id`);
  });
}

module.exports = app;
