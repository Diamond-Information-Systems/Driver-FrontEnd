import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import DeliveryDrawer from "../../components/DeliveryDrawer/DeliveryDrawer";
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
  acceptDeliveryJob,
  confirmDelivery
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
  const [completedTrip, setCompletedTrip] = useState(null);
  const [currentTripStatus, setCurrentTripStatus] = useState(null); // Track trip status from map
  
  // Use refs to store timer IDs - prevents stale closures
  const pollingIntervalRef = useRef(null);
  const requestTimerRef = useRef(null);
  
  // Delivery timer refs
  const deliveryPollingIntervalRef = useRef(null);
  const deliveryRequestTimerRef = useRef(null);

  // Centralized timer cleanup function
  const clearAllTimers = useCallback(() => {
    console.log("🧹 Clearing all timers");
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (requestTimerRef.current) {
      clearInterval(requestTimerRef.current);
      requestTimerRef.current = null;
    }
    if (deliveryPollingIntervalRef.current) {
      clearInterval(deliveryPollingIntervalRef.current);
      deliveryPollingIntervalRef.current = null;
    }
    if (deliveryRequestTimerRef.current) {
      clearInterval(deliveryRequestTimerRef.current);
      deliveryRequestTimerRef.current = null;
    }
  }, []);

  // Clear timers on component unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

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
      rideRequestsLength: rideRequests.length,
      isOnline
    });
    
    if (completedTrip) return 'TRIP_COMPLETED';
    if (activeTrip) return 'TRIP_ACTIVE';
    if (showRequest && rideRequests.length > 0) return 'REQUEST_PENDING';
    if (isOnline) return 'IDLE'; // Show IDLE state when online and no active states
    return 'IDLE';
  }, [completedTrip, activeTrip, showRequest, rideRequests, isOnline]);

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
      // If trip is completed, show completion state briefly then clear activeTrip
      if (updatedTrip.status === 'completed') {
        setCompletedTrip(updatedTrip);
        // Clear activeTrip immediately to allow polling to resume
        setActiveTrip(null);
        console.log("🏁 Trip completed, showing completion state and resuming polling eligibility");
      } else if (updatedTrip.status === 'cancelled') {
        console.log("❌ Trip cancelled, clearing immediately");
        setActiveTrip(null);
        setCompletedTrip(null);
        setCurrentTripStatus(null);
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

  // Helper function to check if driver should accept new requests
  const shouldAcceptNewRequests = useCallback(() => {
    // Check if driver is online and not in an active trip
    const hasActiveTrip = activeTrip && (
      activeTrip.status === 'accepted' ||
      activeTrip.status === 'inProgress' ||
      activeTrip.status === 'arrived' ||
      activeTrip.status === 'pickedUp' ||
      activeTrip.status === 'started' || // For deliveries
      currentTripStatus === 'accepted' ||
      currentTripStatus === 'inProgress' ||
      currentTripStatus === 'arrived' ||
      currentTripStatus === 'pickedUp' ||
      currentTripStatus === 'started' // For deliveries
    );

    // For delivery users, they shouldn't accept new requests if they have an active delivery
    if (isDeliveryUser) {
      const shouldAccept = isOnline && !hasActiveTrip && !showDeliveryRequest;
      console.log("🚚 shouldAcceptNewRequests check (delivery user):", {
        isOnline,
        hasActiveTrip,
        activeTrip: activeTrip?.status,
        currentTripStatus,
        showDeliveryRequest,
        isDeliveryUser,
        result: shouldAccept
      });
      return shouldAccept;
    }

    // For ride drivers, they shouldn't accept new requests if they have an active trip
    const shouldAccept = isOnline && !hasActiveTrip && !showRequest && !isDeliveryUser;
    
    console.log("🚗 shouldAcceptNewRequests check (ride driver):", {
      isOnline,
      hasActiveTrip,
      activeTrip: activeTrip?.status,
      currentTripStatus,
      showRequest,
      isDeliveryUser,
      result: shouldAccept
    });
    
    return shouldAccept;
  }, [isOnline, activeTrip, currentTripStatus, showRequest, showDeliveryRequest, isDeliveryUser]);

  // Create refs to store current state values - prevents stale closures
  const currentStateRef = useRef({
    isOnline: false,
    activeTrip: null,
    currentTripStatus: null,
    showRequest: false,
    isDeliveryUser: false,
    userToken: null,
    declinedRequestIds: []
  });

  // Delivery state ref for delivery polling
  const currentDeliveryStateRef = useRef({
    isOnline: false,
    activeTrip: null,
    showDeliveryRequest: false,
    isDeliveryUser: false,
    userToken: null,
    declinedDeliveryIds: []
  });

  // Update state ref whenever dependencies change
  useEffect(() => {
    currentStateRef.current = {
      isOnline,
      activeTrip,
      currentTripStatus,
      showRequest,
      isDeliveryUser,
      userToken,
      declinedRequestIds
    };
  }, [isOnline, activeTrip, currentTripStatus, showRequest, isDeliveryUser, userToken, declinedRequestIds]);

  // Update delivery state ref whenever dependencies change
  useEffect(() => {
    currentDeliveryStateRef.current = {
      isOnline,
      activeTrip,
      showDeliveryRequest,
      isDeliveryUser,
      userToken,
      declinedDeliveryIds
    };
  }, [isOnline, activeTrip, showDeliveryRequest, isDeliveryUser, userToken, declinedDeliveryIds]); 

  // Enhanced ride request polling with ref-based state management
  useEffect(() => {
    console.log("🚗 Ride polling effect triggered:", { 
      isDeliveryUser, 
      isOnline, 
      activeTrip: !!activeTrip, 
      showRequest,
      userToken: !!userToken,
      userRole: user?.user?.role,
      userType: user?.userType
    });
    
    if (isDeliveryUser) {
      console.log("🚗 Skipping ride polling - user is delivery driver");
      clearAllTimers();
      return;
    }

    const pollForRequests = async () => {
      const currentState = currentStateRef.current;
      
      // Check if driver should accept new requests using ref values to avoid stale closures
      const hasActiveTrip = currentState.activeTrip && (
        currentState.activeTrip.status === 'accepted' ||
        currentState.activeTrip.status === 'inProgress' ||
        currentState.activeTrip.status === 'arrived' ||
        currentState.activeTrip.status === 'pickedUp' ||
        currentState.activeTrip.status === 'started' ||
        currentState.currentTripStatus === 'accepted' ||
        currentState.currentTripStatus === 'inProgress' ||
        currentState.currentTripStatus === 'arrived' ||
        currentState.currentTripStatus === 'pickedUp' ||
        currentState.currentTripStatus === 'started'
      );
      
      const shouldAccept = currentState.isOnline && !hasActiveTrip && !currentState.showRequest && !currentState.isDeliveryUser;
      
      // Check current conditions using ref to avoid stale closures
      if (!shouldAccept) {
        console.log("🚗 Skipping ride polling - conditions not met:", {
          isOnline: currentState.isOnline,
          hasActiveTrip,
          showRequest: currentState.showRequest,
          isDeliveryUser: currentState.isDeliveryUser
        });
        return;
      }

      try {
        console.log("🔍 Making API call for nearby requests with token:", !!currentState.userToken);
        console.log("🔍 API endpoint: getNearbyRequests");
        
        if (!currentState.userToken) {
          console.log("🚗 No user token available, skipping API call");
          return;
        }
        
        const requests = await getNearbyRequests(currentState.userToken);
        console.log("🔍 API response received:", { 
          requestsLength: requests?.length || 0,
          requests: requests 
        });
        
        if (requests && requests.length > 0) {
          const filteredRequests = requests.filter(
            (r) => !currentState.declinedRequestIds.includes(r._id)
          );
          
          if (filteredRequests.length > 0) {
            console.log("🔍 Filtered requests:", filteredRequests);
            
            const processedRequests = filteredRequests.map(request => {
              if (request.passengers && Array.isArray(request.passengers)) {
                return request;
              } else {
                return mapApiRideToRequest(request);
              }
            });
            
            console.log("🎯 Final processed requests:", processedRequests);
            
            // Stop polling and show request
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            
            setRideRequests(processedRequests);
            setShowRequest(true);
            setRequestTimer(20);
            
            // Start request countdown timer
            requestTimerRef.current = setInterval(() => {
              setRequestTimer((prev) => {
                if (prev <= 1) {
                  setShowRequest(false);
                  setRideRequests([]);
                  if (requestTimerRef.current) {
                    clearInterval(requestTimerRef.current);
                    requestTimerRef.current = null;
                  }
                  return 20;
                }
                return prev - 1;
              });
            }, 1000);
          }
        } else {
          console.log("🔍 No ride requests found or requests array is empty");
        }
      } catch (err) {
        console.error("Error polling for requests:", err);
        console.error("Error details:", err.message, err.stack);
      }
    };

    // Calculate if should accept requests for ride drivers
    const hasActiveTrip = activeTrip && (
      activeTrip.status === 'accepted' ||
      activeTrip.status === 'inProgress' ||
      activeTrip.status === 'arrived' ||
      activeTrip.status === 'pickedUp' ||
      activeTrip.status === 'started' ||
      currentTripStatus === 'accepted' ||
      currentTripStatus === 'inProgress' ||
      currentTripStatus === 'arrived' ||
      currentTripStatus === 'pickedUp' ||
      currentTripStatus === 'started'
    );
    
    const shouldStartPolling = isOnline && !hasActiveTrip && !showRequest && !isDeliveryUser;

    console.log("🚗 Ride polling decision:", {
      isOnline,
      hasActiveTrip,
      showRequest,
      isDeliveryUser,
      shouldStartPolling,
      userToken: !!userToken
    });

    // Start or stop polling based on conditions
    if (shouldStartPolling) {
      console.log("✅ Starting ride request polling for NON-DELIVERY driver");
      
      // Clear any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      // Start new polling interval immediately and then set up regular interval
      console.log("🚗 Making immediate test API call...");
      pollForRequests();
      
      pollingIntervalRef.current = setInterval(pollForRequests, 4000);
      
    } else {
      console.log("❌ Stopping ride request polling:", {
        isOnline,
        hasActiveTrip,
        showRequest,
        isDeliveryUser,
        shouldStartPolling
      });
      
      // Clear polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      // Clear request state when not meeting conditions
      if (!isOnline || isDeliveryUser) {
        setShowRequest(false);
        setRideRequests([]);
        setRequestTimer(20);
      }
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isOnline, activeTrip, currentTripStatus, showRequest, isDeliveryUser, userToken]);
  

//     // Start polling if online, no active trip, and no current request
//     if (isOnline && shouldAcceptNewRequests() && !showRequest) {
//       console.log("✅ Starting ride request polling - conditions met:", {
//         isOnline,
//         hasActiveTrip: !!activeTrip,
//         activeTripStatus: activeTrip?.status,
//         currentTripStatus,
//         shouldAcceptNewRequests: shouldAcceptNewRequests(),
//         showRequest,
//         isDeliveryUser
//       });
      
//       if (pollingInterval) clearInterval(pollingInterval);
//       if (timerId) clearInterval(timerId);
      
//       intervalId = setInterval(pollRequests, 4000);
//       setPollingInterval(intervalId);
//     } else {
//       console.log("❌ Stopping ride request polling - conditions not met:", {
//         isOnline,
//         hasActiveTrip: !!activeTrip,
//         activeTripStatus: activeTrip?.status,
//         currentTripStatus,
//         shouldAcceptNewRequests: shouldAcceptNewRequests(),
//         showRequest,
//         isDeliveryUser,
//         reasons: {
//           notOnline: !isOnline,
//           hasActiveTrip: !!activeTrip,
//           shouldNotAcceptNewRequests: !shouldAcceptNewRequests(),
//           showingRequest: showRequest,
//           isDeliveryUser
//         }
//       });
      
//       if (pollingInterval) {
//         clearInterval(pollingInterval);
//         setPollingInterval(null);
//       }
//       if (timerId) clearInterval(timerId);
//       if (requestTimerId) {
//         clearInterval(requestTimerId);
//         setRequestTimerId(null);
//       }
      
//       // Always clear requests and show state when not meeting conditions
//       setShowRequest(false);
//       setRideRequests([]);
//       setRequestTimer(20);
//     }

//     return () => {
//       if (intervalId) clearInterval(intervalId);
//       if (timerId) clearInterval(timerId);
//     };
//   }, [isOnline, activeTrip, activeTrip?.status, currentTripStatus, showRequest, declinedRequestIds, userToken, isDeliveryUser, shouldAcceptNewRequests]);

  // Separate effect to cleanup requestTimerId when it changes
//   useEffect(() => {
//     return () => {
//       if (requestTimerId) {
//         clearInterval(requestTimerId);
//       }
//     };
//   }, [requestTimerId]);

//   // Cleanup all timers on unmount
//   useEffect(() => {
//     // Clear any existing timers immediately when component mounts
//     console.log("🧹 Component mounted - clearing any stale timers");
    
//     return () => {
//       console.log("🧹 Component unmounting - final cleanup");
//       if (pollingInterval) {
//         clearInterval(pollingInterval);
//         console.log("🧹 Cleared pollingInterval on unmount");
//       }
//       if (requestTimerId) {
//         clearInterval(requestTimerId);
//         console.log("🧹 Cleared requestTimerId on unmount");
//       }
//     };
//   }, []);

  // Clear all timers when going offline
  useEffect(() => {
    if (!isOnline) {
      console.log("🧹 Going offline - clearing all timers");
      clearAllTimers();
      setShowRequest(false);
      setRideRequests([]);
      setRequestTimer(20);
      // Clear delivery state as well
      setShowDeliveryRequest(false);
      setDeliveryRequests([]);
      setDeliveryTimer(20);
    }
  }, [isOnline, clearAllTimers]);

  // Enhanced delivery polling with ref-based state management
  useEffect(() => {
    if (!isDeliveryUser) {
      clearAllTimers();
      return;
    }

    const pollForDeliveries = async () => {
      const currentState = currentDeliveryStateRef.current;
      
      // Check current conditions using ref to avoid stale closures
      if (!currentState.isOnline || currentState.activeTrip || currentState.showDeliveryRequest) {
        return;
      }

      try {
        console.log("🚚 Making API call for nearby deliveries");
        const deliveries = await getNearbyDeliveries(currentState.userToken);
        
        if (deliveries && deliveries.length > 0) {
          // Filter out declined deliveries
          const filteredDeliveries = deliveries.filter(
            (d) => !currentState.declinedDeliveryIds.includes(d._id)
          );
          
          if (filteredDeliveries.length > 0) {
            console.log("🚚 Found delivery requests:", filteredDeliveries.length);
            setDeliveryRequests(filteredDeliveries);
            setShowDeliveryRequest(true);
            setDeliveryTimer(20);
            
            // Stop polling immediately when delivery is found
            if (deliveryPollingIntervalRef.current) {
              clearInterval(deliveryPollingIntervalRef.current);
              deliveryPollingIntervalRef.current = null;
            }

            // Start countdown timer for delivery request
            deliveryRequestTimerRef.current = setInterval(() => {
              setDeliveryTimer((prev) => {
                if (prev <= 1) {
                  // Countdown finished - decline the delivery automatically
                  setShowDeliveryRequest(false);
                  setDeliveryRequests([]);
                  
                  if (deliveryRequestTimerRef.current) {
                    clearInterval(deliveryRequestTimerRef.current);
                    deliveryRequestTimerRef.current = null;
                  }
                  
                  // Only resume polling if still online and no active trip
                  const currentStateNow = currentDeliveryStateRef.current;
                  if (currentStateNow.isOnline && !currentStateNow.activeTrip) {
                    deliveryPollingIntervalRef.current = setInterval(pollForDeliveries, 4000);
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

    // Start or stop polling based on conditions
    if (isOnline && !activeTrip && !showDeliveryRequest) {
      console.log("✅ Starting delivery request polling");
      
      // Clear any existing polling
      if (deliveryPollingIntervalRef.current) {
        clearInterval(deliveryPollingIntervalRef.current);
      }
      
      // Start new polling interval
      deliveryPollingIntervalRef.current = setInterval(pollForDeliveries, 4000);
      
    } else {
      console.log("❌ Stopping delivery request polling:", {
        isOnline,
        activeTrip: !!activeTrip,
        showDeliveryRequest,
        isDeliveryUser
      });
      
      // Clear polling
      if (deliveryPollingIntervalRef.current) {
        clearInterval(deliveryPollingIntervalRef.current);
        deliveryPollingIntervalRef.current = null;
      }
      
      // Clear request state when not meeting conditions
      if (!isOnline || activeTrip) {
        setShowDeliveryRequest(false);
        setDeliveryRequests([]);
        setDeliveryTimer(20);
      }
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (deliveryPollingIntervalRef.current) {
        clearInterval(deliveryPollingIntervalRef.current);
        deliveryPollingIntervalRef.current = null;
      }
      if (deliveryRequestTimerRef.current) {
        clearInterval(deliveryRequestTimerRef.current);
        deliveryRequestTimerRef.current = null;
      }
    };
  }, [isDeliveryUser, isOnline, activeTrip, showDeliveryRequest, userToken, declinedDeliveryIds]);

  // Debug logging for active delivery route changes
  useEffect(() => {
    console.log("🚚 Active delivery route state changed:", {
      hasRoute: !!activeDeliveryRoute,
      totalDeliveries: activeDeliveryRoute?.totalDeliveries,
      activeDeliveries: activeDeliveryRoute?.activeDeliveries?.length,
      activeDeliveryRoute
    });

    // Convert delivery to trip format when delivery route is set
    if (isDeliveryUser && activeDeliveryRoute && activeDeliveryRoute.activeDeliveries?.length > 0) {
      const currentDelivery = activeDeliveryRoute.activeDeliveries[0]; // Get first active delivery
      console.log("🚚 Converting delivery to trip format:", currentDelivery);
      
      // Group deliveries by pickup location for multiple pickup handling
      const deliveriesByPickup = activeDeliveryRoute.activeDeliveries.reduce((groups, delivery) => {
        const pickupKey = `${delivery.pickup.coordinates[0]},${delivery.pickup.coordinates[1]}`;
        console.log(`🚚 Processing delivery ${delivery.orderId} with pickup key: ${pickupKey}`);
        if (!groups[pickupKey]) {
          groups[pickupKey] = [];
        }
        groups[pickupKey].push(delivery);
        return groups;
      }, {});
      
      console.log("🚚 Deliveries grouped by pickup location:", deliveriesByPickup);
      console.log("🚚 Group keys:", Object.keys(deliveriesByPickup));
      
      // Log each group size
      Object.entries(deliveriesByPickup).forEach(([key, deliveries]) => {
        console.log(`🚚 Pickup location ${key}: ${deliveries.length} deliveries`);
        deliveries.forEach(delivery => {
          console.log(`  - ${delivery.orderId} (${delivery.customer.name})`);
        });
      });
      
      // Convert delivery to trip format to piggyback off existing trip infrastructure
      const currentPickupKey = `${currentDelivery.pickup.coordinates[0]},${currentDelivery.pickup.coordinates[1]}`;
      const pickupDeliveries = deliveriesByPickup[currentPickupKey] || [currentDelivery];
      
      console.log(`🚚 Current delivery pickup key: ${currentPickupKey}`);
      console.log(`🚚 Deliveries for current pickup: ${pickupDeliveries.length}`);
      
      const deliveryAsTrip = {
        _id: currentDelivery.deliveryId,
        orderId: currentDelivery.orderId,
        status: currentDelivery.status,
        isDelivery: true, // Flag to identify this as a delivery
        deliveryPin: currentDelivery.deliveryPin,
        customer: currentDelivery.customer,
        productDetails: currentDelivery.productDetails,
        estimatedCompletion: currentDelivery.estimatedCompletion,
        notes: currentDelivery.notes,
        
        // Enhanced: Add multiple pickups information
        allPickupDeliveries: pickupDeliveries,
        remainingDeliveries: activeDeliveryRoute.activeDeliveries,
        
        // Convert to trip format structure
        rider: {
          _id: currentDelivery.customer.phone, // Use phone as ID fallback
          fullName: currentDelivery.customer.name,
          phoneNumber: currentDelivery.customer.phone
        },
        pickup: {
          address: currentDelivery.pickup.address,
          location: {
            coordinates: [currentDelivery.pickup.coordinates[0], currentDelivery.pickup.coordinates[1]] // [lng, lat]
          }
        },
        dropoff: {
          address: currentDelivery.dropoff.address,
          location: {
            coordinates: [currentDelivery.dropoff.coordinates[0], currentDelivery.dropoff.coordinates[1]] // [lng, lat]
          }
        },
        // Additional delivery-specific fields
        routeOrder: currentDelivery.routeOrder,
        assignmentOrder: currentDelivery.assignmentOrder
      };

      console.log("🚚 Setting delivery as active trip:", deliveryAsTrip);
      setActiveTrip(deliveryAsTrip);
    } else if (isDeliveryUser && !activeDeliveryRoute) {
      // Clear active trip when no delivery route for delivery users
      console.log("🚚 No delivery route, clearing active trip for delivery user");
      setActiveTrip(null);
    }
  }, [activeDeliveryRoute, isDeliveryUser]);

  // Fetch active delivery route
  useEffect(() => {
    if (!isDeliveryUser || !isOnline || !userToken) return;

    const fetchActiveRoute = async () => {
      try {
        console.log("🚚 Fetching active delivery route...");
        const response = await getMyDeliveryRoute(userToken);
        console.log("🚚 Delivery route response:", response);
        
        // Handle the nested response structure
        const route = response?.route || response;
        
        if (route && route.activeDeliveries && route.activeDeliveries.length > 0) {
          console.log("🚚 Setting active delivery route with deliveries:", route.activeDeliveries.length);
          setActiveDeliveryRoute(route);
        } else {
          console.log("🚚 No active deliveries found, clearing route");
          setActiveDeliveryRoute(null);
        }
      } catch (err) {
        console.error("Error fetching active delivery route:", err);
        setActiveDeliveryRoute(null);
      }
    };

    fetchActiveRoute();
    
    // Set up periodic fetching to keep route updated
    const routeUpdateInterval = setInterval(fetchActiveRoute, 10000); // Update every 10 seconds
    
    return () => {
      clearInterval(routeUpdateInterval);
    };
  }, [isDeliveryUser, isOnline, userToken]);

  // Handle trip completion to resume polling
  useEffect(() => {
    // Clear completed trip display after some time
    if (completedTrip && !activeTrip) {
      console.log("🧹 Scheduling completed trip display cleanup");
      const timer = setTimeout(() => {
        console.log("🧹 Clearing completed trip display after 5 seconds");
        setCompletedTrip(null);
      }, 5000); // Show completion for 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [completedTrip, activeTrip]);

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
    const setupNotifications = async () => {
      const granted = await NotificationService.requestPermissions();
      setNotificationsEnabled(granted);
    };
    setupNotifications();
  }, []);

  // Handle ride request actions
  const handleAcceptRequest = async () => {
    if (!currentRequest) return;

    try {
      const response = await acceptRideRequest(currentRequest._id, userToken);
      
      setRideRequests([]);
      setShowRequest(false);
      
      // Clear all timers
      clearAllTimers();

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
    
    // Clear all timers
    clearAllTimers();
    
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
    setCurrentTripStatus(null); // Clear trip status to enable polling
    
    // Force immediate polling check if online
    if (isOnline && !isDeliveryUser) {
      console.log("🔄 Triggering immediate poll after trip close");
      // Polling effect will restart automatically when dependencies change
    }
  };

  const handleRatingSubmit = () => {
    // Handle rating submission
    console.log("🌟 Rating submitted, clearing all trip state");
    setCompletedTrip(null);
    setActiveTrip(null);
    setCurrentTripStatus(null); // Clear trip status to enable polling

    // Force immediate polling check if online
    if (isOnline && !isDeliveryUser) {
      console.log("🔄 Triggering immediate poll after rating submit");
      // Polling effect will restart automatically when dependencies change
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
      
      // Clear all delivery timers
      if (deliveryPollingIntervalRef.current) {
        clearInterval(deliveryPollingIntervalRef.current);
        deliveryPollingIntervalRef.current = null;
      }
      if (deliveryRequestTimerRef.current) {
        clearInterval(deliveryRequestTimerRef.current);
        deliveryRequestTimerRef.current = null;
      }
      
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

      // Show notification
      if (notificationsEnabled) {
        NotificationService.showNotification(
          "Delivery Accepted",
          "You have successfully accepted the delivery job",
          "success"
        );
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
    
    // Clear all delivery timers
    if (deliveryPollingIntervalRef.current) {
      clearInterval(deliveryPollingIntervalRef.current);
      deliveryPollingIntervalRef.current = null;
    }
    if (deliveryRequestTimerRef.current) {
      clearInterval(deliveryRequestTimerRef.current);
      deliveryRequestTimerRef.current = null;
    }
    
    setDeliveryRequests([]);
    setShowDeliveryRequest(false);
  };

  const handleDeliveryAction = async (action, deliveryId) => {
    console.log("🚚 Delivery action requested:", action, deliveryId);
    
    switch (action) {
      case 'start_delivery':
        await handleDeliveryStatusUpdate(deliveryId, 'in_transit');
        break;
      case 'pickup_completed':
        await handleDeliveryStatusUpdate(deliveryId, 'picked_up');
        break;
      case 'delivery_completed':
        // For delivery completion, we might need a PIN
        const pin = prompt("Enter delivery PIN (if required):");
        await handleDeliveryStatusUpdate(deliveryId, 'delivered', pin);
        break;
      case 'mark_completed':
        setCompletedTrip(activeTrip);
        setActiveTrip(null);
        break;
      default:
        console.warn("Unknown delivery action:", action);
    }
  };

  const handleDeliveryStatusUpdate = async (deliveryId, status, pin = null) => {
    try {
      console.log("Updating delivery status:", { deliveryId, status, pin });
      
      const response = await updateDeliveryStatus(deliveryId, status, userToken);
      
      console.log("Delivery status update response:", response);
      
      if (response && response.success) {
        // Update the active trip status to reflect delivery status
        if (activeTrip && activeTrip.isDelivery) {
          const updatedTrip = {
            ...activeTrip,
            status: status
          };
          setActiveTrip(updatedTrip);
          console.log("🚚 Updated delivery trip status to:", status);
        }

        // Check if we have a route in the response
        if (response.route) {
          setActiveDeliveryRoute(response.route);
        }
        
        // Check if the route is completed (multiple ways to determine this)
        if (response.routeCompleted || 
            (response.route && response.route.remainingDeliveries === 0)) {
          console.log("All deliveries completed, clearing active route and trip");
          setActiveDeliveryRoute(null);
          // Clear the active trip since delivery is complete
          if (activeTrip && activeTrip.isDelivery) {
            setActiveTrip(null);
          }
        }
      }
      
    } catch (err) {
      console.error("Error updating delivery status:", err);
    }
  };

  const handleDeliveryConfirmation = async (deliveryId, pin) => {
    try {
      console.log("Confirming delivery with PIN:", { deliveryId, pin });
      
      const response = await confirmDelivery(deliveryId, pin, userToken);
      
      console.log("Delivery confirmation response:", response);
      
      if (response && response.success) {
        // Mark delivery as completed in the active trip
        if (activeTrip && activeTrip.isDelivery) {
          const updatedTrip = {
            ...activeTrip,
            status: 'completed'
          };
          setActiveTrip(updatedTrip);
          console.log("🚚 Marked delivery trip as completed");
        }

        // Check if we have an updated route in the response
        if (response.route) {
          setActiveDeliveryRoute(response.route);
        }
        
        // Check if the route is completed (multiple ways to determine this)
        if (response.routeCompleted || 
            (response.route && response.route.remainingDeliveries === 0)) {
          console.log("All deliveries completed, clearing active route and trip");
          setActiveDeliveryRoute(null);
          // Clear the active trip since all deliveries are complete
          if (activeTrip && activeTrip.isDelivery) {
            setActiveTrip(null);
          }
        }
      }
      
    } catch (err) {
      console.error("Error confirming delivery:", err);
      // You might want to show an error message to the user here
      throw err; // Re-throw so the component can handle the error
    }
  };

  // Batch job acceptance handler
  const handleJobBatchAccepted = async (acceptedJobs, route) => {
    try {
      console.log("Batch jobs accepted:", acceptedJobs, route);
      
      // Update active delivery route if provided
      if (route) {
        setActiveDeliveryRoute(route);
      }
      
    } catch (error) {
      console.error("Error handling batch job acceptance:", error);
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
          isDeliveryUser={isDeliveryUser}
          // Pass delivery handlers for when activeTrip is a delivery
          onDeliveryStatusUpdate={handleDeliveryStatusUpdate}
          onDeliveryConfirmation={handleDeliveryConfirmation}
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

      {/* Remove the immediate DeliveryRoute popup - delivery flow now handled in DashboardMap */}

      {isDeliveryUser && isOnline && !activeDeliveryRoute && !showDeliveryRequest && (
        <DeliveryJobList
          userToken={userToken}
          userLocation={mapCenter}
          onJobAccepted={(delivery) => {
            if (delivery) {
              // Handle both single job and batch job acceptance
              if (delivery.jobs) {
                // Batch acceptance
                handleJobBatchAccepted(delivery.jobs, delivery.route);
              } else {
                // Single job acceptance - trigger refresh of active delivery route
                setTimeout(async () => {
                  try {
                    const response = await getMyDeliveryRoute(userToken);
                    const route = response?.route || response;
                    if (route && route.activeDeliveries && route.activeDeliveries.length > 0) {
                      setActiveDeliveryRoute(route);
                    }
                  } catch (err) {
                    console.error("Error fetching active delivery route after job acceptance:", err);
                  }
                }, 1000);
              }
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

      {/* Main Delivery Drawer - Only for delivery drivers */}
      {isDeliveryUser && (
        <DeliveryDrawer
          isOnline={isOnline}
          deliveryRequest={currentDeliveryRequest}
          requestTimer={deliveryTimer}
          onAcceptRequest={handleAcceptDeliveryRequest}
          onDeclineRequest={handleDeclineDeliveryRequest}
          activeDelivery={activeTrip}
          onDeliveryAction={handleDeliveryAction}
          completedDelivery={completedTrip}
          onDeliveryClose={handleTripClose}
          todayStats={todayStats}
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
