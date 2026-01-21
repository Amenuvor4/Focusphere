import { useState, useMemo } from "react";
import {
  X,
  CheckCircle2,
  Clock,
  Calendar,
  Filter,
  Plus,
  RefreshCw,
  ArrowRight,
  Tag,
  AlertCircle,
  Flag,
} from "lucide-react";

const ACTIVITY_CONFIG = {
  completed: {
    label: "Completed",
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    icon: CheckCircle2,
  },
  created: {
    label: "Created",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    icon: Plus,
  },
  "status-change": {
    label: "Status Changed",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
    icon: ArrowRight,
  },
  "priority-change": {
    label: "Priority Changed",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
    icon: Flag,
  },
  updated: {
    label: "Updated",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
    icon: RefreshCw,
  },
  overdue: {
    label: "Overdue",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    icon: AlertCircle,
  },
};

function ActivityRow({ activity }) {
  const config = ACTIVITY_CONFIG[activity.type] || ACTIVITY_CONFIG.updated;
  const ActivityIcon = config.icon;

  return (
    <div className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-100 dark:border-slate-700/50 last:border-b-0">
      {/* Activity Icon */}
      <div className={`flex-shrink-0 p-2 rounded-full ${config.bg}`}>
        <ActivityIcon className={`h-4 w-4 ${config.text}`} />
      </div>

      {/* Activity Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
          >
            {config.label}
          </span>
          {activity.category && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
              <Tag className="h-3 w-3" />
              {activity.category}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
          {activity.task}
        </p>
        {activity.description && (
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            {activity.description}
          </p>
        )}
      </div>

      {/* Date */}
      <div className="flex-shrink-0 flex items-center gap-1 text-right">
        <Calendar className="h-3 w-3 text-gray-400 dark:text-slate-500" />
        <span className="text-xs text-gray-500 dark:text-slate-400">
          {activity.date}
        </span>
      </div>
    </div>
  );
}

export default function AllActivityModal({
  isOpen,
  onClose,
  activities,
  timeRange,
}) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");


  const categories = useMemo(() => {
    const cats = new Set(activities.map((a) => a.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesType = typeFilter === "all" || activity.type === typeFilter;
      const matchesCategory =
        categoryFilter === "all" || activity.category === categoryFilter;
      const matchesPriority =
        priorityFilter === "all" || activity.priority === priorityFilter;
      return matchesType && matchesCategory && matchesPriority;
    });
  }, [activities, typeFilter, categoryFilter, priorityFilter]);

  const activityCounts = useMemo(() => {
    return {
      all: activities.length,
      completed: activities.filter((a) => a.type === "completed").length,
      created: activities.filter((a) => a.type === "created").length,
      "status-change": activities.filter((a) => a.type === "status-change")
        .length,
      "priority-change": activities.filter((a) => a.type === "priority-change")
        .length,
      updated: activities.filter((a) => a.type === "updated").length,
      overdue: activities.filter((a) => a.type === "overdue").length,
    };
  }, [activities]);

  const clearFilters = () => {
    setTypeFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
  };

  const hasActiveFilters =
    typeFilter !== "all" ||
    categoryFilter !== "all" ||
    priorityFilter !== "all";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              All Activity
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {timeRange} - {filteredActivities.length} of {activityCounts.all}{" "}
              activities
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Activity Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm px-3 py-1.5 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types ({activityCounts.all})</option>
              <option value="created">
                Created ({activityCounts.created})
              </option>
              <option value="completed">
                Completed ({activityCounts.completed})
              </option>
              <option value="status-change">
                Status Changed ({activityCounts["status-change"]})
              </option>
              <option value="priority-change">
                Priority Changed ({activityCounts["priority-change"]})
              </option>
              <option value="updated">
                Updated ({activityCounts.updated})
              </option>
              <option value="overdue">
                Overdue ({activityCounts.overdue})
              </option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm px-3 py-1.5 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-sm px-3 py-1.5 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity, index) => (
              <ActivityRow
                key={`${activity.task}-${index}`}
                activity={activity}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-slate-400">
              <Clock className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No activity matches your filters</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-gray-600 dark:text-slate-400">
                {activityCounts.created} created
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-gray-600 dark:text-slate-400">
                {activityCounts.completed} completed
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="text-gray-600 dark:text-slate-400">
                {activityCounts["status-change"]} status changes
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span className="text-gray-600 dark:text-slate-400">
                {activityCounts["priority-change"]} priority changes
              </span>
            </span>
            {activityCounts.overdue > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-gray-600 dark:text-slate-400">
                  {activityCounts.overdue} overdue
                </span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
