import io from 'socket.io-client';
import config from '../config';

class DriverSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
    this.userToken = null;
    this.locationUpdateInterval = null;
    this.lastKnownLocation = null;
    
    // Bind methods to preserve context
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.startLocationBroadcasting = this.startLocationBroadcasting.bind(this);
    this.stopLocationBroadcasting = this.stopLocationBroadcasting.bind(this);
    this.broadcastLocationUpdate = this.broadcastLocationUpdate.bind(this);
    this.broadcastStatusUpdate = this.broadcastStatusUpdate.bind(this);
    this.broadcastDeliveryStatusUpdate = this.broadcastDeliveryStatusUpdate.bind(this);
  }

  /**
   * Connect to VayeBack Socket.io server with authentication
   */
  connect(userId, userToken) {
    if (this.isConnected && this.socket) {
      console.log('🔌 Already connected to socket server');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        console.log('🔌 Connecting driver to VayeBack socket server...', {
          userId,
          hasToken: !!userToken,
          socketUrl: config.apiBaseUrl
        });

        this.userId = userId;
        this.userToken = userToken;

        // Connect to VayeBack server
        this.socket = io(config.apiBaseUrl, {
          auth: {
            token: userToken,
            userId: userId,
            userType: 'driver' // Important: Identify as driver
          },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000
        });

        // Connection success
        this.socket.on('connect', () => {
          console.log('✅ Driver connected to VayeBack socket server', {
            socketId: this.socket.id,
            userId: this.userId
          });
          
          this.isConnected = true;
          
          // Join driver room for receiving dispatch notifications
          this.socket.emit('joinDriverRoom', {
            driverId: this.userId,
            userType: 'driver'
          });
          
          resolve();
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
          console.error('❌ Driver socket connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        // Disconnection
        this.socket.on('disconnect', (reason) => {
          console.log('📴 Driver disconnected from socket server:', reason);
          this.isConnected = false;
          this.stopLocationBroadcasting();
        });

        // Listen for ride/delivery assignment notifications
        this.socket.on('newRideAssignment', (data) => {
          console.log('🚗 New ride assignment received:', data);
          // This could trigger UI updates in the driver app
        });

        this.socket.on('newDeliveryAssignment', (data) => {
          console.log('🚚 New delivery assignment received:', data);
          // This could trigger UI updates in the driver app
        });

        // Reconnection events
        this.socket.on('reconnect', (attemptNumber) => {
          console.log('🔄 Driver socket reconnected after', attemptNumber, 'attempts');
          this.isConnected = true;
          
          // Re-join driver room
          this.socket.emit('joinDriverRoom', {
            driverId: this.userId,
            userType: 'driver'
          });
        });

      } catch (error) {
        console.error('❌ Error creating driver socket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    console.log('📴 Disconnecting driver from socket server...');
    
    this.stopLocationBroadcasting();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.userId = null;
    this.userToken = null;
  }

  /**
   * Start broadcasting driver location updates every 5 seconds
   */
  startLocationBroadcasting() {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Cannot start location broadcasting: Not connected to socket server');
      return;
    }

    if (this.locationUpdateInterval) {
      console.log('📍 Location broadcasting already active');
      return;
    }

    console.log('📍 Starting driver location broadcasting...');
    
    // Get initial location and start broadcasting
    this.getCurrentLocationAndBroadcast();
    
    // Set up interval for continuous updates
    this.locationUpdateInterval = setInterval(() => {
      this.getCurrentLocationAndBroadcast();
    }, 5000); // Every 5 seconds
  }

  /**
   * Stop broadcasting location updates
   */
  stopLocationBroadcasting() {
    if (this.locationUpdateInterval) {
      console.log('📍 Stopping driver location broadcasting');
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }
  }

  /**
   * Get current location and broadcast to server
   */
  getCurrentLocationAndBroadcast() {
    if (!navigator.geolocation) {
      console.warn('⚠️ Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
          speed: position.coords.speed || 0,
          heading: position.coords.heading || 0
        };

        // Only broadcast if location has changed significantly (>10 meters)
        if (this.shouldBroadcastLocation(locationData)) {
          this.broadcastLocationUpdate(locationData);
          this.lastKnownLocation = locationData;
        }
      },
      (error) => {
        console.error('❌ Error getting driver location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }

  /**
   * Check if location has changed enough to warrant broadcasting
   */
  shouldBroadcastLocation(newLocation) {
    if (!this.lastKnownLocation) return true;

    // Calculate distance between locations (simple approximation)
    const lat1 = this.lastKnownLocation.latitude;
    const lon1 = this.lastKnownLocation.longitude;
    const lat2 = newLocation.latitude;
    const lon2 = newLocation.longitude;

    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distance = R * c; // Distance in meters

    // Broadcast if moved more than 10 meters
    return distance > 10;
  }

  /**
   * Broadcast driver location update to VayeBack
   */
  broadcastLocationUpdate(locationData) {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Cannot broadcast location: Not connected');
      return;
    }

    const locationUpdate = {
      driverId: this.userId,
      location: locationData,
      timestamp: new Date().toISOString(),
      userType: 'driver'
    };

    console.log('📍 Broadcasting driver location update:', {
      driverId: this.userId,
      lat: locationData.latitude,
      lng: locationData.longitude,
      accuracy: locationData.accuracy
    });

    this.socket.emit('driver-location-update', locationUpdate);
  }

  /**
   * Broadcast ride status update (accepted, arrived, started, completed)
   */
  broadcastStatusUpdate(rideId, status, additionalData = {}) {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Cannot broadcast status: Not connected');
      return;
    }

    const statusUpdate = {
      rideId,
      driverId: this.userId,
      status,
      timestamp: new Date().toISOString(),
      location: this.lastKnownLocation,
      ...additionalData
    };

    console.log('🚗 Broadcasting ride status update:', {
      rideId,
      status,
      driverId: this.userId
    });

    this.socket.emit('ride-status-update', statusUpdate);
  }

  /**
   * Broadcast delivery status update (picked up, in transit, delivered)
   */
  broadcastDeliveryStatusUpdate(deliveryId, status, additionalData = {}) {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Cannot broadcast delivery status: Not connected');
      return;
    }

    const statusUpdate = {
      deliveryId,
      driverId: this.userId,
      status,
      timestamp: new Date().toISOString(),
      location: this.lastKnownLocation,
      platform: 'vaye', // Important: Specify platform for proper routing
      ...additionalData
    };

    console.log('🚚 Broadcasting delivery status update:', {
      deliveryId,
      status,
      driverId: this.userId,
      platform: 'vaye'
    });

    this.socket.emit('delivery-status-update', statusUpdate);
  }

  /**
   * Broadcast when driver goes online/offline
   */
  broadcastDriverAvailability(isOnline, userType = 'driver') {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Cannot broadcast availability: Not connected');
      return;
    }

    const availabilityUpdate = {
      driverId: this.userId,
      isOnline,
      userType,
      timestamp: new Date().toISOString(),
      location: this.lastKnownLocation
    };

    console.log(`🚦 Broadcasting driver availability: ${isOnline ? 'ONLINE' : 'OFFLINE'}`, {
      driverId: this.userId,
      userType
    });

    this.socket.emit('driver-availability-update', availabilityUpdate);

    // Start/stop location broadcasting based on online status
    if (isOnline) {
      this.startLocationBroadcasting();
    } else {
      this.stopLocationBroadcasting();
    }
  }

  /**
   * Check if socket is connected
   */
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  /**
   * Get current socket ID
   */
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }
}

// Create and export singleton instance
const driverSocketService = new DriverSocketService();
export default driverSocketService;