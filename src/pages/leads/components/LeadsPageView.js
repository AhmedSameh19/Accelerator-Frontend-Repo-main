import React from 'react';

import { Alert, Box, CircularProgress } from '@mui/material';

import LeadTable from '../../../components/Leads/LeadTable';
import LeadForm from '../../../components/Leads/LeadForm';

import LeadsHeader from './LeadsHeader';
import LeadsFiltersPanel from './LeadsFiltersPanel';

export default function LeadsPageView({
  loading,
  onRefresh,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  totalItems,
  error,
  dateRange,
  onDateFilterChange,
  onClearFilter,
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  contactStatusFilter,
  onContactStatusFilterChange,
  interestedFilter,
  onInterestedFilterChange,
  processStatusFilter,
  onProcessStatusFilterChange,
  reasonFilter,
  onReasonFilterChange,
  leads,
  members,
  onEdit,
  formOpen,
  editing,
  onFormClose,
}) {
  return (
    <Box>
      <LeadsHeader
        loading={loading}
        onRefresh={onRefresh}
        dateRange={dateRange}
        onDateFilterChange={onDateFilterChange}
        onClearFilter={onClearFilter}
      />

      <LeadsFiltersPanel
        searchTerm={searchTerm}
        onSearchTermChange={onSearchTermChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        contactStatusFilter={contactStatusFilter}
        onContactStatusFilterChange={onContactStatusFilterChange}
        interestedFilter={interestedFilter}
        onInterestedFilterChange={onInterestedFilterChange}
        processStatusFilter={processStatusFilter}
        onProcessStatusFilterChange={onProcessStatusFilterChange}
        reasonFilter={reasonFilter}
        onReasonFilterChange={onReasonFilterChange}
      />

      {loading && leads.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {error ? (
        <Box sx={{ py: 1 }}>
          <Alert severity="error" sx={{ mb: 1 }}>
            {error?.message || 'Failed to load leads. You can retry.'}
            {error?.message?.includes('LC ID') && (
              <Box component="div" sx={{ mt: 1, fontSize: '0.875rem' }}>
                <strong>Solution:</strong> Please log out and log back in to refresh your LC information, or contact your administrator to assign an LC to your account.
              </Box>
            )}
          </Alert>
        </Box>
      ) : null}

      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <LeadTable
          leads={leads}
          members={members}
          loading={loading}
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          totalItems={totalItems}
          onEdit={onEdit}
        />
      </Box>

      <LeadForm open={formOpen} initial={editing} onClose={onFormClose} />

    </Box>
  );
}
