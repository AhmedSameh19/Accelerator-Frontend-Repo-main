import React, { useEffect, useRef, useState } from 'react';

import Cookies from 'js-cookie';

import { fetchActiveMembers } from '../../api/services/membersAPI';
import {
  bulkAssignLeads,
  getLeadAssignments,
  getRealizations,
} from '../../api/services/realizationsService';
import {
  countries,
  educationLevels,
  exchangeTypes,
  formatDate,
  getCountryCode,
  getUniqueHomeLCs,
  getUniqueHostLCs,
  getUniqueHostMCs,
  languages,
  statuses,
} from '../../constants/ogxRealizationsConstants';
import { useAuth } from '../../context/AuthContext';
import { useCRMType } from '../../context/CRMTypeContext';
import { LC_CODES, MC_EGYPT_CODE } from '../../lcCodes';
import { getCrmAccessToken } from '../../utils/crmToken';
import { fileToBase64 } from '../../utils/fileToBase64';

import OGXRealizationsView from './ogx/OGXRealizationsView';


function getOfficeId(currentUser) {
  if (currentUser?.current_offices?.[0]?.id) {
    return currentUser.current_offices[0].id;
  }
  const lcName = currentUser?.lc || localStorage.getItem('userLC');
  if (lcName && Array.isArray(LC_CODES)) {
    const found = LC_CODES.find((lc) => lc.name === lcName);
    if (found) return found.id;
  }
  return null;
}

const getTeamUnderCurrentUser = (membersTree) => {
  const currentUserId = Cookies.get('person_id');
  const userRole = Cookies.get('userRole');
  if (!membersTree || !currentUserId) return [];

  // If user is LCVP, return all TLs + TMs under them.
  if (userRole && userRole.toUpperCase().includes('LCVP')) {
    const allMembers = [];
    for (const member of membersTree.children || []) {
      allMembers.push({ id: member.id, role: member.role, person: member.person });
      for (const child of member.children || []) {
        allMembers.push({ id: child.id, role: child.role, person: child.person });
      }
    }

    allMembers.sort((a, b) => {
      const order = { TL: 1, TM: 2 };
      const aRole = a.role?.toUpperCase().includes('TL') ? 'TL' : 'TM';
      const bRole = b.role?.toUpperCase().includes('TL') ? 'TL' : 'TM';
      return order[aRole] - order[bRole];
    });

    return allMembers;
  }

  let targetNode = null;
  const findNode = (node) => {
    if (String(node.user_id) === String(currentUserId)) {
      targetNode = node;
      return;
    }
    for (const child of node.children || []) {
      findNode(child);
      if (targetNode) return;
    }
  };

  for (const member of membersTree.children || []) {
    findNode(member);
    if (targetNode) break;
  }

  if (!targetNode) return [];

  const children =
    targetNode.children?.map((child) => ({
      id: child.id,
      role: child.role,
      person: child.person,
    })) || [];

  children.sort((a, b) => {
    const order = { TL: 1, TM: 2 };
    const aRole = a.role?.toUpperCase().includes('TL') ? 'TL' : 'TM';
    const bRole = b.role?.toUpperCase().includes('TL') ? 'TL' : 'TM';
    return order[aRole] - order[bRole];
  });

  return children;
};


function OGXRealizationsPage({ crmTypeOverride }) {
  const context = useCRMType();
  const crmType = crmTypeOverride || context.crmType;
  const { currentUser, isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedExchangeType, setSelectedExchangeType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [leads, setLeads] = useState([]);
  const [originalLeads, setOriginalLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newLead, setNewLead] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    language: '',
    educationLevel: '',
    exchangeType: '',
    status: 'New Lead',
    comments: [],
    followups: [],
  });
  const [tab, setTab] = useState(0);
  const [prepState, setPrepState] = useState({});
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');
  const [selectedHostLC, setSelectedHostLC] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const membersFetched = useRef(false);
  const [members, setActiveMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // keep previous variables (behavior unchanged)
  void crmType;
  void error;

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await getRealizations();
      if (data && data.ogx) {
        setLeads(data.ogx);
        setOriginalLeads(data.ogx);
        setSnackbar({
          open: true,
          message: `Successfully loaded ${data.ogx.length} Expected Realizations from AIESEC API`,
          severity: 'success',
        });
      } else {
        setLeads([]);
        setOriginalLeads([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching OGX realizations:', err);
      setError('Failed to fetch leads. Please try again later.');
      setLeads([]);
      setOriginalLeads([]);
      setSnackbar({
        open: true,
        message: 'Failed to fetch OGX realizations',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('prepState');
      if (saved) setPrepState(JSON.parse(saved));
    } catch (e) {
      setPrepState({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('prepState', JSON.stringify(prepState));
  }, [prepState]);

  useEffect(() => {
    const lcCode = isAdmin ? MC_EGYPT_CODE : getOfficeId(currentUser);
    const token = getCrmAccessToken();

    if (!isAdmin && !lcCode) {
      setActiveMembers([]);
      return;
    }

    const currentMembers = async () => {
      try {
        const membersTree = await fetchActiveMembers(lcCode, token);
        const filtered = (membersTree || []).filter((member) => {
          const position = member.role;
          const parentTitle = String(member.function || '').toUpperCase();
          const isLCVP = position === 'LCVP';
          const isUnderOGX =
            parentTitle.includes('OGV') ||
            parentTitle.includes('OGTA') ||
            parentTitle.includes('OGTE') ||
            parentTitle.includes('OGX');
          return isLCVP && isUnderOGX;
        });

        const teamMembers = filtered[0] ? getTeamUnderCurrentUser(filtered[0]) : [];
        setActiveMembers(teamMembers);
      } catch (e) {
        console.error('Error fetching active members:', e);
        setSnackbar({
          open: true,
          message: 'Failed to fetch active members',
          severity: 'error',
        });
      }
    };

    if (!membersFetched.current && lcCode) {
      membersFetched.current = true;
      currentMembers();
    }
  }, [currentUser, isAdmin]);

  const handleOpenProfile = (lead) => {
    setSelectedLead(lead);
    setOpenProfileDialog(true);
    setTab(0);
  };

  const getAssignedMember = (leadId) => {
    if (assignments.length === 0) return null;
    for (const assignment of assignments) {
      if (parseInt(assignment.id, 10) === parseInt(leadId, 10)) {
        const member = members.find((m) => m.id === assignment.assigned_to);
        return member?.person || null;
      }
    }
    return null;
  };

  const handleBulkAssignConfirm = async () => {
    if (!selectedMember || selectedLeads.length === 0) return;
    try {
      await bulkAssignLeads({
        leadIds: selectedLeads,
        assigned_to: selectedMember,
      });

      setRefreshKey((prev) => prev + 1);
      const updatedAssignments = await getLeadAssignments();
      setAssignments(updatedAssignments);

      setSnackbar({
        open: true,
        message: `Successfully assigned ${selectedLeads.length} realizations to member`,
        severity: 'success',
      });

      setSelectedLeads([]);
      handleBulkAssignClose();
    } catch (e) {
      console.error('Error bulk assigning leads:', e);
      setSnackbar({
        open: true,
        message: 'Failed to assign realizations',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const assignmentsData = await getLeadAssignments();
        setAssignments(assignmentsData);
      } catch (e) {
        console.error('Error fetching lead assignments:', e);
      }
    };
    fetchAssignments();
  }, [refreshKey]);

  const uniqueHostMCs = getUniqueHostMCs(originalLeads || []);
  const uniqueHostLCs = getUniqueHostLCs(originalLeads || []);
  const uniqueHomeLCs = getUniqueHomeLCs(originalLeads || []);

 
  
  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedCountry, selectedLanguage, selectedExchangeType, selectedStatus]);

  const handleDateFilterChange = (dateFilter) => {
    setDateRange(dateFilter);
    handleSearch(dateFilter);
  };

  const handleSearch = (searchDateFilter = dateRange) => {
    const filteredLeads = originalLeads.filter((lead) => {
      if (
        searchDateFilter?.field &&
        searchDateFilter?.startDate &&
        searchDateFilter?.endDate
      ) {
        const leadDate = new Date(lead[searchDateFilter.field]);
        if (leadDate < searchDateFilter.startDate || leadDate > searchDateFilter.endDate) {
          return false;
        }
      }

      if (!lead) return false;

      const matchesSearch =
        (lead.id?.toString() || '').includes(searchTerm) ||
        (lead.opportunityId?.toString() || '').includes(searchTerm) ||
        (lead.oppId?.toString() || '').includes(searchTerm) ||
        (lead.opportunity_id?.toString() || '').includes(searchTerm) ||
        (lead.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (lead.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        `${getCountryCode(lead.homeMC || '')} ${lead.phone || ''}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesMC =
        selectedCountry === 'Show All' ||
        !selectedCountry ||
        lead.hostMC === selectedCountry;

      const matchesLC =
        selectedLanguage === 'Show All' ||
        !selectedLanguage ||
        lead.homeLC === selectedLanguage;

      const matchesHostLC =
        selectedHostLC === 'Show All' ||
        !selectedHostLC ||
        lead.hostLC === selectedHostLC;

      const matchesProduct = !selectedExchangeType || lead.programme === selectedExchangeType;

      const matchesStatus =
        selectedStatus === 'Show All' ||
        !selectedStatus ||
        (lead.status && lead.status.toLowerCase() === selectedStatus.toLowerCase());

      return matchesSearch && matchesMC && matchesLC && matchesHostLC && matchesProduct && matchesStatus;
    });

    setLeads(filteredLeads);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLead(null);
    setNewLead({
      fullName: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      language: '',
      educationLevel: '',
      exchangeType: '',
      status: 'New Lead',
      comments: [],
      followups: [],
    });
  };

  const handleInputChange = (field) => (event) => {
    setNewLead((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSaveLead = () => {
    const now = new Date().toISOString();
    let updatedLeads;

    if (selectedLead) {
      updatedLeads = leads.map((lead) =>
        lead.id === selectedLead.id
          ? { ...newLead, id: selectedLead.id, lastUpdated: now }
          : lead
      );
    } else {
      const leadToAdd = {
        ...newLead,
        id: Date.now(),
        createdAt: now,
        lastUpdated: now,
      };
      updatedLeads = [...leads, leadToAdd];
    }

    setLeads(updatedLeads);
    handleCloseDialog();
    handleSearch();
  };

  const handleCloseProfile = () => {
    setSelectedLead(null);
    setOpenProfileDialog(false);
  };

  const copyToClipboard = (value, title, lead) => {
    void lead;
    console.log(`Copying ${title} to clipboard: ${value}`);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const calculateDaysTillRealization = (apdDate, slotStartDate) => {
    void apdDate;
    if (!slotStartDate) return '-';
    const today = new Date();
    const slotStart = new Date(slotStartDate);
    const diffTime = slotStart - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const sortData = (data, sortKey, sortOrder) => {
    return [...data].sort((a, b) => {
      const orderModifier = sortOrder === 'asc' ? 1 : -1;
      if (sortKey === 'id') {
        return a.id.localeCompare(b.id) * orderModifier;
      } else if (sortKey === 'fullName') {
        return a.fullName.localeCompare(b.fullName) * orderModifier;
      } else if (sortKey === 'phone') {
        return a.phone.localeCompare(b.phone) * orderModifier;
      } else if (sortKey === 'homeLC') {
        return a.homeLC.localeCompare(b.homeLC) * orderModifier;
      } else if (sortKey === 'homeMC') {
        return a.homeMC.localeCompare(b.homeMC) * orderModifier;
      } else if (sortKey === 'programme') {
        return a.programme.localeCompare(b.programme) * orderModifier;
      } else if (sortKey === 'status') {
        return a.status.localeCompare(b.status) * orderModifier;
      } else if (sortKey === 'daysTillRealization') {
        return (
          calculateDaysTillRealization(a.apdDate, a.slotStartDate) -
          calculateDaysTillRealization(b.apdDate, b.slotStartDate) * orderModifier
        );
      } else if (sortKey === 'apdDate') {
        return a.apdDate.localeCompare(b.apdDate) * orderModifier;
      } else if (sortKey === 'slotStartDate') {
        return a.slotStartDate.localeCompare(b.slotStartDate) * orderModifier;
      }
      return 0;
    });
  };

  const handleSelectLead = (leadId) => {
    setSelectedLeads((prev) => {
      if (prev.includes(leadId)) {
        return prev.filter((id) => id !== leadId);
      }
      return [...prev, leadId];
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedLeads(leads.map((lead) => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleAssignClick = () => {
    setBulkAssignDialogOpen(true);
  };

  const handleBulkAssignClose = () => {
    setBulkAssignDialogOpen(false);
    setSelectedMember('');
  };

  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const tableContainer = document.querySelector('.MuiTableContainer-root');

    const tableClone = tableContainer.cloneNode(true);

    const headers = tableClone.querySelectorAll('th');
    headers.forEach((header) => {
      const text = header.textContent.trim();
      header.innerHTML = text;
      header.removeAttribute('aria-sort');
      header.removeAttribute('role');
      header.removeAttribute('tabindex');
      header.removeAttribute('class');
      header.style.cssText = `
        background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
        color: white !important;
        padding: 8px !important;
        text-align: left;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border: none !important;
        position: relative;
        line-height: 1.1;
      `;
    });

    const chips = tableClone.querySelectorAll('.MuiChip-root');
    chips.forEach((chip) => {
      const label = chip.textContent.toLowerCase();
      let bgColor = '#e0e0e0';

      if (label === 'gv') bgColor = '#F85A40';
      else if (label === 'gta') bgColor = '#0CB9C1';
      else if (label === 'gte') bgColor = '#F48924';
      else if (label === 'approved') bgColor = '#4caf50';
      else if (label === 'realized') bgColor = '#1976d2';
      else if (label === 'finished') bgColor = '#ffc107';
      else if (label === 'completed') bgColor = '#ff9800';
      else if (label === 'rejected') bgColor = '#f44336';
      else if (label === 'on hold') bgColor = '#ff9800';

      chip.style.cssText = `
        background-color: ${bgColor} !important;
        color: white !important;
        border: none !important;
        padding: 4px 8px !important;
        border-radius: 16px !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        display: inline-flex !important;
        align-items: center !important;
        margin: 1px !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
      `;
    });

    const copyButtons = tableClone.querySelectorAll('.MuiIconButton-root');
    copyButtons.forEach((button) => button.remove());

    const checkboxes = tableClone.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => checkbox.parentElement.parentElement.remove());

    const tbody = tableClone.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    if (selectedLeads.length > 0) {
      rows.forEach((row) => row.remove());

      leads.forEach((lead) => {
        if (selectedLeads.includes(lead.id)) {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${lead.fullName || '-'}</td>
            <td>${getCountryCode(lead.homeMC)} ${lead.phone || '-'}</td>
            <td>${lead.homeLC || '-'}</td>
            <td>${lead.homeMC || '-'}</td>
            <td>${lead.hostMC || '-'}</td>
            <td>${lead.hostLC || '-'}</td>
            <td>
              <span class="MuiChip-root" style="background-color: ${
                lead.programme?.toLowerCase() === 'gv'
                  ? '#F85A40'
                  : lead.programme?.toLowerCase() === 'gta'
                    ? '#0CB9C1'
                    : lead.programme?.toLowerCase() === 'gte'
                      ? '#F48924'
                      : '#e0e0e0'
              } !important; color: white !important; border: none !important; padding: 4px 8px !important; border-radius: 16px !important; font-size: 11px !important; font-weight: 600 !important; display: inline-flex !important; align-items: center !important; margin: 1px !important; box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;">
                ${lead.programme || '-'}
              </span>
            </td>
            <td>
              <span class="MuiChip-root" style="background-color: ${
                lead.status?.toLowerCase() === 'approved'
                  ? '#4caf50'
                  : lead.status?.toLowerCase() === 'realized'
                    ? '#1976d2'
                    : lead.status?.toLowerCase() === 'finished'
                      ? '#ffc107'
                      : lead.status?.toLowerCase() === 'completed'
                        ? '#ff9800'
                        : lead.status?.toLowerCase() === 'rejected'
                          ? '#f44336'
                          : lead.status?.toLowerCase() === 'on hold'
                            ? '#ff9800'
                            : '#e0e0e0'
              } !important; color: white !important; border: none !important; padding: 4px 8px !important; border-radius: 16px !important; font-size: 11px !important; font-weight: 600 !important; display: inline-flex !important; align-items: center !important; margin: 1px !important; box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;">
                ${lead.status || '-'}
              </span>
            </td>
            <td>${calculateDaysTillRealization(lead.apdDate, lead.slotStartDate)}</td>
            <td>${formatDate(lead.apdDate)}</td>
            <td>${formatDate(lead.slotStartDate)}</td>
            <td>${getAssignedMember(lead.id) || '-'}</td>
          `;
          tbody.appendChild(row);
        }
      });
    }

    printWindow.document.body.appendChild(tableClone);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <OGXRealizationsView
      fetchLeads={fetchLeads}
      loading={loading}
      selectedLeads={selectedLeads}
      handleAssignClick={handleAssignClick}
      handlePrint={handlePrint}
      handleDateFilterChange={handleDateFilterChange}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedCountry={selectedCountry}
      setSelectedCountry={setSelectedCountry}
      selectedHostLC={selectedHostLC}
      setSelectedHostLC={setSelectedHostLC}
      selectedLanguage={selectedLanguage}
      setSelectedLanguage={setSelectedLanguage}
      selectedExchangeType={selectedExchangeType}
      setSelectedExchangeType={setSelectedExchangeType}
      selectedStatus={selectedStatus}
      setSelectedStatus={setSelectedStatus}
      uniqueHostMCs={uniqueHostMCs}
      uniqueHostLCs={uniqueHostLCs}
      uniqueHomeLCs={uniqueHomeLCs}
      exchangeTypes={exchangeTypes}
      statuses={statuses}
      leads={leads}
      order={order}
      orderBy={orderBy}
      handleRequestSort={handleRequestSort}
      sortData={sortData}
      handleSelectAll={handleSelectAll}
      handleSelectLead={handleSelectLead}
      handleOpenProfile={handleOpenProfile}
      getCountryCode={getCountryCode}
      copyToClipboard={copyToClipboard}
      calculateDaysTillRealization={calculateDaysTillRealization}
      formatDate={formatDate}
      getAssignedMember={getAssignedMember}
      openDialog={openDialog}
      handleCloseDialog={handleCloseDialog}
      selectedLead={selectedLead}
      newLead={newLead}
      handleInputChange={handleInputChange}
      countries={countries}
      languages={languages}
      educationLevels={educationLevels}
      handleSaveLead={handleSaveLead}
      openProfileDialog={openProfileDialog}
      handleCloseProfile={handleCloseProfile}
      tab={tab}
      setTab={setTab}
      prepState={prepState}
      setPrepState={setPrepState}
      fileToBase64={fileToBase64}
      snackbar={snackbar}
      setSnackbar={setSnackbar}
      bulkAssignDialogOpen={bulkAssignDialogOpen}
      handleBulkAssignClose={handleBulkAssignClose}
      selectedMember={selectedMember}
      setSelectedMember={setSelectedMember}
      members={members}
      handleBulkAssignConfirm={handleBulkAssignConfirm}
    />
  );
}

export default OGXRealizationsPage;
