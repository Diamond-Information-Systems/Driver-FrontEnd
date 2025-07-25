import React from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import './VideoRecording.css';

const VideoRecording = () => {
  const handleBack = () => {
    window.history.back();
  };

  const handleRegister = () => {
    console.log('Register dashcam clicked');
    // Handle dashcam registration
  };

  const handleLearnMore = () => {
    console.log('Learn more clicked');
    // Handle learn more navigation
  };

  return (
    <div className="video-recording-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="header-title">Video recording</h1>
      </header>

      {/* Content */}
      <div className="content">
        {/* Main Title */}
        <div className="main-section">
          <h2 className="page-title">Video recording</h2>
        </div>

        {/* Dashcam Registration Section */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">Dashcam registration</div>
            <button className="register-button" onClick={handleRegister}>
              Register
            </button>
          </div>
          <div className="section-description">
            When you register your dashcam on Uber, any passenger requesting a trip is notified before they enter your vehicle that you may have a camera installed.
          </div>
        </div>

        {/* What Riders See Section */}
        <div className="section">
          <h3 className="section-title">What riders see</h3>
          
          <div className="notification-preview">
            <div className="map-background">
              <div className="notification-popup">
                <div className="notification-icon">
                  <div className="shield-icon">🛡️</div>
                </div>
                <div className="notification-text">
                  Driver may have a dashcam to record trips for added safety
                </div>
              </div>
            </div>
          </div>

          <div className="explanation-text">
            When you register your dashcam on Uber, any passenger requesting a trip is notified before they enter your vehicle that you have installed the camera. As you are responsible for your vehicle and dashcam, please make sure to check and adhere to local regulations for notifying your riders.
          </div>
        </div>

        {/* Dashcam Resources Section */}
        <div className="section">
          <h3 className="section-title">Dashcam resources</h3>
          
          <div 
            className="resource-item"
            onClick={handleLearnMore}
          >
            <div className="resource-icon">
              <BookOpen size={24} />
            </div>
            <div className="resource-content">
              <div className="resource-title">Learn more about using a dashcam with Uber</div>
            </div>
            <div className="resource-arrow">
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRecording;