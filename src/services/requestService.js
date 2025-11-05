import config from "../config";
import driverSocketService from "./DriverSocketService";

// Get nearby ride requests for drivers
export async function getNearbyRequests(token) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/rides/nearby-requests`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch nearby ride requests");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Accept a ride request by rideId
export async function acceptRideRequest(rideId, token) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/rides/accept/${rideId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to accept ride request");
    }

    return await response.json();
  } catch (error) {
    throw error;
    }
}

export async function setDriverAvailability(token, available) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/drivers/availability`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ available }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update availability");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function updateDriverLocation(token, coordinates) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/drivers/location`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coordinates }), // [longitude, latitude]
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update location");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function updateRideStatus(token, rideId, status) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/rides/status/${rideId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update ride status");
    }

    const result = await response.json();

    // 🚀 SOCKET INTEGRATION: Broadcast ride status update to Vaye riders
    if (driverSocketService.isSocketConnected()) {
      console.log(`🔌 Broadcasting ride status update via socket: ${rideId} -> ${status}`);
      driverSocketService.broadcastStatusUpdate(rideId, status, {
        timestamp: new Date().toISOString()
      });
    } else {
      console.warn('⚠️ Socket not connected, ride status update not broadcasted');
    }

    return result;
  } catch (error) {
    throw error;
  }
}

// Submit passenger rating by driver
export async function submitPassengerRating(token, ratingData) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/rides/rate-passenger`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ratingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to submit passenger rating");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Complete a ride using the dedicated complete endpoint
export async function completeRide(token, rideId) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/rides/complete/${rideId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to complete ride");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Cancel a ride using the dedicated cancel endpoint
export async function cancelRide(token, rideId) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/rides/cancel/${rideId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to cancel ride");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}


// export const getRideById = async (token, rideId) => {
//   const response = await fetch(`${config.apiBaseUrl}/rides/${rideId}`, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     },
//   });
  
//   if (!response.ok) {
//     throw new Error('Failed to fetch ride');
//   }
  
//   return response.json();
// };