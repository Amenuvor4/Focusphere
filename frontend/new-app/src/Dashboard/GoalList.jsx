import React, { useState, useEffect } from "react";
import axios from "axios";
import { Filter, Plus } from "lucide-react";
import GoalCard from "./GoalCard";
import GoalDetails from "./GoalDetails";
import getValidToken from "./tokenUtils"

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "high", "medium", "low"




  // Fetch goals and tasks from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getValidToken('accessToken')

        // Fetch goals
        const goalsResponse = await axios.get("http://localhost:5000/api/goals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGoals(goalsResponse.data);

        // Fetch tasks
        const tasksResponse = await axios.get("http://localhost:5000/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(tasksResponse.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Find the selected goal
  const selectedGoal = goals.find((goal) => goal._id === selectedGoalId);

  // Filter tasks for the selected goal
  const goalTasks = selectedGoalId
    ? tasks.filter((task) => task.category === selectedGoal?.title)
    : [];

  // Filter goals based on selected filter
  const filteredGoals =
    filter === "all"
      ? goals
      : goals.filter((goal) => goal.priority === filter);

  const handleViewDetails = (goalId) => {
    setSelectedGoalId(goalId);
  };

  const handleClose = () => {
    setSelectedGoalId(null);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading goals...</div>;
  }

  return (
    <div className="space-y-4 p-4">
      {!selectedGoalId ? (
        <>
          {/* Goal List Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Goals</h2>
              <p className="text-gray-500">Track your long-term objectives and progress</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
                  onClick={() => {
                    // Toggle filter dropdown logic would go here
                  }}
                >
                  <Filter className="h-4 w-4" />
                  Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
                <div className="absolute right-0 mt-1 w-36 rounded-md border bg-white shadow-lg z-10 hidden">
                  <div className="py-1">
                    <button
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      onClick={() => handleFilterChange("all")}
                    >
                      All
                    </button>
                    <button
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      onClick={() => handleFilterChange("high")}
                    >
                      High Priority
                    </button>
                    <button
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      onClick={() => handleFilterChange("medium")}
                    >
                      Medium Priority
                    </button>
                    <button
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      onClick={() => handleFilterChange("low")}
                    >
                      Low Priority
                    </button>
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Add Goal
              </button>
            </div>
          </div>

          {/* Goal Cards Grid */}
          {filteredGoals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal._id}
                  goal={goal}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No goals found with the selected filter.</p>
            </div>
          )}
        </>
      ) : (
        <GoalDetails
          goal={selectedGoal}
          tasks={goalTasks}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default Goals;