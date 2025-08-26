import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  MapPin,
  Clock,
  DollarSign,
  User,
  Bell,
  Settings,
  Menu,
  AlertTriangle,
  AlertOctagon,
  Ban,
  Navigation2,
  RotateCcw,
  History,
  MessageCircle,
  BarChart3,
  TrendingUp,
  Activity,
  Phone,
  Send,
  Star,
  Award,
  Calendar,
} from "lucide-react";
import BottomDock from "../../components/BottomDock";
import RideDrawer from "../../components/RideDrawer/RideDrawer";
import DeliveryRequest from "../../components/DeliveryRequest/DeliveryRequest";
import DeliveryRoute from "../../components/DeliveryRoute/DeliveryRoute";
import DeliveryJobList from "../../components/DeliveryJobList/DeliveryJobList";
import DashboardMap from "../../components/DashboardMap";
import NotificationService from "../../services/NotificationService";
import { useAuth } from "../../context/AuthContext";
import { 
  getNearbyRequests,
  acceptRideRequest,
  setDriverAvailability,
  updateDriverLocation
} from "../../services/requestService";
import { 
  getNearbyDeliveries, 
  acceptDeliveryRequest, 
  getMyDeliveryRoute,
  updateDeliveryStatus,
  getAvailableDeliveryJobs,
  acceptDeliveryJob
} from "../../services/deliveryService";
import "./EnhancedDriverDashboard.css";

// Utility function to map API ride data to drawer format
function mapApiRideToRequest(apiRide) {
  return {
    isCarpool: false,
    estimatedPrice: apiRide.estimatedPrice || "",
    passengers: [
      {
        id: apiRide.rider._id,
        name: apiRide.rider.fullName,
        rating: apiRide.rider.averageRating,
        phoneNumber: apiRide.rider.phoneNumber || "",
      },
    ],
    stops: [
      {
        location: apiRide.pickup.address,
        passengerName: apiRide.rider.fullName,
        estimatedPrice: null,
      },
      {
        location: apiRide.dropoff.address,
        passengerName: apiRide.rider.fullName,
        estimatedPrice: null,
      },
    ],
    estimatedTotalDistance: apiRide.estimatedTotalDistance || "",
    estimatedTotalDuration: apiRide.estimatedTotalDuration || "",
    _id: apiRide._id,
  };
}

function EnhancedDriverDashboard({ onLogout = () => {} }) {
  // Core state
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mapCenter, setMapCenter] = useState({ lat: -26.2041, lng: 28.0473 });
  
  // Stats state
  const [todayStats, setTodayStats] = useState({
    earnings: 2847,
    trips: 23,
    hours: 8.5,
    rating: 4.9
  });

  // Ride-related state
  const [rideRequests, setRideRequests] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [showRequest, setShowRequest] = useState(false);
  const [requestTimer, setRequestTimer] = useState(20);
  const [declinedRequestIds, setDeclinedRequestIds] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [completedTrip, setCompletedTrip] = useState(null);
  const [currentTripStatus, setCurrentTripStatus] = useState(null); // Track trip status from map

  // Delivery-related state (keeping existing functionality)
  const [deliveryRequests, setDeliveryRequests] = useState([]);
  const [activeDeliveryRoute, setActiveDeliveryRoute] = useState(null);
  const [showDeliveryRequest, setShowDeliveryRequest] = useState(false);
  const [deliveryTimer, setDeliveryTimer] = useState(20);
  const [declinedDeliveryIds, setDeclinedDeliveryIds] = useState([]);

  // UI state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showMapReport, setShowMapReport] = useState(false);

  const { user } = useAuth();

  console.log("User data:", user);

  // Helper to check if user is delivery personnel
  const isDeliveryUser = useMemo(() => {
    return user?.user?.role === 'delivery' || user?.userType === 'delivery';
  }, [user?.user?.role, user?.userType]);

  const userToken = useMemo(() => user?.token, [user?.token]);

  // Determine current drawer state
  const drawerState = useMemo(() => {
    console.log("🎛️ Calculating drawer state:", {
      completedTrip: !!completedTrip,
      activeTrip: !!activeTrip,
      showRequest,
      rideRequestsLength: rideRequests.length
    });
    
    if (completedTrip) return 'TRIP_COMPLETED';
    if (activeTrip) return 'TRIP_ACTIVE';
    if (showRequest && rideRequests.length > 0) return 'REQUEST_PENDING';
    return 'IDLE';
  }, [completedTrip, activeTrip, showRequest, rideRequests]);

  // Current request for drawer
  const currentRequest = rideRequests.length > 0 ? rideRequests[0] : null;
  
  // Debug logging for current request
  useEffect(() => {
    console.log("🎯 Current request updated:", currentRequest);
    console.log("🎯 Ride requests array:", rideRequests);
  }, [currentRequest, rideRequests]);

  // Map markers for dashboard map
  const mapMarkers = useMemo(() => [
    {
      position: mapCenter,
      icon: {
        url: "/driver-marker.png",
        scaledSize: { width: 40, height: 40 },
      },
    },
  ], [mapCenter]);

  // Trip update handler
  const handleTripUpdate = useCallback((updatedTrip) => {
    console.log("📍 Trip update received:", updatedTrip);
    if (updatedTrip) {
      setActiveTrip(updatedTrip);
      // If trip is completed, show completion state briefly then clear
      if (updatedTrip.status === 'completed') {
        setCompletedTrip(updatedTrip);
        // Clear activeTrip after a short delay to allow UI to update
        setTimeout(() => {
          console.log("🏁 Clearing completed trip to resume polling");
          setActiveTrip(null);
        }, 120000); // increased to 2 minutes
      } else if (updatedTrip.status === 'cancelled') {
        console.log("❌ Trip cancelled, clearing immediately");
        setActiveTrip(null);
      }
    } else {
      setActiveTrip(null);
    }
  }, []);

  // Trip status handler - receives status updates from DashboardMap
  const handleTripStatusChange = useCallback((status) => {
    console.log("🎯 Trip status received from map:", status);
    setCurrentTripStatus(status);
  }, []);

  // Ride request polling
  useEffect(() => {
    if (isDeliveryUser) return; // Don't poll for rides if user is delivery personnel
    
    let intervalId;
    let timerId;

    const pollRequests = async () => {
      try {
        const requests = await getNearbyRequests(userToken);
        console.log("🔍 Raw requests from API:", requests);
        if (requests && requests.length > 0) {
          const filteredRequests = requests.filter(
            (r) => !declinedRequestIds.includes(r._id)
          );
          
          if (filteredRequests.length > 0) {
            console.log("🔍 Filtered requests:", filteredRequests);
            
            // Check if requests are already in the correct format or need mapping
            const processedRequests = filteredRequests.map(request => {
              // If request already has passengers array, it's in the new format
              if (request.passengers && Array.isArray(request.passengers)) {
                console.log("✅ Request already in correct format:", request);
                return request;
              } else {
                // Use the old mapping function for API responses
                console.log("🔄 Mapping API request:", request);
                return mapApiRideToRequest(request);
              }
            });
            
            console.log("🎯 Final processed requests:", processedRequests);
            setRideRequests(processedRequests);
            setShowRequest(true);
            setRequestTimer(20);
            
            // Stop polling when request is found
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
            setPollingInterval(null);

            // Start countdown timer
            timerId = setInterval(() => {
              setRequestTimer((prev) => {
                if (prev <= 1) {
                  setShowRequest(false);
                  setRideRequests([]);
                  clearInterval(timerId);
                  
                  // Resume polling if still online and no active trip
                  if (isOnline && !activeTrip) {
                    intervalId = setInterval(pollRequests, 4000);
                    setPollingInterval(intervalId);
                  }
                  return 20;
                }
                return prev - 1;
              });
            }, 1000);
          }
        }
      } catch (err) {
        console.error("Error polling for requests:", err);
      }
    };

    // Start polling if online, no active trip, and no current request
    if (isOnline && !activeTrip && !showRequest) {
      console.log("✅ Starting ride request polling - conditions met:", {
        isOnline,
        hasActiveTrip: !!activeTrip,
        showRequest,
        isDeliveryUser
      });
      
      if (pollingInterval) clearInterval(pollingInterval);
      if (timerId) clearInterval(timerId);
      
      intervalId = setInterval(pollRequests, 4000);
      setPollingInterval(intervalId);
    } else {
      console.log("❌ Stopping ride request polling - conditions not met:", {
        isOnline,
        hasActiveTrip: !!activeTrip,
        showRequest,
        isDeliveryUser
      });
      
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      if (timerId) clearInterval(timerId);
      
      if (!isOnline || activeTrip) {
        setShowRequest(false);
        setRideRequests([]);
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timerId) clearInterval(timerId);
    };
  }, [isOnline, activeTrip, showRequest, declinedRequestIds, userToken, isDeliveryUser]);

  // Delivery polling (keeping existing functionality)
  useEffect(() => {
    if (!isDeliveryUser) return;
    
    let intervalId;
    let timerId;

    const pollDeliveries = async () => {
      try {
        const deliveries = await getNearbyDeliveries(userToken);
        if (deliveries && deliveries.length > 0) {
          const filteredDeliveries = deliveries.filter(
            (d) => !declinedDeliveryIds.includes(d._id)
          );
          
          if (filteredDeliveries.length > 0) {
            setDeliveryRequests(filteredDeliveries);
            setShowDeliveryRequest(true);
            setDeliveryTimer(20);
            
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }

            timerId = setInterval(() => {
              setDeliveryTimer((prev) => {
                if (prev <= 1) {
                  setShowDeliveryRequest(false);
                  setDeliveryRequests([]);
                  clearInterval(timerId);
                  
                  if (isOnline && !activeTrip) {
                    intervalId = setInterval(pollDeliveries, 4000);
                  }
                  return 20;
                }
                return prev - 1;
              });
            }, 1000);
          }
        }
      } catch (err) {
        console.error("Error polling for deliveries:", err);
      }
    };

    if (isOnline && !activeTrip && !showDeliveryRequest) {
      if (intervalId) clearInterval(intervalId);
      if (timerId) clearInterval(timerId);
      
      intervalId = setInterval(pollDeliveries, 4000);
    } else {
      if (intervalId) clearInterval(intervalId);
      if (timerId) clearInterval(timerId);
      
      if (!isOnline || activeTrip) {
        setShowDeliveryRequest(false);
        setDeliveryRequests([]);
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timerId) clearInterval(timerId);
    };
  }, [isDeliveryUser, isOnline, activeTrip, showDeliveryRequest, declinedDeliveryIds, userToken]);

  // Fetch active delivery route
  useEffect(() => {
    if (!isDeliveryUser || !isOnline || !userToken) return;

    const fetchActiveRoute = async () => {
      try {
        const route = await getMyDeliveryRoute(userToken);
        if (route && route.deliveries && route.deliveries.length > 0) {
          setActiveDeliveryRoute(route);
        }
      } catch (err) {
        console.error("Error fetching active delivery route:", err);
      }
    };

    fetchActiveRoute();
  }, [isDeliveryUser, isOnline, userToken]);

  // Handle trip completion to resume polling
  useEffect(() => {
    if (activeTrip?.status === 'completed') {
      console.log("🏁 Trip completed, will clear after delay to show completion state");
      // The actual clearing is handled in handleTripUpdate with a 2-second delay
    } else if (activeTrip?.status === 'cancelled') {
      console.log("❌ Trip cancelled, clearing immediately");
      setActiveTrip(null);
      setCompletedTrip(null);
    }
    
    // Clear completed trip display after some time
    if (completedTrip && !activeTrip) {
      console.log("🧹 Clearing completed trip display");
      const timer = setTimeout(() => {
        setCompletedTrip(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [activeTrip?.status, completedTrip, activeTrip]);

  // Location tracking and online status restoration
  useEffect(() => {
    let watchId;

    const updateLocation = (position) => {
      const { latitude, longitude } = position.coords;
      setMapCenter({ lat: latitude, lng: longitude });
      
      if (isOnline && userToken) {
        updateDriverLocation(userToken, [longitude, latitude])
          .catch(err => console.error("Error updating location:", err));
      }
    };

    const handleLocationError = (error) => {
      console.error("Geolocation error:", error);
    };

    if (navigator.geolocation) {
      // Dynamic geolocation options based on online status
      const geolocationOptions = {
        enableHighAccuracy: isOnline, // High accuracy only when online
        maximumAge: isOnline ? 10000 : 60000, // Cache location longer when offline (1 min vs 10 sec)
        timeout: isOnline ? 5000 : 15000, // Longer timeout when offline to allow for lower accuracy
      };

      console.log(`📍 Setting up geolocation with accuracy: ${isOnline ? 'HIGH' : 'LOW'}`, geolocationOptions);

      watchId = navigator.geolocation.watchPosition(
        updateLocation,
        handleLocationError,
        geolocationOptions
      );
    }

    // Restore online status from localStorage
    const savedOnlineStatus = localStorage.getItem('vaye_driver_online');
    if (savedOnlineStatus === 'true') {
      setIsOnline(true);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isOnline, userToken]);

  // Save online status changes
  useEffect(() => {
    localStorage.setItem('vaye_driver_online', isOnline.toString());
  }, [isOnline]);

  // Request notification permissions
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        setNotificationsEnabled(permission === 'granted');
      });
    } else if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  // Handle ride request actions
  const handleAcceptRequest = async () => {
    if (!currentRequest) return;

    try {
      const response = await acceptRideRequest(currentRequest._id, userToken);
      
      setRideRequests([]);
      setShowRequest(false);
      
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }

      if (response && response.ride) {
        setActiveTrip(response.ride);
      }

      // Show notification
      if (notificationsEnabled) {
        NotificationService.showNotification(
          "Ride Accepted",
          "You have successfully accepted the ride request",
          "success"
        );
      }
    } catch (err) {
      console.error("Error accepting request:", err);
      setRideRequests([]);
      setShowRequest(false);
    }
  };

  const handleDeclineRequest = () => {
    if (currentRequest) {
      setDeclinedRequestIds((prev) => [...prev, currentRequest._id]);
    }
    
    setRideRequests([]);
    setShowRequest(false);
  };

  // Handle trip actions
  const handleTripAction = async (action) => {
    if (!activeTrip) return;

    try {
      // Handle different trip actions
      switch (action) {
        case 'navigate':
          // Open navigation to pickup/dropoff
          const destination = activeTrip.status === 'accepted' || activeTrip.status === 'arrived' 
            ? activeTrip.pickup.address 
            : activeTrip.dropoff.address;
          
          const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
          window.open(url, '_blank');
          break;
          
        case 'arrived':
        case 'start':
        case 'complete':
          // These will be handled by DashboardMap component
          // You can emit events or use a callback
          console.log(`Trip action: ${action}`);
          break;
          
        default:
          console.log(`Unknown action: ${action}`);
      }
    } catch (err) {
      console.error(`Error handling trip action ${action}:`, err);
    }
  };

  // Handle trip completion
  const handleTripClose = () => {
    console.log("🎯 Trip manually closed, clearing all trip state");
    setCompletedTrip(null);
    setActiveTrip(null);
    
    // Force immediate polling check if online
    if (isOnline && !isDeliveryUser) {
      console.log("🔄 Triggering immediate poll after trip close");
      setTimeout(() => {
        // Small delay to ensure state updates are processed
        // Polling effect will restart automatically
      }, 100);
    }
  };

  const handleRatingSubmit = () => {
    // Handle rating submission
    console.log("🌟 Rating submitted, clearing all trip state");
    setCompletedTrip(null);
    setActiveTrip(null);
    
    // Force immediate polling check if online
    if (isOnline && !isDeliveryUser) {
      console.log("🔄 Triggering immediate poll after rating submit");
      setTimeout(() => {
        // Small delay to ensure state updates are processed
        // Polling effect will restart automatically
      }, 100);
    }
  };

  // Online status toggle
 const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    
    // Update state immediately to stop polling
    setIsOnline(newStatus);
    // handleStatusChange(newStatus);

    // Save to localStorage
    localStorage.setItem("vaye_driver_online", newStatus.toString());

    // Update driver availability on backend
    try {
      const response = await setDriverAvailability(userToken, newStatus);
      // If backend returns the user object, sync isOnline with isAvailable
      if (response && response.user && response.user.driverDetails) {
        setIsOnline(response.user.driverDetails.isAvailable);
      }
      // Note: If backend response doesn't have the expected structure, 
      // we keep the newStatus we already set
    } catch (err) {
      // On error, revert the UI state
      console.error("Failed to update availability:", err);
      setIsOnline(!newStatus); // revert on error
      localStorage.setItem("vaye_driver_online", (!newStatus).toString());
    }

    if (newStatus && !notificationsEnabled) {
      NotificationService.requestPermissions().then((granted) =>
        setNotificationsEnabled(granted)
      );
    }
  };

  // Tab change handler
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Delivery handlers (keeping existing functionality)
  const currentDeliveryRequest = deliveryRequests.length > 0 ? deliveryRequests[0] : null;

  const handleAcceptDeliveryRequest = async () => {
    try {
      const response = await acceptDeliveryJob(currentDeliveryRequest._id, userToken);
      
      setDeliveryRequests([]);
      setShowDeliveryRequest(false);
      
      if (response && response.route) {
        setActiveDeliveryRoute(response.route);
      } else if (response && response.ride) {
        setActiveDeliveryRoute({
          deliveries: [response.ride],
          totalDeliveries: 1,
          completedDeliveries: 0,
          estimatedTotalDistance: response.ride.estimatedTotalDistance || 'N/A',
          estimatedTotalDuration: response.ride.estimatedTotalDuration || 'N/A'
        });
      }
    } catch (err) {
      console.error("Error accepting delivery request:", err);
      setDeliveryRequests([]);
      setShowDeliveryRequest(false);
    }
  };
  
  const handleDeclineDeliveryRequest = () => {
    if (currentDeliveryRequest) {
      setDeclinedDeliveryIds((prev) => [...prev, currentDeliveryRequest._id]);
    }
    
    setDeliveryRequests([]);
    setShowDeliveryRequest(false);
  };

  const handleDeliveryStatusUpdate = async (deliveryId, status, pin = null) => {
    try {
      const response = await updateDeliveryStatus(deliveryId, status, pin, userToken);
      
      if (response && response.route) {
        setActiveDeliveryRoute(response.route);
      }
      
      if (response && response.routeCompleted) {
        setActiveDeliveryRoute(null);
      }
    } catch (err) {
      console.error("Error updating delivery status:", err);
    }
  };

  return (
    <div className="enhanced-app-layout">
      {/* Map View - Always Visible */}
      <div className="enhanced-map-container">
        <DashboardMap
          center={mapCenter}
          markers={mapMarkers}
          userToken={userToken}
          activeTrip={activeTrip}
          onTripUpdate={handleTripUpdate}
          onTripStatusChange={handleTripStatusChange}
        />
        
        {/* Online Status Toggle - Floating - Hidden when there's an active trip */}
        {!activeTrip && (
          <div className="online-status-toggle">
            <button 
              className={`status-button ${isOnline ? 'online' : 'offline'}`}
              onClick={toggleOnlineStatus}
            >
              <div className="status-indicator">
                <div className={`status-dot ${isOnline ? 'active' : ''}`}></div>
              </div>
              <span className="status-text">
                {isOnline ? 'Online' : 'Go Online'}
              </span>
            </button>
          </div>
        )}

        {/* Enhanced Earnings Display - Hidden when there's an active trip */}
        {!activeTrip && (
          <div className="floating-earnings">
            <div className="earnings-card">
              <DollarSign size={16} />
              <span>R{todayStats.earnings.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Components (keeping existing functionality) */}
      {isDeliveryUser && showDeliveryRequest && currentDeliveryRequest && (
        <DeliveryRequest
          request={currentDeliveryRequest}
          onAccept={handleAcceptDeliveryRequest}
          onDecline={handleDeclineDeliveryRequest}
          timeRemaining={deliveryTimer}
        />
      )}

      {isDeliveryUser && activeDeliveryRoute && (
        <DeliveryRoute
          route={activeDeliveryRoute}
          onStatusUpdate={handleDeliveryStatusUpdate}
        />
      )}

      {isDeliveryUser && isOnline && !activeDeliveryRoute && !showDeliveryRequest && (
        <DeliveryJobList
          userToken={userToken}
          userLocation={mapCenter}
          onJobAccepted={(delivery) => {
            if (delivery) {
              setTimeout(() => {
                // Refresh active delivery route
              }, 1000);
            }
          }}
        />
      )}

      {/* Main Ride Drawer - Only for ride drivers */}
      {!isDeliveryUser && (
        <RideDrawer
          drawerState={drawerState}
          isOnline={isOnline}
          rideRequest={currentRequest}
          requestTimer={requestTimer}
          onAcceptRequest={handleAcceptRequest}
          onDeclineRequest={handleDeclineRequest}
          activeTrip={activeTrip}
          currentTripStatus={currentTripStatus}
          onTripAction={handleTripAction}
          completedTrip={completedTrip}
          onRatingSubmit={handleRatingSubmit}
          onTripClose={handleTripClose}
          todayStats={todayStats}
          initialHeight="compact"
          allowManualToggle={true}
        />
      )}

      {/* Map Report Drawer */}
      {showMapReport && (
        <div className="map-report-overlay" onClick={() => setShowMapReport(false)}>
          <div className="map-report-drawer" onClick={(e) => e.stopPropagation()}>
            <h3 className="drawer-title">Add a map report</h3>
            <div className="report-options">
              <button className="report-option">
                <AlertTriangle size={24} color="#ff6b47" />
                <span>Traffic</span>
              </button>
              <button className="report-option">
                <AlertOctagon size={24} color="#e74c3c" />
                <span>Accident</span>
              </button>
              <button className="report-option">
                <Ban size={24} color="#95a5a6" />
                <span>Road Closure</span>
              </button>
              <button className="report-option">
                <Navigation2 size={24} color="#3498db" />
                <span>Speed Trap</span>
              </button>
              <button className="report-option">
                <RotateCcw size={24} color="#f39c12" />
                <span>Wrong Direction</span>
              </button>
            </div>
            <div className="contributions-section">
              <button className="contributions-button">
                <History size={20} color="#04050aff" />
                <span>My Contributions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Dock */}
      <BottomDock
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOnline={isOnline}
      />
    </div>
  );
}

export default EnhancedDriverDashboard;
