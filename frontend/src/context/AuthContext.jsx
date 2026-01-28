import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import { ENDPOINTS } from "../config/api.js";

const AuthContext = createContext(null);

// Token storage helpers
const getStoredToken = (key) => localStorage.getItem(key);
const setStoredToken = (key, value) => localStorage.setItem(key, value);
const removeStoredTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// Check if token is valid and not expiring soon
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

// Check if token is expiring within threshold (10 minutes)
const isTokenExpiring = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp - currentTime < 600;
  } catch {
    return true;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [skipNextAuthCheck, setSkipNextAuthCheck] = useState(false);

  // Refresh access token using refresh token
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = getStoredToken("refreshToken");
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(ENDPOINTS.AUTH.REFRESH_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      setStoredToken("accessToken", data.accessToken);
      setStoredToken("refreshToken", data.refreshToken);
      return data.accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      removeStoredTokens();
      return null;
    }
  }, []);

  // Get a valid token (refresh if needed)
  const getValidToken = useCallback(async () => {
    const token = getStoredToken("accessToken");

    if (!token) {
      return null;
    }

    if (!isTokenValid(token)) {
      return await refreshAccessToken();
    }

    if (isTokenExpiring(token)) {
      const newToken = await refreshAccessToken();
      return newToken || token; // Return old token if refresh fails but still valid
    }

    return token;
  }, [refreshAccessToken]);

  // Fetch user profile
  const fetchUserProfile = useCallback(async (token) => {
    try {
      const response = await fetch(ENDPOINTS.AUTH.PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Profile fetch error:", error);
      return null;
    }
  }, []);

  // Check authentication status on mount
  const checkAuth = useCallback(
    async (forceCheck = false) => {
      // Skip if already authenticated and not forcing (prevents delay on navigation)
      if (isAuthenticated && user && !forceCheck) {
        setIsLoading(false);
        return true;
      }

      // Skip if marked to skip (just logged in)
      if (skipNextAuthCheck) {
        setSkipNextAuthCheck(false);
        setIsLoading(false);
        return isAuthenticated;
      }

      setIsLoading(true);
      setAuthError(null);

      try {
        const token = await getValidToken();

        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          return false;
        }

        const userData = await fetchUserProfile(token);

        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        } else {
          removeStoredTokens();
          setIsAuthenticated(false);
          setUser(null);
          return false;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuthError("Authentication check failed");
        setIsAuthenticated(false);
        setUser(null);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [getValidToken, fetchUserProfile, isAuthenticated, user, skipNextAuthCheck],
  );

  // Login with email/password
  const login = useCallback(async (email, password) => {
    setAuthError(null);

    try {
      const response = await fetch(ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setStoredToken("accessToken", data.accessToken);
      setStoredToken("refreshToken", data.refreshToken);

      setUser(data.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      setSkipNextAuthCheck(true); // Prevent redundant auth check on navigation

      return { success: true };
    } catch (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Register new user
  const register = useCallback(async (name, email, password) => {
    setAuthError(null);

    try {
      const response = await fetch(ENDPOINTS.AUTH.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return { success: true, message: data.message };
    } catch (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Handle OAuth callback tokens
  const handleOAuthCallback = useCallback(
    async (accessToken, refreshToken) => {
      if (!accessToken || !refreshToken) {
        return false;
      }

      setStoredToken("accessToken", accessToken);
      setStoredToken("refreshToken", refreshToken);

      const userData = await fetchUserProfile(accessToken);

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);
        setSkipNextAuthCheck(true); // Prevent redundant auth check on navigation
        return true;
      }

      removeStoredTokens();
      return false;
    },
    [fetchUserProfile],
  );

  // Logout
  const logout = useCallback(() => {
    removeStoredTokens();
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  }, []);

  // Handle 401 errors globally
  const handleUnauthorized = useCallback(async () => {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      logout();
      return false;
    }
    return true;
  }, [refreshAccessToken, logout]);

  // Initialize auth on mount only
  useEffect(() => {
    const initAuth = async () => {
      // Check if we have stored tokens on initial mount
      const token = getStoredToken("accessToken");
      if (token && isTokenValid(token)) {
        // Token exists and is valid - fetch profile
        try {
          const userData = await fetchUserProfile(token);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            removeStoredTokens();
          }
        } catch {
          removeStoredTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    login,
    register,
    logout,
    getValidToken,
    handleOAuthCallback,
    handleUnauthorized,
    checkAuth,
    clearError: () => setAuthError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
