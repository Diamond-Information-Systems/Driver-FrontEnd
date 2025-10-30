import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  memo,
} from "react";
import {
  GoogleMap,
  useLoadScript,
  DirectionsRenderer,
} from "@react-google-maps/api";
import "./DashboardMap.css";
import config from "../config";
import {
  updateDriverLocation,
  updateRideStatus,
  submitPassengerRating,
  completeRide,
  cancelRide,
} from "../services/requestService";
import {
  updateDeliveryStatus,
  confirmDelivery,
  updateMultipleDeliveryStatuses,
} from "../services/deliveryService";
import TripSummary from "./TripSummary";

const LIBRARIES = ["marker"];
const DEFAULT_CENTER = { lat: -25.7479, lng: 28.2293 };
const LOCATION_UPDATE_THRESHOLD = 5; // meters
const ARRIVAL_THRESHOLD = 30; // meters
const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 5000,
};

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
  position: "absolute",
  top: 0,
  left: 0,
  zIndex: 1,
};

const DashboardMap = ({
  center = DEFAULT_CENTER,
  markers,
  userToken,
  activeTrip,
  onTripUpdate,
  onTripStatusChange, // New prop to expose current trip status
  isDeliveryUser, // Add back for conditional UI
  isOnline, // Online status for animations
  onDeliveryStatusUpdate, // For delivery status updates
  onDeliveryConfirmation, // For delivery confirmations
  onBuyerNotification, // For buyer-only notifications (non-intrusive)
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.GoogleMapsApiKey,
    libraries: LIBRARIES,
  });

  // State management
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [currentTripStatus, setCurrentTripStatus] = useState(null); // Local status tracking

  // Delivery-specific state
  const [deliveryDirections, setDeliveryDirections] = useState(null);
  const [currentDelivery, setCurrentDelivery] = useState(null); // Current active delivery
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [showDeliveryActionPopup, setShowDeliveryActionPopup] = useState(false);
  const [deliveryActionType, setDeliveryActionType] = useState(null); // 'start', 'pickup', 'delivery'
  const [isDeliveryCompletionInProgress, setIsDeliveryCompletionInProgress] = useState(false); // Track completion flow

  // New state for ride completion logic
  const [showStartRidePopup, setShowStartRidePopup] = useState(false);
  const [showCompleteRidePopup, setShowCompleteRidePopup] = useState(false);
  const [showCancelRidePopup, setShowCancelRidePopup] = useState(false);
  
  // Delivery-specific popup states (mirroring ride logic)
  const [showPickupDeliveryPopup, setShowPickupDeliveryPopup] = useState(false);
  const [showCompleteDeliveryPopup, setShowCompleteDeliveryPopup] = useState(false);
  
  // Popup protection state - prevents popups from closing due to external state changes
  const [isPopupInteractionActive, setIsPopupInteractionActive] = useState(false);
  
  const [isUpdatingRideStatus, setIsUpdatingRideStatus] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false); // Track simulation mode
  const [showTripSummary, setShowTripSummary] = useState(false); // Trip summary modal
  const [completedTrip, setCompletedTrip] = useState(null); // Store completed trip data
  const [navigationInstructions, setNavigationInstructions] = useState([]); // Turn-by-turn instructions

  // Refs for cleanup and tracking
  const markerRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastSentCoords = useRef(null);
  const directionsServiceRef = useRef(null);
  const isUpdatingLocationRef = useRef(false);
  const hasShownStartPopup = useRef(false);
  const hasShownCompletePopup = useRef(false);
  
  // Delivery-specific refs (mirroring ride logic)
  const hasShownPickupDeliveryPopup = useRef(false);
  const hasShownCompleteDeliveryPopup = useRef(false);
  
  const previousTripStatus = useRef(null); // Track previous status for navigation
  const previousActiveTrip = useRef(null);
  const lastBoundsFitTime = useRef(0); // Track last bounds fitting to prevent excessive calls

  // Helper function to detect if current trip is a delivery
  const isCurrentTripDelivery = useMemo(() => {
    return activeTrip && (
      activeTrip.type === 'delivery' || 
      activeTrip.deliveryId || 
      activeTrip.isDelivery ||
      activeTrip.orderId // Deliveries typically have orderIds
    );
  }, [activeTrip]);

  // Memoized pickup and dropoff coordinates to prevent recalculations
  const pickupCoords = useMemo(() => {
    if (!activeTrip?.pickup?.location?.coordinates) return null;
    const [lng, lat] = activeTrip.pickup.location.coordinates;
    return { lat, lng };
  }, [activeTrip?.pickup?.location?.coordinates]);

  const dropoffCoords = useMemo(() => {
    if (!activeTrip?.dropoff?.location?.coordinates) return null;
    const [lng, lat] = activeTrip.dropoff.location.coordinates;
    return { lat, lng };
  }, [activeTrip?.dropoff?.location?.coordinates]);

  // Stable activeTrip ID to prevent unnecessary effects
  const activeTripId = useMemo(() => activeTrip?._id, [activeTrip?._id]);

  // Stable current destination for directions calculation
  const currentDestination = useMemo(() => {
    if (!activeTrip || !currentTripStatus) return null;
    
    if (currentTripStatus === "accepted" || currentTripStatus === "arrived") {
      return pickupCoords;
    } else if (currentTripStatus === "started" || currentTripStatus === "in_progress") {
      return dropoffCoords;
    }
    return null;
  }, [activeTrip, currentTripStatus, pickupCoords, dropoffCoords]);

  // Delivery coordinates extraction
  const deliveryPickupCoords = useMemo(() => {
    if (!currentDelivery?.pickup?.coordinates) return null;
    const [lng, lat] = currentDelivery.pickup.coordinates;
    return { lat, lng };
  }, [currentDelivery?.pickup?.coordinates]);

  const deliveryDropoffCoords = useMemo(() => {
    if (!currentDelivery?.dropoff?.coordinates) return null;
    const [lng, lat] = currentDelivery.dropoff.coordinates;
    return { lat, lng };
  }, [currentDelivery?.dropoff?.coordinates]);

  // Current delivery destination based on status
  const currentDeliveryDestination = useMemo(() => {
    if (!currentDelivery || !deliveryStatus) return null;
    
    if (deliveryStatus === "accepted" || deliveryStatus === "started") {
      return deliveryPickupCoords;
    } else if (deliveryStatus === "picked_up" || deliveryStatus === "in_progress") {
      return deliveryDropoffCoords;
    }
    return null;
  }, [currentDelivery, deliveryStatus, deliveryPickupCoords, deliveryDropoffCoords]);

  // Stable map center - prevents continuous panning during active trips
  const mapCenter = useMemo(() => {
    // During active trips, use a completely stable center - NEVER update with user location
    // This prevents the continuous panning issue on mobile
    if (activeTrip) {
      // Use pickup location as stable reference, fallback to provided center
      // This stays constant throughout the trip, letting bounds fitting handle the view
      return pickupCoords || center;
    }
    
    // When no active trip, center on user location for normal navigation
    return userLocation || center;
  }, [activeTrip, pickupCoords, center, ...(activeTrip ? [] : [userLocation])]);

  // Performance monitoring: Log when component re-renders
  useEffect(() => {
    console.log("🎯 DashboardMap re-rendered with:", {
      hasActiveTrip: !!activeTrip,
      activeTripId,
      currentTripStatus,
      hasUserLocation: !!userLocation,
      hasMap: !!map,
      isLoaded,
      timestamp: new Date().toISOString()
    });
  });

  // Popup state debugging - track all popup state changes
  useEffect(() => {
    console.log("🔔 Popup State Debug:", {
      showPickupDeliveryPopup,
      showCompleteDeliveryPopup,
      showDeliveryActionPopup,
      isPopupInteractionActive,
      hasShownPickupDeliveryPopup: hasShownPickupDeliveryPopup.current,
      hasShownCompleteDeliveryPopup: hasShownCompleteDeliveryPopup.current,
      isDeliveryCompletionInProgress,
      currentTripStatus,
      deliveryStatus,
      isCurrentTripDelivery,
      timestamp: new Date().toISOString()
    });
  }, [
    showPickupDeliveryPopup,
    showCompleteDeliveryPopup,
    showDeliveryActionPopup,
    isPopupInteractionActive,
    isDeliveryCompletionInProgress,
    currentTripStatus,
    deliveryStatus,
    isCurrentTripDelivery
  ]);

  // Initialize local trip status when activeTrip changes
  useEffect(() => {
    if (activeTrip?.status) {
      // Don't update local status for dropoff_arrived (it's only for buyer notification)
      if (activeTrip.status !== 'dropoff_arrived') {
        setCurrentTripStatus(activeTrip.status);
        console.log("Initialized local trip status:", activeTrip.status);
      } else {
        console.log("Skipping local status update for dropoff_arrived (buyer notification only)");
      }
    }
  }, [activeTrip?.status]);

  // Initialize delivery state when activeTrip is a delivery
  useEffect(() => {
    // Don't update delivery state if popup interaction is active (prevents premature clearing)
    if (isPopupInteractionActive) {
      console.log("🔒 Skipping delivery state update - popup interaction active");
      return;
    }

    if (activeTrip && activeTrip.isDelivery) {
      // Set delivery-specific state from the activeTrip
      setCurrentDelivery({
        deliveryId: activeTrip._id,
        orderId: activeTrip.orderId,
        status: activeTrip.status,
        customer: activeTrip.customer,
        pickup: {
          address: activeTrip.pickup.address,
          coordinates: [activeTrip.pickup.location.coordinates[0], activeTrip.pickup.location.coordinates[1]]
        },
        dropoff: {
          address: activeTrip.dropoff.address,
          coordinates: [activeTrip.dropoff.location.coordinates[0], activeTrip.dropoff.location.coordinates[1]]
        },
        productDetails: activeTrip.productDetails,
        deliveryPin: activeTrip.deliveryPin,
        estimatedCompletion: activeTrip.estimatedCompletion,
        notes: activeTrip.notes
      });
      setDeliveryStatus(activeTrip.status);
      console.log("🚚 Set current delivery from activeTrip:", activeTrip);
    } else if (!isPopupInteractionActive) {
      // Only clear delivery state if not in popup interaction
      setCurrentDelivery(null);
      setDeliveryStatus(null);
    }
  }, [activeTrip, isPopupInteractionActive]);

  // Expose current trip status to parent component
  useEffect(() => {
    if (onTripStatusChange && currentTripStatus !== null) {
      onTripStatusChange(currentTripStatus);
    }
  }, [currentTripStatus, onTripStatusChange]);

  // Memoized map options with improved styling
  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: true,
      mapId: config.GoogleMapsId,
      clickableIcons: false,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      gestureHandling: "greedy",
      zoomControlOptions: {
        position: window.google?.maps?.ControlPosition?.RIGHT_CENTER,
      },
      styles: [
        {
          featureType: "poi.business",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text",
          stylers: [{ visibility: "off" }],
        },
      ],
    }),
    []
  );

  // Utility function: Calculate distance between two coordinates
  const getDistanceMeters = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Enhanced location update function with throttling
  const updateLocationToBackend = useCallback(
    async (latitude, longitude) => {
      if (!userToken || isUpdatingLocationRef.current) return;
      
      // Throttle updates - don't send if we just sent one recently
      const now = Date.now();
      const timeSinceLastUpdate = now - (lastSentCoords.current?.timestamp || 0);
      const MIN_UPDATE_INTERVAL = 3000; // 3 seconds minimum between updates
      
      if (timeSinceLastUpdate < MIN_UPDATE_INTERVAL) {
        console.log("Throttling location update - too recent");
        return;
      }
      
      isUpdatingLocationRef.current = true;
      try {
        await updateDriverLocation(userToken, [longitude, latitude]);
        lastSentCoords.current = { 
          lat: latitude, 
          lng: longitude,
          timestamp: now 
        };
        console.log("Location updated to backend:", { latitude, longitude });
      } catch (err) {
        console.error("Failed to update driver location:", err);
        setLocationError("Failed to update location");
      } finally {
        isUpdatingLocationRef.current = false;
      }
    },
    [userToken]
  );

  // Handle starting the ride
  const handleStartRide = useCallback(async () => {
    if (!activeTrip || isUpdatingRideStatus) return;
    setIsUpdatingRideStatus(true);
    try {
      await updateRideStatus(userToken, activeTrip._id, "started");
      setShowStartRidePopup(false);
      hasShownStartPopup.current = true;
      setCurrentTripStatus("started"); // Update local status
      console.log("Ride started successfully");
    } catch (err) {
      console.error("Failed to start ride:", err);
      setLocationError("Failed to start ride");
    } finally {
      setIsUpdatingRideStatus(false);
    }
  }, [activeTrip, userToken, isUpdatingRideStatus]);

  // Handle completing the ride
  const handleCompleteRide = useCallback(async () => {
    if (!activeTrip || isUpdatingRideStatus) return;
    setIsUpdatingRideStatus(true);
    try {
      // Use the dedicated complete endpoint instead of generic status update
      const result = await completeRide(userToken, activeTrip._id);
      setShowCompleteRidePopup(false);
      hasShownCompletePopup.current = true;
      setCurrentTripStatus("completed"); // Update local status
      
      // Prepare trip data for summary and show the summary modal
      const tripSummaryData = {
        ...activeTrip,
        ...result.ride, // Include any updated data from the backend
        endTime: new Date().toISOString(),
        startTime: activeTrip.startTime || new Date(Date.now() - 15 * 60000).toISOString(), // Default to 15 min ago if no start time
        distance: result.ride?.distance || activeTrip.distance || Math.random() * 10 + 2, // Use backend data if available
        fare: result.ride?.price || activeTrip.fare || Math.random() * 50 + 10, // Use backend data if available
      };
      
      setCompletedTrip(tripSummaryData);
      setShowTripSummary(true);
      
      // Note: onTripUpdate will be called when the trip summary is closed
      // to ensure the summary is displayed before the parent clears the activeTrip
      
      console.log("Ride completed successfully with dedicated API:", result);
    } catch (err) {
      console.error("Failed to complete ride:", err);
      setLocationError("Failed to complete ride");
    } finally {
      setIsUpdatingRideStatus(false);
    }
  }, [activeTrip, userToken, isUpdatingRideStatus, onTripUpdate]);

  // Handle cancelling the ride
  const handleCancelRide = useCallback(async () => {
    if (!activeTrip || isUpdatingRideStatus) return;
    setIsUpdatingRideStatus(true);
    try {
      // Use the dedicated cancel endpoint
      const result = await cancelRide(userToken, activeTrip._id);
      setShowCancelRidePopup(false);
      setCurrentTripStatus("cancelled"); // Update local status
      
      // Reset all popup flags and simulation state
      hasShownStartPopup.current = false;
      hasShownCompletePopup.current = false;
      setShowStartRidePopup(false);
      setShowCompleteRidePopup(false);
      setIsSimulationMode(false);
      
      // Notify parent component that trip is cancelled
      if (onTripUpdate) {
        onTripUpdate({ ...activeTrip, status: 'cancelled', ...result.ride });
      }
      
      console.log("Ride cancelled successfully with dedicated API:", result);
    } catch (err) {
      console.error("Failed to cancel ride:", err);
      setLocationError("Failed to cancel ride");
    } finally {
      setIsUpdatingRideStatus(false);
    }
  }, [activeTrip, userToken, isUpdatingRideStatus, onTripUpdate]);

  // === DELIVERY HANDLERS (mirroring ride logic) ===
  
  // Handle pickup confirmation for delivery
  const handlePickupDelivery = useCallback(async () => {
    if (!activeTrip || isUpdatingRideStatus || !isCurrentTripDelivery) return;
    setIsUpdatingRideStatus(true);
    try {
      // If there are multiple deliveries from the same pickup location, update all of them
      if (activeTrip.allPickupDeliveries && activeTrip.allPickupDeliveries.length > 1) {
        console.log("🚚 Confirming pickup for multiple deliveries:", activeTrip.allPickupDeliveries.length);
        
        // Use batch update for multiple deliveries
        const deliveryIds = activeTrip.allPickupDeliveries.map(delivery => delivery.deliveryId);
        console.log("🚚 Delivery IDs for batch update:", deliveryIds);
        
        const response = await updateMultipleDeliveryStatuses(deliveryIds, "started", userToken);
        console.log("🚚 Batch update response:", response);
        
        console.log(`🚚 ${response.batchUpdate.totalUpdated} pickup deliveries confirmed successfully`);
      } else {
        // Single delivery update
        console.log("🚚 Confirming single delivery pickup");
        if (onDeliveryStatusUpdate) {
          await onDeliveryStatusUpdate(activeTrip._id, "started");
        } else {
          await updateDeliveryStatus(activeTrip._id, "started", userToken);
        }
      }
      
      setShowPickupDeliveryPopup(false);
      setIsPopupInteractionActive(false); // Clear popup protection
      hasShownPickupDeliveryPopup.current = true;
      setCurrentTripStatus("started"); // Update local status
      console.log("✅ Delivery pickup confirmed successfully");
    } catch (err) {
      console.error("❌ Failed to confirm delivery pickup:", err);
      setLocationError("Failed to confirm pickup: " + (err.message || "Unknown error"));
    } finally {
      setIsUpdatingRideStatus(false);
    }
  }, [activeTrip, userToken, isUpdatingRideStatus, isCurrentTripDelivery, onDeliveryStatusUpdate]);

  // Handle completing the delivery
  const handleCompleteDelivery = useCallback(async () => {
    if (!activeTrip || isUpdatingRideStatus || !isCurrentTripDelivery) return;
    setIsUpdatingRideStatus(true);
    
    try {
      // For deliveries, prompt for PIN verification
      const pin = prompt("Enter the customer's delivery PIN:");
      if (!pin) {
        console.log("Delivery completion cancelled - no PIN provided");
        setIsUpdatingRideStatus(false);
        return;
      }
      
      // Verify PIN with delivery completion endpoint
      if (onDeliveryConfirmation) {
        await onDeliveryConfirmation(activeTrip._id, pin);
      } else {
        // Fallback to direct API call if handler not available
        const response = await fetch(`${config.apiBaseUrl}/api/deliveries/confirm-delivery/${activeTrip._id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deliveryPin: pin }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Invalid delivery PIN');
        }
      }
      
      setShowCompleteDeliveryPopup(false);
      setIsPopupInteractionActive(false); // Clear popup protection
      setIsDeliveryCompletionInProgress(false); // Clear completion flag
      hasShownCompleteDeliveryPopup.current = true;
      setCurrentTripStatus("completed");
      
      // Prepare delivery data for summary
      const deliverySummaryData = {
        ...activeTrip,
        status: 'completed',
        completedAt: new Date().toISOString(),
      };
      
      setCompletedTrip(deliverySummaryData);
      setShowTripSummary(true);
      
      console.log("Delivery completed successfully with PIN verification");
    } catch (err) {
      console.error("Failed to complete delivery:", err);
      setLocationError(err.message || "Failed to complete delivery");
      setIsDeliveryCompletionInProgress(false); // Clear completion flag on error
    } finally {
      setIsUpdatingRideStatus(false);
    }
  }, [activeTrip, userToken, isUpdatingRideStatus, isCurrentTripDelivery, onDeliveryConfirmation]);

  // Optimized simulation functions for testing
  const simulateMovementToPickup = useCallback(() => {
    if (!pickupCoords) return;
    
    // Calculate a position very close to pickup (within arrival threshold)
    const offsetLat = 0.00002; // Very small offset to simulate being "at" pickup
    const offsetLng = 0.00002;
    
    const simulatedLocation = {
      lat: pickupCoords.lat + offsetLat,
      lng: pickupCoords.lng + offsetLng
    };
    
    console.log('Simulating movement to pickup location:', simulatedLocation);
    
    // Enable simulation mode and stop real geolocation
    setIsSimulationMode(true);
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    // Set the simulated location
    setUserLocation(simulatedLocation);
    
    // Update backend with simulated location (controlled panning will handle map view)
    updateLocationToBackend(simulatedLocation.lat, simulatedLocation.lng);
  }, [pickupCoords, updateLocationToBackend]);

  const simulateMovementToDropoff = useCallback(() => {
    if (!dropoffCoords) return;
    
    // Calculate a position very close to dropoff (within arrival threshold)
    const offsetLat = 0.00002; // Very small offset to simulate being "at" dropoff
    const offsetLng = 0.00002;
    
    const simulatedLocation = {
      lat: dropoffCoords.lat + offsetLat,
      lng: dropoffCoords.lng + offsetLng
    };
    
    console.log('Simulating movement to dropoff location:', simulatedLocation);
    
    // Enable simulation mode and stop real geolocation
    setIsSimulationMode(true);
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    // Set the simulated location
    setUserLocation(simulatedLocation);
    
    // Update backend with simulated location (controlled panning will handle map view)
    updateLocationToBackend(simulatedLocation.lat, simulatedLocation.lng);
  }, [dropoffCoords, updateLocationToBackend]);

  // Function to reset simulation and resume real geolocation
  const resetSimulation = useCallback(() => {
    console.log("Resetting simulation mode - resuming real geolocation");
    setIsSimulationMode(false);
    setIsLocationLoading(true);
    
    // The geolocation effect will restart when isSimulationMode becomes false
  }, []);

  // Handle rating submission
  const handleRatingSubmission = useCallback(async (ratingData) => {
    try {
      // Submit the rating to the backend
      console.log("Submitting rating:", ratingData);
      
      await submitPassengerRating(userToken, ratingData);
      
      console.log("Rating submitted successfully");
      
      // Store completed trip data before closing summary
      const completedTripData = completedTrip;
      
      setShowTripSummary(false);
      setCompletedTrip(null);
      
      // Notify parent component that trip is completed (after rating submission)
      if (onTripUpdate && completedTripData) {
        onTripUpdate({ ...completedTripData, status: 'completed' });
      }
    } catch (error) {
      console.error("Failed to submit rating:", error);
      throw error; // Re-throw to let TripSummary component handle the error
    }
  }, [userToken, completedTrip, onTripUpdate]);

  // Delivery Action Handlers
  const handleStartDelivery = useCallback(async () => {
    if (!currentDelivery || !onDeliveryStatusUpdate) return;
    
    try {
      await onDeliveryStatusUpdate(currentDelivery.deliveryId, 'started');
      setDeliveryStatus('started');
      setShowDeliveryActionPopup(false);
      console.log("Delivery started:", currentDelivery.deliveryId);
    } catch (error) {
      console.error("Failed to start delivery:", error);
    }
  }, [currentDelivery, onDeliveryStatusUpdate]);

  const handleCompletePickup = useCallback(async () => {
    if (!currentDelivery || !onDeliveryStatusUpdate) return;
    
    try {
      await onDeliveryStatusUpdate(currentDelivery.deliveryId, 'picked_up');
      setDeliveryStatus('picked_up');
      setShowDeliveryActionPopup(false);
      console.log("Pickup completed:", currentDelivery.deliveryId);
    } catch (error) {
      console.error("Failed to complete pickup:", error);
    }
  }, [currentDelivery, onDeliveryStatusUpdate]);

  // Handle trip summary close
  const handleTripSummaryClose = useCallback(() => {
    setShowTripSummary(false);
    setCompletedTrip(null);
    
    // Now notify parent component that trip is completed (after summary is closed)
    if (onTripUpdate && completedTrip) {
      onTripUpdate({ ...completedTrip, status: 'completed' });
    }
  }, [onTripUpdate, completedTrip]);

  // Controlled map bounds fitting for active trips - show user location and destination
  useEffect(() => {
    if (!map || !window.google || !userLocation) return;

    const now = Date.now();
    const BOUNDS_FIT_THROTTLE = 8000; // 8 seconds minimum between bounds fitting to prevent mobile panning issues
    const statusChanged = previousTripStatus.current !== currentTripStatus;
    
    // Skip frequent bounds fitting during active trips to prevent continuous panning
    const isActiveTripWithFrequentUpdates = activeTrip && !statusChanged;

    // For active trips, fit bounds to show user location and current destination
    if (activeTrip && currentDestination) {
      // More aggressive throttling to prevent mobile panning issues
      if (!statusChanged && now - lastBoundsFitTime.current < BOUNDS_FIT_THROTTLE) {
        console.log("Bounds fitting throttled - preventing mobile panning issue");
        return;
      }
      
      // Additional check: skip if user location hasn't moved significantly
      if (isActiveTripWithFrequentUpdates && lastSentCoords.current) {
        const distanceMoved = getDistanceMeters(
          lastSentCoords.current.lat, lastSentCoords.current.lng,
          userLocation.lat, userLocation.lng
        );
        if (distanceMoved < 50) { // Only update bounds if moved more than 50 meters
          console.log("Skipping bounds fitting - user hasn't moved significantly");
          return;
        }
      }
      
      console.log("Fitting bounds for active trip - user location and destination:", currentTripStatus, statusChanged ? "(status changed)" : "");
      
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(userLocation);
      bounds.extend(currentDestination);
      
      // Add some padding around the bounds
      const paddingOptions = {
        top: 100,
        right: 50,
        bottom: 200, // More bottom padding for UI elements
        left: 50
      };
      
      map.fitBounds(bounds, paddingOptions);
      lastBoundsFitTime.current = now;
      previousTripStatus.current = currentTripStatus; // Update previous status
      console.log("Map bounds fitted to show user location and destination");
      return;
    }

    // If we have an active trip but no destination yet, still try to center on pickup if available
    if (activeTrip && pickupCoords && !currentDestination) {
      if (!statusChanged && now - lastBoundsFitTime.current < BOUNDS_FIT_THROTTLE) {
        return;
      }
      
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(userLocation);
      bounds.extend(pickupCoords);
      
      const paddingOptions = {
        top: 100,
        right: 50,
        bottom: 200,
        left: 50
      };
      
      map.fitBounds(bounds, paddingOptions);
      lastBoundsFitTime.current = now;
      previousTripStatus.current = currentTripStatus; // Update previous status
      console.log("Map bounds fitted for active trip with pickup location");
      return;
    }

    // When no active trip, just center on user location (also throttled)
    if (!activeTrip && userLocation) {
      if (now - lastBoundsFitTime.current < BOUNDS_FIT_THROTTLE) {
        return;
      }
      map.panTo(userLocation);
      lastBoundsFitTime.current = now;
      console.log("No active trip - centered on user location");
    }
  }, [map, activeTrip, currentTripStatus, userLocation, currentDestination, pickupCoords]);

  // Controlled map bounds fitting for delivery trips
  useEffect(() => {
    if (!map || !window.google || !userLocation) return;
    
    const now = Date.now();
    const BOUNDS_FIT_THROTTLE = 5000; // 5 seconds minimum between bounds fitting
    
    // For delivery trips, fit bounds to show user location and delivery destination
    if (isDeliveryUser && currentDelivery && currentDeliveryDestination) {
      // Throttle bounds fitting to prevent excessive map movements
      if (now - lastBoundsFitTime.current < BOUNDS_FIT_THROTTLE) {
        console.log("Delivery bounds fitting throttled - too recent");
        return;
      }
      
      console.log("Fitting bounds for delivery trip - user location and destination:", deliveryStatus);
      
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(userLocation);
      bounds.extend(currentDeliveryDestination);
      
      // Add some padding around the bounds
      const paddingOptions = {
        top: 100,
        right: 50,
        bottom: 200, // More bottom padding for UI elements
        left: 50
      };
      
      map.fitBounds(bounds, paddingOptions);
      lastBoundsFitTime.current = now;
      console.log("Map bounds fitted to show user location and delivery destination");
    }
  }, [map, isDeliveryUser, currentDelivery, deliveryStatus, userLocation, currentDeliveryDestination]);

  // Enhanced geolocation tracking
  useEffect(() => {
    // Don't start geolocation if we're in simulation mode
    if (isSimulationMode) {
      console.log("Simulation mode active - skipping real geolocation");
      return;
    }

    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported");
      setIsLocationLoading(false);
      return;
    }

    const handleLocationSuccess = async (position) => {
      // Don't update location if we're in simulation mode
      if (isSimulationMode) return;
      
      const { latitude, longitude, accuracy } = position.coords;
      const newLocation = { lat: latitude, lng: longitude };
      
      // 🔧 BUG FIX: Check both activeTrip AND currentDelivery for threshold
      const hasActiveWork = activeTrip || currentDelivery;
      const locationThreshold = hasActiveWork ? 15 : 5; // Conservative threshold during active work
      
      // Only update state if location changed significantly
      const shouldUpdateState = !userLocation || 
        getDistanceMeters(userLocation.lat, userLocation.lng, latitude, longitude) > locationThreshold;
      
      if (shouldUpdateState) {
        setUserLocation(newLocation);
        setLocationError(null);
        setIsLocationLoading(false);
        
        // 🔧 BUG FIX: Log location updates for delivery users
        if (isDeliveryUser && currentDelivery) {
          console.log("📍 Delivery driver location updated:", {
            lat: latitude,
            lng: longitude,
            deliveryId: currentDelivery.deliveryId,
            deliveryStatus: deliveryStatus
          });
        }
      }

      // Update backend only if moved significantly from last sent coordinates
      const shouldUpdateBackend = !lastSentCoords.current ||
        getDistanceMeters(
          lastSentCoords.current.lat,
          lastSentCoords.current.lng,
          latitude,
          longitude
        ) > LOCATION_UPDATE_THRESHOLD;

      if (shouldUpdateBackend) {
        await updateLocationToBackend(latitude, longitude);
      }
    };

    const handleLocationError = (error) => {
      console.error("Geolocation error:", error);
      setIsLocationLoading(false);
      const errorMessages = {
        [error.PERMISSION_DENIED]: "Location access denied",
        [error.POSITION_UNAVAILABLE]: "Location unavailable",
        [error.TIMEOUT]: "Location request timed out",
      };
      setLocationError(errorMessages[error.code] || "Location error");
    };

    // Only start watching if not already watching and not in simulation mode
    if (!watchIdRef.current) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleLocationSuccess,
        handleLocationError,
        GEOLOCATION_OPTIONS
      );
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [getDistanceMeters, updateLocationToBackend, isSimulationMode, activeTrip, currentDelivery, isDeliveryUser, deliveryStatus]);

  // Optimized arrival detection with distance calculations memoization
  const distanceToPickup = useMemo(() => {
    if (!userLocation || !pickupCoords) return Infinity;
    return getDistanceMeters(
      userLocation.lat,
      userLocation.lng,
      pickupCoords.lat,
      pickupCoords.lng
    );
  }, [userLocation, pickupCoords, getDistanceMeters]);

  const distanceToDropoff = useMemo(() => {
    if (!userLocation || !dropoffCoords) return Infinity;
    return getDistanceMeters(
      userLocation.lat,
      userLocation.lng,
      dropoffCoords.lat,
      dropoffCoords.lng
    );
  }, [userLocation, dropoffCoords, getDistanceMeters]);

  // Enhanced arrival detection and popup management (optimized)
  useEffect(() => {
    // Skip if no active trip or location
    if (!activeTrip || !userLocation) return;

    // === RIDE LOGIC ===
    if (!isCurrentTripDelivery) {
      // Handle pickup location arrival (show start ride popup)
      if (
        currentTripStatus === "arrived" &&
        !hasShownStartPopup.current &&
        pickupCoords &&
        distanceToPickup < ARRIVAL_THRESHOLD
      ) {
        console.log("Showing start ride popup - distance to pickup:", distanceToPickup);
        setShowStartRidePopup(true);
        hasShownStartPopup.current = true;
      }

      // Handle dropoff location arrival (show complete ride popup)
      if (
        (currentTripStatus === "started" || currentTripStatus === "in_progress") &&
        !hasShownCompletePopup.current &&
        dropoffCoords &&
        distanceToDropoff < ARRIVAL_THRESHOLD
      ) {
        console.log("Showing complete ride popup - distance to dropoff:", distanceToDropoff);
        setShowCompleteRidePopup(true);
        hasShownCompletePopup.current = true;
      }
    }

    // === DELIVERY LOGIC (mirroring ride flow) ===
    if (isCurrentTripDelivery) {
      console.log("🚚 Delivery logic check:", {
        currentTripStatus,
        deliveryStatus,
        isDeliveryUser,
        hasCurrentDelivery: !!currentDelivery,
        hasShownPickupDeliveryPopup: hasShownPickupDeliveryPopup.current,
        pickupCoords,
        distanceToPickup,
        ARRIVAL_THRESHOLD,
        isPopupInteractionActive,
        showPickupDeliveryPopup,
        shouldShowPickup: currentTripStatus === "arrived" && !hasShownPickupDeliveryPopup.current && pickupCoords && distanceToPickup < ARRIVAL_THRESHOLD && !isPopupInteractionActive
      });
      
      // Handle pickup location arrival (show pickup delivery popup)
      // Only show if not currently interacting with any popup
      if (
        currentTripStatus === "arrived" &&
        !hasShownPickupDeliveryPopup.current &&
        pickupCoords &&
        distanceToPickup < ARRIVAL_THRESHOLD &&
        !isPopupInteractionActive &&
        !showPickupDeliveryPopup // Ensure popup isn't already showing
      ) {
        console.log("🚚 Showing pickup delivery popup - distance to pickup:", distanceToPickup);
        console.log("🚚 Multiple deliveries from pickup:", activeTrip?.allPickupDeliveries?.length || 1);
        console.log("🚚 ActiveTrip data for pickup popup:", {
          activeTrip,
          allPickupDeliveries: activeTrip?.allPickupDeliveries,
          productDetailsStructure: activeTrip?.allPickupDeliveries?.map(d => ({
            orderId: d.orderId,
            productDetails: d.productDetails,
            customer: d.customer
          }))
        });
        setShowPickupDeliveryPopup(true);
        setIsPopupInteractionActive(true); // Protect against external state changes
        hasShownPickupDeliveryPopup.current = true;
      }

      // Handle dropoff location arrival (show complete delivery popup)
      // Only show if not currently interacting with any popup
      if (
        (currentTripStatus === "started" || currentTripStatus === "in_progress") &&
        !hasShownCompleteDeliveryPopup.current &&
        dropoffCoords &&
        distanceToDropoff < ARRIVAL_THRESHOLD &&
        !isPopupInteractionActive &&
        !showCompleteDeliveryPopup && // Ensure popup isn't already showing
        !isDeliveryCompletionInProgress // Don't show if completion is already in progress
      ) {
        console.log("🚚 Driver arrived at delivery destination - notifying buyer");
        
        // 🔔 Notify buyer that driver has arrived at delivery location with PIN
        // Use delayed notification to prevent state conflicts
        if (isCurrentTripDelivery && onBuyerNotification && activeTrip?._id) {
          console.log("🚀 Triggering dropoff_arrived notification for:", activeTrip._id);
          setTimeout(() => {
            onBuyerNotification(activeTrip._id, "dropoff_arrived")
              .then(() => {
                console.log("✅ Buyer notified of driver arrival with PIN information (non-intrusive)");
              })
              .catch((err) => {
                console.error("❌ Failed to notify buyer of driver arrival:", err);
              });
          }, 100); // Small delay to prevent state conflicts
        }
        
        console.log("Showing complete delivery popup - distance to dropoff:", distanceToDropoff);
        setShowCompleteDeliveryPopup(true);
        setIsPopupInteractionActive(true); // Protect against external state changes
        setIsDeliveryCompletionInProgress(true);
        hasShownCompleteDeliveryPopup.current = true;
      }
    }

    // Auto-update to "arrived" status when within threshold
    if (
      currentTripStatus === "accepted" &&
      pickupCoords &&
      distanceToPickup < ARRIVAL_THRESHOLD
    ) {
  
      // Use appropriate update function based on trip type
      const updateFunction = isCurrentTripDelivery 
        ? () => updateDeliveryStatus(activeTrip._id, "arrived", userToken)
        : () => updateRideStatus(userToken, activeTrip._id, "arrived");
      
      updateFunction()
        .then(() => {
          setCurrentTripStatus("arrived");
          console.log(`Auto-updated ${isCurrentTripDelivery ? 'delivery' : 'ride'} status to arrived - distance:`, distanceToPickup);
        })
        .catch((err) => {
          console.error(`Failed to auto-update ${isCurrentTripDelivery ? 'delivery' : 'ride'} status to arrived:`, err);
        });
    }
  }, [
    currentTripStatus,
    activeTripId, // Use stable ID instead of full object
    distanceToPickup,
    distanceToDropoff,
    pickupCoords,
    dropoffCoords,
    userToken,
  ]);

  // Optimized trip reset when trip changes
  useEffect(() => {
    // Only reset if the trip ID actually changed
    if (previousActiveTrip.current?._id !== activeTripId) {
      console.log("Trip ID changed, resetting popup flags. New trip ID:", activeTripId);
      
      // Reset ride popup states
      hasShownStartPopup.current = false;
      hasShownCompletePopup.current = false;
      setShowStartRidePopup(false);
      setShowCompleteRidePopup(false);
      setShowCancelRidePopup(false);
      
      // Reset delivery popup states (but preserve active completion flows)
      hasShownPickupDeliveryPopup.current = false;
      hasShownCompleteDeliveryPopup.current = false;
      
      // Only reset popup visibility if not currently in popup interaction
      if (!isPopupInteractionActive) {
        setShowPickupDeliveryPopup(false);
        setShowCompleteDeliveryPopup(false);
        setIsPopupInteractionActive(false); // Ensure protection is cleared
      }
      
      setCurrentTripStatus(activeTrip?.status || null);
      previousTripStatus.current = null;
      setIsSimulationMode(false);
      setShowTripSummary(false);
      setCompletedTrip(null);
      setIsDeliveryCompletionInProgress(false); // Reset completion flag
      
      // Update the previous trip reference
      previousActiveTrip.current = activeTrip;
      
      console.log("🔄 Reset complete for new trip/delivery:", {
        newTripId: activeTripId,
        resetPopupStates: !isPopupInteractionActive,
        isDelivery: activeTrip?.isDelivery || false
      });
    }
  }, [activeTripId, isPopupInteractionActive]); // Include popup protection in dependencies

  // Delivery distance calculation and popup logic
  const [distanceToDeliveryPickup, setDistanceToDeliveryPickup] = useState(null);
  const [distanceToDeliveryDropoff, setDistanceToDeliveryDropoff] = useState(null);
  const hasShownDeliveryPickupPopup = useRef(false);
  const hasShownDeliveryDropoffPopup = useRef(false);

  useEffect(() => {
    console.log("📍 Delivery distance useEffect check:", {
      isDeliveryUser,
      hasCurrentDelivery: !!currentDelivery,
      hasDeliveryPickupCoords: !!deliveryPickupCoords,
      hasDeliveryDropoffCoords: !!deliveryDropoffCoords,
      hasUserLocation: !!userLocation,
      deliveryStatus
    });
    
    if (!isDeliveryUser || !currentDelivery || !deliveryPickupCoords || !deliveryDropoffCoords || !userLocation) return;

    // Calculate distances
    const distanceToPickup = getDistanceMeters(
      userLocation.lat, userLocation.lng,
      deliveryPickupCoords.lat, deliveryPickupCoords.lng
    );
    const distanceToDropoff = getDistanceMeters(
      userLocation.lat, userLocation.lng, 
      deliveryDropoffCoords.lat, deliveryDropoffCoords.lng
    );
    
    setDistanceToDeliveryPickup(distanceToPickup);
    setDistanceToDeliveryDropoff(distanceToDropoff);

    // Show delivery start popup when arriving at pickup
    if (deliveryStatus === "accepted" && distanceToPickup <= ARRIVAL_THRESHOLD && !hasShownDeliveryPickupPopup.current) {
      console.log("Showing delivery start popup - distance to pickup:", distanceToPickup);
      setDeliveryActionType('start');
      setShowDeliveryActionPopup(true);
      hasShownDeliveryPickupPopup.current = true;
    }

    // Show pickup complete popup when at pickup and delivery started
    if (deliveryStatus === "started" && distanceToPickup <= ARRIVAL_THRESHOLD && !hasShownDeliveryPickupPopup.current) {
      console.log("Showing pickup complete popup - distance to pickup:", distanceToPickup);
      setDeliveryActionType('pickup');
      setShowDeliveryActionPopup(true);
      hasShownDeliveryPickupPopup.current = true;
    }

    // Show delivery complete popup when arriving at dropoff
    if (deliveryStatus === "picked_up" && distanceToDropoff <= ARRIVAL_THRESHOLD && !hasShownDeliveryDropoffPopup.current) {
      console.log("🚚 Driver arrived at delivery dropoff - notifying buyer");
      
      // 🔔 Notify buyer that driver has arrived at delivery location with PIN
      // Use the separate notification function to avoid interfering with completion workflow
      if (onBuyerNotification && currentDelivery?.deliveryId) {
        onBuyerNotification(currentDelivery.deliveryId, "dropoff_arrived")
          .then(() => {
            console.log("✅ Buyer notified of driver arrival at dropoff location (non-intrusive)");
          })
          .catch((err) => {
            console.error("❌ Failed to notify buyer of driver arrival:", err);
          });
      }
      
      console.log("Showing delivery complete popup - distance to dropoff:", distanceToDropoff);
      setDeliveryActionType('delivery');
      setShowDeliveryActionPopup(true);
      setIsDeliveryCompletionInProgress(true); // Protect completion flow
      hasShownDeliveryDropoffPopup.current = true;
    }
  }, [isDeliveryUser, currentDelivery?.deliveryId, deliveryStatus, userLocation, getDistanceMeters, onBuyerNotification]);

  // Reset delivery popup flags when delivery changes
  useEffect(() => {
    // Only reset if delivery ID actually changed (not just status updates)
    const currentDeliveryId = currentDelivery?.deliveryId;
    const previousDeliveryId = previousActiveTrip.current?.deliveryId || previousActiveTrip.current?._id;
    
    if (currentDeliveryId && previousDeliveryId && currentDeliveryId !== previousDeliveryId) {
      console.log("Delivery ID changed, resetting delivery popup flags");
      hasShownDeliveryPickupPopup.current = false;
      hasShownDeliveryDropoffPopup.current = false;
      
      // Only clear action popup states if not currently in popup interaction
      if (!isPopupInteractionActive && (deliveryActionType !== 'delivery' || !showDeliveryActionPopup)) {
        setShowDeliveryActionPopup(false);
        setDeliveryActionType(null);
      }
    } else if (!currentDeliveryId && previousDeliveryId && !isPopupInteractionActive) {
      console.log("No current delivery, clearing delivery popup states");
      hasShownDeliveryPickupPopup.current = false;
      hasShownDeliveryDropoffPopup.current = false;
      setShowDeliveryActionPopup(false);
      setDeliveryActionType(null);
    }
  }, [currentDelivery?.deliveryId, isDeliveryCompletionInProgress, isPopupInteractionActive]);

  // Optimized directions calculation
  useEffect(() => {
    // Skip if no required data or google maps not loaded
    if (!activeTrip || !userLocation || !window.google || !currentDestination) {
      setDirections(null);
      setNavigationInstructions([]);
      return;
    }

    // Initialize directions service if needed
    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
    }

    directionsServiceRef.current.route(
      {
        origin: userLocation,
        destination: currentDestination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          
          // Extract turn-by-turn navigation instructions
          const steps = result.routes[0]?.legs[0]?.steps || [];
          const instructions = steps.map((step, index) => ({
            instruction: step.instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
            distance: step.distance?.text || '',
            duration: step.duration?.text || '',
            maneuver: step.maneuver || 'straight'
          }));
          setNavigationInstructions(instructions);
          console.log('Navigation instructions extracted for destination:', currentDestination);
        } else {
          console.warn("Directions request failed:", status);
          setDirections(null);
          setNavigationInstructions([]);
        }
      }
    );
  }, [activeTrip, userLocation, currentDestination]);

  // Delivery directions calculation
  useEffect(() => {
    // Skip if not delivery user, no required data, or google maps not loaded
    if (!isDeliveryUser || !currentDelivery || !userLocation || !window.google || !currentDeliveryDestination) {
      setDeliveryDirections(null);
      return;
    }

    // Initialize directions service if needed
    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
    }

    directionsServiceRef.current.route(
      {
        origin: userLocation,
        destination: currentDeliveryDestination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDeliveryDirections(result);
          console.log('Delivery directions calculated for destination:', currentDeliveryDestination);
        } else {
          console.warn("Delivery directions request failed:", status);
          setDeliveryDirections(null);
        }
      }
    );
  }, [isDeliveryUser, currentDelivery, userLocation, currentDeliveryDestination]);

  // Optimized user location marker effect with controlled panning
  useEffect(() => {
    if (!isLoaded || !map || !userLocation || !window.google) return;

    try {
      const { AdvancedMarkerElement } = window.google.maps.marker;

      // Only create new marker element if marker doesn't exist
      if (!markerRef.current) {
        const createMarkerElement = () => {
          const element = document.createElement("div");
          element.className = `user-location-marker ${isOnline ? 'driver-online-pulse' : ''}`;
          element.innerHTML = `
            <div class="pulse-marker">
              <div class="pulse-dot"></div>
              <div class="pulse-ring"></div>
            </div>
          `;
          return element;
        };

        markerRef.current = new AdvancedMarkerElement({
          position: userLocation,
          map: map,
          title: "Your location",
          content: createMarkerElement(),
        });
        
        console.log("Created new user location marker");
      } else {
        // Update the marker position
        markerRef.current.position = userLocation;
        
        // Update online status class on existing marker
        const markerElement = markerRef.current.content;
        if (markerElement) {
          if (isOnline) {
            markerElement.classList.add('driver-online-pulse');
          } else {
            markerElement.classList.remove('driver-online-pulse');
          }
        }
        
        console.log("Updated user location marker position");
      }
    } catch (error) {
      console.error("Error updating user location marker:", error);
    }
  }, [isLoaded, map, userLocation, isOnline]);

  // Online status animation effect - zoom and pulse
  useEffect(() => {
    if (!map || !userLocation) return;

    console.log('🎯 Online status changed:', isOnline);

    if (isOnline) {
      // Going online - zoom out to show coverage area with smooth animation
      map.panTo(userLocation);
      setTimeout(() => {
        map.setZoom(13);
      }, 300);
      
      // Add pulsing class to user marker if it exists
      if (markerRef.current && markerRef.current.content) {
        const markerElement = markerRef.current.content;
        if (markerElement) {
          markerElement.classList.add('driver-online-pulse');
        }
      }
    } else {
      // Going offline - zoom in slightly and remove pulse
      setTimeout(() => {
        map.setZoom(15);
      }, 300);
      
      // Remove pulsing class from user marker
      if (markerRef.current && markerRef.current.content) {
        const markerElement = markerRef.current.content;
        if (markerElement) {
          markerElement.classList.remove('driver-online-pulse');
        }
      }
    }
  }, [isOnline, map, userLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  // Delivery markers effect
  const deliveryPickupMarkerRef = useRef(null);
  const deliveryDropoffMarkerRef = useRef(null);

  useEffect(() => {
    if (!isLoaded || !map || !isDeliveryUser || !currentDelivery || !window.google) return;

    try {
      const { AdvancedMarkerElement } = window.google.maps.marker;

      // Create pickup marker
      if (deliveryPickupCoords && !deliveryPickupMarkerRef.current) {
        const createPickupMarkerElement = () => {
          const element = document.createElement('div');
          element.className = "delivery-pickup-marker";
          element.innerHTML = `
            <div class="delivery-marker pickup">
              <div class="marker-icon">📦</div>
              <div class="marker-label">PICKUP</div>
            </div>
          `;
          return element;
        };

        deliveryPickupMarkerRef.current = new AdvancedMarkerElement({
          map,
          position: deliveryPickupCoords,
          content: createPickupMarkerElement(),
          title: "Delivery Pickup Location"
        });
      }

      // Create dropoff marker
      if (deliveryDropoffCoords && !deliveryDropoffMarkerRef.current) {
        const createDropoffMarkerElement = () => {
          const element = document.createElement('div');
          element.className = "delivery-dropoff-marker";
          element.innerHTML = `
            <div class="delivery-marker dropoff">
              <div class="marker-icon">🏠</div>
              <div class="marker-label">DELIVERY</div>
            </div>
          `;
          return element;
        };

        deliveryDropoffMarkerRef.current = new AdvancedMarkerElement({
          map,
          position: deliveryDropoffCoords,
          content: createDropoffMarkerElement(),
          title: "Delivery Dropoff Location"
        });
      }

      console.log("Created delivery markers");
    } catch (error) {
      console.error("Error creating delivery markers:", error);
    }

    // Cleanup delivery markers when delivery changes
    return () => {
      if (deliveryPickupMarkerRef.current) {
        deliveryPickupMarkerRef.current.setMap(null);
        deliveryPickupMarkerRef.current = null;
      }
      if (deliveryDropoffMarkerRef.current) {
        deliveryDropoffMarkerRef.current.setMap(null);
        deliveryDropoffMarkerRef.current = null;
      }
    };
  }, [isLoaded, map, isDeliveryUser, currentDelivery, deliveryPickupCoords, deliveryDropoffCoords]);

  // Enhanced Slider component for ride actions
  const SlideToConfirm = memo(({
    onConfirm,
    text,
    confirmText,
    bgColor = "#4CAF50",
    disabled = false,
    variant = "start-ride", // New prop for styling variants
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(0);
    const sliderRef = useRef(null);
    const containerRef = useRef(null);

    const handleStart = (clientX) => {
      if (disabled) return;
      setIsDragging(true);
    };

    const handleMove = (clientX) => {
      if (!isDragging || !containerRef.current || disabled) return;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const maxPosition = rect.width - 60; // 60px is slider width
      const newPosition = Math.max(
        0,
        Math.min(maxPosition, clientX - rect.left - 30)
      );
      setPosition(newPosition);

      // Auto-confirm if dragged to end
      if (newPosition >= maxPosition * 0.85) {
        onConfirm();
        setPosition(0);
        setIsDragging(false);
      }
    };

    const handleEnd = () => {
      if (disabled) return;
      setIsDragging(false);
      setPosition(0);
    };

    // Get container width for position calculation
    const containerWidth = containerRef.current?.clientWidth || 320;
    const maxPosition = containerWidth - 60;
    const progressPercentage = maxPosition > 0 ? (position / maxPosition) * 100 : 0;

    return (
      <div
        ref={containerRef}
        className={`slide-to-confirm ${variant} ${disabled ? 'disabled' : ''}`}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        <div
          className={`slide-background ${isDragging ? 'dragging' : ''}`}
          style={{
            width: `${progressPercentage}%`,
            '--slide-color': bgColor,
            '--slide-color-dark': bgColor.replace('50', '700'), // Darker variant
          }}
        />
        <div
          ref={sliderRef}
          className={`slide-handle ${disabled ? 'disabled' : ''} ${isDragging ? 'dragging' : ''}`}
          style={{
            left: `${4 + position}px`,
            transition: isDragging ? "none" : "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseDown={(e) => handleStart(e.clientX)}
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX)}
          onTouchEnd={handleEnd}
        >
          →
        </div>
        <div
          className={`slide-text ${progressPercentage > 30 ? 'active' : ''}`}
        >
          {progressPercentage > 50 ? confirmText : text}
        </div>
      </div>
    );
  });

  // Loading and error states
  if (loadError) {
    return (
      <div className="map-error">
        <div className="error-content">
          <h3>Failed to load map</h3>
          <p>Please check your internet connection and try again.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>Loading maps...</p>
      </div>
    );
  }

  return (
    <div className="map-container">
      {/* Compact Trip Simulation Controls - Repositioned when there's an active trip */}
      {activeTrip && (
        <div style={{
          position: 'absolute',
          bottom: activeTrip ? '300px' : '20px', // Move up when drawer is active
          left: '20px',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          WebkitBackdropFilter: 'blur(10px)',
          backdropFilter: 'blur(10px)',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: '200px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'bottom 0.3s ease'
        }}>
          {/* <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            🎮 Simulation
          </div>
          <div style={{ fontSize: '10px', marginBottom: '3px', color: '#666' }}>
            Status: <span style={{ fontWeight: '500', color: '#333' }}>{currentTripStatus || 'Unknown'}</span>
          </div> */}
          <div style={{ 
            fontSize: '10px', 
            marginBottom: '8px',
            color: isSimulationMode ? '#ff6b35' : '#4CAF50',
            fontWeight: '500'
          }}>
            {/* {isSimulationMode ? '🎮 Simulation' : '📍 Real GPS'} */}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(currentTripStatus === 'accepted') && (
              <button
                onClick={() => simulateMovementToPickup()}
                style={{
                  padding: '6px 8px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500'
                }}
              >
                {isCurrentTripDelivery ? '� Drive to Pickup' : '�🚗 Drive to Pickup'}
              </button>
            )}
            {(currentTripStatus === 'started' || currentTripStatus === 'in_progress') && (
              <button
                onClick={() => simulateMovementToDropoff()}
                style={{
                  padding: '6px 8px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500'
                }}
              >
                {isCurrentTripDelivery ? '🏠 Drive to Delivery' : '🎯 Drive to Dropoff'}
              </button>
            )}
            {isSimulationMode && (
              <button
                onClick={() => resetSimulation()}
                style={{
                  padding: '6px 8px',
                  backgroundColor: '#ff6b35',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500'
                }}
              >
                🔄 Resume GPS
              </button>
            )}
            {/* Debug button for testing multiple pickup functionality */}
            {isCurrentTripDelivery && activeTrip?.allPickupDeliveries?.length > 1 && (
              <button
                onClick={() => {
                  console.log("🚚 DEBUG: Forcing pickup popup to show");
                  console.log("🚚 Multiple deliveries:", activeTrip.allPickupDeliveries.length);
                  setShowPickupDeliveryPopup(true);
                  hasShownPickupDeliveryPopup.current = false; // Allow showing again
                }}
                style={{
                  padding: '6px 8px',
                  backgroundColor: '#FF9500',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500',
                  marginTop: '4px'
                }}
              >
                🚚 Test Pickup ({activeTrip.allPickupDeliveries.length})
              </button>
            )}
            {activeTrip && currentTripStatus !== 'completed' && currentTripStatus !== 'cancelled' && (
              <button
                onClick={() => setShowCancelRidePopup(true)}
                style={{
                  padding: '6px 8px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500',
                  marginTop: '2px'
                }}
              >
                {isCurrentTripDelivery ? '❌ Cancel Delivery' : '❌ Cancel Ride'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Location status indicator - Hidden when there's an active trip */}
      {!activeTrip && isLocationLoading && (
        <div className="location-status loading">
          <div className="status-dot"></div>
          <span>Getting your location...</span>
        </div>
      )}

      {!activeTrip && locationError && (
        <div className="location-status error">
          <div className="status-dot"></div>
          <span>{locationError}</span>
        </div>
      )}

      {/* Start Ride Popup - Only for rides */}
      {showStartRidePopup && !isCurrentTripDelivery && (
        <div className="ride-action-popup" style={{ zIndex: 9999 }}>
          <div className="popup-content">
            <h3>🚗 Passenger Picked Up?</h3>
            <p>Slide to confirm the passenger is in your vehicle and start the trip.</p>
            <SlideToConfirm
              onConfirm={handleStartRide}
              text="Slide to Start Trip"
              confirmText="Starting..."
              bgColor="#4CAF50"
              variant="start-ride"
              disabled={isUpdatingRideStatus}
            />
            <button
              className="popup-cancel"
              onClick={() => setShowStartRidePopup(false)}
              disabled={isUpdatingRideStatus}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Pickup Delivery Popup - Only for deliveries */}
      {showPickupDeliveryPopup && isCurrentTripDelivery && (
        <div className="ride-action-popup" style={{ zIndex: 9999 }}>
          <div className="popup-content">
            <h3>📦 Pickup Confirmation</h3>
            <p>Confirm you have collected all orders from this location.</p>
            
            <div className="delivery-summary">
              <div className="pickup-location">
                <strong>📍 Location:</strong> {activeTrip?.pickup?.address}
              </div>
              
              <div className="orders-summary">
                <strong>Orders to collect:</strong>
                <div className="orders-list">
                  {(activeTrip?.allPickupDeliveries?.length > 0 ? activeTrip.allPickupDeliveries : [activeTrip]).map((delivery, index) => (
                    <div key={delivery?.deliveryId || delivery?._id || index} className="order-item">
                      <div className="order-badge">
                        <span className="order-number">#{delivery?.orderId || `ORDER-${index + 1}`}</span>
                        <span className="customer-name">→ {delivery?.customer?.name || activeTrip?.customer?.name || activeTrip?.rider?.fullName || 'Customer'}</span>
                      </div>
                      {/* {delivery?.deliveryPin && (
                        <div className="delivery-pin-hint">
                          <small>📌 PIN: {delivery.deliveryPin}</small>
                        </div>
                      )} */}
                    </div>
                  ))}
                </div>
                
                {activeTrip?.allPickupDeliveries?.length > 1 && (
                  <div className="total-orders">
                    <strong>Total: {activeTrip.allPickupDeliveries.length} orders</strong>
                  </div>
                )}
              </div>
              
              {activeTrip?.notes && (
                <div className="pickup-notes">
                  <strong>📝 Notes:</strong> {activeTrip.notes}
                </div>
              )}
            </div>
            
            <SlideToConfirm
              onConfirm={handlePickupDelivery}
              text={activeTrip?.allPickupDeliveries?.length > 1 ? 
                `Slide to Confirm All Pickups` : 
                "Slide to Confirm Pickup"
              }
              confirmText="Confirming Pickup..."
              bgColor="#FF9500"
              disabled={isUpdatingRideStatus}
            />
            <button
              className="popup-cancel"
              onClick={() => {
                setShowPickupDeliveryPopup(false);
                setIsPopupInteractionActive(false); // Clear popup protection
              }}
              disabled={isUpdatingRideStatus}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Complete Ride Popup - Only for rides */}
      {showCompleteRidePopup && !isCurrentTripDelivery && (
        <div className="ride-action-popup" style={{ zIndex: 9999 }}>
          <div className="popup-content">
            <h3>🎯 Trip Complete?</h3>
            <p>Slide to confirm the passenger has been dropped off safely.</p>
            <SlideToConfirm
              onConfirm={handleCompleteRide}
              text="Slide to Complete Trip"
              confirmText="Completing..."
              bgColor="#2196F3"
              variant="complete-ride"
              disabled={isUpdatingRideStatus}
            />
            <button
              className="popup-cancel"
              onClick={() => setShowCompleteRidePopup(false)}
              disabled={isUpdatingRideStatus}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Complete Delivery Popup - Only for deliveries */}
      {showCompleteDeliveryPopup && isCurrentTripDelivery && (
        <div className="ride-action-popup" style={{ zIndex: 9999 }}>
          <div className="popup-content">
            <h3>🏠 Complete Delivery</h3>
            <p>You've arrived at the delivery location. The customer will provide a PIN to confirm delivery.</p>
            <div className="delivery-details">
              {activeTrip?.customer && (
                <div className="customer-info">
                  <strong>Deliver to:</strong> {activeTrip.customer.name}
                  <br />
                  <strong>Phone:</strong> {activeTrip.customer.phone}
                </div>
              )}
              {activeTrip?.deliveryPin && (
                <div className="pin-info">
                  <strong>Expected PIN:</strong> {activeTrip.deliveryPin}
                </div>
              )}
            </div>
            <SlideToConfirm
              onConfirm={handleCompleteDelivery}
              text="Slide to Complete Delivery"
              confirmText="Completing Delivery..."
              bgColor="#4CAF50"
              disabled={isUpdatingRideStatus}
            />
            <button
              className="popup-cancel"
              onClick={() => {
                setShowCompleteDeliveryPopup(false);
                setIsPopupInteractionActive(false); // Clear popup protection
              }}
              disabled={isUpdatingRideStatus}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cancel Ride/Delivery Popup */}
      {showCancelRidePopup && (
        <div className="ride-action-popup" style={{ zIndex: 9999 }}>
          <div className="popup-content">
            <h3>{isCurrentTripDelivery ? "❌ Cancel This Delivery?" : "❌ Cancel This Ride?"}</h3>
            <p>
              {isCurrentTripDelivery 
                ? "This will cancel the delivery and make you available for new delivery requests. The customer will be notified."
                : "This will cancel the ride and make you available for new requests. The passenger will be notified."
              }
            </p>
            <SlideToConfirm
              onConfirm={handleCancelRide}
              text={isCurrentTripDelivery ? "Slide to Cancel Delivery" : "Slide to Cancel Ride"}
              confirmText={isCurrentTripDelivery ? "Cancelling Delivery..." : "Cancelling..."}
              bgColor="#dc3545"
              variant="cancel-ride"
              disabled={isUpdatingRideStatus}
            />
            <button
              className="popup-cancel"
              onClick={() => setShowCancelRidePopup(false)}
              disabled={isUpdatingRideStatus}
            >
              {isCurrentTripDelivery ? "Keep Delivery" : "Keep Ride"}
            </button>
          </div>
        </div>
      )}

      {/* Delivery Action Popup */}
      {showDeliveryActionPopup && deliveryActionType && (
        <div className="ride-action-popup delivery-action-popup" style={{ zIndex: 9999 }}>
          <div className="popup-content">
            {deliveryActionType === 'start' && (
              <>
                <h3>🚚 Start Delivery?</h3>
                <p>You've arrived at the pickup location. Ready to start the delivery?</p>
                <SlideToConfirm
                  onConfirm={handleStartDelivery}
                  text="Slide to Start Delivery"
                  confirmText="Starting..."
                  bgColor="#FF9500"
                />
              </>
            )}
            {deliveryActionType === 'pickup' && (
              <>
                <h3>📦 Pickup Complete?</h3>
                <p>Confirm you have collected the item for delivery.</p>
                <SlideToConfirm
                  onConfirm={handleCompletePickup}
                  text="Slide to Complete Pickup"
                  confirmText="Completing..."
                  bgColor="#FF9500"
                />
              </>
            )}
            {deliveryActionType === 'delivery' && (
              <>
                <h3>🏠 Complete Delivery?</h3>
                <p>You've arrived at the delivery location. Ready to complete the delivery?</p>
                <SlideToConfirm
                  onConfirm={handleCompleteDelivery}
                  text="Slide to Complete Delivery"
                  confirmText="Completing..."
                  bgColor="#4CAF50"
                />
              </>
            )}
            <button
              className="popup-cancel"
              onClick={() => {
                setShowDeliveryActionPopup(false);
                setIsDeliveryCompletionInProgress(false); // Clear completion flag on cancel
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Trip Summary Modal */}
      {showTripSummary && completedTrip && (
        <TripSummary
          trip={completedTrip}
          onClose={handleTripSummaryClose}
          onSubmitRating={handleRatingSubmission}
        />
      )}

      {/* Enhanced Navigation Instructions Panel - Compact and Non-obstructive */}
      {navigationInstructions.length > 0 && activeTrip && (currentTripStatus === "accepted" || currentTripStatus === "arrived" || currentTripStatus === "started" || currentTripStatus === "in_progress") && (
        <div className="navigation-instructions-compact">
          <div className="next-instruction-main">
            <div className="instruction-icon-large">
              {navigationInstructions[0]?.maneuver === 'turn-left' ? '⬅️' : 
               navigationInstructions[0]?.maneuver === 'turn-right' ? '➡️' : 
               navigationInstructions[0]?.maneuver === 'straight' ? '⬆️' : 
               navigationInstructions[0]?.maneuver === 'merge' ? '🔀' : 
               navigationInstructions[0]?.maneuver === 'ramp' ? '↗️' : '⬆️'}
            </div>
            <div className="instruction-details">
              <div className="instruction-text-main">{navigationInstructions[0]?.instruction || 'Continue straight'}</div>
              <div className="instruction-distance-main">{navigationInstructions[0]?.distance}</div>
            </div>
          </div>
          {navigationInstructions.length > 1 && (
            <div className="upcoming-turns">
              <div className="upcoming-label">Then:</div>
              {navigationInstructions.slice(1, 3).map((step, index) => (
                <div key={index} className="upcoming-instruction">
                  <span className="upcoming-icon">
                    {step.maneuver === 'turn-left' ? '⬅️' : 
                     step.maneuver === 'turn-right' ? '➡️' : 
                     step.maneuver === 'straight' ? '⬆️' : 
                     step.maneuver === 'merge' ? '🔀' : 
                     step.maneuver === 'ramp' ? '↗️' : '⬆️'}
                  </span>
                  <span className="upcoming-distance">{step.distance}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map Control Buttons */}
      {map && (
        <div className="map-controls">
          <button
            className="map-control-btn"
            onClick={() => {
              if (userLocation) {
                map.panTo(userLocation);
                map.setZoom(16);
              }
            }}
            title="Center on my location"
          >
            📍
          </button>
          
          {activeTrip && directions && (
            <button
              className="map-control-btn"
              onClick={() => {
                const bounds = new window.google.maps.LatLngBounds();
                
                // Add user location to bounds
                if (userLocation) bounds.extend(userLocation);
                
                // Add pickup location to bounds
                if (pickupCoords) bounds.extend(pickupCoords);
                
                // Add dropoff location to bounds if trip is started
                if (dropoffCoords && (currentTripStatus === "started" || currentTripStatus === "in_progress")) {
                  bounds.extend(dropoffCoords);
                }
                
                // Fit the map to show all relevant points with padding
                map.fitBounds(bounds, {
                  top: 120,    // Navigation panel space
                  bottom: 220, // Drawer space
                  left: 60,
                  right: 60
                });
              }}
              title="Show full route"
            >
              🗺️
            </button>
          )}
        </div>
      )}

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={16}
        center={mapCenter}
        onLoad={setMap}
        options={mapOptions}
      >
        {/* Render directions with enhanced styling */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: isCurrentTripDelivery ? "#FF9500" : "#4285F4", // Orange for deliveries, blue for rides
                strokeWeight: 6,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

// Custom comparison function for memo to prevent unnecessary re-renders
const arePropsEqual = (prevProps, nextProps) => {
  // Compare primitive values including isOnline for animation triggers
  if (
    prevProps.userToken !== nextProps.userToken ||
    prevProps.center !== nextProps.center ||
    prevProps.isOnline !== nextProps.isOnline
  ) {
    return false;
  }

  // Compare activeTrip by ID and status (most common changes)
  const prevTrip = prevProps.activeTrip;
  const nextTrip = nextProps.activeTrip;
  
  if (prevTrip?._id !== nextTrip?._id || prevTrip?.status !== nextTrip?.status) {
    return false;
  }

  // SKIP marker comparison during active trips to prevent re-renders from location updates
  if (nextProps.activeTrip) {
    console.log("Skipping marker comparison during active trip to prevent re-renders");
    return true;
  }

  // Compare markers array length and position only when no active trip
  if (prevProps.markers?.length !== nextProps.markers?.length) {
    return false;
  }
  
  if (prevProps.markers?.[0]?.position?.lat !== nextProps.markers?.[0]?.position?.lat ||
      prevProps.markers?.[0]?.position?.lng !== nextProps.markers?.[0]?.position?.lng) {
    return false;
  }

  // onTripUpdate is always stable with useCallback, so no need to compare
  return true;
};

export default memo(DashboardMap, arePropsEqual);