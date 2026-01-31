import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  Send,
  Loader2,
  Sparkles,
  AlertCircle,
  Image,
  Search,
  Trash,
  Plus,
  X,
  RotateCcw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ENDPOINTS } from "../config/api.js";
import { AIAssistantSkeleton } from "./AIAssistantSkeleton.jsx";
import {
  TypeWriter,
  DestructiveConfirmCard,
  ActionCard,
  MultiActionCard,
  ModelSelector,
  RateLimitCountdown,
} from "./AIAssistant/index.js";

const AIAssistant = ({
  conversations,
  currentConversationId,
  setCurrentConversationId,
  createNewConversation,
  deleteConversation,
  updateConversation,
  getCurrentConversation,
}) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const conversation = getCurrentConversation();
  const messages = useMemo(() => conversation?.messages || [], [conversation]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [tokenUsage, setTokenUsage] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Memoized callback to prevent TypeWriter restarts
  const handleTypingComplete = useCallback(() => {
    setTypingMessageId(null);
  }, []);

  const getValidToken = async () => {
    try {
      return localStorage.getItem("accessToken") || null;
    } catch {
      return null;
    }
  };

  const fetchSmartSuggestions = useCallback(async () => {
    try {
      setSuggestionsLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(ENDPOINTS.AI.SMART_SUGGESTIONS, {
        headers: { Authorization: `Bearer ${token}` },
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

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    // If user scrolls away from bottom during typing, mark as user scrolling
    if (!isNearBottom && typingMessageId) {
      setIsUserScrolling(true);
    }

    setShouldAutoScroll(isNearBottom);
  }, [typingMessageId]);

  // Reset user scrolling flag when typing completes
  useEffect(() => {
    if (!typingMessageId) {
      setIsUserScrolling(false);
    }
  }, [typingMessageId]);

  useEffect(() => {
    if (shouldAutoScroll && !isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldAutoScroll, isUserScrolling]);

  useEffect(() => {
    setShouldAutoScroll(true);
  }, [currentConversationId]);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isInitializing && messages.length === 0) {
      fetchSmartSuggestions();
    }
  }, [isInitializing, messages.length, fetchSmartSuggestions]);

  // Execute approved action using the new backend endpoint
  const executeAction = async (action) => {
    try {
      const token = await getValidToken();
      if (!token) throw new Error("Not authenticated");

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
      if (result.results && result.results[0]) {
        return result.results[0];
      }
      return { success: result.success };
    } catch (error) {
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
      return { success: false, error: error.message, results: [] };
    }
  };

  const handleActionApproval = async (messageIndex, actionIndex, approved) => {
    const conv = getCurrentConversation();
    const message = conv.messages[messageIndex];
    if (!message.suggestedActions?.[actionIndex]) return;

    const action = message.suggestedActions[actionIndex];
    const updatedMessages = [...conv.messages];
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

      const actionName = action.type.includes("create")
        ? "created"
        : action.type.includes("update")
          ? "updated"
          : "deleted";
      const itemType = action.type.includes("task") ? "task" : "goal";
      const confirmMessage = {
        role: "assistant",
        content: result.success
          ? `Done. ${itemType.charAt(0).toUpperCase() + itemType.slice(1)} ${actionName} successfully.`
          : `Failed: ${result.error}`,
      };
      updateConversation({ messages: [...updatedMessages, confirmMessage] });
    } else {
      const declineMessage = {
        role: "assistant",
        content: "Action cancelled.",
      };
      updateConversation({ messages: [...updatedMessages, declineMessage] });
    }
  };

  const handleBulkApproval = async (messageIndex, approved) => {
    const conv = getCurrentConversation();
    const message = conv.messages[messageIndex];
    if (!message.suggestedActions) return;

    const updatedMessages = [...conv.messages];
    updatedMessages[messageIndex].suggestedActions =
      message.suggestedActions.map((a) => ({
        ...a,
        status: approved ? "processing" : "declined",
      }));
    updateConversation({ messages: updatedMessages });

    if (approved) {
      // Use the new bulk execute endpoint
      const executionResult = await executeActions(message.suggestedActions);
      const results = executionResult.results || [];

      updatedMessages[messageIndex].suggestedActions =
        message.suggestedActions.map((a, idx) => ({
          ...a,
          status: results[idx]?.success ? "approved" : "failed",
          error: results[idx]?.error,
        }));
      updateConversation({ messages: updatedMessages });

      const confirmMessage = {
        role: "assistant",
        content: executionResult.message ||
          `Completed ${executionResult.summary?.succeeded || 0}/${executionResult.summary?.total || results.length} actions.`,
      };
      updateConversation({ messages: [...updatedMessages, confirmMessage] });
    }
  };

  // Handle editing an action before approval
  const handleActionEdit = (messageIndex, actionIndex, editedAction) => {
    const conv = getCurrentConversation();
    const updatedMessages = [...conv.messages];
    updatedMessages[messageIndex].suggestedActions[actionIndex] = editedAction;
    updateConversation({ messages: updatedMessages });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setSelectedImage({ file, preview: reader.result, name: file.name });
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async (userMessage, isFirstMessage) => {
    const newMessages = [...messages, { role: "user", content: userMessage }];
    updateConversation({ messages: newMessages });
    setIsLoading(true);

    try {
      const token = await getValidToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(ENDPOINTS.AI.CHAT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: newMessages
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.content })),
          isNewChat: isFirstMessage,
          preferredModel: selectedModel,
        }),
      });

      // Handle rate limit error specifically
      if (response.status === 429) {
        const errorData = await response.json();
        if (errorData.rateLimitInfo) {
          setRateLimitInfo({
            isLimited: true,
            retryAfterSeconds: errorData.rateLimitInfo.retryAfterSeconds,
            failedModel: errorData.rateLimitInfo.failedModel,
          });
          updateConversation({
            messages: [
              ...newMessages,
              {
                role: "assistant",
                content: errorData.rateLimitInfo.message || "AI is taking a short break. Please try again in a moment.",
                isError: true,
                isRateLimit: true,
              },
            ],
          });
          return;
        }
      }

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();

      // Update token usage from response metadata
      if (data._meta?.tokenUsage) {
        setTokenUsage(data._meta.tokenUsage);
      }

      // Update selected model if it changed (due to failover)
      if (data._meta?.model && data._meta.model !== selectedModel) {
        setSelectedModel(data._meta.model);
      }

      // Clear rate limit info on success
      setRateLimitInfo(null);

      const messageId = Date.now();
      const aiMessage = {
        id: messageId,
        role: "assistant",
        content: data.response.message,
        suggestedActions: data.response.suggestedActions || [],
        isNew: true,
        wasConfirmation: data.wasConfirmation || false,
        wasDecline: data.wasDecline || false,
        executedActions: data.response.executedActions || null,
      };

      setTypingMessageId(messageId);
      const updatePayload = { messages: [...newMessages, aiMessage] };
      if (isFirstMessage && data.suggestedTitle)
        updatePayload.title = data.suggestedTitle;
      updateConversation(updatePayload);
    } catch (error) {
      console.error("AI chat error:", error);
      updateConversation({
        messages: [
          ...newMessages,
          {
            role: "assistant",
            content: "Sorry, I'm having trouble. Please try again.",
            isError: true,
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if ((!inputMessage.trim() && !selectedImage) || isLoading) return;
    const userMessage = inputMessage.trim();
    setInputMessage("");
    sendMessage(userMessage, messages.length === 0);
  };

  const handleRetry = async (messageIndex) => {
    const conv = getCurrentConversation();
    const userMessage = conv.messages[messageIndex - 1];
    if (userMessage?.role !== "user") return;

    const messagesBeforeError = conv.messages.slice(0, messageIndex);
    updateConversation({ messages: messagesBeforeError });
    setIsLoading(true);

    try {
      const token = await getValidToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(ENDPOINTS.AI.CHAT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messagesBeforeError
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.content })),
          isNewChat: messagesBeforeError.length === 1,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      const data = await response.json();
      updateConversation({
        messages: [
          ...messagesBeforeError,
          {
            role: "assistant",
            content: data.response.message,
            suggestedActions: data.response.suggestedActions || [],
          },
        ],
      });
    } catch {
      updateConversation({
        messages: [
          ...messagesBeforeError,
          {
            role: "assistant",
            content: "Still having trouble. Please try again later.",
            isError: true,
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

  const handleSuggestionClick = (prompt) => {
    if (!isLoading) sendMessage(prompt, messages.length === 0);
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.messages.some((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const defaultSuggestions = [
    {
      title: "Create my tasks",
      prompt: "Create 5 productive tasks for me to work on today",
    },
    {
      title: "Set a new goal",
      prompt:
        "Help me create a SMART goal for improving my productivity this month",
    },
    {
      title: "Review my progress",
      prompt:
        "Analyze my current tasks and goals, and give me a progress summary",
    },
    {
      title: "Plan my schedule",
      prompt:
        "Help me prioritize and organize my pending tasks for maximum productivity",
    },
  ];

  if (isInitializing) return <AIAssistantSkeleton />;

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col">
        <div className="p-3 border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={createNewConversation}
            className="w-full bg-blue-600 dark:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Chat
          </button>
        </div>
        <div className="p-2 border-b border-gray-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className={`group p-2.5 rounded-lg mb-1.5 cursor-pointer transition-colors ${conv.id === currentConversationId ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800" : "hover:bg-gray-50 dark:hover:bg-slate-700"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="flex-1 min-w-0"
                  onClick={() => setCurrentConversationId(conv.id)}
                >
                  <h3 className="font-medium text-sm truncate text-gray-900 dark:text-white">
                    {conv.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Delete this conversation?"))
                      deleteConversation(conv.id);
                  }}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-opacity"
                >
                  <Trash className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h1 className="font-semibold text-lg text-gray-900 dark:text-white">
            Focusphere AI
          </h1>
        </div>

        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6"
        >
          {!conversation?.messages.length ? (
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="text-center space-y-2 max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Focusphere AI
                </h2>
                <p className="text-gray-500 dark:text-slate-400">
                  Your AI-powered productivity assistant.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-slate-500">
                <Sparkles className="h-4 w-4" />
                <span>
                  Select a smart prompt below or type your own message
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {suggestionsLoading
                  ? [1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="bg-gray-100 dark:bg-slate-700/50 border-2 border-gray-200 dark:border-slate-700 rounded-lg p-4 space-y-2 animate-pulse"
                      >
                        <div className="h-5 w-32 bg-gray-200 dark:bg-slate-600 rounded" />
                        <div className="h-4 w-full bg-gray-200 dark:bg-slate-600 rounded" />
                      </div>
                    ))
                  : (smartSuggestions.length > 0
                      ? smartSuggestions
                      : defaultSuggestions
                    ).map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(s.prompt)}
                        disabled={isLoading}
                        className="bg-gray-100 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 rounded-lg p-4 text-left transition-all disabled:opacity-50"
                      >
                        <p className="font-semibold text-gray-800 dark:text-white mb-1.5">
                          {s.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          "{s.prompt}"
                        </p>
                      </button>
                    ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {conversation?.messages.map((message, idx) => (
                <div key={idx} className="space-y-4">
                  {message.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[70%] bg-blue-600 dark:bg-blue-500 text-white rounded-2xl px-5 py-3">
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.isError ? "bg-red-100 dark:bg-red-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}
                      >
                        {message.isError ? (
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        {message.isNew && message.id === typingMessageId ? (
                          <TypeWriter
                            content={message.content}
                            speed={12}
                            onComplete={handleTypingComplete}
                          />
                        ) : (
                          <div
                            className={`prose prose-sm dark:prose-invert max-w-none ${message.isError ? "text-red-600 dark:text-red-400" : ""}`}
                          >
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        )}
                        {message.isError && (
                          <button
                            onClick={() => handleRetry(idx)}
                            disabled={isLoading}
                            className="mt-2 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 disabled:opacity-50"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Retry
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Show failure indicator only if some actions failed (success info is in message content) */}
                  {message.executedActions && message.executedActions.some(a => !a.success) && (
                    <div className="ml-12">
                      <div className="border-2 border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-medium">
                            {message.executedActions.filter(a => !a.success).length} action{message.executedActions.filter(a => !a.success).length !== 1 ? 's' : ''} failed
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {message.suggestedActions?.length > 0 && (
                    <div className="ml-12">
                      {message.suggestedActions.some(
                        (a) =>
                          a.type === "delete_bulk" &&
                          a.data?.requiresConfirmation,
                      ) ? (
                        <DestructiveConfirmCard
                          action={message.suggestedActions.find(
                            (a) => a.type === "delete_bulk",
                          )}
                          onConfirm={() => handleBulkApproval(idx, true)}
                          onCancel={() => handleBulkApproval(idx, false)}
                        />
                      ) : message.suggestedActions.length === 1 ? (
                        <ActionCard
                          action={message.suggestedActions[0]}
                          onApprove={() => handleActionApproval(idx, 0, true)}
                          onDecline={() => handleActionApproval(idx, 0, false)}
                          onEdit={(editedAction) => handleActionEdit(idx, 0, editedAction)}
                        />
                      ) : (
                        <MultiActionCard
                          actions={message.suggestedActions}
                          onApprove={() => handleBulkApproval(idx, true)}
                          onDecline={() => handleBulkApproval(idx, false)}
                          onIndividualApprove={(i) =>
                            handleActionApproval(idx, i, true)
                          }
                          onIndividualDecline={(i) =>
                            handleActionApproval(idx, i, false)
                          }
                          onIndividualEdit={(i, editedAction) =>
                            handleActionEdit(idx, i, editedAction)
                          }
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 pt-1 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-slate-400">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-gray-200/50 dark:border-slate-700/50 p-4 bg-gradient-to-t from-gray-100/90 to-gray-50/70 dark:from-slate-900/90 dark:to-slate-800/70 backdrop-blur-sm">
          {/* Rate limit countdown */}
          {rateLimitInfo?.isLimited && (
            <div className="mb-3">
              <RateLimitCountdown
                retryAfterSeconds={rateLimitInfo.retryAfterSeconds}
                onComplete={() => setRateLimitInfo(null)}
              />
            </div>
          )}

          {selectedImage && (
            <div className="mb-3 flex items-center gap-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <img
                src={selectedImage.preview}
                alt="Preview"
                className="h-12 w-12 object-cover rounded"
              />
              <span className="text-sm text-gray-700 dark:text-slate-300 flex-1">
                {selectedImage.name}
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
          )}

          {/* Main input bar with pill shape and glassmorphism */}
          <div
            className={`flex gap-2 items-center rounded-full px-3 py-1.5 transition-all duration-500
              bg-white/80 dark:bg-slate-800/80 backdrop-blur-md
              border-2 ${isLoading
                ? 'border-blue-400 dark:border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.4)] scale-[1.01]'
                : 'border-gray-200/60 dark:border-slate-600/60 hover:border-gray-300 dark:hover:border-slate-500'}
              focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-400`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-full transition-colors"
              title="Upload image"
            >
              <Image className="h-5 w-5 text-gray-500 dark:text-slate-400" />
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Focusphere AI..."
              disabled={isLoading || rateLimitInfo?.isLimited}
              className="flex-1 bg-transparent text-gray-900 dark:text-white py-2 text-sm focus:outline-none disabled:opacity-50 placeholder-gray-400 dark:placeholder-slate-500"
            />

            {/* Model selector */}
            <ModelSelector
              currentModel={selectedModel}
              onModelChange={setSelectedModel}
              rateLimitInfo={rateLimitInfo}
              tokenUsage={tokenUsage}
              disabled={isLoading}
            />

            <button
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && !selectedImage) || isLoading || rateLimitInfo?.isLimited}
              className="p-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
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

export default AIAssistant;
