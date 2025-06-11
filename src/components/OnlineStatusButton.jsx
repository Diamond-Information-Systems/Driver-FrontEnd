import React, { useState, useEffect, useRef } from 'react';
import './OnlineStatusButton.css';

const OnlineStatusButton = ({ isOnline, onStatusChange }) => {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const pressTimer = useRef(null);
  const progressTimer = useRef(null);

  const handlePressStart = () => {
    if (!isOnline) return; // Only allow long press when online
    
    setPressing(true);
    setProgress(0);
    
    pressTimer.current = setTimeout(() => {
      onStatusChange(false);
      setPressing(false);
      setProgress(0);
    }, 3000); // 3 second long press

    // Animate progress
    let startTime = Date.now();
    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / 3000) * 100;
      if (newProgress >= 100) {
        clearInterval(progressTimer.current);
      } else {
        setProgress(newProgress);
      }
    }, 10);
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      clearInterval(progressTimer.current);
    }
    setPressing(false);
    setProgress(0);
  };

  const handleClick = () => {
    if (!isOnline) {
      onStatusChange(true);
    }
  };

  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
        clearInterval(progressTimer.current);
      }
    };
  }, []);

  return (
    <div 
      className={`status-bubble ${isOnline ? 'online' : 'offline'} ${pressing ? 'pressing' : ''}`}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onClick={handleClick}
    >
      <div className="status-progress" style={{ width: `${progress}%` }} />
      <div className="status-icon"></div>
      <span className="status-text">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};

export default OnlineStatusButton;