import { BarChart3, CheckSquare, Cog, FolderKanban, Plus, CalendarClock } from "lucide-react";
import React, { useState, useEffect } from "react";
import getValidToken from "./tokenUtils"

export function DashboardSidebar({ currentView, setCurrentView }) {
  const [userName, setUserName] = useState("John Doe");
  const [userEmail, setUserEmail] = useState("john@example.com");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fetch user data
  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const token = await getValidToken();
        if (!token || !isMounted){
          return;

        } 
        const response = await fetch("http://localhost:5000/api/auth/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok || !isMounted) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        if (isMounted && data.user && data.user.name && data.user.email) {
          setUserName(data.user.name);
          setUserEmail(data.user.email);
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching user data:", error);
          setError("Failed to fetch user data. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="hidden border-r bg-white md:block md:w-64">
      <div className="flex h-full flex-col">
        {/* New Task Button */}
        <div className="flex h-14 items-center border-b px-4">
          <button className="w-full flex items-center justify-start gap-2 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-auto p-2">
          <ul className="grid gap-1">
            <li>
              <button
                onClick={() => setCurrentView("tasks")}
                className={`w-full flex items-center justify-start gap-2 px-3 py-2 rounded-md ${
                  currentView === "tasks"
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-700 hover:bg-gray-100"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <CheckSquare className="h-4 w-4" />
                <span>Tasks</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentView("goals")}
                className={`w-full flex items-center justify-start gap-2 px-3 py-2 rounded-md ${
                  currentView === "goals"
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-700 hover:bg-gray-100"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <FolderKanban className="h-4 w-4" />
                <span>Goals</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentView("analytics")}
                className={`w-full flex items-center justify-start gap-2 px-3 py-2 rounded-md ${
                  currentView === "analytics"
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-700 hover:bg-gray-100"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentView("settings")}
                className={`w-full flex items-center justify-start gap-2 px-3 py-2 rounded-md ${
                  currentView === "settings"
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-700 hover:bg-gray-100"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <Cog className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentView("calender")}
                className={`w-full flex items-center justify-start gap-2 px-3 py-2 rounded-md ${
                  currentView === "calender"
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-700 hover:bg-gray-100"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <CalendarClock className="h-4 w-4" />
                <span>Calender</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <img
              src="/placeholder.svg?height=40&width=40"
              alt="User"
              className="h-10 w-10 rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{userName}</span>
              <span className="text-xs text-gray-500">{userEmail}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}