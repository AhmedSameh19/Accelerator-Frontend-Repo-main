import axios from 'axios';
import Cookies from 'js-cookie';
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Leads API functions
export const leadsApi = {
  // Get all leads with optional filters
  getLeads: async ({ home_lc_id, limit = 50, cursor = null, skip } = {}) => {
    if (home_lc_id == null) throw new Error('home_lc_id is required');

    const params = { home_lc_id: Number(home_lc_id), limit: Number(limit) };

    // preferred: cursor pagination
    if (typeof cursor === 'string' && cursor.length) {
      // Support opaque cursor tokens (if backend returns encoded cursor)
      params.cursor = cursor;
    } else if (cursor?.created_at && cursor?.expa_person_id) {
      params.cursor_created_at = cursor.created_at;
      params.cursor_expa_person_id = cursor.expa_person_id;
    } else if (skip !== undefined) {
      // fallback: offset pagination
      params.skip = Number(skip);
    }

    const { data } = await api.get('/leads', { params });
    return data;
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

    updateFollowUp: async (epId, followUpId) => {
    try {
      // Call backend endpoint to update follow-up
      const payload = {
          "status":"completed"
      }
      const response = await api.patch(`/leads/${epId}/followups/${followUpId}/status`, payload);

      // Backend returns { message, data }, so we extract data
      return response?.data || response;

    } catch (error) {
      console.error('Error updating follow-up:', error);
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
  updateLeadStatus: async (leadId, { contact_status, interested, process_status, reason, project, country, comment }) => {
    try {
      const response = await api.patch(`/leads/${leadId}/status`, {
        contact_status,
        interested,
        process_status,
        reason,
        project,
        country,
        comment,
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
