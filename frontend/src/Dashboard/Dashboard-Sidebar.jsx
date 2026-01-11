import {
  BarChart3,
  CheckSquare,
  FolderKanban,
  Sparkles,
  LogOut,
  ChevronDown,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import getValidToken from "./tokenUtils";

export function DashboardSidebar({ currentView, setCurrentView }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const token = await getValidToken();
        if (!token || !isMounted) return;

        const response = await fetch("http://localhost:5000/api/auth/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok || !isMounted) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        if (isMounted && data.user && data.user.name && data.user.email) {
          setUserName(data.user.name);
          setUserEmail(data.user.email);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching user data:", error);
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  const navItems = [
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "goals", label: "Goals", icon: FolderKanban },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "ai-assistant", label: "AI Assistant", icon: Sparkles },
  ];

  return (
    <div className="hidden border-r border-blue-100 bg-white md:flex md:w-64 md:flex-col">
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="border-b border-blue-100 px-6 py-5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-blue-600">Focusphere</h1>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-blue-700 hover:bg-blue-50 hover:text-blue-900"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isActive ? "text-white" : "text-blue-600"}`}
                    />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-blue-100 bg-white p-3">
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-blue-50 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold shadow-md">
                {isLoading ? "..." : userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {isLoading ? "Loading..." : userName}
                </p>
                <p className="text-xs text-blue-600 truncate">
                  {isLoading ? "" : userEmail}
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-blue-400 transition-transform ${
                  isProfileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-blue-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
