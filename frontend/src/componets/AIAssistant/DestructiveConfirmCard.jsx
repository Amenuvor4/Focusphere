import React, { useState } from "react";
import { AlertCircle, Trash2 } from "lucide-react";

const DestructiveConfirmCard = ({ action, onConfirm, onCancel }) => {
  const [confirmText, setConfirmText] = useState("");
  const count = action.data?.count || 0;
  const requiresTyping = count > 5;

  return (
    <div className="border-2 border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-xl p-6 space-y-4 max-w-lg">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-500 dark:bg-red-600 rounded-lg">
          <AlertCircle className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-red-700 dark:text-red-300">
            Destructive Action Warning
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            This will permanently delete{" "}
            <strong>
              {count} item{count !== 1 ? "s" : ""}
            </strong>
            . This action cannot be undone.
          </p>
        </div>
      </div>

      {requiresTyping && (
        <div className="space-y-2">
          <p className="text-sm text-red-600 dark:text-red-400">
            Type <strong>DELETE</strong> to confirm:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="Type DELETE"
            className="w-full px-3 py-2 border-2 border-red-300 dark:border-red-700 bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onConfirm}
          disabled={requiresTyping && confirmText !== "DELETE"}
          className="flex-1 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg px-4 py-3 font-bold transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Yes, Delete All
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-200 rounded-lg px-4 py-3 font-bold transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DestructiveConfirmCard;
