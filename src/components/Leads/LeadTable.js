import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  useTheme,
  Checkbox,
  Box,
  Typography,
} from '@mui/material';
import EmptyState from '../Common/EmptyState';
import LeadProfile from './LeadProfile';
import LeadTableHeader from './LeadTable/LeadTableHeader';
import LeadTableRow from './LeadTable/LeadTableRow';
import { AssignLeadDialog, BulkAssignDialog } from './LeadTable/LeadTableDialogs';
import { getAssignedMemberId } from './LeadTable/utils';
import { useLeadTableHandlers } from '../../hooks/leads/useLeadTableHandlers';
import { useCRMType } from '../../context/CRMTypeContext';

function LeadTable({ leads, members, loading = false, hasMore = false, onLoadMore }) {
  const theme = useTheme();
  const { crmType } = useCRMType();
  const isICX = crmType === 'iCX';

  // Use hook for state and handlers
  const {
    selectedLead,
    profileOpen,
    page,
    rowsPerPage,
    assignDialogOpen,
    selectedMember,
    selectedLeads,
    assignedMemberFilter,
    bulkAssignDialogOpen,
    setSelectedMember,
    setAssignedMemberFilter,
    handleProfileClick,
    handleProfileClose,
    handleChangePage,
    handleChangeRowsPerPage,
    handleAssignClose,
    handleSelectAll,
    handleSelectLead,
    handleBulkAssignClick,
    handleBulkAssignClose,
    handleBulkAssignConfirm
  } = useLeadTableHandlers({ onLoadMore, hasMore, loading, leads, isICX });

  // Apply filter to leads
  const actuallyFilteredLeads = Array.isArray(leads)
    ? leads.filter((lead) => {
        if (!assignedMemberFilter) return true;
        const assignedId = getAssignedMemberId(lead);
        if (assignedMemberFilter === '__UNASSIGNED__') return assignedId == null;
        return String(assignedId ?? '') === String(assignedMemberFilter);
      })
    : [];

  const hasMoreEffective = !assignedMemberFilter && hasMore;

  // Wrap handleSelectAll to pass filteredLeads
  const handleSelectAllWithFiltered = (event) => {
    handleSelectAll(event, actuallyFilteredLeads);
  };


  return (
    <>
      <LeadTableHeader
        selectedLeadsCount={selectedLeads.length}
        members={members}
        assignedMemberFilter={assignedMemberFilter}
        setAssignedMemberFilter={(value) => {
          setAssignedMemberFilter(value);
        }}
        onBulkAssignClick={handleBulkAssignClick}
      />

      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          '& .MuiTableCell-root': {
            py: 2
          },
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <Table sx={{ minWidth: { xs: 800, sm: 1000 }, whiteSpace: 'nowrap' }}>
          <TableHead>
            <TableRow>
              <TableCell 
                padding="checkbox"
                sx={{ 
                  position: 'sticky', 
                  left: 0, 
                  bgcolor: '#F4F6F9', 
                  zIndex: 3,
                  borderRight: `1px solid ${theme.palette.divider}`
                }}
              >
                <Checkbox
                  indeterminate={selectedLeads.length > 0 && selectedLeads.length < actuallyFilteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length}
                  checked={actuallyFilteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length > 0 && selectedLeads.length === actuallyFilteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length}
                  onChange={handleSelectAllWithFiltered}
                />
              </TableCell>
              <TableCell 
                sx={{ 
                  position: 'sticky', 
                  left: { xs: 48, sm: 58 }, 
                  bgcolor: '#F4F6F9', 
                  zIndex: 3,
                  borderRight: `1px solid ${theme.palette.divider}`
                }}
              >
                Lead
              </TableCell>
              <TableCell>LC</TableCell>
              {isICX ? <TableCell>Home MC</TableCell> : null}
              <TableCell>Phone</TableCell>
              <TableCell>Signup Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actuallyFilteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <EmptyState 
                    title="No Leads Found"
                    description="We couldn't find any leads matching your current view."
                    isFiltered={!!assignedMemberFilter}
                  />
                </TableCell>
              </TableRow>
            ) : (
              actuallyFilteredLeads
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(lead => {
                const selectionId = isICX
                  ? (lead.application_id ?? lead.expa_person_id)
                  : (lead.id ?? lead.expa_person_id);

                const isSelected = selectedLeads.indexOf(selectionId) !== -1;
                
                return (
                  <LeadTableRow
                    key={selectionId}
                    lead={lead}
                    isSelected={isSelected}
                    onSelect={handleSelectLead}
                    onProfileClick={handleProfileClick}
                    theme={theme}
                    isICX={isICX}
                    selectionId={selectionId}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={hasMoreEffective ? -1 : actuallyFilteredLeads.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      </TableContainer>

      <AssignLeadDialog
        open={assignDialogOpen}
        onClose={handleAssignClose}
        members={members}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        onConfirm={handleBulkAssignClose}
      />

      <BulkAssignDialog
        open={bulkAssignDialogOpen}
        onClose={handleBulkAssignClose}
        members={members}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        selectedLeadsCount={selectedLeads.length}
        onConfirm={handleBulkAssignConfirm}
      />

      {/* Existing LeadProfile Dialog */}
      {selectedLead && (
        <LeadProfile
          lead={selectedLead}
          open={profileOpen}
          onClose={handleProfileClose}
          navigationState={{ from: 'leads' }}
        />
      )}
    </>
  );
}

export default LeadTable;
