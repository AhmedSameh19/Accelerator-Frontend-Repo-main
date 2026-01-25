/**
 * Hook for fetching and managing OGX realizations data
 * Handles loading, error states, and data refresh
 */

import { useState, useEffect, useCallback } from 'react';
import { getRealizations } from '../../api/services/realizationsService';
import { useOfficeId } from '../useOfficeId';

/**
 * Custom hook for OGX realizations data management
 * 
 * @returns {Object} - Realizations state and actions
 */
export function useOGXRealizations() {
  const { officeId, isAdmin, currentUser } = useOfficeId({ useAdminOverride: true });
  
  const [leads, setLeads] = useState([]);
  const [originalLeads, setOriginalLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch realizations from API
   */
  const fetchLeads = useCallback(async () => {
    if (!officeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getRealizations(officeId);
      console.log('📦 [useOGXRealizations] Fetched realizations:', data?.length || 0);
      setLeads(data || []);
      setOriginalLeads(data || []);
    } catch (err) {
      console.error('❌ [useOGXRealizations] Error fetching realizations:', err);
      setError('Failed to fetch realizations. Please try again later.');
      setLeads([]);
      setOriginalLeads([]);
    } finally {
      setLoading(false);
    }
  }, [officeId]);

  /**
   * Refresh data from API
   */
  const refresh = useCallback(() => {
    return fetchLeads();
  }, [fetchLeads]);

  /**
   * Update leads locally (optimistic update)
   * 
   * @param {Function} updater - Function that receives current leads and returns updated leads
   */
  const updateLeads = useCallback((updater) => {
    setLeads((prev) => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      return updated;
    });
    setOriginalLeads((prev) => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      return updated;
    });
  }, []);

  /**
   * Set filtered leads (doesn't affect originalLeads)
   * 
   * @param {Array} filteredLeads - The filtered leads to display
   */
  const setFilteredLeads = useCallback((filteredLeads) => {
    setLeads(filteredLeads);
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    originalLeads,
    loading,
    error,
    officeId,
    isAdmin,
    currentUser,
    fetchLeads,
    refresh,
    updateLeads,
    setFilteredLeads,
  };
}

export default useOGXRealizations;
