import React, { useCallback, useMemo, useState } from 'react';
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
    if (currentUser?.current_offices?.[0]?.id) {
      return currentUser.current_offices[0].id;
    }
    const lcName = currentUser?.lc || localStorage.getItem('userLC');
    if (lcName && Array.isArray(LC_CODES)) {
      const found = LC_CODES.find((lc) => lc.name === lcName);
      if (found) return found.id;
    }
    return null;
  }, [currentUser]);

  // This endpoint expects LC id (home_lc_id). Admin should still be scoped to their current office.
  // (Keeping MC_EGYPT_CODE import for compatibility; not used here intentionally.)
  // eslint-disable-next-line no-unused-vars
  const _adminMcCode = isAdmin ? MC_EGYPT_CODE : null;

  const homeLcId = useMemo(() => getOfficeId(), [getOfficeId]);

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
