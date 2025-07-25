import React, { useState } from 'react';
import './Sound.css';

const SoundsVoice = () => {
  const [volume, setVolume] = useState('Normal');
  const [voiceNavigation, setVoiceNavigation] = useState(true);
  const [readRiderMessages, setReadRiderMessages] = useState(true);
  const [announceTripEvents, setAnnounceTripEvents] = useState(true);
  const [seatbeltReminder, setSeatbeltReminder] = useState(true);

  const handleBack = () => {
    window.history.back();
  };

  const ToggleSwitch = ({ isOn, onToggle }) => (
    <div className={`toggle-switch ${isOn ? 'on' : 'off'}`} onClick={onToggle}>
      <div className="toggle-slider"></div>
    </div>
  );

  return (
    <div className="sounds-voice-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="header-title">Sounds & voice</h1>
      </header>

      {/* Content */}
      <div className="content">
        {/* Voice Section */}
        <div className="section">
          <div className="section-header">VOICE</div>
          
          {/* Volume */}
          <div className="setting-item">
            <div className="setting-label">Volume</div>
            <div className="volume-buttons">
              {['Softer', 'Normal', 'Louder'].map((option) => (
                <button
                  key={option}
                  className={`volume-button ${volume === option ? 'active' : ''}`}
                  onClick={() => setVolume(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Navigation */}
          <div className="setting-item toggle-item">
            <span className="setting-label">Voice navigation</span>
            <ToggleSwitch 
              isOn={voiceNavigation} 
              onToggle={() => setVoiceNavigation(!voiceNavigation)} 
            />
          </div>

          {/* Read rider messages */}
          <div className="setting-item toggle-item">
            <span className="setting-label">Read rider messages</span>
            <ToggleSwitch 
              isOn={readRiderMessages} 
              onToggle={() => setReadRiderMessages(!readRiderMessages)} 
            />
          </div>

          {/* Announce trip events */}
          <div className="setting-item toggle-item">
            <span className="setting-label">Announce trip events</span>
            <ToggleSwitch 
              isOn={announceTripEvents} 
              onToggle={() => setAnnounceTripEvents(!announceTripEvents)} 
            />
          </div>

          {/* Seatbelt reminder */}
          <div className="setting-item toggle-item">
            <span className="setting-label">Seatbelt reminder</span>
            <ToggleSwitch 
              isOn={seatbeltReminder} 
              onToggle={() => setSeatbeltReminder(!seatbeltReminder)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundsVoice;