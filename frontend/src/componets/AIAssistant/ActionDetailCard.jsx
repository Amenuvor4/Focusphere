import React from "react";
import {
  Check,
  XIcon,
  Plus,
  Trash2,
  AlertCircle,
  Edit,
  Loader2,
  MoreHorizontal,
} from "lucide-react";

// Diff view component for showing before/after changes
const DiffView = ({ field, oldValue, newValue }) => {
  if (!oldValue || oldValue === newValue) return null;
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="font-medium text-gray-600 dark:text-slate-400 min-w-[70px] capitalize">
        {field.replace('_', ' ')}:
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-red-500 dark:text-red-400 line-through">
          {String(oldValue)}
        </span>
        <span className="text-green-600 dark:text-green-400">
          {String(newValue)}
        </span>
      </div>
    </div>
  );
};

const ActionDetailCard = ({
  action,
  actionNumber,
  onApprove,
  onDecline,
  onEdit,
}) => {
  const getActionIcon = () => {
    if (action.type.includes("create"))
      return <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />;
    if (action.type.includes("update"))
      return <Edit className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    if (action.type.includes("delete"))
      return <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />;
    return null;
  };

  const getActionBg = () => {
    if (action.type.includes("create"))
      return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    if (action.type.includes("update"))
      return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
    if (action.type.includes("delete"))
      return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
  };

  const getActionTitle = () => {
    if (action.type.includes("create")) return "CREATE";
    if (action.type.includes("update")) return "UPDATE";
    if (action.type.includes("delete")) return "DELETE";
    return "ACTION";
  };

  const getActionType = () => (action.type.includes("task") ? "TASK" : "GOAL");

  const getItemName = () => {
    if (action.type === 'delete_all_tasks') return 'All Tasks';
    if (action.type === 'delete_all_goals') return 'All Goals';
    return action.data?.title || action.data?.updates?.title || `Item ${actionNumber}`;
  };

  if (action.status === "approved") {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-700 rounded-xl p-4">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Check className="h-5 w-5" />
          <span className="font-semibold">
            {getItemName()}: {getActionType()}{" "}
            {getActionTitle().toLowerCase()}d successfully
          </span>
        </div>
      </div>
    );
  }

  if (action.status === "declined") {
    return (
      <div className="bg-gray-50 dark:bg-slate-800/50 border-2 border-gray-300 dark:border-slate-600 rounded-xl p-4 opacity-60">
        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
          <XIcon className="h-5 w-5" />
          <span className="font-semibold">
            {getItemName()}: Declined
          </span>
        </div>
      </div>
    );
  }

  if (action.status === "processing") {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-700 rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-semibold">
            {getItemName()}: Processing...
          </span>
        </div>
      </div>
    );
  }

  if (action.status === "failed") {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-700 rounded-xl p-4">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">{getItemName()}: Failed</p>
            <p className="text-sm">{action.error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 ${getActionBg()} rounded-xl p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
            {getActionIcon()}
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
              {getActionTitle()} {getActionType()}
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {getItemName()}
            </p>
          </div>
        </div>
        {!action.status && onEdit && (
          <button
            onClick={onEdit}
            className="p-2 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-full transition-all group"
            title="Edit AI Proposal"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-400 dark:text-slate-500 group-hover:text-gray-700 dark:group-hover:text-slate-300" />
          </button>
        )}
      </div>

      {action.type.includes("delete") && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg p-2 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-red-700 dark:text-red-300">
            <p className="font-bold">Permanent Deletion</p>
            <p>This action cannot be undone</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-700 rounded-lg p-3 space-y-2 text-sm">
        {(action.data.title || action.data.updates?.title) && (
          <div className="flex gap-2">
            <span className="font-semibold text-gray-600 dark:text-slate-400 min-w-[70px]">
              Title:
            </span>
            <span className="text-gray-900 dark:text-white font-medium">
              {action.data.title || action.data.updates?.title}
            </span>
          </div>
        )}

        {(action.data.category || action.data.updates?.category) && (
          <div className="flex gap-2 items-center">
            <span className="font-semibold text-gray-600 dark:text-slate-400 min-w-[70px]">
              Category:
            </span>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
              {action.data.category || action.data.updates?.category}
            </span>
          </div>
        )}

        {(action.data.priority || action.data.updates?.priority) && (
          <div className="flex gap-2 items-center">
            <span className="font-semibold text-gray-600 dark:text-slate-400 min-w-[70px]">
              Priority:
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                (action.data.priority || action.data.updates?.priority) ===
                "high"
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  : (action.data.priority || action.data.updates?.priority) ===
                      "medium"
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                    : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              }`}
            >
              {(
                action.data.priority || action.data.updates?.priority
              )?.toUpperCase()}
            </span>
          </div>
        )}

        {(action.data.status || action.data.updates?.status) && (
          <div className="flex gap-2 items-center">
            <span className="font-semibold text-gray-600 dark:text-slate-400 min-w-[70px]">
              Status:
            </span>
            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium capitalize">
              {action.data.status || action.data.updates?.status}
            </span>
          </div>
        )}

        {(action.data.due_date || action.data.updates?.due_date) && (
          <div className="flex gap-2">
            <span className="font-semibold text-gray-600 dark:text-slate-400 min-w-[70px]">
              Due Date:
            </span>
            <span className="text-gray-700 dark:text-slate-300">
              {new Date(
                action.data.due_date || action.data.updates?.due_date,
              ).toLocaleDateString()}
            </span>
          </div>
        )}

        {action.data.updates?.progress !== undefined && (
          <div className="flex gap-2 items-center">
            <span className="font-semibold text-gray-600 dark:text-slate-400 min-w-[70px]">
              Progress:
            </span>
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500"
                  style={{ width: `${action.data.updates.progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                {action.data.updates.progress}%
              </span>
            </div>
          </div>
        )}

        {(action.data.deadline || action.data.updates?.deadline) && (
          <div className="flex gap-2">
            <span className="font-semibold text-gray-600 dark:text-slate-400 min-w-[70px]">
              Deadline:
            </span>
            <span className="text-gray-700 dark:text-slate-300">
              {new Date(
                action.data.deadline || action.data.updates?.deadline,
              ).toLocaleDateString()}
            </span>
          </div>
        )}

        {action.type.includes("update") && action.data.updates && (
          <div className="pt-2 border-t border-gray-200 dark:border-slate-600">
            <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-2">
              Changes Preview:
            </p>
            <div className="space-y-1.5 bg-gray-50 dark:bg-slate-800 rounded p-2">
              {Object.entries(action.data.updates).map(([key, newValue]) => (
                action.data._original?.[key] !== undefined ? (
                  <DiffView
                    key={key}
                    field={key}
                    oldValue={action.data._original[key]}
                    newValue={newValue}
                  />
                ) : (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-gray-600 dark:text-slate-400 min-w-[70px] capitalize">
                      {key.replace("_", " ")}:
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      {String(newValue)}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onApprove}
          className="flex-1 bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg px-4 py-2.5 font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Check className="h-4 w-4" />
          Approve
        </button>
        <button
          onClick={onDecline}
          className="flex-1 bg-gray-300 dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-200 rounded-lg px-4 py-2.5 font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <XIcon className="h-4 w-4" />
          Decline
        </button>
      </div>
    </div>
  );
};

export default ActionDetailCard;
