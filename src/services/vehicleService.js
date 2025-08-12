// vehicleService.js - Vehicle management API service
import config from "../config";

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

// Vehicle API functions
export const vehicleService = {
  // Get all vehicles for the current driver
  async getVehicles(token) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      
      const response = await fetch(`${config.apiBaseUrl}/api/vehicles`, {
        method: 'GET',
        headers,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  },

  // Get a specific vehicle by ID
  async getVehicle(vehicleId, token) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      
      const response = await fetch(`${config.apiBaseUrl}/api/vehicles/${vehicleId}`, {
        method: 'GET',
        headers,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  },

  // Add a new vehicle
  async addVehicle(vehicleData, token) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      
      const response = await fetch(`${config.apiBaseUrl}/api/vehicles`, {
        method: 'POST',
        headers,
        body: JSON.stringify(vehicleData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  },

  // Update vehicle information
  async updateVehicle(vehicleId, vehicleData, token) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      
      const response = await fetch(`${config.apiBaseUrl}/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(vehicleData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  },

  // Delete/remove a vehicle
  async deleteVehicle(vehicleId, token) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      
      const response = await fetch(`${config.apiBaseUrl}/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  },

  // Upload vehicle document
  async uploadVehicleDocument(vehicleId, documentType, file, token) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${config.apiBaseUrl}/api/vehicles/${vehicleId}/documents`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error uploading vehicle document:', error);
      throw error;
    }
  },

  // Get vehicle documents
  async getVehicleDocuments(vehicleId, token) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      
      const response = await fetch(`${config.apiBaseUrl}/api/vehicles/${vehicleId}/documents`, {
        method: 'GET',
        headers,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching vehicle documents:', error);
      throw error;
    }
  },

  // Update vehicle status (active/inactive)
  async updateVehicleStatus(vehicleId, isActive, token) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      
      const response = await fetch(`${config.apiBaseUrl}/api/vehicles/${vehicleId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      throw error;
    }
  },

  // Set primary vehicle
  async setPrimaryVehicle(vehicleId, token) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      
      const response = await fetch(`${config.apiBaseUrl}/api/vehicles/${vehicleId}/primary`, {
        method: 'PATCH',
        headers,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error setting primary vehicle:', error);
      throw error;
    }
  },
};

// Export individual functions for convenience
export const {
  getVehicles,
  getVehicle,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  uploadVehicleDocument,
  getVehicleDocuments,
  updateVehicleStatus,
  setPrimaryVehicle,
} = vehicleService;

export default vehicleService;
