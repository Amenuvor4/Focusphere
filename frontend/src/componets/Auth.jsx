import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Check,
  X,
  ArrowLeft,
} from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { ENDPOINTS } from "../config/api.js";
import { AuthLoadingOverlay } from "./AuthSkeleton";

// Password validation rules
const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "number", label: "Contains a number", test: (p) => /\d/.test(p) },
  {
    id: "special",
    label: "Contains special character",
    test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
  {
    id: "uppercase",
    label: "Contains uppercase",
    test: (p) => /[A-Z]/.test(p),
  },
];

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password) => {
  return PASSWORD_RULES.every((rule) => rule.test(password));
};

const getPasswordStrength = (password) => {
  const passed = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  if (passed === 0) return { level: 0, label: "", color: "" };
  if (passed === 1) return { level: 1, label: "Weak", color: "bg-red-500" };
  if (passed === 2) return { level: 2, label: "Fair", color: "bg-orange-500" };
  if (passed === 3) return { level: 3, label: "Good", color: "bg-yellow-500" };
  return { level: 4, label: "Strong", color: "bg-green-500" };
};

function PasswordStrengthIndicator({ password }) {
  const strength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${(strength.level / 4) * 100}%` }}
          />
        </div>
        <span
          className={`text-xs font-medium ${
            strength.level <= 1
              ? "text-red-500"
              : strength.level <= 2
                ? "text-orange-500"
                : strength.level <= 3
                  ? "text-yellow-600"
                  : "text-green-500"
          }`}
        >
          {strength.label}
        </span>
      </div>

      {/* Rules checklist */}
      <div className="grid grid-cols-2 gap-1">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <div
              key={rule.id}
              className={`flex items-center gap-1.5 text-xs ${
                passed
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-400 dark:text-slate-500"
              }`}
            >
              {passed ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              {rule.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    login,
    register,
    isAuthenticated,
    isLoading: authLoading,
    handleOAuthCallback,
  } = useAuth();

  const params = new URLSearchParams(location.search);
  const initialIsLogin = params.get("mode") !== "signup";
  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");
  const oauthError = params.get("error");

  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(
    oauthError ? "OAuth authentication failed. Please try again." : null,
  );
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [processingOAuth, setProcessingOAuth] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  // Handle OAuth callback tokens
  useEffect(() => {
    if (accessToken && refreshToken && !processingOAuth) {
      setProcessingOAuth(true);
      handleOAuthCallback(accessToken, refreshToken).then((success) => {
        if (success) {
          // Clean URL and redirect
          window.history.replaceState({}, document.title, "/auth");
          navigate("/dashboard", { replace: true });
        } else {
          setError("OAuth authentication failed. Please try again.");
          setProcessingOAuth(false);
        }
      });
    }
  }, [
    accessToken,
    refreshToken,
    handleOAuthCallback,
    navigate,
    processingOAuth,
  ]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !processingOAuth && !authLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, processingOAuth, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    // Validation
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    if (!isLogin && !validatePassword(password)) {
      setError("Password does not meet the requirements");
      setIsSubmitting(false);
      return;
    }

    if (isLogin && password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }

    if (!isLogin && name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      setIsSubmitting(false);
      return;
    }

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          navigate("/dashboard", { replace: true });
        } else {
          setError(result.error);
        }
      } else {
        const result = await register(name.trim(), email, password);
        if (result.success) {
          setSuccessMessage("Account created successfully! Please log in.");
          setIsLogin(true);
          setPassword("");
        } else {
          setError(result.error);
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setError(null);
    window.location.href = ENDPOINTS.AUTH.GOOGLE;
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccessMessage(null);
    setPassword("");
    setShowPasswordRules(false);
  };

  // Show loading overlay while processing OAuth
  if (processingOAuth || (authLoading && (accessToken || refreshToken))) {
    return <AuthLoadingOverlay />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      {/* Back to home link */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">Back to Home</span>
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {isLogin
              ? "Sign in to continue to Focusphere"
              : "Get started with Focusphere"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600 dark:text-green-400">
              {successMessage}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field (signup only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required={!isLogin}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => !isLogin && setShowPasswordRules(true)}
                placeholder={
                  isLogin ? "Enter your password" : "Create a strong password"
                }
                required
                className="w-full pl-10 pr-12 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Password strength indicator (signup only) */}
            {!isLogin && showPasswordRules && (
              <PasswordStrengthIndicator password={password} />
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {isLogin ? "Signing in..." : "Creating account..."}
              </>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200 dark:border-slate-700"></div>
          <span className="px-4 text-sm text-gray-500 dark:text-slate-400">
            or continue with
          </span>
          <div className="flex-1 border-t border-gray-200 dark:border-slate-700"></div>
        </div>

        {/* OAuth buttons */}
        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
        >
          {isGoogleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FaGoogle className="h-5 w-5 text-red-500" />
          )}
          {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
        </button>

        {/* Toggle login/signup */}
        <p className="text-center text-sm text-gray-600 dark:text-slate-400 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={toggleMode}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
