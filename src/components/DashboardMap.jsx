import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { GoogleMap, useLoadScript, DirectionsRenderer } from '@react-google-maps/api';
import './DashboardMap.css';
import config from '../config';
import { updateDriverLocation, updateRideStatus } from '../services/requestService';

const LIBRARIES = ["marker"];
const DEFAULT_CENTER = { lat: -25.7479, lng: 28.2293 };
const LOCATION_UPDATE_THRESHOLD = 5; // meters
const ARRIVAL_THRESHOLD = 30; // meters
const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 5000
};

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
  position: "absolute",
  top: 0,
  left: 0,
  zIndex: 1,
};

const DashboardMap = ({ center = DEFAULT_CENTER, markers, userToken, activeTrip }) => {
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

  // Refs for cleanup and tracking
  const markerRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastSentCoords = useRef(null);
  const directionsServiceRef = useRef(null);
  const isUpdatingLocationRef = useRef(false);

  // Memoized map options with improved styling
  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    mapId: config.GoogleMapsId,
    clickableIcons: false,
    fullscreenControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    gestureHandling: 'greedy',
    zoomControlOptions: {
      position: window.google?.maps?.ControlPosition?.RIGHT_CENTER
    },
    styles: [
      {
        featureType: "poi.business",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "poi.park",
        elementType: "labels.text",
        stylers: [{ visibility: "off" }]
      }
    ]
  }), []);

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
  const updateLocationToBackend = useCallback(async (latitude, longitude) => {
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
  }, [userToken]);

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
      const shouldUpdate = !lastSentCoords.current || 
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
        [error.TIMEOUT]: "Location request timed out"
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

  // Enhanced arrival detection
  useEffect(() => {
    if (!activeTrip || !userLocation || !activeTrip.pickup?.location?.coordinates) {
      return;
    }

    const [pickupLng, pickupLat] = activeTrip.pickup.location.coordinates;
    const distanceToPickup = getDistanceMeters(
      userLocation.lat,
      userLocation.lng,
      pickupLat,
      pickupLng
    );

    // Auto-update to "arrived" status when within threshold
    if (distanceToPickup < ARRIVAL_THRESHOLD && activeTrip.status !== "arrived") {
      updateRideStatus(userToken, activeTrip._id, "arrived")
        .then(() => {
          console.log("Successfully updated ride status to arrived");
        })
        .catch((err) => {
          console.error("Failed to update ride status to arrived:", err);
        });
    }
  }, [userLocation, activeTrip, userToken, getDistanceMeters]);

  // Enhanced directions calculation
  useEffect(() => {
    if (!activeTrip || !userLocation || !window.google) {
      setDirections(null);
      return;
    }

    let destination = null;
    const { status, pickup, dropoff } = activeTrip;

    // Determine destination based on trip status
    if (status === "accepted" || status === "arrived") {
      if (pickup?.location?.coordinates) {
        const [pickupLng, pickupLat] = pickup.location.coordinates;
        destination = { lat: pickupLat, lng: pickupLng };
      }
    } else if (status === "started" || status === "in_progress") {
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
  }, [activeTrip, userLocation]);

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
          content: createMarkerElement()
        });
      } else {
        markerRef.current.position = userLocation;
      }

      // Smooth pan to user location
      map.panTo(userLocation);
    } catch (error) {
      console.error('Error updating user location marker:', error);
    }
  }, [isLoaded, map, userLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

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
                strokeColor: '#4285F4',
                strokeWeight: 6,
                strokeOpacity: 0.8,
              }
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default DashboardMap;