import axios from 'axios';
import { CRM_API_V1_BASE } from '../../constants/crmApiBase';
import { getCrmAccessToken } from '../../utils/crmToken';

const api = axios.create({
  baseURL: CRM_API_V1_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getCrmAccessToken();
  if (token && token.trim() !== '') {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

const dashboardAPI = {
  /**
   * Fetch aggregated dashboard stats for a given LC ID.
   * Pass 1609 to fetch data across all LCs (admin use).
   * @param {number} lcId
   */
  getStats: async (lcId) => {
    const response = await api.get('/dashboard/', { params: { lc_id: lcId } });
    return response.data;
  },

  /**
   * Manually invalidate the Redis cache for a given LC.
   * Useful after a bulk data import.
   * @param {number} lcId
   */
  invalidateCache: async (lcId) => {
    const response = await api.delete('/dashboard/cache', { params: { lc_id: lcId } });
    return response.data;
  },
};

export default dashboardAPI;
