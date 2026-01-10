import React, { useState, useRef, useEffect, useMemo } from "react";
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
} from "lucide-react";

const AIChatWidget = ({
  conversations,
  currentConversationId,
  setCurrentConversationId,
  createNewConversation,
  deleteConversation,
  updateConversation,
  getCurrentConversation
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const conversation = getCurrentConversation();
    const messages = useMemo(() => 
    conversation?.messages || [], 
    [conversation]
  );
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getValidToken = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      return token || null;
    } catch (error) {
      console.error("Token error:", error);
      return null;
    }
  };

  // Execute approved action
  const executeAction = async (action) => {
    try {
      const token = await getValidToken();
      if (!token) throw new Error("Not authenticated");

      let response;
      let endpoint;
      let method;
      let body;

      switch (action.type) {
        case "create_task":
          endpoint = "http://localhost:5000/api/tasks";
          method = "POST";
          body = JSON.stringify(action.data);
          break;

        case "update_task":
          endpoint = `http://localhost:5000/api/tasks/${action.data.taskId}`;
          method = "PUT";
          body = JSON.stringify(action.data.updates);
          break;

        case "delete_task":
          endpoint = `http://localhost:5000/api/tasks/${action.data.taskId}`;
          method = "DELETE";
          break;

        case "create_goal":
          endpoint = "http://localhost:5000/api/goals";
          method = "POST";
          body = JSON.stringify({
            ...action.data,
            progress: 0,
            tasks: [],
          });
          break;

        case "update_goal":
          endpoint = `http://localhost:5000/api/goals/${action.data.goalId}`;
          method = "PUT";
          body = JSON.stringify(action.data.updates);
          break;

        case "delete_goal":
          endpoint = `http://localhost:5000/api/goals/${action.data.goalId}`;
          method = "DELETE";
          break;

        default:
          throw new Error("Unknown action type");
      }

      response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Action failed");
      }

      return { success: true };
    } catch (error) {
      console.error("Action execution error:", error);
      return { success: false, error: error.message };
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
    updateConversation({messages: updatedMessages  });

    if (approved) {
      const result = await executeAction(action);

      updatedMessages[messageIndex].suggestedActions[actionIndex].status =
        result.success ? "approved" : "failed";
      updatedMessages[messageIndex].suggestedActions[actionIndex].error =
        result.error;
      updateConversation({messages: updatedMessages  });

      if (result.success) {
        const actionName = action.type.replace("_", " ");
        const confirmMessage = {
          role: "assistant",
          content: `✅ Done! I've ${actionName}d successfully.`,
        };
        updateConversation([...messages, confirmMessage]);
      } else {
        const errorMessage = {
          role: "assistant",
          content: `❌ Sorry, I couldn't complete that: ${result.error}`,
        };
        updateConversation([...messages, errorMessage]);
      }
    } else {
      updateConversation({messages: updatedMessages  });
      const declineMessage = {
        role: "assistant",
        content: "No problem! Let me know if you'd like something else.",
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
    updateConversation({messages: updatedMessages  });

    if (approved) {
      // Execute all actions
      const results = await Promise.all(
        message.suggestedActions.map((action) => executeAction(action))
      );

      // Update statuses
      updatedMessages[messageIndex].suggestedActions =
        message.suggestedActions.map((action, idx) => ({
          ...action,
          status: results[idx].success ? "approved" : "failed",
          error: results[idx].error,
        }));
      updateConversation({messages: updatedMessages  });

      // Add confirmation
      const successCount = results.filter((r) => r.success).length;
      const confirmMessage = {
        role: "assistant",
        content: `✅ Done! Successfully completed ${successCount} of ${results.length} actions.`,
      };
      updateConversation({messages: [...messages, confirmMessage]});
    } else {
     updateConversation({messages: updatedMessages  });
      const declineMessage = {
        role: "assistant",
        content: "No problem! All actions declined.",
      };
      updateConversation([...messages, declineMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    const newMessages = [...messages, { role: "user", content: userMessage }];
    updateConversation({messages: newMessages  });
    setIsLoading(true);

    try {
      const token = await getValidToken();
      if (!token) throw new Error("Not authenticated");

      // Token oberload prevention
      const recentHistory = newMessages
        .slice(-10)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));


      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: recentHistory,
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();
      console.log(data);

      const aiMessage = {
        role: "assistant",
        content: data.response.message,
        suggestedActions: data.response.suggestedActions || [],
      };

      updateConversation({messages: [...newMessages, aiMessage]});
    } catch (error) {
      console.error("AI chat error:", error);
      updateConversation({
        messages: [
          ...messages,
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

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[420px] flex-col rounded-lg bg-white shadow-2xl border border-gray-200">
          <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">FocusSphere AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, messageIndex) => (
              <div key={messageIndex}>
                <div
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>

                {/* Action Container - Single or Multiple */}
                {message.suggestedActions &&
                  message.suggestedActions.length > 0 &&
                  (message.suggestedActions.length === 1 ? (
                    // Single action - show normally
                    <div className="mt-3">
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
                    <div className="mt-3">
                      <MultiActionCard
                        actions={message.suggestedActions}
                        onApprove={() => handleBulkApproval(messageIndex, true)}
                        onDecline={() =>
                          handleBulkApproval(messageIndex, false)
                        }
                        onIndividualApprove={(idx) =>
                          handleActionApproval(messageIndex, idx, true)
                        }
                        onIndividualDecline={(idx) =>
                          handleActionApproval(messageIndex, idx, false)
                        }
                      />
                    </div>
                  ))}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Try: "Create 5 tasks" or "Update task priority to high"
            </p>
          </div>
        </div>
      )}
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
      <div className="border-2 border-green-500 bg-green-50 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-700">
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
      <div className="border-2 border-gray-300 bg-gray-50 rounded-lg p-3 opacity-60">
        <div className="flex items-center gap-2 text-gray-600">
          <XIcon className="h-5 w-5" />
          <span className="font-medium">All actions declined</span>
        </div>
      </div>
    );
  }

  if (allProcessing) {
    return (
      <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-3 animate-pulse">
        <div className="flex items-center gap-2 text-blue-700">
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
      <div className="border-2 border-gray-300 bg-gray-50 rounded-lg p-3 opacity-60">
        <div className="flex items-center gap-2 text-gray-600">
          <XIcon className="h-5 w-5" />
          <span className="font-medium">Some actions failed</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white rounded-md">
            <Plus className="h-4 w-4 text-blue-600" />
          </div>
          <span className="font-semibold text-sm">
            {actions.length} Actions Ready
          </span>
        </div>
        <button className="p-1 hover:bg-white/50 rounded transition-colors">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Summary (Always Visible) */}
      <div className="bg-white rounded-lg p-3 text-sm">
        <div className="space-y-1">
          {actions.slice(0, 3).map((action, idx) => (
            <div key={idx} className="flex items-center gap-2 text-gray-700">
              <span className="text-gray-400">•</span>
              <span className="truncate">
                {action.type.includes("create") && "🆕"}
                {action.type.includes("update") && "✏️"}
                {action.type.includes("delete") && "🗑️"}{" "}
                {action.data.title || action.data.updates?.title || "Task"}
              </span>
            </div>
          ))}
          {actions.length > 3 && (
            <div className="text-gray-500 text-xs">
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
              className="bg-white rounded-lg p-3 border border-gray-200"
            >
              <ActionPreview action={action} />
              {!action.status && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onIndividualApprove(idx)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded px-3 py-1.5 text-xs font-medium"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onIndividualDecline(idx)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded px-3 py-1.5 text-xs font-medium"
                  >
                    Decline
                  </button>
                </div>
              )}
              {action.status === "approved" && (
                <div className="text-green-600 text-xs mt-2 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Completed
                </div>
              )}
              {action.status === "failed" && (
                <div className="text-red-600 text-xs mt-2">
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
            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-md px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" />
            Accept All
          </button>
          <button
            onClick={onDecline}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
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
    if (action.type.includes("create")) return <Plus className="h-4 w-4" />;
    if (action.type.includes("update")) return <Edit className="h-4 w-4" />;
    if (action.type.includes("delete")) return <Trash2 className="h-4 w-4" />;
    return null;
  };

  const getActionColor = () => {
    if (action.type.includes("create")) return "border-green-200 bg-green-50";
    if (action.type.includes("update")) return "border-yellow-200 bg-yellow-50";
    if (action.type.includes("delete")) return "border-red-200 bg-red-50";
    return "border-blue-200 bg-blue-50";
  };

  const getActionTitle = () => {
    const typeMap = {
      create_task: "🆕 Create Task",
      update_task: "✏️ Update Task",
      delete_task: "🗑️ Delete Task",
      create_goal: "🎯 Create Goal",
      update_goal: "✏️ Update Goal",
      delete_goal: "❌ Delete Goal",
    };
    return typeMap[action.type] || "Action";
  };

  if (action.status === "approved") {
    return (
      <div className="border-2 border-green-500 bg-green-50 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-700">
          <Check className="h-5 w-5" />
          <span className="font-medium">✅ Completed!</span>
        </div>
      </div>
    );
  }

  if (action.status === "declined") {
    return (
      <div className="border-2 border-gray-300 bg-gray-50 rounded-lg p-3 opacity-60">
        <div className="flex items-center gap-2 text-gray-600">
          <XIcon className="h-5 w-5" />
          <span className="font-medium">Declined</span>
        </div>
      </div>
    );
  }

  if (action.status === "processing") {
    return (
      <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-3 animate-pulse">
        <div className="flex items-center gap-2 text-blue-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">Processing...</span>
        </div>
      </div>
    );
  }

  if (action.status === "failed") {
    return (
      <div className="border-2 border-red-500 bg-red-50 rounded-lg p-3">
        <div className="flex items-center gap-2 text-red-700">
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
        <div className="p-1.5 bg-white rounded-md">{getActionIcon()}</div>
        <span className="font-semibold text-sm">{getActionTitle()}</span>
      </div>

      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <ActionPreview action={action} />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onApprove}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-md px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
        >
          <Check className="h-4 w-4" />
          Accept
        </button>
        <button
          onClick={onDecline}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
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
      {(action.type === "create_task" || action.type === "update_task") && (
        <>
          {action.data.title && (
            <div className="flex">
              <span className="font-medium w-24">Title:</span>
              <span className="text-gray-700">{action.data.title}</span>
            </div>
          )}
          {action.data.updates?.title && (
            <div className="flex">
              <span className="font-medium w-24">New Title:</span>
              <span className="text-gray-700">{action.data.updates.title}</span>
            </div>
          )}
          {(action.data.category || action.data.updates?.category) && (
            <div className="flex">
              <span className="font-medium w-24">Category:</span>
              <span className="text-gray-700">
                {action.data.category || action.data.updates.category}
              </span>
            </div>
          )}
          {(action.data.priority || action.data.updates?.priority) && (
            <div className="flex">
              <span className="font-medium w-24">Priority:</span>
              <span
                className={`capitalize ${
                  (action.data.priority || action.data.updates?.priority) ===
                  "high"
                    ? "text-red-600 font-semibold"
                    : (action.data.priority ||
                          action.data.updates?.priority) === "medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                }`}
              >
                {action.data.priority || action.data.updates.priority}
              </span>
            </div>
          )}
          {(action.data.status || action.data.updates?.status) && (
            <div className="flex">
              <span className="font-medium w-24">Status:</span>
              <span className="text-gray-700 capitalize">
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
              <span className="font-medium w-24">Title:</span>
              <span className="text-gray-700">{action.data.title}</span>
            </div>
          )}
          {action.data.updates?.title && (
            <div className="flex">
              <span className="font-medium w-24">New Title:</span>
              <span className="text-gray-700">{action.data.updates.title}</span>
            </div>
          )}
          {action.data.updates?.progress !== undefined && (
            <div className="flex">
              <span className="font-medium w-24">Progress:</span>
              <span className="text-gray-700">
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
