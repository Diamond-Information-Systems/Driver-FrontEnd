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

  // New state for ride completion logic
  const [showStartRidePopup, setShowStartRidePopup] = useState(false);
  const [showCompleteRidePopup, setShowCompleteRidePopup] = useState(false);
  const [showCancelRidePopup, setShowCancelRidePopup] = useState(false);
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
  const previousTripStatus = useRef(null); // Track previous status for navigation
  const previousActiveTrip = useRef(null);

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
  }, [currentTripStatus, pickupCoords, dropoffCoords, activeTrip]);

  // Memoized map center to prevent unnecessary re-renders
  const mapCenter = useMemo(() => {
    return userLocation || center;
  }, [userLocation, center]);

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

  // Initialize local trip status when activeTrip changes
  useEffect(() => {
    if (activeTrip?.status) {
      setCurrentTripStatus(activeTrip.status);
      console.log("Initialized local trip status:", activeTrip.status);
    }
  }, [activeTrip?.status]);

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
    
    // Update backend with simulated location (no automatic map panning)
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
    
    // Update backend with simulated location (no automatic map panning)
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
  }, [userToken, onTripUpdate, completedTrip]);

  // Handle trip summary close
  const handleTripSummaryClose = useCallback(() => {
    setShowTripSummary(false);
    setCompletedTrip(null);
    
    // Now notify parent component that trip is completed (after summary is closed)
    if (onTripUpdate && completedTrip) {
      onTripUpdate({ ...completedTrip, status: 'completed' });
    }
  }, [onTripUpdate, completedTrip]);

  // Auto-fit map bounds to show full route when trip becomes active
  useEffect(() => {
    if (!map || !activeTrip || !window.google || !userLocation) return;

    // Show full route when trip has a destination and directions are available
    if (directions && (currentTripStatus === "accepted" || currentTripStatus === "arrived" || currentTripStatus === "started")) {
      // Only auto-fit once per status change to avoid constant re-fitting
      if (previousTripStatus.current !== currentTripStatus) {
        const bounds = new window.google.maps.LatLngBounds();
        
        // Add user location to bounds
        bounds.extend(userLocation);
        
        // Add pickup location to bounds
        if (pickupCoords) {
          bounds.extend(pickupCoords);
        }
        
        // Add dropoff location to bounds if trip is started
        if (dropoffCoords && (currentTripStatus === "started" || currentTripStatus === "in_progress")) {
          bounds.extend(dropoffCoords);
        }
        
        // Fit the map to show all relevant points with padding for UI elements
        map.fitBounds(bounds, {
          top: 120,    // Space for navigation panel
          bottom: 250, // Space for drawer
          left: 80,    // Space for simulation controls
          right: 80    // Space for map controls
        });
        
        console.log("Map bounds auto-fitted ONCE for status change:", previousTripStatus.current, "→", currentTripStatus);
        
        // Update previous status immediately to prevent refitting
        previousTripStatus.current = currentTripStatus;
      } else {
        console.log("Skipping auto-fit - status unchanged:", currentTripStatus);
      }
    }
  }, [map, activeTrip, currentTripStatus, directions, userLocation, pickupCoords, dropoffCoords]);

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
      
      // Only update state if location changed significantly
      const shouldUpdateState = !userLocation || 
        getDistanceMeters(userLocation.lat, userLocation.lng, latitude, longitude) > 5; // 5 meter threshold
      
      if (shouldUpdateState) {
        setUserLocation(newLocation);
        setLocationError(null);
        setIsLocationLoading(false);
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
  }, [getDistanceMeters, updateLocationToBackend, isSimulationMode]);

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

    // Auto-update to "arrived" status when within threshold
    if (
      currentTripStatus === "accepted" &&
      pickupCoords &&
      distanceToPickup < ARRIVAL_THRESHOLD
    ) {
      updateRideStatus(userToken, activeTrip._id, "arrived")
        .then(() => {
          setCurrentTripStatus("arrived");
          console.log("Auto-updated ride status to arrived - distance:", distanceToPickup);
        })
        .catch((err) => {
          console.error("Failed to auto-update ride status to arrived:", err);
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
      
      hasShownStartPopup.current = false;
      hasShownCompletePopup.current = false;
      setShowStartRidePopup(false);
      setShowCompleteRidePopup(false);
      setShowCancelRidePopup(false);
      setCurrentTripStatus(activeTrip?.status || null);
      previousTripStatus.current = null;
      setIsSimulationMode(false);
      setShowTripSummary(false);
      setCompletedTrip(null);
      
      // Update the previous trip reference
      previousActiveTrip.current = activeTrip;
    }
  }, [activeTripId, activeTrip?.status]); // Only depend on ID and status

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
  }, [activeTripId, userLocation, currentDestination]); // Use optimized dependencies

  // Optimized user location marker effect
  useEffect(() => {
    if (!isLoaded || !map || !userLocation || !window.google) return;

    try {
      const { AdvancedMarkerElement } = window.google.maps.marker;

      // Only create new marker element if marker doesn't exist
      if (!markerRef.current) {
        const createMarkerElement = () => {
          const element = document.createElement("div");
          element.className = "user-location-marker";
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
        
        // Only pan to user location on initial marker creation AND only if no active trip
        if (!activeTripId) {
          map.panTo(userLocation);
          console.log("Initial pan to user location (no active trip)");
        } else {
          console.log("Skipping initial pan - active trip exists");
        }
        
        console.log("Created new user location marker");
      } else {
        // Just update the marker position without any panning
        markerRef.current.position = userLocation;
        console.log("Updated marker position without panning");
      }
    } catch (error) {
      console.error("Error updating user location marker:", error);
    }
  }, [isLoaded, map, userLocation, activeTripId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  // Memoized Slider component for ride actions
  const SlideToConfirm = memo(({
    onConfirm,
    text,
    confirmText,
    bgColor = "#4CAF50",
    disabled = false,
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
      if (newPosition >= maxPosition * 0.8) {
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

    return (
      <div
        ref={containerRef}
        className="slide-to-confirm"
        style={{
          position: "relative",
          height: "60px",
          backgroundColor: "#f0f0f0",
          borderRadius: "30px",
          overflow: "hidden",
          userSelect: "none",
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        <div
          className="slide-background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${
              (position / (containerRef.current?.clientWidth - 60 || 1)) * 100
            }%`,
            backgroundColor: bgColor,
            borderRadius: "30px",
            transition: isDragging ? "none" : "width 0.2s ease",
          }}
        />
        <div
          ref={sliderRef}
          className="slide-handle"
          style={{
            position: "absolute",
            top: "5px",
            left: `${5 + position}px`,
            width: "50px",
            height: "50px",
            backgroundColor: "white",
            borderRadius: "25px",
            cursor: disabled ? "not-allowed" : "grab",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            transition: isDragging ? "none" : "left 0.2s ease",
          }}
          onMouseDown={(e) => handleStart(e.clientX)}
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX)}
          onTouchEnd={handleEnd}
        >
          →
        </div>
        <div
          className="slide-text"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "16px",
            fontWeight: "bold",
            color: position > 50 ? "white" : "#666",
            transition: "color 0.2s ease",
            pointerEvents: "none",
          }}
        >
          {position > 100 ? confirmText : text}
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
          <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            🎮 Simulation
          </div>
          <div style={{ fontSize: '10px', marginBottom: '3px', color: '#666' }}>
            Status: <span style={{ fontWeight: '500', color: '#333' }}>{currentTripStatus || 'Unknown'}</span>
          </div>
          <div style={{ 
            fontSize: '10px', 
            marginBottom: '8px',
            color: isSimulationMode ? '#ff6b35' : '#4CAF50',
            fontWeight: '500'
          }}>
            {isSimulationMode ? '🎮 Simulation' : '📍 Real GPS'}
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
                🚗 Drive to Pickup
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
                🎯 Drive to Dropoff
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
                ❌ Cancel Ride
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

      {/* Start Ride Popup */}
      {showStartRidePopup && (
        <div className="ride-action-popup" style={{ zIndex: 9999 }}>
          <div className="popup-content">
            <h3>Passenger Picked Up?</h3>
            <p>
              Slide to confirm the passenger is in your vehicle and start the
              trip.
            </p>
            <SlideToConfirm
              onConfirm={handleStartRide}
              text="Slide to Start Trip"
              confirmText="Starting..."
              bgColor="#4CAF50"
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

      {/* Complete Ride Popup */}
      {showCompleteRidePopup && (
        <div className="ride-action-popup" style={{ zIndex: 9999 }}>
          <div className="popup-content">
            <h3>Trip Complete?</h3>
            <p>Slide to confirm the passenger has been dropped off safely.</p>
            <SlideToConfirm
              onConfirm={handleCompleteRide}
              text="Slide to Complete Trip"
              confirmText="Completing..."
              bgColor="#2196F3"
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

      {/* Cancel Ride Popup */}
      {showCancelRidePopup && (
        <div className="ride-action-popup" style={{ zIndex: 9999 }}>
          <div className="popup-content">
            <h3>Cancel This Ride?</h3>
            <p>
              This will cancel the ride and make you available for new requests. 
              The passenger will be notified.
            </p>
            <SlideToConfirm
              onConfirm={handleCancelRide}
              text="Slide to Cancel Ride"
              confirmText="Cancelling..."
              bgColor="#dc3545"
              disabled={isUpdatingRideStatus}
            />
            <button
              className="popup-cancel"
              onClick={() => setShowCancelRidePopup(false)}
              disabled={isUpdatingRideStatus}
            >
              Keep Ride
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
                strokeColor: "#4285F4",
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
  // Compare primitive values
  if (
    prevProps.userToken !== nextProps.userToken ||
    prevProps.center !== nextProps.center
  ) {
    return false;
  }

  // Compare activeTrip by ID and status (most common changes)
  const prevTrip = prevProps.activeTrip;
  const nextTrip = nextProps.activeTrip;
  
  if (prevTrip?._id !== nextTrip?._id || prevTrip?.status !== nextTrip?.status) {
    return false;
  }

  // Compare markers array length and position
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