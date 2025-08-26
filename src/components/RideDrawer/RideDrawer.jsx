import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  MapPin,
  Clock,
  User,
  Phone,
  Star,
  Navigation,
  DollarSign,
  MessageCircle,
  CheckCircle,
  XCircle,
  Car,
  Route,
  Timer,
  TrendingUp,
  Activity
} from 'lucide-react';
import './RideDrawer.css';

/**
 * RideDrawer Component - A retractable drawer that adapts to different ride states
 * 
 * States:
 * - IDLE: Driver online, waiting for requests
 * - REQUEST_PENDING: Incoming ride request with timer
 * - TRIP_ACTIVE: Active ride in progress
 * - TRIP_COMPLETED: Trip summary and rating
 */

const RideDrawer = ({
  // Core props
  drawerState = 'IDLE', // 'IDLE', 'REQUEST_PENDING', 'TRIP_ACTIVE', 'TRIP_COMPLETED'
  isOnline = false,
  
  // Request-specific props
  rideRequest = null,
  requestTimer = 20,
  onAcceptRequest = () => {},
  onDeclineRequest = () => {},
  
  // Trip-specific props
  activeTrip = null,
  currentTripStatus = null, // Status from DashboardMap
  onTripAction = () => {},
  
  // Completed trip props
  completedTrip = null,
  onRatingSubmit = () => {},
  onTripClose = () => {},
  
  // Driver stats
  todayStats = {
    earnings: 0,
    trips: 0,
    hours: 0,
    rating: 4.9
  },
  
  // UI customization
  initialHeight = 'compact', // 'compact', 'expanded'
  allowManualToggle = true
}) => {
  const [isExpanded, setIsExpanded] = useState(initialHeight === 'expanded');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // Debug logging for drag state
  useEffect(() => {
    console.log("🎛️ Drag state updated:", {
      isDragging,
      currentTranslateY,
      isExpanded,
      dragStartY
    });
  }, [isDragging, currentTranslateY, isExpanded, dragStartY]);

  // Debug logging for status sync
  useEffect(() => {
    console.log("🔄 Status sync in RideDrawer:", {
      currentTripStatus,
      activeTripStatus: activeTrip?.status,
      drawerState,
      activeTrip: activeTrip?.id
    });
  }, [currentTripStatus, activeTrip?.status, drawerState, activeTrip?.id]);

  // Helper function to get status display text
  const getStatusDisplayText = () => {
    const status = currentTripStatus || activeTrip?.status;
    switch (status) {
      case 'accepted': return 'Trip Accepted';
      case 'arrived': return 'Driver Arrived';
      case 'started': return 'Trip in Progress';
      case 'completed': return 'Trip Completed';
      case 'cancelled': return 'Trip Cancelled';
      default: return 'Trip in Progress';
    }
  };
  
  // Auto-expand for certain states and show drawer
  useEffect(() => {
    // Hide drawer if trip is completed
    if (currentTripStatus === 'completed' || activeTrip?.status === 'completed') {
      setIsVisible(false);
      return;
    }
    
    if (drawerState === 'REQUEST_PENDING' || drawerState === 'TRIP_COMPLETED') {
      setIsVisible(true);
      setIsExpanded(true);
    } else if (drawerState === 'TRIP_ACTIVE') {
      setIsVisible(true);
      setIsExpanded(false);
    } else if (drawerState === 'IDLE' && isOnline) {
      setIsVisible(true);
      setIsExpanded(false);
    } else {
      setIsVisible(false);
    }
  }, [drawerState, isOnline, currentTripStatus, activeTrip?.status]);

  // Drag handlers
  const handleDragStart = (e) => {
    if (drawerState === 'REQUEST_PENDING' || drawerState === 'TRIP_COMPLETED') return;
    
    setIsDragging(true);
    const startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    setDragStartY(startY);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
    const deltaY = currentY - dragStartY;
    
    // Only allow downward dragging when expanded, upward when compact
    if (isExpanded && deltaY > 0) {
      setCurrentTranslateY(Math.min(deltaY, 300));
    } else if (!isExpanded && deltaY < 0) {
      setCurrentTranslateY(Math.max(deltaY, -300));
    }
    
    e.preventDefault();
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Determine if we should toggle based on drag distance
    const threshold = 50;
    if (Math.abs(currentTranslateY) > threshold) {
      if (isExpanded && currentTranslateY > 0) {
        // Dragged down while expanded - minimize
        setIsExpanded(false);
      } else if (!isExpanded && currentTranslateY < 0) {
        // Dragged up while compact - expand
        setIsExpanded(true);
      }
    }
    
    // Reset transform
    setCurrentTranslateY(0);
  };

  // Add mouse/touch event listeners
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e) => handleDragMove(e);
      const handleMouseUp = () => handleDragEnd();
      const handleTouchMove = (e) => {
        e.preventDefault(); // Prevent scroll while dragging
        handleDragMove(e);
      };
      const handleTouchEnd = () => handleDragEnd();
      
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragStartY, isExpanded, currentTranslateY]);

  // Determine modal positioning and size
  const modalStyle = useMemo(() => {
    if (!isVisible) return { display: 'none' };
    
    const baseStyle = {
      transform: `translateY(${currentTranslateY}px)`,
      transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    };

    if (drawerState === 'REQUEST_PENDING') {
      return {
        ...baseStyle,
        height: '65vh',
        maxHeight: '500px'
      };
    } else if (drawerState === 'TRIP_COMPLETED') {
      return {
        ...baseStyle,
        height: '70vh',
        maxHeight: '550px'
      };
    } else if (drawerState === 'TRIP_ACTIVE') {
      return {
        ...baseStyle,
        height: isExpanded ? '60vh' : '140px',
        maxHeight: isExpanded ? '480px' : '140px'
      };
    } else {
      // IDLE state
      return {
        ...baseStyle,
        height: isExpanded ? '50vh' : '120px',
        maxHeight: isExpanded ? '400px' : '120px'
      };
    }
  }, [isVisible, isExpanded, drawerState, currentTranslateY, isDragging]);

  const handleToggleExpansion = () => {
    if (!allowManualToggle) return;
    if (drawerState === 'REQUEST_PENDING' || drawerState === 'TRIP_COMPLETED') return;
    
    setIsAnimating(true);
    setIsExpanded(!isExpanded);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleDragHandle = (e) => {
    console.log("🎯 Drag handle clicked/touched, state:", drawerState);
    if (drawerState === 'REQUEST_PENDING' || drawerState === 'TRIP_COMPLETED') {
      console.log("🚫 Drag disabled for state:", drawerState);
      return;
    }
    console.log("✅ Starting drag interaction");
    handleDragStart(e);
  };

  const formatTime = (seconds) => `${seconds}s`;
  const formatDistance = (distance) => `${distance} km`;
  const formatDuration = (duration) => `${duration} min`;

  const renderIdleContent = () => (
    <div className="drawer-content idle-content">
      <div className="drag-handle" 
           onMouseDown={handleDragHandle}
           onTouchStart={handleDragHandle}
           style={{ 
             cursor: (drawerState === 'REQUEST_PENDING' || drawerState === 'TRIP_COMPLETED') ? 'default' : 'grab'
           }}>
        <div className="drag-indicator"></div>
      </div>
      
      <div className="drawer-header" onClick={handleToggleExpansion}>
        <div className="status-indicator">
          <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
          <span className="status-text">
            {isOnline ? 'Online - Looking for rides' : 'Offline'}
          </span>
        </div>
        {allowManualToggle && (
          <button className="expand-button">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="expanded-idle-content">
          <div className="stats-grid">
            <div className="stat-card">
              <DollarSign size={20} className="stat-icon" />
              <div className="stat-content">
                <span className="stat-value">R{todayStats.earnings.toFixed(2)}</span>
                <span className="stat-label">Today's Earnings</span>
              </div>
            </div>
            <div className="stat-card">
              <Car size={20} className="stat-icon" />
              <div className="stat-content">
                <span className="stat-value">{todayStats.trips}</span>
                <span className="stat-label">Trips</span>
              </div>
            </div>
            <div className="stat-card">
              <Clock size={20} className="stat-icon" />
              <div className="stat-content">
                <span className="stat-value">{todayStats.hours}h</span>
                <span className="stat-label">Online</span>
              </div>
            </div>
            <div className="stat-card">
              <Star size={20} className="stat-icon" />
              <div className="stat-content">
                <span className="stat-value">{todayStats.rating}★</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>
          
          {/* <div className="quick-actions">
            <button className="action-button secondary">
              <Activity size={16} />
              <span>View Analytics</span>
            </button>
            <button className="action-button secondary">
              <TrendingUp size={16} />
              <span>Earnings History</span>
            </button>
          </div> */}
        </div>
      )}
    </div>
  );

  const renderRequestContent = () => {
    console.log("🎨 Rendering request content with:", rideRequest);
    
    return (
    <div className="drawer-content request-content">
      <div className="drag-handle" 
           onMouseDown={handleDragHandle}
           onTouchStart={handleDragHandle}>
        <div className="drag-indicator"></div>
      </div>
      
      <div className="request-header">
        <div className="timer-section">
          <div className="timer-circle">
            <Timer size={20} />
            <span className="timer-text">{formatTime(requestTimer)}</span>
          </div>
        </div>
        <div className="request-info">
          <h3>New Ride Request</h3>
          <span className="estimated-fare">R{rideRequest?.estimatedPrice || '0.00'}</span>
        </div>
      </div>

      <div className="passenger-info">
        {rideRequest?.passengers?.map((passenger, index) => (
          <div key={passenger.id} className="passenger-card">
            <div className="passenger-avatar">
              <User size={18} />
            </div>
            <div className="passenger-details">
              <span className="passenger-name">{passenger.name}</span>
              <div className="passenger-rating">
                <Star size={12} fill="currentColor" />
                <span>{passenger.rating}</span>
              </div>
            </div>
            {passenger.phoneNumber && (
              <button className="contact-button">
                <Phone size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="route-overview">
        <div className="route-stops">
          {rideRequest?.stops?.map((stop, index) => (
            <div key={index} className="route-stop">
              <div className={`stop-marker ${index === 0 ? 'pickup' : 'dropoff'}`}>
                <MapPin size={12} />
              </div>
              <div className="stop-details">
                <span className="stop-location">{stop.location}</span>
                <span className="stop-passenger">{stop.passengerName}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="trip-metrics">
          <div className="metric">
            <Route size={14} />
            <span>{formatDistance(rideRequest?.estimatedTotalDistance || '0')}</span>
          </div>
          <div className="metric">
            <Clock size={14} />
            <span>{formatDuration(rideRequest?.estimatedTotalDuration || '0')}</span>
          </div>
        </div>
      </div>

      <div className="request-actions">
        <button className="action-button decline" onClick={onDeclineRequest}>
          <XCircle size={18} />
          <span>Decline</span>
        </button>
        <button className="action-button accept" onClick={onAcceptRequest}>
          <CheckCircle size={18} />
          <span>Accept</span>
        </button>
      </div>
    </div>
    );
  };

  const renderTripActiveContent = () => (
    <div className="drawer-content trip-content">
      <div className="drag-handle" 
           onMouseDown={handleDragHandle}
           onTouchStart={handleDragHandle}
           style={{ 
             cursor: (drawerState === 'REQUEST_PENDING' || drawerState === 'TRIP_COMPLETED') ? 'default' : 'grab'
           }}>
        <div className="drag-indicator"></div>
      </div>
      
      <div className="drawer-header" onClick={handleToggleExpansion}>
        <div className="trip-status">
          <div className="status-indicator">
            <div className="status-dot active"></div>
            <span className="status-text">{getStatusDisplayText()}</span>
          </div>
          <span className="trip-fare">R{activeTrip?.price || activeTrip?.estimatedPrice || '0.00'}</span>
        </div>
        {allowManualToggle && (
          <button className="expand-button">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        )}
      </div>

      {!isExpanded && (
        <div className="compact-trip-info">
          <div className="passenger-summary">
            <User size={16} />
            <span>{activeTrip?.rider?.fullName || 'Passenger'}</span>
          </div>
          <div className="destination-summary">
            <MapPin size={16} />
            <span>{activeTrip?.dropoff?.address || 'Destination'}</span>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="expanded-trip-content">
          <div className="passenger-section">
            <div className="passenger-card active">
              <div className="passenger-avatar">
                <User size={20} />
              </div>
              <div className="passenger-details">
                <span className="passenger-name">{activeTrip?.rider?.fullName || 'Passenger'}</span>
                <div className="passenger-rating">
                  <Star size={12} fill="currentColor" />
                  <span>{activeTrip?.rider?.averageRating || '5.0'}</span>
                </div>
              </div>
              <div className="passenger-actions">
                <button className="contact-button">
                  <Phone size={16} />
                </button>
                <button className="contact-button">
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="trip-route">
            <div className="route-stop">
              <div className="stop-marker pickup">
                <MapPin size={12} />
              </div>
              <div className="stop-details">
                <span className="stop-location">{activeTrip?.pickup?.address || 'Pickup Location'}</span>
                <span className="stop-status">Pickup</span>
              </div>
            </div>
            <div className="route-stop">
              <div className="stop-marker dropoff">
                <MapPin size={12} />
              </div>
              <div className="stop-details">
                <span className="stop-location">{activeTrip?.dropoff?.address || 'Dropoff Location'}</span>
                <span className="stop-status">Destination</span>
              </div>
            </div>
          </div>

          <div className="trip-actions">
            <button 
              className="action-button navigation"
              onClick={() => onTripAction('navigate')}
            >
              <Navigation size={16} />
              <span>Navigate</span>
            </button>
            {(currentTripStatus || activeTrip?.status) === 'accepted' && (
              <button 
                className="action-button primary"
                onClick={() => onTripAction('arrived')}
              >
                <CheckCircle size={16} />
                <span>I've Arrived</span>
              </button>
            )}
            {(currentTripStatus || activeTrip?.status) === 'arrived' && (
              <button 
                className="action-button primary"
                onClick={() => onTripAction('start')}
              >
                <Car size={16} />
                <span>Start Trip</span>
              </button>
            )}
            {(currentTripStatus || activeTrip?.status) === 'started' && (
              <button 
                className="action-button success"
                onClick={() => onTripAction('complete')}
              >
                <CheckCircle size={16} />
                <span>Complete Trip</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderCompletedContent = () => (
    <div className="drawer-content completed-content">
      <div className="drag-handle" 
           onMouseDown={handleDragHandle}
           onTouchStart={handleDragHandle}>
        <div className="drag-indicator"></div>
      </div>
      
      <div className="completion-header">
        <div className="completion-icon">
          <CheckCircle size={32} className="success-icon" />
        </div>
        <h3>Trip Completed!</h3>
        <span className="completion-fare">R{completedTrip?.price || '0.00'}</span>
      </div>

      <div className="trip-summary">
        <div className="summary-item">
          <Route size={16} />
          <span>{formatDistance(completedTrip?.distance || '0')}</span>
        </div>
        <div className="summary-item">
          <Clock size={16} />
          <span>{formatDuration(completedTrip?.duration || '0')}</span>
        </div>
        <div className="summary-item">
          <User size={16} />
          <span>{completedTrip?.rider?.fullName || 'Passenger'}</span>
        </div>
      </div>

      <div className="rating-section">
        <h4>Rate your passenger</h4>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} className="star-button">
              <Star size={24} />
            </button>
          ))}
        </div>
      </div>

      <div className="completion-actions">
        <button 
          className="action-button secondary"
          onClick={onTripClose}
        >
          <span>Close</span>
        </button>
        <button 
          className="action-button primary"
          onClick={onRatingSubmit}
        >
          <span>Submit Rating</span>
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    console.log("🎨 Rendering content for state:", drawerState);
    
    switch (drawerState) {
      case 'IDLE':
        console.log("🎨 Rendering IDLE content");
        return renderIdleContent();
      case 'REQUEST_PENDING':
        console.log("🎨 Rendering REQUEST_PENDING content");
        return renderRequestContent();
      case 'TRIP_ACTIVE':
        console.log("🎨 Rendering TRIP_ACTIVE content");
        return renderTripActiveContent();
      case 'TRIP_COMPLETED':
        console.log("🎨 Rendering TRIP_COMPLETED content");
        return renderCompletedContent();
      default:
        console.log("🎨 Rendering default (IDLE) content");
        return renderIdleContent();
    }
  };

  return (
    <>
      {/* Backdrop for modal effect */}
      {isVisible && (isExpanded || drawerState === 'REQUEST_PENDING' || drawerState === 'TRIP_COMPLETED') && (
        <div className="modal-backdrop" onClick={() => {
          if (drawerState !== 'REQUEST_PENDING' && drawerState !== 'TRIP_COMPLETED') {
            setIsExpanded(false);
          }
        }} />
      )}
      
      {/* Floating Modal Drawer */}
      <div 
        className={`ride-drawer-modal ${drawerState.toLowerCase()} ${isExpanded ? 'expanded' : 'compact'} ${isAnimating ? 'animating' : ''} ${isDragging ? 'dragging' : ''}`}
        style={modalStyle}
      >
        {renderContent()}
      </div>
    </>
  );
};

export default RideDrawer;
