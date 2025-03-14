import React, { useState } from "react";
import { DashboardHeader } from "./Dashboard-Header";
import { DashboardSidebar } from "./Dashboard-Sidebar";
import { TaskList } from "./TaskList.jsx";
import { GoalList } from "./GoalList";
import { Analytics } from "./Analytics";
import { Settings } from "./Settings";

export function Dashboard() {
  const [currentView, setCurrentView] = useState("tasks");

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar currentView={currentView} setCurrentView={setCurrentView} />
        <main className="flex-1 overflow-y-auto bg-gray-100/40 p-4 md:p-6">
          {currentView === "tasks" && <TaskList />}
          {currentView === "goals" && <GoalList />}
          {currentView === "analytics" && <Analytics />}
          {currentView === "settings" && <Settings />}
        </main>
      </div>
    </div>
  );
}

export  default Dashboard;
