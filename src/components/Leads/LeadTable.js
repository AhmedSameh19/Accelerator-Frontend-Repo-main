import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import LeadProfile from './LeadProfile';
import leadsApi from '../../api/services/leadsApi';
import LeadTableHeader from './LeadTable/LeadTableHeader';
import LeadTableRow from './LeadTable/LeadTableRow';
import { AssignLeadDialog, BulkAssignDialog } from './LeadTable/LeadTableDialogs';
import { getAssignedMemberId } from './LeadTable/utils';
import { useLeadTableHandlers } from '../../hooks/leads/useLeadTableHandlers';

function LeadTable({ leads, members, loading = false, hasMore = false, onLoadMore }) {
  const theme = useTheme();

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
  } = useLeadTableHandlers({ onLoadMore, hasMore, loading, leads });

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
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedLeads.length > 0 && selectedLeads.length < actuallyFilteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length}
                  checked={actuallyFilteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length > 0 && selectedLeads.length === actuallyFilteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length}
                  onChange={handleSelectAllWithFiltered}
                />
              </TableCell>
              <TableCell>Lead</TableCell>
              <TableCell>LC</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Signup Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actuallyFilteredLeads
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(lead => {
                const leadId = lead.expa_person_id;
                const isSelected = selectedLeads.indexOf(leadId) !== -1;
                
                return (
                  <LeadTableRow
                    key={leadId}
                    lead={lead}
                    isSelected={isSelected}
                    onSelect={handleSelectLead}
                    onProfileClick={handleProfileClick}
                    theme={theme}
                  />
                );
              })}
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
