import axios from 'axios';
import Cookies from 'js-cookie';
import { getFriendlyErrorMessage } from '../../utils/errorHandler';
import { getCrmAccessToken } from '../../utils/crmToken';

const API_BASE_URL = 'https://api-accelerator.aiesec.org.eg/api/v1';

// FastAPI backend base URL for market research endpoints
const FASTAPI_BASE = process.env.REACT_APP_FASTAPI_BASE || 'https://api-accelerator.aiesec.org.eg/api/v1';

// Create axios instance for legacy API
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Create axios instance for FastAPI backend (market research)
const backendApi = axios.create({
  baseURL: FASTAPI_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
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

backendApi.interceptors.request.use(
  (config) => {
    const token = getCrmAccessToken();
    if (token && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// Add response interceptors for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    error.friendlyMessage = getFriendlyErrorMessage(error);
    return Promise.reject(error);
  }
);

backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    error.friendlyMessage = getFriendlyErrorMessage(error);
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
  /**
   * Assign a market research company (Podio item) to a member.
   * Uses FastAPI backend; member is resolved from EXPA-backed members (same as Leads page).
   */
  assignCompany: async (itemId, memberId) => {
    try {
      const response = await backendApi.patch(
        `/market-research/companies/${itemId}/assign`,
        { member_id: memberId }
      );
      return response?.data ?? response;
    } catch (error) {
      console.error('Error assigning company:', error);
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
  },

  // ========== FastAPI Backend Market Research Endpoints ==========

  /**
   * Fetch market research list from Podio via backend
   * @param {Object} params - limit, offset
   */
  /**
   * @param {Object} params - limit, offset, lc_id (optional; filter by LC id so backend returns only that LC's companies)
   */
  getFromBackend: async (params = {}) => {
    try {
      const requestParams = { limit: params.limit ?? 500, offset: params.offset ?? 0 };
      if (params.lc_id != null) requestParams.lc_id = params.lc_id;
      const response = await backendApi.get('/market-research', { params: requestParams, timeout: 45000 });
      return response.data;
    } catch (error) {
      console.error('Error fetching market research from backend:', error);
      throw error;
    }
  },

  /**
   * Get scheduled visits (IGV + B2B + Podio with visit_date) for calendar
   */
  getScheduledVisits: async () => {
    try {
      const response = await backendApi.get('/market-research/scheduled-visits');
      return response.data;
    } catch (error) {
      console.error('Error fetching scheduled visits:', error);
      throw error;
    }
  },

  /**
   * Get scheduled visit date for a Podio item (for company card)
   */
  getPodioScheduledVisit: async (podioItemId) => {
    try {
      const response = await backendApi.get(`/market-research/scheduled-visits/podio/${podioItemId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Podio scheduled visit:', error);
      throw error;
    }
  },

  /**
   * Create or update scheduled visit for a Podio item (shows in calendar and syncs to Google)
   */
  createOrUpdatePodioScheduledVisit: async (payload) => {
    try {
      const response = await backendApi.post('/market-research/scheduled-visits', payload);
      return response.data;
    } catch (error) {
      console.error('Error saving Podio scheduled visit:', error);
      throw error;
    }
  },

  /**
   * Get Podio webform URL (for redirect button; open in same tab so Podio redirect after submit returns here)
   */
  getPodioFormUrl: async () => {
    try {
      const response = await backendApi.get('/market-research/podio-form-url');
      return response.data?.url || null;
    } catch (error) {
      console.error('Error fetching Podio form URL:', error);
      throw error;
    }
  },

  /**
   * Create IGV market research in database
   * @param {Object} payload - IGVMarketResearchCreate fields
   */
  createIGV: async (payload) => {
    try {
      const response = await backendApi.post('/market-research/igv', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating IGV market research:', error);
      throw error;
    }
  },

  /**
   * Create B2B market research in database
   * @param {Object} payload - B2BMarketResearchCreate fields
   */
  createB2B: async (payload) => {
    try {
      const response = await backendApi.post('/market-research/b2b', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating B2B market research:', error);
      throw error;
    }
  },

  /**
   * Submit IGV to Podio
   * @param {Object} payload - company_name, product, sub_project, home_lc_id
   */
  submitIGVToPodio: async (payload) => {
    try {
      const response = await backendApi.post('/market-research/igv/submit', payload);
      return response.data;
    } catch (error) {
      console.error('Error submitting IGV to Podio:', error);
      throw error;
    }
  },

  /**
   * Submit B2B to Podio
   * @param {Object} payload - company_name, product, reason_for_approach, home_lc_id
   */
  submitB2BToPodio: async (payload) => {
    try {
      const response = await backendApi.post('/market-research/b2b/submit', payload);
      return response.data;
    } catch (error) {
      console.error('Error submitting B2B to Podio:', error);
      throw error;
    }
  },

  /**
   * Update IGV status/visit_date
   * @param {number} id - IGV record id
   * @param {Object} payload - { status?, visit_date? }
   */
  updateIGV: async (id, payload) => {
    try {
      const response = await backendApi.patch(`/market-research/igv/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating IGV:', error);
      throw error;
    }
  },

  /**
   * Update B2B status/visit_date
   * @param {number} id - B2B record id
   * @param {Object} payload - { status?, visit_date? }
   */
  updateB2B: async (id, payload) => {
    try {
      const response = await backendApi.patch(`/market-research/b2b/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating B2B:', error);
      throw error;
    }
  },
};
export default marketResearchAPI;
