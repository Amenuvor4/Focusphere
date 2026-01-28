import { useState, useEffect } from "react";
import { Loader2, User, Palette, Bell, Check, AlertCircle } from "lucide-react";
import getValidToken from "../config/tokenUtils";
import { ENDPOINTS } from "../config";
import { useTheme } from "../context/ThemeContext";
import { SettingsSkeleton } from "../componets/SettingsSkeleton";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    // SETTINGS TO MATCH BACKEND USER MODEL
    name: "",
    email: "",
    preference: {
      notifications: true,
      theme: "light",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = await getValidToken();
        const response = await fetch(ENDPOINTS.AUTH.PROFILE, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.user) setFormData(data.user);
      } catch {
        setMessage({ type: "error", text: "Failed to load settings." });
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = await getValidToken();
      const response = await fetch(ENDPOINTS.AUTH.PROFILE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Settings updated successfully" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to update settings" });
      }
    } catch {
      setMessage({ type: "error", text: "Update failed. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 transition-colors">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-lg mb-8 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                isActive
                  ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        {activeTab === "profile" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter your name"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-shadow"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 rounded-lg cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">
                  Email cannot be changed
                </p>
              </div>
            </div>

            {/* Account Info Card */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Account Information
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                    Your profile information is used across the application to
                    personalize your experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${theme === "dark" ? "bg-slate-600" : "bg-gray-200"}`}
                >
                  <Palette
                    className={`h-5 w-5 ${theme === "dark" ? "text-blue-400" : "text-gray-600"}`}
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Dark Mode
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Switch between light and dark themes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`relative w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                  theme === "dark" ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
                    theme === "dark" ? "left-8" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                Preview
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                    theme === "light"
                      ? "border-blue-500 bg-white"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() => theme === "dark" && toggleTheme()}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-2 w-12 bg-gray-200 rounded"></div>
                    {theme === "light" && (
                      <Check className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-gray-100 rounded"></div>
                    <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 font-medium">
                    Light
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                    theme === "dark"
                      ? "border-blue-500 bg-slate-800"
                      : "border-gray-200 bg-slate-800"
                  }`}
                  onClick={() => theme === "light" && toggleTheme()}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-2 w-12 bg-slate-600 rounded"></div>
                    {theme === "dark" && (
                      <Check className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-slate-700 rounded"></div>
                    <div className="h-2 w-3/4 bg-slate-700 rounded"></div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    Dark
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-center">
              <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                <Bell className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Coming Soon
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md">
                Notification settings are currently under development. You'll be
                able to customize alerts for tasks, deadlines, and updates.
              </p>
              <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  In Development
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="pt-6 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
            {/* Status Message */}
            <div className="flex-1">
              {message.text && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    message.type === "success"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {message.type === "success" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {message.text}
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default Settings;
