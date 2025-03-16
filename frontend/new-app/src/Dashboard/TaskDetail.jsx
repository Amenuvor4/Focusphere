import React from 'react';
import { Calendar, X } from 'lucide-react';

export function TaskDetail({ isOpen, onClose, task, onEdit, onDelete }) {
  if (!isOpen || !task) return null;

  const statusDisplay = 
    task.status === "todo" ? "To Do" : 
    task.status === "in-progress" ? "In Progress" : 
    "Completed";

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

  task.dueDate = new Date(task.dueDate).toLocaleDateString();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{task.title}</h2>
          <button 
            className="p-1 rounded-full hover:bg-gray-200"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
            <p>{task.description || "No description provided."}</p>
          </div>
          
          <hr className="border-gray-200" />
          
          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
              <span className="inline-block px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                {statusDisplay}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Priority</h3>
              <span className={`inline-block px-2 py-1 text-sm rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
          </div>
          
          {/* Due Date and Project */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{task.dueDate || "No due date"}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Goal</h3>
              <div>{task.category || "Uncategorized"}</div>
            </div>
          </div>
          
          <hr className="border-gray-200" />
          
          {/* Assignee */}
          {task.assignee && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Assignee</h3>
              <div className="flex items-center gap-2">
                <img 
                  src={task.assignee.avatar || "/api/placeholder/32/32"} 
                  alt={task.assignee.name} 
                  className="h-8 w-8 rounded-full" 
                />
                <span>{task.assignee.name}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-6">
          <button 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={onDelete}
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              onClick={onClose}
            >
              Close
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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