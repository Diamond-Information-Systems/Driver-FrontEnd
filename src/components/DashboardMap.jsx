import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
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
} from "../services/requestService";

const LIBRARIES = ["marker"];
const DEFAULT_CENTER = { lat: -25.7479, lng: 28.2293 };
const LOCATION_UPDATE_THRESHOLD = 5; // meters
const ARRIVAL_THRESHOLD = 5; // meters
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
  const [rideStatus, setRideStatus] = useState(null);

  // New state for ride completion logic
  const [showStartRidePopup, setShowStartRidePopup] = useState(false);
  const [showCompleteRidePopup, setShowCompleteRidePopup] = useState(false);
  const [isUpdatingRideStatus, setIsUpdatingRideStatus] = useState(false);

  // Refs for cleanup and tracking
  const markerRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastSentCoords = useRef(null);
  const directionsServiceRef = useRef(null);
  const isUpdatingLocationRef = useRef(false);
  const hasShownStartPopup = useRef(false);
  const hasShownCompletePopup = useRef(false);
  const previousTripStatus = useRef(null); // Track previous status for navigation

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

  // Enhanced location update function
  const updateLocationToBackend = useCallback(
    async (latitude, longitude) => {
      if (!userToken || isUpdatingLocationRef.current) return;
      isUpdatingLocationRef.current = true;
      try {
        await updateDriverLocation(userToken, [longitude, latitude]);
        lastSentCoords.current = { lat: latitude, lng: longitude };
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
      setRideStatus("started");
      activeTrip.status = "started"; // Update local trip status
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
      await updateRideStatus(userToken, activeTrip._id, "completed");
      setShowCompleteRidePopup(false);
      hasShownCompletePopup.current = true;
      console.log("Ride completed successfully");
    } catch (err) {
      console.error("Failed to complete ride:", err);
      setLocationError("Failed to complete ride");
    } finally {
      setIsUpdatingRideStatus(false);
    }
  }, [activeTrip, userToken, isUpdatingRideStatus]);

  // NEW: Navigate to dropoff when trip is started
  useEffect(() => {
    if (!map || !activeTrip || !window.google) return;

    // Check if rideStatus just changed to "started"
    if (rideStatus === "started" && previousTripStatus.current !== "started") {
      console.log("Trip status changed to 'started', navigating to dropoff location");
      
      if (activeTrip.dropoff?.location?.coordinates) {
        const [dropoffLng, dropoffLat] = activeTrip.dropoff.location.coordinates;
        const dropoffLocation = { lat: dropoffLat, lng: dropoffLng };

        // If we have user location, fit bounds to show both user and dropoff
        if (userLocation) {
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(userLocation);
          bounds.extend(dropoffLocation);
          
          // Add some padding and fit the bounds
          map.fitBounds(bounds, {
            top: 100,
            right: 50,
            bottom: 100,
            left: 50,
          });
          
          console.log("Map bounds adjusted to show route from current location to dropoff");
        } else {
          // If no user location, just pan to dropoff
          map.panTo(dropoffLocation);
          map.setZoom(16);
          console.log("Map panned to dropoff location");
        }
      }
    }

    // Update previous status for next comparison
    previousTripStatus.current = rideStatus;
  }, [map, activeTrip, userLocation, rideStatus]);

  // Enhanced geolocation tracking
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported");
      setIsLocationLoading(false);
      return;
    }

    const handleLocationSuccess = async (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const newLocation = { lat: latitude, lng: longitude };
      setUserLocation(newLocation);
      setLocationError(null);
      setIsLocationLoading(false);

      // Update backend on first load or if moved significantly
      const shouldUpdate =
        !lastSentCoords.current ||
        getDistanceMeters(
          lastSentCoords.current.lat,
          lastSentCoords.current.lng,
          latitude,
          longitude
        ) > LOCATION_UPDATE_THRESHOLD;

      if (shouldUpdate) {
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

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleLocationSuccess,
      handleLocationError,
      GEOLOCATION_OPTIONS
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [getDistanceMeters, updateLocationToBackend]);

  // Force popup test - TEMPORARY for testing
  useEffect(() => {
    if (!activeTrip) return;

    // Force show start popup when status is "arrived" and not already shown
    if (activeTrip.status === "arrived" && !hasShownStartPopup.current) {
      console.log("Forcing start popup to show for status:", activeTrip.status);
      setShowStartRidePopup(true);
    }

    // Force show complete popup when status is "started" or "in_progress" and not already shown
    // if (
    //   (activeTrip.status === "started" ||
    //     activeTrip.status === "in_progress") &&
    //   !hasShownCompletePopup.current
    // ) {
    //   console.log(
    //     "Forcing complete popup to show for status:",
    //     activeTrip.status
    //   );
    //   setShowCompleteRidePopup(true);
    // }
  }, [activeTrip?.status]);

  // Enhanced arrival detection and popup management with DEBUG
  useEffect(() => {
    console.log("=== POPUP DEBUG ===");
    console.log("activeTrip:", activeTrip);
    console.log("activeTrip.status:", activeTrip?.status);
    console.log("userLocation:", userLocation);
    console.log("showStartRidePopup:", showStartRidePopup);
    console.log("showCompleteRidePopup:", showCompleteRidePopup);
    console.log("hasShownStartPopup.current:", hasShownStartPopup.current);
    console.log("hasShownCompletePopup.current:", hasShownCompletePopup.current);

    if (!activeTrip || !userLocation) {
      console.log("Missing activeTrip or userLocation");
      return;
    }

    // Debug start ride popup conditions
    if (activeTrip.status === "arrived") {
      console.log("Status is arrived - checking start popup conditions");
      console.log("hasShownStartPopup.current:", hasShownStartPopup.current);
      console.log("pickup coordinates:", activeTrip.pickup?.location?.coordinates);
      if (activeTrip.pickup?.location?.coordinates) {
        const [pickupLng, pickupLat] = activeTrip.pickup.location.coordinates;
        const distanceToPickup = getDistanceMeters(
          userLocation.lat,
          userLocation.lng,
          pickupLat,
          pickupLng
        );
        console.log("Distance to pickup:", distanceToPickup, "meters");
        console.log(
          "Should show start popup:",
          !hasShownStartPopup.current && distanceToPickup < ARRIVAL_THRESHOLD
        );
      }
    }

    // Debug complete ride popup conditions
    if (
      activeTrip.status === "started" ||
      activeTrip.status === "in_progress"
    ) {
      console.log(
        "Status is started/in_progress - checking complete popup conditions"
      );
      console.log("hasShownCompletePopup.current:", hasShownCompletePopup.current);
      console.log("dropoff coordinates:", activeTrip.dropoff?.location?.coordinates);
      if (activeTrip.dropoff?.location?.coordinates) {
        const [dropoffLng, dropoffLat] = activeTrip.dropoff.location.coordinates;
        const distanceToDropoff = getDistanceMeters(
          userLocation.lat,
          userLocation.lng,
          dropoffLat,
          dropoffLng
        );
        console.log("Distance to dropoff:", distanceToDropoff, "meters");
        console.log(
          "Should show complete popup:",
          !hasShownCompletePopup.current &&
            distanceToDropoff < ARRIVAL_THRESHOLD
        );
      }
    }

    // Handle pickup location arrival (show start ride popup)
    if (
      activeTrip.status === "arrived" &&
      !hasShownStartPopup.current &&
      activeTrip.pickup?.location?.coordinates
    ) {
      const [pickupLng, pickupLat] = activeTrip.pickup.location.coordinates;
      const distanceToPickup = getDistanceMeters(
        userLocation.lat,
        userLocation.lng,
        pickupLat,
        pickupLng
      );

      if (distanceToPickup < ARRIVAL_THRESHOLD) {
        setShowStartRidePopup(true);
      }
    }

    // Handle dropoff location arrival (show complete ride popup)
    if (
      (activeTrip.status === "started" ||
        activeTrip.status === "in_progress") &&
      !hasShownCompletePopup.current &&
      activeTrip.dropoff?.location?.coordinates
    ) {
      const [dropoffLng, dropoffLat] = activeTrip.dropoff.location.coordinates;
      const distanceToDropoff = getDistanceMeters(
        userLocation.lat,
        userLocation.lng,
        dropoffLat,
        dropoffLng
      );

      if (distanceToDropoff < ARRIVAL_THRESHOLD) {
        setShowCompleteRidePopup(true);
      }
    }

    // Auto-update to "arrived" status when within threshold (existing logic)
    if (
      activeTrip.status === "accepted" &&
      activeTrip.pickup?.location?.coordinates
    ) {
      const [pickupLng, pickupLat] = activeTrip.pickup.location.coordinates;
      const distanceToPickup = getDistanceMeters(
        userLocation.lat,
        userLocation.lng,
        pickupLat,
        pickupLng
      );

      if (distanceToPickup < ARRIVAL_THRESHOLD) {
        updateRideStatus(userToken, activeTrip._id, "arrived")
          .then(() => {
            console.log("Successfully updated ride status to arrived");
          })
          .catch((err) => {
            console.error("Failed to update ride status to arrived:", err);
          });
      }
    }
  }, [userLocation, activeTrip, userToken, getDistanceMeters]);

  // Reset popup flags when trip changes
  useEffect(() => {
    console.log("Trip ID changed, resetting popup flags. New trip ID:", activeTrip?._id);
    hasShownStartPopup.current = false;
    hasShownCompletePopup.current = false;
    setShowStartRidePopup(false);
    setShowCompleteRidePopup(false);
    setRideStatus(null); // Reset ride status
    previousTripStatus.current = null; // Reset status tracking
  }, [activeTrip?._id]);

  // Simple popup trigger based on status - BACKUP mechanism
  useEffect(() => {
    if (!activeTrip) return;
    console.log("Status check - Current status:", activeTrip.status);

    // Show start popup for "arrived" status
    if (activeTrip.status === "arrived" && !showStartRidePopup && !hasShownStartPopup.current) {
      console.log("BACKUP: Showing start popup for arrived status");
      setShowStartRidePopup(true);
    }

    // Show complete popup for "started" or "in_progress" status
    if ((activeTrip.status === "started" || activeTrip.status === "in_progress") &&
        !showCompleteRidePopup && !hasShownCompletePopup.current) {
      console.log("BACKUP: Showing complete popup for started/in_progress status");
      setShowCompleteRidePopup(true);
    }
  }, [activeTrip?.status, showStartRidePopup, showCompleteRidePopup]);

  // Enhanced directions calculation
  useEffect(() => {
    if (!activeTrip || !userLocation || !window.google) {
      setDirections(null);
      return;
    }

    let destination = null;
    const { status, pickup, dropoff } = activeTrip;
    // Use local rideStatus if available, otherwise fall back to activeTrip.status
    const currentStatus = rideStatus || status;

    // Determine destination based on trip status
    if (currentStatus === "accepted" || currentStatus === "arrived") {
      if (pickup?.location?.coordinates) {
        const [pickupLng, pickupLat] = pickup.location.coordinates;
        destination = { lat: pickupLat, lng: pickupLng };
      }
    } else if (currentStatus === "started" || currentStatus === "in_progress") {
      if (dropoff?.location?.coordinates) {
        const [dropoffLng, dropoffLat] = dropoff.location.coordinates;
        destination = { lat: dropoffLat, lng: dropoffLng };
      }
    }

    if (!destination) {
      setDirections(null);
      return;
    }

    // Initialize directions service if needed
    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
    }

    directionsServiceRef.current.route(
      {
        origin: userLocation,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.warn("Directions request failed:", status);
          setDirections(null);
        }
      }
    );
  }, [activeTrip, userLocation, rideStatus]);

  // Enhanced user location marker
  useEffect(() => {
    if (!isLoaded || !map || !userLocation || !window.google) return;

    try {
      const { AdvancedMarkerElement } = window.google.maps.marker;

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

      if (!markerRef.current) {
        markerRef.current = new AdvancedMarkerElement({
          position: userLocation,
          map: map,
          title: "Your location",
          content: createMarkerElement(),
        });
      } else {
        markerRef.current.position = userLocation;
      }

      // Only pan to user location if trip is not started (to avoid interfering with dropoff navigation)
      const currentStatus = rideStatus || activeTrip?.status;
      if (!activeTrip || currentStatus !== "started") {
        map.panTo(userLocation);
      }
    } catch (error) {
      console.error("Error updating user location marker:", error);
    }
  }, [isLoaded, map, userLocation, activeTrip?.status, rideStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  // Slider component for ride actions
  const SlideToConfirm = ({
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
  };

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
      {/* DEBUG: Manual popup triggers - REMOVE IN PRODUCTION */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10000,
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div>Status: {activeTrip?.status || 'No active trip'}</div>
        <div>Start Popup: {showStartRidePopup ? 'YES' : 'NO'}</div>
        <div>Complete Popup: {showCompleteRidePopup ? 'YES' : 'NO'}</div>
        <button
          onClick={() => setShowStartRidePopup(true)}
          style={{ margin: '5px', padding: '5px 10px' }}
        >
          Force Start Popup
        </button>
        <button
          onClick={() => setShowCompleteRidePopup(true)}
          style={{ margin: '5px', padding: '5px 10px' }}
        >
          Force Complete Popup
        </button>
      </div>

      {/* Location status indicator */}
      {isLocationLoading && (
        <div className="location-status loading">
          <div className="status-dot"></div>
          <span>Getting your location...</span>
        </div>
      )}

      {locationError && (
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

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={16}
        center={userLocation || center}
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

export default DashboardMap;