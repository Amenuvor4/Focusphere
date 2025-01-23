import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home"; // Home page
import Login from "./pages/Login"; // Login page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

