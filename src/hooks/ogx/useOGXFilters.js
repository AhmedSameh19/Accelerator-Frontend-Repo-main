/**
 * Hook for OGX realizations filtering
 * Handles search, filters, and date range filtering
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { getCountryCode } from '../../constants/ogxRealizationsConstants';

/**
 * Default filter state
 */
const DEFAULT_FILTERS = {
  searchTerm: '',
  selectedCountry: '',
  selectedLanguage: '',
  selectedHostLC: '',
  selectedExchangeType: '',
  selectedStatus: '',
  dateRange: { startDate: null, endDate: null, field: '' },
};

/**
 * Custom hook for OGX realizations filtering
 * 
 * @param {Object} options - Hook options
 * @param {Array} options.originalLeads - Original unfiltered leads array
 * @param {Function} options.onFilterChange - Callback when filters change
 * @returns {Object} - Filter state and actions
 */
export function useOGXFilters({ originalLeads = [], onFilterChange } = {}) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  /**
   * Apply filters to leads
   */
  const applyFilters = useCallback((leadsToFilter, currentFilters = filters) => {
    const {
      searchTerm,
      selectedCountry,
      selectedLanguage,
      selectedHostLC,
      selectedExchangeType,
      selectedStatus,
      dateRange,
    } = currentFilters;

    return leadsToFilter.filter((lead) => {
      if (!lead) return false;

      // Date range filter
      if (dateRange?.field && dateRange?.startDate && dateRange?.endDate) {
        const leadDate = new Date(lead[dateRange.field]);
        if (leadDate < dateRange.startDate || leadDate > dateRange.endDate) {
          return false;
        }
      }

      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        (lead.id?.toString() || '').includes(searchTerm) ||
        (lead.opp_id?.toString() || '').includes(searchTerm) ||
        (lead.expa_person_id?.toString() || '').includes(searchTerm) ||
        (lead.fullName?.toLowerCase() || '').includes(searchLower) ||
        (lead.full_name?.toLowerCase() || '').includes(searchLower) ||
        (lead.phone?.toLowerCase() || '').includes(searchLower) ||
        (lead.contact_number?.toLowerCase() || '').includes(searchLower) ||
        (lead.email?.toLowerCase() || '').includes(searchLower) ||
        `${getCountryCode(lead.homeMC || lead.home_mc_name || '')} ${lead.phone || lead.contact_number || ''}`
          .toLowerCase()
          .includes(searchLower);

      // Country (Host MC) filter
      const matchesMC = !selectedCountry ||
        selectedCountry === 'Show All' ||
        (lead.hostMC || lead.host_mc_name) === selectedCountry;

      // Home LC filter
      const matchesLC = !selectedLanguage ||
        selectedLanguage === 'Show All' ||
        (lead.homeLC || lead.home_lc_name) === selectedLanguage;

      // Host LC filter
      const matchesHostLC = !selectedHostLC ||
        selectedHostLC === 'Show All' ||
        (lead.hostLC || lead.host_lc_name) === selectedHostLC;

      // Exchange type filter
      const matchesProduct = !selectedExchangeType ||
        lead.programme === selectedExchangeType;

      // Status filter
      const matchesStatus = !selectedStatus ||
        selectedStatus === 'Show All' ||
        (lead.status && lead.status.toLowerCase() === selectedStatus.toLowerCase());

      return matchesSearch && matchesMC && matchesLC && matchesHostLC && matchesProduct && matchesStatus;
    });
  }, [filters]);

  /**
   * Get filtered leads
   */
  const filteredLeads = useMemo(() => {
    return applyFilters(originalLeads);
  }, [originalLeads, applyFilters]);

  /**
   * Update a single filter value
   */
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Update multiple filters at once
   */
  const setMultipleFilters = useCallback((updates) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Reset all filters to default
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  /**
   * Handle date range change
   */
  const handleDateRangeChange = useCallback((dateFilter) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
        field: dateFilter.field,
      },
    }));
  }, []);

  /**
   * Clear date filter
   */
  const clearDateFilter = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      dateRange: { startDate: null, endDate: null, field: '' },
    }));
  }, []);

  // Notify parent of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filteredLeads);
    }
  }, [filteredLeads, onFilterChange]);

  return {
    // Current filter values
    ...filters,
    filters,
    filteredLeads,
    
    // Individual setters (for convenience)
    setSearchTerm: (value) => setFilter('searchTerm', value),
    setSelectedCountry: (value) => setFilter('selectedCountry', value),
    setSelectedLanguage: (value) => setFilter('selectedLanguage', value),
    setSelectedHostLC: (value) => setFilter('selectedHostLC', value),
    setSelectedExchangeType: (value) => setFilter('selectedExchangeType', value),
    setSelectedStatus: (value) => setFilter('selectedStatus', value),
    
    // Actions
    setFilter,
    setMultipleFilters,
    resetFilters,
    handleDateRangeChange,
    clearDateFilter,
    applyFilters,
  };
}

export default useOGXFilters;
