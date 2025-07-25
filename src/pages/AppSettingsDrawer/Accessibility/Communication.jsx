import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Phone, MessageCircle as Chat, PhoneCall } from 'lucide-react';
import './Communication.css';
import { useNavigate } from 'react-router-dom';

const Communication = () => {
  const [contactPreference, setContactPreference] = useState('call-or-chat');
const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  const handleNavigateToSubpage = (route) => {
    navigate(route);
    // Handle navigation to subpages like push notifications, email settings
  };

  const contactOptions = [
    {
      id: 'call-or-chat',
      title: 'Call or chat',
      subtitle: 'Recommended',
      icon: <Phone size={24} />
    },
    {
      id: 'call',
      title: 'Call',
      subtitle: '',
      icon: <PhoneCall size={24} />
    },
    {
      id: 'chat',
      title: 'Chat',
      subtitle: '',
      icon: <Chat size={24} />
    }
  ];

  const RadioButton = ({ selected, onSelect }) => (
    <div className={`radio-button ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="radio-inner"></div>
    </div>
  );

  return (
    <div className="communication-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="header-title">Communication</h1>
      </header>

      {/* Content */}
      <div className="content">
        {/* Contact Preferences Section */}
        <div className="section">
          <div className="section-title">Contact preferences</div>
          <div className="section-subtitle">Choose how you want customers to reach you</div>
          
          <div className="options-container">
            {contactOptions.map((option) => (
              <div 
                key={option.id}
                className="option-item"
                onClick={() => setContactPreference(option.id)}
              >
                <div className="option-icon">
                  {option.icon}
                </div>
                <div className="option-content">
                  <div className="option-title">{option.title}</div>
                  {option.subtitle && (
                    <div className="option-subtitle">{option.subtitle}</div>
                  )}
                </div>
                <RadioButton 
                  selected={contactPreference === option.id}
                  onSelect={() => setContactPreference(option.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Marketing Preferences Section */}
        <div className="section">
          <div className="section-title">Marketing preferences</div>
          <div className="section-subtitle">Choose how to receive special offers, promos, personalised suggestions and more</div>
          
          <div className="marketing-container">
            <div 
              className="marketing-item"
              onClick={() => handleNavigateToSubpage('/app-settings/communication/push-notifications')}
            >
              <div className="marketing-title">Push notifications</div>
              <div className="marketing-arrow">
                <ChevronRight size={20} />
              </div>
            </div>

            <div 
              className="marketing-item"
              onClick={() => handleNavigateToSubpage('/app-settings/communication/email')}
            >
              <div className="marketing-title">Email</div>
              <div className="marketing-arrow">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="save-section">
        <button className="save-button">Save changes</button>
      </div>
    </div>
  );
};

export default Communication;