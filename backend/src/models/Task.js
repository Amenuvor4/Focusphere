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

// Post-save hook to update goal progress
taskSchema.post('save', async function (doc) {
  try {
    const goal = await mongoose.model('Goal').findOne({ 
      title: doc.category, 
      userId: doc.user_id 
    });
    
    if (goal) {
      const tasks = await mongoose.model('Task').find({ 
        category: goal.title, 
        user_id: goal.userId 
      });
      
      if (tasks.length > 0) {
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        goal.progress = Math.round((completedTasks / tasks.length) * 100);
        await goal.save();
      }
    }
  } catch (error) {
    console.error('Error updating goal progress:', error);
  }
});

// Post-update hook to update goal progress when task status changes
taskSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    try {
      const goal = await mongoose.model('Goal').findOne({ 
        title: doc.category, 
        userId: doc.user_id 
      });
      
      if (goal) {
        const tasks = await mongoose.model('Task').find({ 
          category: goal.title, 
          user_id: goal.userId 
        });
        
        if (tasks.length > 0) {
          const completedTasks = tasks.filter(task => task.status === 'completed').length;
          goal.progress = Math.round((completedTasks / tasks.length) * 100);
          await goal.save();
        }
      }
    } catch (error) {
      console.error('Error updating goal progress on update:', error);
    }
  }
});

// Post-delete hook to update goal progress when task is deleted
taskSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    try {
      const goal = await mongoose.model('Goal').findOne({ 
        title: doc.category, 
        userId: doc.user_id 
      });
      
      if (goal) {
        const tasks = await mongoose.model('Task').find({ 
          category: goal.title, 
          user_id: goal.userId 
        });
        
        if (tasks.length > 0) {
          const completedTasks = tasks.filter(task => task.status === 'completed').length;
          goal.progress = Math.round((completedTasks / tasks.length) * 100);
        } else {
          goal.progress = 0;
        }
        await goal.save();
      }
    } catch (error) {
      console.error('Error updating goal progress on delete:', error);
    }
  }
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;