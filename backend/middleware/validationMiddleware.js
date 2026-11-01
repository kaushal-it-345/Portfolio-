const mongoose = require('mongoose');

/**
 * Practical 7: Validation Middleware Pipeline
 * 
 * Rejects malformed requests before they reach controllers or the database.
 */

// Email regex pattern for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Middleware: Validate user registration payload
 */
const validateRegisterInput = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please provide a valid email address');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Registration validation failed',
      details: errors
    });
  }

  next();
};

/**
 * Middleware: Validate user login payload
 */
const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Login validation failed',
      details: errors
    });
  }

  next();
};

/**
 * Middleware: Validate task creation payload (POST /tasks)
 * Rejects malformed requests (e.g. missing title) before reaching DB
 */
const validateTaskInput = (req, res, next) => {
  const { title, priority } = req.body || {};
  const errors = [];

  // Title validation: required, must be non-empty string
  if (title === undefined || title === null) {
    errors.push('Task title is required');
  } else if (typeof title !== 'string' || title.trim() === '') {
    errors.push('Task title cannot be empty or whitespace only');
  }

  // Priority validation: optional, but must be valid enum
  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    errors.push(`'${priority}' is not a valid priority. Allowed values: low, medium, high`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Task input validation failed',
      details: errors
    });
  }

  next();
};

/**
 * Middleware: Validate task update payload (PUT /tasks/:id)
 */
const validateTaskUpdateInput = (req, res, next) => {
  const { title, priority } = req.body || {};
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      errors.push('Task title cannot be empty or whitespace only');
    }
  }

  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    errors.push(`'${priority}' is not a valid priority. Allowed values: low, medium, high`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Task update validation failed',
      details: errors
    });
  }

  next();
};

/**
 * Middleware: Validate MongoDB ObjectId format
 */
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

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateTaskInput,
  validateTaskUpdateInput,
  validateObjectId
};
