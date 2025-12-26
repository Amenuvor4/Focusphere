const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const protect = require('../middleware/authMiddleware');
const Goal = require('../models/Goal');

const router = express.Router();

// ===================================
// TEST ENDPOINT - PUBLIC (NO AUTH)
// ===================================
router.get('/test', (req, res) => {
  res.json({ message: "Tasks API is working" });
});

// ===================================
// PROTECT ALL ROUTES AFTER THIS LINE
// ===================================
router.use(protect);

// Transform task for frontend
const transformTask = (task) => ({
  id: task._id,
  title: task.title,
  description: task.description,
  priority: task.priority,
  status: task.status,
  dueDate: task.due_date,
  category: task.category,
});


//Default due date function
const getDefaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date;
}

// Create a Task
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, due_date, category, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }
    if (status && !['todo', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    if (due_date && isNaN(new Date(due_date).getTime())) {
      return res.status(400).json({ error: 'Invalid due date' });
    }

    let goal = await Goal.findOne({ title: category, userId: req.user.id});

    // If no goal exists, create a new one
    if (!goal) {
      goal = new Goal({
        title: category,
        description: `Tasks related to ${category}`,
        progress: 0,
        priority: 'medium',
        tasks: [],
        userId: req.user.id,
      });
      await goal.save();
    } 

    const task = new Task({
      user_id: req.user.id,
      title,
      description,
      priority,
      status: status || 'todo',
      due_date: due_date ? new Date(due_date) : getDefaultDueDate(),  // ✅ FIXED LINE
      category,
    });

    const savedTask = await task.save();

    if(goal){
      goal.tasks.push(savedTask._id);
      await goal.save();
    }
    
    res.status(201).json({ 
      message: 'Task created successfully', 
      task: transformTask(savedTask),
    });
  } catch (error) {
    console.error("Task creation error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get All Tasks for the Authenticated User
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ user_id: req.user.id }).skip(skip).limit(limit);
    const totalTasks = await Task.countDocuments({ user_id: req.user.id });
    
    const totalPages = Math.ceil(totalTasks / limit);

    // Transform for frontend
    const transformedTasks = tasks.map(transformTask);

    // Return the transformed tasks as a flat array
    res.status(200).json(transformedTasks);
  } catch (error) {
    console.error("Task fetch error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Update a Task
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid Task ID' });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      req.body,
      { new: true, runValidators: false } // Disable validators for updates
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ 
      message: 'Task updated successfully', 
      task: transformTask(updatedTask),
    });
  } catch (error) {
    console.error("Task update error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Delete a Task
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid Task ID' });
    }

    const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Find the goal with the matching category and remove the task ID
    const goal = await Goal.findOne({ title: deletedTask.category, userId: req.user.id });
    if (goal) {
      goal.tasks = goal.tasks.filter(taskId => taskId.toString() !== deletedTask._id.toString());
      await goal.save();
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error("Task deletion error:", error);
    res.status(400).json({ error: error.message });
  }
});

// For analytics page
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange } = req.query;
    const userId = req.user.id;

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case 'Week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'Month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'Quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'Year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Fetch tasks within the date range
    const tasks = await Task.find({
      user_id: userId,
      createdAt: { $gte: startDate },
    });

    // Calculate analytics data
    const tasksCompleted = tasks.filter(task => task.status === 'completed').length;
    const tasksCreated = tasks.length;
    const completionRate = tasksCreated > 0 ? (tasksCompleted / tasksCreated) * 100 : 0;
    const averageCompletionTime = calculateAverageCompletionTime(tasks);

    // Group tasks by category
    const tasksByCategory = {};
    tasks.forEach(task => {
      tasksByCategory[task.category] = (tasksByCategory[task.category] || 0) + 1;
    });

    // Group tasks by priority
    const tasksByPriority = { high: 0, medium: 0, low: 0 };
    tasks.forEach(task => {
      if (task.priority) tasksByPriority[task.priority]++;
    });

    // Prepare recent activity
    const recentActivity = tasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(task => ({
        type: task.status === 'completed' ? 'completed' : 'created',
        task: task.title,
        date: new Date(task.createdAt).toLocaleDateString(),
      }));

    // Send the response
    res.status(200).json({
      tasksCompleted,
      tasksCreated,
      completionRate: Math.round(completionRate),
      averageCompletionTime,
      tasksByCategory: Object.entries(tasksByCategory).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / tasksCreated) * 100),
      })),
      tasksByPriority: Object.entries(tasksByPriority).map(([name, count]) => ({
        name,
        count,
        percentage: tasksCreated > 0 ? Math.round((count / tasksCreated) * 100) : 0,
      })),
      recentActivity,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to calculate average completion time
function calculateAverageCompletionTime(tasks) {
  const completedTasks = tasks.filter(task => task.status === 'completed' && task.updatedAt);
  if (completedTasks.length === 0) return "0 days";

  const totalTime = completedTasks.reduce((sum, task) => {
    const completionTime = new Date(task.updatedAt) - new Date(task.createdAt);
    return sum + completionTime;
  }, 0);

  const averageTime = totalTime / completedTasks.length;
  const averageDays = (averageTime / (1000 * 60 * 60 * 24)).toFixed(1);
  return `${averageDays} days`;
}

module.exports = router;