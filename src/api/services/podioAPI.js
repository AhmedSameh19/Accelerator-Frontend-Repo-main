import axios from 'axios';
import { CRM_API_V1_BASE } from '../../constants/crmApiBase';
import { getCrmAccessToken } from '../../utils/crmToken';

const API_BASE_URL = CRM_API_V1_BASE;

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

const podioAPI = {
  /**
   * Get Podio authorization URL
   */
  getAuthUrl: async () => {
    try {
      const response = await api.get('/podio/auth-url');
      return response.data;
    } catch (error) {
      console.error('Error getting Podio auth URL:', error);
      throw error;
    }
  },

  /**
   * Check Podio authentication status
   */
  getStatus: async () => {
    try {
      const response = await api.get('/podio/status');
      return response.data;
    } catch (error) {
      console.error('Error checking Podio status:', error);
      return { authenticated: false, hasTokens: false };
    }
  },

  /**
   * Sync Podio data to companies
   * @param {Object} options - Sync options
   * @param {boolean} options.updateExisting - Whether to update existing companies
   * @param {number} options.maxItems - Maximum number of items to sync (null for all)
   */
  sync: async (options = {}) => {
    try {
      const response = await api.post('/podio/sync', options);
      return response.data;
    } catch (error) {
      console.error('Error syncing Podio:', error);
      throw error;
    }
  },

  /**
   * Test Podio connection
   */
  testConnection: async () => {
    try {
      const response = await api.get('/podio/test');
      return response.data;
    } catch (error) {
      console.error('Error testing Podio connection:', error);
      throw error;
    }
  }
};

export default podioAPI;
