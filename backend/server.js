const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Task = require('./models/Task');
const User = require('./models/User');
const authMiddleware = require('./middleware/authMiddleware');
const {
  validateRegisterInput,
  validateLoginInput,
  validateTaskInput,
  validateTaskUpdateInput,
  validateObjectId
} = require('./middleware/validationMiddleware');
const cache = require('./cache');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task-manager';
const JWT_SECRET = process.env.JWT_SECRET || 'charusat_practical_7_jwt_secret_key_2026_itue301';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// ==========================================
// In-Memory Fallback Data Store (when MongoDB is offline)
// ==========================================
let inMemoryUsers = [];
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
    title: 'Full Stack Authentication Pipeline',
    description: 'Wire React frontend to Express JWT authentication with bcrypt password hashing',
    completed: false,
    priority: 'high',
    createdAt: new Date()
  }
];

// Seed a default demo user in in-memory store synchronously for instant offline testing
try {
  const demoPasswordHash = bcrypt.hashSync('password123', 10);
  inMemoryUsers.push({
    _id: '64c8f1a1b2c3d4e5f6a7b8u1',
    email: 'demo@charusat.edu.in',
    password: demoPasswordHash,
    name: 'Demo Student',
    createdAt: new Date('2026-10-31T08:00:00.000Z')
  });
} catch (e) {
  // Ignore seed error
}

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
    console.warn(`MongoDB not accessible (${err.message}). Seamlessly using verified in-memory fallback.`);
  });

// ==========================================
// Core Middleware Pipeline
// ==========================================
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Enforce Content-Type: application/json on POST/PUT requests (exempting cache clear endpoints)
const requireJsonContentType = (req, res, next) => {
  if ((req.method === 'POST' || req.method === 'PUT') && !req.path.includes('/cache/clear')) {
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

// ==========================================
// Practical 7: Authentication Controllers
// ==========================================

/**
 * POST /register (or /api/auth/register)
 * - Hashes password using bcrypt (salt rounds = 10)
 * - Saves User document to MongoDB (or in-memory store)
 * - Returns 201 Created on success
 */
const registerUser = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check if user already exists
    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'A user with this email already exists'
        });
      }

      // 2. Hash password with bcrypt before saving to MongoDB
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Create user document
      const user = await User.create({
        email: normalizedEmail,
        password: hashedPassword,
        name: name ? name.trim() : ''
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          id: user._id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt
        }
      });
    }

    // In-memory fallback
    const existing = inMemoryUsers.find(u => u.email === normalizedEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'A user with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      email: normalizedEmail,
      password: hashedPassword,
      name: name ? name.trim() : '',
      createdAt: new Date()
    };
    inMemoryUsers.push(newUser);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /login (or /api/auth/login)
 * - Verifies user existence & compares password using bcrypt.compare
 * - Signs JWT token with 1h expiry
 * - Returns token and user profile
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = inMemoryUsers.find(u => u.email === normalizedEmail);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Compare password using bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token with reasonable expiry (1 hour)
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || ''
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /me (or /api/auth/me) [Supplementary Problem 1]
 * Returns currently logged-in user's details using the decoded JWT
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      return res.status(200).json({
        success: true,
        data: user
      });
    }

    // In-memory fallback
    const user = inMemoryUsers.find(u => String(u._id) === String(userId));
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        name: user.name || '',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Task CRUD Controllers (Protected by Auth Middleware)
// ==========================================

// 1. GET /tasks → getAllTasks (Practical 9: In-Memory Caching via node-cache)
const getAllTasks = async (req, res, next) => {
  try {
    const bypassCache = req.query.no_cache === 'true' || req.headers['x-bypass-cache'] === 'true';

    // Step 3: Check cache first unless explicitly bypassed
    if (!bypassCache) {
      const cached = cache.get('all_tasks');
      if (cached) {
        cache.trackHit();
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(cached);
      }
    }

    cache.trackMiss();

    if (mongoose.connection.readyState === 1) {
      const tasks = await Task.find().sort({ createdAt: -1 });
      const responsePayload = {
        success: true,
        count: tasks.length,
        data: tasks
      };

      if (!bypassCache) {
        cache.set('all_tasks', responsePayload);
      }
      res.setHeader('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
      return res.status(200).json(responsePayload);
    }

    // In-memory fallback (simulates realistic database query latency as noted in lab manual)
    await new Promise(resolve => setTimeout(resolve, 25));
    const sorted = [...inMemoryTasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const responsePayload = {
      success: true,
      count: sorted.length,
      data: sorted
    };

    if (!bypassCache) {
      cache.set('all_tasks', responsePayload);
    }
    res.setHeader('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
    return res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

// 2. GET /tasks/:id → getTaskById (Practical 9 - Supplementary Problem 1: Single-Task Caching)
const getTaskById = async (req, res, next) => {
  try {
    const cacheKey = `task_${req.params.id}`;
    const bypassCache = req.query.no_cache === 'true' || req.headers['x-bypass-cache'] === 'true';

    if (!bypassCache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        cache.trackHit();
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(cached);
      }
    }

    cache.trackMiss();

    if (mongoose.connection.readyState === 1) {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: `Task with ID ${req.params.id} not found`
        });
      }
      const responsePayload = { success: true, data: task };
      if (!bypassCache) {
        cache.set(cacheKey, responsePayload);
      }
      res.setHeader('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
      return res.status(200).json(responsePayload);
    }

    // In-memory fallback (simulates realistic database query latency)
    await new Promise(resolve => setTimeout(resolve, 15));
    const task = inMemoryTasks.find(t => String(t._id) === String(req.params.id));
    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.params.id} not found`
      });
    }
    const responsePayload = { success: true, data: task };
    if (!bypassCache) {
      cache.set(cacheKey, responsePayload);
    }
    res.setHeader('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
    return res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

// 3. POST /tasks → createTask (Protected + Validated + Cache Invalidation)
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, completed } = req.body;

    let newTask;
    if (mongoose.connection.readyState === 1) {
      newTask = await Task.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        priority: priority || 'medium',
        completed: completed || false,
        userId: req.user?.id
      });
    } else {
      newTask = {
        _id: new mongoose.Types.ObjectId().toString(),
        title: title.trim(),
        description: description ? description.trim() : '',
        priority: priority || 'medium',
        completed: completed || false,
        userId: req.user?.id,
        createdAt: new Date()
      };
      inMemoryTasks.push(newTask);
    }

    // Step 4: Invalidate cache after successful write
    cache.del('all_tasks');

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    next(error);
  }
};

// 4. PUT /tasks/:id → updateTask (Protected + Validated + Cache Invalidation)
const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, completed } = req.body;
    const taskId = req.params.id;

    let updatedTask;
    if (mongoose.connection.readyState === 1) {
      const updateData = {};
      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (priority !== undefined) updateData.priority = priority;
      if (completed !== undefined) updateData.completed = Boolean(completed);

      updatedTask = await Task.findByIdAndUpdate(
        taskId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          error: `Task with ID ${taskId} not found`
        });
      }
    } else {
      const taskIndex = inMemoryTasks.findIndex(t => String(t._id) === String(taskId));
      if (taskIndex === -1) {
        return res.status(404).json({
          success: false,
          error: `Task with ID ${taskId} not found`
        });
      }

      if (title !== undefined) inMemoryTasks[taskIndex].title = title.trim();
      if (description !== undefined) inMemoryTasks[taskIndex].description = description.trim();
      if (priority !== undefined) inMemoryTasks[taskIndex].priority = priority;
      if (completed !== undefined) inMemoryTasks[taskIndex].completed = Boolean(completed);

      updatedTask = inMemoryTasks[taskIndex];
    }

    // Step 4 & Supplementary Problem 1: Invalidate collection and single-task caches
    cache.del('all_tasks');
    cache.del(`task_${taskId}`);

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE /tasks/:id → deleteTask (Protected + Cache Invalidation)
const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    let deletedTask;

    if (mongoose.connection.readyState === 1) {
      deletedTask = await Task.findByIdAndDelete(taskId);

      if (!deletedTask) {
        return res.status(404).json({
          success: false,
          error: `Task with ID ${taskId} not found`
        });
      }
    } else {
      const taskIndex = inMemoryTasks.findIndex(t => String(t._id) === String(taskId));
      if (taskIndex === -1) {
        return res.status(404).json({
          success: false,
          error: `Task with ID ${taskId} not found`
        });
      }

      deletedTask = inMemoryTasks.splice(taskIndex, 1)[0];
    }

    // Step 4 & Supplementary Problem 1: Invalidate collection and single-task caches
    cache.del('all_tasks');
    cache.del(`task_${taskId}`);

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: deletedTask
    });
  } catch (error) {
    next(error);
  }
};

// Practical 9 - Supplementary Problem 2: Cache metrics & debug controllers
const getCacheStats = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'In-memory cache metrics (node-cache)',
    data: cache.getMetrics()
  });
};

const clearCache = (req, res) => {
  cache.resetMetrics();
  res.status(200).json({
    success: true,
    message: 'Cache and metrics reset successfully',
    data: cache.getMetrics()
  });
};

// ==========================================
// Authentication Routes Pipeline
// ==========================================
const authRouter = express.Router();

authRouter.post('/register', validateRegisterInput, registerUser);
authRouter.post('/login', validateLoginInput, loginUser);
authRouter.get('/me', authMiddleware, getCurrentUser);

// Mount auth endpoints directly at root and under /api/auth
app.post('/register', validateRegisterInput, registerUser);
app.post('/login', validateLoginInput, loginUser);
app.get('/me', authMiddleware, getCurrentUser);

app.use('/auth', authRouter);
app.use('/api/auth', authRouter);

// ==========================================
// Task Management Router Pipeline
// Protected Route Flow:
// Client Request (Authorization: Bearer <token>)
//   -> [Auth Middleware] verifies token -> req.user set
//   -> [Validation Middleware] checks input
//   -> Controller (task routes)
// ==========================================
const taskRouter = express.Router();

// Step 6: Apply auth middleware to all task routes
taskRouter.use(authMiddleware);

// Practical 9 - Supplementary Problem 2: Cache metrics & reset endpoints
taskRouter.get('/cache/stats', getCacheStats);
taskRouter.post('/cache/clear', clearCache);

taskRouter.get('/', getAllTasks);
taskRouter.get('/:id', validateObjectId, getTaskById);
taskRouter.post('/', validateTaskInput, createTask);
taskRouter.put('/:id', validateObjectId, validateTaskUpdateInput, updateTask);
taskRouter.delete('/:id', validateObjectId, deleteTask);

// Mount task router on /tasks and /api/tasks
app.use('/tasks', taskRouter);
app.use('/api/tasks', taskRouter);

// Public debug endpoints for Postman, Thunder Client, and lab verification
app.get('/cache/stats', getCacheStats);
app.get('/api/cache/stats', getCacheStats);
app.post('/cache/clear', clearCache);
app.post('/api/cache/clear', clearCache);

// Health check endpoint (Public)
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
    console.log(`  - POST   http://localhost:${PORT}/register`);
    console.log(`  - POST   http://localhost:${PORT}/login`);
    console.log(`  - GET    http://localhost:${PORT}/me (Protected: Bearer <token>)`);
    console.log(`  - GET    http://localhost:${PORT}/tasks (Protected)`);
    console.log(`  - GET    http://localhost:${PORT}/tasks/:id (Protected)`);
    console.log(`  - POST   http://localhost:${PORT}/tasks (Protected + Validated)`);
    console.log(`  - PUT    http://localhost:${PORT}/tasks/:id (Protected + Validated)`);
    console.log(`  - DELETE http://localhost:${PORT}/tasks/:id (Protected)`);
  });
}

module.exports = app;
