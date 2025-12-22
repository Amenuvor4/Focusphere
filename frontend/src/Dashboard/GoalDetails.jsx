import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, CheckCircle, Clock, Target, X } from "lucide-react";

const GoalDetails = ({ goal, onClose, tasks = [] }) => {
  const [tasksByStatus, setTasksByStatus] = useState({
    todo: [],
    "in-progress": [],
    completed: []
  });

  // Initialize tasks by status when component mounts or tasks change
  useEffect(() => {
    const groupedTasks = {
      todo: [],
      "in-progress": [],
      completed: []
    };

    // Sort tasks by due date (closest first)
    const sortedTasks = [...tasks].sort((a, b) => 
      new Date(a.due_date) - new Date(b.due_date)
    );

    // Group tasks by status
    sortedTasks.forEach(task => {
      if (groupedTasks[task.status]) {
        groupedTasks[task.status].push(task);
      }
    });

    setTasksByStatus(groupedTasks);
  }, [tasks]);

  // Format date to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return "No date set";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculate days remaining or overdue
  const getDaysRemaining = (dateString) => {
    if (!dateString) return null;
    
    const dueDate = new Date(dateString);
    const today = new Date();
    
    // Reset time component for accurate day calculation
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return "Due today";
    } else {
      return `${diffDays} days remaining`;
    }
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority badge class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate time status class based on days remaining
  const getTimeStatusClass = (dateString) => {
    if (!dateString) return "";
    
    const dueDate = new Date(dateString);
    const today = new Date();
    
    // Reset time component for accurate day calculation
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return "text-red-600";
    } else if (diffDays === 0) {
      return "text-orange-600";
    } else if (diffDays <= 3) {
      return "text-yellow-600";
    } else {
      return "text-green-600";
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <button 
            className="flex items-center text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Goals
          </button>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          <Target className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">{goal.title}</h2>
          <span className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${getPriorityClass(goal.priority)}`}>
            {goal.priority}
          </span>
        </div>
        
        <p className="text-gray-600 mt-2">{goal.description}</p>
      </div>
      
      {/* Goal Progress */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Progress</h3>
          <span className="font-medium">{goal.progress}%</span>
        </div>
        
        <div className="h-3 w-full rounded-full bg-gray-200">
          <div 
            className="h-3 rounded-full bg-blue-600"
            style={{ width: `${goal.progress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Deadline: {formatDate(goal.deadline || goal.dueDate)}</span>
          </div>
          <div className={`flex items-center gap-1 ${getTimeStatusClass(goal.deadline || goal.dueDate)}`}>
            <Clock className="h-4 w-4" />
            <span>{getDaysRemaining(goal.deadline || goal.dueDate)}</span>
          </div>
        </div>
      </div>
      
      {/* Tasks Section */}
      <div className="p-4">
        <h3 className="font-medium mb-4">Tasks ({tasks.length})</h3>
        
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`rounded-full px-3 py-1 text-xs ${getStatusClass(status)}`}>
                {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({statusTasks.length} {statusTasks.length === 1 ? "task" : "tasks"})
              </span>
            </div>
            
            {statusTasks.length > 0 ? (
              <div className="space-y-2">
                {statusTasks.map(task => (
                  <div key={task.id} className="border rounded-md p-3 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {status === "completed" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          )}
                          <h4 className="font-medium">{task.title}</h4>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1 ml-6">{task.description}</p>
                        )}
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 ml-6 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {formatDate(task.due_date)}</span>
                      <span className={`${getTimeStatusClass(task.due_date)}`}>
                        ({getDaysRemaining(task.due_date)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No tasks in this status</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalDetails;