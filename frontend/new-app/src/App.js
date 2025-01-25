import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>React App with Tailwind CSS and Routing</h1>
          <nav className="space-x-4">
            <a href="/" className="text-blue-500">Home</a>
            <a href="/about" className="text-blue-500">About</a>
            <a href="/contact" className="text-blue-500">Contact</a>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

