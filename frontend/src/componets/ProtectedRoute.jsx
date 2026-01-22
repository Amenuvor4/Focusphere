import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthSkeleton } from "./AuthSkeleton";

/**
 * ProtectedRoute - Wrapper component for routes that require authentication
 *
 * Shows a loading skeleton while checking auth status to prevent "flash" of content
 * Redirects to /auth if user is not authenticated
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
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

  // Redirect to auth page if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Render protected content
  return children;
}

/**
 * PublicRoute - Wrapper for routes that should redirect authenticated users
 *
 * Useful for login/register pages that shouldn't be accessible when logged in
 */
export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return <AuthSkeleton />;
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  return children;
}

export default ProtectedRoute;
