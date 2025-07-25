import React, { useState } from 'react';
import { ChevronLeft, HelpCircle, Shield, Clock, X } from 'lucide-react';
import './PinVerification.css';

const PinVerification = () => {
  const [selectedOption, setSelectedOption] = useState('dont-verify');

  const handleBack = () => {
    window.history.back();
  };

  const handleSave = () => {
    console.log('Saving PIN verification setting:', selectedOption);
  };

  const verificationOptions = [
    {
      id: 'verify-all',
      title: 'Verify all trips',
      description: 'Every trip from now on',
      icon: <Shield size={20} />
    },
    {
      id: 'verify-next',
      title: 'Verify next session',
      description: 'Until the next time I go offline',
      icon: <Clock size={20} />
    },
    {
      id: 'dont-verify',
      title: "Don't verify",
      description: 'No trips',
      icon: <X size={20} />
    }
  ];

  const RadioButton = ({ selected, onSelect }) => (
    <div className={`radio-button ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="radio-inner"></div>
    </div>
  );

  return (
    <div className="pin-verification-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="header-title">PIN verification</h1>
        <button className="help-button">
          <HelpCircle size={24} />
        </button>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Hero Section */}
        <div className="hero-section">
          <img 
            src="/images/PinVerification.png" 
            alt="PIN Verification" 
            className="hero-image"
          />
        </div>

        {/* Content Section */}
        <div className="content-section">
          <div className="content-header">
            <h2 className="title">PIN verification</h2>
            <p className="description">
              Use a 4-digit code to help make sure the right person gets in your car.
            </p>
          </div>

          {/* Options */}
          <div className="options-grid">
            {verificationOptions.map((option) => (
              <div 
                key={option.id}
                className={`option-card ${selectedOption === option.id ? 'selected' : ''}`}
                onClick={() => setSelectedOption(option.id)}
              >
                <div className="option-header">
                  <div className="option-icon">
                    {option.icon}
                  </div>
                  <RadioButton 
                    selected={selectedOption === option.id}
                    onSelect={() => setSelectedOption(option.id)}
                  />
                </div>
                <div className="option-info">
                  <div className="option-title">{option.title}</div>
                  <div className="option-description">{option.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="save-section">
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinVerification;