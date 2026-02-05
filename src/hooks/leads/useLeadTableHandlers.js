import { useState } from 'react';
import leadsApi from '../../api/services/leadsApi';

export function useLeadTableHandlers({ onLoadMore, hasMore, loading, leads, isICX = false }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [assignedMemberFilter, setAssignedMemberFilter] = useState('');
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);

  const handleProfileClick = (lead) => {
    const normalizedLead =
      lead && lead.expa_status == null && lead.status != null
        ? { ...lead, expa_status: lead.status }
        : lead;

    setSelectedLead(normalizedLead);
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

  const getLeadSelectionId = (lead) => {
    if (!lead) return null;
    if (isICX) return lead.application_id ?? lead.id ?? lead.expa_person_id;
    return lead.id ?? lead.expa_person_id;
  };

  const handleSelectAll = (event, filteredLeads) => {
    if (event.target.checked) {
      const newSelected = filteredLeads
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((lead) => getLeadSelectionId(lead))
        .filter((id) => id != null);
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
        const response = isICX
          ? await leadsApi.bulkAssignICXLeads({
              application_ids: selectedLeads,
              member_id: selectedMember,
            })
          : await leadsApi.bulkAssignLeads({
              expa_person_ids: selectedLeads,
              member_id: selectedMember,
            });
        console.log('Bulk assign response:', response);
        refreshTable();
        setSelectedLeads([]);
        handleBulkAssignClose();
      } catch (error) {
        console.error('Error bulk assigning leads:', error);
      }
    }
  };

  const handleAssignedMemberFilterChange = (value) => {
    setAssignedMemberFilter(value);
    setPage(0); // Reset to first page when filter changes
  };

  return {
    selectedLead,
    profileOpen,
    page,
    rowsPerPage,
    refreshKey,
    assignDialogOpen,
    selectedMember,
    selectedLeads,
    assignedMemberFilter,
    bulkAssignDialogOpen,
    setSelectedMember,
    setAssignedMemberFilter: handleAssignedMemberFilterChange,
    handleProfileClick,
    handleProfileClose,
    handleChangePage,
    handleChangeRowsPerPage,
    refreshTable,
    handleAssignClose,
    handleSelectAll,
    handleSelectLead,
    handleBulkAssignClick,
    handleBulkAssignClose,
    handleBulkAssignConfirm
  };
}

