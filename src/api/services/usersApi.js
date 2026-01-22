import axios from 'axios';
import { getCrmAccessToken } from '../../utils/crmToken';

const API_BASE_URL = 'http://localhost:5002/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Add request interceptor to include auth token only if valid
api.interceptors.request.use(
  (config) => {
    const token = getCrmAccessToken();
    // Only add Authorization header if token exists and is not empty
    if (token && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Explicitly remove Authorization header if no valid token
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Users API functions
export const usersApi = {
  // Get all users
  getUsers: async () => {
    try {
      const response = await api.get('/auth/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user profile by EXPA ID
  getUserProfile: async (expaId) => {
    try {
      const response = await api.get(`/auth/profile/${expaId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile by EXPA ID
  updateUserProfile: async (expaId, updateData) => {
    try {
      const response = await api.put(`/auth/profile/${expaId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // EXPA login
  expaLogin: async (accessToken) => {
    try {
      const response = await api.post('/auth/expa-login', {
        access_token: accessToken
      });
      return response.data;
    } catch (error) {
      console.error('Error with EXPA login:', error);
      throw error;
    }
  }
};

export default usersApi;
