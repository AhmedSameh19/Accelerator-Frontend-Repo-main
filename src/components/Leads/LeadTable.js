import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Box,
  Typography,
  Avatar,
  TablePagination,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Stack,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  AssignmentInd as BulkAssignIcon
} from '@mui/icons-material';
import LeadProfile from './LeadProfile';
import leadsApi from '../../api/services/leadsApi';
const statusColors = {
  open: 'default',
  pending: 'warning',
  accepted: 'success',
  rejected: 'error',
  completed: 'info'
};

const contactStatusColors = {
  'Yes': 'success',
  'No': 'error',
  'No answer': 'warning',
  'Busy': 'info',
  'Out of Service': 'default'
};


function LeadTable({ leads, members, loading = false, hasMore = false, onLoadMore }) {
  
  const [selectedLead, setSelectedLead] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignedMemberFilter, setAssignedMemberFilter] = useState('');

  
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const theme = useTheme();

  const handleProfileClick = (lead) => {
    setSelectedLead(lead);
    setProfileOpen(true);
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
    setSelectedLead(null);
    refreshTable();
  };

  const handleChangePage = async (event, newPage) => {
    if (
      newPage > page &&
      typeof onLoadMore === 'function' &&
      hasMore &&
      !loading &&
      newPage * rowsPerPage >= leads.length
    ) {
      try {
        await onLoadMore();
      } catch (e) {
        console.error('Error loading more leads:', e);
      }
    }

    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const refreshTable = () => {
    setRefreshKey(prev => prev + 1);
  };



  const handleAssignClose = () => {
    setAssignDialogOpen(false);
    setSelectedMember('');
    setSelectedLead(null);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = filteredLeads
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((lead) => lead.id ?? lead.expa_person_id);
      setSelectedLeads(newSelected);
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId) => {
    const selectedIndex = selectedLeads.indexOf(leadId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedLeads, leadId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedLeads.slice(1));
    } else if (selectedIndex === selectedLeads.length - 1) {
      newSelected = newSelected.concat(selectedLeads.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedLeads.slice(0, selectedIndex),
        selectedLeads.slice(selectedIndex + 1),
      );
    }

    setSelectedLeads(newSelected);
  };

  const handleBulkAssignClick = () => {
    setBulkAssignDialogOpen(true);
  };

  const handleBulkAssignClose = () => {
    setBulkAssignDialogOpen(false);
    setSelectedMember('');
  };

const handleBulkAssignConfirm = async () => {
  if (selectedMember && selectedLeads.length > 0) {
    try {
      // Send one request for all selected leads at once
      const response = await leadsApi.bulkAssignLeads({
        expa_person_ids: selectedLeads,
        member_id: selectedMember
      });
      console.log('Bulk assign response:', response);
      // Refresh UI after success
      refreshTable();

      setSelectedLeads([]);
      handleBulkAssignClose();
    } catch (error) {
      console.error('Error bulk assigning leads:', error);
    }
  }
};


  const filteredLeads = Array.isArray(leads)
    ? leads.filter((lead) => {
        if (!assignedMemberFilter) return true;
        const assignedId = getAssignedMemberId(lead);
        if (assignedMemberFilter === '__UNASSIGNED__') return assignedId == null;
        return String(assignedId ?? '') === String(assignedMemberFilter);
      })
    : [];

  const hasMoreEffective = !assignedMemberFilter && hasMore;


  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {selectedLeads.length > 0 ? `${selectedLeads.length} leads selected` : 'All Leads'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Assigned member</InputLabel>
            <Select
              value={assignedMemberFilter}
              label="Assigned member"
              onChange={(e) => {
                setAssignedMemberFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="__UNASSIGNED__">Unassigned</MenuItem>
              {members.map((m) => (
                <MenuItem key={m.expa_person_id} value={String(m.expa_person_id)}>
                  {m.full_name}
                  {m?.role ? ` — ${m.role}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedLeads.length > 0 && (
            <Button
              variant="contained"
              startIcon={<BulkAssignIcon />}
              onClick={handleBulkAssignClick}
            >
              Assign Selected Leads
            </Button>
          )}
        </Box>
      </Box>

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
                  indeterminate={selectedLeads.length > 0 && selectedLeads.length < filteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length}
                  checked={filteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length > 0 && selectedLeads.length === filteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length}
                  onChange={handleSelectAll}
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
            {filteredLeads
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(lead => {
                const leadId = lead.expa_person_id;
                const leadName = lead.full_name ;
                const leadLcName = lead.home_lc_name;
                const leadStatus = lead.expa_status || '-';
                const assignedMember = lead.assigned_member_name || getAssignedMember(leadId);
                const isSelected = selectedLeads.indexOf(leadId) !== -1;
                
                return (
                  <TableRow 
                    key={leadId}
                    hover
                    selected={isSelected}
                    sx={{ 
                      '&:hover': {
                        bgcolor: theme.palette.action.hover
                      }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectLead(leadId)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 },
                        }}
                        onClick={() => handleProfileClick(lead)}
                      >
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 40,
                            height: 40,
                          }}
                        >
                          {(leadName || 'E')?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight="medium"
                            sx={{ color: theme.palette.primary.main }}
                          >
                            {leadName || '-'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {leadId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{leadLcName || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {lead.phone || '-'}
                        {lead.phone && (
                          <Tooltip title="Call">
                            <IconButton
                              size="small"
                              onClick={() => window.location.href = `tel:${lead.phone}`}
                              sx={{ 
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  bgcolor: theme.palette.primary.light
                                }
                              }}
                            >
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={leadStatus || '-'}
                        color={statusColors[leadStatus] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {assignedMember ? (
                        <Chip
                          label={assignedMember || 'Unknown'}
                          size="small"
                          color="primary"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">Not assigned</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={hasMoreEffective ? -1 : filteredLeads.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      </TableContainer>

      {/* Assign Lead Dialog */}
      <Dialog open={assignDialogOpen} onClose={handleAssignClose} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Lead</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Member</InputLabel>
            <Select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              label="Select Member"
            >
              {members.map((member) => (
                <MenuItem key={member.expa_person_id} value={member.expa_person_id}>
                  {member.full_name} 
                  {member?.role ? ` — ${member.role}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignClose}>Cancel</Button>
          <Button 
            onClick={handleBulkAssignClose}
            variant="contained"
            disabled={!selectedMember}
          >
            Assign 
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Assign Dialog */}
      <Dialog open={bulkAssignDialogOpen} onClose={handleBulkAssignClose} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Assign Leads</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography>
              Assigning {selectedLeads.length} leads to:
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select Member</InputLabel>
              <Select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                label="Select Member"
              >
                {members.map((member) => (
                  <MenuItem key={member.expa_person_id} value={member.expa_person_id}>
                    {member.full_name} 
                    {member?.role ? ` — ${member.role}` : ''}

                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkAssignClose}>Cancel</Button>
          <Button 
            onClick={handleBulkAssignConfirm}
            variant="contained"
            disabled={!selectedMember}
          >
            Assign {selectedLeads.length} Leads 
          </Button>
        </DialogActions>
      </Dialog>

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
