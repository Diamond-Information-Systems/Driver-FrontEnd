import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import './SpeedLimit.css';

const SpeedLimit = () => {
  const [showSpeedLimit, setShowSpeedLimit] = useState(true);
  const [belowSpeedAlert, setBelowSpeedAlert] = useState('10kmh');
  const [aboveSpeedAlert, setAboveSpeedAlert] = useState('10kmh');

  const handleBack = () => {
    window.history.back();
  };

  const ToggleSwitch = ({ isOn, onToggle }) => (
    <div className={`toggle-switch ${isOn ? 'on' : 'off'}`} onClick={onToggle}>
      <div className="toggle-slider"></div>
    </div>
  );

  const RadioButton = ({ selected, onSelect }) => (
    <div className={`radio-button ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="radio-inner"></div>
    </div>
  );

  const speedOptions = ['1kmh', '10kmh', '15kmh'];

  return (
    <div className="speed-limit-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="header-title">Speed limit</h1>
      </header>

      {/* Content */}
      <div className="content">
        {/* Show Speed Limit */}
        <div className="setting-section">
          <div className="setting-item toggle-setting">
            <div className="setting-content">
              <div className="setting-title">Show speed limit</div>
            </div>
            <ToggleSwitch 
              isOn={showSpeedLimit} 
              onToggle={() => setShowSpeedLimit(!showSpeedLimit)}
            />
          </div>
        </div>

        {/* Speeding Alerts */}
        <div className="setting-section">
          <div className="section-header">
            <div className="section-title">Speeding alerts</div>
            <div className="section-subtitle">Set when you want to get alerts</div>
          </div>

          {/* Speed limit below 60 km/h */}
          <div className="speed-category">
            <div className="speed-category-title">Speed limit below 60 km/h</div>
            <div className="speed-options">
              {speedOptions.map((option) => (
                <div 
                  key={`below-${option}`}
                  className="speed-option"
                  onClick={() => setBelowSpeedAlert(option)}
                >
                  <RadioButton 
                    selected={belowSpeedAlert === option}
                    onSelect={() => setBelowSpeedAlert(option)}
                  />
                  <span className="speed-text">{option}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Speed limit 60 km/h or above */}
          <div className="speed-category">
            <div className="speed-category-title">Speed limit 60 km/h or above</div>
            <div className="speed-options">
              {speedOptions.map((option) => (
                <div 
                  key={`above-${option}`}
                  className="speed-option"
                  onClick={() => setAboveSpeedAlert(option)}
                >
                  <RadioButton 
                    selected={aboveSpeedAlert === option}
                    onSelect={() => setAboveSpeedAlert(option)}
                  />
                  <span className="speed-text">{option}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedLimit;