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
    validate: {
      validator: function (value) {
        return value > new Date(); // Ensure deadline is in the future
      },
      message: 'Deadline must be in the future',
    },
  },
  priority: { 
    type: String, 
    enum: ['high', 'medium', 'low'], 
    default: 'medium',
    set: (value) => value.toLowerCase(), // Convert to lowercase
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

// Virtual field to dynamically compute taskCount
goalSchema.virtual('taskCount').get(function () {
  return Array.isArray(this.tasks) ? this.tasks.length : 0;
});

// Ensure virtuals are included when converting to JSON
goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

// Pre-save hook to validate referenced tasks
goalSchema.pre('save', async function (next) {
  if (this.tasks && this.tasks.length > 0) {
    const tasksExist = await mongoose.model('Task').countDocuments({ _id: { $in: this.tasks } });
    if (tasksExist !== this.tasks.length) {
      return next(new Error('One or more tasks do not exist'));
    }
  }
  next();
});

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;