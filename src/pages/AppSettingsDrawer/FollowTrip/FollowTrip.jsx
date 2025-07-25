import React from 'react';
import { ChevronLeft } from 'lucide-react';
import './FollowTrip.css';

const FollowTrip = () => {
  const handleBack = () => {
    window.history.back();
  };

  const handleChooseContact = () => {
    console.log('Choose contact clicked');
    // Handle contact selection logic
  };

  return (
    <div className="follow-trip-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="header-title">Follow my trip</h1>
      </header>

      {/* Hero Image */}
      <div className="hero-section">
        <img 
          src="/images/Directions.png" 
          alt="Follow Trip Illustration" 
          className="hero-image"
        />
      </div>

      {/* Content */}
      <div className="content-section">
        <div className="content-container">
          <h2 className="main-title">Let friends and family follow along</h2>
          
          <div className="description-section">
            <p className="description-text">
              You can send people a link that shows your live location and trip details. Then they can check in on you while you drive.
            </p>
            
            <p className="instruction-text">
              To share directly through the Vaye app, choose a contact. To send the link by text or with a different app, go to your Safety Toolkit.
            </p>
          </div>
        </div>

        {/* Choose Contact Button */}
        <div className="button-section">
          <button className="choose-contact-button" onClick={handleChooseContact}>
            Choose contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowTrip;