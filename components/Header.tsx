import React from "react";
import { Link } from "react-router-dom";
import NotificationSymbol from "./NotificationSymbol";
import "./Header.css";

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-container">
          <Link to="/" className="logo">
            Farmer Support
          </Link>
        </div>

        <nav className="main-nav">
          <Link to="/" className="nav-link">
            Products
          </Link>
          <Link to="/Farmers" className="nav-link">
            Farmers
          </Link>
        </nav>

        <div className="header-actions">
          <NotificationSymbol />
          <div className="login-signup-links">
            <Link to="/login" className="auth-link">
              Login
            </Link>
            <Link to="/signup" className="auth-link signup">
              Signup
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
