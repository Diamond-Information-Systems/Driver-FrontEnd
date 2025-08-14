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

  // Adapt delivery request data structure
  const deliveryData = {
    customer: request.customer || request.rider || {},
    pickup: request.pickup || (request.stops ? request.stops[0] : {}),
    dropoff: request.dropoff || (request.stops ? request.stops[1] : {}),
    product: request.product || request.productDetails || {},
    orderId: request.orderId || request._id,
    estimatedEarnings: request.estimatedEarnings || request.estimatedPrice,
    estimatedDistance: request.estimatedDistance || request.estimatedTotalDistance,
    estimatedDuration: request.estimatedDuration || request.estimatedTotalDuration
  };
  
  return (
    <div className={`delivery-request-overlay ${isAnimating ? 'animating' : ''}`}>
      <div className="delivery-request-card">
        {/* Header */}
        <div className="delivery-header">
          <div className="delivery-type">
            <Package size={24} color="var(--color-delivery)" />
            <span>NEW DELIVERY OPPORTUNITY</span>
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
              <span className="customer-name">{deliveryData.customer.name || deliveryData.customer.fullName || 'Customer'}</span>
              <div className="rating">
                <Star size={14} fill="currentColor" />
                <span>{deliveryData.customer.rating || deliveryData.customer.averageRating || 'New'}</span>
              </div>
            </div>
          </div>
          <button 
            className="contact-btn"
            onClick={() => window.open(`tel:${deliveryData.customer.phone || deliveryData.customer.phoneNumber}`)}
          >
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
              <span className="step-address">{deliveryData.pickup.address || deliveryData.pickup.location}</span>
            </div>
          </div>
          
          <div className="route-line"></div>
          
          <div className="route-step dropoff">
            <div className="step-indicator">
              <MapPin size={16} />
            </div>
            <div className="step-details">
              <span className="step-label">DELIVERY</span>
              <span className="step-address">{deliveryData.dropoff.address || deliveryData.dropoff.location}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="delivery-info">
          <div className="info-item">
            <span className="info-label">Distance:</span>
            <span className="info-value">{deliveryData.estimatedDistance || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Time:</span>
            <span className="info-value">{deliveryData.estimatedDuration || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Fee:</span>
            <span className="info-value">R{deliveryData.estimatedEarnings || '25.00'}</span>
          </div>
        </div>

        {/* Product Info (if available) */}
        {deliveryData.product && (deliveryData.product.title || deliveryData.product.name) && (
          <div className="product-info">
            <span className="product-label">Item:</span>
            <span className="product-name">{deliveryData.product.title || deliveryData.product.name}</span>
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
            ACCEPT & ADD TO ROUTE
          </button>
        </div>

        {/* Navigation Button */}
        <button 
          className="navigate-btn"
          onClick={() => {
            const address = deliveryData.pickup.address || deliveryData.pickup.location;
            const encodedAddress = encodeURIComponent(address);
            const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
            window.open(url, '_blank');
          }}
        >
          <Navigation size={16} />
          VIEW PICKUP LOCATION
        </button>
      </div>
    </div>
  );
}

export default DeliveryRequest;
