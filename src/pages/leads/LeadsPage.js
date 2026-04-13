/**
 * LeadsPage
 * 
 * Main page component for managing leads in the CRM system.
 * Handles displaying, filtering, and editing leads.
 * 
 * @module pages/leads/LeadsPage
 * 
 * Key Features:
 * - Display leads with multiple filter options
 * - Search by name, phone, email
 * - Filter by status, contact status, interested, process status
 * - Date range filtering
 * - Infinite scroll pagination with cursor-based fetching
 * - Edit leads through modal form
 * 
 * Dependencies:
 * - TeamMembersContext: For cached team members data
 * - AuthContext: For user authentication and admin status
 * - useLeadsCursorFetch: For paginated lead fetching
 * - useLeadStatuses: For lead status tracking
 * 
 * @see LeadsPageView - The presentational component
 * @see useLeadsCursorFetch - Cursor-based pagination hook
 * @see filterLeads - Lead filtering utility
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';

// Context
import { useAuth } from '../../context/AuthContext';
import { useTeamMembersContext } from '../../context/TeamMembersContext';
import { useCRMType } from '../../context/CRMTypeContext';
import { useSnackbarContext } from '../../context/SnackbarContext';

import ICXLeadsPage from './icx/ICXLeadsPage';

// Constants
import { LC_CODES, MC_EGYPT_CODE } from '../../lcCodes';

// Utilities
import { filterLeads } from '../../utils/leads/filterLeads';

// Components
import LeadsPageView from './components/LeadsPageView';

// Hooks
import { useLeadsCursorFetch } from '../../hooks/leads/useLeadsCursorFetch';
import { useLeadStatuses } from '../../hooks/leads/useLeadStatuses';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * LeadsPage Component
 * 
 * @returns {JSX.Element}
 */
function OGXB2CLeadsPage() {
  // ---------------------------------------------------------------------------
  // CONTEXT & AUTH
  // ---------------------------------------------------------------------------
  const { currentUser, isAdmin } = useAuth();
  const { members, fetchMembers, hasFetched: membersFetched } = useTeamMembersContext();
  const { showSuccess, showError, showWarning, showInfo } = useSnackbarContext();

  // ---------------------------------------------------------------------------
  // FORM STATE
  // ---------------------------------------------------------------------------
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // ---------------------------------------------------------------------------
  // FILTER STATE
  // ---------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [statusFilter, setStatusFilter] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState('');
  const [interestedFilter, setInterestedFilter] = useState('');
  const [processStatusFilter, setProcessStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');

  // ===========================================================================
  // OFFICE ID RESOLUTION
  // ===========================================================================

  /**
   * Get the office/LC ID for API calls
   * Tries multiple sources in order of priority
   * 
   * @returns {number|null} The office ID or null if not found
   */
  const getOfficeId = useCallback(() => {
    // Try multiple sources for LC/office information
    let officeId = null;
    let lcName = null;

    // 1. Try current_offices from user object
    if (currentUser?.current_offices?.[0]?.id) {
      officeId = currentUser.current_offices[0].id;
      console.log('🔍 [LeadsPage] Found office ID from current_offices:', officeId);
      return officeId;
    }

    // 2. Try LC name from various sources
    lcName = currentUser?.lc ||
      currentUser?.userLC ||
      localStorage.getItem('userLC') ||
      Cookies.get('userLC') ||
      null;

    console.log('🔍 [LeadsPage] LC name from various sources:', {
      currentUser_lc: currentUser?.lc,
      currentUser_userLC: currentUser?.userLC,
      localStorage_userLC: localStorage.getItem('userLC'),
      cookie_userLC: Cookies.get('userLC'),
      finalLcName: lcName
    });

    // 3. Try to find LC ID from LC_CODES
    if (lcName && Array.isArray(LC_CODES)) {
      const found = LC_CODES.find((lc) =>
        lc.name === lcName ||
        lc.name?.toLowerCase() === lcName?.toLowerCase() ||
        lc.id?.toString() === lcName?.toString()
      );
      if (found) {
        console.log('🔍 [LeadsPage] Found LC in LC_CODES:', found);
        return found.id;
      } else {
        console.warn('⚠️ [LeadsPage] LC name not found in LC_CODES:', lcName, 'Available LCs:', LC_CODES.map(lc => lc.name));
      }
    }

    console.warn('⚠️ [LeadsPage] Could not determine office/LC ID. Returning null.');
    return null;
  }, [currentUser]);

  // Note: Admin should still be scoped to their current office for this endpoint
  // eslint-disable-next-line no-unused-vars
  const _adminMcCode = isAdmin ? MC_EGYPT_CODE : null;

  /** Computed home LC ID for API calls */
  const homeLcId = useMemo(() => getOfficeId(), [getOfficeId]);

  // Debug logging for homeLcId
  React.useEffect(() => {
    console.log('🔍 [LeadsPage] homeLcId computed:', {
      homeLcId,
      currentUser: currentUser ? {
        id: currentUser.id,
        lc: currentUser.lc,
        current_offices: currentUser.current_offices
      } : null,
      userLC: localStorage.getItem('userLC'),
      isAdmin
    });
  }, [homeLcId, currentUser, isAdmin]);

  // ===========================================================================
  // DATA FETCHING
  // ===========================================================================

  const {
    leads,
    loading,
    refresh,
    error,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalItems
  } = useLeadsCursorFetch({ homeLcId });



  /** Lead IDs for status fetching */
  const leadIds = useMemo(() => (leads || []).map((l) => l?.expa_person_id).filter(Boolean), [leads]);

  /** Lead statuses mapped by ID */
  const { statusById: leadStatusById } = useLeadStatuses(leadIds);

  // ===========================================================================
  // FORM HANDLERS
  // ===========================================================================

  /**
   * Open edit form for a lead
   * @param {Object} lead - The lead to edit
   */
  const handleEditClick = (lead) => {
    setEditing(lead);
    setFormOpen(true);
  };

  /**
   * Close the edit form and reset state
   */
  const handleFormClose = () => {
    setFormOpen(false);
    setEditing(null);
  };

  // ===========================================================================
  // FILTER HANDLERS
  // ===========================================================================

  /**
   * Handle date range filter change
   * @param {Object} dateFilter - The date filter configuration
   */
  const handleDateFilterChange = (dateFilter) => {
    setDateRange({
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate,
      field: dateFilter.field
    });
  };

  /**
   * Clear date range filter
   */
  const clearDateFilter = () => {
    setDateRange({ startDate: null, endDate: null, field: '' });
  };

  /** @param {string} newStatus - New status filter value */
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
  };

  /** @param {string} newStatus - New contact status filter value */
  const handleContactStatusFilterChange = (newStatus) => {
    setContactStatusFilter(newStatus);
  };

  /** @param {string} newStatus - New interested filter value */
  const handleInterestedFilterChange = (newStatus) => {
    setInterestedFilter(newStatus);
  };

  /** @param {string} newStatus - New process status filter value */
  const handleProcessStatusFilterChange = (newStatus) => {
    setProcessStatusFilter(newStatus);
  };

  // ===========================================================================
  // COMPUTED VALUES
  // ===========================================================================

  /** Filtered leads based on current filter state */
  const filteredLeads = filterLeads({
    leads,
    searchTerm,
    dateRange,
    statusFilter,
    contactStatusFilter,
    interestedFilter,
    processStatusFilter,
    reasonFilter,
    leadStatusById,
  });

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <LeadsPageView
      loading={loading}
      onRefresh={refresh}
      error={error}
      page={page}
      setPage={setPage}
      rowsPerPage={rowsPerPage}
      setRowsPerPage={setRowsPerPage}
      totalItems={totalItems}
      dateRange={dateRange}
      onDateFilterChange={handleDateFilterChange}
      onClearFilter={clearDateFilter}
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      statusFilter={statusFilter}
      onStatusFilterChange={handleStatusFilterChange}
      contactStatusFilter={contactStatusFilter}
      onContactStatusFilterChange={handleContactStatusFilterChange}
      interestedFilter={interestedFilter}
      onInterestedFilterChange={handleInterestedFilterChange}
      processStatusFilter={processStatusFilter}
      onProcessStatusFilterChange={handleProcessStatusFilterChange}
      reasonFilter={reasonFilter}
      onReasonFilterChange={setReasonFilter}
      leads={filteredLeads}
      members={members}
      onEdit={handleEditClick}
      formOpen={formOpen}
      editing={editing}
      onFormClose={handleFormClose}
    />
  );
}

export default function LeadsPage() {
  const { crmType } = useCRMType();

  if (crmType === 'iCX') {
    return <ICXLeadsPage />;
  }

  return <OGXB2CLeadsPage />;
}
