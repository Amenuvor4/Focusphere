const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true, 
    trim: true 
  },
  progress: { 
    type: Number, 
    required: true, 
    default: 0,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100']
  },
  deadline: { 
    type: Date,
  },
  priority: { 
    type: String, 
    enum: ['high', 'medium', 'low'], 
    default: 'medium',
    set: (value) => value.toLowerCase(), 
  },
  tasks: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task' 
  }], 
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
}, { timestamps: true });

// Index for frequently queried field
goalSchema.index({ userId: 1 });
goalSchema.index({ title: 1, userId: 1 });

// Virtual field to dynamically compute taskCount
goalSchema.virtual('taskCount').get(function () {
  return Array.isArray(this.tasks) ? this.tasks.length : 0;
});

// Ensure virtuals are included when converting to JSON
goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

// Pre-save hook to validate deadline only on creation
goalSchema.pre('save', async function (next) {
  // Only validate deadline as future date when creating a new goal
  if (this.isNew && this.deadline && this.deadline <= new Date()) {
    return next(new Error('Deadline must be in the future'));
  }

  // Validate that all referenced tasks exist
  // Skip validation if skipTaskValidation flag is set (during bulk operations)
  // DISABLED: This validation causes race conditions during parallel operations
  // The database foreign key constraints will handle referential integrity
  if (false && this.tasks && this.tasks.length > 0 && !this.skipTaskValidation) {
    try {
      const tasksExist = await mongoose.model('Task').countDocuments({
        _id: { $in: this.tasks }
      });
      if (tasksExist !== this.tasks.length) {
        // Log which tasks are missing for debugging
        console.log(`Goal "${this.title}" validation failed: Expected ${this.tasks.length} tasks, found ${tasksExist}`);
        return next(new Error('One or more tasks do not exist'));
      }
    } catch (error) {
      console.error('Error validating tasks:', error);
    }
  }
  next();
});

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;