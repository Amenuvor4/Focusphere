const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const protect = require('../middleware/authMiddleware');
const Goal = require('../models/Goal');

const router = express.Router();

// Protect all routes
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

//Add a simple test endpoint
router.get('/test', (req, res) => {
  res.json({ message: "Tasks API is working" });
});

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


    const goal = await Goal.findOne({ title: category, userId: req.user.id});

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
      due_date,
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
    console.log("Task routes error line 66");
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
    totalPages = Math.ceil(totalTasks / limit);

    // Transform for frontend
    const transformedTasks = tasks.map(transformTask);

    // Return the transformed tasks as a flat array
    res.status(200).json(transformedTasks);
  } catch (error) {
    console.error("Task routes error line 92:", error);
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
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ 
      message: 'Task updated successfully', 
      task: transformTask(updatedTask),
    });
  } catch (error) {
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
      goal.tasks = goal.tasks.filter(taskId => taskId.toString() !== deletedTask._id.toString()); // Remove task ID
      await goal.save();
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

