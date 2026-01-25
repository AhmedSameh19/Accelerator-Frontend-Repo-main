/**
 * Hook for lead selection management
 * Handles individual and bulk selection with proper ID extraction
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Extract the expa_person_id from a lead object
 * Handles multiple field name formats
 * 
 * @param {Object} lead - Lead object
 * @returns {string|number} - The expa_person_id or fallback to id
 */
const getLeadExpaId = (lead) => {
  return lead?.expa_person_id || lead?.expaPerson_id || lead?.id;
};

/**
 * Custom hook for lead selection management
 * 
 * @param {Object} options - Hook options
 * @param {Array} options.leads - Current leads array
 * @returns {Object} - Selection state and actions
 */
export function useLeadSelection({ leads = [] } = {}) {
  const [selectedIds, setSelectedIds] = useState([]);

  /**
   * Check if a lead is selected
   */
  const isSelected = useCallback((leadId) => {
    const lead = leads.find(l => l.id === leadId);
    const expaId = getLeadExpaId(lead) || leadId;
    return selectedIds.includes(expaId);
  }, [leads, selectedIds]);

  /**
   * Toggle selection for a single lead
   */
  const toggleSelect = useCallback((leadId) => {
    const lead = leads.find(l => l.id === leadId);
    const expaId = getLeadExpaId(lead) || leadId;
    
    setSelectedIds(prev => {
      if (prev.includes(expaId)) {
        return prev.filter(id => id !== expaId);
      }
      return [...prev, expaId];
    });
  }, [leads]);

  /**
   * Handle select all checkbox change
   */
  const handleSelectAll = useCallback((event) => {
    if (event.target.checked) {
      setSelectedIds(leads.map(lead => getLeadExpaId(lead)));
    } else {
      setSelectedIds([]);
    }
  }, [leads]);

  /**
   * Select specific leads by their IDs
   */
  const selectLeads = useCallback((leadIds) => {
    setSelectedIds(leadIds);
  }, []);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  /**
   * Select all visible leads
   */
  const selectAll = useCallback(() => {
    setSelectedIds(leads.map(lead => getLeadExpaId(lead)));
  }, [leads]);

  /**
   * Check if all leads are selected
   */
  const allSelected = useMemo(() => {
    if (!leads.length) return false;
    return leads.every(lead => selectedIds.includes(getLeadExpaId(lead)));
  }, [leads, selectedIds]);

  /**
   * Check if some (but not all) leads are selected
   */
  const someSelected = useMemo(() => {
    if (!leads.length) return false;
    return selectedIds.length > 0 && !allSelected;
  }, [leads.length, selectedIds.length, allSelected]);

  /**
   * Get selected leads objects
   */
  const selectedLeads = useMemo(() => {
    return leads.filter(lead => selectedIds.includes(getLeadExpaId(lead)));
  }, [leads, selectedIds]);

  return {
    // State
    selectedIds,
    selectedCount: selectedIds.length,
    hasSelection: selectedIds.length > 0,
    allSelected,
    someSelected,
    selectedLeads,
    
    // Actions
    isSelected,
    toggleSelect,
    handleSelectAll,
    selectLeads,
    clearSelection,
    selectAll,
  };
}

export default useLeadSelection;
