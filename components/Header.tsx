import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationSymbol from "./NotificationSymbol";
import "./Header.css";
import { useAuth } from "../components/AuthContext"; // ✅ Using context

const Header: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  const { user, logout } = useAuth(); // ✅ Read from context

  useEffect(() => {
    const updateCartCount = () => {
      if (user) {
        const cart = JSON.parse(
          localStorage.getItem(`cart_${user.id}`) || "[]"
        );
        setCartCount(cart.length);
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, [user]); // ✅ Re-run if user changes

  const handleLogout = () => {
    logout(); // ✅ Uses context logout
    navigate("/");
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-container">
          <Link to="/" className="logo">
            Farmer Support
          </Link>
        </div>

        <nav className="main-nav">
          <Link to="/products" className="nav-link">
            Products
          </Link>
          <Link to="/Farmers" className="nav-link">
            Farmers
          </Link>
          <Link to="/seasonalcrops" className="nav-link">
            Seasonal Crops
          </Link>
        </nav>

        <div className="header-actions">
          <NotificationSymbol />
          <Link to="/cart" className="cart-link">
            <i className="fas fa-shopping-cart"></i>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>

          <div className="login-signup-links">
            {user ? (
              <>
                <span className="welcome">Welcome, {user.name}</span>
                <button onClick={handleLogout} className="auth-link logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="auth-link">
                  Login
                </Link>
                <Link to="/signup" className="auth-link signup">
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
