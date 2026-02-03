import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthSkeleton } from "./AuthSkeleton";

/**
 * ProtectedRoute - Wrapper component for routes that require authentication
 *
 * Shows a loading skeleton while checking auth status to prevent "flash" of content
 * Redirects to /auth if user is not authenticated
 */
export function ProtectedRoute({ children, requireVerification = true }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 dark:border-slate-700 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireVerification && user && !user.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
}

/**
 * PublicRoute - Wrapper for routes that should redirect authenticated users
 *
 * Useful for login/register pages that shouldn't be accessible when logged in
 */
export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthSkeleton />;
  }

  if (isAuthenticated) {
    if (user && !user.isEmailVerified) {
      return <Navigate to="/verify-email" replace />;
    }
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  return children;
}

export function VerificationRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <AuthSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.isEmailVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
