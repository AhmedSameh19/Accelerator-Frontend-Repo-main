import axios from 'axios';
import Cookies from 'js-cookie';
const API_BASE_URL = 'https://api-accelerator.aiesec.org.eg/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const b2cAPI = {
  getComments: async (leadId) => {
    try {
      const response = await api.get(`/b2c/${leadId}/comments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },
  addComment: async (leadId, comment) => {
    try {
      const response = await api.post(`/b2c/${leadId}/B2Ccomments`, { text: comment });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },
  // Get follow-ups for a lead
  addBackToProcess: async (lead) => {
    try {
      console.log("Leadddddd", lead);
      const response = await api.post(`/b2c/returnToProcess`, lead);
      return response.data;
    }
    catch (e) {
      console.error('Error marking lead back to process:', e);
    }
  },
  getBackToProcess: async () => {
    try {
      const lc = Cookies.get('userLC');
      const response = await api.get(`/b2c/allBackToProcess`, {
        params: { lc },
      });
      console.log("Response in B2CAPI", response);
      return response.data;
    }
    catch (e) {
      console.error('Error fetching back to process leads:', e);
    }
  }
};
export default b2cAPI;
