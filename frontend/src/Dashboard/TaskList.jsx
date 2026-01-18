import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { TaskDetail } from "./TaskDetail";
import { TaskEditDialog } from "./TaskEditDialog";
import { WelcomeBanner } from "./welcome-banner";
import getValidToken from "../config/tokenUtils.js";
import axios from "axios";
import { ENDPOINTS } from "../config/api.js";

export function TaskList({
  tasks: initialTasks = [],
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterTime, setFilterTime] = useState("all");
  const [userName, setUserName] = useState("John Doe");
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    completedToday: 0,
    upcomingDeadlines: 0,
  });

  // Get user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await getValidToken();
        if (!token) {
          return;
        }
        const response = await fetch(ENDPOINTS.AUTH.PROFILE, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.user && data.user.name) {
          setUserName(data.user.name.split(" ")[0].trim());
        } else {
          console.log("You got an error when getting data @ 108");
        }
      } catch (error) {
        console.log("This is where the error is at");
        console.error("Error fetching user data", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = await getValidToken();
        if (!token) {
          return;
        }

        console.log("Fetching tasks...");
        const response = await axios.get(ENDPOINTS.TASKS.BASE, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Fetched tasks:", response.data);
        if (Array.isArray(response.data)) {
          setTasks(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...tasks];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter((task) => task.status === filterStatus);
    }

    // Apply time filter
    if (filterTime !== "all") {
      const currentDate = new Date();
      let startDate;

      switch (filterTime) {
        case "Today":
          startDate = new Date(currentDate.setHours(0, 0, 0, 0));
          result = result.filter((task) => {
            const taskDate = new Date(task.dueDate);
            return taskDate.setHours(0, 0, 0, 0) === startDate.getTime();
          });
          break;

        case "Week":
          const dayOfWeek = currentDate.getDay();
          const diffToMonday =
            currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
          startDate = new Date(currentDate.setDate(diffToMonday));
          result = result.filter((task) => {
            const taskDate = new Date(task.dueDate);
            return taskDate >= startDate && taskDate <= currentDate;
          });
          break;

        case "Month":
          startDate = new Date(currentDate.getFullYear(), 0, 1);
          result = result.filter((task) => {
            const taskDate = new Date(task.dueDate);
            return taskDate >= startDate && taskDate <= currentDate;
          });
          break;

        default:
          break;
      }
    }

    // Apply priority filter
    if (filterPriority !== "all") {
      result = result.filter((task) => task.priority === filterPriority);
    }

    setFilteredTasks(result);
  }, [tasks, searchQuery, filterStatus, filterTime, filterPriority]);

  // Calculate task statistics
  useEffect(() => {
    // Get today's date in YYYY-MM-DD format for comparison
    const today = new Date().toISOString().split("T")[0];

    // Calculate stats
    const stats = {
      totalTasks: tasks.length,
      completedToday: tasks.filter(
        (task) => task.status === "completed" && task.dueDate === today,
      ).length,
      upcomingDeadlines: tasks.filter(
        (task) =>
          task.status !== "completed" && task.dueDate && task.dueDate >= today
      ).length,
    };

    setTaskStats(stats);
  }, [tasks]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleCreateTask = () => {
    setTaskToEdit(null);
    setIsEditOpen(true);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsEditOpen(true);
    setIsDetailOpen(false);
  };

  const handleSaveTask = async (taskData) => {
    try {
      const token = await getValidToken();
      if (!token) {
        return;
      }

      const backendTaskData = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        dueDate: taskData.dueDate,
        category: taskData.category || "general"
      };

      if (taskData.id) {
        // Update existing task
        const response = await axios.put(
          ENDPOINTS.TASKS.BY_ID(taskData.id),
          backendTaskData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const updatedTask = response.data.task;
        setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
        onTaskUpdate?.(updatedTask);
      } else {
        // Create new task
        const response = await axios.post(
          ENDPOINTS.TASKS.BASE,
          backendTaskData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const newTask = response.data.task;
        setTasks([...tasks, newTask]);
        onTaskCreate?.(newTask);
      }
      setIsEditOpen(false);
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      console.error(
        "Error saving task:",
        error.response?.data?.error || error.message
      );
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = await getValidToken();
      if (!token) {
        return;
      }

      //API CALL TO DELETE TASK
      await axios.delete(ENDPOINTS.TASKS.BY_ID(taskId), {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(tasks.filter((task) => task.id !== taskId));
      setIsDetailOpen(false);

      onTaskDelete?.(taskId);
    } catch (error) {
      console.error("This is the errror:", taskId);
      console.error("Error deleting task:", error);
    }
  };

  // Group tasks by status for Kanban view
  const todoTasks = filteredTasks.filter((task) => task.status === "todo");
  const inProgressTasks = filteredTasks.filter(
    (task) => task.status === "in-progress"
  );
  const completedTasks = filteredTasks.filter(
    (task) => task.status === "completed"
  );

  return (
    <div className="w-full">
      {/* Welcome Banner */}
      <WelcomeBanner userName={userName} stats={taskStats} />

      {/* Actions Bar */}
      <div className="mb-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex gap-2 items-center">
          <button
            onClick={handleCreateTask}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 w-full sm:w-64"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex gap-2">
            <select
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">All Time</option>
              <option value="Today">Today</option>
              <option value="Week">This Week</option>
              <option value="Month">This Month</option>
              <option value="Year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* To Do Column */}
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-700 dark:text-slate-300">
              To Do
            </h3>
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {todoTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {todoTasks.length === 0 ? (
              <div className="text-center py-6 text-gray-500 dark:text-slate-400 text-sm">
                No tasks to do
              </div>
            ) : (
              todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleTaskClick(task)}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-700 dark:text-slate-300">
              In Progress
            </h3>
            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {inProgressTasks.length === 0 ? (
              <div className="text-center py-6 text-gray-500 dark:text-slate-400 text-sm">
                No tasks in progress
              </div>
            ) : (
              inProgressTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleTaskClick(task)}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-700 dark:text-slate-300">
              Completed
            </h3>
            <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {completedTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {completedTasks.length === 0 ? (
              <div className="text-center py-6 text-gray-500 dark:text-slate-400 text-sm">
                No completed tasks
              </div>
            ) : (
              completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleTaskClick(task)}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        task={selectedTask}
        onEdit={() => handleEditTask(selectedTask)}
        onDelete={() => handleDeleteTask(selectedTask?.id)}
      />

      {/* Task Edit Modal */}
      <TaskEditDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        task={taskToEdit}
        onSave={handleSaveTask}
      />
    </div>
  );
}
