import React, { useState, useEffect } from "react";
import { Plus, Target } from "lucide-react";
import getValidToken from "../config/tokenUtils.js";
import GoalCard from "./GoalCard";
import GoalDetails from "./GoalDetails";
import GoalModal from "../componets/GoalModal.jsx";
import ConfirmModal from "../componets/ConfirmModal.jsx";
import { ENDPOINTS } from "../config/api.js";
import { GoalsListSkeleton } from "../componets/GoalsListSkeletion.jsx";

const GoalList = () => {
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [viewingGoal, setViewingGoal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    goalId: null,
    taskCount: 0,
  });
  // FETCH DATA AT CONCURRENTLY
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const token = await getValidToken();
      if (!token) return;

      // Fetch both goals and tasks in parallel
      const [goalsResponse, tasksResponse] = await Promise.all([
        fetch(ENDPOINTS.GOALS.BASE, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(ENDPOINTS.TASKS.BASE, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setGoals(goalsData);
      }

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setTimeout(() => setIsFetching(false), 300);
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

  const handleDeleteGoal = (goalId) => {
    const goalToDelete = goals.find((g) => g._id === goalId);
    const taskCount = goalToDelete?.tasks?.length || 0;
    setDeleteConfirm({ isOpen: true, goalId, taskCount });
  };

  const confirmDelete = async () => {
    const { goalId } = deleteConfirm;
    try {
      const token = await getValidToken();
      const response = await fetch(ENDPOINTS.GOALS.BY_ID(goalId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setGoals(goals.filter((g) => g._id !== goalId));
      } else {
        console.error("Failed to delete goal");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const handleCloseDetails = () => {
    setViewingGoal(null);
  };

  // If viewing goal details, show that instead
  if (viewingGoal) {
    const goalTasks = tasks.filter((task) =>
      viewingGoal.tasks?.includes(task.id),
    );

    return (
      <GoalDetails
        goal={viewingGoal}
        tasks={goalTasks}
        onClose={handleCloseDetails}
      />
    );
  }

  if (isFetching) {
    return <GoalsListSkeleton />;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Goals
          </h1>
          <p className="text-gray-500 dark:text-slate-400">
            Track your long-term objectives
          </p>
        </div>
        <button
          onClick={handleAddGoal}
          className="flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Goal
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
          <Target className="h-12 w-12 text-gray-400 dark:text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No goals yet
          </h3>
          <p className="text-gray-500 dark:text-slate-400 mb-4">
            Get started by creating your first goal
          </p>
          <button
            onClick={handleAddGoal}
            className="inline-flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
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
          onSave={fetchData}
        />
      )}

      {isEditModalOpen && selectedGoal && (
        <GoalModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedGoal(null);
          }}
          onSave={fetchData}
          goal={selectedGoal}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, goalId: null, taskCount: 0 })
        }
        onConfirm={confirmDelete}
        title="Delete Goal"
        message={
          deleteConfirm.taskCount > 0
            ? `Are you sure you want to delete this goal?\n\nThis will also delete ${deleteConfirm.taskCount} task${deleteConfirm.taskCount === 1 ? "" : "s"} associated with this goal. This action cannot be undone.`
            : "Are you sure you want to delete this goal? This action cannot be undone."
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default GoalList;
