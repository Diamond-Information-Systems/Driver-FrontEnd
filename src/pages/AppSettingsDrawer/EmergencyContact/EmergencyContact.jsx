import React from 'react';
import { ChevronLeft, Headphones, Lock } from 'lucide-react';
import './EmergencyContact.css';

const EmergencyContact = () => {
  const handleBack = () => {
    window.history.back();
  };

  const handleNext = () => {
    console.log('Next clicked');
    // Handle next step logic
  };

  const handleLearnMore = () => {
    console.log('Learn more clicked');
    // Handle learn more logic
  };

  return (
    <div className="emergency-contact-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="header-title">Emergency Contacts</h1>
      </header>

      {/* Hero Image */}
      <div className="hero-section">
        <img 
          src="/images/EmergencyContact.png" 
          alt="Emergency Contact Illustration" 
          className="hero-image"
        />
      </div>

      {/* Content */}
      <div className="content-section">
        <div className="content-container">
          <h2 className="main-title">Set an emergency contact</h2>
          
          <div className="info-section">
            <div className="info-item">
              <div className="info-icon">
                <Headphones size={24} />
              </div>
              <div className="info-text">
                <p>Uber will call them if a safety incident has been reported and you can't be reached.</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Lock size={24} />
              </div>
              <div className="info-text">
                <p>
                  All contact information will be kept confidential. They'll only be called in an emergency. {' '}
                  <button className="learn-more-link" onClick={handleLearnMore}>
                    Learn more.
                  </button>
                </p>
              </div>
            </div>
          </div>

          <div className="disclaimer">
            <p>Make sure your contact is comfortable with Uber using their info for this purpose.</p>
          </div>
        </div>

        {/* Next Button */}
        <div className="button-section">
          <button className="next-button" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContact;