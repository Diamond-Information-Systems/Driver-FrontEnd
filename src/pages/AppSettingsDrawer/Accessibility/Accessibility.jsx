import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Ear, Zap, Smartphone, MessageCircle } from 'lucide-react';
import './Accessibility.css';
import { useNavigate } from 'react-router-dom';

const Accessibility = () => {
  const [screenFlash, setScreenFlash] = useState(false);
  const [vibration, setVibration] = useState(false);
 const navigate = useNavigate();
  const handleBack = () => {
   navigate(-1); // Navigate back to the previous page
  };

  const handleNavigateToSubpage = (route) => {
    navigate(route); 
  };

  const ToggleSwitch = ({ isOn, onToggle, disabled = false }) => (
    <div 
      className={`toggle-switch ${isOn ? 'on' : 'off'} ${disabled ? 'disabled' : ''}`} 
      onClick={disabled ? null : onToggle}
    >
      <div className="toggle-slider"></div>
    </div>
  );

  return (
    <div className="accessibility-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="header-title">Accessibility</h1>
      </header>

      {/* Content */}
      <div className="content">
        {/* Description */}
        <div className="description">
          Set your accessibility preferences. To learn more about accessibility at Uber, 
          <span className="link"> visit our website</span>.
        </div>

        {/* Settings List */}
        <div className="settings-list">
          {/* Hearing - Navigation Item */}
          <div 
            className="setting-item navigation-item"
            onClick={() => handleNavigateToSubpage('/app-settings/accessibility/hearing')}
          >
            <div className="setting-icon">
              <Ear size={24} />
            </div>
            <div className="setting-content">
              <div className="setting-title">Hearing</div>
              <div className="setting-subtitle">Choose to disclose whether you are deaf or hard of hearing</div>
            </div>
            <div className="setting-arrow">
              <ChevronRight size={20} />
            </div>
          </div>

          {/* Screen flash for requests - Toggle Item */}
          <div className="setting-item toggle-item">
            <div className="setting-icon">
              <Zap size={24} />
            </div>
            <div className="setting-content">
              <div className="setting-title">Screen flash for requests</div>
              <div className="setting-subtitle">Your phone will flash and play an audio alert upon receiving a request.</div>
            </div>
            <ToggleSwitch 
              isOn={screenFlash} 
              onToggle={() => setScreenFlash(!screenFlash)}
            />
          </div>

          {/* Vibration for requests - Toggle Item */}
          <div className="setting-item toggle-item">
            <div className="setting-icon">
              <Smartphone size={24} />
            </div>
            <div className="setting-content">
              <div className="setting-title">Vibration for requests</div>
              <div className="setting-subtitle">Your phone will vibrate and play an audio alert upon receiving a request.</div>
            </div>
            <ToggleSwitch 
              isOn={vibration} 
              onToggle={() => setVibration(!vibration)}
            />
          </div>

          {/* Communication settings - Navigation Item */}
          <div 
            className="setting-item navigation-item"
            onClick={() => handleNavigateToSubpage('/app-settings/accessibility/communication')}
          >
            <div className="setting-icon">
              <MessageCircle size={24} />
            </div>
            <div className="setting-content">
              <div className="setting-title">Communication settings</div>
              <div className="setting-subtitle">Let others know how you need to or prefer to communicate.</div>
            </div>
            <div className="setting-arrow">
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;