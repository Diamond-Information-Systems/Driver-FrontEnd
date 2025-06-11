import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Splash from './components/Splash';
import DriverLogin from './pages/Auth/DriverLogin';
import DriverDashboard from './pages/Dashboard/DriverDashboard';
import PaymentReturn from './components/PaymentReturn'; // You'll need to create this
import PaymentCallback from './components/PaymentCallback'; // You'll need to create this
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading');

  const handleLogin = () => {
    setLoadingMessage('Logging in');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setLoadingMessage('Logging out');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(false);
      setIsLoading(false);
    }, 1000);
  };

   useEffect(() => {
    // Initial app load sequence with proper timing
    setLoadingMessage('');
    setIsLoading(true);

    // Keep splash screen visible for 2.5 seconds
    const splashTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    // Start fading in content only after splash is completely gone
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 4000); // 500ms after splash starts fading out

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(contentTimer);
    };
  }, []);

return (
    <Router>
      <Splash 
        isLoading={isLoading} 
        message={loadingMessage}
        dots={true} 
      />
      <div className={`app ${showContent ? 'fade-in' : ''}`}>
        <Routes>
          <Route path="/payment/return" element={<PaymentReturn />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route 
            path="/" 
            element={
              isLoggedIn ? (
                <DriverDashboard onLogout={handleLogout} />
              ) : (
                <DriverLogin onLogin={handleLogin} />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;