import React, { useState, useEffect } from 'react';
import { Car, MapPin, Clock, DollarSign, Navigation, User, Bell, Settings, Menu } from 'lucide-react';
import BottomDock from '../../components/BottomDock';
import RideRequest from '../../components/RideRequest';
import './DriverDashboard.css';

import NotificationService from '../../services/NotificationService';
import vayeLogo from '../../assets/images/VayeLogoB.png'; // Adjust the path as necessary
import { useSpring, animated } from 'react-spring';
import DashboardMap from '../../components/DashboardMap';
import OnlineStatusButton from '../../components/OnlineStatusButton';




const DriverDashboard = ({ onLogout }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [earnings, setEarnings] = useState(2847);
  const [trips, setTrips] = useState(23);
  const [hours, setHours] = useState(8.5);
  const [activeRideRequest, setActiveRideRequest] = useState(null);
  const [requestTimeRemaining, setRequestTimeRemaining] = useState(15);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -17.824858, lng: 31.053028 }); // Harare coordinates
  const [expandedStat, setExpandedStat] = useState(null);
  const [transitioning, setTransitioning] = useState(false);


    const handleStatusChange = (newStatus) => {
    if (newStatus !== isOnline) {
      setTransitioning(true);
      setTimeout(() => {
        setIsOnline(newStatus);
        setTimeout(() => {
          setTransitioning(false);
        }, 50);
      }, 500);
    }
  };




  // Add location tracking
useEffect(() => {
  if (isOnline) {
    navigator.geolocation.watchPosition(
      (position) => {
        setMapCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true }
    );
  }
}, [isOnline]);

  // Request notification permissions when component mounts
  useEffect(() => {
    const setupNotifications = async () => {
      const granted = await NotificationService.requestPermissions();
      setNotificationsEnabled(granted);
    };
    setupNotifications();
  }, []);

    // Simulate ride requests when online
  useEffect(() => {
    let requestTimer;
    if (isOnline) {
      requestTimer = setInterval(() => {
        // Random time between 10-30 seconds for next request
        const nextRequestTime = Math.floor(Math.random() * 20000) + 10000;

        setTimeout(() => {
          generateRideRequest();
        }, nextRequestTime);
      }, 30000); // Check every 90 seconds
    }

    return () => {
      clearInterval(requestTimer);
    };
  }, [isOnline]);

const generateRideRequest = () => {
     console.log('Generating new ride request...');
  // 30% chance of generating a carpool request
  const isCarpool = Math.random() < 0.3;

  if (isCarpool) {
    const mockCarpoolRequest = {
      isCarpool: true,
      passengers: [
        { id: 1, name: "John Doe", rating: 4.8 },
        { id: 2, name: "Jane Smith", rating: 4.9 }
      ],
      stops: [
        { 
          passengerName: "John Doe",
          location: "123 Main St, Downtown",
          estimatedPrice: Math.floor(Math.random() * 15) + 10
        },
        {
          passengerName: "Jane Smith",
          location: "789 Oak Ave, Midtown",
          estimatedPrice: Math.floor(Math.random() * 12) + 8
        },
        {
          passengerName: "John Doe",
          location: "456 Park Ave, Uptown",
          estimatedPrice: null
        },
        {
          passengerName: "Jane Smith",
          location: "321 Pine St, Westside",
          estimatedPrice: null
        }
      ],
      estimatedPrice: Math.floor(Math.random() * 40) + 25,
      estimatedTotalDistance: (Math.random() * 15).toFixed(1),
      estimatedTotalDuration: Math.floor(Math.random() * 45) + 20
    };

    // Show notification for carpool request
    if (notificationsEnabled) {
        NotificationService.showRideRequestNotification(mockCarpoolRequest);
    }
    setActiveRideRequest(mockCarpoolRequest);
    console.log('Generated CARPOOL request:', mockCarpoolRequest);

  } else {
    const mockSingleRequest = {
      isCarpool: false,
      passengers: [{
        id: 1,
        name: "John Doe",
        phoneNumber: "0711111111",
        rating: 4.8
      }],
      stops: [
        {
          passengerName: "John Doe",
          location: "123 Main St, Downtown",
          estimatedPrice: null
        },
        {
          passengerName: "John Doe",
          location: "456 Park Ave, Uptown",
          estimatedPrice: null
        }
      ],
      estimatedPrice: Math.floor(Math.random() * 30) + 15,
      estimatedTotalDistance: (Math.random() * 10).toFixed(1),
      estimatedTotalDuration: Math.floor(Math.random() * 30) + 10
    };

    // Show notification for single request
    if (notificationsEnabled) {
        NotificationService.showRideRequestNotification(mockSingleRequest);
    }
    setActiveRideRequest(mockSingleRequest);
    console.log('Generated SINGLE request:', mockSingleRequest);
  }

  
  
  setRequestTimeRemaining(15); // 15 seconds to respond
};

  // Add notification handlers
  const handleNotificationResponse = (notification) => {
    // Handle notification interaction
    if (notification.actionId === 'accept') {
      handleAcceptRide();
    } else if (notification.actionId === 'decline') {
      handleDeclineRide();
    }
  };

  const handleAcceptRide = () => {
    // Handle ride acceptance
    setActiveRideRequest(null);
    // You would typically navigate to a ride-in-progress screen here
  };

  const handleDeclineRide = () => {
    setActiveRideRequest(null);
  };


  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);

    if (newStatus && !notificationsEnabled) 
        {
        NotificationService.requestPermissions()
            .then(granted => setNotificationsEnabled(granted));
        }

  };

  const handleTabChange = (tabId) => {
    if (tabId === 'logout') {
      onLogout();
      return;
    }
    setActiveTab(tabId);
    // Handle different tab actions here
    console.log('Switched to tab:', tabId);
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <div className="app-header">
        <button className="header-button">
          <Menu size={24} />
        </button>
         <div className="logo-container">
                    <img src={vayeLogo} alt="Vaye" className="logo-image2" />
                  </div>
        <button className="header-button">
          <Bell size={24} />
        </button>
      </div>

       {isOnline ? (
      <>
       <div className={`map-container ${!transitioning ? 'visible' : ''}`}>
        <DashboardMap 
          center={mapCenter}
          markers={[
            {
              position: mapCenter,
              icon: {
                url: '/driver-marker.png',
                scaledSize: { width: 40, height: 40 }
              }
            }
          ]}
        />
        </div>
        
        <div className="looking-for-rides">
          <div className="status-icon searching">
            <MapPin size={20} color="#4CAF50" />
          </div>
          <span>Looking for rides nearby...</span>
        </div>

            <OnlineStatusButton 
          isOnline={isOnline} 
          onStatusChange={handleStatusChange}
        />

        <div className="floating-stats">
  <animated.div 
    className={`stat-bubble ${expandedStat === 'earnings' ? 'expanded' : ''}`}
    onClick={() => setExpandedStat(expandedStat === 'earnings' ? null : 'earnings')}
    style={{
      transform: expandedStat === 'earnings' 
        ? 'scale(1.05)' 
        : 'scale(1)'
    }}
  >
    <DollarSign className="icon" size={24} />
    {expandedStat !== 'earnings' && (
      <span className="mini-value">${earnings}</span>
    )}
    {expandedStat === 'earnings' && (
      <div className="stat-details">
        <div className="stat-value">${earnings}</div>
        <div className="stat-label">Today's Earnings</div>
      </div>
    )}
  </animated.div>

  <animated.div 
    className={`stat-bubble ${expandedStat === 'trips' ? 'expanded' : ''}`}
    onClick={() => setExpandedStat(expandedStat === 'trips' ? null : 'trips')}
    style={{
      transform: expandedStat === 'trips' 
        ? 'scale(1.05)' 
        : 'scale(1)'
    }}
  >
    <Navigation className="icon" size={24} />
    {expandedStat !== 'trips' && (
      <span className="mini-value">{trips}</span>
    )}
    {expandedStat === 'trips' && (
      <div className="stat-details">
        <div className="stat-value">{trips}</div>
        <div className="stat-label">Trips Today</div>
      </div>
    )}
  </animated.div>
</div>
      </>
    ) : (

      <div className={`dashboard-container ${transitioning ? 'exiting' : ''}`}>
        {/* Online Status Section */}
        <div className="status-section">
          <div className="status-header">
            <h2 className="status-title">Driver Status</h2>
            <div className={`status-indicator ${isOnline ? 'status-online pulse' : 'status-offline'}`}></div>
          </div>
          
          <button
            onClick={toggleOnlineStatus}
            className={`status-button ${isOnline ? 'status-button-offline' : 'status-button-online'}`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-green">
            <div className="stat-header">
              <DollarSign size={24} />
              <span className="stat-period">Today</span>
            </div>
            <div className="stat-value">${earnings}</div>
            <div className="stat-label">Earnings</div>
          </div>

          <div className="stat-card stat-card-blue">
            <div className="stat-header">
              <Navigation size={24} />
              <span className="stat-period">Today</span>
            </div>
            <div className="stat-value">{trips}</div>
            <div className="stat-label">Trips</div>
          </div>
        </div>

        <div className="stat-card stat-card-purple full-width">
          <div className="stat-header">
            <Clock size={24} />
            <span className="stat-period">Today</span>
          </div>
          <div className="stat-value">{hours}h</div>
          <div className="stat-label">Online Time</div>
        </div>

        {/* Current Status */}
        <div className="current-status">
          {isOnline ? (
            <div className="status-content">
              <div className="status-icon searching">
                <MapPin size={24} />
              </div>
              <h3 className="status-heading">Looking for rides...</h3>
              <p className="status-description">Stay in a busy area to get more ride requests</p>
            </div>
          ) : (
            <div className="status-content">
              <div className="status-icon offline">
                <Car size={24} />
              </div>
              <h3 className="status-heading">You're offline</h3>
              <p className="status-description">Go online to start receiving ride requests</p>
            </div>
          )}
        </div>

        {/* Quick Actions - Reduced since main actions moved to dock */}
        {/* <div className="quick-actions">
          <button 
            onClick={onLogout}
            className="action-button action-button-danger"
          >
            <Settings size={24} />
            <span>Settings</span>
          </button>
        </div> */}
      </div>
    )}

          {activeRideRequest && (
        <RideRequest
          request={activeRideRequest}
          onAccept={handleAcceptRide}
          onDecline={handleDeclineRide}
          timeRemaining={requestTimeRemaining}
        />
      )}

   

      {/* Bottom Navigation Dock */}
      <BottomDock 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOnline={isOnline}
      />
    </div>
  );
};

export default DriverDashboard;