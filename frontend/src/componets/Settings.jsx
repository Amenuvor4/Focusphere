import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Shield,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { ENDPOINTS } from "../config/api";
import OTPVerification from "./OTPVerification";

export default function Settings() {
  const navigate = useNavigate();
  const { user, getValidToken, checkAuth } = useAuth();
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState(null);

  const handleSyncCalendar = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    setSyncError(null);

    try {
      const token = await getValidToken();
      const response = await fetch(ENDPOINTS.TASKS.SYNC_ALL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sync failed");
      }

      setSyncResult(data);
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleVerificationComplete = async () => {
    // Refresh user data to get updated verification status
    await checkAuth(true);
  };

  const handleConnectGoogle = () => {
    window.location.href = ENDPOINTS.AUTH.GOOGLE;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-slate-300" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Email Verification Section */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Email Verification
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Verify your email to unlock all features
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {user?.isEmailVerified ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Verified
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm text-amber-600 dark:text-amber-400">
                          Not verified
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {!user?.isEmailVerified && (
                <button
                  onClick={() => setIsOTPModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Verify Now
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Google Calendar Section */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Google Calendar
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Sync your tasks to Google Calendar
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaGoogle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Google Account
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {user?.hasGoogleCalendar ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Connected
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-slate-400">
                          Not connected
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {!user?.hasGoogleCalendar && (
                <button
                  onClick={handleConnectGoogle}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors"
                >
                  <FaGoogle className="h-4 w-4 text-red-500" />
                  Connect
                </button>
              )}
            </div>

            {/* Sync Button - Only show if connected */}
            {user?.hasGoogleCalendar && (
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Sync All Tasks
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Push all unsynced tasks to your Google Calendar
                    </p>
                  </div>
                  <button
                    onClick={handleSyncCalendar}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Sync Now
                      </>
                    )}
                  </button>
                </div>

                {/* Sync Result */}
                {syncResult && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-300">
                          Sync Complete!
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          {syncResult.message}
                        </p>
                        {syncResult.results && (
                          <div className="flex gap-4 mt-2 text-sm text-green-600 dark:text-green-400">
                            <span>✓ {syncResult.results.success} synced</span>
                            <span>○ {syncResult.results.skipped} skipped</span>
                            {syncResult.results.failed > 0 && (
                              <span>✗ {syncResult.results.failed} failed</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sync Error */}
                {syncError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-700 dark:text-red-300">
                          Sync Failed
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {syncError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Calendar Link */}
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-4"
                >
                  Open Google Calendar
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Info Card */}
        <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            How Calendar Sync Works
          </h3>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Tasks with due dates are synced as 30-minute calendar events</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Already synced and completed tasks are automatically skipped</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>You can also ask the AI to &quot;sync all tasks to calendar&quot;</span>
            </li>
          </ul>
        </section>
      </main>

      {/* OTP Verification Modal */}
      <OTPVerification
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        onVerified={handleVerificationComplete}
      />
    </div>
  );
}
