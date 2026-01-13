import React, { useState, useEffect } from "react";
import { Plus, Target } from "lucide-react";
import getValidToken from "../config/tokenUtils.js";
import GoalCard from "./GoalCard";
import GoalDetails from "./GoalDetails";
import GoalModal from "../componets/GoalModal.jsx";
import { ENDPOINTS } from "../config/api.js";

const GoalList = () => {
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [viewingGoal, setViewingGoal] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGoals();
    fetchTasks();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = await getValidToken();
      if (!token) return;

      const response = await fetch(ENDPOINTS.GOALS.BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = await getValidToken();
      if (!token) return;

      const response = await fetch(ENDPOINTS.TASKS.BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleAddGoal = () => {
    setIsAddModalOpen(true);
  };

  const handleEditGoal = (goal) => {
    setSelectedGoal(goal);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (goal) => {
    setViewingGoal(goal);
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;

    try {
      const token = await getValidToken();
      const response = await fetch(ENDPOINTS.GOALS.BY_ID(goalId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setGoals(goals.filter((g) => g._id !== goalId));
        alert("Goal deleted successfully!");
      } else {
        alert("Failed to delete goal");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Error deleting goal");
    }
  };

  const handleCloseDetails = () => {
    setViewingGoal(null);
  };

  // If viewing goal details, show that instead
  if (viewingGoal) {
    const goalTasks = tasks.filter((task) =>
      viewingGoal.tasks?.includes(task.id)
    );

    return (
      <GoalDetails
        goal={viewingGoal}
        tasks={goalTasks}
        onClose={handleCloseDetails}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-gray-500">Track your long-term objectives</p>
        </div>
        <button
          onClick={handleAddGoal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Goal
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No goals yet
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by creating your first goal
          </p>
          <button
            onClick={handleAddGoal}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Create Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onViewDetails={handleViewDetails}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <GoalModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={fetchGoals}
        />
      )}

      {isEditModalOpen && selectedGoal && (
        <GoalModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedGoal(null);
          }}
          onSave={fetchGoals}
          goal={selectedGoal}
        />
      )}
    </div>
  );
};

export default GoalList;
