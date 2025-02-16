"use client";

import { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaGithub } from "react-icons/fa";
import "../styles/SignUp.css";

const SignUp = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";
    const payload = isSignUp
      ? { name, email, password }
      : { email, password, loginMethod: "email" };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (!isSignUp) {
        localStorage.setItem("token", data.token);
        onAuthSuccess(data.user);
      } else {
        alert("Account created! Please log in.");
        setIsSignUp(false);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleOAuthLogin = (user) => {
    console.log("User logged in:", user);
  };


  return (
    <div className="signup-container">
      <h1>{isSignUp ? "Sign Up" : "Login"}</h1>
      <form onSubmit={handleSubmit}>
        {isSignUp && (
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
        <button type="submit">{isSignUp ? "Sign Up" : "Login"}</button>
      </form>

      <div className="separator">
        <span>or</span>
      </div>

      <div className="auth-options">
        <button onClick={() => handleOAuthLogin("google")} className="google-auth">
          <FaGoogle /> {isSignUp ? "Sign up" : "Login"} with Google
        </button>
        {isSignUp && (
          <button onClick={() => handleOAuthLogin("github")} className="github-auth">
            <FaGithub /> Sign up with GitHub
          </button>
        )}
      </div>

      <p>
        {isSignUp ? "Already have an account? " : "Don't have an account? "}
        <span onClick={() => setIsSignUp(!isSignUp)} className="toggle-auth">
          {isSignUp ? "Login" : "Sign Up"}
        </span>
      </p>
    </div>
  );
};

export default SignUp;