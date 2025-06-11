import React from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import './DashboardMap.css';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 1
};

const DashboardMap = ({ center, markers }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={center}
        options={{
          styles: [/* Add custom map styles here */],
          disableDefaultUI: true,
          zoomControl: true
        }}
      >
        {markers.map((marker, idx) => (
          <Marker
            key={idx}
            position={marker.position}
            icon={marker.icon}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default DashboardMap;