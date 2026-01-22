import axios from 'axios';
import Cookies from 'js-cookie';
import { getCrmAccessToken } from '../../utils/crmToken';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getCrmAccessToken();
    if (token && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const b2cAPI = {
  getComments: async (leadId) => {
    try {
      const response = await api.get(`/b2c/${leadId}/comments`);
      // Backend returns a list directly, not wrapped in an object
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      // If endpoint doesn't exist (404) or server error (500), return empty array
      // This allows the UI to still work even if the endpoint isn't implemented
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.warn(`B2C comments endpoint not available (${error.response.status}), returning empty array`);
        return [];
      }
      console.error('Error fetching B2C comments:', error);
      throw error;
    }
  },
  addComment: async (leadId, comment, createdBy = null) => {
    // Get user ID from multiple sources (cookies, localStorage, or parameter)
    let personId = createdBy;
    
    if (!personId) {
      // Try cookies first (multiple possible names)
      // Clean and validate cookie values
      const personIdCookie = Cookies.get('person_id');
      const expaPersonIdCookie = Cookies.get('expa_person_id');
      const userIdCookie = Cookies.get('userId');
      
      // Use the first valid non-empty value
      personId = [personIdCookie, expaPersonIdCookie, userIdCookie]
        .find(id => id && id !== 'null' && id !== 'undefined' && id.trim() !== '');
    }
    
    // If not in cookies, try localStorage
    if (!personId && typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          personId = user?.id || user?.person_id || user?.expa_person_id || null;
          // Validate the ID from localStorage
          if (personId && (personId === 'null' || personId === 'undefined' || String(personId).trim() === '')) {
            personId = null;
          }
        }
      } catch (e) {
        console.warn('Failed to parse user from localStorage:', e);
      }
    }
    
    // Log available sources for debugging
    if (!personId) {
      const allCookies = typeof document !== 'undefined' ? document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && (key.includes('person') || key.includes('user') || key.includes('id'))) {
          acc[key] = value;
        }
        return acc;
      }, {}) : {};
      
      console.warn('⚠️ No member ID found. Checking available sources:', {
        cookies: {
          person_id: Cookies.get('person_id'),
          expa_person_id: Cookies.get('expa_person_id'),
          userId: Cookies.get('userId')
        },
        allRelevantCookies: allCookies,
        localStorage: typeof window !== 'undefined' ? localStorage.getItem('user') : 'N/A'
      });
      
      // Provide helpful debugging info
      console.info('💡 To fix this issue:');
      console.info('   1. Open browser DevTools (F12)');
      console.info('   2. Go to Application/Storage tab');
      console.info('   3. Check Cookies and Local Storage');
      console.info('   4. Look for person_id, expa_person_id, or userId');
      console.info('   5. If values are "null" or "undefined" (as strings), delete them');
      console.info('   6. Log out and log back in to refresh cookies');
    }
    
    // Backend requires created_by to be a valid member expa_person_id
    if (!personId) {
      throw new Error('Member ID (created_by) is required. Please ensure you are logged in. If the problem persists, try clearing your browser cookies and logging back in.');
    }
    
    // Ensure it's a string (backend expects string) and clean it
    const memberId = String(personId).trim();
    
    if (!memberId || memberId === 'null' || memberId === 'undefined' || memberId === '') {
      throw new Error('Invalid member ID format. Please clear your browser cookies and log back in.');
    }
    
    // Build payload according to backend API
    const payload = {
      text: comment,
      created_by: memberId
    };
    
    const endpoint = `/b2c/${leadId}/comments`;
    
    try {
      console.log('🔍 Attempting to add B2C comment:', { 
        endpoint, 
        leadId, 
        payload,
        hasToken: !!getCrmAccessToken(),
        memberId
      });
      
      const response = await api.post(endpoint, payload);
      
      if (response.status >= 400) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      console.log('✅ B2C comment added successfully:', response.data);
      return response.data;
    } catch (error) {
      lastError = error;
      console.error('❌ Error adding B2C comment:', error);
      
      // If it's a 500 error, the endpoint or payload might be wrong
      // But we'll still throw the error so the user knows
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        // Log the actual backend error message in a more readable format
        console.group('🔴 Backend Error Details');
        console.error('Status:', status);
        console.error('Status Text:', error.response.statusText);
        console.error('Request URL:', error.config?.url);
        console.error('Request Method:', error.config?.method);
        console.error('Request Payload:', error.config?.data);
        console.error('Error Data (raw):', errorData);
        if (errorData) {
          try {
            console.error('Error Data (formatted):', JSON.stringify(errorData, null, 2));
          } catch (e) {
            console.error('Error Data (string):', String(errorData));
          }
        }
        console.error('Full Error Response:', error.response);
        console.groupEnd();
        
        // Extract meaningful error message - try multiple possible fields
        let message = 'Internal server error';
        if (errorData) {
          if (typeof errorData === 'string') {
            message = errorData;
          } else if (errorData.detail) {
            // Backend uses 'detail' field for error messages
            message = errorData.detail;
          } else if (errorData.message) {
            message = errorData.message;
          } else if (errorData.error) {
            message = errorData.error;
          } else if (errorData.error_message) {
            message = errorData.error_message;
          } else if (errorData.msg) {
            message = errorData.msg;
          } else {
            // Try to stringify the whole object
            message = JSON.stringify(errorData);
          }
        }
        
        // Handle specific error cases
        if (status === 404 && message.includes('Member not found')) {
          message = 'Your member account was not found. Please contact support.';
        } else if (status === 404 && message.includes('Comment not found')) {
          message = 'Comment not found.';
        } else if (status === 403) {
          message = 'You are not authorized to add comments.';
        } else if (status === 503) {
          message = 'Database error. Please try again later.';
        } else if (status === 500 && message === 'Internal server error') {
          message = 'Server error. Please check backend logs or try again later.';
        }
        
        // If we still don't have a good message, use the status text
        if (message === 'Internal server error' && error.response.statusText) {
          message = `${error.response.statusText} (${status})`;
        }
        
        const serverError = new Error(message);
        serverError.status = status;
        serverError.response = error.response;
        throw serverError;
      } else if (error.request) {
        throw new Error('Network error: No response from server');
      } else {
        throw error;
      }
    }
  },
  // Add a lead to back-to-process
  // Backend endpoint: POST /b2c/back-to-process
  // Payload: { expa_person_id: string }
  addBackToProcess: async (expaPersonId) => {
    try {
      if (!expaPersonId) {
        throw new Error('expa_person_id is required to mark a lead back to process');
      }
      
      const payload = { expa_person_id: expaPersonId };
      
      console.log('🔍 [b2cAPI] Adding lead to back-to-process:', {
        endpoint: '/b2c/back-to-process',
        payload,
        hasToken: !!getCrmAccessToken()
      });
      
      const response = await api.post(`/b2c/back-to-process`, payload);
      console.log('✅ [b2cAPI] Lead added to back-to-process successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [b2cAPI] Error adding lead to back-to-process:', error);
      console.group('🔴 Backend Error Details');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Request URL:', error.config?.url);
      console.error('Request Method:', error.config?.method);
      console.error('Request Payload:', error.config?.data);
      console.error('Error Data (raw):', error.response?.data);
      if (error.response?.data) {
        try {
          console.error('Error Data (formatted):', JSON.stringify(error.response.data, null, 2));
        } catch (e) {
          console.error('Error Data (string):', String(error.response.data));
        }
      }
      console.error('Full Error Response:', error.response);
      console.groupEnd();
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        const errorMsg = error.response?.data?.detail || 'Lead not found';
        throw new Error(errorMsg);
      }
      if (error.response?.status === 409) {
        const errorMsg = error.response?.data?.detail || 'Lead already in back_to_process';
        throw new Error(errorMsg);
      }
      if (error.response?.status === 503) {
        const errorMsg = error.response?.data?.detail || 'Database error';
        throw new Error(errorMsg);
      }
      if (error.response?.status === 500) {
        const errorMsg = error.response?.data?.detail || 'Internal server error';
        throw new Error(errorMsg);
      }
      
      // For other errors, extract message and throw
      let message = 'Failed to add lead to back-to-process';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          message = errorData;
        } else if (errorData.message) {
          message = errorData.message;
        } else if (errorData.error) {
          message = errorData.error;
        } else if (errorData.detail) {
          message = errorData.detail;
        }
      } else if (error.message) {
        message = error.message;
      }
      
      throw new Error(message);
    }
  },
  getBackToProcess: async (homeLcId, limit = 1000, fetchAll = true) => {
    try {
      if (!homeLcId) {
        throw new Error('home_lc_id is required to fetch back to process EPs');
      }
      
      // If fetchAll is true, use a very high limit to get all results
      // Note: Backend only supports 'limit' parameter, not 'skip' for pagination
      if (fetchAll) {
        // Try with a very high limit to get all results in one request
        // If backend has a max limit, we'll get as many as possible
        const veryHighLimit = 100000;
        const response = await api.get(`/b2c/back-to-process/${homeLcId}`, {
          params: { limit: veryHighLimit },
        });
        
        const result = Array.isArray(response.data) ? response.data : [];
        console.log(`✅ [b2cAPI] getBackToProcess returning ${result.length} EPs for LC ${homeLcId} (limit: ${veryHighLimit})`);
        
        // If we got exactly the limit, warn that there might be more
        if (result.length === veryHighLimit) {
          console.warn(`⚠️ [b2cAPI] Got exactly ${veryHighLimit} results. There might be more EPs that weren't fetched.`);
        }
        
        return result;
      } else {
        // Single request with specified limit
        const response = await api.get(`/b2c/back-to-process/${homeLcId}`, {
          params: { limit },
        });
        console.log("🔍 [b2cAPI] getBackToProcess response:", {
          status: response.status,
          dataLength: Array.isArray(response.data) ? response.data.length : 'not an array',
          dataType: typeof response.data,
          firstItem: response.data?.[0]
        });
        // Backend returns list[BackToProcessOut] directly
        const result = Array.isArray(response.data) ? response.data : [];
        console.log(`✅ [b2cAPI] getBackToProcess returning ${result.length} EPs for LC ${homeLcId}`);
        return result;
      }
    }
    catch (e) {
      console.error('❌ Error fetching back to process leads:', e);
      console.error('❌ Error details:', {
        status: e.response?.status,
        statusText: e.response?.statusText,
        data: e.response?.data,
        message: e.message
      });
      // Return empty array on error instead of undefined
      if (e.response?.status === 404 || e.response?.status === 500) {
        console.warn(`Back to process endpoint not available (${e.response.status}), returning empty array`);
        return [];
      }
      throw e; // Re-throw other errors
    }
  },
  // Get back to process EPs for multiple LCs (for admins or to get all EPs)
  getAllBackToProcess: async (homeLcIds, limit = 1000, fetchAll = true) => {
    try {
      if (!Array.isArray(homeLcIds) || homeLcIds.length === 0) {
        throw new Error('home_lc_ids array is required');
      }
      
      console.log(`🔍 [b2cAPI] getAllBackToProcess fetching from ${homeLcIds.length} LCs (fetchAll: ${fetchAll})`);
      
      // Fetch from all provided LC IDs and combine results
      // Use fetchAll=true to get all results from each LC
      const promises = homeLcIds.map(lcId => 
        b2cAPI.getBackToProcess(lcId, limit, fetchAll).catch(err => {
          console.warn(`⚠️ Failed to fetch back to process for LC ${lcId}:`, err);
          return []; // Return empty array on error for this LC
        })
      );
      
      const results = await Promise.all(promises);
      console.log(`🔍 [b2cAPI] getAllBackToProcess received results from ${results.length} LCs`);
      console.log(`🔍 [b2cAPI] Results per LC:`, results.map((r, i) => ({ lcId: homeLcIds[i], count: r.length })));
      
      // Flatten and deduplicate by expa_person_id
      const allEps = results.flat();
      console.log(`🔍 [b2cAPI] Total EPs before deduplication: ${allEps.length}`);
      
      const uniqueEps = Array.from(
        new Map(allEps.map(ep => [ep.expa_person_id, ep])).values()
      );
      console.log(`🔍 [b2cAPI] Total EPs after deduplication: ${uniqueEps.length}`);
      
      // Sort by inserted_at desc (most recent first)
      const sorted = uniqueEps.sort((a, b) => {
        const dateA = new Date(a.inserted_at || a.created_at || 0);
        const dateB = new Date(b.inserted_at || b.created_at || 0);
        return dateB - dateA;
      });
      
      console.log(`✅ [b2cAPI] getAllBackToProcess returning ${sorted.length} unique EPs`);
      return sorted;
    } catch (e) {
      console.error('❌ Error fetching all back to process leads:', e);
      throw e;
    }
  },
  // Get customer interview status
  // Backend endpoint: GET /b2c/{expa_person_id}/status
  getCustomerInterviewStatus: async (leadId) => {
    try {
      const response = await api.get(`/b2c/${leadId}/status`);
      console.log('🔍 [b2cAPI] getCustomerInterviewStatus response:', response.data);
      return response.data || {};
    } catch (error) {
      // If endpoint doesn't exist (404), return empty object instead of throwing
      // This allows the UI to still work even if the endpoint isn't implemented
      if (error.response?.status === 404) {
        console.warn('Customer interview status endpoint not available (404), returning empty object');
        return {};
      }
      // For 500 errors, also return empty object to prevent UI breaking
      if (error.response?.status === 500) {
        console.warn('Customer interview status endpoint error (500), returning empty object');
        return {};
      }
      console.error('Error fetching customer interview status:', error);
      throw error;
    }
  },
  // Update customer interview status
  // Backend endpoint: PATCH /b2c/{expa_person_id}/status
  // Payload fields: contact_status, interested, process_status, reason (as per B2CStatusUpdate model)
  updateCustomerInterviewStatus: async (leadId, { contact_status, interested, process_status, reason }) => {
    // Build payload with only provided fields (exclude undefined/null)
    const payload = {};
    if (contact_status !== undefined && contact_status !== null) {
      payload.contact_status = contact_status;
    }
    if (interested !== undefined && interested !== null) {
      payload.interested = interested;
    }
    if (process_status !== undefined && process_status !== null) {
      payload.process_status = process_status;
    }
    if (reason !== undefined && reason !== null) {
      payload.reason = reason;
    }
    
    console.log('🔍 [b2cAPI] Updating customer interview status:', {
      leadId,
      endpoint: `/b2c/${leadId}/status`,
      payload,
      hasToken: !!getCrmAccessToken()
    });
    
    try {
      const response = await api.patch(`/b2c/${leadId}/status`, payload);
      console.log('✅ [b2cAPI] Customer interview status updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [b2cAPI] Error updating customer interview status:', error);
      console.group('🔴 Backend Error Details');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Request URL:', error.config?.url);
      console.error('Request Method:', error.config?.method);
      console.error('Request Payload:', error.config?.data);
      console.error('Error Data (raw):', error.response?.data);
      if (error.response?.data) {
        try {
          console.error('Error Data (formatted):', JSON.stringify(error.response.data, null, 2));
        } catch (e) {
          console.error('Error Data (string):', String(error.response.data));
        }
      }
      console.error('Full Error Response:', error.response);
      console.groupEnd();
      
      // If endpoint doesn't exist (404) or server error (500), throw with details
      if (error.response?.status === 404) {
        const errorMsg = `Customer interview status endpoint not found (404). Please check if the backend endpoint exists: PATCH /b2c/${leadId}/status`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      if (error.response?.status === 500) {
        const errorMsg = `Server error (500) when updating customer interview status. Check backend logs.`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      // For other errors, extract message and throw
      let message = 'Failed to update customer interview status';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          message = errorData;
        } else if (errorData.message) {
          message = errorData.message;
        } else if (errorData.error) {
          message = errorData.error;
        } else if (errorData.detail) {
          message = errorData.detail;
        }
      }
      
      throw new Error(message);
    }
  }
};
export default b2cAPI;
