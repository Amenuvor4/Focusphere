import React from 'react';
import '../styles/HomePage.css';
import logo from "../images/logo.png";
import AI from "../images/AI.png";
import Calender from "../images/calender.png"
import Team from "../images/team.png"
import Link from "react-router-dom";


const HomePage = () => {
    return (
        <div className="homepage">
            <header className="header">
                {/* Logo Section */}
                <div className="logo-section">
                    <img src={logo} alt="Auranuvor Logo" className="logo" />
                    <h1 className="site-name">Auranuvor</h1>
                </div>

                {/* Navigation Tabs */}
                <nav className="nav-tabs">
                    <a href="#home" className="nav-link">Home</a>
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#pricing" className="nav-link">Pricing</a>
                    <a href="#integration" className="nav-link">Integration</a>
                    <a href="#dashboard" className="nav-link">Dashboard</a>
                </nav>

                {/* Login and Sign-Up Buttons */}
                <div className="auth-buttons">
                    <button className="login-button">Login</button>
                    <button className="signup-button">Sign Up</button>
                </div>
            </header>

            <div className='EyeCandy'>
                <section className="Opener">
                <div className='Texts'>
                        <h2 >Prioritize smarter, achieve faster.</h2>
                        <p >Welcome to Auranuvor – your AI-powered task prioritization tool. Block distractions, track usage, and visualize productivity with interactive graphs. Auranuvor uses machine learning to prioritize tasks based on your behavior and deadlines, syncing seamlessly across devices. Focus on what matters most with Auranuvor – smart prioritization made simple.</p>
                        <button className="cta-button">Get Started</button>
                </div>
                    <img src={Team} alt='Team png'  />
                    
                </section>

                {/* Features Section */}
                <section className="AI-highlight">
                    <div className="Texts">
                        <h2>Stay focused and locked-IN</h2>
                        <p>Auranuvor uses machine learning to analyze behavior & deadlines.</p>
                    </div>
                    <img src={AI} alt="AI png" className="AI-logo" />
                </section>

                <section className='calender-highlight'>
                    <div className="Texts">
                        <h3>Plan more effectively</h3>
                        <p>Auranuvor allows you to plan your tasks more efficiently and reminds you when deadlines approach.</p>
                    </div>
                    <img src={Calender} alt="Calender Logo" className="Calender-logo" />
                </section>

                {/* Chrome Extension */}
                <section className='chrome'>
                    <h2 className='Track'>Chrome Extension</h2>
                    <p>DownLoad our free chrome extendtion form the chrome store</p>
                    <button>DownLoad</button>
                </section>
            </div>

            <footer></footer>
        </div>
    );
};

export default HomePage;