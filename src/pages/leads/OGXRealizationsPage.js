/**
 * OGXRealizationsPage
 * 
 * Main page component for managing OGX (Outgoing Exchange) realizations.
 * Handles displaying, filtering, sorting, and bulk assignment of exchange participants.
 * 
 * @module pages/leads/OGXRealizationsPage
 * 
 * Key Features:
 * - Display OGX realizations with filtering and sorting
 * - Bulk assignment of leads to team members
 * - Print functionality for selected leads
 * - Lead profile viewing with preparation steps
 * 
 * Dependencies:
 * - TeamMembersContext: For cached team members data
 * - AuthContext: For user authentication and admin status
 * - CRMTypeContext: For CRM type determination
 * 
 * @see OGXRealizationsView - The presentational component
 * @see useTeamMembersContext - For team members data
 */
import React, { useEffect, useState, useCallback, useMemo } from 'react';

// API Services
import {
  bulkAssignLeads,
  getLeadAssignments,
  getRealizations,
} from '../../api/services/realizationsService';

// Constants
import {
  countries,
  educationLevels,
  exchangeTypes,
  formatDate,
  getCountryCode,
  getUniqueHostLCs,
  getUniqueHostMCs,
  languages,
  statuses,
} from '../../constants/ogxRealizationsConstants';

// Context
import { useAuth } from '../../context/AuthContext';
import { useCRMType } from '../../context/CRMTypeContext';
import { useTeamMembersContext } from '../../context/TeamMembersContext';
import { useSnackbarContext } from '../../context/SnackbarContext';

// Utilities
import { LC_CODES, MC_EGYPT_CODE } from '../../lcCodes';
import { fileToBase64 } from '../../utils/fileToBase64';

// Components
import OGXRealizationsView from './ogx/OGXRealizationsView';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the office ID for API calls based on current user
 * 
 * @param {Object} currentUser - The authenticated user object
 * @param {Array} [currentUser.current_offices] - User's current offices
 * @param {string} [currentUser.lc] - User's LC name
 * @returns {number|null} The office ID or null if not found
 */
function getOfficeId(currentUser) {
  // First try to get from current_offices
  if (currentUser?.current_offices?.[0]?.id) {
    return currentUser.current_offices[0].id;
  }
  
  // Fallback: Try to find by LC name
  const lcName = currentUser?.lc || localStorage.getItem('userLC');
  if (lcName && Array.isArray(LC_CODES)) {
    const found = LC_CODES.find((lc) => lc.name === lcName);
    if (found) return found.id;
  }
  
  return null;
}


// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * OGXRealizationsPage Component
 * 
 * @param {Object} props
 * @param {string} [props.crmTypeOverride] - Optional CRM type override
 * @returns {JSX.Element}
 */
function OGXRealizationsPage({ crmTypeOverride }) {
  // ---------------------------------------------------------------------------
  // CONTEXT & AUTH
  // ---------------------------------------------------------------------------
  const context = useCRMType();
  const crmType = crmTypeOverride || context.crmType;
  const { currentUser, isAdmin } = useAuth();
  const { members, fetchMembers, hasFetched: membersFetched } = useTeamMembersContext();
  const { showSuccess, showError, showWarning, showInfo } = useSnackbarContext();

  // ---------------------------------------------------------------------------
  // FILTER STATE
  // ---------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedExchangeType, setSelectedExchangeType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedHostLC, setSelectedHostLC] = useState('');
  const [selectedAssignedMember, setSelectedAssignedMember] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  // ---------------------------------------------------------------------------
  // DATA STATE
  // ---------------------------------------------------------------------------
  const [leads, setLeads] = useState([]);
  const [originalLeads, setOriginalLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // ---------------------------------------------------------------------------
  // DIALOG STATE
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // PROFILE TAB STATE
  // ---------------------------------------------------------------------------
  const [tab, setTab] = useState(0);
  const [prepState, setPrepState] = useState({});

  // ---------------------------------------------------------------------------
  // SORTING STATE
  // ---------------------------------------------------------------------------
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');

  // ---------------------------------------------------------------------------
  // BULK ASSIGNMENT STATE
  // ---------------------------------------------------------------------------
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [bulkAssignLoading, setBulkAssignLoading] = useState(false);

  // Suppress unused variable warnings
  void crmType;
  void error;

  // ===========================================================================
  // DATA FETCHING
  // ===========================================================================

  /**
   * Fetch OGX realizations from the API
   * Uses MC_EGYPT_CODE for admins, otherwise user's LC code
   */
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const lcCode = isAdmin ? MC_EGYPT_CODE : getOfficeId(currentUser);
      
      if (!lcCode) {
        showWarning('Unable to determine your office. Please try logging in again.');
        setLeads([]);
        setOriginalLeads([]);
        return;
      }
      
      const data = await getRealizations(lcCode);
      console.log('Fetched OGX realizations:', data);
      setLeads(data || []);
      setOriginalLeads(data || []);
      
      if (!data || data.length === 0) {
        showInfo('No realizations found. They will appear here once available.');
      }
    } catch (err) {
      console.error('Error fetching OGX realizations:', err);
      setError('Unable to load realizations');
      setLeads([]);
      setOriginalLeads([]);
      
      // User-friendly error messages based on error type
      let userMessage = err.friendlyMessage || 'Unable to load realizations. Please try again.';
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        userMessage = 'Your session has expired. Please log in again.';
      } else if (err?.response?.status === 404) {
        userMessage = 'No realizations found for your office.';
      } else if (err?.message?.includes('Network') || err?.code === 'ERR_NETWORK') {
        userMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      showWarning(userMessage);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  // Load preparation state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('prepState');
      if (saved) setPrepState(JSON.parse(saved));
    } catch (e) {
      setPrepState({});
    }
  }, []);

  // Save preparation state to localStorage
  useEffect(() => {
    localStorage.setItem('prepState', JSON.stringify(prepState));
  }, [prepState]);

  // Fetch team members if not already fetched
  useEffect(() => {
    if (!membersFetched && currentUser) {
      fetchMembers(currentUser, isAdmin);
    }
  }, [currentUser, isAdmin, membersFetched, fetchMembers]);

  // ===========================================================================
  // PROFILE HANDLERS
  // ===========================================================================

  /**
   * Open the lead profile dialog
   * @param {Object} lead - The lead to view
   */
  const handleOpenProfile = (lead) => {
    setSelectedLead(lead);
    setOpenProfileDialog(true);
    setTab(0);
  };

  // ===========================================================================
  // BULK ASSIGNMENT HANDLERS
  // ===========================================================================

  /**
   * Handle bulk assignment confirmation
   * Assigns selected leads to the selected member
   */
  const handleBulkAssignConfirm = async () => {
    if (!selectedMember || selectedLeads.length === 0 || bulkAssignLoading) return;
    
    setBulkAssignLoading(true);
    try {
      // Find selected member details
      const selectedMemberData = members.find(m => m.expa_person_id === selectedMember);
      const memberName = selectedMemberData?.full_name || selectedMemberData?.person?.name || 'Unknown Member';
      
      await bulkAssignLeads({
        expa_person_ids: selectedLeads,
        member_id: selectedMember,
      });

      // Immediately update the leads in the UI to show assignments
      const updatedLeads = leads.map(lead => {
        const leadExpaId = lead?.expa_person_id || lead?.expaPerson_id || lead.id;
        if (selectedLeads.includes(leadExpaId)) {
          return {
            ...lead,
            assigned_member_id: selectedMember,
            assigned_member_name: memberName
          };
        }
        return lead;
      });
      
      setLeads(updatedLeads);
      setOriginalLeads(updatedLeads);

      // Update assignments data
      setRefreshKey((prev) => prev + 1);
      
      // Show success message
      const assignCount = selectedLeads.length;
      showSuccess(`Successfully assigned ${assignCount} realization${assignCount > 1 ? 's' : ''} to ${memberName}`);
      
      // Clear selections and close dialog
      setSelectedLeads([]);
      handleBulkAssignClose();
      
    } catch (e) {
      console.error('Error bulk assigning leads:', e);
      
      // User-friendly error messages
      let userMessage = 'Unable to complete the assignment. Please try again.';
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        userMessage = 'You don\'t have permission to assign realizations.';
      } else if (e?.message?.includes('Network') || e?.code === 'ERR_NETWORK') {
        userMessage = 'Connection lost. Please check your internet and try again.';
      }
      
      showWarning(userMessage);
    } finally {
      setBulkAssignLoading(false);
    }
  };


  // ===========================================================================
  // COMPUTED VALUES
  // ===========================================================================

  /** Unique host MCs from the original leads */
  const uniqueHostMCs = getUniqueHostMCs(originalLeads || []);
  
  /** Unique host LCs from the original leads */
  const uniqueHostLCs = getUniqueHostLCs(originalLeads || []);

  // ===========================================================================
  // FILTER HANDLERS
  // ===========================================================================
 
  // Re-run search when filters change
  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedCountry, selectedExchangeType, selectedStatus, selectedHostLC, selectedAssignedMember]);

  /**
   * Handle date filter changes
   * @param {Object} dateFilter - The date filter object
   */
  const handleDateFilterChange = (dateFilter) => {
    setDateRange(dateFilter);
    handleSearch(dateFilter);
  };

  /**
   * Filter leads based on current filter state
   * @param {Object} [searchDateFilter=dateRange] - Date filter to apply
   */
  const handleSearch = (searchDateFilter = dateRange) => {
    const filteredLeads = originalLeads.filter((lead) => {
      // Date range filter
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

      // Get field values (handle both camelCase and snake_case)
      const leadFullName = (lead.fullName || lead.full_name || '').toLowerCase();
      const leadPhone = (lead.phone || lead.contact_number || '').toLowerCase();
      const leadHostMC = lead.hostMC || lead.host_mc_name || '';
      const leadHostLC = lead.hostLC || lead.host_lc_name || '';
      const leadHomeLC = lead.homeLC || lead.home_lc_name || '';
      const leadHomeMC = lead.homeMC || lead.home_mc_name || '';
      const leadProgramme = lead.programme || '';
      const leadStatus = (lead.status || '').toLowerCase();

      // Search term filter (ID, name, phone)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        (lead.id?.toString() || '').includes(searchTerm) ||
        (lead.opportunityId?.toString() || '').includes(searchTerm) ||
        (lead.oppId?.toString() || '').includes(searchTerm) ||
        (lead.opportunity_id?.toString() || '').includes(searchTerm) ||
        (lead.expa_person_id?.toString() || '').includes(searchTerm) ||
        leadFullName.includes(searchLower) ||
        leadPhone.includes(searchLower) ||
        `${getCountryCode(leadHomeMC)} ${leadPhone}`.toLowerCase().includes(searchLower);

      // Host MC filter
      const matchesMC =
        selectedCountry === 'Show All' ||
        !selectedCountry ||
        leadHostMC === selectedCountry;

      // Host LC filter
      const matchesHostLC =
        selectedHostLC === 'Show All' ||
        !selectedHostLC ||
        leadHostLC === selectedHostLC;

      // Product/Programme filter
      const matchesProduct = !selectedExchangeType || leadProgramme === selectedExchangeType;

      // Status filter
      const matchesStatus =
        selectedStatus === 'Show All' ||
        !selectedStatus ||
        leadStatus === selectedStatus.toLowerCase();

      // Assigned Member filter
      const leadAssignedMemberId = lead.assigned_member_id || '';
      const matchesAssignedMember =
        selectedAssignedMember === 'all' ||
        !selectedAssignedMember ||
        (selectedAssignedMember === 'unassigned'
          ? !leadAssignedMemberId
          : leadAssignedMemberId === selectedAssignedMember);

      return matchesSearch && matchesMC && matchesHostLC && matchesProduct && matchesStatus && matchesAssignedMember;
    });

    setLeads(filteredLeads);
  };

  // ===========================================================================
  // DIALOG HANDLERS
  // ===========================================================================

  /**
   * Close the add/edit lead dialog and reset form state
   */
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

  /**
   * Handle input change for the lead form
   * @param {string} field - The field name to update
   * @returns {Function} Event handler function
   */
  const handleInputChange = (field) => (event) => {
    setNewLead((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  /**
   * Save the current lead (create or update)
   */
  const handleSaveLead = () => {
    const now = new Date().toISOString();
    let updatedLeads;

    if (selectedLead) {
      // Update existing lead
      updatedLeads = leads.map((lead) =>
        lead.id === selectedLead.id
          ? { ...newLead, id: selectedLead.id, lastUpdated: now }
          : lead
      );
    } else {
      // Create new lead
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

  /**
   * Close the lead profile dialog
   */
  const handleCloseProfile = () => {
    setSelectedLead(null);
    setOpenProfileDialog(false);
  };

  // ===========================================================================
  // UTILITY FUNCTIONS
  // ===========================================================================

  /**
   * Copy a value to clipboard
   * @param {string} value - The value to copy
   * @param {string} title - The field title (for logging)
   * @param {Object} lead - The lead object (unused)
   */
  const copyToClipboard = (value, title, lead) => {
    void lead;
    console.log(`Copying ${title} to clipboard: ${value}`);
  };

  // ===========================================================================
  // SORTING HANDLERS
  // ===========================================================================

  /**
   * Handle sort request for a column
   * @param {string} property - The column property to sort by
   */
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  /**
   * Calculate days until realization from slot start date
   * @param {string} apdDate - APD date (unused)
   * @param {string} slotStartDate - Slot start date
   * @returns {number|string} Days until realization or '-' if invalid
   */
  const calculateDaysTillRealization = (apdDate, slotStartDate) => {
    void apdDate;
    if (!slotStartDate) return '-';
    const today = new Date();
    const slotStart = new Date(slotStartDate);
    const diffTime = slotStart - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  /**
   * Sort data by a given key and order
   * Handles null values and different data types safely
   * 
   * @param {Array} data - The data array to sort
   * @param {string} sortKey - The key to sort by
   * @param {string} sortOrder - 'asc' or 'desc'
   * @returns {Array} Sorted data array
   */
  const sortData = (data, sortKey, sortOrder) => {
    return [...data].sort((a, b) => {
      const orderModifier = sortOrder === 'asc' ? 1 : -1;
      
      // Helper function to safely compare values
      const safeCompare = (aVal, bVal) => {
        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return -1;
        if (bVal == null) return 1;
        
        // Convert to strings for comparison
        const aStr = String(aVal);
        const bStr = String(bVal);
        return aStr.localeCompare(bStr);
      };
      
      // Helper function for numeric comparison
      const numericCompare = (aVal, bVal) => {
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        if (isNaN(aNum) && isNaN(bNum)) return 0;
        if (isNaN(aNum)) return -1;
        if (isNaN(bNum)) return 1;
        return aNum - bNum;
      };
      
      if (sortKey === 'id') {
        return numericCompare(a.id, b.id) * orderModifier;
      } else if (sortKey === 'fullName') {
        return safeCompare(a.fullName || a.full_name, b.fullName || b.full_name) * orderModifier;
      } else if (sortKey === 'phone') {
        return safeCompare(a.phone || a.contact_number, b.phone || b.contact_number) * orderModifier;
      } else if (sortKey === 'homeLC') {
        return safeCompare(a.homeLC || a.home_lc_name, b.homeLC || b.home_lc_name) * orderModifier;
      } else if (sortKey === 'homeMC') {
        return safeCompare(a.homeMC || a.home_mc_name, b.homeMC || b.home_mc_name) * orderModifier;
      } else if (sortKey === 'programme') {
        return safeCompare(a.programme, b.programme) * orderModifier;
      } else if (sortKey === 'status') {
        return safeCompare(a.status, b.status) * orderModifier;
      } else if (sortKey === 'daysTillRealization') {
        const aStartDate = a.slotStartDate || a.slot_start_date;
        const bStartDate = b.slotStartDate || b.slot_start_date;
        const aAPDDate = a.apdDate || a.created_at;
        const bAPDDate = b.apdDate || b.created_at;
        return (
          calculateDaysTillRealization(aAPDDate, aStartDate) -
          calculateDaysTillRealization(bAPDDate, bStartDate)
        ) * orderModifier;
      } else if (sortKey === 'apdDate') {
        return safeCompare(a.apdDate || a.created_at, b.apdDate || b.created_at) * orderModifier;
      } else if (sortKey === 'slotStartDate') {
        return safeCompare(a.slotStartDate || a.slot_start_date, b.slotStartDate || b.slot_start_date) * orderModifier;
      }
      return 0;
    });
  };

  // ===========================================================================
  // SELECTION HANDLERS
  // ===========================================================================

  /**
   * Handle selection of a single lead
   * Uses expa_person_id for selection tracking
   * 
   * @param {string|number} leadId - The lead ID
   */
  const handleSelectLead = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    const expaPersonId = lead?.expa_person_id || lead?.expaPerson_id || leadId;
    
    setSelectedLeads((prev) => {
      if (prev.includes(expaPersonId)) {
        return prev.filter((id) => id !== expaPersonId);
      }
      return [...prev, expaPersonId];
    });
  };

  /**
   * Handle select all leads toggle
   * @param {Object} event - The checkbox change event
   */
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedLeads(leads.map((lead) => lead.expa_person_id || lead.expaPerson_id || lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  /**
   * Open the bulk assign dialog
   */
  const handleAssignClick = () => {
    setBulkAssignDialogOpen(true);
  };

  /**
   * Close the bulk assign dialog and reset state
   */
  const handleBulkAssignClose = () => {
    setBulkAssignDialogOpen(false);
    setSelectedMember('');
    setBulkAssignLoading(false);
  };

  // ===========================================================================
  // PRINT HANDLER
  // ===========================================================================

  /**
   * Print selected leads in a new window
   * Creates a formatted table with styling for printing
   */
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
        const leadExpaId = lead?.expa_person_id || lead?.expaPerson_id || lead.id;
        if (selectedLeads.includes(leadExpaId)) {
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
            <td>${lead.assigned_member_name || '-'}</td>
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

  // ===========================================================================
  // RENDER
  // ===========================================================================

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
      selectedExchangeType={selectedExchangeType}
      setSelectedExchangeType={setSelectedExchangeType}
      selectedStatus={selectedStatus}
      setSelectedStatus={setSelectedStatus}
      selectedAssignedMember={selectedAssignedMember}
      setSelectedAssignedMember={setSelectedAssignedMember}
      uniqueHostMCs={uniqueHostMCs}
      uniqueHostLCs={uniqueHostLCs}
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
      bulkAssignDialogOpen={bulkAssignDialogOpen}
      handleBulkAssignClose={handleBulkAssignClose}
      selectedMember={selectedMember}
      setSelectedMember={setSelectedMember}
      members={members}
      handleBulkAssignConfirm={handleBulkAssignConfirm}
      bulkAssignLoading={bulkAssignLoading}
    />
  );
}

export default OGXRealizationsPage;
