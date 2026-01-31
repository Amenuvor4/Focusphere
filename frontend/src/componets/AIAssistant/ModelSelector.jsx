import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Zap, Brain } from "lucide-react";

const MODEL_OPTIONS = [
  {
    id: "gemini-1.5-flash",
    name: "Fast",
    description: "Quick responses, higher quota",
    icon: Zap,
    tier: "fast",
  },
  {
    id: "gemini-2.0-flash",
    name: "Smart",
    description: "Better reasoning, lower quota",
    icon: Brain,
    tier: "smart",
  },
];

const ModelSelector = ({
  currentModel,
  onModelChange,
  rateLimitInfo,
  tokenUsage,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedModel =
    MODEL_OPTIONS.find((m) => m.id === currentModel) || MODEL_OPTIONS[0];
  const Icon = selectedModel.icon;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine if we should show a warning
  const showWarning =
    tokenUsage?.warningLevel === "warning" ||
    tokenUsage?.warningLevel === "critical";
  const isCritical = tokenUsage?.warningLevel === "critical";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"}
          ${showWarning ? (isCritical ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400") : "text-gray-700 dark:text-slate-300"}
          ${rateLimitInfo?.isLimited ? "animate-pulse" : ""}
        `}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{selectedModel.name}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50">
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
            <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">
              AI Model
            </p>
          </div>

          {/* Model options */}
          <div className="p-1.5">
            {MODEL_OPTIONS.map((model) => {
              const ModelIcon = model.icon;
              const isSelected = model.id === currentModel;
              const isRateLimited =
                rateLimitInfo?.isLimited &&
                rateLimitInfo?.failedModel === model.id;

              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  disabled={isRateLimited}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                    ${isSelected ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800" : "hover:bg-gray-50 dark:hover:bg-slate-700/50"}
                    ${isRateLimited ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <div
                    className={`p-1.5 rounded-lg ${isSelected ? "bg-blue-100 dark:bg-blue-900/50" : "bg-gray-100 dark:bg-slate-700"}`}
                  >
                    <ModelIcon
                      className={`h-4 w-4 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-slate-400"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-sm ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"}`}
                    >
                      {model.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                      {isRateLimited
                        ? `Rate limited - ${rateLimitInfo.retryAfterSeconds}s`
                        : model.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Token usage footer */}
          {tokenUsage && (
            <div className="px-3 py-2 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-slate-400">
                  Requests today
                </span>
                <span
                  className={`font-medium ${
                    isCritical
                      ? "text-red-600 dark:text-red-400"
                      : showWarning
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-gray-700 dark:text-slate-300"
                  }`}
                >
                  {tokenUsage.requestCount} used
                </span>
              </div>
              {showWarning && (
                <p
                  className={`text-xs mt-1 ${isCritical ? "text-red-500" : "text-amber-500"}`}
                >
                  {isCritical
                    ? "Quota almost exhausted!"
                    : `~${tokenUsage.estimatedRemaining} requests remaining`}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
