import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import getValidToken from "../config/tokenUtils";
import { ENDPOINTS } from "../config/api";
import { useTheme } from "../context/ThemeContext";

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const [isLoading, setIsLoading] = useState(false);
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
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load settings." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
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
      }
    } catch (err) {
      setMessage({ type: "error", text: "Update failed." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-800 transition-colors">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h1>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200 mb-8">
        {["profile", "appearance", "notifications"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 capitalize text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        {activeTab === "profile" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-blue-700 mb-1">
                Display Name
              </label>
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-2.5 border border-gray-300 bg-gray-50 text-gray-500 dark:text-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500  outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-blue-700 mb-1">
                Email Address
              </label>
              <input
                disabled
                value={formData.email}
                className="w-full p-2.5 border border-gray-100 bg-gray-50 text-gray-500 dark:text-white dark:bg-slate-800 rounded-lg cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <div>
                <p className="font-medium dark:text-white">Dark Mode</p>
                <p className="text-xs text-gray-500">
                  Toggle the application theme
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full transition-colors relative ${theme === "dark" ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${theme === "dark" ? "left-7" : "left-1"}`}
                />
              </button>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-slate-800 rounded-xl text-center">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Coming Soon
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Notification settings are currently under development. This
                feature will be available in a future update. Thanks for trying
                the beta!
              </p>
            </div>
          </div>
        )}

        <div className="pt-6 border-t flex items-center justify-between">
          {message.text && (
            <span
              className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
            >
              {message.text}
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
