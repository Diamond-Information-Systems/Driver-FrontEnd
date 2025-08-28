import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  Phone, 
  Navigation,
  CheckCircle,
  AlertCircle,
  DollarSign,
  User,
  ChevronUp,
  ChevronDown,
  Grip,
  Star,
  Timer,
  Route
} from 'lucide-react';
import './DeliveryDrawer.css';

const DeliveryDrawer = ({
  drawerState, // 'IDLE', 'REQUEST_PENDING', 'ACTIVE_DELIVERY', 'DELIVERY_COMPLETED'
  isOnline,
  deliveryRequest,
  requestTimer,
  onAcceptRequest,
  onDeclineRequest,
  activeDelivery,
  currentDeliveryStatus,
  onDeliveryAction,
  completedDelivery,
  onDeliveryClose,
  todayStats,
  initialHeight = 'compact',
  allowManualToggle = true,
  isDeliveryUser = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [currentHeight, setCurrentHeight] = useState(initialHeight);
  const drawerRef = useRef(null);
  
  // Calculate drawer height based on state and expansion
  const heightConfig = useMemo(() => ({
    compact: '120px',
    partial: '300px',
    full: '70vh'
  }), []);

  // Determine target height based on drawer state and expansion
  const targetHeight = useMemo(() => {
    if (drawerState === 'DELIVERY_COMPLETED') return heightConfig.partial;
    if (drawerState === 'REQUEST_PENDING') return heightConfig.partial;
    if (drawerState === 'ACTIVE_DELIVERY') {
      return isExpanded ? heightConfig.full : heightConfig.partial;
    }
    if (drawerState === 'IDLE') {
      return isExpanded ? heightConfig.partial : heightConfig.compact;
    }
    return heightConfig.compact;
  }, [drawerState, isExpanded, heightConfig]);

  // Auto-expand for certain states
  useEffect(() => {
    if (drawerState === 'REQUEST_PENDING' || drawerState === 'DELIVERY_COMPLETED') {
      setIsExpanded(true);
    }
  }, [drawerState]);

  // Handle drag interactions
  const handleDragStart = (clientY) => {
    setIsDragging(true);
    setDragStart(clientY);
  };

  const handleDragMove = (clientY) => {
    if (!isDragging || !drawerRef.current) return;
    
    const delta = dragStart - clientY;
    const threshold = 50;
    
    if (delta > threshold && !isExpanded) {
      setIsExpanded(true);
    } else if (delta < -threshold && isExpanded) {
      setIsExpanded(false);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse event handlers
  const handleMouseDown = (e) => {
    handleDragStart(e.clientY);
  };

  const handleMouseMove = (e) => {
    handleDragMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Render delivery request content
  const renderDeliveryRequest = () => {
    if (!deliveryRequest) return null;

    return (
      <div className="delivery-request-content">
        <div className="request-header">
          <div className="request-timer">
            <Timer size={20} color="#FF9500" />
            <span className="timer-text">{requestTimer}s</span>
          </div>
          <div className="request-title">
            <Package size={24} color="#FF9500" />
            <h3>New Delivery Request</h3>
          </div>
        </div>

        <div className="delivery-details">
          <div className="delivery-item">
            <div className="item-image">
              {deliveryRequest.productDetails?.image ? (
                <img src={deliveryRequest.productDetails.image} alt="Product" />
              ) : (
                <Package size={40} color="#FF9500" />
              )}
            </div>
            <div className="item-info">
              <h4>{deliveryRequest.productDetails?.title || 'Delivery Item'}</h4>
              <p className="item-price">R{deliveryRequest.productDetails?.price || '0.00'}</p>
              <p className="item-description">{deliveryRequest.productDetails?.description}</p>
            </div>
          </div>

          <div className="delivery-locations">
            <div className="location-point pickup">
              <MapPin size={16} color="#FF9500" />
              <div>
                <strong>Pickup:</strong>
                <p>{deliveryRequest.pickup?.address}</p>
              </div>
            </div>
            <div className="location-point dropoff">
              <MapPin size={16} color="#4CAF50" />
              <div>
                <strong>Delivery:</strong>
                <p>{deliveryRequest.dropoff?.address}</p>
              </div>
            </div>
          </div>

          <div className="customer-info">
            <User size={16} />
            <div>
              <strong>{deliveryRequest.customer?.name}</strong>
              <p>{deliveryRequest.customer?.phone}</p>
            </div>
          </div>

          <div className="delivery-actions">
            <button 
              className="decline-btn"
              onClick={onDeclineRequest}
            >
              Decline
            </button>
            <button 
              className="accept-btn"
              onClick={onAcceptRequest}
            >
              Accept Delivery
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render active delivery content
  const renderActiveDelivery = () => {
    if (!activeDelivery) return null;

    const getStatusColor = (status) => {
      switch (status) {
        case 'accepted': return '#2196F3';
        case 'started': return '#FF9500';
        case 'picked_up': return '#9C27B0';
        case 'delivered': return '#4CAF50';
        default: return '#666';
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'accepted': return 'Heading to Pickup';
        case 'started': return 'At Pickup Location';
        case 'picked_up': return 'Item Collected';
        case 'delivered': return 'Delivery Complete';
        default: return 'Unknown Status';
      }
    };

    return (
      <div className="active-delivery-content">
        <div className="delivery-status-header">
          <div className="status-indicator" style={{ backgroundColor: getStatusColor(currentDeliveryStatus) }}>
            <Package size={20} color="white" />
          </div>
          <div className="status-text">
            <h3>{getStatusText(currentDeliveryStatus)}</h3>
            <p>Order #{activeDelivery.orderId}</p>
          </div>
          <div className="delivery-pin">
            PIN: <strong>{activeDelivery.deliveryPin}</strong>
          </div>
        </div>

        <div className="delivery-progress">
          <div className={`progress-step ${['accepted', 'started', 'picked_up', 'delivered'].includes(currentDeliveryStatus) ? 'completed' : ''}`}>
            <div className="step-icon">1</div>
            <span>Accepted</span>
          </div>
          <div className={`progress-step ${['started', 'picked_up', 'delivered'].includes(currentDeliveryStatus) ? 'completed' : ''}`}>
            <div className="step-icon">2</div>
            <span>At Pickup</span>
          </div>
          <div className={`progress-step ${['picked_up', 'delivered'].includes(currentDeliveryStatus) ? 'completed' : ''}`}>
            <div className="step-icon">3</div>
            <span>Collected</span>
          </div>
          <div className={`progress-step ${currentDeliveryStatus === 'delivered' ? 'completed' : ''}`}>
            <div className="step-icon">4</div>
            <span>Delivered</span>
          </div>
        </div>

        <div className="current-delivery-details">
          <div className="delivery-item-compact">
            <div className="item-image-small">
              {activeDelivery.productDetails?.image ? (
                <img src={activeDelivery.productDetails.image} alt="Product" />
              ) : (
                <Package size={30} color="#FF9500" />
              )}
            </div>
            <div className="item-info-compact">
              <h4>{activeDelivery.productDetails?.title}</h4>
              <p>R{activeDelivery.productDetails?.price}</p>
            </div>
          </div>

          <div className="current-destination">
            {currentDeliveryStatus === 'accepted' || currentDeliveryStatus === 'started' ? (
              <div className="destination-card pickup">
                <MapPin size={16} color="#FF9500" />
                <div>
                  <strong>Pickup Location</strong>
                  <p>{activeDelivery.pickup?.address}</p>
                </div>
                <button 
                  className="navigate-btn"
                  onClick={() => onDeliveryAction('navigate', 'pickup')}
                >
                  <Navigation size={16} />
                  Navigate
                </button>
              </div>
            ) : (
              <div className="destination-card dropoff">
                <MapPin size={16} color="#4CAF50" />
                <div>
                  <strong>Delivery Location</strong>
                  <p>{activeDelivery.dropoff?.address}</p>
                </div>
                <button 
                  className="navigate-btn"
                  onClick={() => onDeliveryAction('navigate', 'dropoff')}
                >
                  <Navigation size={16} />
                  Navigate
                </button>
              </div>
            )}
          </div>

          <div className="customer-contact">
            <div className="customer-info-inline">
              <User size={16} />
              <span>{activeDelivery.customer?.name}</span>
            </div>
            <button 
              className="call-btn"
              onClick={() => onDeliveryAction('call', activeDelivery.customer?.phone)}
            >
              <Phone size={16} />
              Call
            </button>
          </div>

          {activeDelivery.notes && (
            <div className="delivery-notes">
              <strong>Special Instructions:</strong>
              <p>{activeDelivery.notes}</p>
            </div>
          )}

          <div className="delivery-actions-main">
            {currentDeliveryStatus === 'accepted' && (
              <button 
                className="action-btn start"
                onClick={() => onDeliveryAction('start')}
              >
                Start Delivery
              </button>
            )}
            {currentDeliveryStatus === 'started' && (
              <button 
                className="action-btn pickup"
                onClick={() => onDeliveryAction('pickup')}
              >
                Mark as Picked Up
              </button>
            )}
            {currentDeliveryStatus === 'picked_up' && (
              <button 
                className="action-btn complete"
                onClick={() => onDeliveryAction('complete')}
              >
                Complete Delivery
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render idle state content
  const renderIdleState = () => {
    return (
      <div className="delivery-idle-content">
        <div className="idle-header">
          <div className="online-indicator">
            <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
            <span>{isOnline ? 'Available for Deliveries' : 'Offline'}</span>
          </div>
        </div>

        <div className="today-stats">
          <div className="stat-item">
            <Package size={16} />
            <div>
              <span className="stat-number">{todayStats?.deliveries || 0}</span>
              <span className="stat-label">Deliveries</span>
            </div>
          </div>
          <div className="stat-item">
            <DollarSign size={16} />
            <div>
              <span className="stat-number">R{todayStats?.earnings || 0}</span>
              <span className="stat-label">Earned</span>
            </div>
          </div>
          <div className="stat-item">
            <Clock size={16} />
            <div>
              <span className="stat-number">{todayStats?.hours || 0}h</span>
              <span className="stat-label">Hours</span>
            </div>
          </div>
          <div className="stat-item">
            <Star size={16} />
            <div>
              <span className="stat-number">{todayStats?.rating || 0}</span>
              <span className="stat-label">Rating</span>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="expanded-idle-content">
            <div className="quick-actions">
              <h4>Quick Actions</h4>
              <div className="action-grid">
                <button className="quick-action-btn">
                  <Route size={20} />
                  <span>View Routes</span>
                </button>
                <button className="quick-action-btn">
                  <Clock size={20} />
                  <span>Schedule</span>
                </button>
                <button className="quick-action-btn">
                  <Star size={20} />
                  <span>Ratings</span>
                </button>
                <button className="quick-action-btn">
                  <DollarSign size={20} />
                  <span>Earnings</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render completed delivery content
  const renderCompletedDelivery = () => {
    if (!completedDelivery) return null;

    return (
      <div className="completed-delivery-content">
        <div className="completion-header">
          <CheckCircle size={40} color="#4CAF50" />
          <h3>Delivery Completed!</h3>
        </div>

        <div className="completion-details">
          <div className="completed-item">
            <Package size={20} />
            <span>{completedDelivery.productDetails?.title}</span>
          </div>
          <div className="completion-stats">
            <div className="stat">
              <strong>Earned:</strong> R{completedDelivery.earnings || '0.00'}
            </div>
            <div className="stat">
              <strong>Distance:</strong> {completedDelivery.distance || '0'} km
            </div>
            <div className="stat">
              <strong>Time:</strong> {completedDelivery.duration || '0'} min
            </div>
          </div>
        </div>

        <div className="completion-actions">
          <button 
            className="close-btn"
            onClick={onDeliveryClose}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  // Don't render for non-delivery users
  if (!isDeliveryUser) return null;

  return (
    <div 
      ref={drawerRef}
      className={`delivery-drawer ${drawerState.toLowerCase().replace('_', '-')} ${isExpanded ? 'expanded' : 'collapsed'} ${isDragging ? 'dragging' : ''}`}
      style={{ height: targetHeight }}
    >
      {/* Drag Handle */}
      <div 
        className="delivery-drawer-handle"
        onMouseDown={allowManualToggle ? handleMouseDown : undefined}
        onTouchStart={allowManualToggle ? handleTouchStart : undefined}
        onTouchMove={allowManualToggle ? handleTouchMove : undefined}
        onTouchEnd={allowManualToggle ? handleTouchEnd : undefined}
        onClick={allowManualToggle ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="handle-indicator">
          <Grip size={20} color="#666" />
        </div>
        <div className="handle-title">
          <Package size={16} color="#FF9500" />
          <span>Delivery Dashboard</span>
        </div>
        {allowManualToggle && (
          <div className="handle-arrow">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </div>
        )}
      </div>

      {/* Drawer Content */}
      <div className="delivery-drawer-content">
        {drawerState === 'REQUEST_PENDING' && renderDeliveryRequest()}
        {drawerState === 'ACTIVE_DELIVERY' && renderActiveDelivery()}
        {drawerState === 'DELIVERY_COMPLETED' && renderCompletedDelivery()}
        {drawerState === 'IDLE' && renderIdleState()}
      </div>
    </div>
  );
};

export default DeliveryDrawer;
