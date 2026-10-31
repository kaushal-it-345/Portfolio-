const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task-manager';

// Fallback in-memory data store when MongoDB is offline
let inMemoryTasks = [
  {
    _id: '64c8f1a1b2c3d4e5f6a7b8c1',
    title: 'Learn Express & Node.js',
    description: 'Build robust REST APIs with middleware pipelines and status codes',
    completed: true,
    priority: 'high',
    createdAt: new Date('2026-10-31T09:00:00.000Z')
  },
  {
    _id: '64c8f1a1b2c3d4e5f6a7b8c2',
    title: 'MongoDB Schema Design',
    description: 'Enforce schema validation, priority enums, and pre-save hooks with Mongoose',
    completed: true,
    priority: 'medium',
    createdAt: new Date('2026-10-31T10:30:00.000Z')
  },
  {
    _id: '64c8f1a1b2c3d4e5f6a7b8c3',
    title: 'Full Stack Integration',
    description: 'Wire React frontend to Express & MongoDB backend with optimistic updates and Toast UI',
    completed: false,
    priority: 'high',
    createdAt: new Date()
  }
];

// ==========================================
// MongoDB Connection via Mongoose
// ==========================================
let isDbConnected = false;

mongoose.connect(MONGO_URI)
  .then(() => {
    isDbConnected = true;
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    isDbConnected = false;
    console.warn(`MongoDB not accessible: ${err.message}. Seamlessly using verified in-memory fallback.`);
  });

// ==========================================
// Middleware Pipeline
// ==========================================
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Enforce Content-Type: application/json on POST/PUT
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
app.use(requireJsonContentType);

// Route-Specific Middleware: Validate MongoDB ObjectId format
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: `Invalid task ID format: '${id}'. Must be a valid 24-character hexadecimal ObjectId.`
    });
  }
  next();
};

// ==========================================
// Task CRUD Controllers (Practical 6: React Integration)
// ==========================================

// 1. GET /tasks → getAllTasks
const getAllTasks = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const tasks = await Task.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    }

    // In-memory fallback
    const sorted = [...inMemoryTasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({
      success: true,
      count: sorted.length,
      data: sorted
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /tasks/:id → getTaskById
const getTaskById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: `Task with ID ${req.params.id} not found`
        });
      }
      return res.status(200).json({ success: true, data: task });
    }

    const task = inMemoryTasks.find(t => String(t._id) === String(req.params.id));
    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.params.id} not found`
      });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// 3. POST /tasks → createTask
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, completed } = req.body;

    // Run Mongoose schema validation
    const tempDoc = new Task({ title, description, priority, completed });
    await tempDoc.validate();

    if (mongoose.connection.readyState === 1) {
      const newTask = await Task.create({
        title: tempDoc.title,
        description: tempDoc.description,
        priority: tempDoc.priority,
        completed: tempDoc.completed
      });
      return res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: newTask
      });
    }

    const newTask = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: tempDoc.title.trim(),
      description: tempDoc.description || '',
      priority: tempDoc.priority || 'medium',
      completed: tempDoc.completed || false,
      createdAt: new Date()
    };
    inMemoryTasks.push(newTask);

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
const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, completed } = req.body;

    if (mongoose.connection.readyState === 1) {
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          error: `Task with ID ${req.params.id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: updatedTask
      });
    }

    const taskIndex = inMemoryTasks.findIndex(t => String(t._id) === String(req.params.id));
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.params.id} not found`
      });
    }

    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: [`'${priority}' is not a valid priority. Must be low, medium, or high.`]
      });
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: ['Task title is required and cannot be empty']
        });
      }
      inMemoryTasks[taskIndex].title = title.trim();
    }
    if (description !== undefined) inMemoryTasks[taskIndex].description = description;
    if (priority !== undefined) inMemoryTasks[taskIndex].priority = priority;
    if (completed !== undefined) inMemoryTasks[taskIndex].completed = Boolean(completed);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: inMemoryTasks[taskIndex]
    });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE /tasks/:id → deleteTask
const deleteTask = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const deletedTask = await Task.findByIdAndDelete(req.params.id);

      if (!deletedTask) {
        return res.status(404).json({
          success: false,
          error: `Task with ID ${req.params.id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: deletedTask
      });
    }

    const taskIndex = inMemoryTasks.findIndex(t => String(t._id) === String(req.params.id));
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.params.id} not found`
      });
    }

    const deleted = inMemoryTasks.splice(taskIndex, 1)[0];
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: deleted
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
taskRouter.get('/:id', validateObjectId, getTaskById);
taskRouter.post('/', createTask);
taskRouter.put('/:id', validateObjectId, updateTask);
taskRouter.delete('/:id', validateObjectId, deleteTask);

app.use('/tasks', taskRouter);
app.use('/api/tasks', taskRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'in-memory fallback',
    timestamp: new Date().toISOString()
  });
});

// Custom 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.url}: Route not found`
  });
});

// ==========================================
// Global Error Handling Middleware
// ==========================================
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);

  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validationErrors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Invalid ID format: '${err.value}'`
    });
  }

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
