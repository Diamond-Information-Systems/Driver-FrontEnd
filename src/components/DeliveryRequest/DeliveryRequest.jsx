import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Star,
  Navigation,
  CheckCircle,
  XCircle
} from 'lucide-react';
import './DeliveryRequest.css';

function DeliveryRequest({ 
  request, 
  onAccept, 
  onDecline, 
  timeRemaining 
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAccept = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onAccept();
    }, 300);
  };

  const handleDecline = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onDecline();
    }, 300);
  };

  // Format time remaining
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const passenger = request.passengers[0];
  const pickup = request.stops[0];
  const dropoff = request.stops[1];
  
  return (
    <div className={`delivery-request-overlay ${isAnimating ? 'animating' : ''}`}>
      <div className="delivery-request-card">
        {/* Header */}
        <div className="delivery-header">
          <div className="delivery-type">
            <Package size={24} color="var(--color-delivery)" />
            <span>DELIVERY REQUEST</span>
          </div>
          <div className="timer">
            <Clock size={16} />
            <span className={timeRemaining <= 5 ? 'urgent' : ''}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="customer-section">
          <div className="customer-info">
            <User size={20} />
            <div className="customer-details">
              <span className="customer-name">{passenger.name}</span>
              <div className="rating">
                <Star size={14} fill="currentColor" />
                <span>{passenger.rating || 'New'}</span>
              </div>
            </div>
          </div>
          <button className="contact-btn">
            <Phone size={16} />
          </button>
        </div>

        {/* Delivery Route */}
        <div className="delivery-route">
          <div className="route-step pickup">
            <div className="step-indicator">
              <Package size={16} />
            </div>
            <div className="step-details">
              <span className="step-label">PICKUP</span>
              <span className="step-address">{pickup.location}</span>
            </div>
          </div>
          
          <div className="route-line"></div>
          
          <div className="route-step dropoff">
            <div className="step-indicator">
              <MapPin size={16} />
            </div>
            <div className="step-details">
              <span className="step-label">DELIVERY</span>
              <span className="step-address">{dropoff.location}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="delivery-info">
          <div className="info-item">
            <span className="info-label">Distance:</span>
            <span className="info-value">{request.estimatedTotalDistance}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Time:</span>
            <span className="info-value">{request.estimatedTotalDuration}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Fee:</span>
            <span className="info-value">R{request.estimatedPrice || '25.00'}</span>
          </div>
        </div>

        {/* Product Info (if available) */}
        {request.productDetails && (
          <div className="product-info">
            <span className="product-label">Item:</span>
            <span className="product-name">{request.productDetails.title}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="decline-btn"
            onClick={handleDecline}
            disabled={isAnimating}
          >
            <XCircle size={20} />
            DECLINE
          </button>
          
          <button 
            className="accept-btn"
            onClick={handleAccept}
            disabled={isAnimating}
          >
            <CheckCircle size={20} />
            ACCEPT
          </button>
        </div>

        {/* Navigation Button */}
        <button className="navigate-btn">
          <Navigation size={16} />
          VIEW ON MAP
        </button>
      </div>
    </div>
  );
}

export default DeliveryRequest;
