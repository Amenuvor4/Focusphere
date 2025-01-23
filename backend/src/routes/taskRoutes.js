const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Create a Task
router.post('/', async (req, res) => {
  try {
    const { title, category, priority, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = new Task({
      user_id: req.user,
      title,
      category,
      priority,
      due_date,
    });

    const savedTask = await task.save();
    res.status(201).json({ message: 'Task created successfully', task: savedTask });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Tasks for the Authenticated User
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ user_id: req.user }).skip(skip).limit(limit);
    res.status(200).json(tasks);
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
      { _id: req.params.id, user_id: req.user },
      req.body,
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
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

    const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user_id: req.user });
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

