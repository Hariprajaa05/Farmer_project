import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

interface LoginResponse {
  _id?: string;
  role?: string;
  message?: string; //optional (?) handles both success and error neatly.
}

const Login: React.FC = () => {
  const [name, setName] = useState("");
  const [pass, setPass] = useState(""); // still a string in state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !pass) {
      setError("Name and password are required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, pass: Number(pass) }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.role === "farmer") {
        const farmerId = data._id;
        if (!farmerId) {
          throw new Error("Farmer ID is missing in server response");
        }

        setTimeout(() => {
          navigate(`/farmer/${farmerId}/edit`); // <-- redirecting to edit page
        }, 500);
      } else {
        setError("Unauthorized role");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="pass">Password</label>
          <input
            type="password"
            id="pass"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <div className="signup-link">
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
