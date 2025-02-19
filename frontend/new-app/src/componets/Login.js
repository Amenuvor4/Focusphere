"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // For redirection
import { FaGoogle, FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import '../styles/Login.css';


const API_BASE_URL = "http://localhost:5000/api/auth"; // Change this to your backend URL

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const endpoint = isLogin ? "/login" : "/signup";
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      localStorage.setItem("token", data.token);
      navigate("/dashboard"); // Redirect after login/signup
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/google`; // Redirect to backend Google OAuth
  };



  return (
    <div className="login-container">
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}
        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
      </form>

      <div className="separator">
        <span>or</span>
      </div>

      <div className="auth-options">
        <button onClick={handleGoogleLogin} className="google-auth">
          <FaGoogle /> Google
        </button>
      </div>
      <p>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span onClick={() => setIsLogin(!isLogin)} className="toggle-auth">
          {isLogin ? "Sign Up" : "Login"}
        </span>
      </p>
    </div>
  );
};

export default Login;


