import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import pages
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <div className="font-sans text-gray-800">
        {/* Main Content */}
        <main className="p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

