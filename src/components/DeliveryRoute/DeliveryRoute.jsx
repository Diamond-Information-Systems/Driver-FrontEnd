import React, { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  CheckCircle,
  Navigation,
  Hash,
  Star,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import './DeliveryRoute.css';

function DeliveryRoute({ 
  route, 
  onUpdateStatus, 
  onConfirmDelivery, 
  onNavigate 
}) {
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);

  if (!route || route.remainingDeliveries === 0) {
    return (
      <div className="delivery-route-container no-deliveries">
        <div className="no-deliveries-content">
          <Package size={48} color="#ccc" />
          <h3>No Active Deliveries</h3>
          <p>You're ready for new delivery requests</p>
        </div>
      </div>
    );
  }

  const handleStartDelivery = (delivery) => {
    onUpdateStatus(delivery.deliveryId, 'started');
  };

  const handleCompletePickup = (delivery) => {
    onUpdateStatus(delivery.deliveryId, 'started');
  };

  const handleInitiateDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setShowPinModal(true);
  };

  const handleConfirmPin = () => {
    if (pinInput && selectedDelivery) {
      onConfirmDelivery(selectedDelivery.deliveryId, pinInput);
      setShowPinModal(false);
      setPinInput('');
      setSelectedDelivery(null);
    }
  };

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#ff9500'; // Orange for pickup
      case 'started': return '#2196f3'; // Blue for in transit
      case 'completed': return '#4caf50'; // Green for completed
      default: return '#666';
    }
  };

  const getNextAction = (delivery) => {
    switch (delivery.status) {
      case 'accepted':
        return { text: 'START PICKUP', action: () => handleStartDelivery(delivery) };
      case 'started':
        return { text: 'CONFIRM DELIVERY', action: () => handleInitiateDelivery(delivery) };
      default:
        return null;
    }
  };

  return (
    <div className="delivery-route-container">
      {/* Route Header */}
      <div className="route-header">
        <div className="route-title">
          <Package size={24} color="var(--color-delivery)" />
          <div>
            <h3>Your Delivery Route</h3>
            <p>{route.remainingDeliveries} of {route.totalDeliveries} remaining</p>
          </div>
        </div>
        <div className="route-stats">
          <div className="stat">
            <span className="stat-value">{route.routeStats.totalDistance}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat">
            <span className="stat-value">{route.routeStats.estimatedTime}</span>
            <span className="stat-label">Time</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${route.routeStats.completionPercentage}%` }}
          ></div>
        </div>
        <span className="progress-text">
          {route.routeStats.completionPercentage}% Complete
        </span>
      </div>

      {/* Active Deliveries List */}
      <div className="deliveries-list">
        {route.activeDeliveries.map((delivery, index) => {
          const nextAction = getNextAction(delivery);
          
          return (
            <div key={delivery.deliveryId} className={`delivery-item ${delivery.status}`}>
              {/* Order Number & Status */}
              <div className="delivery-header">
                <div className="order-info">
                  <span className="order-number">#{delivery.routeOrder}</span>
                  <div className="status-badge" style={{ backgroundColor: getDeliveryStatusColor(delivery.status) }}>
                    {delivery.status.toUpperCase()}
                  </div>
                </div>
                <span className="order-id">{delivery.orderId}</span>
              </div>

              {/* Customer Info */}
              <div className="customer-section">
                <div className="customer-info">
                  <User size={16} />
                  <span className="customer-name">{delivery.customer.name}</span>
                </div>
                <button 
                  className="contact-btn"
                  onClick={() => window.open(`tel:${delivery.customer.phone}`)}
                >
                  <Phone size={14} />
                </button>
              </div>

              {/* Addresses */}
              <div className="addresses">
                <div className="address-item pickup">
                  <Package size={16} />
                  <div>
                    <span className="address-label">Pickup</span>
                    <span className="address-text">{delivery.pickup.address}</span>
                  </div>
                </div>
                
                <div className="address-item dropoff">
                  <MapPin size={16} />
                  <div>
                    <span className="address-label">Delivery</span>
                    <span className="address-text">{delivery.dropoff.address}</span>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              {delivery.productDetails && (
                <div className="product-section">
                  <span className="product-label">Item:</span>
                  <span className="product-name">{delivery.productDetails.title}</span>
                </div>
              )}

              {/* Special Instructions */}
              {delivery.notes && (
                <div className="notes-section">
                  <AlertCircle size={16} />
                  <span className="notes-text">{delivery.notes}</span>
                </div>
              )}

              {/* Action Button */}
              {nextAction && (
                <button 
                  className="action-btn"
                  onClick={nextAction.action}
                  style={{ backgroundColor: getDeliveryStatusColor(delivery.status) }}
                >
                  {nextAction.text}
                  <ChevronRight size={16} />
                </button>
              )}

              {/* Navigation Button */}
              <button 
                className="navigate-btn"
                onClick={() => onNavigate(delivery)}
              >
                <Navigation size={16} />
                NAVIGATE
              </button>
            </div>
          );
        })}
      </div>

      {/* PIN Confirmation Modal */}
      {showPinModal && selectedDelivery && (
        <div className="pin-modal-overlay" onClick={() => setShowPinModal(false)}>
          <div className="pin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pin-modal-header">
              <Hash size={32} color="var(--color-delivery)" />
              <h3>Confirm Delivery</h3>
              <p>Enter the delivery PIN to complete</p>
            </div>
            
            <div className="pin-input-container">
              <input
                type="text"
                className="pin-input"
                placeholder="Enter PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="delivery-summary">
              <div className="summary-item">
                <span>Customer:</span>
                <span>{selectedDelivery.customer.name}</span>
              </div>
              <div className="summary-item">
                <span>Order:</span>
                <span>{selectedDelivery.orderId}</span>
              </div>
              <div className="summary-item">
                <span>Item:</span>
                <span>{selectedDelivery.productDetails?.title || 'Package'}</span>
              </div>
            </div>

            <div className="pin-modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowPinModal(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={handleConfirmPin}
                disabled={!pinInput}
              >
                <CheckCircle size={16} />
                Confirm Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryRoute;
