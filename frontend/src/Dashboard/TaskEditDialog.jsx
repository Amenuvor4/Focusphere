import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import getValidToken from "../config/tokenUtils";
import { ENDPOINTS } from "../config/api.js";
import GoalModal from "../componets/GoalModal.jsx";

export function TaskEditDialog({ isOpen, onClose, task, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(task?.status || "todo");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Populate form fields if editing an existing task
  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || "todo");
      setPriority(task.priority || "medium");
      setDueDate(task.dueDate || "");
      setCategory(task.category || "");
    } else {
      // Reset form for new task
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setDueDate("");
      setCategory("");
    }
  }, [task, isOpen]);

  // Fetch goals function - reusable for initial load and after goal creation
  const fetchGoals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getValidToken();
      if (!token) {
        return;
      }

      const response = await fetch(ENDPOINTS.GOALS.BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch goals");
      }

      const data = await response.json();
      setGoals(data);
      return data;
    } catch (error) {
      console.error("Error fetching goals:", error);
      setError("Failed to fetch goals. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch goals when the dialog is opened
  useEffect(() => {
    if (isOpen) {
      fetchGoals();
    }
  }, [isOpen]);

  // Handle "Create New Goal" option selection
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "__create_new_goal__") {
      // Validate that important task fields are filled
      if (!title.trim()) {
        setValidationError("Please fill in the task title before creating a new goal.");
        return;
      }
      if (!description.trim()) {
        setValidationError("Please fill in the task description before creating a new goal.");
        return;
      }
      setValidationError(null);
      setIsGoalModalOpen(true);
    } else {
      setCategory(value);
      setValidationError(null);
    }
  };

  const handleGoalCreated = async () => {
    // Refetch goals to get the newly created one
    const updatedGoals = await fetchGoals();
    if (updatedGoals && updatedGoals.length > 0) {
      // Auto-select the most recently created goal (last in the list or find by newest)
      const newestGoal = updatedGoals[updatedGoals.length - 1];
      onSave({
        ...(task || {}),
        id: task?.id,
        title,
        description,
        status,
        priority,
        dueDate,
        category: newestGoal.title,
      });
    }
    setIsGoalModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...(task || {}), // Preserve other fields if editing
      id: task?.id,
      title,
      description,
      status,
      priority,
      dueDate,
      category,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border dark:border-slate-700 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {task ? "Edit Task" : "Create Task"}
          </h2>
          <button
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-600 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                disabled={isLoading}
              >
                <option value="">Select a category</option>
                {isLoading ? (
                  <option value="" disabled>
                    Loading categories...
                  </option>
                ) : (
                  <>
                    {goals.map((goal) => (
                      <option key={goal._id} value={goal.title}>
                        {goal.title}
                      </option>
                    ))}
                    <option value="__create_new_goal__" className="font-medium text-blue-600">
                      + Create New Goal
                    </option>
                  </>
                )}
              </select>
            </div>
          </div>

          {validationError && (
            <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
              {validationError}
            </div>
          )}

          {error && <div className="text-sm text-red-500 dark:text-red-400">{error}</div>}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700"
            >
              {task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>

      {/* Goal Creation Modal */}
      {isGoalModalOpen && (
        <GoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          onSave={handleGoalCreated}
        />
      )}
    </div>
  );
}
