/**
 * Hook for bulk lead assignment functionality
 * Handles assignment dialog, loading states, and API calls
 */

import { useState, useCallback } from 'react';
import { bulkAssignLeads } from '../../api/services/realizationsService';
import { useTeamMembersContext } from '../../context/TeamMembersContext';

/**
 * Custom hook for bulk assignment functionality
 * 
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Callback when assignment succeeds
 * @param {Function} options.onError - Callback when assignment fails
 * @returns {Object} - Bulk assignment state and actions
 */
export function useBulkAssignment({ onSuccess, onError } = {}) {
  const { members } = useTeamMembersContext();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Open the assignment dialog
   */
  const openDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  /**
   * Close the assignment dialog and reset state
   */
  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedMember('');
    setLoading(false);
  }, []);

  /**
   * Get member details by ID
   * 
   * @param {string|number} memberId - The member ID
   * @returns {Object|null} - Member object or null
   */
  const getMemberById = useCallback((memberId) => {
    return members.find(m => m.expa_person_id === memberId || m.id === memberId);
  }, [members]);

  /**
   * Get member display name
   * 
   * @param {string|number} memberId - The member ID
   * @returns {string} - Member display name
   */
  const getMemberName = useCallback((memberId) => {
    const member = getMemberById(memberId);
    return member?.full_name || member?.person?.name || member?.person?.full_name || 'Unknown Member';
  }, [getMemberById]);

  /**
   * Perform bulk assignment
   * 
   * @param {Array} selectedLeadIds - Array of lead IDs (expa_person_ids) to assign
   * @returns {Promise<boolean>} - Success status
   */
  const assign = useCallback(async (selectedLeadIds) => {
    if (!selectedMember || !selectedLeadIds?.length || loading) {
      return false;
    }

    setLoading(true);
    
    try {
      const memberName = getMemberName(selectedMember);
      
      await bulkAssignLeads({
        expa_person_ids: selectedLeadIds,
        member_id: selectedMember,
      });

      // Call success callback with assignment details
      if (onSuccess) {
        onSuccess({
          memberId: selectedMember,
          memberName,
          assignedCount: selectedLeadIds.length,
          leadIds: selectedLeadIds,
        });
      }

      closeDialog();
      return true;
      
    } catch (error) {
      console.error('❌ [useBulkAssignment] Error assigning leads:', error);
      
      if (onError) {
        onError(error);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedMember, loading, getMemberName, onSuccess, onError, closeDialog]);

  return {
    // State
    dialogOpen,
    selectedMember,
    loading,
    members,
    
    // Actions
    openDialog,
    closeDialog,
    setSelectedMember,
    assign,
    getMemberById,
    getMemberName,
  };
}

export default useBulkAssignment;
