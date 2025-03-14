import React, { useState } from "react";
import { Calendar, Filter, MoreHorizontal, Plus, Target } from "lucide-react";

// Mock data
const goals = [
  {
    id: "1",
    title: "Complete Website Redesign",
    description: "Finish all tasks related to the website redesign project",
    progress: 65,
    dueDate: "2025-04-15",
    category: "Work",
    priority: "high",
  },
  {
    id: "2",
    title: "Learn React Native",
    description: "Complete the React Native course and build a mobile app",
    progress: 40,
    dueDate: "2025-06-30",
    category: "Learning",
    priority: "medium",
  },
  {
    id: "3",
    title: "Improve Team Communication",
    description: "Implement new communication protocols and tools",
    progress: 25,
    dueDate: "2025-05-01",
    category: "Team",
    priority: "high",
  },
  {
    id: "4",
    title: "Reduce Project Delivery Time",
    description: "Optimize workflows to reduce project delivery time by 20%",
    progress: 10,
    dueDate: "2025-07-15",
    category: "Process",
    priority: "medium",
  },
];

export function GoalList() {
  const [openMenuId, setOpenMenuId] = useState(null); // Track which goal's menu is open

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id); // Toggle the menu for the clicked goal
  };

  return (
    <div className="space-y-4 p-4">
      {/* Goal List Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Goals</h2>
          <p className="text-gray-500">Track your long-term objectives and progress</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add Goal
          </button>
        </div>
      </div>

      {/* Goal Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => (
          <div key={goal.id} className="rounded-lg border bg-white shadow-sm">
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium">{goal.title}</h3>
                </div>
                <div className="relative">
                  <button
                    className="rounded-md p-1 hover:bg-gray-100"
                    onClick={() => toggleMenu(goal.id)} // Toggle menu on click
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {/* Conditionally render the dropdown menu */}
                  {openMenuId === goal.id && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                          Edit
                        </button>
                        <button className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100">
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="mb-4 text-sm text-gray-500">{goal.description}</p>

              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{goal.progress}% Complete</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    goal.priority === "high"
                      ? "bg-red-100 text-red-600"
                      : goal.priority === "medium"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {goal.priority}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Due: {goal.dueDate}</span>
                </div>
                <span className="rounded-full border px-2 py-1 text-xs text-gray-500">
                  {goal.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}