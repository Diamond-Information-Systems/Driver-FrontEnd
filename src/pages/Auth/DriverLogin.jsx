import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./DriverLogin.css";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { useAuthOperations } from "../../hooks/AuthHook";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { handleLogin } = useAuthOperations();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const data = await login({ email, password });
      console.log("Login successful:", data);
      handleLogin(data);
      setIsLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Background */}
      <div className="background">
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>
      </div>

      {/* Main container */}
      <div className="container">
        <div className="main-content">
          
          {/* Car Image Section */}
          <div className="car-section">
            <div className="car-container">
              <div className="car-glow"></div>
              <div className="car-glass-container">
                <img 
                  src="images/car3.4.png" 
                  alt="Car" 
                  className="car-image"
                />
              </div>
            </div>
          </div>

          {/* Login Form Section */}
          <div className="login-section">
            <div className="login-container">
              
              {/* Header */}
              <div className="login-header">
                <h1 className="login-title">Welcome back</h1>
                <p className="login-subtitle">Sign in to your account</p>
              </div>

              {/* Form */}
              <form className="login-form" onSubmit={handleSubmit}>
                {/* Email Input */}
                <div className="form-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="form-input"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="form-group password-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="form-input password-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Remember Me */}
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me">Remember me</label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="login-button"
                >
                  {isLoading ? (
                    <div className="loading">
                      <div className="loading-spinner"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Footer Links */}
              <div className="login-footer">
                <button 
                  type="button"
                  className="forgot-password"
                  onClick={() => {/* Handle forgot password */}}
                >
                  Forgot password?
                </button>
                
                <div className="register-section">
                  <p className="register-text">
                    New driver?
                    <button 
                      type="button"
                      className="register-link"
                      onClick={() => navigate("/driver-registration")}
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;