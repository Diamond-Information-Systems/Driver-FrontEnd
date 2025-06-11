import React, { useState, useEffect } from 'react';
import './Splash.css';
import vayeLogo from '../assets/images/VayeLogoB.png'; // Adjust the path as necessary

const Splash = ({ isLoading, message = 'Loading', dots = true }) => {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    let dotInterval;
    if (dots && isLoading) {
      dotInterval = setInterval(() => {
        setDotCount((prev) => (prev + 1) % 4);
      }, 2500);
    }
    return () => clearInterval(dotInterval);
  }, [dots, isLoading]);

  const renderDots = () => {
    return dots ? '.'.repeat(dotCount) : '';
  };

  return (
    <div className={`splash-screen ${isLoading ? 'visible' : 'fade-out'}`}>
      <div className="splash-content">
        <div className="vaye-logo">
          <img src={vayeLogo} alt="Vaye" className="logo-image" />
        </div>
        <div className="splash-message">
          {message}{renderDots()}
        </div>
      </div>
    </div>
  );
};

export default Splash;