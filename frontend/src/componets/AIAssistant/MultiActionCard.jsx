import React, { useState } from "react";
import {
  Check,
  XIcon,
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ActionDetailCard from "./ActionDetailCard.jsx";

const MultiActionCard = ({
  actions,
  onApprove,
  onDecline,
  onIndividualApprove,
  onIndividualDecline,
  onIndividualEdit,
}) => {
  const [showAll, setShowAll] = useState(false);

  const allProcessing = actions.every((a) => a.status === "processing");
  const allApproved = actions.every((a) => a.status === "approved");
  const allDeclined = actions.every((a) => a.status === "declined");

  const visibleActions = showAll ? actions : actions.slice(0, 3);
  const hasMore = actions.length > 3;
  const hiddenCount = actions.length - 3;
  const hasPendingActions = actions.some((action) => !action.status);

  if (allApproved) {
    return (
      <div className="border-2 border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded-xl p-5">
        <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
          <Check className="h-6 w-6" />
          <div>
            <p className="font-semibold text-lg">All actions completed!</p>
            <p className="text-sm">
              Successfully executed {actions.length} action
              {actions.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (allDeclined) {
    return (
      <div className="border-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 opacity-60">
        <div className="flex items-center gap-3 text-gray-600 dark:text-slate-400">
          <XIcon className="h-6 w-6" />
          <div>
            <p className="font-semibold text-lg">All actions declined</p>
            <p className="text-sm">No changes were made</p>
          </div>
        </div>
      </div>
    );
  }

  if (allProcessing) {
    return (
      <div className="border-2 border-blue-500 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 animate-pulse">
        <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
          <Loader2 className="h-6 w-6 animate-spin" />
          <div>
            <p className="font-semibold text-lg">Processing...</p>
            <p className="text-sm">
              Executing {actions.length} action{actions.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 space-y-4 max-w-3xl">
      <div className="flex items-center gap-3 pb-4 border-b border-blue-200 dark:border-blue-800">
        <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg">
          <Plus className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {actions.length} Action{actions.length > 1 ? "s" : ""} Ready to
            Execute
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Review each action carefully before approving
          </p>
        </div>
      </div>

      <div
        className={`space-y-3 ${showAll ? "max-h-[500px] overflow-y-auto pr-2" : ""}`}
      >
        {visibleActions.map((action, idx) => (
          <ActionDetailCard
            key={idx}
            action={action}
            actionNumber={idx + 1}
            onApprove={() => onIndividualApprove(idx)}
            onDecline={() => onIndividualDecline(idx)}
            onEdit={() => onIndividualEdit?.(idx)}
          />
        ))}
      </div>

      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <ChevronDown className="h-5 w-5" />
          Show {hiddenCount} More Action{hiddenCount > 1 ? "s" : ""}
        </button>
      )}

      {showAll && hasMore && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <ChevronUp className="h-5 w-5" />
          Show Less
        </button>
      )}

      {hasPendingActions && !showAll && (
        <div className="flex gap-3 pt-4 border-t border-blue-200 dark:border-blue-800">
          <button
            onClick={onApprove}
            className="flex-1 bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white rounded-xl px-6 py-4 font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Check className="h-5 w-5" />
            Approve All ({actions.length})
          </button>
          <button
            onClick={onDecline}
            className="flex-1 bg-gray-400 dark:bg-slate-600 hover:bg-gray-500 dark:hover:bg-slate-500 text-white rounded-xl px-6 py-4 font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <XIcon className="h-5 w-5" />
            Decline All
          </button>
        </div>
      )}
    </div>
  );
};

export default MultiActionCard;
