const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

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
    
    // Transform the response to match frontend expectations
    const transformedTask = {
      id: savedTask._id, // Map _id to id for frontend
      title: savedTask.title,
      description: savedTask.description,
      priority: savedTask.priority,
      status: savedTask.status,
      dueDate: savedTask.due_date, 
      category: savedTask.category,
    };
    
    res.status(201).json({ 
      message: 'Task created successfully', 
      task: transformedTask 
    });
  } catch (error) {
    console.log("Task routes error line 57");
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
    
    // Transform for frontend
    const transformedTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.due_date, 
      category: task.category,
    }));
    
    res.status(200).json(transformedTasks);
  } catch (error) {
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

    // Transform for frontend
    const transformedTask = {
      id: updatedTask._id,
      title: updatedTask.title,
      description: updatedTask.description,
      priority: updatedTask.priority,
      status: updatedTask.status,
      dueDate: updatedTask.due_date,
      category: updatedTask.category,
    };

    res.status(200).json({ 
      message: 'Task updated successfully', 
      task: transformedTask 
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

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

