import React from 'react';
import {
  Volume2,
  Navigation,
  Accessibility,
  MessageCircle,
  Moon,
  Lock,
  MapPin,
  Phone,
  Gauge,
  Video,
  ChevronRight,
  X,
  Settings
} from 'lucide-react';
import './AppSettings.css';

const AppSettingsDrawer = ({ isOpen, onClose, onMenuItemClick }) => {
  // App settings menu items
  const settingsItems = [
    {
      id: 'sounds-voice',
      icon: Volume2,
      title: 'Sounds & Voice',
      description: 'Audio alerts, voice guidance, and notification sounds',
      color: '#4facfe'
    },
    {
      id: 'navigation',
      icon: Navigation,
      title: 'Navigation',
      description: 'Route preferences, map display, and GPS settings',
      color: '#51cf66'
    },
    {
      id: 'accessibility',
      icon: Accessibility,
      title: 'Accessibility',
      description: 'Font size, contrast, and accessibility features',
      color: '#ffd43b'
    },
    {
      id: 'communication',
      icon: MessageCircle,
      title: 'Communication',
      description: 'Chat settings, auto-responses, and messaging',
      color: '#ff6b6b'
    },
    {
      id: 'night-mode',
      icon: Moon,
      title: 'Night Mode',
      description: 'Dark theme and low-light display settings',
      color: '#a78bfa'
    },
    {
      id: 'pin-verification',
      icon: Lock,
      title: 'Pin Verification',
      description: 'Trip confirmation and security PIN settings',
      color: '#4facfe'
    },
    {
      id: 'follow-my-trip',
      icon: MapPin,
      title: 'Follow my Trip',
      description: 'Trip sharing and real-time location features',
      color: '#51cf66'
    },
    {
      id: 'emergency-contacts',
      icon: Phone,
      title: 'Emergency Contacts',
      description: 'Add and manage emergency contact information',
      color: '#ff6b6b'
    },
    {
      id: 'speed-limit',
      icon: Gauge,
      title: 'Speed Limit',
      description: 'Speed alerts, warnings, and limit notifications',
      color: '#ffd43b'
    },
    {
      id: 'video-recording',
      icon: Video,
      title: 'Video Recording',
      description: 'Trip recording, dash cam, and video settings',
      color: '#a78bfa'
    }
  ];

  const handleMenuClick = (itemId) => {
    onMenuItemClick?.(itemId);
    onClose(); // Close drawer after clicking menu item
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="app-settings-backdrop" onClick={onClose} />
      
      {/* Drawer */}
      <div className={`app-settings-drawer ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="app-settings-header">
          <div className="settings-header-content">
            <div className="header-icon">
              <Settings size={28} />
            </div>
            <div className="header-text">
              <h2>App Settings</h2>
              <p>Customize your driving experience</p>
            </div>
          </div>
          <button className="settings-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="app-settings-content">
          <div className="settings-list">
            {settingsItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  className="settings-item"
                  onClick={() => handleMenuClick(item.id)}
                  style={{ '--item-color': item.color }}
                >
                  <div className="settings-item-left">
                    <div className="settings-item-icon">
                      <IconComponent size={22} />
                    </div>
                    <div className="settings-item-content">
                      <span className="settings-item-title">{item.title}</span>
                      <span className="settings-item-description">{item.description}</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="settings-item-arrow" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default AppSettingsDrawer;