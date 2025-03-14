import React from 'react';
import { Calendar, MoreHorizontal } from 'lucide-react';

export function TaskCard({ task, onClick, onEdit, onDelete }) {
const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div 
      className="p-3 bg-white border rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => {
        if (!menuOpen) onClick();
      }}
    >
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-sm">{task.title}</h4>
        <div className="relative">
          <button 
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          
          {menuOpen && (
            <div 
              className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setMenuOpen(false);
                  }}
                >
                  Edit
                </button>
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>{new Date(task.dueDate)}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
}