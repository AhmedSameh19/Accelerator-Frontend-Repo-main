import axios from 'axios';
import Cookies from 'js-cookie';
import { getCrmAccessToken } from '../../utils/crmToken';
import { getFriendlyErrorMessage } from '../../utils/errorHandler';

const API_BASE_URL =
  process.env.REACT_APP_FASTAPI_BASE ||
  process.env.REACT_APP_API_BASE_URL ||
  'https://accelerator.aiesec.eg/api/v1';

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
      console.warn('⚠️ [leadsApi] No access token found. Request may fail if authentication is required.');
    }

    // Add cache-busting headers to prevent browser caching
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';

    // Log request details for debugging (only in dev mode to reduce noise)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [leadsApi] Request config:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasToken: !!token,
        withCredentials: config.withCredentials
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Attach friendly message to the error object
    error.friendlyMessage = getFriendlyErrorMessage(error);

    if (error.response) {
      console.error('❌ [leadsApi] Response error:', {
        status: error.response.status,
        message: error.friendlyMessage,
        data: error.response.data
      });
    } else {
      console.error('❌ [leadsApi] Network/Setup error:', error.friendlyMessage);
    }

    return Promise.reject(error);
  }
);

// Leads API functions
export const leadsApi = {
  // Get all leads with optional filters
  getLeads: async ({ home_lc_id, limit = 50, page = 1, search } = {}) => {
    if (home_lc_id == null) throw new Error('home_lc_id is required');

    const params = { home_lc_id: Number(home_lc_id), limit: Number(limit), page: Number(page), search: search || undefined };

    try {
      const { data } = await api.get('/leads/', {
        params: { ...params, _t: Date.now() },
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      return data;
    } catch (error) {
      console.error('❌ [leadsApi] Error fetching leads:', error);
      if (error.response) {
        console.error('❌ [leadsApi] Response status:', error.response.status);
        console.error('❌ [leadsApi] Response data:', error.response.data);
        console.error('❌ [leadsApi] Response headers:', error.response.headers);

        // Handle specific error cases
        if (error.response.status === 401) {
          console.error('❌ [leadsApi] Authentication failed - token may be expired or invalid');
          console.error('💡 Try logging out and logging back in to refresh your token');
        } else if (error.response.status === 403) {
          console.error('❌ [leadsApi] Access forbidden - insufficient permissions');
        } else if (error.response.status === 404) {
          console.error('❌ [leadsApi] Endpoint not found - check if backend is running');
        }
      } else if (error.request) {
        console.error('❌ [leadsApi] Request made but no response:', error.request);
        console.error('❌ [leadsApi] This could be a network issue or CORS problem');
        console.error('💡 Check if backend is running at:', API_BASE_URL);
      } else {
        console.error('❌ [leadsApi] Error setting up request:', error.message);
      }
      throw error;
    }
  },

  getICXLeads: async ({ host_lc_id, limit = 50, page = 1, search } = {}) => {
    if (host_lc_id == null) throw new Error('host_lc_id is required');

    const params = { host_lc_id: String(host_lc_id), limit: Number(limit), page: Number(page), search: search || undefined };

    try {
      const { data } = await api.get('/icx/leads/', {
        params: { ...params, _t: Date.now() },
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      return data;
    } catch (error) {
      console.error('❌ [leadsApi] Error fetching iCX leads:', error);
      throw error;
    }
  },

  addComment: async (leadId, comment, created_by) => {
    try {
      const createdByValue = created_by ?? Cookies.get('person_id') ?? null;
      const response = await api.post(`/leads/${leadId}/comments`, {
        text: comment,
        created_by: createdByValue,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // iCX comments
  // Backend: POST /api/v1/icx/leads/{application_id}/comments
  addICXComment: async (applicationId, comment, created_by) => {
    try {
      const createdByValue = created_by ?? Cookies.get('person_id') ?? null;

      if (!createdByValue) {
        throw new Error('created_by is required for iCX comments');
      }

      const response = await api.post(`/icx/leads/${applicationId}/comments`, {
        text: comment,
        created_by: createdByValue,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding iCX comment:', error);
      throw error;
    }
  },



  // Returns an array of comments (normalizes response shape)
  getComments: async (leadId) => {
    try {
      const response = await api.get(`/leads/${leadId}/comments`);
      const data = response.data;

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.comments)) return data.comments;

      return [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Backend: GET /api/v1/icx/leads/{application_id}/comments
  getICXComments: async (applicationId) => {
    try {
      const response = await api.get(`/icx/leads/${applicationId}/comments`);
      const data = response.data;

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.comments)) return data.comments;

      return [];
    } catch (error) {
      console.error('Error fetching iCX comments:', error);
      throw error;
    }
  },

  // Bulk assign leads
  bulkAssignLeads: async (data) => {
    try {
      const response = await api.patch('/leads/assign/bulk', data);
      return response?.data || response;
    }
    catch (error) {
      console.error('Error bulk assigning leads:', error);
      throw error;
    }
  },

  // Bulk assign iCX leads (by application_id)
  bulkAssignICXLeads: async (data) => {
    try {
      const response = await api.patch('/icx/leads/assign/bulk', data);
      return response?.data || response;
    } catch (error) {
      console.error('Error bulk assigning iCX leads:', error);
      throw error;
    }
  },

  createFollowUp: async (leadId, { text, next_follow_up_date }) => {
    try {
      const payload = {
        follow_up_text: text,
        created_by: Cookies.get('person_id') || null,
        follow_up_at: next_follow_up_date
      };

      const response = await api.post(`/leads/${leadId}/followups`, payload);
      return response?.data || response;
    } catch (error) {
      console.error('Error creating follow-up:', error);
      throw error;
    }
  },

  // iCX follow-ups
  // Backend: POST /api/v1/icx/leads/{application_id}/followups
  createICXFollowUp: async (applicationId, { text, next_follow_up_date, created_by } = {}) => {
    try {
      const payload = {
        follow_up_text: text,
        created_by: created_by ?? Cookies.get('person_id') ?? null,
        follow_up_at: next_follow_up_date,
      };

      const response = await api.post(`/icx/leads/${applicationId}/followups`, payload);
      return response?.data || response;
    } catch (error) {
      console.error('Error creating iCX follow-up:', error);
      throw error;
    }
  },
  getFollowUps: async (leadId) => {
    try {
      // Call backend endpoint
      const response = await api.get(`/leads/${leadId}/followups`);

      // Backend returns { message, data }, so we extract data
      return response?.data || response || []; // fallback to empty array if no data

    } catch (error) {
      console.error('Error fetching follow-ups:', error);
      throw error;
    }
  },

  // Backend: GET /api/v1/icx/leads/{application_id}/followups
  getICXFollowUps: async (applicationId) => {
    try {
      const response = await api.get(`/icx/leads/${applicationId}/followups`);
      return response?.data || response || [];
    } catch (error) {
      console.error('Error fetching iCX follow-ups:', error);
      throw error;
    }
  },

  updateFollowUp: async (epId, followUpId, updateData) => {
    try {
      // Call backend endpoint to update follow-up
      const payload = updateData && typeof updateData === 'object'
        ? updateData
        : { status: 'completed' };

      const response = await api.patch(`/leads/${epId}/followups/${followUpId}/status`, payload);

      // Backend returns { message, data }, so we extract data
      return response?.data || response;

    } catch (error) {
      console.error('Error updating follow-up:', error);
      throw error;
    }
  },

  // Backend: PATCH /api/v1/icx/leads/{application_id}/followups/{followup_id}/status
  updateICXFollowUpStatus: async (applicationId, followUpId, statusValue = 'completed') => {
    try {
      const payload = {
        status: statusValue,
      };
      const response = await api.patch(
        `/icx/leads/${applicationId}/followups/${followUpId}/status`,
        payload,
      );
      return response?.data || response;
    } catch (error) {
      console.error('Error updating iCX follow-up status:', error);
      throw error;
    }
  },
  getFollowUpsCreatedBy: async () => {
    try {
      const personId = Cookies.get('person_id') || null;
      const response = await api.get(`/leads/followups/created_by/${personId}`);
      return response?.data || response;
    } catch (error) {
      console.error('Error fetching follow-ups created by:', error);
      throw error;
    }
  },

  // Backend: GET /api/v1/icx/leads/followups/created_by/{created_by_member_id}
  getICXFollowUpsCreatedBy: async (createdByMemberId) => {
    try {
      const effectiveId = createdByMemberId ?? Cookies.get('person_id') ?? null;
      if (!effectiveId) return [];
      const response = await api.get(`/icx/leads/followups/created_by/${effectiveId}`);
      return response?.data || response;
    } catch (error) {
      console.error('Error fetching iCX follow-ups created by:', error);
      throw error;
    }
  },
  updateLeadStatus: async (
    leadId,
    {
      // OGX/B2C fields
      contact_status,
      interested,
      process_status,
      reason,
      project,
      country,
      comment,

      // iCX fields
      contacted,
      interviewed,
      expectations_email_status,
      out_of_process,
    }
  ) => {
    try {
      const response = await api.patch(`/leads/${leadId}/status`, {
        contact_status,
        interested,
        process_status,
        reason,
        project,
        country,
        comment,
        contacted,
        interviewed,
        expectations_email_status,
        out_of_process,
      });
      return response?.data || response;
    } catch (error) {
      console.error('Error updating contact status:', error);
      throw error;
    }
  },
  getContactStatus: async (leadId) => {
    try {
      const response = await api.get(`/leads/${leadId}/status`);
      return response?.data || response;
    } catch (error) {
      console.error('Error fetching contact status:', error);
      throw error;
    }
  },

  // iCX status endpoints
  // Backend: GET /api/v1/icx/leads/{application_id}/status
  getICXLeadStatus: async (applicationId) => {
    try {
      const response = await api.get(`/icx/leads/${applicationId}/status`);
      return response?.data || response;
    } catch (error) {
      console.error('Error fetching iCX lead status:', error);
      throw error;
    }
  },

  // Backend: PATCH /api/v1/icx/leads/{application_id}/status
  patchICXLeadStatus: async (applicationId, payload) => {
    try {
      const response = await api.patch(`/icx/leads/${applicationId}/status`, payload);
      return response?.data || response;
    } catch (error) {
      console.error('Error patching iCX lead status:', error);
      throw error;
    }
  },

  // // Get single lead by ID
  // getLead: async (leadId) => {
  //   try {
  //     const response = await api.get(`/leads/${leadId}`);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching lead:', error);
  //     throw error;
  //   }
  // },

  // // Create new lead
  // createLead: async (leadData) => {
  //   try {
  //     const response = await api.post('/leads', leadData);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error creating lead:', error);
  //     throw error;
  //   }
  // },

  // // Update lead
  // updateLead: async (leadId, updateData) => {
  //   try {
  //     const response = await api.put(`/leads/${leadId}`, updateData);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error updating lead:', error);
  //     throw error;
  //   }
  // },

  // // Delete lead
  // deleteLead: async (leadId) => {
  //   try {
  //     const response = await api.delete(`/leads/${leadId}`);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error deleting lead:', error);
  //     throw error;
  //   }
  // },

  // // Assign lead to user (using EXPA ID)
  // assignLead: async (leadId, expaId) => {
  //   try {
  //     const response = await api.put(`/leads/${leadId}`, {
  //       assigned_to_expa_id: expaId
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error assigning lead:', error);
  //     throw error;
  //   }
  // },


  // getLeadAssignments: async () => {
  //   try {
  //     const response = await api.get('/leads/assignments');
  //     return response.data;
  //   }
  //   catch (error) {
  //     console.error('Error fetching lead assignments:', error);
  //     throw error;
  //   }
  // },

  // // Get lead statistics
  // getLeadStats: async () => {
  //   try {
  //     const response = await api.get('/leads/stats/overview');
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching lead stats:', error);
  //     throw error;
  //   }
  // },

  // // Export leads to CSV
  // exportLeads: async (filters = {}) => {
  //   try {
  //     const params = new URLSearchParams();
  //     Object.keys(filters).forEach(key => {
  //       if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
  //         params.append(key, filters[key]);
  //       }
  //     });

  //     const response = await api.get(`/leads/export/csv?${params.toString()}`, {
  //       responseType: 'blob'
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error exporting leads:', error);
  //     throw error;
  //   }
  // },

  // // Import leads from CSV
  // importLeads: async (file) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append('file', file);

  //     const response = await api.post('/leads/import/csv', formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error importing leads:', error);
  //     throw error;
  //   }
  // },

  // // Get global options
  // getOptions: async (optionType) => {
  //   try {
  //     const response = await api.get(`/leads/options/${optionType}`);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching options:', error);
  //     throw error;
  //   }
  // },

  // // Add new option
  // addOption: async (optionType, name) => {
  //   try {
  //     const response = await api.post(`/leads/options/${optionType}`, { name });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error adding option:', error);
  //     throw error;
  //   }
  // },

  // // Delete option
  // deleteOption: async (optionType, optionId) => {
  //   try {
  //     const response = await api.delete(`/leads/options/${optionType}/${optionId}`);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error deleting option:', error);
  //     throw error;
  //   }
  // },


  // // Get realizations for a lead
  // getRealizations: async (leadId) => {
  //   try {
  //     const response = await api.get(`/leads/${leadId}/realizations`);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching realizations:', error);
  //     throw error;
  //   }
  // },

  // // Create realization
  // createRealization: async (leadId, realizationData) => {
  //   try {
  //     const response = await api.post(`/leads/${leadId}/realizations`, realizationData);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error creating realization:', error);
  //     throw error;
  //   }
  // },

  // // Update realization
  // updateRealization: async (realizationId, updateData) => {
  //   try {
  //     const response = await api.put(`/leads/realizations/${realizationId}`, updateData);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error updating realization:', error);
  //     throw error;
  //   }
  // },

  // // Delete realization
  // deleteRealization: async (realizationId) => {
  //   try {
  //     const response = await api.delete(`/leads/realizations/${realizationId}`);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error deleting realization:', error);
  //     throw error;
  //   }
  // },

  // updateContactStatus: async (leadId, { contact_status, interested, process, reason, project, country, comment }) => {
  //   try {
  //     const response = await api.put(`/leads/${leadId}/contact_status`, {
  //       contact_status,
  //       interested,
  //       process,
  //       reason,
  //       project,
  //       country,
  //       comment,
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error updating contact status:', error);
  //     throw error;
  //   }
  // },
  // getContactStatus: async (leadId) => {
  //   try {
  //     const response = await api.get(`/leads/${leadId}/contact_status`);
  //     console.log('Contact status fetched successfully:', response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching contact status:', error);
  //     throw error;
  //   }
  // },
  // // Get follow-ups for a lead
  // getFollowUps: async (leadId) => {
  //   try {
  //     // Call backend endpoint
  //     const response = await api.get(`/leads/${leadId}/follow-ups`);

  //     // Backend returns { message, data }, so we extract data
  //     return response.data.data || []; // fallback to empty array if no data

  //   } catch (error) {
  //     console.error('Error fetching follow-ups:', error);
  //     throw error;
  //   }
  // },


  // // Create follow-up
  // createFollowUp: async (leadId, { text, status, next_follow_up_date }) => {
  //   try {
  //     const payload = {
  //       text,
  //       created_by: Cookies.get('person_id') || null,
  //       status,
  //       next_follow_up_date
  //     };

  //     const response = await api.post(`/leads/${leadId}/follow-ups`, payload);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error creating follow-up:', error);
  //     throw error;
  //   }
  // },
  // getFollowUpsCreatedBy: async () => {
  //   try {
  //     const personId = Cookies.get('person_id') || null;
  //     const response = await api.get(`/leads/follow-ups/created-by/${personId}`);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching follow-ups created by:', error);
  //     throw error;
  //   }
  // },


  // // Update follow-up
  // updateFollowUp: async (epId, followUpId, updateData) => {
  //   try {
  //     // Call backend endpoint to update follow-up
  //     const response = await api.put(`/leads/${epId}/follow-ups/${followUpId}/status`, updateData);

  //     // Backend returns { message, data }, so we extract data
  //     return response.data.data;

  //   } catch (error) {
  //     console.error('Error updating follow-up:', error);
  //     throw error;
  //   }
  // },


  // // Delete follow-up
  // deleteFollowUp: async (followUpId) => {
  //   try {
  //     const response = await api.delete(`/leads/follow-ups/${followUpId}`);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error deleting follow-up:', error);
  //     throw error;
  //   }
  // }

};
export default leadsApi;
