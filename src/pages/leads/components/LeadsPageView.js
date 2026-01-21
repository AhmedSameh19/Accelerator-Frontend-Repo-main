import React from 'react';

import { Alert, Box, CircularProgress, Snackbar } from '@mui/material';

import LeadTable from '../../../components/Leads/LeadTable';
import LeadForm from '../../../components/Leads/LeadForm';

import LeadsHeader from './LeadsHeader';
import LeadsFiltersPanel from './LeadsFiltersPanel';

export default function LeadsPageView({
  loading,
  onRefresh,
  onLoadMore,
  hasMore,
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
  snackbar,
  onSnackbarClose,
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
            Failed to load leads. You can retry.
          </Alert>
        </Box>
      ) : null}

      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <LeadTable
          leads={leads}
          members={members}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          onEdit={onEdit}
        />
      </Box>

      <LeadForm open={formOpen} initial={editing} onClose={onFormClose} />

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={onSnackbarClose}>
        <Alert onClose={onSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
