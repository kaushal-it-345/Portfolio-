const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task-manager';

// ==========================================
// MongoDB Connection via Mongoose (Step 2)
// ==========================================
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.log('Tip: Check MONGO_URI in .env or start local MongoDB service');
  });

// ==========================================
// Standard Middleware Pipeline
// ==========================================
app.use(cors());
app.use(express.json());

// Step 3 (from P4): Global Request Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Supplementary Problem 1: Rejects POST/PUT requests missing Content-Type: application/json
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
// Task CRUD Controllers with Mongoose (Step 4)
// ==========================================

// 1. GET /tasks → Task.find()
const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /tasks/:id → Task.findById()
// Supplementary Problem 3: Returns 404 JSON response if ID does not exist
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.params.id} not found`
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

// 3. POST /tasks → Task.create()
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, completed } = req.body;

    const newTask = await Task.create({
      title,
      description,
      priority,
      completed
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    next(error);
  }
};

// 4. PUT /tasks/:id → Task.findByIdAndUpdate()
const updateTask = async (req, res, next) => {
  try {
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

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE /tasks/:id → Task.findByIdAndDelete()
const deleteTask = async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.params.id} not found`
      });
    }

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
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
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
// Global Error Handling Middleware (Step 5)
// Returns structured JSON, NOT raw Mongoose error objects
// ==========================================
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validationErrors
    });
  }

  // Mongoose CastError (invalid ObjectId format)
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
