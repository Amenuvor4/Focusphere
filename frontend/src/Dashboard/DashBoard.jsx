import React, { useState, useEffect, useRef } from "react";
import { DashboardSidebar } from "./Dashboard-Sidebar";
import { TaskList } from "./TaskList.jsx";
import Goals from "./GoalList";
import { Analytics } from "./Analytics";
import { Settings } from "./Settings";
import AIChatWidget from "../componets/AIChatWidget.jsx";
import AIAssistant from "../componets/AIAssistant.jsx";


export function Dashboard() {
  const [currentView, setCurrentView] = useState("tasks");
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const initialized = useRef(false);

  function createInitialConversation() {
    const newConv = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations([newConv]);
    setCurrentConversationId(newConv.id);
  }

  function createNewConversation() {
    const newConv = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
  }

  function deleteConversation(id) {
    const filtered = conversations.filter((c) => c.id !== id);

    if (currentConversationId === id) {

      const deletingIndex = conversations.findIndex((c) => c.id === id);

      if(filtered.length > 0){
        if(deletingIndex < conversations.length - 1){
          setCurrentConversationId(conversations[deletingIndex + 1].id);
        }
        else if (deletingIndex > 0){
          setCurrentConversationId(conversations[deletingIndex - 1].id);
        }
        else {
          setCurrentConversationId(filtered[0].id);
        }
      }
    }

    if (filtered.length === 0) {
      createInitialConversation();
    } else {
      setConversations(filtered);
    }
  }

  function updateConversation(updates) {
    setConversations((prev) => 
      prev.map((c) =>
        c.id === currentConversationId
          ? { ...c, ...updates, updatedAt: new Date().toISOString() }
          : c
      )
    );
  }

  function getCurrentConversation() {
    return conversations.find((c) => c.id === currentConversationId);
  }

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const saved = localStorage.getItem("ai_conversations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        if (parsed.length > 0) {
          setCurrentConversationId(parsed[0].id);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
        createInitialConversation();
      }
    } else {
      createInitialConversation();
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("ai_conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
        <main className="flex-1 overflow-y-auto bg-gray-100/40 dark:bg-slate-800 p-4 md:p-6">
          {currentView === "tasks" && <TaskList />}
          {currentView === "goals" && <Goals />}
          {currentView === "analytics" && <Analytics />}
          {currentView === "settings" && <Settings />}
          {currentView === "ai-assistant" && (
            <AIAssistant
              conversations={conversations}
              currentConversationId={currentConversationId}
              setCurrentConversationId={setCurrentConversationId}
              createNewConversation={createNewConversation}
              deleteConversation={deleteConversation}
              updateConversation={updateConversation}
              getCurrentConversation={getCurrentConversation}
            />
          )}
        </main>
      </div>
      {currentView !== "ai-assistant" && (
        <AIChatWidget
          conversations={conversations}
          currentConversationId={currentConversationId}
          setCurrentConversationId={setCurrentConversationId}
          createNewConversation={createNewConversation}
          deleteConversation={deleteConversation}
          updateConversation={updateConversation}
          getCurrentConversation={getCurrentConversation}
        />
      )}
    </div>
  );
}

export default Dashboard;
