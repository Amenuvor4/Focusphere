import React from "react";
import { Calendar, X } from "lucide-react";

export function TaskDetail({ isOpen, onClose, task, onEdit, onDelete }) {
  if (!isOpen || !task) return null;

  const statusDisplay =
    task.status === "todo"
      ? "To Do"
      : task.status === "in-progress"
        ? "In Progress"
        : "Completed";

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "medium":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "low":
        return "bg-gray-100 dark:bg-slate-700/50 text-gray-800 dark:text-slate-300";
      default:
        return "bg-gray-100 dark:bg-slate-700/50 text-gray-800 dark:text-slate-300";
    }
  };

  task.dueDate = new Date(task.dueDate).toLocaleDateString();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md border border-gray-200 dark:border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {task.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">
              Description
            </h3>
            <p className="text-gray-900 dark:text-slate-200">
              {task.description || "No description provided."}
            </p>
          </div>

          <hr className="border-gray-200 dark:border-slate-700" />

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Status
              </h3>
              <span className="inline-block px-2 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                {statusDisplay}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Priority
              </h3>
              <span
                className={`inline-block px-2 py-1 text-sm rounded-full ${getPriorityColor(task.priority)}`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
          </div>

          {/* Due Date and Project */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Due Date
              </h3>
              <div className="flex items-center gap-2 text-gray-900 dark:text-slate-200">
                <Calendar className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                <span>{task.dueDate || "No due date"}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Goal
              </h3>
              <div className="text-gray-900 dark:text-slate-200">
                {task.category || "Uncategorized"}
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-slate-700" />

          {/* Assignee */}
          {task.assignee && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Assignee
              </h3>
              <div className="flex items-center gap-2">
                <img
                  src={task.assignee.avatar || "/placeholder/32/32"}
                  alt={task.assignee.name}
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-gray-900 dark:text-slate-200">
                  {task.assignee.name}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-700"
            onClick={onDelete}
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-600"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700"
              onClick={onEdit}
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
