import React, { useState, useEffect } from 'react';
import RideRequest from '../RideRequest';
import NotificationService from '../../services/NotificationService';

const RideRequestHandler = ({ isOnline, notificationsEnabled }) => {
  const [activeRideRequest, setActiveRideRequest] = useState(null);
  const [requestTimeRemaining, setRequestTimeRemaining] = useState(15);

  // Simulate ride requests when online
  useEffect(() => {
    let requestTimer;
    let initialDelay;

    if (isOnline) {
      console.log('Driver went online - starting ride request generation');
      
      // Generate first request after 10 seconds of going online
      initialDelay = setTimeout(() => {
        if (isOnline && !activeRideRequest) {
          generateRideRequest();
        }
      }, 10000);

      // Then generate requests every 20-25 seconds
      requestTimer = setInterval(() => {
        if (isOnline && !activeRideRequest) { // Only generate if online and no active request
          const nextRequestTime = Math.floor(Math.random() * 5000) + 20000; // 20-25 seconds
          setTimeout(() => {
            if (isOnline && !activeRideRequest) { // Double check before generating
              generateRideRequest();
            }
          }, nextRequestTime);
        }
      }, 25000); // Check every 25 seconds
    }

    return () => {
      if (initialDelay) clearTimeout(initialDelay);
      if (requestTimer) clearInterval(requestTimer);
      console.log('Ride request generation stopped');
    };
  }, [isOnline]);

  const generateRideRequest = () => {
    // Only generate if actually online
    if (!isOnline) {
      console.log('Attempted to generate request while offline - skipping');
      return;
    }

    console.log('Generating new ride request...');
    // 30% chance of generating a carpool request
    const isCarpool = Math.random() < 0.3;

    // South African and Zimbabwean names
    const names = [
      'Thabo Mthembu', 'Nomsa Dlamini', 'Tendai Moyo', 'Sipho Nkomo', 
      'Chipo Ndebele', 'Lerato Molefe', 'Tinashe Chikwanha', 'Precious Sibanda',
      'Mandla Zwane', 'Nokuthula Mahlangu', 'Blessing Mukamuri', 'Zanele Khumalo'
    ];

    // South African locations
    const locations = [
      'Sandton City Mall', 'OR Tambo International Airport', 'Rosebank Mall',
      'Melville', 'Johannesburg Central', 'Sandton CBD', 'Eastgate Shopping Centre',
      'Bedfordview', 'Fourways Mall', 'Randburg', 'Menlyn Park Shopping Centre',
      'Brooklyn Mall', 'Canal Walk', 'V&A Waterfront', 'Greenstone Mall',
      'Hyde Park Corner', 'Cresta Shopping Centre', 'Northgate Mall'
    ];

    const getRandomName = () => names[Math.floor(Math.random() * names.length)];
    const getRandomLocation = () => locations[Math.floor(Math.random() * locations.length)];

    if (isCarpool) {
      const passenger1 = getRandomName();
      const passenger2 = getRandomName();
      
      const mockCarpoolRequest = {
        isCarpool: true,
        passengers: [
          { id: 1, name: passenger1, rating: (Math.random() * 1.5 + 3.5).toFixed(1) },
          { id: 2, name: passenger2, rating: (Math.random() * 1.5 + 3.5).toFixed(1) }
        ],
        stops: [
          { 
            passengerName: passenger1,
            location: getRandomLocation(),
            estimatedPrice: Math.floor(Math.random() * 15) + 10
          },
          {
            passengerName: passenger2,
            location: getRandomLocation(),
            estimatedPrice: Math.floor(Math.random() * 12) + 8
          },
          {
            passengerName: passenger1,
            location: getRandomLocation(),
            estimatedPrice: null
          },
          {
            passengerName: passenger2,
            location: getRandomLocation(),
            estimatedPrice: null
          }
        ],
        estimatedPrice: Math.floor(Math.random() * 40) + 25,
        estimatedTotalDistance: (Math.random() * 15).toFixed(1),
        estimatedTotalDuration: Math.floor(Math.random() * 45) + 20
      };

      // Show notification for carpool request - only if online and notifications enabled
      if (isOnline && notificationsEnabled) {
        NotificationService.showRideRequestNotification(mockCarpoolRequest);
      }
      setActiveRideRequest(mockCarpoolRequest);
      console.log('Generated CARPOOL request:', mockCarpoolRequest);

    } else {
      const passengerName = getRandomName();
      
      const mockSingleRequest = {
        isCarpool: false,
        passengers: [{
          id: 1,
          name: passengerName,
          phoneNumber: `071${Math.floor(Math.random() * 1000000).toString().padStart(7, '0')}`,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1)
        }],
        stops: [
          {
            passengerName: passengerName,
            location: getRandomLocation(),
            estimatedPrice: null
          },
          {
            passengerName: passengerName,
            location: getRandomLocation(),
            estimatedPrice: null
          }
        ],
        estimatedPrice: Math.floor(Math.random() * 30) + 15,
        estimatedTotalDistance: (Math.random() * 10).toFixed(1),
        estimatedTotalDuration: Math.floor(Math.random() * 30) + 10
      };

      // Show notification for single request - only if online and notifications enabled
      if (isOnline && notificationsEnabled) {
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
    console.log('Ride accepted!');
  };

  const handleDeclineRide = () => {
    setActiveRideRequest(null);
    console.log('Ride declined!');
  };

  // Countdown timer for request
  useEffect(() => {
    let timer;
    if (activeRideRequest && requestTimeRemaining > 0) {
      timer = setInterval(() => {
        setRequestTimeRemaining(prev => {
          if (prev <= 1) {
            setActiveRideRequest(null); // Auto-decline when time runs out
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [activeRideRequest, requestTimeRemaining]);

  return (
    <>
      {activeRideRequest && (
        <RideRequest
          request={activeRideRequest}
          onAccept={handleAcceptRide}
          onDecline={handleDeclineRide}
          timeRemaining={requestTimeRemaining}
        />
      )}
    </>
  );
};

export default RideRequestHandler;