import React from 'react';
import { MapPin, Clock, Star, User, Phone } from 'lucide-react';
import './RideRequest.css';

const RideRequest = ({ request, onAccept, onDecline, timeRemaining }) => {
  if (!request) return null;

  const formatTime = (seconds) => {
    return `${seconds}s`;
  };

  return (
    <div className="ride-request-overlay">
      <div className="ride-request-modal">
        {/* Header */}
        <div className="ride-request-header">
          <div className="timer-section">
            <div className="timer-circle">
              <span className="timer-text">{formatTime(timeRemaining)}</span>
            </div>
          </div>
          <div className="request-type">
            <h3>{request.isCarpool ? 'Carpool Request' : 'Ride Request'}</h3>
            <p className="estimated-fare">R{request.estimatedPrice}</p>
          </div>
        </div>

        {/* Passenger Info */}
        <div className="passenger-section">
          {request.passengers.map((passenger, index) => (
            <div key={passenger.id} className="passenger-info">
              <div className="passenger-avatar">
                <User size={20} />
              </div>
              <div className="passenger-details">
                <h4>{passenger.name}</h4>
                <div className="passenger-rating">
                  <Star size={14} fill="currentColor" />
                  <span>{passenger.rating}</span>
                </div>
                {passenger.phoneNumber && (
                  <div className="passenger-phone">
                    <Phone size={12} />
                    <span>{passenger.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Route Info */}
        <div className="route-section">
          {request.stops.map((stop, index) => (
            <div key={index} className="route-stop">
              <div className="stop-indicator">
                <div className={`stop-dot ${index === 0 ? 'pickup' : index === request.stops.length - 1 ? 'dropoff' : 'intermediate'}`}></div>
                {index < request.stops.length - 1 && <div className="stop-line"></div>}
              </div>
              <div className="stop-details">
                <p className="stop-location">{stop.location}</p>
                <p className="stop-passenger">{stop.passengerName}</p>
                {stop.estimatedPrice && (
                  <p className="stop-price">R{stop.estimatedPrice}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Trip Details */}
        <div className="trip-details">
          <div className="detail-item">
            <MapPin size={16} />
            <span>{request.estimatedTotalDistance} km</span>
          </div>
          <div className="detail-item">
            <Clock size={16} />
            <span>{request.estimatedTotalDuration} min</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="decline-btn" onClick={onDecline}>
            Decline
          </button>
          <button className="accept-btn" onClick={onAccept}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideRequest;