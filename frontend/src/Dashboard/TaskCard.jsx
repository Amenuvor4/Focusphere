import React from "react";
import { Calendar, MoreHorizontal } from "lucide-react";

export function TaskCard({ task, onClick, onEdit, onDelete }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "medium":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      default:
        return "bg-gray-100 dark:bg-slate-700/50 text-gray-800 dark:text-slate-300";
    }
  };

  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <div
      className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-sm cursor-pointer hover:shadow-md dark:hover:border-slate-600 transition-all"
      onClick={() => {
        if (!menuOpen) onClick();
      }}
    >
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white">
          {task.title}
        </h4>
        <div className="relative">
          <button
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          >
            <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-slate-400" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-slate-600"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setMenuOpen(false);
                  }}
                >
                  Edit
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-red-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setMenuOpen(false);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
          <Calendar className="h-3 w-3" />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}
        >
          {task.priority}
        </span>
      </div>
    </div>
  );
}
