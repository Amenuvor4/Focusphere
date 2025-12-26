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
        return "bg-red-100 text-red-600";
      case "medium":
        return "bg-blue-100 text-blue-600";
      case "low":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">{goal.title}</h3>
          </div>
          <div className="relative">
            <button
              className="rounded-md p-1 hover:bg-gray-100"
              onClick={toggleMenu}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button 
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      onViewDetails(goal);
                      setIsMenuOpen(false);
                    }}
                  >
                    View Details
                  </button>
                  <button 
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      onEdit(goal);
                      setIsMenuOpen(false);
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
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
        <p className="mb-4 text-sm text-gray-500 line-clamp-2">
          {goal.description || "No description"}
        </p>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">{goal.progress || 0}% Complete</span>
          <span
            className={`rounded-full px-2 py-1 text-xs ${getPriorityClass(goal.priority)}`}
          >
            {goal.priority || "medium"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${goal.progress || 0}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>Due: {formatDate(goal.deadline || goal.dueDate)}</span>
          </div>
          {goal.tasks && (
            <span className="text-xs text-gray-500">
              {goal.tasks.length} task{goal.tasks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalCard;