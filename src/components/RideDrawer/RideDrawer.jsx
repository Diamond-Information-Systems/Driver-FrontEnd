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
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  
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
    } else if (drawerState === 'IDLE') {
      // Always show drawer in IDLE state, whether online or offline
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

  // Enhanced rating functionality
  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue) => {
    setHoveredStar(starValue);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const renderIdleContent = () => (
    <div className="vaye-drawer-content vaye-idle-content">
      <div className="vaye-drag-handle" 
           onMouseDown={handleDragHandle}
           onTouchStart={handleDragHandle}
           style={{ 
             cursor: (drawerState === 'REQUEST_PENDING' || drawerState === 'TRIP_COMPLETED') ? 'default' : 'grab'
           }}>
        <div className="vaye-drag-indicator"></div>
      </div>
      
      <div className="vaye-drawer-header" onClick={handleToggleExpansion}>
        <div className="vaye-status-indicator">
          <div className={`vaye-status-dot ${isOnline ? 'vaye-online' : 'vaye-offline'}`}></div>
          <span className="vaye-status-text">
            {isOnline ? 'Online - Looking for rides' : 'Offline'}
          </span>
        </div>
        {allowManualToggle && (
          <button className="vaye-expand-button">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="vaye-expanded-idle-content">
          <div className="vaye-stats-grid">
            <div className="vaye-stat-card">
              <DollarSign size={20} className="vaye-stat-icon" />
              <div className="vaye-stat-content">
                <span className="vaye-stat-value">ZWG{todayStats.earnings.toFixed(2)}</span>
                <span className="vaye-stat-label">Today's Earnings</span>
              </div>
            </div>
            <div className="vaye-stat-card">
              <Car size={20} className="vaye-stat-icon" />
              <div className="vaye-stat-content">
                <span className="vaye-stat-value">{todayStats.trips}</span>
                <span className="vaye-stat-label">Trips</span>
              </div>
            </div>
            <div className="vaye-stat-card">
              <Clock size={20} className="vaye-stat-icon" />
              <div className="vaye-stat-content">
                <span className="vaye-stat-value">{todayStats.hours}h</span>
                <span className="vaye-stat-label">Online</span>
              </div>
            </div>
            <div className="vaye-stat-card">
              <Star size={20} className="vaye-stat-icon" />
              <div className="vaye-stat-content">
                <span className="vaye-stat-value">{todayStats.rating}★</span>
                <span className="vaye-stat-label">Rating</span>
              </div>
            </div>
          </div>
          
          {/* <div className="vaye-quick-actions">
            <button className="vaye-action-button vaye-secondary">
              <Activity size={16} />
              <span>View Analytics</span>
            </button>
            <button className="vaye-action-button vaye-secondary">
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
    <div className="vaye-drawer-content vaye-request-content">
      <div className="vaye-drag-handle" 
           onMouseDown={handleDragHandle}
           onTouchStart={handleDragHandle}>
        <div className="vaye-drag-indicator"></div>
      </div>
      
      <div className="vaye-request-header">
        <div className="vaye-timer-section">
          <div className="vaye-timer-circle">
            <Timer size={20} />
            <span className="vaye-timer-text">{formatTime(requestTimer)}</span>
            <div 
              className="vaye-timer-progress" 
              style={{
                '--progress': `${((20 - requestTimer) / 20) * 100}%`
              }}
            ></div>
          </div>
        </div>
        <div className="vaye-request-info">
          <h3>New Ride Request</h3>
          <span className="vaye-estimated-fare">ZWG{rideRequest?.estimatedPrice || '0.00'}</span>
        </div>
      </div>

      <div className="vaye-passenger-info">
        {rideRequest?.passengers?.map((passenger, index) => (
          <div key={passenger.id} className="vaye-passenger-card">
            <div className="vaye-passenger-avatar">
              <User size={18} />
            </div>
            <div className="vaye-passenger-details">
              <span className="vaye-passenger-name">{passenger.name}</span>
              <div className="vaye-passenger-rating">
                <Star size={12} fill="currentColor" />
                <span>{passenger.rating}</span>
              </div>
            </div>
            {passenger.phoneNumber && (
              <button className="vaye-contact-button">
                <Phone size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="vaye-route-overview">
        <div className="vaye-route-stops">
          {rideRequest?.stops?.map((stop, index) => (
            <div key={index} className="vaye-route-stop">
              <div className={`vaye-stop-marker ${index === 0 ? 'vaye-pickup' : 'vaye-dropoff'}`}>
                <MapPin size={12} />
              </div>
              <div className="vaye-stop-details">
                <span className="vaye-stop-location">{stop.location}</span>
                <span className="vaye-stop-passenger">{stop.passengerName}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="vaye-trip-metrics">
          <div className="vaye-metric">
            <Route size={14} />
            <span>{formatDistance(rideRequest?.estimatedTotalDistance || '0')}</span>
          </div>
          <div className="vaye-metric">
            <Clock size={14} />
            <span>{formatDuration(rideRequest?.estimatedTotalDuration || '0')}</span>
          </div>
        </div>
      </div>

      <div className="vaye-request-actions">
        <button className="vaye-action-button vaye-decline" onClick={onDeclineRequest}>
          <XCircle size={18} />
          <span>Decline</span>
        </button>
        <button className="vaye-action-button vaye-accept" onClick={onAcceptRequest}>
          <CheckCircle size={18} />
          <span>Accept</span>
        </button>
      </div>
    </div>
    );
  };

  const renderTripActiveContent = () => (
    <div className="vaye-drawer-content vaye-trip-content">
      <div className="vaye-drag-handle" 
           onMouseDown={handleDragHandle}
           onTouchStart={handleDragHandle}
           style={{ 
             cursor: (drawerState === 'REQUEST_PENDING' || drawerState === 'TRIP_COMPLETED') ? 'default' : 'grab'
           }}>
        <div className="vaye-drag-indicator"></div>
      </div>
      
      <div className="vaye-drawer-header" onClick={handleToggleExpansion}>
        <div className="vaye-trip-status">
          <div className="vaye-status-indicator">
            <div className="vaye-status-dot vaye-active"></div>
            <span className="vaye-status-text">{getStatusDisplayText()}</span>
          </div>
          <span className="vaye-trip-fare">ZWG{activeTrip?.price || activeTrip?.estimatedPrice || '0.00'}</span>
        </div>
        {allowManualToggle && (
          <button className="vaye-expand-button">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        )}
      </div>

      {!isExpanded && (
        <div className="vaye-compact-trip-info">
          <div className="vaye-passenger-summary">
            <User size={16} />
            <span>{activeTrip?.rider?.fullName || 'Passenger'}</span>
          </div>
          <div className="vaye-destination-summary">
            <MapPin size={16} />
            <span>{activeTrip?.dropoff?.address || 'Destination'}</span>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="vaye-expanded-trip-content">
          <div className="vaye-passenger-section">
            <div className="vaye-passenger-card vaye-active">
              <div className="vaye-passenger-avatar">
                <User size={20} />
              </div>
              <div className="vaye-passenger-details">
                <span className="vaye-passenger-name">{activeTrip?.rider?.fullName || 'Passenger'}</span>
                <div className="vaye-passenger-rating">
                  <Star size={12} fill="currentColor" />
                  <span>{activeTrip?.rider?.averageRating || '5.0'}</span>
                </div>
              </div>
              <div className="vaye-passenger-actions">
                <button className="vaye-contact-button">
                  <Phone size={16} />
                </button>
                <button className="vaye-contact-button">
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="vaye-trip-route">
            <div className="vaye-route-stop">
              <div className="vaye-stop-marker vaye-pickup">
                <MapPin size={12} />
              </div>
              <div className="vaye-stop-details">
                <span className="vaye-stop-location">{activeTrip?.pickup?.address || 'Pickup Location'}</span>
                <span className="vaye-stop-status">Pickup</span>
              </div>
            </div>
            <div className="vaye-route-stop">
              <div className="vaye-stop-marker vaye-dropoff">
                <MapPin size={12} />
              </div>
              <div className="vaye-stop-details">
                <span className="vaye-stop-location">{activeTrip?.dropoff?.address || 'Dropoff Location'}</span>
                <span className="vaye-stop-status">Destination</span>
              </div>
            </div>
          </div>

          <div className="vaye-trip-actions">
            <button 
              className="vaye-action-button vaye-navigation"
              onClick={() => onTripAction('navigate')}
            >
              <Navigation size={16} />
              <span>Navigate</span>
            </button>
            {(currentTripStatus || activeTrip?.status) === 'accepted' && (
              <button 
                className="vaye-action-button vaye-primary"
                onClick={() => onTripAction('arrived')}
              >
                <CheckCircle size={16} />
                <span>I've Arrived</span>
              </button>
            )}
            {(currentTripStatus || activeTrip?.status) === 'arrived' && (
              <button 
                className="vaye-action-button vaye-primary"
                onClick={() => onTripAction('start')}
              >
                <Car size={16} />
                <span>Start Trip</span>
              </button>
            )}
            {(currentTripStatus || activeTrip?.status) === 'started' && (
              <button 
                className="vaye-action-button vaye-success"
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
    <div className="vaye-drawer-content vaye-completed-content">
      <div className="vaye-drag-handle" 
           onMouseDown={handleDragHandle}
           onTouchStart={handleDragHandle}>
        <div className="vaye-drag-indicator"></div>
      </div>
      
      <div className="vaye-completion-header">
        <div className="vaye-completion-icon">
          <CheckCircle size={32} className="vaye-success-icon" />
        </div>
        <h3>Trip Completed!</h3>
        <span className="vaye-completion-fare">ZWG{completedTrip?.price || '0.00'}</span>
      </div>

      <div className="vaye-trip-summary">
        <div className="vaye-summary-item">
          <Route size={16} />
          <span>{formatDistance(completedTrip?.distance || '0')}</span>
        </div>
        <div className="vaye-summary-item">
          <Clock size={16} />
          <span>{formatDuration(completedTrip?.duration || '0')}</span>
        </div>
        <div className="vaye-summary-item">
          <User size={16} />
          <span>{completedTrip?.rider?.fullName || 'Passenger'}</span>
        </div>
      </div>

      <div className="vaye-rating-section">
        <h4>Rate your passenger</h4>
        <div className="vaye-star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star} 
              className={`vaye-star-button ${(hoveredStar >= star || rating >= star) ? 'vaye-active' : ''}`}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
              onMouseLeave={handleStarLeave}
            >
              <Star size={24} fill={(hoveredStar >= star || rating >= star) ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
      </div>

      <div className="vaye-completion-actions">
        <button 
          className="vaye-action-button vaye-secondary"
          onClick={onTripClose}
        >
          <span>Close</span>
        </button>
        <button 
          className="vaye-action-button vaye-primary"
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
        <div className="vaye-modal-backdrop" onClick={() => {
          if (drawerState !== 'REQUEST_PENDING' && drawerState !== 'TRIP_COMPLETED') {
            setIsExpanded(false);
          }
        }} />
      )}
      
      {/* Card-Based Floating Modal Drawer */}
      <div 
        className={`vaye-drawer-modal vaye-${drawerState.toLowerCase()} ${isExpanded ? 'vaye-expanded' : 'vaye-compact'} ${isAnimating ? 'vaye-animating' : ''} ${isDragging ? 'vaye-dragging' : ''}`}
        style={modalStyle}
      >
        {renderContent()}
      </div>
    </>
  );
};

export default RideDrawer;
