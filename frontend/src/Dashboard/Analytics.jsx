import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart3,
  PieChart,
  Calendar,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  Plus,
} from "lucide-react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import getValidToken from "../config/tokenUtils";
import { ENDPOINTS } from "../config/api.js";
import { AnalyticsSkeleton } from "../componets/AnalyticsSkeleton.jsx";
import AllActivityModal from "../componets/AllTasksModal.jsx";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

const TIME_RANGE_MAP = {
  Week: "Previous Week",
  Month: "Previous Month",
  Quarter: "Previous Quarter",
  Year: "Previous Year",
};

const CHART_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

const initialStats = {
  tasksCompleted: 0,
  tasksCreated: 0,
  completionRate: 0,
  averageCompletionTime: "0 days",
  tasksByCategory: [],
  tasksByPriority: [],
  recentActivity: [],
};

const STATUS_LABELS = {
  todo: "To Do",
  "in-progress": "In Progress",
  completed: "Completed",
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Generate detailed activities from tasks
const generateActivities = (tasks) => {
  const activities = [];
  const now = new Date();

  tasks.forEach((task) => {
    const createdAt = new Date(task.createdAt);
    const updatedAt = new Date(task.updatedAt);
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const wasUpdated = updatedAt.getTime() - createdAt.getTime() > 1000; // More than 1 second difference

    // Created activity
    activities.push({
      type: "created",
      task: task.title,
      description: `New task added to ${task.category || "Uncategorized"} with ${task.priority} priority`,
      date: formatDate(createdAt),
      timestamp: createdAt.getTime(),
      category: task.category,
      priority: task.priority,
    });

    // Completed activity (if completed)
    if (task.status === "completed") {
      activities.push({
        type: "completed",
        task: task.title,
        description: `Task marked as completed`,
        date: formatDate(updatedAt),
        timestamp: updatedAt.getTime(),
        category: task.category,
        priority: task.priority,
      });
    }

    // Status change activity (if in-progress and was updated)
    if (task.status === "in-progress" && wasUpdated) {
      activities.push({
        type: "status-change",
        task: task.title,
        description: `Status changed to ${STATUS_LABELS[task.status]}`,
        date: formatDate(updatedAt),
        timestamp: updatedAt.getTime(),
        category: task.category,
        priority: task.priority,
      });
    }

    // Updated activity (if updated but not completed or status change)
    if (wasUpdated && task.status === "todo") {
      activities.push({
        type: "updated",
        task: task.title,
        description: `Task details were modified`,
        date: formatDate(updatedAt),
        timestamp: updatedAt.getTime(),
        category: task.category,
        priority: task.priority,
      });
    }

    // Overdue activity (if past due and not completed)
    if (dueDate && dueDate < now && task.status !== "completed") {
      activities.push({
        type: "overdue",
        task: task.title,
        description: `Task is overdue (was due ${formatDate(dueDate)})`,
        date: formatDate(dueDate),
        timestamp: dueDate.getTime(),
        category: task.category,
        priority: task.priority,
      });
    }
  });

  // Sort by timestamp descending (most recent first)
  return activities.sort((a, b) => b.timestamp - a.timestamp);
};

export function Analytics() {
  const [timeRange, setTimeRange] = useState("Week");
  const [stats, setStats] = useState(initialStats);
  const [previousStats, setPreviousStats] = useState(initialStats);
  const [allActivities, setAllActivities] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setIsFetching(true);
    try {
      const token = await getValidToken();
      if (!token) return;

      const previousTimeRange = TIME_RANGE_MAP[timeRange] || "All Time";

      // Fetch current stats, previous stats, and all tasks in parallel
      const [currentRes, previousRes, tasksRes] = await Promise.all([
        fetch(`${ENDPOINTS.TASKS.ANALYTICS}?timeRange=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${ENDPOINTS.TASKS.ANALYTICS}?timeRange=${previousTimeRange}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(ENDPOINTS.TASKS.BASE, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [currentData, previousData, tasksData] = await Promise.all([
        currentRes.json(),
        previousRes.json(),
        tasksRes.json(),
      ]);

      setStats(currentData);
      setPreviousStats(previousData || initialStats);

      // Transform tasks to detailed activities for modal display
      const activities = generateActivities(tasksData || []);
      setAllActivities(activities);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setTimeout(() => setIsFetching(false), 300);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const calculateChange = useCallback((current, previous) => {
    const currentNum =
      typeof current === "string" ? parseFloat(current) || 0 : current;
    const previousNum =
      typeof previous === "string" ? parseFloat(previous) || 0 : previous;
    if (previousNum === 0) return 0;
    return ((currentNum - previousNum) / previousNum) * 100;
  }, []);

  const statCards = useMemo(
    () => [
      {
        title: "Tasks Completed",
        value: stats.tasksCompleted,
        change: calculateChange(
          stats.tasksCompleted,
          previousStats.tasksCompleted,
        ),
        icon: (
          <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
        ),
      },
      {
        title: "Tasks Created",
        value: stats.tasksCreated,
        change: calculateChange(stats.tasksCreated, previousStats.tasksCreated),
        icon: <Plus className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
      },
      {
        title: "Completion Rate",
        value: `${(stats.completionRate || 0).toFixed(1)}%`,
        change: calculateChange(
          stats.completionRate,
          previousStats.completionRate,
        ),
        icon: (
          <BarChart3 className="h-5 w-5 text-purple-500 dark:text-purple-400" />
        ),
      },
      {
        title: "Avg. Completion Time",
        value: stats.averageCompletionTime,
        change: calculateChange(
          stats.averageCompletionTime,
          previousStats.averageCompletionTime,
        ),
        icon: (
          <Clock className="h-5 w-5 text-orange-500 dark:text-orange-400" />
        ),
      },
    ],
    [stats, previousStats, calculateChange],
  );

  if (isFetching) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-500 dark:text-slate-400">
            Track your productivity and task management metrics
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          <option value="Week">This Week</option>
          <option value="Month">This Month</option>
          <option value="Quarter">This Quarter</option>
          <option value="Year">This Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} timeRange={timeRange} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Tasks by Category"
          icon={<PieChart className="h-5 w-5" />}
          data={stats.tasksByCategory}
          type="pie"
        />
        <ChartCard
          title="Tasks by Priority"
          icon={<BarChart3 className="h-5 w-5" />}
          data={stats.tasksByPriority}
          type="bar"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
            >
              View All
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-slate-400">
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* All Activity Modal */}
      <AllActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activities={allActivities}
        timeRange={`This ${timeRange}`}
      />
    </div>
  );
}

function ActivityItem({ activity }) {
  const isCompleted = activity.type === "completed";
  const isCreated = activity.type === "created";

  return (
    <div className="p-4 flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
          isCompleted
            ? "bg-green-100 dark:bg-green-900/30"
            : isCreated
              ? "bg-blue-100 dark:bg-blue-900/30"
              : "bg-yellow-100 dark:bg-yellow-900/30"
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : isCreated ? (
          <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900 dark:text-white">
            <span className="capitalize">{activity.type}</span> task:{" "}
            {activity.task}
          </p>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            {activity.date}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon, timeRange }) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">
          {title}
        </h3>
        {icon}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        <div className="mt-1 flex items-center text-sm">
          <span
            className={`flex items-center ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {isPositive ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1" />
            )}
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-gray-500 dark:text-slate-400 ml-1">
            vs previous {timeRange}
          </span>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, icon, data, type }) {
  const isDarkMode =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const chartData = useMemo(
    () => ({
      labels: data.map((item) => item.name),
      datasets: [
        {
          label: type === "pie" ? "Percentage" : "Count",
          data: data.map((item) =>
            type === "pie" ? item.percentage : item.count,
          ),
          backgroundColor: CHART_COLORS,
          borderWidth: 0,
        },
      ],
    }),
    [data, type],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: isDarkMode ? "#e2e8f0" : "#374151",
          },
        },
      },
      scales:
        type === "bar"
          ? {
              y: {
                ticks: { color: isDarkMode ? "#94a3b8" : "#6b7280" },
                grid: { color: isDarkMode ? "#334155" : "#e5e7eb" },
              },
              x: {
                ticks: { color: isDarkMode ? "#94a3b8" : "#6b7280" },
                grid: { color: isDarkMode ? "#334155" : "#e5e7eb" },
              },
            }
          : undefined,
    }),
    [type, isDarkMode],
  );

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </h2>
        </div>
      </div>
      <div className="p-4">
        <div className="h-64">
          {data.length > 0 ? (
            type === "pie" ? (
              <Pie data={chartData} options={options} />
            ) : (
              <Bar data={chartData} options={options} />
            )
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-slate-400">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
