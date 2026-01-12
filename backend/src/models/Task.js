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
  },
  description: { 
    type: String 
  },
}, { timestamps: true });

// Indexes for frequently queried fields
taskSchema.index({ user_id: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ status: 1 });

//Helper function to update goal progress
const updateGoalProgress = async (userId, category) => {
  try {
    const Goal = mongoose.model('Goal');
    const Task = mongoose.model('Task');

    //Find the goal using a case-insensitive regex for the title
    const goal = await Goal.findOne({ 
      userId: userId, 
      title: { $regex: new RegExp(`^${category}$`, 'i') } 
    });

    if (goal) {
      const tasks = await Task.find({ 
        user_id: userId, 
        category: { $regex: new RegExp(`^${category}$`, 'i') } 
      });

      if (tasks.length > 0) {
        const completedCount = tasks.filter(t => t.status === 'completed').length;
        goal.progress = Math.round((completedCount / tasks.length) * 100);
      } else {
        goal.progress = 0;
      }
      await goal.save();
    }
  } catch (err) {
    console.error('Goal progress update failed:', err);
  }
}

// Post-save: Trigger on creation or status change
taskSchema.post('save', async function (doc) {
 await updateGoalProgress(doc.user_id, doc.category);
});

// Post-update hook to update goal progress when task status changes
taskSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    await updateGoalProgress(doc.user_id, doc.category);
  }
});

// Post-delete hook to update goal progress when task is deleted
taskSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await updateGoalProgress(doc.user_id, doc.category);
  }
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;