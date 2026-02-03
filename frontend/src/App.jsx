import "./index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import HomePage from "./componets/HomePage";
import Auth from "./componets/Auth";
import Dashboard from "./Dashboard/DashBoard";
import Settings from "./componets/Settings";
import EmailVerification from "./componets/EmailVerification";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, PublicRoute, VerificationRoute } from "./componets/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="font-sans text-gray-800">
            <main className="">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/Auth"
                  element={
                    <PublicRoute>
                      <Auth />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/verify-email"
                  element={
                    <VerificationRoute>
                      <EmailVerification />
                    </VerificationRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
