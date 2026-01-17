import React from "react";
import "./index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Import componets
import HomePage from "./componets/HomePage";
import Auth from "./componets/Auth";
import Dashboard from "./Dashboard/DashBoard";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="font-sans text-gray-800">
          {/* Main Content */}
          <main className="">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/Auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
