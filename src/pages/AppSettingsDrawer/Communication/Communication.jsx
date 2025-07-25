import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Clock, Bell, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Communication.css';

const CommunicationSettings = () => {
  const [quickReplies, setQuickReplies] = useState(true);
  const [autoGreeting, setAutoGreeting] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [messageSounds, setMessageSounds] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(true);
const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };

  const handleNavigateToSubpage = (route) => {
    navigate(route);
    // Handle navigation to subpages
  };

  const ToggleSwitch = ({ isOn, onToggle }) => (
    <div className={`toggle-switch ${isOn ? 'on' : 'off'}`} onClick={onToggle}>
      <div className="toggle-slider"></div>
    </div>
  );

  return (
    <div className="communication-settings-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="header-title">Communication</h1>
      </header>

      {/* Content */}
      <div className="content">
        {/* Quick Responses Section */}
        <div className="section">
          <div className="section-title">Quick responses</div>
          <div className="section-subtitle">Pre-written messages to send to riders quickly</div>
          
          <div className="settings-container">
            <div 
              className="setting-item navigation-item"
              onClick={() => handleNavigateToSubpage('/app-settings/quick-responses')}
            >
              <div className="setting-icon">
                <MessageCircle size={24} />
              </div>
              <div className="setting-content">
                <div className="setting-title">Manage quick responses</div>
                <div className="setting-subtitle">Edit and customize your pre-written messages</div>
              </div>
              <div className="setting-arrow">
                <ChevronRight size={20} />
              </div>
            </div>

            <div className="setting-item toggle-item">
              <div className="setting-icon">
                <Clock size={24} />
              </div>
              <div className="setting-content">
                <div className="setting-title">Enable quick replies</div>
                <div className="setting-subtitle">Show quick reply suggestions in chat</div>
              </div>
              <ToggleSwitch 
                isOn={quickReplies} 
                onToggle={() => setQuickReplies(!quickReplies)}
              />
            </div>
          </div>
        </div>

        {/* Auto-responses Section */}
        <div className="section">
          <div className="section-title">Auto-responses</div>
          <div className="section-subtitle">Automatically send messages when certain events occur</div>
          
          <div className="settings-container">
            <div 
              className="setting-item navigation-item"
              onClick={() => handleNavigateToSubpage('/app-settings/auto-responses')}
            >
              <div className="setting-icon">
                <MessageCircle size={24} />
              </div>
              <div className="setting-content">
                <div className="setting-title">Auto-response templates</div>
                <div className="setting-subtitle">Customize automatic messages for different scenarios</div>
              </div>
              <div className="setting-arrow">
                <ChevronRight size={20} />
              </div>
            </div>

            <div className="setting-item toggle-item">
              <div className="setting-content">
                <div className="setting-title">Auto-greeting</div>
                <div className="setting-subtitle">Automatically greet riders when they book a trip</div>
              </div>
              <ToggleSwitch 
                isOn={autoGreeting} 
                onToggle={() => setAutoGreeting(!autoGreeting)}
              />
            </div>
          </div>
        </div>

        {/* Chat Settings Section */}
        <div className="section">
          <div className="section-title">Chat settings</div>
          <div className="section-subtitle">Customize your messaging experience</div>
          
          <div className="settings-container">
            <div className="setting-item toggle-item">
              <div className="setting-content">
                <div className="setting-title">Read receipts</div>
                <div className="setting-subtitle">Let riders know when you've read their messages</div>
              </div>
              <ToggleSwitch 
                isOn={readReceipts} 
                onToggle={() => setReadReceipts(!readReceipts)}
              />
            </div>

            <div className="setting-item toggle-item">
              <div className="setting-content">
                <div className="setting-title">Typing indicator</div>
                <div className="setting-subtitle">Show when you're typing a message</div>
              </div>
              <ToggleSwitch 
                isOn={typingIndicator} 
                onToggle={() => setTypingIndicator(!typingIndicator)}
              />
            </div>
          </div>
        </div>

        {/* Notification Settings Section */}
        <div className="section">
          <div className="section-title">Message notifications</div>
          <div className="section-subtitle">Control how you receive message alerts</div>
          
          <div className="settings-container">
            <div className="setting-item toggle-item">
              <div className="setting-icon">
                <Bell size={24} />
              </div>
              <div className="setting-content">
                <div className="setting-title">Message notifications</div>
                <div className="setting-subtitle">Get notified when you receive new messages</div>
              </div>
              <ToggleSwitch 
                isOn={messageNotifications} 
                onToggle={() => setMessageNotifications(!messageNotifications)}
              />
            </div>

            <div className="setting-item toggle-item">
              <div className="setting-icon">
                <Volume2 size={24} />
              </div>
              <div className="setting-content">
                <div className="setting-title">Message sounds</div>
                <div className="setting-subtitle">Play sound when receiving messages</div>
              </div>
              <ToggleSwitch 
                isOn={messageSounds} 
                onToggle={() => setMessageSounds(!messageSounds)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationSettings;