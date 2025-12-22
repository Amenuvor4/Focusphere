const express = require('express');
const Goal = require('../models/Goal.js');
const Task = require('../models/Task.js');
const protect = require('../middleware/authMiddleware.js');
const { default: mongoose } = require('mongoose');

const router = express.Router();

// ===================================
// TEST ENDPOINT - PUBLIC (NO AUTH)
// ===================================
router.get('/test', (req, res) => {
  res.json({ message: 'Goals API is working' });
});

// ===================================
// PROTECT ALL ROUTES AFTER THIS LINE
// ===================================
router.use(protect);

// Validate ObjectID middleware
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid Goal ID' });
  }
  next();
};

// Create a Goal
router.post('/', async (req, res) => {
  try {
    const { title, description, progress, deadline, priority, tasks } = req.body;

    // Manual validation
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100' });
    }
    if (deadline && new Date(deadline) <= new Date()) {
      return res.status(400).json({ error: 'Deadline must be in the future' });
    }
    if (priority && !['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    const goal = new Goal({
      title,
      description,
      progress,
      deadline,
      priority: priority || 'medium',
      tasks,
      userId: req.user.id,
    });

    const savedGoal = await goal.save();
    res.status(201).json({ message: 'Goal created successfully', goal: savedGoal });
  } catch (error) {
    console.error('Goal creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get All Goals
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).populate('tasks');
    res.status(200).json(goals);
  } catch (error) {
    console.error('Goal fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a Single Goal by ID
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal || goal.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Goal fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Goal
router.put('/:id', validateObjectId, async (req, res) => {
  try {
    const { title, description, progress, deadline, priority, tasks } = req.body;

    // Manual validation
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100' });
    }
    if (priority && !['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, description, progress, deadline, priority, tasks },
      { new: true, runValidators: false }
    );

    if (!updatedGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.status(200).json({ message: 'Goal updated successfully', goal: updatedGoal });
  } catch (error) {
    console.error('Goal update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Goal
router.delete('/:id', validateObjectId, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal || goal.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Delete all tasks associated with this goal
    await Task.deleteMany({ category: goal.title, user_id: goal.userId });

    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Goal and associated tasks deleted successfully' });
  } catch (error) {
    console.error('Goal deletion error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;