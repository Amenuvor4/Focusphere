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
  MessageSquare,
  Trash,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

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
  // Auto-scroll
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
          body = JSON.stringify({ ...action.data, progress: 0, tasks: [] });
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

      // Token oberload prevention
      const recentHistory = newMessages.slice(-10).map((m) => ({
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
      <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <button
            onClick={createNewConversation}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Chat
          </button>
        </div>

        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setCurrentConversationId(conv.id)}
              className={`group p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                conv.id === currentConversationId
                  ? "bg-blue-100 border border-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <h3 className="font-medium text-sm truncate">
                      {conv.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {conv.messages.length} messages
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
                  <Trash className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">AI Assistant</h1>
              <p className="text-sm text-gray-500">
                {conversation?.messages.length || 0} messages
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportConversation}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export conversation"
            >
              <Download className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {conversation?.messages.map((message, messageIndex) => (
            <div key={messageIndex}>
              <div
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Uploaded"
                      className="rounded-lg mb-2 max-w-full"
                    />
                  )}
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>

              {/* Action Cards */}
              {message.suggestedActions &&
                message.suggestedActions.length > 0 &&
                (message.suggestedActions.length === 1 ? (
                  <div className="mt-3 ml-12">
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
                  <div className="mt-3 ml-12">
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
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-[70%]">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
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

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
              title="Upload image"
            >
              <Image className="h-5 w-5 text-gray-600" />
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
              className="px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

// Reuse components from widget
const MultiActionCard = ({
  actions,
  onApprove,
  onDecline,
  onIndividualApprove,
  onIndividualDecline,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const allProcessing = actions.every((a) => a.status === "processing");
  const allApproved = actions.every((a) => a.status === "approved");
  const allDeclined = actions.every((a) => a.status === "declined");

  if (allApproved) {
    return (
      <div className="border-2 border-green-500 bg-green-50 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-700">
          <Check className="h-5 w-5" />
          <span className="font-medium">
            ✅ All {actions.length} actions completed!
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

  return (
    <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
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
            </div>
          ))}
        </div>
      )}

      {!isExpanded && (
        <div className="flex gap-2 pt-2">
          <button
            onClick={onApprove}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-md px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" />
            Accept All
          </button>
          <button
            onClick={onDecline}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
          >
            <XIcon className="h-4 w-4" />
            Decline All
          </button>
        </div>
      )}
    </div>
  );
};

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
    <div className={`border-2 ${getActionColor()} rounded-lg p-4 space-y-3`}>
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

export default AIAssistant;
