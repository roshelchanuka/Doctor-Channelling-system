import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="logo">
          <span className="plus-icon">+</span> HealthCare
        </div>
        <div className="nav-links">
          <Link to="/login" className="login-link">Login</Link>
          <Link to="/register" className="register-btn">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">Welcome to HealthCare</div>
          <h1 className="hero-title">
            Your Health Is Our <span className="highlight">Priority</span>
          </h1>
          <p className="hero-subtitle">
            Book an appointment with the best doctors instantly. 
            Experience a seamless, fast, and secure channelling process from the comfort of your home.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="primary-cta">Book Now</Link>
            <Link to="/login" className="secondary-cta">Learn More</Link>
          </div>
        </div>
        <div className="hero-image">
          {/* Abstract geometric medical illustration using CSS */}
          <div className="abstract-art">
            <div className="circle-main"></div>
            <div className="circle-small"></div>
            <div className="cross"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🩺</div>
            <h3>Expert Doctors</h3>
            <p>Access a wide network of highly qualified specialists across various medical fields.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant Booking</h3>
            <p>No more long queues. Book your appointment instantly with our live scheduling system.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your medical history and personal data are protected with enterprise-grade security.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} HealthCare System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
