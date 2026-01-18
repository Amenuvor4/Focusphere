import React, { useState } from "react";
import { X } from "lucide-react";
import getValidToken from "../config/tokenUtils.js";
import { ENDPOINTS } from "../config/api.js";

const GoalModal = ({ isOpen, onClose, onSave, goal = null }) => {
  const isEditing = !!goal;
  const [formData, setFormData] = useState({
    title: goal?.title || "",
    description: goal?.description || "",
    priority: goal?.priority || "medium",
    progress: goal?.progress || 0,
    deadline: goal?.deadline
      ? new Date(goal.deadline).toISOString().split("T")[0]
      : "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getValidToken();
      if (!token) {
        alert("Please log in again");
        return;
      }

      const url = isEditing
        ? ENDPOINTS.GOALS.BY_ID(goal._id)
        : ENDPOINTS.GOALS.BASE;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          tasks: goal?.tasks || [],
        }),
      });

      if (response.ok) {
        alert(`Goal ${isEditing ? "updated" : "created"} successfully!`);
        onSave();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save goal");
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      alert("Error saving goal");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? "Edit Goal" : "Add New Goal"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="e.g., Launch new product"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Describe your goal..."
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Progress */}
          {isEditing && goal && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Current Progress
                </span>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                  {goal.progress || 0}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-blue-200 dark:bg-blue-900/40">
                <div
                  className="h-2 rounded-full bg-blue-600 dark:bg-blue-500 transition-all"
                  style={{ width: `${goal.progress || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                Progress is automatically calculated based on completed tasks
                {goal.tasks && goal.tasks.length > 0 && (
                  <>
                    {" "}
                    (
                    {Math.round(
                      ((goal.progress || 0) * goal.tasks.length) / 100
                    )}{" "}
                    of {goal.tasks.length} tasks completed)
                  </>
                )}
              </p>
            </div>
          )}

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Deadline
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Goal"
                  : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
