import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  X,
  Send,
  Loader2,
  Sparkles,
  Check,
  XIcon,
  Plus,
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  User,
} from "lucide-react";
import { ENDPOINTS } from "../config/api.js";
import { TaskEditDialog } from "../Dashboard/TaskEditDialog.jsx";
import { AIChatWidgetSkeleton } from "./AIChatWidgetSkeleton.jsx";

const AIChatWidget = ({
  conversations,
  currentConversationId,
  setCurrentConversationId,
  createNewConversation,
  deleteConversation,
  updateConversation,
  getCurrentConversation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const conversation = getCurrentConversation();
  const messages = useMemo(() => conversation?.messages || [], [conversation]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingInfo, setEditingInfo] = useState({
    messageIndex: null,
    actionIndex: null,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch smart suggestions when widget opens
  const fetchSmartSuggestions = useCallback(async () => {
    try {
      setSuggestionsLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(ENDPOINTS.AI.SMART_SUGGESTIONS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSmartSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Failed to fetch smart suggestions:", error);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Simulate initial load time for widget
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Fetch suggestions when widget opens and no messages exist
  useEffect(() => {
    if (isOpen && !isInitializing && messages.length === 0) {
      fetchSmartSuggestions();
    }
  }, [isOpen, isInitializing, messages.length, fetchSmartSuggestions]);

  const getValidToken = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      return token || null;
    } catch (error) {
      console.error("Token error:", error);
      return null;
    }
  };

  // Execute approved action using the new backend endpoint
  const executeAction = async (action) => {
    try {
      const token = await getValidToken();
      if (!token) throw new Error("Not authenticated");

      // Use the new execute-actions endpoint for single action
      const response = await fetch(ENDPOINTS.AI.EXECUTE_ACTIONS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ actions: [action] }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Action failed");
      }

      const result = await response.json();
      // Check if the single action succeeded
      if (result.results && result.results[0]) {
        return result.results[0];
      }
      return { success: result.success };
    } catch (error) {
      console.error("Action execution error:", error);
      return { success: false, error: error.message };
    }
  };

  // Execute multiple actions using the new backend endpoint
  const executeActions = async (actions) => {
    try {
      const token = await getValidToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(ENDPOINTS.AI.EXECUTE_ACTIONS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ actions }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Actions failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Actions execution error:", error);
      return { success: false, error: error.message, results: [] };
    }
  };

  // Handle action approval
  const handleActionApproval = async (messageIndex, actionIndex, approved) => {
    const message = messages[messageIndex];
    if (!message.suggestedActions || !message.suggestedActions[actionIndex])
      return;

    const action = message.suggestedActions[actionIndex];

    const updatedMessages = [...messages];
    updatedMessages[messageIndex].suggestedActions[actionIndex].status =
      approved ? "processing" : "declined";
    updateConversation({ messages: updatedMessages });

    if (approved) {
      const result = await executeAction(action);

      updatedMessages[messageIndex].suggestedActions[actionIndex].status =
        result.success ? "approved" : "failed";
      updatedMessages[messageIndex].suggestedActions[actionIndex].error =
        result.error;
      updateConversation({ messages: updatedMessages });

      if (result.success) {
        const actionName = action.type.includes("create")
          ? "created"
          : action.type.includes("update")
            ? "updated"
            : action.type.includes("delete")
              ? "deleted"
              : "completed";
        const itemType = action.type.includes("task") ? "task" : "goal";

        const confirmMessage = {
          role: "assistant",
          content: `✅ Perfect! I've ${actionName} the ${itemType} successfully. Check your dashboard!`,
        };
        updateConversation([...messages, confirmMessage]);
      } else {
        const errorMessage = {
          role: "assistant",
          content: `❌ Oops! I couldn't complete that action: ${result.error}. Please try again.`,
        };
        updateConversation([...messages, errorMessage]);
      }
    } else {
      updateConversation({ messages: updatedMessages });
      const declineMessage = {
        role: "assistant",
        content:
          "No worries! I've cancelled that action. Ask me anything else! 😊",
      };
      updateConversation([...messages, declineMessage]);
    }
  };

  // Handle bulk approval (all actions)
  const handleBulkApproval = async (messageIndex, approved) => {
    const message = messages[messageIndex];
    if (!message.suggestedActions) return;

    const updatedMessages = [...messages];

    // Mark all as processing or declined
    updatedMessages[messageIndex].suggestedActions =
      message.suggestedActions.map((action) => ({
        ...action,
        status: approved ? "processing" : "declined",
      }));
    updateConversation({ messages: updatedMessages });

    if (approved) {
      // Execute all actions using the new bulk endpoint
      const executionResult = await executeActions(message.suggestedActions);
      const results = executionResult.results || [];

      // Update statuses
      updatedMessages[messageIndex].suggestedActions =
        message.suggestedActions.map((action, idx) => ({
          ...action,
          status: results[idx]?.success ? "approved" : "failed",
          error: results[idx]?.error,
        }));
      updateConversation({ messages: updatedMessages });

      // Add confirmation using the backend's formatted message
      const confirmMessage = {
        role: "assistant",
        content: executionResult.message ||
          (executionResult.summary?.failed === 0
            ? `✅ All ${executionResult.summary?.succeeded || results.length} actions completed successfully!`
            : `⚠️ Completed ${executionResult.summary?.succeeded || 0} of ${executionResult.summary?.total || results.length} actions.`),
      };
      updateConversation({ messages: [...updatedMessages, confirmMessage] });
    } else {
      updateConversation({ messages: updatedMessages });
      const declineMessage = {
        role: "assistant",
        content:
          "No problem! All actions cancelled. I'm here if you need anything else!",
      };
      updateConversation({ messages: [...updatedMessages, declineMessage] });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    const isFirstMessage = messages.length === 0;
    setInputMessage("");

    const newMessages = [...messages, { role: "user", content: userMessage }];
    updateConversation({ messages: newMessages });
    setIsLoading(true);

    try {
      const token = await getValidToken();
      if (!token) throw new Error("Not authenticated");

      // Token overload prevention
      const recentHistory = newMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(ENDPOINTS.AI.CHAT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: recentHistory,
          isNewChat: isFirstMessage,
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();

      // Handle auto-executed actions (from confirmation flow)
      const aiMessage = {
        role: "assistant",
        content: data.response.message,
        suggestedActions: data.response.suggestedActions || [],
        // Mark if this was from a confirmation
        wasConfirmation: data.wasConfirmation || false,
        wasDecline: data.wasDecline || false,
        executedActions: data.response.executedActions || null,
      };

      // Update conversation with messages and title if it's a new chat
      const updates = { messages: [...newMessages, aiMessage] };
      if (isFirstMessage && data.suggestedTitle) {
        updates.title = data.suggestedTitle;
      }

      updateConversation(updates);
    } catch (error) {
      console.error("AI chat error:", error);
      updateConversation({
        messages: [
          ...newMessages,
          {
            role: "assistant",
            content: "Sorry, I'm having trouble right now. Please try again.",
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-send when clicking a suggestion card
  const handleSuggestionClick = async (prompt) => {
    if (isLoading) return;

    const isFirstMessage = messages.length === 0;
    const newMessages = [...messages, { role: "user", content: prompt }];
    updateConversation({ messages: newMessages });
    setIsLoading(true);

    try {
      const token = await getValidToken();
      if (!token) throw new Error("Not authenticated");

      const recentHistory = newMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(ENDPOINTS.AI.CHAT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: prompt,
          conversationHistory: recentHistory,
          isNewChat: isFirstMessage,
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();

      const aiMessage = {
        role: "assistant",
        content: data.response.message,
        suggestedActions: data.response.suggestedActions || [],
        wasConfirmation: data.wasConfirmation || false,
        wasDecline: data.wasDecline || false,
        executedActions: data.response.executedActions || null,
      };

      const updates = { messages: [...newMessages, aiMessage] };
      if (isFirstMessage && data.suggestedTitle) {
        updates.title = data.suggestedTitle;
      }
      updateConversation(updates);
    } catch (error) {
      console.error("AI chat error:", error);
      updateConversation({
        messages: [
          ...newMessages,
          {
            role: "assistant",
            content: "Sorry, I'm having trouble right now. Please try again.",
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (msgIdx, actIdx) => {
    setEditingInfo({ messageIndex: msgIdx, actionIndex: actIdx });
    setIsEditModalOpen(true);
  };

  const handleEditSave = (updateData) => {
    const { messageIndex, actionIndex } = editingInfo;
    const updatedMessages = [...messages];

    updatedMessages[messageIndex].suggestedActions[actionIndex].data =
      updateData;
    setIsEditModalOpen(false);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {isOpen && isInitializing && <AIChatWidgetSkeleton />}

      {isOpen && !isInitializing && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[420px] flex-col rounded-lg bg-white dark:bg-slate-800 shadow-2xl border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">Focusphere AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-white dark:bg-slate-800/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Welcome Screen - Show when no messages */}
            {messages.length === 0 && !isLoading ? (
              /* Welcome Section - Matches Skeleton Layout */
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                {/* Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>

                {/* Title and Description */}
                <div className="text-center space-y-1 w-full">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                    Focusphere AI
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    How can I help you today?
                  </p>
                </div>

                {/* Suggestion Cards - 2x2 Grid */}
                <div className="grid grid-cols-2 gap-2 w-full">
                  {suggestionsLoading ? (
                    // Loading skeleton for suggestions
                    <>
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="bg-gray-100 dark:bg-slate-700/50 border-2 border-gray-200 dark:border-slate-700 rounded-lg p-3 space-y-1.5 animate-pulse"
                        >
                          <div className="h-4 w-20 bg-gray-200 dark:bg-slate-600 rounded" />
                          <div className="h-3 w-full bg-gray-200 dark:bg-slate-600 rounded" />
                        </div>
                      ))}
                    </>
                  ) : (
                    (smartSuggestions.length > 0
                      ? smartSuggestions
                      : [
                          {
                            title: "Create my tasks",
                            description: "Generate 5 tasks for today",
                            prompt:
                              "Create 5 productive tasks for me to work on today",
                          },
                          {
                            title: "Set a new goal",
                            description: "Help me define a goal",
                            prompt:
                              "Help me create a SMART goal for improving my productivity this month",
                          },
                          {
                            title: "Review progress",
                            description: "Analyze my tasks",
                            prompt:
                              "Analyze my current tasks and goals, and give me a progress summary",
                          },
                          {
                            title: "Plan schedule",
                            description: "Organize priorities",
                            prompt:
                              "Help me prioritize and organize my pending tasks for maximum productivity",
                          },
                        ]
                    ).map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion.prompt)}
                        disabled={isLoading}
                        className="bg-gray-100 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 rounded-lg p-3 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <p className="font-semibold text-sm text-gray-800 dark:text-white mb-0.5">
                          {suggestion.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">
                          {suggestion.description}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Conversation Messages */
              <div className="space-y-4">
                {messages.map((message, messageIndex) => (
                  <div key={messageIndex} className="space-y-3">
                    <div className="flex gap-3">
                      <div
                        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                          message.role === "user"
                            ? "bg-blue-600 dark:bg-blue-500"
                            : "bg-gradient-to-br from-blue-500 to-purple-600"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                          {message.role === "user" ? "You" : "Focusphere AI"}
                        </p>
                        <p className="text-sm text-gray-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>

                    {/* Executed Actions Indicator (from confirmation flow) */}
                    {message.executedActions && message.executedActions.length > 0 && (
                      <div className="ml-10">
                        <div className="border-2 border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <Check className="h-5 w-5" />
                            <span className="font-medium">
                              {message.executedActions.filter(a => a.success).length} action{message.executedActions.filter(a => a.success).length !== 1 ? 's' : ''} executed successfully!
                            </span>
                          </div>
                          {message.executedActions.some(a => !a.success) && (
                            <div className="mt-2 text-red-600 dark:text-red-400 text-sm">
                              {message.executedActions.filter(a => !a.success).length} action{message.executedActions.filter(a => !a.success).length !== 1 ? 's' : ''} failed
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Container - Single or Multiple */}
                    {message.suggestedActions &&
                      message.suggestedActions.length > 0 &&
                      (message.suggestedActions.length === 1 ? (
                        // Single action - show normally
                        <div className="ml-10">
                          <ActionCard
                            action={message.suggestedActions[0]}
                            onApprove={() =>
                              handleActionApproval(messageIndex, 0, true)
                            }
                            onDecline={() =>
                              handleActionApproval(messageIndex, 0, false)
                            }
                          />
                        </div>
                      ) : (
                        // Multiple actions - show collapsible
                        <div className="ml-10">
                          <MultiActionCard
                            actions={message.suggestedActions}
                            onApprove={() =>
                              handleBulkApproval(messageIndex, true)
                            }
                            onDecline={() =>
                              handleBulkApproval(messageIndex, false)
                            }
                            onIndividualApprove={(idx) =>
                              handleActionApproval(messageIndex, idx, true)
                            }
                            onIndividualDecline={(idx) =>
                              handleActionApproval(messageIndex, idx, false)
                            }
                            onIndividualEdit={(aIdx) =>
                              openEditModal(messageIndex, aIdx)
                            }
                          />
                        </div>
                      ))}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                        Focusphere AI
                      </p>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-gray-600 dark:text-slate-400">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-900/50">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message Focusphere AI..."
                disabled={isLoading}
                className="flex-1 rounded-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 rounded-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 text-center">
              💡 Try: "Create 5 tasks" • "Show overdue tasks" • "Delete
              completed"
            </p>
          </div>
        </div>
      )}

      <TaskEditDialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={
          editingInfo.messageIndex !== null
            ? messages[editingInfo.messageIndex].suggestedActions[
                editingInfo.actionIndex
              ].data
            : null
        }
        onSave={handleEditSave}
      />
    </>
  );
};

// Multi-Action Card with Collapsible View
const MultiActionCard = ({
  actions,
  onApprove,
  onDecline,
  onIndividualApprove,
  onIndividualDecline,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check statuses
  const allProcessing = actions.every((a) => a.status === "processing");
  const allApproved = actions.every((a) => a.status === "approved");
  const allDeclined = actions.every((a) => a.status === "declined");
  const someFailed = actions.some((a) => a.status === "failed");

  if (allApproved) {
    return (
      <div className="border-2 border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Check className="h-5 w-5" />
          <span className="font-medium">
            All {actions.length} actions completed!
          </span>
        </div>
      </div>
    );
  }

  if (allDeclined) {
    return (
      <div className="border-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 opacity-60">
        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
          <XIcon className="h-5 w-5" />
          <span className="font-medium">All actions declined</span>
        </div>
      </div>
    );
  }

  if (allProcessing) {
    return (
      <div className="border-2 border-blue-500 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 animate-pulse">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">
            Processing {actions.length} actions...
          </span>
        </div>
      </div>
    );
  }

  if (someFailed) {
    return (
      <div className="border-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 opacity-60">
        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
          <XIcon className="h-5 w-5" />
          <span className="font-medium">Some actions failed</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white dark:bg-slate-700 rounded-md">
            <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            {actions.length} Actions Ready
          </span>
        </div>
        <button className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-600 dark:text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600 dark:text-slate-400" />
          )}
        </button>
      </div>

      {/* Summary (Always Visible) */}
      <div className="bg-white dark:bg-slate-700 rounded-lg p-3 text-sm">
        <div className="space-y-1">
          {actions.slice(0, 3).map((action, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-gray-700 dark:text-slate-300"
            >
              <span className="text-gray-400 dark:text-slate-500">•</span>
              <span className="truncate">
                {action.type.includes("create") && "🆕"}
                {action.type.includes("update") && "✏️"}
                {action.type.includes("delete") && "🗑️"}{" "}
                {action.type === "delete_all_tasks" ? "Delete all tasks" :
                 action.type === "delete_all_goals" ? "Delete all goals" :
                 action.data.title || action.data.updates?.title || "Task"}
              </span>
            </div>
          ))}
          {actions.length > 3 && (
            <div className="text-gray-500 dark:text-slate-400 text-xs">
              +{actions.length - 3} more...
            </div>
          )}
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {actions.map((action, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-gray-200 dark:border-slate-600"
            >
              <ActionPreview action={action} />
              {!action.status && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onIndividualApprove(idx)}
                    className="flex-1 bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white rounded px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onIndividualDecline(idx)}
                    className="flex-1 bg-gray-300 dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-200 rounded px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    Decline
                  </button>
                </div>
              )}
              {action.status === "approved" && (
                <div className="text-green-600 dark:text-green-400 text-xs mt-2 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Completed
                </div>
              )}
              {action.status === "failed" && (
                <div className="text-red-600 dark:text-red-400 text-xs mt-2">
                  Failed: {action.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bulk Actions (if not expanded) */}
      {!isExpanded && (
        <div className="flex gap-2 pt-2">
          <button
            onClick={onApprove}
            className="flex-1 bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white rounded-md px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" />
            Accept All
          </button>
          <button
            onClick={onDecline}
            className="flex-1 bg-gray-300 dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-200 rounded-md px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <XIcon className="h-4 w-4" />
            Decline All
          </button>
        </div>
      )}
    </div>
  );
};

// Single Action Card
const ActionCard = ({ action, onApprove, onDecline }) => {
  const getActionIcon = () => {
    if (action.type.includes("create"))
      return <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />;
    if (action.type.includes("update"))
      return <Edit className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    if (action.type.includes("delete"))
      return <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />;
    return null;
  };

  const getActionColor = () => {
    if (action.type.includes("create"))
      return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20";
    if (action.type.includes("update"))
      return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20";
    if (action.type.includes("delete"))
      return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20";
    return "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20";
  };

  const getActionTitle = () => {
    const typeMap = {
      create_task: "🆕 Create Task",
      update_task: "✏️ Update Task",
      delete_task: "🗑️ Delete Task",
      delete_all_tasks: "🗑️ Delete All Tasks",
      create_goal: "🎯 Create Goal",
      update_goal: "✏️ Update Goal",
      delete_goal: "❌ Delete Goal",
      delete_all_goals: "🗑️ Delete All Goals",
    };
    return typeMap[action.type] || "Action";
  };

  if (action.status === "approved") {
    return (
      <div className="border-2 border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Check className="h-5 w-5" />
          <span className="font-medium">✅ Completed!</span>
        </div>
      </div>
    );
  }

  if (action.status === "declined") {
    return (
      <div className="border-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 opacity-60">
        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
          <XIcon className="h-5 w-5" />
          <span className="font-medium">Declined</span>
        </div>
      </div>
    );
  }

  if (action.status === "processing") {
    return (
      <div className="border-2 border-blue-500 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 animate-pulse">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">Processing...</span>
        </div>
      </div>
    );
  }

  if (action.status === "failed") {
    return (
      <div className="border-2 border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertCircle className="h-5 w-5" />
          <div>
            <div className="font-medium">Failed</div>
            <div className="text-sm">{action.error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-2 ${getActionColor()} rounded-lg p-4 space-y-3 shadow-sm`}
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-white dark:bg-slate-700 rounded-md shadow-sm">
          {getActionIcon()}
        </div>
        <span className="font-semibold text-sm text-gray-900 dark:text-white">
          {getActionTitle()}
        </span>
      </div>

      <div className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-gray-200 dark:border-slate-600">
        <ActionPreview action={action} />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onApprove}
          className="flex-1 bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white rounded-md px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Check className="h-4 w-4" />
          Accept
        </button>
        <button
          onClick={onDecline}
          className="flex-1 bg-gray-300 dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-200 rounded-md px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <XIcon className="h-4 w-4" />
          Decline
        </button>
      </div>
    </div>
  );
};

// Action Preview Component
const ActionPreview = ({ action }) => {
  return (
    <div className="space-y-1.5 text-sm">
      {/* Bulk delete actions */}
      {action.type === "delete_all_tasks" && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Permanent Deletion</span>
        </div>
      )}
      {action.type === "delete_all_goals" && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Permanent Deletion</span>
        </div>
      )}
      {(action.type === "delete_all_tasks" || action.type === "delete_all_goals") && (
        <div className="text-gray-600 dark:text-slate-400 text-xs">
          This action cannot be undone
        </div>
      )}

      {(action.type === "create_task" || action.type === "update_task") && (
        <>
          {action.data.title && (
            <div className="flex">
              <span className="font-medium w-24 text-gray-600 dark:text-slate-400">
                Title:
              </span>
              <span className="text-gray-700 dark:text-slate-300">
                {action.data.title}
              </span>
            </div>
          )}
          {action.data.updates?.title && (
            <div className="flex">
              <span className="font-medium w-24 text-gray-600 dark:text-slate-400">
                New Title:
              </span>
              <span className="text-gray-700 dark:text-slate-300">
                {action.data.updates.title}
              </span>
            </div>
          )}
          {(action.data.category || action.data.updates?.category) && (
            <div className="flex">
              <span className="font-medium w-24 text-gray-600 dark:text-slate-400">
                Category:
              </span>
              <span className="text-gray-700 dark:text-slate-300">
                {action.data.category || action.data.updates.category}
              </span>
            </div>
          )}
          {(action.data.priority || action.data.updates?.priority) && (
            <div className="flex">
              <span className="font-medium w-24 text-gray-600 dark:text-slate-400">
                Priority:
              </span>
              <span
                className={`capitalize ${
                  (action.data.priority || action.data.updates?.priority) ===
                  "high"
                    ? "text-red-600 dark:text-red-400 font-semibold"
                    : (action.data.priority ||
                          action.data.updates?.priority) === "medium"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-green-600 dark:text-green-400"
                }`}
              >
                {action.data.priority || action.data.updates.priority}
              </span>
            </div>
          )}
          {(action.data.status || action.data.updates?.status) && (
            <div className="flex">
              <span className="font-medium w-24 text-gray-600 dark:text-slate-400">
                Status:
              </span>
              <span className="text-gray-700 dark:text-slate-300 capitalize">
                {action.data.status || action.data.updates.status}
              </span>
            </div>
          )}
        </>
      )}

      {(action.type === "create_goal" || action.type === "update_goal") && (
        <>
          {action.data.title && (
            <div className="flex">
              <span className="font-medium w-24 text-gray-600 dark:text-slate-400">
                Title:
              </span>
              <span className="text-gray-700 dark:text-slate-300">
                {action.data.title}
              </span>
            </div>
          )}
          {action.data.updates?.title && (
            <div className="flex">
              <span className="font-medium w-24 text-gray-600 dark:text-slate-400">
                New Title:
              </span>
              <span className="text-gray-700 dark:text-slate-300">
                {action.data.updates.title}
              </span>
            </div>
          )}
          {action.data.updates?.progress !== undefined && (
            <div className="flex">
              <span className="font-medium w-24 text-gray-600 dark:text-slate-400">
                Progress:
              </span>
              <span className="text-gray-700 dark:text-slate-300">
                {action.data.updates.progress}%
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AIChatWidget;
