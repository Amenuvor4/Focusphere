const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true }, 
  priority: { type: String, default: 'medium' },
  status: { type: String, default: 'todo' }, // Changed from 'incomplete' to 'todo' to match frontend
  due_date: { type: Date },
  description: { type: String },
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;