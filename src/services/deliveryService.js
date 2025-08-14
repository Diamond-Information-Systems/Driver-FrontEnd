import config from "../config";

// Get available delivery jobs (unassigned deliveries) for delivery personnel
export async function getAvailableDeliveryJobs(token, latitude = null, longitude = null) {
  try {
    let url = `${config.apiBaseUrl}/api/deliveries/available-jobs`;
    
    if (latitude && longitude) {
      url += `?latitude=${latitude}&longitude=${longitude}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch available delivery jobs");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Accept an available delivery job by deliveryId
export async function acceptDeliveryJob(deliveryId, token) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/deliveries/accept-job/${deliveryId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to accept delivery job");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Get nearby delivery requests for delivery personnel (legacy - for real-time assigned deliveries)
export async function getNearbyDeliveries(token) {
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
      throw new Error(error.message || "Failed to fetch nearby delivery requests");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Accept a delivery request by deliveryId (legacy - for real-time assigned deliveries)
export async function acceptDeliveryRequest(deliveryId, token) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/rides/accept/${deliveryId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to accept delivery request");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Get delivery person's current route and active deliveries
export async function getMyDeliveryRoute(token) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/deliveries/my-route`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch delivery route");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Update delivery status
export async function updateDeliveryStatus(deliveryId, status, pin = null, token) {
  try {
    // If PIN is provided, use the confirm delivery endpoint
    if (pin && status === 'completed') {
      return await confirmDelivery(deliveryId, pin, token);
    }
    
    // Otherwise use the regular status update endpoint
    const response = await fetch(`${config.apiBaseUrl}/api/deliveries/update-status/${deliveryId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update delivery status");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Confirm delivery with PIN
export async function confirmDelivery(deliveryId, deliveryPin, token) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/deliveries/confirm-delivery/${deliveryId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deliveryPin }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to confirm delivery");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Get delivery status by order ID (for tracking)
export async function getDeliveryStatus(orderId, token) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/deliveries/status/${orderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch delivery status");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Set delivery personnel availability
export async function setDeliveryAvailability(token, available) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/drivers/availability`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isAvailable: available }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update delivery availability");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}
