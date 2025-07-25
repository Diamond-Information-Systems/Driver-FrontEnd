import React, { useState } from 'react';
import './Hearing.css';

const Hearing = () => {
  const [hearingStatus, setHearingStatus] = useState('none');
  const [visualAlerts, setVisualAlerts] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(false);
  const [subtitles, setSubtitles] = useState(false);

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

  const hearingOptions = [
    {
      id: 'none',
      title: 'No hearing difficulties',
      description: 'I can hear normally'
    },
    {
      id: 'hard-of-hearing',
      title: 'Hard of hearing',
      description: 'I have some difficulty hearing'
    },
    {
      id: 'deaf',
      title: 'Deaf',
      description: 'I am deaf or have significant hearing loss'
    }
  ];

  return (
    <div className="hearing-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="header-title">Hearing</h1>
      </header>

      {/* Content */}
      <div className="content">
        {/* Description */}
        <div className="description">
          Help us provide you with the best experience by letting us know about your hearing preferences. This information helps us customize notifications and communication methods.
        </div>

        {/* Hearing Status Section */}
        <div className="section">
          <div className="section-title">Hearing status</div>
          <div className="section-subtitle">Choose the option that best describes your hearing</div>
          
          <div className="options-container">
            {hearingOptions.map((option) => (
              <div 
                key={option.id}
                className="option-item"
                onClick={() => setHearingStatus(option.id)}
              >
                <div className="option-content">
                  <div className="option-title">{option.title}</div>
                  <div className="option-description">{option.description}</div>
                </div>
                <RadioButton 
                  selected={hearingStatus === option.id}
                  onSelect={() => setHearingStatus(option.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility Features Section */}
        <div className="section">
          <div className="section-title">Accessibility features</div>
          <div className="section-subtitle">Customize how you receive notifications and feedback</div>
          
          <div className="features-container">
            <div className="feature-item">
              <div className="feature-content">
                <div className="feature-title">Enhanced visual alerts</div>
                <div className="feature-description">Use screen flashes and visual indicators for important notifications</div>
              </div>
              <ToggleSwitch 
                isOn={visualAlerts} 
                onToggle={() => setVisualAlerts(!visualAlerts)}
              />
            </div>

            <div className="feature-item">
              <div className="feature-content">
                <div className="feature-title">Enhanced haptic feedback</div>
                <div className="feature-description">Stronger vibrations for trip notifications and alerts</div>
              </div>
              <ToggleSwitch 
                isOn={hapticFeedback} 
                onToggle={() => setHapticFeedback(!hapticFeedback)}
              />
            </div>

            <div className="feature-item">
              <div className="feature-content">
                <div className="feature-title">Text notifications preference</div>
                <div className="feature-description">Prefer text-based communication over voice calls when possible</div>
              </div>
              <ToggleSwitch 
                isOn={subtitles} 
                onToggle={() => setSubtitles(!subtitles)}
              />
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="info-section">
          <div className="info-text">
            This information is used to improve your experience and is kept private. Drivers and riders will not see these details unless you choose to share them.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hearing;