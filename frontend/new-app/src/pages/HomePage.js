import React from 'react';
import '../styles/HomePage.css';

/*For the home section we should add a header where the tabs should include:
-Home
-Fetures
-Pricing:
-intergration
-DashBoard
-Sign/Up or Login */
const HomePage = () => {
    return (
        <div className="homepage">
            <header className="header">
               {/*Logo Section */}
                <div className="logo-section">
                <img src="/images/logo192.png" alt="Auranuvor Logo" className="logo" />
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
                    <button className="login-button">
                        Login
                    </button>
                    <button className="SignUp-button">
                    Sign Up
                    </button>
                </div>
            </header>
        </div>
      );
};

export default HomePage;
