const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: { 
    type: String, 
    enum: ['todo', 'in-progress', 'completed'],
    default: 'todo',
  },
  due_date: { 
    type: Date,
    validate: {
      validator: function (value) {
        return value > new Date(); // Ensure due_date is in the future
      },
      message: 'Due date must be in the future',
    },
  },
  description: { 
    type: String 
  },
}, { timestamps: true });

// Indexes for frequently queried fields
taskSchema.index({ user_id: 1 });
taskSchema.index({ category: 1 });

// Pre-save hook to validate category matches a goal's title
taskSchema.pre('save', async function (next) {
  const goal = await mongoose.model('Goal').findOne({ title: this.category, userId: this.user_id });
  if (!goal) {
    return next(new Error('Category does not match any existing goal for the user'));
  }
  next();
});

// Post-save hook to update goal progress
taskSchema.post('save', async function (doc) {
  const goal = await mongoose.model('Goal').findOne({ title: doc.category, userId: doc.user_id });
  if (goal) {
    const tasks = await mongoose.model('Task').find({ category: goal.title, user_id: goal.userId });
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    goal.progress = Math.round((completedTasks / tasks.length) * 100);
    await goal.save();
  }
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;