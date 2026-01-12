const Task = require('../models/Task');

// Get all tasks for the logged-in user
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user_id: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

// Create a task manually
exports.createTask = async (req, res) => {
    try {
        const { title, category, priority, due_date, description } = req.body;
        const newTask = new Task({
            user_id: req.user.id,
            title,
            category,
            priority,
            due_date,
            description
        });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
};

// Update a task (e.g., checking it as "completed")
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        // Ensure the task belongs to the user
        const updatedTask = await Task.findOneAndUpdate(
            { _id: id, user_id: req.user.id },
            req.body,
            { new: true } // Returns the updated document
        );

        if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTask = await Task.findOneAndDelete({ _id: id, user_id: req.user.id });

        if (!deletedTask) return res.status(404).json({ error: 'Task not found' });
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
};