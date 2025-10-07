// tripService.js - Trip management API service for drivers
import config from "../config";

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

// Trip API functions
export const tripService = {
  // Get driver trips with optional filters
  async getDriverTrips(token, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
      if (filters.status) queryParams.append('status', filters.status);

      const response = await fetch(
        `${config.apiBaseUrl}/api/drivers/trips?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching driver trips:', error);
      throw error;
    }
  },

  // Get trip statistics and summary
  async getTripStats(token) {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/drivers/performance`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching trip stats:', error);
      throw error;
    }
  },

  // Get trip earnings by period
  async getTripEarnings(token, period = 'week') {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/drivers/earnings?period=${period}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching trip earnings:', error);
      throw error;
    }
  },

  // Get detailed trip history from general ride history endpoint
  async getTripHistory(token, page = 1, limit = 10, status = 'completed') {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: status
      });

      const response = await fetch(
        `${config.apiBaseUrl}/api/rides/history?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching trip history:', error);
      throw error;
    }
  },

  // Get ride statistics
  async getRideStats(token) {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/rides/history/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching ride stats:', error);
      throw error;
    }
  }
};

// Named exports for backward compatibility and convenience
export const getDriverTrips = (token, filters) => tripService.getDriverTrips(token, filters);
export const getTripStats = (token) => tripService.getTripStats(token);
export const getTripEarnings = (token, period) => tripService.getTripEarnings(token, period);
export const getTripHistory = (token, page, limit, status) => tripService.getTripHistory(token, page, limit, status);
export const getRideStats = (token) => tripService.getRideStats(token);

export default tripService;