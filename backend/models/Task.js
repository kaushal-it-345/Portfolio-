const mongoose = require('mongoose');

// Practical 5: Task Schema definition with Mongoose
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  // Supplementary Problem: Priority field restricted to enum ['low', 'medium', 'high']
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: '{VALUE} is not a valid priority. Priority must be low, medium, or high.'
    },
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Supplementary Problem: Pre-save hook that automatically trims whitespace from title field
taskSchema.pre('save', function (next) {
  if (this.title && typeof this.title === 'string') {
    this.title = this.title.trim();
  }
  if (this.description && typeof this.description === 'string') {
    this.description = this.description.trim();
  }
  if (typeof next === 'function') {
    next();
  }
});

module.exports = mongoose.model('Task', taskSchema);
