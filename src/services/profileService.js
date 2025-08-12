// profileService.js - Profile management API service
import config from "../config";

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

// Profile API functions
export const profileService = {
  // Get current user's profile
  async getProfile(token) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      
      const response = await fetch(`${config.apiBaseUrl}/api/profile`, {
        method: 'GET',
        headers,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(profileData, token) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      
      const response = await fetch(`${config.apiBaseUrl}/api/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Upload document
  async uploadDocument(docType, file, token) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', docType);

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${config.apiBaseUrl}/api/profile/documents`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },
};

// Named exports for backward compatibility
export const getProfile = (token) => profileService.getProfile(token);
export const updateProfile = (profileData, token) => profileService.updateProfile(profileData, token);
export const uploadDocument = (docType, file, token) => profileService.uploadDocument(docType, file, token);

export default profileService;
