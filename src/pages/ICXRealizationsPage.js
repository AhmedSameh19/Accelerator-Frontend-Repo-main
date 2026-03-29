import React, { useState, useEffect, useMemo, useCallback,useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Chip,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Avatar,
  Tabs,
  Tab,
  List as MUIList,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Snackbar,
  Alert,
  TableSortLabel,
  Autocomplete,
  List,
  CircularProgress,
} from '@mui/material';
import { useSnackbarContext } from '../context/SnackbarContext';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  Flag as FlagIcon,
  Language as LanguageIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  AssignmentInd as AssignmentIndIcon,
  LocalHospital as LocalHospitalIcon,
  Settings as SettingsIcon,
  FlightTakeoff as FlightTakeoffIcon,
  AttachMoney as AttachMoneyIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Chat as ChatIcon,
  Home as HomeIcon,
  DirectionsCar as DirectionsCarIcon,
  EventAvailable as EventAvailableIcon,
  AccessTime as AccessTimeIcon,
  ContentCopy as ContentCopyIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  PersonAdd as PersonAddIcon,
  SearchOff as SearchOffIcon,
} from '@mui/icons-material';
import EmptyState from '../components/Common/EmptyState';
import { useCRMType } from '../context/CRMTypeContext';
import {
  bulkAssignICXRealizations,
  getICXRealizations,
  getICXRealizationsStandards,
  patchICXRealizationsStandards,
} from '../api/services/realizationsService';
import ExperienceTab from '../components/ExperienceTab';
import PreparationStepsTab from '../components/PreparationStepsTab';
import PostExperienceTab from '../components/PostExperienceTab';
import DateRangeFilter from '../components/DateRangeFilter';
import { LC_CODES, MC_EGYPT_CODE } from '../lcCodes';
import { fetchActiveMembers } from '../api/services/membersAPI';
import { useAuth } from '../context/AuthContext';
import Cookies from 'js-cookie';
import { getCrmAccessToken } from '../utils/crmToken';
import { matchSearchTerm } from '../utils/searchUtils';
// Constants for the page
const homeMCs = [
  'Egypt',
  'Morocco',
  'Tunisia',
  'Algeria',
  'Turkey',
  'India',
  'Sri Lanka',
  'Greece',
  'Italy',
  'Spain',
  'Bahrain',
  'Kuwait',
  'Lebanon',
  'Brazil',
  'Canada',
  'Germany',
  'Indonesia',
  'Russia',
  'Mexico',
  'Netherlands',
  'United Kingdom',
  'Cote D\'Ivoire'
];

const homeLCs = [
  'Ain Shams',
  'Alexandria',
  'Cairo',
  'GUC',
  'Helwan',
  'Mansoura',
  'October',
  'Other'
];

const products = [
  'GV',
  'GTa',
  'GTe'
];

const statuses = [
  'Approved',
  'Realized',
  'Finished',
  'Completed',
  'Approval_broken',
  'Realization_broken'

];

// Add this helper function at the top of the file, after the imports
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Add this helper function at the top of the file, after the imports
const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);
};

// Add this function after the existing helper functions
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

// Update the country codes function
const getCountryCode = (homeMC) => {
  if (!homeMC) return '+';
  const countryCodes = {
    'Egypt': '+20',
    'Morocco': '+212',
    'Tunisia': '+216',
    'Algeria': '+213',
    'Turkey': '+90',
    'India': '+91',
    'Sri Lanka': '+94',
    'Greece': '+30',
    'Italy': '+39',
    'Spain': '+34',
    'Bahrain': '+973',
    'Kuwait': '+965',
    'Lebanon': '+961',
    'Brazil': '+55',
    'Canada': '+1',
    'Germany': '+49',
    'Indonesia': '+62',
    'Russia': '+7',
    'Mexico': '+52',
    'Netherlands': '+31',
    'United Kingdom': '+44',
    'Cote D\'Ivoire': '+225',
    'Other': '+'
  };
  return countryCodes[homeMC] || '+';
};

// Add these functions after the existing helper functions
const sortData = (data, orderBy, order) => {
  return data.slice().sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    // Handle special cases
    if (orderBy === 'phone') {
      aValue = `${getCountryCode(a.homeMC)} ${a.phone}`;
      bValue = `${getCountryCode(b.homeMC)} ${b.phone}`;
    } else if (orderBy === 'apdDate' || orderBy === 'slotStartDate') {
      aValue = new Date(a[orderBy] || 0);
      bValue = new Date(b[orderBy] || 0);
    } else if (orderBy === 'daysTillRealization') {
      aValue = calculateDaysTillRealization(a.apdDate, a.slotStartDate);
      bValue = calculateDaysTillRealization(b.apdDate, b.slotStartDate);
      
      // Handle special cases for days
      if (aValue === '-') aValue = -Infinity;
      if (bValue === '-') bValue = -Infinity;
    } else if (orderBy === 'assignedMember') {
      aValue = '';
      bValue = '';
    }

    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

// Add this helper function after the existing helper functions
const calculateDaysTillRealization = (apdDate, slotStartDate) => {
  if (!slotStartDate) return '-';
  const today = new Date();
  const slotStart = new Date(slotStartDate);
  const diffTime = slotStart - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Add this function to get unique Home LC values from leads
const getUniqueHomeLCs = (leads) => {
  const uniqueLCs = new Set(leads.map(lead => lead.homeLC).filter(Boolean));
  return Array.from(uniqueLCs).sort();
};

// Add this function to get unique Home MC values from leads
const getUniqueHomeMCs = (leads) => {
  const uniqueMCs = new Set(leads.map(lead => lead.homeMC).filter(Boolean));
  return Array.from(uniqueMCs).sort();
};

// Add this function after the existing helper functions
const getUniqueHostLCs = (leads) => {
  const uniqueLCs = new Set(leads.map(lead => lead.hostLC).filter(Boolean));
  return Array.from(uniqueLCs).sort();
};

function getOfficeId(currentUser) {
  if (currentUser?.current_offices?.[0]?.id) {
    return currentUser.current_offices[0].id;
  }
  const lcName = currentUser?.lc || localStorage.getItem('userLC');
  if (lcName && Array.isArray(LC_CODES)) {
    const found = LC_CODES.find(lc => lc.name === lcName);
    if (found) return found.id;
  }
  return null;
}
function ICXRealizationsPage() {
  const { crmType } = useCRMType();
  const theme = useTheme();
   const { currentUser, isAdmin, login } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedHomeLC, setSelectedHomeLC] = useState('');
  const [selectedHostLC, setSelectedHostLC] = useState('');
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
    notes: '',
    comments: [],
    followups: []
  });
  const [tab, setTab] = useState(0);
  // Preparation state for each lead (by id)
  const [prepState, setPrepState] = useState({});
  const { showSuccess, showError, showWarning } = useSnackbarContext();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');
  const [uniqueHostLCs, setUniqueHostLCs] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [selectedMember, setSelectedMember] = useState('');
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [selectedLeadsSet, setSelectedLeadsSet] = useState(new Set());
  const membersFetched = useRef(false);
  const [members, setActiveMembers] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const nextPageRef = useRef(1);

  // Move fetchLeads outside useEffect so it can be called from the button
  const fetchLeads = useCallback(async ({ reset = false } = {}) => {
    try {
      setLoading(true);
      const hostLcId = isAdmin ? MC_EGYPT_CODE : getOfficeId(currentUser);
      if (!hostLcId) {
        setLeads([]);
        setOriginalLeads([]);
        showError('No office assigned to your account. Cannot fetch realizations.');
        return;
      }

      if (reset) {
        nextPageRef.current = 1;
        setHasMore(false);
      }
      if (!nextPageRef.current) return;

      console.log('Fetching ICX realizations...');
      const pageData = await getICXRealizations({ hostLcId, page: nextPageRef.current, limit: 50 });
      const items = pageData?.data || pageData?.items || pageData?.leads || (Array.isArray(pageData) ? pageData : []);

      const normalized = (items || []).map((r) => ({
        ...r,

        // Canonical identifier for iCX realizations is application_id
        id: r.application_id ?? r.id,

        // Common UI fields (camelCase) expected by this page
        fullName: r.full_name ?? r.fullName,
        email: r.email ?? r.email,
        phone: r.contact_number ?? r.phone,

        homeLC: r.home_lc_name ?? r.homeLC,
        homeMC: r.home_mc_name ?? r.homeMC,
        hostLC: r.host_lc_name ?? r.hostLC,
        hostMC: r.host_mc_name ?? r.hostMC ?? 'Egypt',

        programme: r.programme ?? r.product ?? r.programme,
        title: r.opp_title ?? r.title,
        opportunityLink: r.opp_id ? `https://aiesec.org/opportunity/${r.opp_id}` : r.opportunityLink,

        apdDate: r.date_approved ?? r.apdDate,
        slotStartDate: r.slot_start_date ?? r.slotStartDate,
        slotEndDate: r.slot_end_date ?? r.slotEndDate,
        realizedDate: r.date_realized ?? r.realizedDate,
        finishDate: r.experience_end_date ?? r.finishDate,

        assignedMember: r.assigned_member_name ?? r.assignedMember,
      }));

      setLeads(prev => reset ? normalized : [...prev, ...normalized]);
      setOriginalLeads(prev => reset ? normalized : [...prev, ...normalized]);

      if (pageData?.pagination) {
        setHasMore(pageData.pagination.hasNextPage);
        nextPageRef.current = pageData.pagination.hasNextPage ? nextPageRef.current + 1 : null;
      } else {
        setHasMore(normalized.length === 50);
        nextPageRef.current = normalized.length === 50 ? nextPageRef.current + 1 : null;
      }

      if (reset && normalized.length > 0) {
        showSuccess(`Successfully loaded initial realizations`);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching leads:', err);
      
      // Handle authentication errors specifically
      if (err.message && err.message.includes('Authentication required')) {
        showWarning('Please log in to access realizations data');
        setError('Authentication required. Please log in to view realizations data.');
      } else {
        const friendlyMsg = err.friendlyMessage || 'Failed to fetch leads. Please try again later.';
        showError(friendlyMsg);
        setError(friendlyMsg);
      }
      
      if (reset) {
        setLeads([]);
        setOriginalLeads([]);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAdmin, showSuccess, showError, showWarning]);

  const loadMore = useCallback(() => {
    if (!nextPageRef.current || loading) return;
    return fetchLeads({ reset: false });
  }, [fetchLeads, loading]);

  const handleRefresh = useCallback(() => {
    fetchLeads({ reset: true });
  }, [fetchLeads]);

  // useEffect for initial load
  useEffect(() => {
    if (!currentUser && !isAdmin) return;
    fetchLeads({ reset: true });
  }, [currentUser, isAdmin, fetchLeads]);

    useEffect(() => {
      const lcCode = isAdmin ? MC_EGYPT_CODE : getOfficeId(currentUser);
      const startDate = dateRange.startDate
        ? dateRange.startDate.toISOString().split("T")[0]
        : "2025-08-01";
      const personId = Cookies.get("person_id");
      if (!isAdmin && !lcCode) {
        setLeads([]);
        showError("No office assigned to your account. Cannot fetch leads.");
        setLoading(false);
        return;
      }
    
      // Fetch active members
    
      if (lcCode) {
        if (!membersFetched.current) {
          currentMembers(lcCode, personId); // 👈 only once
          membersFetched.current = true;
        }
      }
    }, [dateRange, currentUser, isAdmin]);
  // Filter prepState to only keep entries for current leads, but only after prepState is loaded
  useEffect(() => {
    setPrepState(prev => {
      const validIds = new Set(leads.map(l => l.id));
      const filtered = {};
      for (const id in prev) {
        if (validIds.has(Number(id)) || validIds.has(id)) {
          filtered[id] = prev[id];
        }
      }
      return filtered;
    });
  }, [leads]);

  // Add useEffect to trigger search when filters change
  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedCountry, selectedHomeLC, selectedExchangeType, selectedStatus]);

  useEffect(() => {
    const leadId = selectedLead?.id;
    if (!openProfileDialog || !leadId) return;
    if (prepState?.[leadId]) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await getICXRealizationsStandards(leadId);
        if (cancelled) return;
        setPrepState((prev) => ({
          ...(prev || {}),
          [leadId]: data || {},
        }));
      } catch (error) {
        console.error('Failed to fetch ICX standards:', error);
        if (cancelled) return;
        setPrepState((prev) => ({
          ...(prev || {}),
          [leadId]: {},
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [openProfileDialog, selectedLead, prepState, setPrepState]);

  // Add useEffect to update uniqueHostLCs when leads change
  useEffect(() => {
    if (originalLeads.length > 0) {
      setUniqueHostLCs(getUniqueHostLCs(originalLeads));
    }
  }, [originalLeads]);

  const handleDateFilterChange = (dateFilter) => {
    setDateRange(dateFilter);
    // Trigger search with new date filter
    handleSearch(dateFilter);
  };
const getTeamUnderCurrentUser = (members) => {
  const currentUserId = Cookies.get("person_id");
  const userRole = Cookies.get("userRole"); // assuming you store the role in cookies
  if (!currentUserId) return [];

  // ✅ If user is LCVP → return all members (TLs + TMs)
  if (userRole && userRole.toUpperCase().includes("LCVP")) {
    const allMembers = [];

    // flatten all TLs and TMs under LCVP
    for (const member of members.children || []) {
      allMembers.push({
        id: member.id,
        role: member.role,
        person: member.person
      });

      for (const child of member.children || []) {
        allMembers.push({
          id: child.id,
          role: child.role,
          person: child.person
        });
      }
    }

    // sort TL first, then TM
    allMembers.sort((a, b) => {
      const order = { TL: 1, TM: 2 };
      const aRole = a.role.toUpperCase().includes("TL") ? "TL" : "TM";
      const bRole = b.role.toUpperCase().includes("TL") ? "TL" : "TM";
      return order[aRole] - order[bRole];
    });

    return allMembers;
  }

  // 🔹 If not LCVP → find their TL/TM team
  let targetNode = null;

  const findNode = (node) => {
    if (node.user_id == currentUserId) {
      targetNode = node;
      return;
    }
    for (const child of node.children || []) {
      findNode(child);
      if (targetNode) return;
    }
  };

  for (const member of members.children || []) {
    findNode(member);
    if (targetNode) break;
  }

  if (!targetNode) {
    console.warn("Current user not found in hierarchy");
    return [];
  }

  const children = targetNode.children?.map(child => ({
    id: child.id,
    role: child.role,
    person: child.person
  })) || [];

  children.sort((a, b) => {
    const order = { TL: 1, TM: 2 };
    const aRole = a.role.toUpperCase().includes("TL") ? "TL" : "TM";
    const bRole = b.role.toUpperCase().includes("TL") ? "TL" : "TM";
    return order[aRole] - order[bRole];
  });

  return children;
};


  const currentMembers = async (lcCode, token) => {
    try {
      const members = await fetchActiveMembers(lcCode, token);
      console.log("Fetched Active Members: ", members);
      const filteredMembers = members.filter(member => {
      const position = member.role;
      const parentTitle = member.function.toUpperCase();

      const isLCVP = position === 'LCVP' ;
      const isUnderOG = parentTitle?.includes('IGTA') || parentTitle?.includes('IGTE') || parentTitle?.includes('IGV')|| parentTitle?.includes('ICX');

      return isLCVP && isUnderOG;
    });
    console.log(filteredMembers[0])
    const teamMembers = getTeamUnderCurrentUser(filteredMembers[0]);
    console.log("Team Members under VP: ", teamMembers);
    setActiveMembers(teamMembers);
    } catch (error) {
      console.error('Error fetching active members:', error);
      showError('Failed to fetch active members');
    }
  };


  const handleSearch = (searchDateFilter = dateRange) => {
    const filteredLeads = originalLeads.filter((lead) => {
      if (!lead) return false;

      // 1. Date range filter
      if (
        searchDateFilter?.field &&
        searchDateFilter?.startDate &&
        searchDateFilter?.endDate
      ) {
        const leadDateStr = lead[searchDateFilter.field] || lead.created_at || lead.updated_at;
        if (!leadDateStr) return false;
        
        const leadDate = new Date(leadDateStr);
        if (isNaN(leadDate.getTime())) return false;

        const start = new Date(searchDateFilter.startDate);
        const end = new Date(searchDateFilter.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        if (leadDate < start || leadDate > end) {
          return false;
        }
      }

      // 2. Search term filter
      const searchFields = [
        'id', 'opportunityId', 'oppId', 'opportunity_id', 'expa_person_id',
        'fullName', 'full_name', 'phone', 'contact_number', 'email'
      ];
      if (!matchSearchTerm(lead, searchTerm, searchFields)) {
        return false;
      }

      // 3. Home MC filter
      if (selectedCountry && selectedCountry !== 'Show All' && lead.homeMC !== selectedCountry) {
        return false;
      }

      // 4. Home LC filter
      if (selectedHomeLC && selectedHomeLC !== 'Show All' && lead.homeLC !== selectedHomeLC) {
        return false;
      }

      // 5. Host LC filter
      if (selectedHostLC && selectedHostLC !== 'Show All' && lead.hostLC !== selectedHostLC) {
        return false;
      }

      // 6. Product filter
      if (selectedExchangeType && lead.programme !== selectedExchangeType) {
        return false;
      }

      // 7. Status filter
      if (selectedStatus && selectedStatus !== 'Show All') {
        const leadStatus = (lead.status || '').toLowerCase();
        if (leadStatus !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      return true;
    });

    setLeads(filteredLeads);
  };

  const handleAddLead = () => {
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
      notes: '',
      comments: [],
      followups: []
    });
    setOpenDialog(true);
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
      notes: '',
      comments: [],
      followups: []
    });
  };

  const handleInputChange = (field) => (event) => {
    setNewLead(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSaveLead = () => {
    const now = new Date().toISOString();
    let updatedLeads;

    if (selectedLead) {
      // Editing existing lead
      updatedLeads = leads.map(lead =>
        lead.id === selectedLead.id
          ? { ...newLead, id: selectedLead.id, lastUpdated: now }
          : lead
      );
    } else {
      // Adding new lead
      const leadToAdd = {
        ...newLead,
        id: Date.now(),
        createdAt: now,
        lastUpdated: now
      };
      updatedLeads = [...leads, leadToAdd];
    }

    setLeads(updatedLeads);
    handleCloseDialog();
    handleSearch();
  };

  const handleDeleteLead = (leadId) => {
    const updatedLeads = leads.filter(lead => lead.id !== leadId);
    setLeads(updatedLeads);
    setPrepState(prev => {
      const newState = { ...prev };
      delete newState[leadId];
      return newState;
    });
    handleSearch();
  };

  const handleOpenProfile = (lead) => {
    setSelectedLead(lead);
    setOpenProfileDialog(true);
    setTab(0);
  };

  const handleCloseProfile = () => {
    setSelectedLead(null);
    setOpenProfileDialog(false);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setNewLead(lead);
    setOpenDialog(true);
  };

  const copyToClipboard = (text, title, lead) => {
    let textToCopy = '';
    
    if (title === 'Phone Number' && text && lead) {
      textToCopy = `${getCountryCode(lead.homeMC)} ${text}`;
    } else if (title === 'Email' && text) {
      textToCopy = text;
    }
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showSuccess('Copied to clipboard!');
      }).catch(err => {
        showError('Failed to copy to clipboard');
        console.error('Failed to copy:', err);
      });
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Update the Home LC dropdown to use unique values from leads
  const uniqueHomeLCs = getUniqueHomeLCs(leads);

  // Update the Home MC dropdown to use unique values from leads
  const uniqueHomeMCs = getUniqueHomeMCs(leads);

  // Add these functions inside the ICXRealizationsPage component
  const handleSelectAll = useCallback((event) => {
    const isChecked = event.target.checked;
    setSelectedLeadsSet(new Set(isChecked ? leads.map(lead => lead.id) : []));
  }, [leads]);

  const handleSelectLead = useCallback((leadId) => (event) => {
    event.stopPropagation();
    setSelectedLeadsSet(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  }, []);

  // Memoize the selected leads array
  const selectedLeads = useMemo(() => Array.from(selectedLeadsSet), [selectedLeadsSet]);

  // Memoize checkbox states
  const isAllSelected = useMemo(() => 
    leads.length > 0 && selectedLeadsSet.size === leads.length,
    [leads.length, selectedLeadsSet.size]
  );

  const isIndeterminate = useMemo(() => 
    selectedLeadsSet.size > 0 && selectedLeadsSet.size < leads.length,
    [leads.length, selectedLeadsSet.size]
  );

  // Memoize the checkbox component
  const SelectAllCheckbox = useMemo(() => (
    <Checkbox
      indeterminate={isIndeterminate}
      checked={isAllSelected}
      onChange={handleSelectAll}
      sx={{
        color: 'primary.main',
        '&.Mui-checked': {
          color: 'primary.main',
        },
      }}
    />
  ), [isIndeterminate, isAllSelected, handleSelectAll]);

  // Memoize individual lead checkbox
  const LeadCheckbox = useMemo(() => ({ leadId }) => (
    <Checkbox
      checked={selectedLeadsSet.has(leadId)}
      onChange={handleSelectLead(leadId)}
      onClick={(e) => e.stopPropagation()}
      sx={{
        color: 'primary.main',
        '&.Mui-checked': {
          color: 'primary.main',
        },
      }}
    />
  ), [selectedLeadsSet, handleSelectLead]);

  // Memoize the sorted data
  const sortedData = useMemo(() => 
    sortData(leads, orderBy, order),
    [leads, orderBy, order]
  );

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const tableContainer = document.querySelector('.MuiTableContainer-root');
    
    // Create a deep clone of the table
    const tableClone = tableContainer.cloneNode(true);
    
    // Remove all sorting-related elements and copy buttons
    const headers = tableClone.querySelectorAll('th');
    headers.forEach(header => {
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

    // Update chip styles in the cloned table
    const chips = tableClone.querySelectorAll('.MuiChip-root');
    chips.forEach(chip => {
      const label = chip.textContent.toLowerCase();
      let bgColor = '#e0e0e0';
      
      // Product colors
      if (label === 'gv') bgColor = '#F85A40';
      else if (label === 'gta') bgColor = '#0CB9C1';
      else if (label === 'gte') bgColor = '#F48924';
      
      // Status colors
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

    // Remove copy buttons from phone numbers
    const copyButtons = tableClone.querySelectorAll('.MuiIconButton-root');
    copyButtons.forEach(button => button.remove());

    // Remove checkboxes from the cloned table
    const checkboxes = tableClone.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.parentElement.parentElement.remove());

    // Filter rows based on selected leads if any are selected
    const tbody = tableClone.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    if (selectedLeadsSet.size > 0) {
      // Remove all rows first
      rows.forEach(row => row.remove());
      
      // Add only the selected rows
      leads.forEach(lead => {
        if (selectedLeadsSet.has(lead.id)) {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${lead.id}</td>
            <td>${lead.fullName || '-'}</td>
            <td>${getCountryCode(lead.homeMC)} ${lead.phone || '-'}</td>
            <td>${lead.hostLC || '-'}</td>
            <td>${lead.hostMC || '-'}</td>
            <td>${lead.homeLC || '-'}</td>
            <td>${lead.homeMC || '-'}</td>
            <td>
              <span class="MuiChip-root" style="background-color: ${
                lead.programme?.toLowerCase() === 'gv' ? '#F85A40' :
                lead.programme?.toLowerCase() === 'gta' ? '#0CB9C1' :
                lead.programme?.toLowerCase() === 'gte' ? '#F48924' : '#e0e0e0'
              } !important; color: white !important; border: none !important; padding: 4px 8px !important; border-radius: 16px !important; font-size: 11px !important; font-weight: 600 !important; display: inline-flex !important; align-items: center !important; margin: 1px !important; box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;">
                ${lead.programme || '-'}
              </span>
            </td>
            <td>
              <Chip
                label={lead.status}
                sx={{
                    bgcolor: lead.status?.toLowerCase() === 'approved' ? '#4caf50' :
                            lead.status?.toLowerCase() === 'realized' ? '#1976d2' :
                            lead.status?.toLowerCase() === 'finished' ? '#ffc107' :
                            lead.status?.toLowerCase() === 'completed' ? '#ff9800' :
                            lead.status?.toLowerCase() === 'rejected' ? '#f44336' :
                            lead.status?.toLowerCase() === 'on hold' ? '#ff9800' : '#e0e0e0',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    px: 2
                }}
              />
            </td>
            <td>${calculateDaysTillRealization(lead.apdDate, lead.slotStartDate)}</td>
            <td>${formatDate(lead.apdDate)}</td>
            <td>${formatDate(lead.slotStartDate)}</td>
            <td>${lead.assignedMember || lead.assigned_member_name || '-'}</td>
          </tr>
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

  const handleAssignMember = async (member) => {
    if (selectedLeads.length === 0) return;

    try {
      await bulkAssignICXRealizations({
        application_ids: selectedLeads,
        member_id: member.id,
      });

      await fetchLeads();

      showSuccess(`Successfully assigned ${selectedLeads.length} realizations to member`);

      setSelectedLeadsSet(new Set());
    } catch (error) {
      console.error('Error bulk assigning realizations:', error);
      showError('Failed to assign realizations');
    }
  };

  return (
    <Box>
      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => setError(null)}>
              Dismiss
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: { xs: 2, sm: 3 }, gap: { xs: 2, sm: 0 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          ICX Realizations
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: { xs: 1, sm: 2 }, width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ width: { xs: '100%', sm: 'auto' } ,
              position: 'relative',
              '&::after': selectedLeads.length > 0 ? {
                content: `"${selectedLeads.length}"`,
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: '#f44336',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              } : {}
            }}
          >
            Print Report
          </Button>
          {selectedLeads.length > 0 && (
            <Button
              variant="contained"
              startIcon={<AssignmentIndIcon />}
              onClick={() => setBulkAssignDialogOpen(true)}
              sx={{ width: { xs: '100%', sm: 'auto' } ,
              position: 'relative',
              '&::after': selectedLeads.length > 0 ? {
                content: `"${selectedLeads.length}"`,
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: '#f44336',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              } : {}
            }}
            >
              Assign Selected
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Refresh API
          </Button>
          <DateRangeFilter onDateFilterChange={handleDateFilterChange} />
        </Box>
      </Box>

      <Card sx={{ mb: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          <Grid container spacing={{ xs: 1, sm: 3 }} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Search EPs"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  ),
                  endAdornment: searchTerm && (
                    <IconButton 
                      size="small" 
                      onClick={() => setSearchTerm('')}
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )
                }}
                placeholder="Search by EP ID, OP ID, name, or phone..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: { xs: '48px', sm: '56px' },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <Autocomplete
                  value={selectedCountry}
                  onChange={(event, newValue) => {
                    setSelectedCountry(newValue);
                  }}
                  options={['Show All', ...uniqueHomeMCs]}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Home MC"
                      variant="outlined"
                      sx={{
                        minWidth: { xs: '100%', sm: '160px' },
                        '& .MuiOutlinedInput-root': {
                          height: { xs: '48px', sm: '56px' },
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  )}
                  ListboxProps={{
                    sx: {
                      maxHeight: '300px',
                      minWidth: { xs: '100% !important', sm: '150px !important' },
                      '& .MuiAutocomplete-option': {
                        fontSize: { xs: '0.875rem', sm: '0.9rem' },
                        padding: '8px 16px',
                        minHeight: '40px'
                      }
                    }
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <Autocomplete
                  value={selectedHomeLC}
                  onChange={(event, newValue) => {
                    setSelectedHomeLC(newValue);
                  }}
                  options={['Show All', ...uniqueHomeLCs]}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Home LC"
                      variant="outlined"
                      sx={{
                        minWidth: { xs: '100%', sm: '150px' },
                        '& .MuiOutlinedInput-root': {
                          height: { xs: '48px', sm: '56px' },
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  )}
                  ListboxProps={{
                    sx: {
                      maxHeight: '300px',
                      minWidth: { xs: '100% !important', sm: '150px !important' },
                      '& .MuiAutocomplete-option': {
                        fontSize: { xs: '0.875rem', sm: '0.9rem' },
                        padding: '8px 16px',
                        minHeight: '40px'
                      }
                    }
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <Autocomplete
                  value={selectedHostLC}
                  onChange={(event, newValue) => {
                    setSelectedHostLC(newValue);
                  }}
                  options={['Show All', ...uniqueHostLCs]}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Host LC"
                      variant="outlined"
                      sx={{
                        minWidth: { xs: '100%', sm: '150px' },
                        '& .MuiOutlinedInput-root': {
                          height: { xs: '48px', sm: '56px' },
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  )}
                  ListboxProps={{
                    sx: {
                      maxHeight: '300px',
                      minWidth: { xs: '100% !important', sm: '150px !important' },
                      '& .MuiAutocomplete-option': {
                        fontSize: { xs: '0.875rem', sm: '0.9rem' },
                        padding: '8px 16px',
                        minHeight: '40px'
                      }
                    }
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Product</InputLabel>
                <Select
                  value={selectedExchangeType}
                  onChange={(e) => setSelectedExchangeType(e.target.value)}
                  label="Product"
                  sx={{
                    height: { xs: '48px', sm: '56px' },
                    minWidth: { xs: '100%', sm: '150px' },
                    '& .MuiSelect-select': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      padding: { xs: '8px 14px', sm: '12px 14px' }
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: '300px',
                        minWidth: { xs: '100% !important', sm: '150px !important' },
                        '& .MuiMenuItem-root': {
                          fontSize: { xs: '0.875rem', sm: '0.9rem' },
                          padding: '8px 16px',
                          minHeight: '40px'
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>All Products</em>
                  </MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product} value={product}>
                      {product}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => {
                    console.log('Status changed to:', e.target.value);
                    setSelectedStatus(e.target.value);
                  }}
                  label="Status"
                  sx={{
                    height: { xs: '48px', sm: '56px' },
                    minWidth: { xs: '100%', sm: '150px' },
                    '& .MuiSelect-select': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      padding: { xs: '8px 14px', sm: '12px 14px' }
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: '300px',
                        minWidth: { xs: '100% !important', sm: '150px !important' },
                        '& .MuiMenuItem-root': {
                          fontSize: { xs: '0.875rem', sm: '0.9rem' },
                          padding: '8px 16px',
                          minHeight: '40px'
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="Show All">
                    <em>Show All</em>
                  </MenuItem>
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
         

          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 }, overflowX: 'auto' }}>
          <TableContainer 
            component={Paper} 
            elevation={0}
            sx={{
              overflowX: 'auto',
              '& .MuiTable-root': {
                minWidth: { xs: 1200, sm: 1400 }
              }
            }}
          >
            <Table sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell 
                    padding="checkbox"
                    sx={{ 
                      position: 'sticky', 
                      left: 0, 
                      bgcolor: '#F4F6F9', 
                      zIndex: 3,
                      borderRight: '1px solid rgba(224, 224, 224, 1)'
                    }}
                  >
                    {SelectAllCheckbox}
                  </TableCell>
                  <TableCell sx={{ 
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                    position: 'sticky', 
                    left: 48, 
                    bgcolor: '#F4F6F9', 
                    zIndex: 3,
                    borderRight: '1px solid rgba(224, 224, 224, 1)'
                  }}>
                    <TableSortLabel
                      active={orderBy === 'id'}
                      direction={orderBy === 'id' ? order : 'asc'}
                      onClick={() => handleRequestSort('id')}
                    >
                      EP_OP ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ 
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                    position: 'sticky', 
                    left: 140, 
                    bgcolor: '#F4F6F9', 
                    zIndex: 3,
                    borderRight: '1px solid rgba(224, 224, 224, 1)'
                  }}>
                    <TableSortLabel
                      active={orderBy === 'fullName'}
                      direction={orderBy === 'fullName' ? order : 'asc'}
                      onClick={() => handleRequestSort('fullName')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ 
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 }
                  }}>
                    <TableSortLabel
                      active={orderBy === 'phone'}
                      direction={orderBy === 'phone' ? order : 'asc'}
                      onClick={() => handleRequestSort('phone')}
                    >
                      Phone Number
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ 
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 }
                  }}>
                    <TableSortLabel
                      active={orderBy === 'hostLC'}
                      direction={orderBy === 'hostLC' ? order : 'asc'}
                      onClick={() => handleRequestSort('hostLC')}
                    >
                      Host LC
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ 
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 }
                  }}>
                    <TableSortLabel
                      active={orderBy === 'hostMC'}
                      direction={orderBy === 'hostMC' ? order : 'asc'}
                      onClick={() => handleRequestSort('hostMC')}
                    >
                      Host MC
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'homeLC'}
                      direction={orderBy === 'homeLC' ? order : 'asc'}
                      onClick={() => handleRequestSort('homeLC')}
                    >
                      Home LC
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'homeMC'}
                      direction={orderBy === 'homeMC' ? order : 'asc'}
                      onClick={() => handleRequestSort('homeMC')}
                    >
                      Home MC
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'programme'}
                      direction={orderBy === 'programme' ? order : 'asc'}
                      onClick={() => handleRequestSort('programme')}
                    >
                      Product
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={() => handleRequestSort('status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'daysTillRealization'}
                      direction={orderBy === 'daysTillRealization' ? order : 'asc'}
                      onClick={() => handleRequestSort('daysTillRealization')}
                    >
                      Days till Realization
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'apdDate'}
                      direction={orderBy === 'apdDate' ? order : 'asc'}
                      onClick={() => handleRequestSort('apdDate')}
                    >
                      Date Approved
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'slotStartDate'}
                      direction={orderBy === 'slotStartDate' ? order : 'asc'}
                      onClick={() => handleRequestSort('slotStartDate')}
                    >
                      Expected Realization date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'assignedMember'}
                      direction={orderBy === 'assignedMember' ? order : 'asc'}
                      onClick={() => handleRequestSort('assignedMember')}
                    >
                      Assigned Member
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={13} align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={24} sx={{ mr: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          Loading realizations data...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} align="center" sx={{ py: 6 }}>
                      <EmptyState
                        title="No Realizations Found"
                        description="We couldn't find any expected realizations for your office. Try adjusting your filters or refresh the data from the API."
                        actionLabel="Refresh API"
                        onAction={fetchLeads}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((lead) => (
                    <TableRow 
                      key={lead.id}
                      hover
                      onClick={() => handleOpenProfile(lead)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: theme.palette.action.hover
                        }
                      }}
                    >
                      <TableCell 
                        padding="checkbox"
                        sx={{ 
                          position: 'sticky', 
                          left: 0, 
                          bgcolor: 'background.paper', 
                          zIndex: 1,
                          borderRight: '1px solid rgba(224, 224, 224, 1)'
                        }}
                      >
                        <LeadCheckbox leadId={lead.id} />
                      </TableCell>
                      <TableCell sx={{ 
                        position: 'sticky', 
                        left: 48, 
                        bgcolor: 'background.paper', 
                        zIndex: 1,
                        borderRight: '1px solid rgba(224, 224, 224, 1)'
                      }}>
                        <Typography variant="body2">
                          {lead.id}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        position: 'sticky', 
                        left: 140, 
                        bgcolor: 'background.paper', 
                        zIndex: 1,
                        borderRight: '1px solid rgba(224, 224, 224, 1)'
                      }}>
                        <Typography 
                          variant="body2" 
                          title={lead.fullName}
                          sx={{ 
                            fontWeight: 600,
                            maxWidth: { xs: '120px', sm: '220px' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {lead.fullName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 2 }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {getCountryCode(lead.homeMC)} {lead.phone}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(lead.phone, 'Phone Number', lead);
                            }}
                            sx={{
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)'
                              }
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 2 }
                      }}>
                        <Typography variant="body2">
                          {lead.hostLC}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 2 }
                      }}>
                        <Typography variant="body2">
                          {lead.hostMC}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {lead.homeLC}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {lead.homeMC}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={lead.programme}
                          sx={{
                            bgcolor: lead.programme?.toLowerCase() === 'gv' ? '#F85A40' :
                                    lead.programme?.toLowerCase() === 'gta' ? '#0CB9C1' :
                                    lead.programme?.toLowerCase() === 'gte' ? '#F48924' : '#e0e0e0',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.875rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={lead.status}
                          sx={{
                              bgcolor: lead.status?.toLowerCase() === 'approved' ? '#4caf50' :
                                      lead.status?.toLowerCase() === 'realized' ? '#1976d2' :
                                      lead.status?.toLowerCase() === 'finished' ? '#ffc107' :
                                      lead.status?.toLowerCase() === 'completed' ? '#ff9800' :
                                      lead.status?.toLowerCase() === 'rejected' ? '#f44336' :
                                      lead.status?.toLowerCase() === 'on hold' ? '#ff9800' : '#e0e0e0',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              px: 2
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: (theme) => {
                              const days = calculateDaysTillRealization(lead.apdDate, lead.slotStartDate);
                              if (days === '-') return theme.palette.text.secondary;
                              if (days < 0) return theme.palette.error.main;
                              if (days <= 30) return theme.palette.warning.main;
                              return theme.palette.success.main;
                            }
                          }}
                        >
                          {calculateDaysTillRealization(lead.apdDate, lead.slotStartDate)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2">
                          {formatDate(lead.apdDate)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2">
                          {formatDate(lead.slotStartDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {lead.assignedMember || lead.assigned_member_name ? (
                          <Chip
                            label={lead.assignedMember || lead.assigned_member_name || 'Unknown'}
                            sx={{
                              bgcolor: '#1976d2',
                              color: '#fff',
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">Not assigned</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </TableContainer>
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Button
              variant="outlined"
              onClick={loadMore}
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Load More'}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>

      {/* Add/Edit Lead Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedLead ? 'Edit Lead' : 'Add New Lead'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={newLead.fullName}
                onChange={handleInputChange('fullName')}
                required
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newLead.email}
                onChange={handleInputChange('email')}
                required
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={newLead.phone}
                onChange={handleInputChange('phone')}
                required
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Home MC</InputLabel>
                <Select
                  value={newLead.country}
                  onChange={handleInputChange('country')}
                  label="Home MC"
                  required
                  startAdornment={<FlagIcon sx={{ mr: 1, color: 'primary.main' }} />}
                >
                  {homeMCs.map((country) => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Home LC"
                value={newLead.city}
                onChange={handleInputChange('city')}
                required
                InputProps={{
                  startAdornment: <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Product</InputLabel>
                <Select
                  value={newLead.exchangeType}
                  onChange={handleInputChange('exchangeType')}
                  label="Product"
                  required
                  startAdornment={<WorkIcon sx={{ mr: 1, color: 'primary.main' }} />}
                >
                  {products.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newLead.status}
                  onChange={handleInputChange('status')}
                  label="Status"
                  required
                  startAdornment={<EventIcon sx={{ mr: 1, color: 'primary.main' }} />}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={newLead.notes}
                onChange={handleInputChange('notes')}
                placeholder="Add any additional notes about the lead..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveLead} 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
          >
            {selectedLead ? 'Save Changes' : 'Add Lead'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lead Profile Dialog */}
      {selectedLead && (
        <Dialog
          open={openProfileDialog}
          onClose={handleCloseProfile}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              bgcolor: 'background.paper',
              minHeight: '80vh',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(40,60,90,0.18)',
              animation: 'fadeIn 0.4s cubic-bezier(.4,0,.2,1)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 0, position: 'relative', overflow: 'hidden', background: 'linear-gradient(90deg, #0CB9C1 0%, #1976d2 100%)', color: '#fff', minHeight: 120 }}>
            <Box display="flex" alignItems="center" gap={3} sx={{ pt: 3, pb: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' } }}>
              <Avatar
                sx={{
                  width: { xs: 70, sm: 90 },
                  height: { xs: 70, sm: 90 },
                  bgcolor: 'primary.main',
                  fontSize: { xs: '2rem', sm: '2.8rem' },
                  boxShadow: '0 6px 24px rgba(25,118,210,0.18)',
                  border: '4px solid #fff',
                  ml: { xs: 0, sm: 2 }
                }}
              >
                {selectedLead.fullName?.split(' ')[0]?.[0]?.toUpperCase()}
              </Avatar>
              <Box flex={1} sx={{ width: '100%', textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 1, letterSpacing: 1, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {selectedLead.fullName}
                </Typography>
                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                  <Chip
                    label={selectedLead.status}
                    sx={{
                      bgcolor:
                        selectedLead.status?.toLowerCase() === 'approved' ? '#43a047' :
                        selectedLead.status?.toLowerCase() === 'rejected' ? '#e53935' :
                        selectedLead.status?.toLowerCase() === 'on hold' ? '#fbc02d' :
                        '#1976d2',
                      color: '#fff',
                      fontWeight: 700,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      px: 2
                    }}
                  />
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                    <Typography variant="body1" sx={{ color: '#e3f2fd', display: 'flex', alignItems: 'center', gap: 1, minWidth: { xs: 'auto', sm: 120 } }}>
                    <FlagIcon fontSize="small" />
                      Sending:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#e3f2fd' }}>
                    {selectedLead.homeLC} • {selectedLead.homeMC}
                  </Typography>
                </Box>
                  <Box display="flex" alignItems="center" gap={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                    <Typography variant="body1" sx={{ color: '#e3f2fd', display: 'flex', alignItems: 'center', gap: 1, minWidth: { xs: 'auto', sm: 120 } }}>
                      <LocationIcon fontSize="small" />
                      Host:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#e3f2fd' }}>
                      {selectedLead.hostLC} • {selectedLead.hostMC}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <IconButton 
                onClick={handleCloseProfile} 
                size="medium"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.8)',
                  color: '#1976d2',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  '&:hover': {
                    bgcolor: '#fff',
                    color: '#0CB9C1',
                    transform: 'rotate(90deg)',
                    transition: 'all 0.3s ease'
                  },
                  position: 'absolute',
                  top: 16,
                  right: 24
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          {/* Tabs for profile sections */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', background: 'white', px: { xs: 1, sm: 3 } }}>
            <Tabs 
              value={tab} 
              onChange={(e, newValue) => setTab(newValue)} 
              textColor="primary" 
              indicatorColor="primary" 
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  minWidth: 0,
                  flex: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  py: { xs: 1, sm: 2 },
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 700
                  }
                }
              }}
            >
              <Tab label="Information" />
              <Tab label="Preparation" />
              <Tab label="Experience" />
              <Tab label="Post Experience" />
            </Tabs>
          </Box>
          <DialogContent dividers sx={{ p: 0, background: 'linear-gradient(180deg, #f8fafc 0%, #e3f2fd 100%)' }}>
            {tab === 0 && (
              <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
                {(() => {
                  const InfoRow = ({ title, value, icon }) => (
                    <Grid container alignItems="center" spacing={1} sx={{ mb: 1.2 }}>
                      <Grid item xs={12} sm={5} md={4}>
                        <Typography sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {icon && icon}
                          {title}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={7} md={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ color: 'text.secondary', wordBreak: 'break-all', transition: 'color 0.2s', '& a:hover': { color: '#1976d2', textDecoration: 'underline' }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {title === 'Phone Number' ? (
                              <a href={`tel:${getCountryCode(selectedLead.homeMC)}${value}`} style={{ color: '#1976d2', textDecoration: 'underline' }}>
                                {getCountryCode(selectedLead.homeMC)} {value}
                              </a>
                            ) : title === 'Email' ? (
                              <a href={`mailto:${value}`} style={{ color: '#1976d2', textDecoration: 'underline' }}>
                                {value}
                              </a>
                            ) : value || '-'}
                          </Typography>
                          {(title === 'Phone Number' || title === 'Email') && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(value, title, selectedLead);
                              }}
                              sx={{
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                }
                              }}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  );

                  // Dates Table
                  const dateRows = [
                    { label: 'Date Approved', value: selectedLead.apdDate },
                    { label: 'Slot Start Date', value: selectedLead.slotStartDate },
                    { label: 'Slot End Date', value: selectedLead.slotEndDate },
                    { label: 'Date Realized', value: selectedLead.realizedDate },
                    { label: 'Experience End Date', value: selectedLead.finishDate },
                  ];

                  return <>
                    {/* Contact Information */}
                    <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', mb: 2, boxShadow: '0 2px 12px rgba(40,60,90,0.06)' }}>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 2, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="medium" color="action" /> Contact Information
                      </Typography>
                      <InfoRow title="Email" value={<a href={`mailto:${selectedLead.email}`} style={{ color: '#1976d2', textDecoration: 'underline' }}>{selectedLead.email}</a>} icon={<EmailIcon fontSize="small" color="action" />} />
                      <InfoRow title="Phone Number" value={<a href={`tel:${selectedLead.phone}`} style={{ color: '#1976d2', textDecoration: 'underline' }}>{selectedLead.phone}</a>} icon={<PhoneIcon fontSize="small" color="action" />} />
                    </Paper>
                    {/* EP Information */}
                    <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', mb: 2, boxShadow: '0 2px 12px rgba(40,60,90,0.06)' }}>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 2, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="medium" color="action" /> 1- EP Information
                      </Typography>
                      <InfoRow title="EP ID_Opp ID" value={selectedLead.id} icon={<PersonIcon fontSize="small" color="action" />} />
                      <InfoRow title="Full Name" value={selectedLead.fullName} icon={<PersonIcon fontSize="small" color="action" />} />
                      <InfoRow title="Status" value={selectedLead.status} icon={<EventIcon fontSize="small" color="action" />} />
                    </Paper>
                    {/* Location Information */}
                    <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', mb: 2, boxShadow: '0 2px 12px rgba(40,60,90,0.06)' }}>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 2, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="medium" color="action" /> 2- Location Information
                      </Typography>
                      <InfoRow title="Home MC" value={selectedLead.homeMC} icon={<FlagIcon fontSize="small" color="action" />} />
                      <InfoRow title="Home LC" value={selectedLead.homeLC} icon={<LocationIcon fontSize="small" color="action" />} />
                      <InfoRow title="Host MC" value={selectedLead.hostMC} icon={<FlagIcon fontSize="small" color="action" />} />
                      <InfoRow title="Host LC" value={selectedLead.hostLC} icon={<LocationIcon fontSize="small" color="action" />} />
                    </Paper>
                    {/* Opportunity Information */}
                    <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', mb: 2, boxShadow: '0 2px 12px rgba(40,60,90,0.06)' }}>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 2, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon fontSize="medium" color="action" /> 3- Opportunity Information
                      </Typography>
                      <InfoRow title="Opportunity Link" value={<a href={selectedLead.opportunityLink} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>{selectedLead.opportunityLink}</a>} icon={<BusinessIcon fontSize="small" color="action" />} />
                      {/* Product as a colored Chip */}
                      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.2 }}>
                        <Grid item xs={5} md={4}>
                          <Typography sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WorkIcon fontSize="small" color="action" /> Product
                          </Typography>
                        </Grid>
                        <Grid item xs={7} md={8}>
                          {(() => {
                            const prod = (selectedLead.programme || '').toLowerCase();
                            let color = '#e0e0e0';
                            if (prod === 'gv') color = '#F85A40';
                            else if (prod === 'gta') color = '#0CB9C1';
                            else if (prod === 'gte') color = '#F48924';
                            return (
                              <Chip label={selectedLead.programme} sx={{ bgcolor: color, color: '#fff', fontWeight: 700, fontSize: '1rem', boxShadow: '0 2px 8px rgba(40,60,90,0.10)' }} />
                            );
                          })()}
                        </Grid>
                      </Grid>
                      <InfoRow title="Duration Type" value={selectedLead.durationType} icon={<EventIcon fontSize="small" color="action" />} />
                    </Paper>
                    {/* Dates Table */}
                    <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', mb: 2, boxShadow: '0 2px 12px rgba(40,60,90,0.06)' }}>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 2, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon fontSize="medium" color="action" /> 4- Dates
                      </Typography>
                      <Table size="small" sx={{ minWidth: 320, background: 'white', borderRadius: 1 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: 'primary.main', border: 0, fontSize: '1rem' }}>Field</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: 'primary.main', border: 0, fontSize: '1rem' }}>Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dateRows.map((row, idx) => (
                            <TableRow key={row.label} sx={{ background: idx % 2 === 0 ? 'grey.100' : 'white' }}>
                              <TableCell sx={{ fontWeight: 700, color: 'text.primary', border: 0, width: '50%', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EventIcon fontSize="small" color="action" /> {row.label}
                              </TableCell>
                              <TableCell sx={{ color: 'text.secondary', border: 0, fontWeight: 500, fontSize: '1rem' }}>{formatDate(row.value) || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                    {/* Additional Information */}
                    <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', mb: 2, boxShadow: '0 2px 12px rgba(40,60,90,0.06)' }}>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 2, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon fontSize="medium" color="action" /> 5- Additional Information
                      </Typography>
                      <InfoRow title="Sub Product" value={selectedLead.subProduct} icon={<WorkIcon fontSize="small" color="action" />} />
                      <InfoRow title="Title" value={selectedLead.title} icon={<BusinessIcon fontSize="small" color="action" />} />
                      <InfoRow title="Campus" value={selectedLead.campus} icon={<SchoolIcon fontSize="small" color="action" />} />
                      <InfoRow title="Signup Date" value={selectedLead.signupDate} icon={<EventIcon fontSize="small" color="action" />} />
                    </Paper>
                    {/* Additional Display Fields */}
                    <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(40,60,90,0.06)' }}>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 2, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon fontSize="medium" color="action" /> 6- Additional Display Fields
                      </Typography>
                      <InfoRow title="LC Alignment" value={selectedLead.lcAlignment} icon={<SchoolIcon fontSize="small" color="action" />} />
                      <InfoRow title="Created At" value={selectedLead.createdAt} icon={<EventIcon fontSize="small" color="action" />} />
                    </Paper>
                  </>;
                })()}
              </Stack>
            )}
            {tab === 1 && (
              <>
                <PreparationStepsTab
                  selectedLead={selectedLead}
                  fileToBase64={fileToBase64}
                  prepState={prepState}
                  setPrepState={setPrepState}
                  updateStandardsFn={patchICXRealizationsStandards}
                />
                {false && (
              <Box sx={{ p: 4, color: 'text.secondary' }}>
                <Typography variant="h6" color="primary" sx={{ mb: 3, fontWeight: 700 }}>Preparation Steps</Typography>
                <Stack spacing={3}>
                  {/* #1 PSG */}
                  <Card elevation={2} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentIndIcon color="primary" /> #1 PSG
                      </Typography>
                      <MUIList dense>
                        <ListItem alignItems="flex-start">
                          <ListItemIcon><ChatIcon color="action" /></ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                            <Checkbox
                              checked={!!prepState[selectedLead.id]?.iceBroken}
                              onChange={e => setPrepState(prev => ({
                                ...prev,
                                [selectedLead.id]: {
                                  ...prev[selectedLead.id],
                                  iceBroken: e.target.checked
                                }
                              }))}
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            <ListItemText primary="CXP manager contact EP to break the ice (4 months before realization date)" />
                          </Box>
                        </ListItem>
                        <ListItem>
                          <TextField
                            label="Notes"
                            size="small"
                            fullWidth
                            value={prepState[selectedLead.id]?.iceNotes || ''}
                            onChange={e => setPrepState(prev => ({
                              ...prev,
                              [selectedLead.id]: {
                                ...prev[selectedLead.id],
                                iceNotes: e.target.value
                              }
                            }))}
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        </ListItem>
                      </MUIList>
                    </CardContent>
                  </Card>
                  {/* #2 OPS */}
                  <Card elevation={2} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon color="primary" /> #2 OPS
                      </Typography>
                      <MUIList dense>
                        <ListItem>
                          <ListItemIcon><InsertDriveFileIcon color="action" /></ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                            <ListItemText primary="Passport (3 months before realization date)" />
                            <Button
                              variant="outlined"
                              component="label"
                              size="small"
                              sx={{ minWidth: 120 }}
                            >
                              {prepState[selectedLead.id]?.passportFile ? 'Change File' : 'Upload File'}
                              <input
                                type="file"
                                hidden
                                accept="application/pdf,image/*"
                                onChange={async e => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    try {
                                      const base64Data = await fileToBase64(file);
                                      const uploadDate = new Date();
                                    setPrepState(prev => ({
                                      ...prev,
                                      [selectedLead.id]: {
                                        ...prev[selectedLead.id],
                                          passportFile: {
                                            name: file.name,
                                            type: file.type,
                                            data: base64Data,
                                            size: file.size,
                                            uploadDate: uploadDate.toISOString()
                                          },
                                          passportUploadDate: uploadDate.toISOString()
                                      }
                                    }));
                                    } catch (error) {
                                      console.error('File conversion failed:', error);
                                    }
                                  }
                                }}
                              />
                            </Button>
                            {prepState[selectedLead.id]?.passportFile && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  <a
                                    href={prepState[selectedLead.id].passportFile.data}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#1976d2', textDecoration: 'underline' }}
                                  >
                                    {prepState[selectedLead.id].passportFile.name}
                                  </a>
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Uploaded: {formatDateTime(new Date(prepState[selectedLead.id].passportUploadDate))}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><AttachMoneyIcon color="action" /></ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                            <Checkbox
                              checked={!!prepState[selectedLead.id]?.pocketMoneyCollected}
                              onChange={e => setPrepState(prev => ({
                                ...prev,
                                [selectedLead.id]: {
                                  ...prev[selectedLead.id],
                                  pocketMoneyCollected: e.target.checked
                                }
                              }))}
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            <ListItemText primary="EP starts collecting pocket money for the experience (3 months before realization date)" />
                          </Box>
                        </ListItem>
                      </MUIList>
                    </CardContent>
                  </Card>
                  {/* #3 Health Insurance */}
                  <Card elevation={2} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalHospitalIcon color="primary" /> #3 Health Insurance
                      </Typography>
                      <MUIList dense>
                        <ListItem>
                          <ListItemIcon><LocalHospitalIcon color="action" /></ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                            <ListItemText primary="Health insurance" />
                            <Button
                              variant="outlined"
                              component="label"
                              size="small"
                              sx={{ minWidth: 120 }}
                            >
                              {prepState[selectedLead.id]?.insuranceFile ? 'Change File' : 'Upload File'}
                              <input
                                type="file"
                                hidden
                                accept="application/pdf,image/*"
                                onChange={async e => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    try {
                                      const base64Data = await fileToBase64(file);
                                      const uploadDate = new Date();
                                    setPrepState(prev => ({
                                      ...prev,
                                      [selectedLead.id]: {
                                        ...prev[selectedLead.id],
                                          insuranceFile: {
                                            name: file.name,
                                            type: file.type,
                                            data: base64Data,
                                            size: file.size,
                                            uploadDate: uploadDate.toISOString()
                                          },
                                          insuranceUploadDate: uploadDate.toISOString()
                                      }
                                    }));
                                    } catch (error) {
                                      console.error('File conversion failed:', error);
                                    }
                                  }
                                }}
                              />
                            </Button>
                            {prepState[selectedLead.id]?.insuranceFile && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  <a
                                    href={prepState[selectedLead.id].insuranceFile.data}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#1976d2', textDecoration: 'underline' }}
                                  >
                                    {prepState[selectedLead.id].insuranceFile.name}
                                  </a>
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Uploaded: {formatDateTime(new Date(prepState[selectedLead.id].insuranceUploadDate))}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </ListItem>
                      </MUIList>
                    </CardContent>
                  </Card>
                  {/* #4 Expectation Settings */}
                  <Card elevation={2} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SettingsIcon color="primary" /> #4 Expectation Settings
                      </Typography>
                      <MUIList dense>
                        <ListItem>
                          <ListItemIcon><SettingsIcon color="action" /></ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                            <Checkbox
                              checked={!!prepState[selectedLead.id]?.expectationSet}
                              onChange={e => setPrepState(prev => ({
                                ...prev,
                                [selectedLead.id]: {
                                  ...prev[selectedLead.id],
                                  expectationSet: e.target.checked
                                }
                              }))}
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            <ListItemText primary="Expectation setting" />
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              sx={{ ml: 1, minWidth: 80 }}
                              onClick={() => {/* Add send logic here */}}
                            >
                              Send
                            </Button>
                          </Box>
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><EmailIcon color="action" /></ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                            <Checkbox
                              checked={!!prepState[selectedLead.id]?.invitationSent}
                              onChange={e => setPrepState(prev => ({
                                ...prev,
                                [selectedLead.id]: {
                                  ...prev[selectedLead.id],
                                  invitationSent: e.target.checked
                                }
                              }))}
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            <ListItemText primary="Invitation letter (soft copy 2 weeks after approval date)" />
                          </Box>
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><EventAvailableIcon color="action" /></ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                            <Checkbox
                              checked={!!prepState[selectedLead.id]?.irConfirmed}
                              onChange={e => setPrepState(prev => ({
                                ...prev,
                                [selectedLead.id]: {
                                  ...prev[selectedLead.id],
                                  irConfirmed: e.target.checked
                                }
                              }))}
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            <ListItemText primary="IR confirmed that the EP is going to apply for visa" />
                          </Box>
                        </ListItem>
                      </MUIList>
                    </CardContent>
                  </Card>
                  {/* #5 Visa */}
                  <Card elevation={2} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FlightTakeoffIcon color="primary" /> #5 Visa
                      </Typography>
                      <MUIList dense>
                        <ListItem>
                          <ListItemIcon><InsertDriveFileIcon color="action" /></ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                            <ListItemText primary="Visa" />
                            <Button
                              variant="outlined"
                              component="label"
                              size="small"
                              sx={{ minWidth: 120 }}
                            >
                              {prepState[selectedLead.id]?.visaFile ? 'Change File' : 'Upload File'}
                              <input
                                type="file"
                                hidden
                                accept="application/pdf,image/*"
                                onChange={async e => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    try {
                                      const base64Data = await fileToBase64(file);
                                      const uploadDate = new Date();
                                    setPrepState(prev => ({
                                      ...prev,
                                      [selectedLead.id]: {
                                        ...prev[selectedLead.id],
                                          visaFile: {
                                            name: file.name,
                                            type: file.type,
                                            data: base64Data,
                                            size: file.size,
                                            uploadDate: uploadDate.toISOString()
                                          },
                                          visaUploadDate: uploadDate.toISOString()
                                      }
                                    }));
                                    } catch (error) {
                                      console.error('File conversion failed:', error);
                                    }
                                  }
                                }}
                              />
                            </Button>
                            {prepState[selectedLead.id]?.visaFile && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  <a
                                    href={prepState[selectedLead.id].visaFile.data}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#1976d2', textDecoration: 'underline' }}
                                  >
                                    {prepState[selectedLead.id].visaFile.name}
                                  </a>
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Uploaded: {formatDateTime(new Date(prepState[selectedLead.id].visaUploadDate))}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><FlightTakeoffIcon color="action" /></ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                            <ListItemText primary="Flight Tickets" />
                            <Button
                              variant="outlined"
                              component="label"
                              size="small"
                              sx={{ minWidth: 120 }}
                            >
                              {prepState[selectedLead.id]?.flightFile ? 'Change File' : 'Upload File'}
                              <input
                                type="file"
                                hidden
                                accept="application/pdf,image/*"
                                onChange={async e => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    try {
                                      const base64Data = await fileToBase64(file);
                                      const uploadDate = new Date();
                                    setPrepState(prev => ({
                                      ...prev,
                                      [selectedLead.id]: {
                                        ...prev[selectedLead.id],
                                          flightFile: {
                                            name: file.name,
                                            type: file.type,
                                            data: base64Data,
                                            size: file.size,
                                            uploadDate: uploadDate.toISOString()
                                          },
                                          flightUploadDate: uploadDate.toISOString()
                                      }
                                    }));
                                    } catch (error) {
                                      console.error('File conversion failed:', error);
                                    }
                                  }
                                }}
                              />
                            </Button>
                            {prepState[selectedLead.id]?.flightFile && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  <a
                                    href={prepState[selectedLead.id].flightFile.data}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#1976d2', textDecoration: 'underline' }}
                                  >
                                    {prepState[selectedLead.id].flightFile.name}
                                  </a>
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Uploaded: {formatDateTime(new Date(prepState[selectedLead.id].flightUploadDate))}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </ListItem>
                      </MUIList>
                    </CardContent>
                  </Card>
                  {/* Communication */}
                  <Card elevation={2} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ChatIcon color="primary" /> Communication
                      </Typography>
                      <MUIList dense>
                        <ListItem>
                          <ListItemIcon><ChatIcon color="action" /></ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                            <Checkbox
                              checked={!!prepState[selectedLead.id]?.tenDaysBefore}
                              onChange={e => setPrepState(prev => ({
                                ...prev,
                                [selectedLead.id]: {
                                  ...prev[selectedLead.id],
                                  tenDaysBefore: e.target.checked
                                }
                              }))}
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            <ListItemText primary="10 days before Realization" />
                          </Box>
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><AccessTimeIcon color="action" /></ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                            <Checkbox
                              checked={!!prepState[selectedLead.id]?.twentyFourBefore}
                              onChange={e => setPrepState(prev => ({
                                ...prev,
                                [selectedLead.id]: {
                                  ...prev[selectedLead.id],
                                  twentyFourBefore: e.target.checked
                                }
                              }))}
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            <ListItemText primary="24 hours before arrival" />
                          </Box>
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><EventAvailableIcon color="action" /></ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                            <Checkbox
                              checked={!!prepState[selectedLead.id]?.epArrived}
                              onChange={e => setPrepState(prev => ({
                                ...prev,
                                [selectedLead.id]: {
                                  ...prev[selectedLead.id],
                                  epArrived: e.target.checked
                                }
                              }))}
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            <ListItemText primary="EP Arrived" />
                          </Box>
                        </ListItem>
                      </MUIList>
                    </CardContent>
                  </Card>
                  {/* #6 Arrival Pickup */}
                  <Card elevation={2} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DirectionsCarIcon color="primary" /> #6 Arrival Pickup
                      </Typography>
                      <MUIList dense>
                        <ListItem>
                          <ListItemIcon><DirectionsCarIcon color="action" /></ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                            <Checkbox
                              checked={!!prepState[selectedLead.id]?.pickupDone}
                              onChange={e => setPrepState(prev => ({
                                ...prev,
                                [selectedLead.id]: {
                                  ...prev[selectedLead.id],
                                  pickupDone: e.target.checked
                                }
                              }))}
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            <ListItemText primary="Pick up done" />
                          </Box>
                        </ListItem>
                      </MUIList>
                    </CardContent>
                  </Card>
                  {/* #7 Accommodation */}
                  <Card elevation={2} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HomeIcon color="primary" /> #7 Accommodation
                      </Typography>
                      <MUIList dense>
                        <ListItem>
                          <ListItemIcon><HomeIcon color="action" /></ListItemIcon>
                          <TextField
                            label="Accommodation place"
                            size="small"
                            fullWidth
                            value={prepState[selectedLead.id]?.accommodationPlace || ''}
                            onChange={e => setPrepState(prev => ({
                              ...prev,
                              [selectedLead.id]: {
                                ...prev[selectedLead.id],
                                accommodationPlace: e.target.value
                              }
                            }))}
                            variant="outlined"
                          />
                        </ListItem>
                      </MUIList>
                    </CardContent>
                  </Card>
                  {/* #8 IPS */}
                  <Card elevation={2} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon color="primary" /> #8 IPS
                      </Typography>
                      <MUIList dense>
                        <ListItem>
                          <ListItemIcon><SchoolIcon color="action" /></ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                            <Checkbox
                              checked={!!prepState[selectedLead.id]?.ipsDone}
                              onChange={e => setPrepState(prev => ({
                                ...prev,
                                [selectedLead.id]: {
                                  ...prev[selectedLead.id],
                                  ipsDone: e.target.checked
                                }
                              }))}
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            <ListItemText primary="IPS is done" />
                          </Box>
                        </ListItem>
                      </MUIList>
                    </CardContent>
                  </Card>
                </Stack>
              </Box>
                )}
              </>
            )}
            {tab === 2 && (
              <ExperienceTab
                selectedLead={selectedLead}
                prepState={prepState}
                setPrepState={setPrepState}
                formatDateTime={formatDateTime}
                fileToBase64={fileToBase64}
                updateStandardsFn={patchICXRealizationsStandards}
              />
            )}
            {tab === 3 && (
              <>
                <PostExperienceTab
                  selectedLead={selectedLead}
                  prepState={prepState}
                  setPrepState={setPrepState}
                  updateStandardsFn={patchICXRealizationsStandards}
                />
                {false && (
              <Box sx={{ p: 4, color: 'text.secondary' }}>
                <Typography variant="h6" color="primary" sx={{ mb: 3, fontWeight: 700 }}>Post Experience</Typography>
                <Stack spacing={3}>
                  {/* #18 Debrief with AIESEC */}
                  <Card elevation={2} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ChatIcon color="primary" /> #18 Debrief with AIESEC
                      </Typography>
                      <MUIList dense>
                        <ListItem>
                          <ListItemIcon><ChatIcon color="action" /></ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                            <Checkbox
                              checked={!!prepState[selectedLead.id]?.debriefCompleted}
                              onChange={e => setPrepState(prev => ({
                                ...prev,
                                [selectedLead.id]: {
                                  ...prev[selectedLead.id],
                                  debriefCompleted: e.target.checked
                                }
                              }))}
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            <ListItemText primary="EP finished the debriefing space" />
                          </Box>
                        </ListItem>
                      </MUIList>
                    </CardContent>
                  </Card>
                </Stack>
              </Box>
                )}
              </>
            )}
          </DialogContent>

          <DialogActions 
            sx={{ 
              p: 2, 
              gap: 1,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100%',
                background: 'linear-gradient(135deg, rgba(25,118,210,0.03) 0%, rgba(25,118,210,0) 100%)',
                transform: 'skewY(-2deg)',
                transformOrigin: 'top left'
              }
            }}
          >
            <Box sx={{ position: 'relative', display: 'flex', gap: 1 }}>
              <Button
                onClick={handleCloseProfile}
                sx={{
                  transform: 'skew(-2deg)',
                  '& .MuiButton-label': {
                    transform: 'skew(2deg)'
                  }
                }}
              >
                Close
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}



      {/* Bulk Assign Dialog */}
      <Dialog open={bulkAssignDialogOpen} onClose={() => setBulkAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Assign Realizations</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography>
              Assigning {selectedLeads.length} realizations to:
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select Member</InputLabel>
              <Select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                label="Select Member"
              >
                {members.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.person}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkAssignDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={async () => {
              if (selectedMember) {
                const member = members.find(m => m.id === selectedMember);
                if (member) {
                  await handleAssignMember(member);
                  setSelectedMember('');
                  setBulkAssignDialogOpen(false);
                }
              }
            }}
            variant="contained"
            disabled={!selectedMember}
          >
            Assign {selectedLeads.length} Realizations
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ICXRealizationsPage; 