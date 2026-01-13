import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaGoogle, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { ENDPOINTS } from "../config/api";


const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialIsLogin = params.get("mode") !== "signup";
  
  // Check for tokens in URL params (for OAuth callbacks)
  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");

  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [processingRedirect, setProcessingRedirect] = useState(false);

  // Handle tokens from URL (OAuth callback)
  useEffect(() => {
    if (accessToken && refreshToken && !processingRedirect) {
      console.log("Tokens received from OAuth callback");
      setProcessingRedirect(true);
      
      // THIS CAN LEAD TO XSS ATTACKS, When you caN move tokens to an httponly cookie
      // Store tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      
      
      // Add a small delay to allow console logs to be visible
      setTimeout(() => {
        console.log("Redirecting to dashboard from OAuth callback");
        navigate("/dashboard");
      }, 500);
    }
  }, [accessToken, refreshToken, navigate, processingRedirect]);

  // Check if user is already authenticated
  useEffect(() => {
    if (processingRedirect) return; // Skip if we're already handling OAuth redirect
    
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        // Verify token hasn't expired
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp > currentTime) {
          console.log("Valid token found, user already authenticated");
          console.log("Token expiration:", new Date(decoded.exp * 1000).toLocaleString());
          console.log("Current time:", new Date(currentTime * 1000).toLocaleString());
          console.log("Time remaining (seconds):", decoded.exp - currentTime);
          
          // Only redirect if we're on the auth page
          if (location.pathname === "/auth") {
            console.log("Redirecting to dashboard from auth check");
            navigate("/dashboard");
          }
        } else {
          console.error("Token expired, staying on auth page");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } catch (err) {
        console.error("Token validation error:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    } else {
      console.error("No token found, staying on auth page");
    }
  }, [navigate, location.pathname, processingRedirect]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!isLogin && name.trim().length < 3) {
      setError("Name must be at least 3 characters long.");
      setIsLoading(false);
      return;
    }

    const endpoint = isLogin ? ENDPOINTS.AUTH.LOGIN : ENDPOINTS.AUTH.REGISTER;
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      console.error(`Sending ${isLogin ? 'login' : 'signup'} request to ${endpoint}`);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.error("Backend response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // For registration, we need to login afterward
      if (!isLogin) {
        console.error("Registration successful, redirecting to login");
        setIsLogin(true);
        setIsLoading(false);
        return;
      }

      // Store tokens in localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      console.error("Tokens stored successfully");

      // Debug token expiration
      const decoded = jwtDecode(data.accessToken);
      const currentTime = Date.now() / 1000;
      console.error("Token expiration:", new Date(decoded.exp * 1000).toLocaleString());
      console.error("Current time:", new Date(currentTime * 1000).toLocaleString());
      console.error("Time remaining (seconds):", decoded.exp - currentTime);

      // Set flag to prevent redirect loops
      setProcessingRedirect(true);
      
      // Delay redirect to see console logs
      console.error("Redirecting to dashboard after successful login");
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      console.error("Auth error:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    try {
      console.error("Redirecting to Google OAuth");
      window.location.href = ENDPOINTS.AUTH.GOOGLE;
    } catch (err) {
      console.error("Google OAuth redirect error:", err);
      setError("Failed to redirect to Google OAuth. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f7ff] p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-[#1e90ff] text-2xl font-semibold text-center mb-6">
          {isLogin ? "Login" : "Sign Up"}
        </h2>
        {error && <p className="text-red-600 text-center text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1e90ff] transition-colors"
              />
            </div>
          )}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1e90ff] transition-colors"
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1e90ff] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 w-6 h-6 p-0 flex items-center justify-center"
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1e90ff] text-white py-3 rounded-lg font-medium hover:bg-[#1a7ae0] transition-colors"
          >
            {isLoading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="mx-4 text-gray-600 text-sm uppercase">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full bg-[#4285f4] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#3b78e7] transition-colors"
          >
            <FaGoogle /> {isGoogleLoading ? "Redirecting..." : "Google"}
          </button>
        </div>

        <p className="text-gray-600 text-sm text-center mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#1e90ff] font-medium cursor-pointer hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;