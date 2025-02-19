import { Link } from "react-router-dom"
import { FaChrome, FaChartLine, FaCalendarAlt, FaCog } from "react-icons/fa"
import logo from "../images/logo.png"
import AI from "../images/AI.png"
import Calender from "../images/calender.png"
import Team from "../images/team.png"
import "../styles/HomePage.css"

const HomePage = () => {
  return (
    <div className="homepage">
      <header className="header">
        <div className="container header-content">
          <div className="logo-section">
            <img src={logo || "/placeholder.svg"} alt="Auranuvor Logo" className="logo" />
            <h1 className="site-name">Auranuvor</h1>
          </div>
          <nav className="nav-tabs">
            <a href="#home" className="nav-link">Home</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link"> Contact</a>
          </nav>
          <div className="auth-buttons">
            <Link to="/Login" className="login-button">Login</Link>
            <Link to="/SignUp" className="signup-button">Sign Up</Link>
          </div>
        </div>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="container hero-content">
            <div className="hero-text">
              <h2>Prioritize Smarter, Achieve Faster</h2>
              <p>
                Welcome to Auranuvor – your AI-powered task prioritization tool. Focus on what matters most with smart
                prioritization made simple.
              </p>
              <Link to="/SignUp" className="cta-button">Get Started</Link>
            </div>
            <img src={Team || "/placeholder.svg"} alt="Team collaboration" className="hero-image" />
          </div>
        </section>

        <section id="features" className="features">
          <div className="container">
            <h2 className="section-title">Key Features</h2>
            <div className="feature-grid">
              <div className="feature-item">
                <FaChartLine className="feature-icon" />
                <h3>AI-Powered Prioritization</h3>
                <p>Our advanced AI analyzes your behavior and deadlines to optimize your task list.</p>
              </div>
              <div className="feature-item">
                <FaCalendarAlt className="feature-icon" />
                <p>Efficient Planning</p>
                <p>Plan your tasks more effectively with our intuitive calendar integration.</p>
              </div>
              <div className="feature-item">
                <FaCog className="feature-icon" />
                <h3>Seamless Integration</h3>
                <p>Sync effortlessly across all your devices for a unified productivity experience.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="ai-highlight">
          <div className="container ai-content">
            <img src={AI || "/placeholder.svg"} alt="AI Technology" className="ai-image" />
            <div className="ai-text">
              <h2>Powered by Advanced AI</h2>
              <p>
                Auranuvor uses cutting-edge machine learning to analyze your work patterns and optimize your
                productivity. Stay focused and achieve more with our intelligent task management system.
              </p>
            </div>
          </div>
        </section>

        <section className="calendar-highlight">
          <div className="container calendar-content">
            <div className="calendar-text">
              <h2>Effortless Scheduling</h2>
              <p>
                Our intuitive calendar integration ensures you never miss a deadline. Auranuvor helps you plan your
                tasks efficiently and reminds you as important dates approach.
              </p>
            </div>
            <img src={Calender || "/placeholder.svg"} alt="Calendar Integration" className="calendar-image" />
          </div>
        </section>

        <section className="cta">
          <div className="container cta-content">
            <h2>Ready to Boost Your Productivity?</h2>
            <p>Join thousands of professionals who have transformed their work life with Auranuvor.</p>
            <Link to="/SignUp" className="cta-button">
              Start Free Trial
            </Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-section">
            <h3>Auranuvor</h3>
            <p>AI-powered task management for enhanced productivity.</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-section">
            <h3>Connect</h3>
            <p>Email: support@auranuvor.com</p>
            <p>Phone: (123) 456-7890</p>
          </div>
          <div className="footer-section">
            <h3>Download</h3>
            <a href="#Chrome" className="chrome-button">
              <FaChrome /> Chrome Extension
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Auranuvor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
