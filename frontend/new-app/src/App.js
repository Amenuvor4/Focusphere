import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import componets
import HomePage from './componets/HomePage';
import Login from './componets/Login';
import SignUp from './componets/SignUp';
import Dashboard from './componets/DashBoard';

function App() {
  return (
    <Router>
      <div className="font-sans text-gray-800">
        {/* Main Content */}
        <main className="p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path ="/signUp" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

