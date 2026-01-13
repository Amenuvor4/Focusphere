import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Send,
  Loader2,
  Sparkles,
  Check,
  XIcon,
  Plus,
  Trash2,
  AlertCircle,
  Edit,
  Image,
  Download,
  Search,
  Trash,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { ENDPOINTS } from "../config/api.js";

const AIAssistant = ({
  conversations,
  currentConversationId,
  setCurrentConversationId,
  createNewConversation,
  deleteConversation,
  updateConversation,
  getCurrentConversation,
}) => {
  const conversation = getCurrentConversation();
  const messages = useMemo(() => conversation?.messages || [], [conversation]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const getValidToken = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      return token || null;
    } catch (error) {
      console.error("Token error:", error);
      return null;
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, currentConversationId]);

  const executeAction = async (action) => {
    try {
      const token = await getValidToken();
      if (!token) throw new Error("Not authenticated");

      let response, endpoint, method, body;

      switch (action.type) {
        case "create_task":
          endpoint = ENDPOINTS.TASKS.BASE;
          method = "POST";
          body = JSON.stringify(action.data);
          break;
        case "update_task":
          endpoint = ENDPOINTS.TASKS.BY_ID(action.data.taskId);
          method = "PUT";
          body = JSON.stringify(action.data.updates);
          break;
        case "delete_task":
          endpoint = ENDPOINTS.TASKS.BY_ID(action.data.taskId);
          method = "DELETE";
          break;
        case "create_goal":
          endpoint = ENDPOINTS.GOALS.BASE;
          method = "POST";
          body = JSON.stringify({ ...action.data, progress: 0, tasks: [] });
          break;
        case "update_goal":
          endpoint = ENDPOINTS.GOALS.BY_ID(action.data.goalId);
          method = "PUT";
          body = JSON.stringify(action.data.updates);
          break;
        case "delete_goal":
          endpoint = ENDPOINTS.GOALS.BY_ID(action.data.goalId);
          method = "DELETE";
          break;
        default:
          throw new Error("Unknown action type");
      }

      response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
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

  const handleActionApproval = async (messageIndex, actionIndex, approved) => {
    const conversation = getCurrentConversation();
    const message = conversation.messages[messageIndex];

    if (!message.suggestedActions || !message.suggestedActions[actionIndex])
      return;

    const action = message.suggestedActions[actionIndex];

    const updatedMessages = [...conversation.messages];
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

      const confirmMessage = result.success
        ? {
            role: "assistant",
            content: `✅ Done! I've ${action.type.replace("_", " ")}d successfully.`,
          }
        : {
            role: "assistant",
            content: `❌ Sorry, I couldn't complete that: ${result.error}`,
          };

      updateConversation({ messages: [...updatedMessages, confirmMessage] });
    } else {
      updateConversation({ messages: updatedMessages });
      const declineMessage = {
        role: "assistant",
        content: "No problem! Let me know if you'd like something else.",
      };
      updateConversation({ messages: [...updatedMessages, declineMessage] });
    }
  };

  const handleBulkApproval = async (messageIndex, approved) => {
    const conversation = getCurrentConversation();
    const message = conversation.messages[messageIndex];
    if (!message.suggestedActions) return;

    const updatedMessages = [...conversation.messages];
    updatedMessages[messageIndex].suggestedActions =
      message.suggestedActions.map((action) => ({
        ...action,
        status: approved ? "processing" : "declined",
      }));
    updateConversation({ messages: updatedMessages });

    if (approved) {
      const results = await Promise.all(
        message.suggestedActions.map((action) => executeAction(action))
      );

      updatedMessages[messageIndex].suggestedActions =
        message.suggestedActions.map((action, idx) => ({
          ...action,
          status: results[idx].success ? "approved" : "failed",
          error: results[idx].error,
        }));
      updateConversation({ messages: updatedMessages });

      const successCount = results.filter((r) => r.success).length;
      const confirmMessage = {
        role: "assistant",
        content: `✅ Done! Successfully completed ${successCount} of ${results.length} actions.`,
      };
      updateConversation({ messages: [...updatedMessages, confirmMessage] });
    } else {
      updateConversation({ messages: updatedMessages });
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          file,
          preview: reader.result,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !selectedImage) || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    const newMessages = [...messages, { role: "user", content: userMessage }];
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
          message: userMessage,
          conversationHistory: recentHistory,
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();

      const aiMessage = {
        role: "assistant",
        content: data.response.message,
        suggestedActions: data.response.suggestedActions || [],
      };

      updateConversation({ messages: [...newMessages, aiMessage] });
    } catch (error) {
      console.error("AI chat error:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I'm having trouble right now. Please try again.",
      };
      updateConversation({ messages: [...newMessages, errorMessage] });
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

  const exportConversation = () => {
    const conversation = getCurrentConversation();
    const text = conversation.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${conversation.id}.txt`;
    a.click();
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.messages.some((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Sidebar - Narrower */}
      <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <div className="p-3 border-b">
          <button
            onClick={createNewConversation}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setCurrentConversationId(conv.id)}
              className={`group p-2.5 rounded-lg mb-1.5 cursor-pointer transition-colors ${
                conv.id === currentConversationId
                  ? "bg-blue-100 border border-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate text-gray-900">
                    {conv.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Delete this conversation?")) {
                      deleteConversation(conv.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                >
                  <Trash className="h-3.5 w-3.5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area - Gemini Style */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        {/* Header - Minimal */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h1 className="font-semibold text-lg text-gray-900">
              FocusSphere AI
            </h1>
          </div>
          <button
            onClick={exportConversation}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Export conversation"
          >
            <Download className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Messages - Gemini Style (No boxes for AI) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {conversation?.messages.map((message, messageIndex) => (
            <div key={messageIndex} className="space-y-4">
              {message.role === "user" ? (
                /* User Message - In a box */
                <div className="flex justify-end">
                  <div className="max-w-[70%] bg-blue-600 text-white rounded-2xl px-5 py-3">
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Uploaded"
                        className="rounded-lg mb-2 max-w-full"
                      />
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              ) : (
                /* AI Message - No box, just text */
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Cards - Only time we use boxes */}
              {message.suggestedActions &&
                message.suggestedActions.length > 0 &&
                (message.suggestedActions.length === 1 ? (
                  <div className="ml-12">
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
                  <div className="ml-12">
                    <MultiActionCard
                      actions={message.suggestedActions}
                      onApprove={() => handleBulkApproval(messageIndex, true)}
                      onDecline={() => handleBulkApproval(messageIndex, false)}
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
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Bottom */}
        <div className="border-t p-4 bg-gray-50">
          {selectedImage && (
            <div className="mb-3 flex items-center gap-2 p-2 bg-blue-100 rounded-lg">
              <img
                src={selectedImage.preview}
                alt="Preview"
                className="h-12 w-12 object-cover rounded"
              />
              <span className="text-sm text-gray-700 flex-1">
                {selectedImage.name}
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 hover:bg-blue-200 rounded"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          )}

          <div className="flex gap-2 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 hover:bg-gray-200 rounded-lg transition-colors"
              title="Upload image"
            >
              <Image className="h-5 w-5 text-gray-600" />
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask FocusSphere AI..."
              disabled={isLoading}
              className="flex-1 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
              className="p-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MultiActionCard = ({
  actions,
  onApprove,
  onDecline,
  onIndividualApprove,
  onIndividualDecline,
}) => {
  const [showAll, setShowAll] = useState(false);

  const allProcessing = actions.every((a) => a.status === "processing");
  const allApproved = actions.every((a) => a.status === "approved");
  const allDeclined = actions.every((a) => a.status === "declined");

  // Determine how many to show
  const visibleActions = showAll ? actions : actions.slice(0, 3);
  const hasMore = actions.length > 3;
  const hiddenCount = actions.length - 3;

  // Final states
  if (allApproved) {
    return (
      <div className="border-2 border-green-500 bg-green-50 rounded-xl p-5">
        <div className="flex items-center gap-3 text-green-700">
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
      <div className="border-2 border-gray-300 bg-gray-50 rounded-xl p-5 opacity-60">
        <div className="flex items-center gap-3 text-gray-600">
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
      <div className="border-2 border-blue-500 bg-blue-50 rounded-xl p-5 animate-pulse">
        <div className="flex items-center gap-3 text-blue-700">
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
    <div className="border-2 border-blue-200 bg-blue-50 rounded-xl p-6 space-y-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-blue-200">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Plus className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            {actions.length} Action{actions.length > 1 ? "s" : ""} Ready to
            Execute
          </h3>
          <p className="text-sm text-gray-600">
            Review each action carefully before approving
          </p>
        </div>
      </div>

      {/* Action Cards - Scrollable when expanded */}
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
          />
        ))}
      </div>

      {/* Show More Button */}
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full bg-white hover:bg-gray-50 border-2 border-blue-300 text-blue-700 rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <ChevronDown className="h-5 w-5" />
          Show {hiddenCount} More Action{hiddenCount > 1 ? "s" : ""}
        </button>
      )}

      {/* Show Less Button */}
      {showAll && hasMore && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full bg-white hover:bg-gray-50 border-2 border-blue-300 text-blue-700 rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <ChevronUp className="h-5 w-5" />
          Show Less
        </button>
      )}

      {/* Bulk Actions Footer */}
      <div className="flex gap-3 pt-4 border-t border-blue-200">
        <button
          onClick={onApprove}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 py-4 font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          <Check className="h-5 w-5" />
          Approve All ({actions.length})
        </button>
        <button
          onClick={onDecline}
          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white rounded-xl px-6 py-4 font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          <XIcon className="h-5 w-5" />
          Decline All
        </button>
      </div>
    </div>
  );
};

// Individual Action Card Component (Compact)
const ActionDetailCard = ({ action, actionNumber, onApprove, onDecline }) => {
  const getActionIcon = () => {
    if (action.type.includes("create"))
      return <Plus className="h-5 w-5 text-green-600" />;
    if (action.type.includes("update"))
      return <Edit className="h-5 w-5 text-yellow-600" />;
    if (action.type.includes("delete"))
      return <Trash2 className="h-5 w-5 text-red-600" />;
    return null;
  };

  const getActionBg = () => {
    if (action.type.includes("create")) return "bg-green-50 border-green-200";
    if (action.type.includes("update")) return "bg-yellow-50 border-yellow-200";
    if (action.type.includes("delete")) return "bg-red-50 border-red-200";
    return "bg-blue-50 border-blue-200";
  };

  const getActionTitle = () => {
    if (action.type.includes("create")) return "CREATE";
    if (action.type.includes("update")) return "UPDATE";
    if (action.type.includes("delete")) return "DELETE";
    return "ACTION";
  };

  const getActionType = () => {
    return action.type.includes("task") ? "TASK" : "GOAL";
  };

  // Handle different action statuses
  if (action.status === "approved") {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4">
        <div className="flex items-center gap-2 text-green-700">
          <Check className="h-5 w-5" />
          <span className="font-semibold">
            ✅ Action #{actionNumber}: {getActionType()} has been{" "}
            {getActionTitle().toLowerCase()}d successfully
          </span>
        </div>
      </div>
    );
  }

  if (action.status === "declined") {
    return (
      <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4 opacity-60">
        <div className="flex items-center gap-2 text-gray-600">
          <XIcon className="h-5 w-5" />
          <span className="font-semibold">
            Action #{actionNumber}: Declined
          </span>
        </div>
      </div>
    );
  }

  if (action.status === "processing") {
    return (
      <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-2 text-blue-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-semibold">
            Action #{actionNumber}: Processing...
          </span>
        </div>
      </div>
    );
  }

  if (action.status === "failed") {
    return (
      <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Action #{actionNumber}: Failed</p>
            <p className="text-sm">{action.error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 ${getActionBg()} rounded-xl p-4 space-y-3`}>
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white rounded-lg shadow-sm">
            {getActionIcon()}
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900">
              {getActionTitle()} {getActionType()}
            </h4>
            <p className="text-xs text-gray-500">Action #{actionNumber}</p>
          </div>
        </div>
      </div>

      {/* Delete Warning Banner */}
      {action.type.includes("delete") && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-2 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-red-700">
            <p className="font-bold">⚠️ Permanent Deletion</p>
            <p>This action cannot be undone</p>
          </div>
        </div>
      )}

      {/* Action Details Grid */}
      <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
        {/* Title */}
        {(action.data.title || action.data.updates?.title) && (
          <div className="flex gap-2">
            <span className="font-semibold text-gray-600 min-w-[70px]">
              Title:
            </span>
            <span className="text-gray-900 font-medium">
              {action.data.title || action.data.updates?.title}
            </span>
          </div>
        )}

        {/* Category */}
        {(action.data.category || action.data.updates?.category) && (
          <div className="flex gap-2 items-center">
            <span className="font-semibold text-gray-600 min-w-[70px]">
              Category:
            </span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              {action.data.category || action.data.updates?.category}
            </span>
          </div>
        )}

        {/* Priority */}
        {(action.data.priority || action.data.updates?.priority) && (
          <div className="flex gap-2 items-center">
            <span className="font-semibold text-gray-600 min-w-[70px]">
              Priority:
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                (action.data.priority || action.data.updates?.priority) ===
                "high"
                  ? "bg-red-100 text-red-700"
                  : (action.data.priority || action.data.updates?.priority) ===
                      "medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
              }`}
            >
              {(
                action.data.priority || action.data.updates?.priority
              )?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Status */}
        {(action.data.status || action.data.updates?.status) && (
          <div className="flex gap-2 items-center">
            <span className="font-semibold text-gray-600 min-w-[70px]">
              Status:
            </span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium capitalize">
              {action.data.status || action.data.updates?.status}
            </span>
          </div>
        )}

        {/* Due Date */}
        {(action.data.due_date || action.data.updates?.due_date) && (
          <div className="flex gap-2">
            <span className="font-semibold text-gray-600 min-w-[70px]">
              Due Date:
            </span>
            <span className="text-gray-700">
              {new Date(
                action.data.due_date || action.data.updates?.due_date
              ).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Goal Progress */}
        {action.data.updates?.progress !== undefined && (
          <div className="flex gap-2 items-center">
            <span className="font-semibold text-gray-600 min-w-[70px]">
              Progress:
            </span>
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${action.data.updates.progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700">
                {action.data.updates.progress}%
              </span>
            </div>
          </div>
        )}

        {/* Goal Deadline */}
        {(action.data.deadline || action.data.updates?.deadline) && (
          <div className="flex gap-2">
            <span className="font-semibold text-gray-600 min-w-[70px]">
              Deadline:
            </span>
            <span className="text-gray-700">
              {new Date(
                action.data.deadline || action.data.updates?.deadline
              ).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Update Changes Summary */}
        {action.type.includes("update") && action.data.updates && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-1">Changes:</p>
            <ul className="text-xs text-gray-700 space-y-0.5">
              {Object.keys(action.data.updates).map((key) => (
                <li key={key} className="flex items-center gap-1">
                  <span className="text-blue-600">•</span>
                  <span className="capitalize">{key.replace("_", " ")}</span>
                  <span className="text-gray-500">updated</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onApprove}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2.5 font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Check className="h-4 w-4" />
          Approve
        </button>
        <button
          onClick={onDecline}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg px-4 py-2.5 font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <XIcon className="h-4 w-4" />
          Decline
        </button>
      </div>
    </div>
  );
};
const ActionCard = ({ action, onApprove, onDecline }) => {
  return (
    <ActionDetailCard
      action={action}
      actionNumber={1}
      onApprove={onApprove}
      onDecline={onDecline}
    />
  );
};


export default AIAssistant;
