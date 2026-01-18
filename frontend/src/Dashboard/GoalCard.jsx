import React, { useState } from "react";
import { Calendar, MoreHorizontal, Target } from "lucide-react";

const GoalCard = ({ goal, onViewDetails, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300";
      case "medium":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300";
      case "low":
        return "bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300";
      default:
        return "bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md dark:hover:border-slate-600 transition-all">
      <div className="border-b border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">
              {goal.title}
            </h3>
          </div>
          <div className="relative">
            <button
              className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-slate-700"
              onClick={toggleMenu}
            >
              <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-slate-400" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-slate-700 shadow-lg ring-1 ring-black/5 dark:ring-slate-600 z-10">
                <div className="py-1">
                  <button
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600"
                    onClick={() => {
                      onViewDetails(goal);
                      setIsMenuOpen(false);
                    }}
                  >
                    View Details
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600"
                    onClick={() => {
                      onEdit(goal);
                      setIsMenuOpen(false);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-red-900/20"
                    onClick={() => {
                      onDelete(goal._id);
                      setIsMenuOpen(false);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="mb-4 text-sm text-gray-500 dark:text-slate-400 line-clamp-2">
          {goal.description || "No description"}
        </p>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {goal.progress || 0}% Complete
          </span>
          <span
            className={`rounded-full px-2 py-1 text-xs ${getPriorityClass(goal.priority)}`}
          >
            {goal.priority || "medium"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 h-2 w-full rounded-full bg-gray-200 dark:bg-slate-700">
          <div
            className="h-2 rounded-full bg-blue-600 dark:bg-blue-500 transition-all"
            style={{ width: `${goal.progress || 0}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>Due: {formatDate(goal.deadline || goal.dueDate)}</span>
          </div>
          {goal.tasks && (
            <span className="text-xs text-gray-500 dark:text-slate-400">
              {goal.tasks.length} task{goal.tasks.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
