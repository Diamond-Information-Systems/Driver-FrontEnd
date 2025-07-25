import React, { useState } from 'react';
import './Navigation.css';

const Navigation = () => {
  const [selectedNavigation, setSelectedNavigation] = useState('google-maps');
  const [autoNavigate, setAutoNavigate] = useState(true);

  const handleBack = () => {
    window.history.back();
  };

  const ToggleSwitch = ({ isOn, onToggle, disabled = false }) => (
    <div 
      className={`toggle-switch ${isOn ? 'on' : 'off'} ${disabled ? 'disabled' : ''}`} 
      onClick={disabled ? null : onToggle}
    >
      <div className="toggle-slider"></div>
    </div>
  );

  const navigationOptions = [
    {
      id: 'vaye-navigation',
      title: 'Vaye Navigation',
      subtitle: 'Recommended: Stay in this app',
      selected: false,
      disabled: true
    },
    {
      id: 'google-maps',
      title: 'Google Maps',
      subtitle: 'Launched in separate app',
      selected: true,
      disabled: false
    },
    {
      id: 'waze',
      title: 'Waze',
      subtitle: 'Launched in separate app',
      selected: false,
      disabled: true
    },
    {
      id: 'apple-maps',
      title: 'Apple Maps',
      subtitle: 'Launched in separate app',
      selected: false,
      disabled: true
    }
  ];

  return (
    <div className="navigation-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="header-title">Navigation</h1>
      </header>

      {/* Content */}
      <div className="content">
        {/* Navigation App Section */}
        <div className="section">
          <div className="section-header">NAVIGATION APP</div>
          
          {navigationOptions.map((option) => (
            <div 
              key={option.id} 
              className={`navigation-option ${option.disabled ? 'disabled' : ''}`}
            >
              <div className="navigation-option-content">
                <div className="navigation-option-text">
                  <div className="navigation-option-title">{option.title}</div>
                  <div className="navigation-option-subtitle">
                    {option.subtitle}
                    {option.disabled && (
                      <span className="coming-soon"> • Coming Soon</span>
                    )}
                  </div>
                </div>
                <div className="navigation-option-indicator">
                  {option.selected && !option.disabled && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Settings Section */}
        <div className="section">
          <div className="section-header">NAVIGATION SETTINGS</div>
          
          <div className="setting-item toggle-item disabled">
            <div className="setting-text">
              <span className="setting-label">Auto-navigate</span>
              <span className="setting-description">
                Start trips in turn-by-turn mode.
                You'll see a brief route overview first.
                <span className="coming-soon"> • Coming Soon</span>
              </span>
            </div>
            <ToggleSwitch 
              isOn={autoNavigate} 
              onToggle={() => setAutoNavigate(!autoNavigate)}
              disabled={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;