import React, { useState } from 'react';
import { Car, Eye, EyeOff } from 'lucide-react';
import './DriverLogin.css';
import vayeLogo from '../../assets/images/VayeLogoB.png'; // Adjust the path as necessary

const DriverLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="app-layout">
      <div className="login-container">
        {/* Logo Section */}
        <div className="login-header">
          <div className="logo-container">
            <img src={vayeLogo} alt="Vaye" className="logo-image1" />
          </div>
   
       
        </div>

        {/* Login Form */}
        <div className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="login-input"
              required
            />
          </div>
          
          <div className="form-group password-group">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="login-input password-input"
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

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`login-button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <div className="login-loading">
                <div className="loading-spinner"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

        {/* Additional Options */}
        <div className="login-options">
          <button className="forgot-password">
            Forgot password?
          </button>
        </div>

        <div className="register-section">
          <p className="register-text">
            New driver? 
            <button className="register-link">Register here</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverLogin;