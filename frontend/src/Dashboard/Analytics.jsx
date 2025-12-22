import React, { useState, useEffect } from "react";
import { BarChart3, PieChart, Calendar, ArrowUp, ArrowDown, CheckCircle2, Clock } from "lucide-react";
import { Pie, Bar } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import getValidToken from "./tokenUtils";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

export function Analytics() {
  const [timeRange, setTimeRange] = useState("Week");
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksCreated: 0,
    completionRate: 0,
    averageCompletionTime: "0 days",
    tasksByCategory: [],
    tasksByPriority: [],
    recentActivity: [],
  });
  const [previousStats, setPreviousStats] = useState({
    tasksCompleted: 0,
    tasksCreated: 0,
    completionRate: 0,
  });

  // Fetch data for the current and previous time range
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = await getValidToken();
        if (!token) {
          return;
        }
  
        // Fetch current time range data
        const currentResponse = await fetch(
          `http://localhost:5000/api/tasks/analytics?timeRange=${timeRange}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const currentData = await currentResponse.json();
        setStats(currentData);
  
        // Fetch previous time range data
        const previousTimeRange = getPreviousTimeRange(timeRange);
        const previousResponse = await fetch(
          `http://localhost:5000/api/tasks/analytics?timeRange=${previousTimeRange}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const previousData = await previousResponse.json();
        if (!previousData) {
          console.error("Error getting previousData");
        }
        setPreviousStats(previousData);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      }
    };
  
    fetchAnalytics();
  }, [timeRange]); // Re-run when timeRange changes

  // Helper function to get the previous time range
  const getPreviousTimeRange = (currentTimeRange) => {
    switch (currentTimeRange) {
      case "Week":
        return "Previous Week";
      case "Month":
        return "Previous Month";
      case "Quarter":
        return "Previous Quarter";
      case "Year":
        return "Previous Year";
      default:
        return "All Time";
    }
  };

  // Helper function to extract the numeric value from a string like "2.3 days"
  const parseCompletionTime = (timeString) => {
    if (!timeString) return 0; // Handle undefined or null
    const numericValue = parseFloat(timeString); // Extracts the numeric part
    return isNaN(numericValue) ? 0 : numericValue; // Return 0 if parsing fails
  };

  // Calculate the change for a given stat
  const calculateChange = (currentValue, previousValue) => {
    const currentNumeric = parseCompletionTime(currentValue);
    const previousNumeric = parseCompletionTime(previousValue);

    if (previousNumeric === 0) return 0; 
    return ((currentNumeric - previousNumeric) / previousNumeric) * 100;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-gray-500">Track your productivity and task management metrics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Week">This Week</option>
          <option value="Month">This Month</option>
          <option value="Quarter">This Quarter</option>
          <option value="Year">This Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Tasks Completed"
          value={stats.tasksCompleted}
          change={calculateChange(stats.tasksCompleted, previousStats.tasksCompleted)}
          timeRange={timeRange}
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          title="Tasks Created"
          value={stats.tasksCreated}
          change={calculateChange(stats.tasksCreated, previousStats.tasksCreated)}
          timeRange={timeRange}
          icon={<Plus className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate.toFixed(2)}%`}
          change={calculateChange(stats.completionRate, previousStats.completionRate)}
          timeRange={timeRange}
          icon={<BarChart3 className="h-5 w-5 text-purple-500" />}
        />
        <StatCard
          title="Avg. Completion Time"
          value={stats.averageCompletionTime}
          change={calculateChange(stats.averageCompletionTime, previousStats.averageCompletionTime)}
          timeRange={timeRange}
          icon={<Clock className="h-5 w-5 text-orange-500" />}
        />
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
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
        </div>
        <div className="divide-y">
          {stats.recentActivity.map((activity, index) => (
            <div key={index} className="p-4 flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                  activity.type === "completed"
                    ? "bg-green-100"
                    : activity.type === "created"
                    ? "bg-blue-100"
                    : "bg-yellow-100"
                }`}
              >
                {activity.type === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : activity.type === "created" ? (
                  <Plus className="h-4 w-4 text-blue-600" />
                ) : (
                  <Calendar className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    <span className="capitalize">{activity.type}</span> task: {activity.task}
                  </p>
                  <span className="text-sm text-gray-500">{activity.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// StatCard Component
function StatCard({ title, value, change, icon, timeRange }) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        <div className="mt-1 flex items-center text-sm">
          <span className={`flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
            {Math.abs(change.toFixed(2))}%
          </span>
          <span className="text-gray-500 ml-1">vs previous {timeRange}</span>
        </div>
      </div>
    </div>
  );
}

// ChartCard Component
function ChartCard({ title, icon, data, type }) {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: type === "pie" ? "Percentage" : "Count",
        data: type === "pie" ? data.map((item) => item.percentage) : data.map((item) => item.count),
        backgroundColor: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"], // Blue, Green, Purple, Yellow
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </h2>
        </div>
      </div>
      <div className="p-4">
        <div className="h-64">
          {type === "pie" ? (
            <Pie data={chartData} options={options} />
          ) : (
            <Bar data={chartData} options={options} />
          )}
        </div>
      </div>
    </div>
  );
}

// Simple Plus icon component
function Plus({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

export default Analytics;