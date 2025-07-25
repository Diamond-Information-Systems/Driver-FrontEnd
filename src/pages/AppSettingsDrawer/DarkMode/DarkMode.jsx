import React, { useState } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import './DarkMode.css';

const NightMode = () => {
  const [selectedMode, setSelectedMode] = useState('automatic');

  const handleBack = () => {
    window.history.back();
  };

  const modeOptions = [
    {
      id: 'automatic',
      title: 'Automatic (time of day)',
      description: 'Switches between light and dark based on your location\'s sunrise and sunset times'
    },
    {
      id: 'always-on',
      title: 'Always on',
      description: 'Use dark theme at all times'
    },
    {
      id: 'always-off',
      title: 'Always off',
      description: 'Use light theme at all times'
    },
    {
      id: 'phone-setting',
      title: 'Use phone setting',
      description: 'Follow your device\'s system theme preference'
    }
  ];

  const RadioButton = ({ selected, onSelect }) => (
    <div className={`radio-button ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="radio-inner"></div>
    </div>
  );

  return (
    <div className="night-mode-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="header-title">Night mode</h1>
      </header>

      {/* Content */}
      <div className="content">
        {/* Description */}
        <div className="description">
          Choose when to use the dark theme in the app. Dark theme can help reduce eye strain in low-light conditions.
        </div>

        {/* Mode Options */}
        <div className="options-container">
          {modeOptions.map((option) => (
            <div 
              key={option.id}
              className="option-item"
              onClick={() => setSelectedMode(option.id)}
            >
              <div className="option-content">
                <div className="option-title">{option.title}</div>
                <div className="option-description">{option.description}</div>
              </div>
              <RadioButton 
                selected={selectedMode === option.id}
                onSelect={() => setSelectedMode(option.id)}
              />
            </div>
          ))}
        </div>

        {/* Preview Section */}
        <div className="preview-section">
          <div className="preview-title">Preview</div>
          <div className="preview-container">
            <div className={`preview-demo ${selectedMode === 'always-off' ? 'light' : 'dark'}`}>
              <div className="preview-header">
                <div className="preview-back-button"></div>
                <div className="preview-title-text">App Preview</div>
              </div>
              <div className="preview-content">
                <div className="preview-item"></div>
                <div className="preview-item"></div>
                <div className="preview-item short"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="info-text">
            💡 When automatic mode is enabled, the app will switch to dark theme during nighttime hours based on your location.
          </div>
        </div>
      </div>
    </div>
  );
};

export default NightMode;