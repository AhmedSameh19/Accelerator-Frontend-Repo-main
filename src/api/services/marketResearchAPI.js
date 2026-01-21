import axios from 'axios';
import Cookies from 'js-cookie';
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

const marketResearchAPI = {
  addCompany: async (companyData) => {
    try {

      const id = Cookies.get('person_id');
      const data = { ...companyData, created_by: id, };
      console.log("ALOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO: ", data);
      const response = await api.post('/marketResearch/companies', data);
      return response.data; // returns the saved company
    } catch (error) {
      console.error('Error adding/updating company:', error);
      throw error;
    }
  },
  getCompanies: async () => {
    try {

      const id = Cookies.get('person_id');
      const response = await api.get(`/marketResearch/companies?created_by=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting companies:', error);
      throw error;
    }
  },
  deleteCompany: async (id) => {
    try {
      const response = await api.delete(`/marketResearch/companies`, { data: { id } });
      return response.data;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  },
  updateCompany: async (id, updateData) => {
    try {
      const data = { id, ...updateData };
      console.log("Data: ", data);
      // Send the update payload without the id, since id is in the URL
      const response = await api.post(`/marketResearch/companies`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },
  getCompany: async (id) => {
    try {
      const response = await api.get(`/marketResearch/companies/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting company:', error);
      throw error;
    }
  },
  getCompaniesVisits: async () => {
    try {
      console.log("id:ana henaaaaa");
      const id = Cookies.get('person_id');
      const response = await api.get(`/marketResearch/companies/visits?created_by=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting companies visits:', error);
      throw error;
    }
  },
  createFollowUp: async (companyId, followUpData) => {
    try {
      const id = Cookies.get('person_id');
      const data = {
        ...followUpData,
        companyId,
        created_by: id,
        timestamp: new Date().toISOString()
      };
      console.log("Creating follow-up with data:", data);

      // Since there's no dedicated follow-up endpoint for companies, we'll update the company with the new follow-up
      // First get the current company data
      const currentCompany = await marketResearchAPI.getCompany(companyId);

      // Add the new follow-up to the existing follow-ups array
      const updatedFollowups = [
        ...(currentCompany.followups || []),
        data
      ];

      // Update the company with the new follow-up
      const response = await marketResearchAPI.updateCompany(companyId, {
        followups: updatedFollowups
      });

      return response;
    } catch (error) {
      console.error('Error creating follow-up:', error);
      throw error;
    }
  },
  /**
   * Get Market Research companies from Podio (ICX endpoint)
   * @param {Object} filters - Filter options
   * @param {string} filters.search - Search term
   * @param {string} filters.industry - Industry filter
   * @param {string} filters.size - Company size filter
   * @param {string} filters.accountType - Account type filter
   * @param {string} filters.status - Status filter
   */
  getMarketResearchFromPodio: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.industry) params.append('industry', filters.industry);
      if (filters.size) params.append('size', filters.size);
      if (filters.accountType) params.append('accountType', filters.accountType);
      if (filters.status) params.append('status', filters.status);

      // Add userLC from cookies/localStorage as query parameter for LC filtering
      const userLC = Cookies.get('userLC') || localStorage.getItem('userLC');
      if (userLC) {
        params.append('userLC', userLC);
      }

      const queryString = params.toString();
      const url = `/icx/market-research${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return response.data.data || []; // Return the data array
    } catch (error) {
      console.error('Error fetching Market Research companies from Podio:', error);
      throw error;
    }
  },
  /**
   * Search Market Research companies (ICX endpoint)
   * @param {string} query - Search query
   */
  searchMarketResearch: async (query) => {
    try {
      const response = await api.get(`/icx/market-research/search?q=${encodeURIComponent(query)}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error searching Market Research:', error);
      throw error;
    }
  },
  /**
   * Update Market Research item in Podio (ICX endpoint)
   * @param {number} itemId - Podio item ID
   * @param {Object} payload - Fields to update
   */
  updateMarketResearchItem: async (itemId, payload) => {
    try {
      const response = await api.put(`/icx/market-research/${itemId}`, payload);
      return response.data.data;
    } catch (error) {
      console.error('Error updating Market Research item:', error);
      throw error;
    }
  }
};
export default marketResearchAPI;
