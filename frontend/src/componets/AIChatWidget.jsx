import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Sparkles, Check, XIcon, Plus, Trash2, AlertCircle } from 'lucide-react';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your FocusSphere AI assistant. I can help you manage tasks, analyze your productivity, and provide insights. Try saying 'Create a task to finish my report' and I'll show you a preview to approve!"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get valid token
  const getValidToken = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      return token;
    } catch (error) {
      console.error('Token error:', error);
      return null;
    }
  };

  // Execute approved action
  const executeAction = async (action) => {
    try {
      const token = await getValidToken();
      if (!token) throw new Error('Not authenticated');

      let response;
      let endpoint;
      let method;
      let body;
      
      switch (action.type) {
        case 'create_task':
          endpoint = 'http://localhost:5000/api/tasks';
          method = 'POST';
          body = JSON.stringify(action.data);
          break;

        case 'delete_task':
          endpoint = `http://localhost:5000/api/tasks/${action.data.taskId}`;
          method = 'DELETE';
          break;

        case 'create_goal':
          endpoint = 'http://localhost:5000/api/goals';
          method = 'POST';
          body = JSON.stringify({
            ...action.data,
            progress: 0,
            tasks: []
          });
          break;

        case 'delete_goal':
          endpoint = `http://localhost:5000/api/goals/${action.data.goalId}`;
          method = 'DELETE';
          break;

        default:
          throw new Error('Unknown action type');
      }

      response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: body
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Action failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Action execution error:', error);
      return { success: false, error: error.message };
    }
  };


  const handleActionApproval = async (messageIndex, actionIndex, approved) => {
    const message = messages[messageIndex];
    if (!message.suggestedActions || !message.suggestedActions[actionIndex]) return;

    const action = message.suggestedActions[actionIndex];
    
    const updatedMessages = [...messages];
    updatedMessages[messageIndex].suggestedActions[actionIndex].status = approved ? 'processing' : 'declined';
    setMessages(updatedMessages);

    if (approved) {
      const result = await executeAction(action);
      
      updatedMessages[messageIndex].suggestedActions[actionIndex].status = result.success ? 'approved' : 'failed';
      updatedMessages[messageIndex].suggestedActions[actionIndex].error = result.error;
      setMessages(updatedMessages);

      if (result.success) {
        const actionName = action.type.replace('_', ' ');
        const confirmMessage = {
          role: 'assistant',
          content: `✅ Done! I've ${actionName}d successfully.`
        };
        setMessages([...updatedMessages, confirmMessage]);
      } else {
        const errorMessage = {
          role: 'assistant',
          content: `❌ Sorry, I couldn't complete that action: ${result.error}`
        };
        setMessages([...updatedMessages, errorMessage]);
      }
    } else {
      setMessages(updatedMessages);
      const declineMessage = {
        role: 'assistant',
        content: "No problem! Let me know if you'd like me to suggest something else."
      };
      setMessages([...updatedMessages, declineMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const token = await getValidToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages
            .filter(m => m.role !== 'system' && !m.suggestedActions)
            .map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();

      const aiMessage = { 
        role: 'assistant', 
        content: data.message,
        suggestedActions: data.suggestedActions || []
      };

      setMessages([...newMessages, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages([
        ...newMessages,
        { 
          role: 'assistant', 
          content: "Sorry, I'm having trouble connecting right now. Please try again in a moment." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 animate-pulse"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[420px] flex-col rounded-lg bg-white shadow-2xl border border-gray-200">
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
                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>

                {message.suggestedActions && message.suggestedActions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestedActions.map((action, actionIndex) => (
                      <ActionCard
                        key={actionIndex}
                        action={action}
                        onApprove={() => handleActionApproval(messageIndex, actionIndex, true)}
                        onDecline={() => handleActionApproval(messageIndex, actionIndex, false)}
                      />
                    ))}
                  </div>
                )}
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
              Try: "Create 3 tasks for project planning"
            </p>
          </div>
        </div>
      )}
    </>
  );
};

const ActionCard = ({ action, onApprove, onDecline }) => {
  const getActionIcon = () => {
    if (action.type.includes('create')) return <Plus className="h-4 w-4" />;
    if (action.type.includes('delete')) return <Trash2 className="h-4 w-4" />;
    return null;
  };

  const getActionColor = () => {
    if (action.type.includes('create')) return 'border-green-200 bg-green-50';
    if (action.type.includes('delete')) return 'border-red-200 bg-red-50';
    return 'border-blue-200 bg-blue-50';
  };

  const getActionTitle = () => {
    const typeMap = {
      'create_task': '🆕 Create Task',
      'delete_task': '🗑️ Delete Task',
      'create_goal': '🎯 Create Goal',
      'delete_goal': '❌ Delete Goal'
    };
    return typeMap[action.type] || 'Action';
  };

  if (action.status === 'approved') {
    return (
      <div className="border-2 border-green-500 bg-green-50 rounded-lg p-3 animate-fade-in">
        <div className="flex items-center gap-2 text-green-700">
          <Check className="h-5 w-5" />
          <span className="font-medium">✅ Action completed successfully!</span>
        </div>
      </div>
    );
  }

  if (action.status === 'declined') {
    return (
      <div className="border-2 border-gray-300 bg-gray-50 rounded-lg p-3 opacity-60">
        <div className="flex items-center gap-2 text-gray-600">
          <XIcon className="h-5 w-5" />
          <span className="font-medium">Action declined</span>
        </div>
      </div>
    );
  }

  if (action.status === 'processing') {
    return (
      <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-3 animate-pulse">
        <div className="flex items-center gap-2 text-blue-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">Processing...</span>
        </div>
      </div>
    );
  }

  if (action.status === 'failed') {
    return (
      <div className="border-2 border-red-500 bg-red-50 rounded-lg p-3">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <div>
            <div className="font-medium">Action failed</div>
            <div className="text-sm">{action.error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 ${getActionColor()} rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-white rounded-md">
          {getActionIcon()}
        </div>
        <span className="font-semibold text-sm">{getActionTitle()}</span>
      </div>

      <div className="bg-white rounded-lg p-3 space-y-1.5 text-sm border border-gray-200">
        {action.type === 'create_task' && (
          <>
            <div className="flex">
              <span className="font-medium w-24">Title:</span>
              <span className="text-gray-700">{action.data.title}</span>
            </div>
            {action.data.category && (
              <div className="flex">
                <span className="font-medium w-24">Category:</span>
                <span className="text-gray-700">{action.data.category}</span>
              </div>
            )}
            {action.data.priority && (
              <div className="flex">
                <span className="font-medium w-24">Priority:</span>
                <span className={`capitalize ${
                  action.data.priority === 'high' ? 'text-red-600 font-semibold' :
                  action.data.priority === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {action.data.priority}
                </span>
              </div>
            )}
            {action.data.due_date && (
              <div className="flex">
                <span className="font-medium w-24">Due Date:</span>
                <span className="text-gray-700">{new Date(action.data.due_date).toLocaleDateString()}</span>
              </div>
            )}
            {action.data.description && (
              <div className="flex">
                <span className="font-medium w-24">Description:</span>
                <span className="text-gray-700">{action.data.description}</span>
              </div>
            )}
          </>
        )}

        {action.type === 'delete_task' && (
          <>
            <div className="flex">
              <span className="font-medium w-24">Task ID:</span>
              <span className="text-gray-700 font-mono text-xs">{action.data.taskId}</span>
            </div>
            {action.data.reason && (
              <div className="flex">
                <span className="font-medium w-24">Reason:</span>
                <span className="text-gray-700">{action.data.reason}</span>
              </div>
            )}
          </>
        )}

        {action.type === 'create_goal' && (
          <>
            <div className="flex">
              <span className="font-medium w-24">Title:</span>
              <span className="text-gray-700">{action.data.title}</span>
            </div>
            {action.data.description && (
              <div className="flex">
                <span className="font-medium w-24">Description:</span>
                <span className="text-gray-700">{action.data.description}</span>
              </div>
            )}
            {action.data.priority && (
              <div className="flex">
                <span className="font-medium w-24">Priority:</span>
                <span className="text-gray-700 capitalize">{action.data.priority}</span>
              </div>
            )}
            {action.data.deadline && (
              <div className="flex">
                <span className="font-medium w-24">Deadline:</span>
                <span className="text-gray-700">{new Date(action.data.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </>
        )}

        {action.type === 'delete_goal' && (
          <>
            <div className="flex">
              <span className="font-medium w-24">Goal ID:</span>
              <span className="text-gray-700 font-mono text-xs">{action.data.goalId}</span>
            </div>
            {action.data.reason && (
              <div className="flex">
                <span className="font-medium w-24">Reason:</span>
                <span className="text-gray-700">{action.data.reason}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onApprove}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-md px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Check className="h-4 w-4" />
          Accept
        </button>
        <button
          onClick={onDecline}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <XIcon className="h-4 w-4" />
          Decline
        </button>
      </div>
    </div>
  );
};

export default AIChatWidget;