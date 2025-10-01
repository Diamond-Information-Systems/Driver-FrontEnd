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
  
  // Enhanced mobile drag state
  const [dragVelocity, setDragVelocity] = useState(0);
  const [lastDragTime, setLastDragTime] = useState(0);
  const [lastDragY, setLastDragY] = useState(0);
  
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

  // Enhanced mobile-first drag handlers
  const handleDragStart = (e) => {
    if (drawerState === 'REQUEST_PENDING' || drawerState === 'TRIP_COMPLETED') return;
    
    setIsDragging(true);
    const startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    setDragStartY(startY);
    setLastDragY(startY);
    setLastDragTime(Date.now());
    setDragVelocity(0);
    
    // Prevent default scrolling and selection
    e.preventDefault();
    e.stopPropagation();
    
    // Add haptic feedback on mobile
    if (navigator.vibrate && e.type.includes('touch')) {
      navigator.vibrate(10);
    }
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
    const deltaY = currentY - dragStartY;
    const now = Date.now();
    const timeDelta = now - lastDragTime;
    
    // Calculate velocity for momentum
    if (timeDelta > 0) {
      const velocity = (currentY - lastDragY) / timeDelta;
      setDragVelocity(velocity);
      setLastDragY(currentY);
      setLastDragTime(now);
    }
    
    // Enhanced drag bounds with rubber band effect
    let boundedDelta = deltaY;
    const maxDrag = 300;
    const minDrag = -200;
    
    if (deltaY > maxDrag) {
      // Rubber band effect for over-dragging down
      boundedDelta = maxDrag + (deltaY - maxDrag) * 0.3;
    } else if (deltaY < minDrag) {
      // Rubber band effect for over-dragging up
      boundedDelta = minDrag + (deltaY - minDrag) * 0.3;
    }
    
    setCurrentTranslateY(boundedDelta);
    
    // Prevent page scroll on mobile
    if (e.type === 'touchmove') {
      e.preventDefault();
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Enhanced decision logic with velocity consideration
    const threshold = 80;
    const velocityThreshold = 0.5;
    const shouldToggle = Math.abs(currentTranslateY) > threshold || Math.abs(dragVelocity) > velocityThreshold;
    
    if (shouldToggle) {
      if (isExpanded && (currentTranslateY > 0 || dragVelocity > 0)) {
        // Dragged down or flicked down while expanded - minimize
        setIsExpanded(false);
        if (navigator.vibrate) navigator.vibrate(15);
      } else if (!isExpanded && (currentTranslateY < 0 || dragVelocity < 0)) {
        // Dragged up or flicked up while compact - expand
        setIsExpanded(true);
        if (navigator.vibrate) navigator.vibrate(15);
      }
    }
    
    // Reset transform with smooth animation
    setCurrentTranslateY(0);
    setDragVelocity(0);
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
    // Calculate the proper slide position based on state
    let slidePosition = '0%';
    let drawerHeight = '70vh';
    
    if (drawerState === 'REQUEST_PENDING') {
      slidePosition = '0%'; // Fully visible from bottom
      drawerHeight = '85vh'; // Show full content
    } else if (drawerState === 'TRIP_COMPLETED') {
      slidePosition = '0%'; // Fully visible from bottom
      drawerHeight = '85vh'; // Show full content
    } else if (drawerState === 'TRIP_ACTIVE') {
      const compactSlide = '75%'; // Show only top portion
      const expandedSlide = '5%'; // Show almost all content
      slidePosition = isExpanded ? expandedSlide : compactSlide;
      drawerHeight = '80vh'; // Larger height to show all content
    } else {
      // IDLE state
      const compactSlide = '80%'; // Show only top portion
      const expandedSlide = '10%'; // Show more content when expanded
      slidePosition = isExpanded ? expandedSlide : compactSlide;
      drawerHeight = '75vh'; // Adequate height for idle content
    }
    
    // Add drag offset to the slide position
    const dragOffset = currentTranslateY;
    
    // For REQUEST_PENDING and TRIP_COMPLETED, don't apply sliding - show fully
    const transform = (drawerState === 'REQUEST_PENDING' || drawerState === 'TRIP_COMPLETED') 
      ? `translateY(${dragOffset}px)`  // Only apply drag offset, no sliding
      : `translateY(calc(${slidePosition} + ${dragOffset}px))`; // Apply both sliding and drag
    
    return {
      height: drawerHeight,
      maxHeight: '90vh', // Increased max height
      minHeight: '120px',
      transform: transform,
      transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      // Mobile optimization
      WebkitOverflowScrolling: 'touch',
      overflowY: 'auto',
      overflowX: 'hidden',
      // Maintain shape during drag
      borderRadius: '32px 32px 0 0',
      willChange: 'transform',
    };
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
  
  // Enhanced drag handle style for mobile
  const getDragHandleStyle = () => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px 0 12px', // Larger touch target
    background: '#ffffff',
    cursor: 'grab',
    // Mobile touch optimizations
    minHeight: '44px', // Apple's recommended minimum touch target
    tapHighlightColor: 'transparent',
    WebkitTapHighlightColor: 'transparent',
    // Active state
    ...(isDragging && {
      cursor: 'grabbing',
      opacity: 0.8
    })
  });
  
  const getDragIndicatorStyle = () => ({
    width: '48px',
    height: '5px',
    background: isDragging ? '#BDBDBD' : '#E0E0E0',
    borderRadius: '10px',
    transition: 'background 0.2s ease',
    // Add subtle shadow for depth
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  });

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
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '420px',
      margin: '0 auto',
      background: '#ffffff',
      borderRadius: '32px 32px 0 0',
      boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.12), 0 -2px 16px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
    }}>
      {/* Drag Handle */}
      <div 
        onMouseDown={handleDragHandle}
        onTouchStart={handleDragHandle}
        style={getDragHandleStyle()}
      >
        <div style={getDragIndicatorStyle()}></div>
      </div>

      {/* Status Header */}
      <div 
        onClick={handleToggleExpansion}
        style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: allowManualToggle ? 'pointer' : 'default'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: isOnline ? 
              'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)' : 
              'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)',
            boxShadow: isOnline ? 
              '0 0 0 4px rgba(76, 175, 80, 0.2)' : 
              '0 0 0 4px rgba(158, 158, 158, 0.2)',
            animation: isOnline ? 'onlinePulse 2s ease-in-out infinite' : 'none'
          }}></div>
          <span style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#212121'
          }}>
            {isOnline ? 'Online - Looking for rides' : 'Offline'}
          </span>
        </div>
        {allowManualToggle && (
          <button style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isExpanded ? <ChevronDown size={20} color="#9E9E9E" /> : <ChevronUp size={20} color="#9E9E9E" />}
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div style={{ padding: '0 20px 24px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#9E9E9E',
            marginBottom: '16px',
            letterSpacing: '1px',
            paddingLeft: '4px'
          }}>
            TODAY'S STATS
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)',
              padding: '16px',
              borderRadius: '20px',
              border: '2px solid #C8E6C9',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
              }}>
                <DollarSign size={20} color="white" />
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '900',
                color: '#2E7D32',
                marginBottom: '4px'
              }}>
                ZWG{todayStats.earnings.toFixed(2)}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#4CAF50',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Earnings
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #E3F2FD 0%, #E8EAF6 100%)',
              padding: '16px',
              borderRadius: '20px',
              border: '2px solid #BBDEFB',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
              }}>
                <Car size={20} color="white" />
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '900',
                color: '#1565C0',
                marginBottom: '4px'
              }}>
                {todayStats.trips}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#2196F3',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Trips
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #FFF3E0 0%, #FFF8E1 100%)',
              padding: '16px',
              borderRadius: '20px',
              border: '2px solid #FFCC02',
              boxShadow: '0 4px 12px rgba(255, 193, 7, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #FFD93D 0%, #FFC107 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
              }}>
                <Clock size={20} color="white" />
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '900',
                color: '#F57F17',
                marginBottom: '4px'
              }}>
                {todayStats.hours}h
              </div>
              <div style={{
                fontSize: '11px',
                color: '#FFC107',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Online
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 100%)',
              padding: '16px',
              borderRadius: '20px',
              border: '2px solid #F8BBD9',
              boxShadow: '0 4px 12px rgba(233, 30, 99, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)'
              }}>
                <Star size={20} color="white" />
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '900',
                color: '#AD1457',
                marginBottom: '4px'
              }}>
                {todayStats.rating}★
              </div>
              <div style={{
                fontSize: '11px',
                color: '#E91E63',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Rating
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes onlinePulse {
            0%, 100% {
              box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
            }
            50% {
              box-shadow: 0 0 0 8px rgba(76, 175, 80, 0.1);
            }
          }
        `}
      </style>
    </div>
  );

  const renderRequestContent = () => {
    console.log("🎨 Rendering request content with:", rideRequest);
    
    const driverEarning = (parseFloat(rideRequest?.estimatedPrice || '0') * 0.8).toFixed(2);
    
    return (
      <div style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '420px',
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '32px 32px 0 0',
        boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.12), 0 -2px 16px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
      }}>
        {/* Drag Handle */}
        <div 
          onMouseDown={handleDragHandle}
          onTouchStart={handleDragHandle}
          style={getDragHandleStyle()}
        >
          <div style={getDragIndicatorStyle()}></div>
        </div>

        {/* Timer Hero - Bubbly and Prominent */}
        <div style={{
          padding: '0 24px 20px',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: requestTimer <= 5 ? 
                'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)' : 
                'linear-gradient(135deg, #FFD93D 0%, #FFC107 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: requestTimer <= 5 ?
                '0 8px 24px rgba(255, 107, 107, 0.4), 0 0 0 8px rgba(255, 107, 107, 0.1)' :
                '0 8px 24px rgba(255, 193, 7, 0.4), 0 0 0 8px rgba(255, 217, 61, 0.15)',
              animation: requestTimer <= 5 ? 'urgentPulse 0.8s ease-in-out infinite' : 'gentlePulse 2s ease-in-out infinite',
              transform: 'translateZ(0)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  color: '#ffffff',
                  lineHeight: '1',
                  marginBottom: '2px'
                }}>
                  {requestTimer}
                </div>
                <div style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  color: '#ffffff',
                  opacity: 0.9,
                  letterSpacing: '0.5px'
                }}>
                  SEC
                </div>
              </div>
            </div>
            <Clock 
              size={16} 
              color={requestTimer <= 5 ? '#FF6B6B' : '#FFC107'} 
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ffffff',
                borderRadius: '50%',
                padding: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        </div>

        {/* Earnings Card - Main Focus */}
        <div style={{
          margin: '0 20px 20px',
          padding: '20px',
          background: 'linear-gradient(135deg, #FFD93D 0%, #FFC107 100%)',
          borderRadius: '24px',
          boxShadow: '0 8px 24px rgba(255, 193, 7, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            top: '-30px',
            right: '-30px'
          }}></div>
          <div style={{
            position: 'absolute',
            width: '60px',
            height: '60px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            bottom: '-20px',
            left: '-20px'
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#8B6914',
              marginBottom: '8px',
              letterSpacing: '0.5px'
            }}>
              YOUR EARNING
            </div>
            <div style={{
              fontSize: '42px',
              fontWeight: '900',
              color: '#ffffff',
              lineHeight: '1',
              marginBottom: '16px',
              textShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              ZWG{driverEarning}
            </div>
            
            <div style={{
              display: 'flex',
              gap: '16px',
              paddingTop: '16px',
              borderTop: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '12px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '11px', color: '#8B6914', fontWeight: '600', marginBottom: '4px' }}>
                  DISTANCE
                </div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                  {formatDistance(rideRequest?.estimatedTotalDistance || 0)}
                </div>
              </div>
              <div style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '12px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '11px', color: '#8B6914', fontWeight: '600', marginBottom: '4px' }}>
                  DURATION
                </div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                  {formatDuration(rideRequest?.estimatedTotalDuration || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Route Section - Bubbly Cards */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#9E9E9E',
            marginBottom: '12px',
            letterSpacing: '1px',
            paddingLeft: '4px'
          }}>
            ROUTE
          </div>
          
          {rideRequest?.stops?.map((stop, index) => (
            <div key={index} style={{
              background: index === 0 ? '#F0F9FF' : '#FFF4E6',
              padding: '16px',
              borderRadius: '20px',
              marginBottom: index === 0 ? '12px' : '0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: `2px solid ${index === 0 ? '#B3E5FC' : '#FFE0B2'}`,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                minWidth: '44px',
                height: '44px',
                borderRadius: '50%',
                background: index === 0 ? 
                  'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)' : 
                  'linear-gradient(135deg, #FFD93D 0%, #FFC107 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: index === 0 ?
                  '0 4px 12px rgba(79, 195, 247, 0.4)' :
                  '0 4px 12px rgba(255, 193, 7, 0.4)',
              }}>
                {index === 0 ? (
                  <Navigation size={20} color="white" style={{ transform: 'rotate(45deg)' }} />
                ) : (
                  <MapPin size={20} color="white" />
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  color: index === 0 ? '#0277BD' : '#F57C00',
                  marginBottom: '4px',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {index === 0 ? 'PICKUP' : 'DROP-OFF'}
                  {index === 0 && (
                    <span style={{
                      background: '#4FC3F7',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontSize: '9px'
                    }}>
                      ~5 MIN
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#212121',
                  lineHeight: '1.3'
                }}>
                  {stop.location}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Passenger Info - Compact Bubble */}
        <div style={{ padding: '0 20px 24px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#9E9E9E',
            marginBottom: '12px',
            letterSpacing: '1px',
            paddingLeft: '4px'
          }}>
            PASSENGER
          </div>
          
          {rideRequest?.passengers?.map((passenger, index) => (
            <div key={passenger.id} style={{
              background: 'linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%)',
              padding: '16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
              border: '2px solid #E0E0E0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #757575, #616161)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}>
                  <User size={24} color="white" />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '17px',
                    fontWeight: '700',
                    color: '#212121',
                    marginBottom: '4px'
                  }}>
                    {passenger.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#FFF9C4',
                      padding: '4px 8px',
                      borderRadius: '8px'
                    }}>
                      <Star size={12} fill="#FFC107" color="#FFC107" />
                      <span style={{
                        fontSize: '13px',
                        color: '#F57F17',
                        fontWeight: '700'
                      }}>
                        {passenger.rating}
                      </span>
                    </div>
                    {passenger.phoneNumber && (
                      <span style={{
                        fontSize: '12px',
                        color: '#757575',
                        fontWeight: '600'
                      }}>
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {passenger.phoneNumber && (
                  <button style={{
                    width: '44px',
                    height: '44px',
                    background: '#ffffff',
                    border: '2px solid #E0E0E0',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.background = '#4FC3F7';
                    e.currentTarget.style.borderColor = '#4FC3F7';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#E0E0E0';
                  }}
                  >
                    <Phone size={18} color="#757575" />
                  </button>
                )}
                <button style={{
                  width: '44px',
                  height: '44px',
                  background: '#ffffff',
                  border: '2px solid #E0E0E0',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.background = '#4FC3F7';
                  e.currentTarget.style.borderColor = '#4FC3F7';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#E0E0E0';
                }}
                >
                  <MessageCircle size={18} color="#757575" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons - Big, Bubbly, Tactile */}
        <div style={{ padding: '0 20px 28px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onDeclineRequest}
              style={{
                flex: 1,
                padding: '18px',
                background: '#ffffff',
                border: '3px solid #FFCDD2',
                borderRadius: '20px',
                color: '#E53935',
                fontSize: '15px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(229, 57, 53, 0.15)',
                transition: 'all 0.2s',
                letterSpacing: '0.5px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.background = '#FFEBEE';
                e.currentTarget.style.borderColor = '#E53935';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(229, 57, 53, 0.25)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#FFCDD2';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(229, 57, 53, 0.15)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
            >
              <XCircle size={20} />
              DECLINE
            </button>

            <button
              onClick={onAcceptRequest}
              style={{
                flex: 2,
                padding: '18px',
                background: 'linear-gradient(135deg, #FFD93D 0%, #FFC107 100%)',
                border: 'none',
                borderRadius: '20px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px rgba(255, 193, 7, 0.4)',
                transition: 'all 0.2s',
                letterSpacing: '0.5px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 193, 7, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 193, 7, 0.4)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
            >
              <CheckCircle size={22} />
              ACCEPT TRIP
            </button>
          </div>
        </div>

        <style>
          {`
            @keyframes gentlePulse {
              0%, 100% {
                box-shadow: 0 8px 24px rgba(255, 193, 7, 0.4), 0 0 0 8px rgba(255, 217, 61, 0.15);
              }
              50% {
                box-shadow: 0 8px 32px rgba(255, 193, 7, 0.5), 0 0 0 12px rgba(255, 217, 61, 0.2);
              }
            }
            
            @keyframes urgentPulse {
              0%, 100% {
                box-shadow: 0 8px 24px rgba(255, 107, 107, 0.4), 0 0 0 8px rgba(255, 107, 107, 0.1);
                transform: scale(1);
              }
              50% {
                box-shadow: 0 8px 32px rgba(255, 107, 107, 0.6), 0 0 0 12px rgba(255, 107, 107, 0.2);
                transform: scale(1.05);
              }
            }
          `}
        </style>
      </div>
    );
  };



  const renderTripActiveContent = () => {
    console.log("🎨 Rendering trip active content with:", activeTrip);
    
    const statusPhase = currentTripStatus || activeTrip?.status || 'accepted';
    const fare = activeTrip?.price || activeTrip?.estimatedPrice || '0.00';
    
    const statusConfig = {
      accepted: { 
        text: 'TRIP ACCEPTED',
        color: '#FFD93D',
        bg: 'linear-gradient(135deg, #FFE082 0%, #FFD93D 100%)',
        action: { text: "I'VE ARRIVED", icon: CheckCircle, onClick: () => onTripAction('arrived') }
      },
      arrived: { 
        text: 'WAITING FOR PICKUP',
        color: '#4FC3F7',
        bg: 'linear-gradient(135deg, #81D4FA 0%, #4FC3F7 100%)', 
        action: { text: 'START TRIP', icon: Car, onClick: () => onTripAction('start') }
      },
      started: { 
        text: 'TRIP IN PROGRESS',
        color: '#66BB6A', 
        bg: 'linear-gradient(135deg, #A5D6A7 0%, #66BB6A 100%)',
        action: { text: 'COMPLETE TRIP', icon: CheckCircle, onClick: () => onTripAction('complete') }
      }
    };
    
    const currentConfig = statusConfig[statusPhase] || statusConfig.accepted;
    
    return (
      <div style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '420px',
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '32px 32px 0 0',
        boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.12), 0 -2px 16px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
      }}>
        {/* Drag Handle */}
        <div 
          onMouseDown={handleDragHandle}
          onTouchStart={handleDragHandle}
          style={getDragHandleStyle()}
        >
          <div style={getDragIndicatorStyle()}></div>
        </div>

        {/* Status Header - Dynamic based on trip phase */}
        <div style={{
          margin: '0 20px 20px',
          padding: '20px',
          background: currentConfig.bg,
          borderRadius: '24px',
          boxShadow: `0 8px 24px ${currentConfig.color}33`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            top: '-20px',
            right: '-20px'
          }}></div>
          <div style={{
            position: 'absolute',
            width: '50px',
            height: '50px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            bottom: '-15px',
            left: '-15px'
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  animation: 'onlinePulse 2s ease-in-out infinite'
                }}></div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'rgba(0,0,0,0.7)',
                  letterSpacing: '0.5px'
                }}>
                  {currentConfig.text}
                </div>
              </div>
              
              <div style={{
                fontSize: '24px',
                fontWeight: '900',
                color: '#ffffff',
                textShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                ZWG{fare}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '10px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '10px', color: 'rgba(0,0,0,0.6)', fontWeight: '600', marginBottom: '4px' }}>
                  DURATION
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                  {formatDuration(activeTrip?.estimatedTotalDuration || 0)}
                </div>
              </div>
              
              <div style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '10px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '10px', color: 'rgba(0,0,0,0.6)', fontWeight: '600', marginBottom: '4px' }}>
                  DISTANCE
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                  {formatDistance(activeTrip?.estimatedTotalDistance || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Card */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#9E9E9E',
            marginBottom: '12px',
            letterSpacing: '1px',
            paddingLeft: '4px'
          }}>
            PASSENGER
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%)',
            padding: '16px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            border: '2px solid #E0E0E0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #757575, #616161)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}>
                <User size={24} color="white" />
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '17px',
                  fontWeight: '700',
                  color: '#212121',
                  marginBottom: '4px'
                }}>
                  {activeTrip?.rider?.fullName || 'Passenger'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#FFF9C4',
                    padding: '4px 8px',
                    borderRadius: '8px'
                  }}>
                    <Star size={12} fill="#FFC107" color="#FFC107" />
                    <span style={{
                      fontSize: '13px',
                      color: '#F57F17',
                      fontWeight: '700'
                    }}>
                      {activeTrip?.rider?.averageRating || '5.0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                width: '44px',
                height: '44px',
                background: '#ffffff',
                border: '2px solid #E0E0E0',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = '#4FC3F7';
                e.currentTarget.style.borderColor = '#4FC3F7';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#E0E0E0';
              }}
              >
                <Phone size={18} color="#757575" />
              </button>
              <button style={{
                width: '44px',
                height: '44px',
                background: '#ffffff',
                border: '2px solid #E0E0E0',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = '#4FC3F7';
                e.currentTarget.style.borderColor = '#4FC3F7';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#E0E0E0';
              }}
              >
                <MessageCircle size={18} color="#757575" />
              </button>
            </div>
          </div>
        </div>

        {/* Route Section */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#9E9E9E',
            marginBottom: '12px',
            letterSpacing: '1px',
            paddingLeft: '4px'
          }}>
            ROUTE
          </div>
          
          <div style={{
            background: '#F0F9FF',
            padding: '16px',
            borderRadius: '20px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '2px solid #B3E5FC',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              minWidth: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79, 195, 247, 0.4)',
            }}>
              <Navigation size={20} color="white" style={{ transform: 'rotate(45deg)' }} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '10px',
                fontWeight: '800',
                color: '#0277BD',
                marginBottom: '4px',
                letterSpacing: '0.5px'
              }}>
                PICKUP
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#212121',
                lineHeight: '1.3'
              }}>
                {activeTrip?.pickup?.address || 'Pickup Location'}
              </div>
            </div>
          </div>

          <div style={{
            background: '#FFF4E6',
            padding: '16px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '2px solid #FFE0B2',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              minWidth: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFD93D 0%, #FFC107 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)',
            }}>
              <MapPin size={20} color="white" />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '10px',
                fontWeight: '800',
                color: '#F57C00',
                marginBottom: '4px',
                letterSpacing: '0.5px'
              }}>
                DROP-OFF
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#212121',
                lineHeight: '1.3'
              }}>
                {activeTrip?.dropoff?.address || 'Dropoff Location'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: '0 20px 28px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onTripAction('navigate')}
              style={{
                flex: 1,
                padding: '18px',
                background: '#ffffff',
                border: '3px solid #E3F2FD',
                borderRadius: '20px',
                color: '#1976D2',
                fontSize: '15px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                transition: 'all 0.2s',
                letterSpacing: '0.5px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.background = '#E3F2FD';
                e.currentTarget.style.borderColor = '#1976D2';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(25, 118, 210, 0.25)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#E3F2FD';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.15)';
              }}
            >
              <Navigation size={20} />
              NAVIGATE
            </button>

            <button
              onClick={currentConfig.action.onClick}
              style={{
                flex: 2,
                padding: '18px',
                background: currentConfig.bg,
                border: 'none',
                borderRadius: '20px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: `0 8px 24px ${currentConfig.color}40`,
                transition: 'all 0.2s',
                letterSpacing: '0.5px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = `0 12px 32px ${currentConfig.color}50`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${currentConfig.color}40`;
              }}
            >
              <currentConfig.action.icon size={22} />
              {currentConfig.action.text}
            </button>
          </div>
        </div>

        <style>
          {`
            @keyframes onlinePulse {
              0%, 100% {
                box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.4);
              }
              50% {
                box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.2);
              }
            }
          `}
        </style>
      </div>
    );
  };

  const renderCompletedContent = () => {
    console.log("🎨 Rendering completed content with:", completedTrip);
    
    const tripFare = completedTrip?.price || '0.00';
    const driverEarning = (parseFloat(tripFare) * 0.8).toFixed(2);
    
    return (
      <div style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '420px',
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '32px 32px 0 0',
        boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.12), 0 -2px 16px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
      }}>
        {/* Drag Handle */}
        <div 
          onMouseDown={handleDragHandle}
          onTouchStart={handleDragHandle}
          style={getDragHandleStyle()}
        >
          <div style={getDragIndicatorStyle()}></div>
        </div>

        {/* Success Hero Section */}
        <div style={{
          padding: '20px 24px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 12px 32px rgba(76, 175, 80, 0.4), 0 0 0 12px rgba(76, 175, 80, 0.1)',
            animation: 'successPulse 2s ease-in-out infinite'
          }}>
            <CheckCircle size={48} color="white" />
          </div>
          
          <div style={{
            fontSize: '28px',
            fontWeight: '900',
            color: '#2E7D32',
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}>
            Trip Completed!
          </div>
          
          <div style={{
            fontSize: '14px',
            color: '#66BB6A',
            fontWeight: '600',
            marginBottom: '20px'
          }}>
            Great job! Your passenger has been delivered safely.
          </div>
        </div>

        {/* Earnings Celebration Card */}
        <div style={{
          margin: '0 20px 20px',
          padding: '24px',
          background: 'linear-gradient(135deg, #FFD93D 0%, #FFC107 100%)',
          borderRadius: '24px',
          boxShadow: '0 8px 24px rgba(255, 193, 7, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            top: '-40px',
            right: '-40px'
          }}></div>
          <div style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            bottom: '-30px',
            left: '-30px'
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#8B6914',
              marginBottom: '8px',
              letterSpacing: '0.5px',
              opacity: 0.8
            }}>
              🎉 CONGRATULATIONS! YOU EARNED
            </div>
            
            <div style={{
              fontSize: '48px',
              fontWeight: '900',
              color: '#ffffff',
              lineHeight: '1',
              marginBottom: '20px',
              textShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              ZWG{driverEarning}
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              paddingTop: '20px',
              borderTop: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '12px 8px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '10px', color: '#8B6914', fontWeight: '600', marginBottom: '4px' }}>
                  DISTANCE
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                  {formatDistance(completedTrip?.distance || 0)}
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '12px 8px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '10px', color: '#8B6914', fontWeight: '600', marginBottom: '4px' }}>
                  TIME
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                  {formatDuration(completedTrip?.duration || 0)}
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '12px 8px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '10px', color: '#8B6914', fontWeight: '600', marginBottom: '4px' }}>
                  TOTAL
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                  ZWG{tripFare}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Rating Section */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#9E9E9E',
            marginBottom: '12px',
            letterSpacing: '1px',
            paddingLeft: '4px'
          }}>
            PASSENGER
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%)',
            padding: '20px',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            border: '2px solid #E0E0E0',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #757575, #616161)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}>
              <User size={28} color="white" />
            </div>
            
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#212121',
              marginBottom: '8px'
            }}>
              {completedTrip?.rider?.fullName || 'Passenger'}
            </div>
            
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#757575',
              marginBottom: '16px'
            }}>
              How was your experience?
            </div>
            
            {/* Star Rating */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    transition: 'all 0.2s',
                    transform: (hoveredStar >= star || rating >= star) ? 'scale(1.2)' : 'scale(1)'
                  }}
                  onMouseOver={(e) => {
                    if (hoveredStar >= star || rating >= star) {
                      e.currentTarget.style.background = '#FFF9C4';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Star 
                    size={32} 
                    fill={(hoveredStar >= star || rating >= star) ? '#FFC107' : 'none'}
                    color={(hoveredStar >= star || rating >= star) ? '#FFC107' : '#E0E0E0'}
                  />
                </button>
              ))}
            </div>
            
            {rating > 0 && (
              <div style={{
                fontSize: '14px',
                color: '#FFC107',
                fontWeight: '700',
                marginTop: '8px'
              }}>
                {rating === 5 ? '⭐ Excellent!' : 
                 rating === 4 ? '👍 Great!' :
                 rating === 3 ? '👌 Good!' :
                 rating === 2 ? '🤔 Okay' : '😟 Needs Improvement'}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: '0 20px 28px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onTripClose}
              style={{
                flex: 1,
                padding: '18px',
                background: '#ffffff',
                border: '3px solid #E0E0E0',
                borderRadius: '20px',
                color: '#757575',
                fontSize: '15px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s',
                letterSpacing: '0.5px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.background = '#F5F5F5';
                e.currentTarget.style.borderColor = '#BDBDBD';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#E0E0E0';
              }}
            >
              CLOSE
            </button>

            <button
              onClick={onRatingSubmit}
              disabled={rating === 0}
              style={{
                flex: 2,
                padding: '18px',
                background: rating > 0 ? 
                  'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)' : 
                  'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)',
                border: 'none',
                borderRadius: '20px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '900',
                cursor: rating > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: rating > 0 ? 
                  '0 8px 24px rgba(76, 175, 80, 0.4)' : 
                  '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
                letterSpacing: '0.5px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                opacity: rating > 0 ? 1 : 0.6
              }}
              onMouseOver={(e) => {
                if (rating > 0) {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(76, 175, 80, 0.5)';
                }
              }}
              onMouseOut={(e) => {
                if (rating > 0) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(76, 175, 80, 0.4)';
                }
              }}
            >
              <CheckCircle size={22} />
              SUBMIT RATING
            </button>
          </div>
        </div>

        <style>
          {`
            @keyframes successPulse {
              0%, 100% {
                box-shadow: 0 12px 32px rgba(76, 175, 80, 0.4), 0 0 0 12px rgba(76, 175, 80, 0.1);
              }
              50% {
                box-shadow: 0 16px 40px rgba(76, 175, 80, 0.5), 0 0 0 16px rgba(76, 175, 80, 0.15);
              }
            }
          `}
        </style>
      </div>
    );
  };

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

  // Debug logging for visibility
  console.log("🎨 RideDrawer render state:", {
    isVisible,
    drawerState,
    isExpanded,
    isOnline,
    activeTrip: activeTrip?.id,
    rideRequest: rideRequest?.id
  });

  return (
    <>
      {/* Backdrop for modal effect */}
      {isVisible && (isExpanded || drawerState === 'REQUEST_PENDING' || drawerState === 'TRIP_COMPLETED') && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 998,
            transition: 'opacity 0.3s ease'
          }}
          onClick={() => {
            if (drawerState !== 'REQUEST_PENDING' && drawerState !== 'TRIP_COMPLETED') {
              setIsExpanded(false);
            }
          }} 
        />
      )}
      
      {/* Card-Based Floating Modal Drawer */}
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          display: isVisible ? 'block' : 'none',
          pointerEvents: isVisible ? 'auto' : 'none',
          // Apply modalStyle for positioning and animations
          ...modalStyle,
          // Enhanced mobile touch handling
          touchAction: 'pan-y', // Allow vertical panning only
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          // Visual enhancements
          backgroundColor: '#ffffff',
          boxShadow: isDragging 
            ? '0 -8px 40px rgba(0, 0, 0, 0.25), 0 -2px 16px rgba(0, 0, 0, 0.15)' 
            : '0 -8px 40px rgba(0, 0, 0, 0.12), 0 -2px 16px rgba(0, 0, 0, 0.08)',
          // Performance optimizations
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          // Drag visual feedback
          opacity: isDragging ? 0.95 : 1,
          transform: modalStyle.transform,
        }}
        // Remove event handlers from container - they're handled by drag handle
      >
        {renderContent()}
      </div>
    </>
  );
};

export default RideDrawer;
