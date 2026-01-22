import React, { useCallback, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from '../../context/AuthContext';
import { LC_CODES, MC_EGYPT_CODE } from '../../lcCodes';
import { filterLeads } from '../../utils/leads/filterLeads';

import LeadsPageView from './components/LeadsPageView';
import { useLeadsCursorFetch } from '../../hooks/leads/useLeadsCursorFetch';
import { useTeamMembers } from '../../hooks/leads/useTeamMembers';
import { useLeadStatuses } from '../../hooks/leads/useLeadStatuses';


function LeadsPage() {
  const { currentUser, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [statusFilter, setStatusFilter] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState('');
  const [interestedFilter, setInterestedFilter] = useState('');
  const [processStatusFilter, setProcessStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');

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

  // This endpoint expects LC id (home_lc_id). Admin should still be scoped to their current office.
  // (Keeping MC_EGYPT_CODE import for compatibility; not used here intentionally.)
  // eslint-disable-next-line no-unused-vars
  const _adminMcCode = isAdmin ? MC_EGYPT_CODE : null;

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

  const { leads, loading, refresh, loadMore, hasMore, error } = useLeadsCursorFetch({ homeLcId });
  const { members } = useTeamMembers({ homeLcId });

  const leadIds = useMemo(() => (leads || []).map((l) => l?.expa_person_id).filter(Boolean), [leads]);
  const { statusById: leadStatusById } = useLeadStatuses(leadIds);


  const handleEditClick = (lead) => {
    setEditing(lead);
    setFormOpen(true);
  };


  const handleFormClose = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleDateFilterChange = (dateFilter) => {
    setDateRange({
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate,
      field: dateFilter.field
    });
  };

  const clearDateFilter = () => {
    setDateRange({ startDate: null, endDate: null, field: '' });
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
  };

  const handleContactStatusFilterChange = (newStatus) => {
    setContactStatusFilter(newStatus);
  };

  const handleInterestedFilterChange = (newStatus) => {
    setInterestedFilter(newStatus);
  };

  const handleProcessStatusFilterChange = (newStatus) => {
    setProcessStatusFilter(newStatus);
  };

 
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

  return (
    <LeadsPageView
      loading={loading}
      onRefresh={refresh}
      onLoadMore={loadMore}
      hasMore={hasMore}
      error={error}
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
      snackbar={snackbar}
      onSnackbarClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
    />
  );
}

export default LeadsPage;
