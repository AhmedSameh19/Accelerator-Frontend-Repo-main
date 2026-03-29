import React, { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';

import { useAuth } from '../../../context/AuthContext';
import { useTeamMembersContext } from '../../../context/TeamMembersContext';
import { useSnackbarContext } from '../../../context/SnackbarContext';

import { LC_CODES } from '../../../lcCodes';

import { filterLeads } from '../../../utils/leads/filterLeads';

import LeadsPageView from '../components/LeadsPageView';

import { useLeadsCursorFetch } from '../../../hooks/leads/useLeadsCursorFetch';
import { useLeadStatuses } from '../../../hooks/leads/useLeadStatuses';

function getOfficeId(currentUser) {
  if (currentUser?.current_offices?.[0]?.id) {
    return currentUser.current_offices[0].id;
  }

  const lcName =
    currentUser?.lc ||
    currentUser?.userLC ||
    localStorage.getItem('userLC') ||
    Cookies.get('userLC') ||
    null;

  if (lcName && Array.isArray(LC_CODES)) {
    const found = LC_CODES.find(
      (lc) =>
        lc.name === lcName ||
        lc.name?.toLowerCase() === String(lcName).toLowerCase() ||
        String(lc.id) === String(lcName),
    );
    if (found) return found.id;
  }

  return null;
}

export default function ICXLeadsPage() {
  const { currentUser, isAdmin } = useAuth();
  const { members, fetchMembers, hasFetched: membersFetched } = useTeamMembersContext();

  const { showSuccess, showError, showWarning, showInfo } = useSnackbarContext();

  // Filters (same as OGX/B2C)
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [statusFilter, setStatusFilter] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState('');
  const [interestedFilter, setInterestedFilter] = useState('');
  const [processStatusFilter, setProcessStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');

  // iCX uses host_lc_id
  const hostLcId = useMemo(() => getOfficeId(currentUser), [currentUser]);

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
  } = useLeadsCursorFetch({
    hostLcId,
    mode: 'icx',
  });

  useEffect(() => {
    if (!membersFetched && currentUser) {
      fetchMembers(currentUser, isAdmin);
    }
  }, [currentUser, isAdmin, membersFetched, fetchMembers]);

  const leadIds = useMemo(() => (leads || []).map((l) => l?.expa_person_id).filter(Boolean), [leads]);
  const { statusById: leadStatusById } = useLeadStatuses(leadIds);

  const filteredLeads = useMemo(() =>
    filterLeads({
      leads,
      searchTerm,
      dateRange,
      statusFilter,
      contactStatusFilter,
      interestedFilter,
      processStatusFilter,
      reasonFilter,
      leadStatusById,
    }),
  [
    leads,
    searchTerm,
    dateRange,
    statusFilter,
    contactStatusFilter,
    interestedFilter,
    processStatusFilter,
    reasonFilter,
    leadStatusById,
  ]);

  const handleDateFilterChange = (dateFilter) => {
    setDateRange({
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate,
      field: dateFilter.field,
    });
  };

  const clearDateFilter = () => {
    setDateRange({ startDate: null, endDate: null, field: '' });
  };

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
      onStatusFilterChange={setStatusFilter}
      contactStatusFilter={contactStatusFilter}
      onContactStatusFilterChange={setContactStatusFilter}
      interestedFilter={interestedFilter}
      onInterestedFilterChange={setInterestedFilter}
      processStatusFilter={processStatusFilter}
      onProcessStatusFilterChange={setProcessStatusFilter}
      reasonFilter={reasonFilter}
      onReasonFilterChange={setReasonFilter}
      leads={filteredLeads}
      members={members || []}
      onEdit={() => {}}
      formOpen={false}
      editing={null}
      onFormClose={() => {}}
    />
  );
}
