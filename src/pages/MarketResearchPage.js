import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  StepContent,
  Avatar,
  Stack,
  Snackbar,
  Tab,
  Tabs,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  ButtonGroup,
  Checkbox,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  LinkedIn as LinkedInIcon,
  Save as SaveIcon,
  MeetingRoom as MeetingRoomIcon,
  TrendingUp as TrendingUpIcon,
  Comment as CommentIcon,
  Assignment as AssignmentIcon,
  Send as SendIcon,
  HelpOutline as HelpOutlineIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Filter as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useCRMType } from '../context/CRMTypeContext';
import { EventEmitter } from 'events';
import { useAuth } from '../context/AuthContext';
import { LC_CODES, MC_EGYPT_CODE } from '../lcCodes';
import marketResearchAPI from '../api/services/marketResearchAPI';
import podioAPI from '../api/services/podioAPI';
import { fetchActiveMembers } from '../api/services/membersAPI';
import Cookies from 'js-cookie';
import { getCrmAccessToken } from '../utils/crmToken';
const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Energy',
  'Construction',
  'Transportation',
  'Other'
];

const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
];

const accountTypes = [
  'iCX',
  'B2B'
];

// Move companySteps outside the component to ensure it's always defined
const companySteps = [
  { label: 'Market Research', icon: <BusinessIcon />, description: 'Initial research phase' },
  { label: 'Contacted', icon: <PhoneIcon />, description: 'Company has been contacted' },
  { label: 'Visit Scheduled', icon: <EventAvailableIcon />, description: 'Visit has been scheduled' },
  { label: 'Visit Completed', icon: <MeetingRoomIcon />, description: 'Company visit completed' },
  { label: 'Opportunity Raised', icon: <TrendingUpIcon />, description: 'Opportunity has been raised' },
  { label: 'Rejected', icon: <EventBusyIcon />, description: 'Partner rejected the opportunity' }
];

// Create a shared event emitter for follow-up status changes
export const followUpStatusEmitter = new EventEmitter();

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

function MarketResearchPage() {
  const { crmType } = useCRMType();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [allCompanies, setAllCompanies] = useState([]); // Store all companies
  const [companies, setCompanies] = useState([]); // Store filtered companies
  const [openDialog, setOpenDialog] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [comment, setComment] = useState('');
  const [followup, setFollowup] = useState({
    title: '',
    date: '',
    description: ''
  });
  const [snackbar, setSnackbar] = useState({
      open: false,
      message: '',
      severity: 'success'
    });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const initialCompanyState = {
    name: '',
    industry: '',
    size: '',
    type: '',
    personName: '',
    personContact: '',
    position: '',
    email: '',
    linkedin: '',
    website: '',
    address: '',
    podio: 'No',
    contacted: null,
    interested: null,
    visitStatus: null,
    comments: [],
    followups: [],
    currentStep: 0,
  };
  const [newCompany, setNewCompany] = useState(initialCompanyState);
  const [activeStep, setActiveStep] = useState(0);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const { currentUser, isAdmin, login } = useAuth();
  const [selectedCompanyData, setSelectedCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usePodioData, setUsePodioData] = useState(true); // Toggle between Podio and local data
  const membersFetched = useRef(false);
  const [members, setActiveMembers] = useState([]);
  const steps = [
    {
      label: 'Company Information',
      icon: <BusinessIcon />,
      description: 'Enter basic company details'
    },
    {
      label: 'Contact Person',
      icon: <PersonIcon />,
      description: 'Add contact person information'
    }
  ];

  useEffect(() => {
    if (selectedCompany) {
      setSelectedCompanyData(selectedCompany);
      console.log("selectedCompanyData synced with selectedCompany:", selectedCompany);
    }
  }, [selectedCompany]);

const getTeamUnderCurrentUser = (members) => {
  const currentUserId = Cookies.get("person_id");
  const userRole = Cookies.get("userRole");
  if (!currentUserId || !members || members.length === 0) return [];

  // 🧩 Helper: recursively flatten all children (TL + TM)
  const flattenTeam = (nodes, list = []) => {
    for (const node of nodes || []) {
      list.push({
        id: node.id,
        role: node.role,
        person: node.person
      });
      if (node.children && node.children.length > 0) {
        flattenTeam(node.children, list);
      }
    }
    return list;
  };

  // ✅ Case 1: If user is LCVP → flatten all TLs + TMs across *all* LCVPs
  if (userRole && userRole.toUpperCase().includes("LCVP")) {
    let allMembers = [];
    for (const vp of members) {
      allMembers = flattenTeam(vp.children || [], allMembers);
    }

    // sort TL first, TM second
    allMembers.sort((a, b) => {
      const order = { TL: 1, TM: 2 };
      const aRole = a.role.toUpperCase().includes("TL") ? "TL" : "TM";
      const bRole = b.role.toUpperCase().includes("TL") ? "TL" : "TM";
      return order[aRole] - order[bRole];
    });

    return allMembers;
  }

  // ✅ Case 2: If user is TL or TM → show only their direct children
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

  for (const vp of members) {
    findNode(vp);
    if (targetNode) break;
  }

  if (!targetNode) {
    console.warn("Current user not found in hierarchy");
    return [];
  }

  const children = (targetNode.children || []).map(child => ({
    id: child.id,
    role: child.role,
    person: child.person
  }));

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
      const isUnderOG = parentTitle?.includes('ICX') || parentTitle?.includes('IGV') || parentTitle?.includes('IGTA')|| parentTitle?.includes('IGTE') || parentTitle?.includes('BD') || parentTitle?.includes('B2B') ;

      return isLCVP && isUnderOG;
    });
    const teamMembers = getTeamUnderCurrentUser(filteredMembers);
    setActiveMembers(teamMembers);
    } catch (error) {
      console.error('Error fetching active members:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch active members',
        severity: 'error',
      });
    }
  };
  // Update fetchLeads to accept lcCode as a parameter
 
useEffect(() => {
  const lcCode = isAdmin ? MC_EGYPT_CODE : getOfficeId(currentUser);
  const token = getCrmAccessToken();

  if (!isAdmin && !lcCode) {
    setSnackbar({
      open: true,
      message: "No office assigned to your account. Cannot fetch companies.",
      severity: "error",
    });
    return;
  }

  // Fetch active members

  if (lcCode) {
    if (!membersFetched.current) {
      currentMembers(lcCode, token); // 👈 only once
      membersFetched.current = true;
    }
  }
}, [ currentUser, isAdmin]);

  // Fetch companies from Podio or local database
  const fetchCompanies = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      let response;
      
      if (usePodioData) {
        // Fetch from Podio API
        response = await marketResearchAPI.getMarketResearchFromPodio(filters);
        
        console.log('[MarketResearch] Podio response received:', {
          isArray: Array.isArray(response),
          length: Array.isArray(response) ? response.length : 'not an array',
          firstItem: Array.isArray(response) && response.length > 0 ? response[0] : 'no items',
          responseType: typeof response
        });
        
        // Ensure response is an array
        if (!Array.isArray(response)) {
          console.error('[MarketResearch] Podio response is not an array:', response);
          setAllCompanies([]);
          setCompanies([]);
          return;
        }
        
        // Map Podio data format to component format
        const parsedCompanies = response.map(comp => ({
          ...initialCompanyState,
          id: comp.podioItemId || comp.podioDealId, // Use Podio ID as identifier
          name: comp.companyName || comp.name,
          companyName: comp.companyName || comp.name,
          industry: comp.industry || '-',
          size: comp.size || '-',
          type: comp.accountType || comp.type || '-',
          accountType: comp.accountType || comp.type || '-',
          address: comp.location || comp.address || '-',
          location: comp.location || comp.address || '-',
          personName: comp.contactPerson || comp.personName || '-',
          contact_person: comp.contactPerson || comp.personName || '-',
          interested: comp.interested || null,
          status: comp.status || 'Active',
          podio: comp.podio || 'Yes',
          podioLink: comp.podioLink,
          podioItemId: comp.podioItemId,
          assignedTo: comp.assignedTo || '-',
          // Map status to currentStep for compatibility
          currentStep: comp.status === 'Market Research' ? 0 :
                       comp.status === 'Contacted' ? 1 :
                       comp.status === 'Visit Scheduled' ? 2 :
                       comp.status === 'Visit Completed' ? 3 :
                       comp.status === 'Raised' ? 4 : 0,
          comments: [],
          followups: [],
          statusHistory: [],
          visitOutcome: '',
          visitNumberOfSlots: '',
          visitOutcomeNotes: '',
          contacted: null,
          visitStatus: null
        }));
        
        console.log('[MarketResearch] Parsed companies:', {
          count: parsedCompanies.length,
          firstCompany: parsedCompanies.length > 0 ? {
            id: parsedCompanies[0].id,
            companyName: parsedCompanies[0].companyName,
            name: parsedCompanies[0].name
          } : 'no companies'
        });
        
        setAllCompanies(parsedCompanies);
        setCompanies(parsedCompanies);
      } else {
        // Fetch from local database (existing behavior)
        response = await marketResearchAPI.getCompanies();
        const parsedCompanies = response.map(comp => ({
          ...initialCompanyState,
          ...comp,
          comments: Array.isArray(comp.comments) ? comp.comments : [],
          followups: Array.isArray(comp.followups) ? comp.followups : [],
          statusHistory: Array.isArray(comp.statusHistory) ? comp.statusHistory : [],
          currentStep: typeof comp.currentStep === 'number' ? comp.currentStep : 0,
          visitOutcome: comp.visitOutcome || '',
          visitNumberOfSlots: comp.visitNumberOfSlots || '',
          visitOutcomeNotes: comp.visitOutcomeNotes || '',
          status: comp.status || 'Active',
          podio: comp.podio || 'No',
          contacted: comp.contacted || null,
          interested: comp.interested || null,
          visitStatus: comp.visitStatus || null
        }));
        setAllCompanies(parsedCompanies);
        setCompanies(parsedCompanies);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      // If Podio fails, fall back to local data
      if (usePodioData) {
        console.warn("Podio fetch failed, falling back to local data");
        try {
          const response = await marketResearchAPI.getCompanies();
          const parsedCompanies = response.map(comp => ({
            ...initialCompanyState,
            ...comp,
            comments: Array.isArray(comp.comments) ? comp.comments : [],
            followups: Array.isArray(comp.followups) ? comp.followups : [],
            statusHistory: Array.isArray(comp.statusHistory) ? comp.statusHistory : [],
            currentStep: typeof comp.currentStep === 'number' ? comp.currentStep : 0,
            visitOutcome: comp.visitOutcome || '',
            visitNumberOfSlots: comp.visitNumberOfSlots || '',
            visitOutcomeNotes: comp.visitOutcomeNotes || '',
            status: comp.status || 'Active',
            podio: comp.podio || 'No',
            contacted: comp.contacted || null,
            interested: comp.interested || null,
            visitStatus: comp.visitStatus || null
          }));
          setAllCompanies(parsedCompanies);
          setCompanies(parsedCompanies);
        } catch (fallbackError) {
          console.error("Fallback fetch also failed:", fallbackError);
          setAllCompanies([]);
          setCompanies([]);
        }
      } else {
        setAllCompanies([]);
        setCompanies([]);
      }
    } finally {
      setLoading(false);
    }
  }, [usePodioData]);

  // Local search function for non-Podio data
  const handleLocalSearch = useCallback(() => {
    const searchTermLower = searchTerm.toLowerCase();
    const userOfficeId = getOfficeId(currentUser);
    const filteredCompanies = allCompanies.filter(company => {
      // Only show companies created by the user's LC (if applicable)
      if (company.created_by_lc && company.created_by_lc !== userOfficeId) return false;
      
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        company.name?.toLowerCase().includes(searchTermLower) ||
        company.companyName?.toLowerCase().includes(searchTermLower) ||
        company.industry?.toLowerCase().includes(searchTermLower) ||
        company.accountType?.toLowerCase().includes(searchTermLower) ||
        company.type?.toLowerCase().includes(searchTermLower) ||
        company.personName?.toLowerCase().includes(searchTermLower) ||
        company.contact_person?.toLowerCase().includes(searchTermLower) ||
        company.address?.toLowerCase().includes(searchTermLower) ||
        company.location?.toLowerCase().includes(searchTermLower);

      // Industry filter
      const matchesIndustry = selectedIndustry === '' || company.industry === selectedIndustry;

      // Company size filter
      const matchesSize = selectedSize === '' || company.size === selectedSize;

      // Account type filter
      const matchesAccountType = selectedAccountType === '' || 
        company.accountType === selectedAccountType ||
        company.type === selectedAccountType;

      // Status filter
      const matchesStatus = selectedStatus === '' || 
        (selectedStatus === 'Market Research' && company.currentStep === 0) ||
        (selectedStatus === 'Contacted' && company.currentStep === 1) ||
        (selectedStatus === 'Visit Scheduled' && company.currentStep === 2) ||
        (selectedStatus === 'Visit Completed' && company.currentStep === 3) ||
        (selectedStatus === 'Raised' && company.visitOutcome === 'Positive - Opportunity Raised') ||
        (selectedStatus === 'Partner Rejected' && company.visitOutcome === 'Negative - Partner Rejected') ||
        (company.status && company.status.toLowerCase().includes(selectedStatus.toLowerCase()));

      return matchesSearch && matchesIndustry && matchesSize && matchesAccountType && matchesStatus;
    });

    setCompanies(filteredCompanies);
  }, [searchTerm, selectedIndustry, selectedSize, selectedAccountType, selectedStatus, allCompanies, currentUser]);

  // Check Podio auth status and load companies on component mount
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        // Check for Podio error in URL (from OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const podioError = urlParams.get('podio_error');
        
        if (podioError) {
          console.error('[MarketResearch] Podio OAuth error:', podioError);
          // Remove error from URL
          window.history.replaceState({}, '', window.location.pathname);
          // Fall back to local data
          setUsePodioData(false);
          fetchCompanies();
          return;
        }

        // Check if user is authenticated with Podio
        const status = await podioAPI.getStatus();
        
        // Handle both 'authorized' and 'authenticated' fields for backwards compatibility
        const isAuthenticated = status.authenticated || status.authorized;
        
        if (!isAuthenticated && usePodioData) {
          // User not authenticated, get auth URL and redirect
          try {
            const { authUrl } = await podioAPI.getAuthUrl();
            console.log('[MarketResearch] Redirecting to Podio OAuth:', authUrl);
            window.location.href = authUrl;
            return; // Don't load data yet, user will be redirected
          } catch (authError) {
            console.error('Error getting Podio auth URL:', authError);
            // Fall back to local data
            setUsePodioData(false);
          }
        }
        
        // Load companies if authenticated or using local data
        fetchCompanies();
      } catch (error) {
        console.error('Error checking Podio auth:', error);
        // Fall back to local data
        if (usePodioData) {
          setUsePodioData(false);
          fetchCompanies();
        }
      }
    };

    checkAuthAndLoad();
  }, [usePodioData, fetchCompanies]);
  

  // Debounced search effect - only applies local filtering, no automatic API calls
  // Refresh is now manual-only via the refresh button
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!usePodioData) {
        // Only apply local filtering for non-Podio data (no API call)
        handleLocalSearch();
      }
      // For Podio data, filters are applied when user clicks refresh button
      // No automatic fetching on filter changes
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedIndustry, selectedSize, selectedAccountType, selectedStatus, usePodioData, handleLocalSearch]);

  const handleSaveCompany = async () => {
    const now = new Date().toISOString();
    const officeId = getOfficeId(currentUser);
  
    try {
      let response;
      if (selectedCompany) {
        // Update existing company
        response = await marketResearchAPI.updateCompany(selectedCompany.id, {
          ...newCompany,
          updated_at: now,
          created_by_lc: officeId
        });
  
        setAllCompanies(prev =>
          prev.map(comp => (comp.id === selectedCompany.id ? response.data : comp))
        );
        setCompanies(prev =>
          prev.map(comp => (comp.id === selectedCompany.id ? response.data : comp))
        );
      } else {
        // Add new company
        response = await marketResearchAPI.addCompany({
          ...newCompany,
          created_at: now,
          updated_at: now,
          currentStep: 0,
          comments: [],
          followups: [],
          created_by_lc: officeId
        });
  
        setAllCompanies(prev => [...prev, response.data]);
        setCompanies(prev => [...prev, response.data]); // <== FIXED
      }
  
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving company:", err);
    }
  };
  
  

  const handleDeleteCompany = async (companyId) => {
    try{
      const response = await marketResearchAPI.deleteCompany(companyId);
      console.log("response: ", response);
      const updatedCompanies = allCompanies.filter(company => company.id !== companyId);
      setAllCompanies(updatedCompanies);
      setCompanies(updatedCompanies);
    }catch(err){
      console.error("Error deleting company:", err);
    }
    
    //handleSearch();(); // Reapply filters after deleting
  };


  // Modify the search input to trigger search on change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    // Debounced search is handled by useEffect
  };

  // Refresh button handler - manual refresh only (no periodic/automatic refresh)
  const handleRefresh = () => {
    if (usePodioData) {
      // Fetch from Podio with current filters
      fetchCompanies({
        search: searchTerm,
        industry: selectedIndustry,
        size: selectedSize,
        accountType: selectedAccountType,
        status: selectedStatus
      });
    } else {
      // For local data, just re-apply filters
      handleLocalSearch();
    }
  };

  // Modify the industry select to trigger search on change
  const handleIndustryChange = (event) => {
    setSelectedIndustry(event.target.value);
  };

  // Modify the size select to trigger search on change
  const handleSizeChange = (event) => {
    setSelectedSize(event.target.value);
  };

  // Add account type filter handler
  const handleAccountTypeChange = (event) => {
    setSelectedAccountType(event.target.value);
  };

  // Add status filter handler
  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setNewCompany(initialCompanyState);
    setActiveStep(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCompany(null);
    setNewCompany(initialCompanyState);
    setActiveStep(0);
  };

  const handleInputChange = (field) => async (event) => {
    const value = event.target.value;
  
    setNewCompany(prevCompany => {
      const updated = { ...prevCompany, [field]: value };
      // Call API to update backend
      if (prevCompany.id) { // Ensure company already exists in DB
        marketResearchAPI.updateCompany(prevCompany.id, updated)
          .then(response => {
            console.log(`Field ${field} updated in backend:`, response.data);
          })
          .catch(err => console.error('Error updating company field:', err));
      }
  
      return updated;
    });
  };
  

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 0:
        return newCompany.name && newCompany.industry && newCompany.size && newCompany.type && newCompany.website && newCompany.address;
      case 1:
        return newCompany.contact_person && newCompany.contact_position && newCompany.phone && newCompany.email;
      default:
        return false;
    }
  };

  const handleOpenProfile = async (company) => {
    console.log("Opening profile for company:", company);
    
    try {
      // Fetch full company data from API when profile is first opened
      const response = await marketResearchAPI.getCompany(company.id);
      const fullCompanyData = response[0]; // Get the full company data
      
      console.log("Fetched full company data:", fullCompanyData);
      
      setSelectedCompany(fullCompanyData);
      setSelectedCompanyData(fullCompanyData);
      setOpenProfileDialog(true);
    } catch (err) {
      console.error("Error fetching company data:", err);
      // Fallback to the basic company data if API call fails
      setSelectedCompany(company);
      setSelectedCompanyData(company);
      setOpenProfileDialog(true);
    }
  };

  const handleCloseProfile = () => {
    setSelectedCompany(null);
    setOpenProfileDialog(false);
  };

  const handleEditCompany = (company) => {
    // Ensure all fields from initial state are present
    const companyToEdit = { ...initialCompanyState, ...company };
    setSelectedCompany(companyToEdit);
    setNewCompany(companyToEdit);
    setActiveStep(0);
    setOpenDialog(true);
  };

  const handleProfileInputChange = (field) => async (event) => {
    if (!selectedCompany) return;
  
    const value = event.target.value;
    const now = new Date().toISOString();
    let updatedFields = {};
    let statusUpdateNote = null;

    switch (field) {
      case 'podio':

        updatedFields.podio = value; // Keep the exact value, don't normalize
        if (value === 'No') {
          updatedFields.contacted = null;
          updatedFields.interested = null;
          updatedFields.visitStatus = null;
          updatedFields.visit = null; // Also reset backend field
        }
        break;
  
      case 'contacted':
        updatedFields.contacted = value; // Keep the exact value, don't normalize
        if (value !== 'Yes') {
          updatedFields.interested = null;
          updatedFields.visitStatus = null;
          updatedFields.visit = null; // Also reset backend field
        }
        // Step advancement
        if (value === 'Yes' && selectedCompany.currentStep < 1) {
          updatedFields.currentStep = 1;
          statusUpdateNote = `Status updated to ${companySteps[1].label} via profile interaction.`;
        }
        break;
  
      case 'interested':
        updatedFields.interested = value; // Keep the exact value, don't normalize
        if (value !== 'Yes') {
          updatedFields.visitStatus = null;
          updatedFields.visit = null; // Also reset backend field
        }
        break;
  
      case 'visitStatus':
        updatedFields.visitStatus = value; // Keep the exact value for frontend
        updatedFields.visit = value; // Also update the backend field name
        if (value === 'Scheduled' && (selectedCompany.currentStep == null || selectedCompany.currentStep < 2)) {
          updatedFields.currentStep = 2;
          statusUpdateNote = `Status updated to ${companySteps[2].label} via profile interaction.`;
        }
        break;
  
      default:
        updatedFields[field] = value;
        break;
    }
    
    
    // Merge updated fields
    const updatedCompany = {
      ...selectedCompany,
      ...updatedFields,
      lastUpdated: now
    };
    

  
    // Update status history if necessary
    if (statusUpdateNote) {
      updatedCompany.statusHistory = [
        ...(selectedCompany.statusHistory || []),
        {
          step: updatedFields.currentStep,
          date: now,
          note: statusUpdateNote
        }
      ];
    }
  
     // Update local state immediately
     setSelectedCompany(updatedCompany);
    // setSelectedCompanyData(updatedCompany); // Also update selectedCompanyData for immediate UI update
     //console.log("selectedCompanyData2:",selectedCompanyData)
     console.log("Updated selectedCompany with:", updatedCompany);
     try {
      // Call backend API
      const response = await marketResearchAPI.updateCompany(selectedCompany.id, updatedCompany);
  
      // Update the global companies list
      setAllCompanies(prev =>
        prev.map(comp => (comp.id === selectedCompany.id ? response.data : comp))
      );
    } catch (error) {
      console.error('Error updating company:', error);
      // Optionally, show a notification to the user
    }
  };
  
  

  const handleAddComment = async() => {
    if (!comment.trim() || !selectedCompany) return;
    const name = Cookies.get('user_name');
    const id = Cookies.get('person_id');

    const newComment = {
      id: id,
      text: comment,
      createdAt: new Date().toISOString(),
      author: name // Replace with actual user data
    };

    const updatedCompany = {
      ...selectedCompany,
      comments: [...(selectedCompany.comments || []), newComment],
      lastUpdated: new Date().toISOString()
    };

    const updatedCompanies = allCompanies.map(company =>
      company.id === selectedCompany.id ? updatedCompany : company
    );

    setAllCompanies(updatedCompanies);
    setSelectedCompany(updatedCompany);
    try {
      // Call backend API
      const response = await marketResearchAPI.updateCompany(selectedCompany.id, updatedCompany);
      
      // Update the global companies list
      setAllCompanies(prev =>
        prev.map(comp => (comp.id === selectedCompany.id ? response.data : comp))
      );
    } catch (error) {
      console.error('Error updating company:', error);
      // Optionally, show a notification to the user
    }
    setComment('');
  };

  const handleAddFollowup = async() => {
    if (!followup.title || !followup.date || !followup.description || !selectedCompany) return;
    const name = Cookies.get('user_name');
    const id = Cookies.get('person_id');
    const newFollowup = {
      followUpID: Date.now(),
      id: id, // Generate unique ID for the followup
      title: followup.title,
      text: followup.description,
      date: followup.date,
      timestamp: new Date().toISOString(),
      author: name,
      status: 'pending',
      entityPhone: selectedCompany.phone || '-',
      entityType: 'company',
      companyName: selectedCompany.name, // Add this explicitly
      companyId: selectedCompany.id      // Add this explicitly
    };

    // Update company state
    const updatedCompany = {
      ...selectedCompany,
      followups: [...(selectedCompany.followups || []), newFollowup],
      lastUpdated: new Date().toISOString()
    };

    // Save to localStorage for company profile
    const updatedCompanies = allCompanies.map(company =>
      company.id === selectedCompany.id ? updatedCompany : company
    );
    setAllCompanies(updatedCompanies);
    setSelectedCompany(updatedCompany);
    try {
      // Call backend API
      const response = await marketResearchAPI.updateCompany(selectedCompany.id, updatedCompany);
      
      // Update the global companies list
      setAllCompanies(prev =>
        prev.map(comp => (comp.id === selectedCompany.id ? response.data : comp))
      );
    } catch (error) {
      console.error('Error updating company:', error);
      // Optionally, show a notification to the user
    }

    setFollowup({ title: '', date: '', description: '' });
  };

  // Subscribe to follow-up status changes from other components
  useEffect(() => {
    const handleExternalStatusChange = ({ followupId, newStatus, companyId }) => {
      if (selectedCompany && selectedCompany.id === companyId) {
        const updatedCompany = {
          ...selectedCompany,
          followups: selectedCompany.followups.map(f =>
            f.id === followupId ? { ...f, status: newStatus } : f
          ),
          lastUpdated: new Date().toISOString()
        };

        setSelectedCompany(updatedCompany);

        const updatedCompanies = allCompanies.map(company =>
          company.id === companyId ? updatedCompany : company
        );
        setAllCompanies(updatedCompanies);
      }
    };

    followUpStatusEmitter.on('statusChange', handleExternalStatusChange);
    return () => {
      followUpStatusEmitter.off('statusChange', handleExternalStatusChange);
    };
  }, [selectedCompany, allCompanies]);

  const handleFollowupStatusChange = (followupId, newStatus) => {
    // Update company state
    const updatedCompany = {
      ...selectedCompany,
      followups: selectedCompany.followups.map(f =>
        f.id === followupId ? { ...f, status: newStatus } : f
      ),
      lastUpdated: new Date().toISOString()
    };

    // Update companies in localStorage
    const updatedCompanies = allCompanies.map(company =>
      company.id === selectedCompany.id ? updatedCompany : company
    );
    setAllCompanies(updatedCompanies);
    setSelectedCompany(updatedCompany);

    // Update follow-ups page storage
    const updatedFollowUps = existingFollowUps.map(f =>
      f.id === followupId ? { ...f, status: newStatus } : f
    );

    // Emit event for real-time sync
    followUpStatusEmitter.emit('statusChange', {
      followupId,
      newStatus,
      companyId: selectedCompany.id
    });
  };

  const handleStepChange = async (companyId, newStep) => {
    if (!selectedCompany || selectedCompany.id !== companyId) return;
    const now = new Date().toISOString();
    try {
      const response = await marketResearchAPI.updateCompany(companyId, {
        currentStep: newStep,
        updated_at: now
      });
  
      setSelectedCompany(response.data);
      setAllCompanies(prev =>
        prev.map(comp => (comp.id === companyId ? response.data : comp))
      );
    } catch (err) {
      console.error("Failed to update company step:", err);
    }
  

    // If moving to Visit Completed stage (index 3), check visitStatus
    // Note: Existing logic for visitStatus/visitDate might need review based on workflow
    if (newStep === 3 && selectedCompany.currentStep !== 3) { 
      // If visitStatus wasn't set to 'Scheduled' before, maybe default it now?
      // Or perhaps this logic is no longer needed if handled by the dropdowns.
      // For now, just log that we reached this step.
      console.log(`Company ${companyId} moved to Visit Completed stage.`);
      // Example: if (!updatedCompany.visitStatus) updatedCompany.visitStatus = 'Completed'; 
    }

    const updatedCompanies = allCompanies.map(company =>
      company.id === companyId ? updatedCompany : company
    );

    setAllCompanies(updatedCompanies);
    setSelectedCompany(response);
  };

  const renderCompanyForm = () => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Company Name"
            value={newCompany.name}
            onChange={handleInputChange('name')}
            required
            InputProps={{
              startAdornment: <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Website"
            value={newCompany.website}
            onChange={handleInputChange('website')}
            placeholder="https://example.com"
            InputProps={{
              startAdornment: <LanguageIcon sx={{ mr: 1, color: 'primary.main' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Industry</InputLabel>
            <Select
              value={newCompany.industry}
              onChange={handleInputChange('industry')}
              label="Industry"
              required
              startAdornment={<WorkIcon sx={{ mr: 1, color: 'primary.main' }} />}
            >
              {industries.map((industry) => (
                <MenuItem key={industry} value={industry}>
                  {industry}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Company Size</InputLabel>
            <Select
              value={newCompany.size}
              onChange={handleInputChange('size')}
              label="Company Size"
              required
              startAdornment={<BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />}
            >
              {companySizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Account Type</InputLabel>
            <Select
              value={newCompany.type}
              onChange={handleInputChange('type')}
              label="Account Type"
              required
              startAdornment={<BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />}
            >
              {accountTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            value={newCompany.address}
            onChange={handleInputChange('address')}
            multiline
            rows={2}
            required
            InputProps={{
              startAdornment: <LocationIcon sx={{ mr: 1, mt: 1, color: 'primary.main' }} />,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderContactForm = () => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Person Name"
            value={newCompany.contact_person}
            onChange={handleInputChange('contact_person')}
            required
            InputProps={{
              startAdornment: <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Position"
            value={newCompany.contact_position}
            onChange={handleInputChange('contact_position')}
            required
            InputProps={{
              startAdornment: <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Contact Number"
            value={newCompany.phone}
            onChange={handleInputChange('phone')}
            required
            InputProps={{
              startAdornment: <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newCompany.email}
            onChange={handleInputChange('email')}
            required
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="LinkedIn Profile"
            value={newCompany.linkedin}
            onChange={handleInputChange('linkedin')}
            placeholder="https://linkedin.com/in/username"
            InputProps={{
              startAdornment: <LinkedInIcon sx={{ mr: 1, color: 'primary.main' }} />,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderCompanyProfile = () => {
    if (!selectedCompany) return null;
    // Ensure we have all required data
    // const company = {
    //   ...initialCompanyState,
    //   ...selectedCompany,
    //   comments: Array.isArray(selectedCompany.comments) ? selectedCompany.comments : [],
    //   followups: Array.isArray(selectedCompany.followups) ? selectedCompany.followups : [],
    //   currentStep: typeof selectedCompany.currentStep === 'number' ? selectedCompany.currentStep : 0,
    //   statusHistory: Array.isArray(selectedCompany.statusHistory) ? selectedCompany.statusHistory : [],
    //   visitOutcome: selectedCompany.visitOutcome || '',
    //   visitNumberOfSlots: selectedCompany.visitNumberOfSlots || '',
    //   visitOutcomeNotes: selectedCompany.visitOutcomeNotes || ''
    // };

    // useEffect(() => {
    //   console.log("selectedCompany: ", selectedCompany);
    //   if (!selectedCompany) return;

    //   const fetchCompany = async () => {
    //     try {
    //       const response = await marketResearchAPI.getCompany(selectedCompany.id);
    //       console.log("response: ", response);
    //       setSelectedCompanyData(response.data);
    //     } catch (error) {
    //       console.error("Error fetching company:", error);
    //     }
    //   };

    //   fetchCompany();
    // }, [selectedCompany]);

    
    if (!selectedCompany || !selectedCompanyData) return null;

    const company = selectedCompanyData;
    const companyInitial = company.name ? company.name.charAt(0).toUpperCase() : '?';
    return (
      <Dialog
        open={openProfileDialog}
        onClose={handleCloseProfile}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'background.paper',
            minHeight: '80vh',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, position: 'relative', overflow: 'hidden' }}>
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: 'linear-gradient(135deg, rgba(25,118,210,0.05) 0%, rgba(25,118,210,0) 100%)',
              transform: 'skewY(-4deg)',
              transformOrigin: 'top left'
            }}
          />
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ position: 'relative' }}>
            <Box display="flex" gap={3}>
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                  transform: 'rotate(-10deg)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              >
                {companyInitial}
              </Avatar>
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'primary.main', 
                    mb: 0.5,
                    transform: 'skew(-2deg)'
                  }}
                >
                  {company.name || 'Unnamed Company'}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    transform: 'skew(-2deg)'
                  }}
                >
                  <BusinessIcon fontSize="small" />
                  {company.industry || 'No Industry'} • {company.size || 'No Size'}
                </Typography>
                {/* Display the LC name if available */}
                {company.created_by_lc && (
                  <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                    Created by LC: {LC_CODES.find(lc => lc.id === company.created_by_lc)?.name || company.created_by_lc}
                  </Typography>
                )}
              </Box>
            </Box>
            <IconButton 
              onClick={handleCloseProfile} 
              size="small"
              sx={{
                bgcolor: 'background.paper',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: 'grey.100',
                  transform: 'rotate(90deg)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          <Stack spacing={2} sx={{ p: 2 }}>
            {/* Progress Stepper */}
            <Card 
              elevation={0} 
              sx={{ 
                bgcolor: 'background.paper',
                p: 3,
                borderRadius: 2,
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
              <Box sx={{ position: 'relative' }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    color: 'primary.main', 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    transform: 'skew(-2deg)'
                  }}
                >
                  <TrendingUpIcon /> Company Status
                </Typography>
                <Stepper 
                  activeStep={company.currentStep === -1 ? 4 : company.currentStep} 
                  alternativeLabel
                  sx={{
                    width: '100%',
                    '& .MuiStepLabel-root': {
                      '& .MuiStepLabel-iconContainer': {
                        '& .MuiSvgIcon-root': {
                          width: 32,
                          height: 32,
                          color: (theme) => theme.palette.primary.main,
                        }
                      },
                      '& .MuiStepLabel-label': {
                        color: (theme) => theme.palette.text.primary,
                        '&.Mui-active': {
                          color: (theme) => theme.palette.primary.main,
                          fontWeight: 600,
                        }
                      }
                    },
                    '& .MuiStep-root': {
                      flex: 1,
                      minWidth: 0,
                      '& .MuiStepLabel-root': {
                        padding: '0 48px',
                      }
                    },
                    '& .MuiStepConnector-root': {
                      top: 16,
                      left: 'calc(-50% + 24px)',
                      right: 'calc(50% + 24px)',
                    }
                  }}
                >
                  {companySteps && companySteps.map((step, index) => {
                    // Skip Opportunity Raised step if rejected
                    if (company.visitoutcome === 'Negative - Partner Rejected' && index === 4) {
                      return null;
                    }
                    // Skip Rejected step if opportunity is raised or if no outcome is selected yet
                    if ((company.visitoutcome === 'Positive - Opportunity Raised' || !company.visitoutcome) && index === 5) {
                      return null;
                    }

                    const isCompleted = 
                      (index === 0 && company.podio === 'Yes') || // Market Research completed if approved on Podio
                      (index === 1 && company.contacted === 'Yes') || // Contacted completed if contacted is Yes
                      (index < company.currentStep) || // Previous steps are completed
                      (company.visitoutcome === 'Negative - Partner Rejected' && (index === 2 || index === 3)) || // Mark Visit Scheduled and Visit Completed as complete when rejected
                      (index === 5 && company.visitoutcome === 'Negative - Partner Rejected') || // Rejected completed if visit outcome is rejected
                      (company.visitoutcome === 'Positive - Opportunity Raised' && index === 4); // Opportunity Raised completed if visit outcome is raised
                    const isActive = index === (company.visitoutcome === 'Negative - Partner Rejected' ? 5 : 
                                             company.visitoutcome === 'Positive - Opportunity Raised' ? 4 : 
                                             company.currentStep);
                    const isRejected = company.visitoutcome === 'Negative - Partner Rejected' && index === 5;
                    const isRaised = company.visitoutcome === 'Positive - Opportunity Raised' && index === 4;
                    const status = isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Pending';
                    
                    return (
                      <Step key={step.label} completed={isCompleted}>
                        <StepLabel
                          StepIconComponent={() => (
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isRejected ? 'error.main' : 
                                       isRaised ? 'success.main' :
                                       isCompleted ? 'success.main' : 
                                       isActive ? 'primary.main' : 'grey.400',
                                bgcolor: 'background.paper',
                                borderRadius: '50%',
                                boxShadow: 1,
                                position: 'relative',
                                transform: 'rotate(-10deg)',
                                '&::after': isCompleted ? {
                                  content: '""',
                                  position: 'absolute',
                                  top: -6,
                                  left: -6,
                                  right: -6,
                                  bottom: -6,
                                  border: '3px solid',
                                  borderColor: isRejected ? 'error.main' : 
                                             isRaised ? 'success.main' :
                                             'success.main',
                                  borderRadius: '50%',
                                  opacity: 0.6,
                                } : {}
                              }}
                            >
                              {step.icon}
                            </Box>
                          )}
                        >
                          <Box>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: 600,
                                transform: 'skew(-2deg)'
                              }}
                            >
                              {step.label}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ 
                                transform: 'skew(-2deg)'
                              }}
                            >
                              {step.description}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block',
                                color: isRejected ? 'error.main' :
                                       isRaised ? 'success.main' :
                                       isCompleted ? 'success.main' : 
                                       isActive ? 'primary.main' : 'text.secondary',
                                fontWeight: isActive ? 600 : 400,
                                mt: 0.5,
                                transform: 'skew(-2deg)'
                              }}
                            >
                              {status}
                            </Typography>
                          </Box>
                        </StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
              </Box>
              </Card>

            {/* Company Details & Contact Person */}
            <Card 
              elevation={0} 
              sx={{ 
                bgcolor: 'background.paper',
                p: 3,
                borderRadius: 2,
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
              <Box sx={{ position: 'relative' }}>
              <Grid container spacing={4}>
                {/* Company Information */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ pr: { md: 4 }, borderRight: { md: 1 }, borderColor: 'divider' }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          color: 'primary.main', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          mb: 3,
                          transform: 'skew(-2deg)'
                        }}
                      >
                    <BusinessIcon /> Company Information
                  </Typography>
                  <Grid container spacing={2}>
                      <Grid item xs={12}>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 0.5,
                              transform: 'skew(-2deg)'
                            }}
                          >
                            Website
                          </Typography>
                        <Typography 
                          variant="body1" 
                          component="a" 
                          href={company?.website ? (company.website.startsWith('http') ? company.website : `https://${company.website}`) : '#'} 
                          target="_blank" 
                          onClick={(e) => {
                            if (!company?.website) {
                              e.preventDefault();
                            }
                          }}
                          sx={{ 
                            color: 'primary.main', 
                            wordBreak: 'break-all',
                            textDecoration: 'none',
                            cursor: company?.website ? 'pointer' : 'default',
                            '&:hover': {
                              textDecoration: company?.website ? 'underline' : 'none'
                              },
                              transform: 'skew(-2deg)'
                          }}
                        >
                          {company?.website || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 0.5,
                              transform: 'skew(-2deg)'
                            }}
                          >
                            Industry
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              transform: 'skew(-2deg)'
                            }}
                          >
                          {company?.industry || 'Not specified'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 0.5,
                              transform: 'skew(-2deg)'
                            }}
                          >
                            Company Size
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              transform: 'skew(-2deg)'
                            }}
                          >
                          {company?.size || 'Not specified'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 0.5,
                              transform: 'skew(-2deg)'
                            }}
                          >
                            Account Type
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              transform: 'skew(-2deg)'
                            }}
                          >
                          {company?.type || 'Not specified'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 0.5,
                              transform: 'skew(-2deg)'
                            }}
                          >
                            Address
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              transform: 'skew(-2deg)'
                            }}
                          >
                          {company?.address || 'Not specified'}
                        </Typography>
                    </Grid>
                  </Grid>
                  </Box>
                </Grid>

                {/* Contact Person */}
                <Grid item xs={12} md={6}>
                  <Box>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          color: 'primary.main', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          mb: 3,
                          transform: 'skew(-2deg)'
                        }}
                      >
                    <PersonIcon /> Contact Person
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 0.5,
                              transform: 'skew(-2deg)'
                            }}
                          >
                            Name
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              transform: 'skew(-2deg)'
                            }}
                          >
                          {company?.contact_person || 'Not specified'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 0.5,
                              transform: 'skew(-2deg)'
                            }}
                          >
                            Position
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              transform: 'skew(-2deg)'
                            }}
                          >
                          {company?.contact_position || 'Not specified'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 0.5,
                              transform: 'skew(-2deg)'
                            }}
                          >
                            Email
                          </Typography>
                        <Typography 
                          variant="body1" 
                          component="a" 
                          href={company?.email ? `mailto:${company.email}` : '#'} 
                          onClick={(e) => {
                            if (!company?.email) {
                              e.preventDefault();
                            }
                          }}
                          sx={{ 
                            color: 'primary.main',
                            wordBreak: 'break-all',
                            textDecoration: 'none',
                            cursor: company?.email ? 'pointer' : 'default',
                            '&:hover': {
                              textDecoration: company?.email ? 'underline' : 'none'
                              },
                              transform: 'skew(-2deg)'
                          }}
                        >
                          {company?.email || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 0.5,
                              transform: 'skew(-2deg)'
                            }}
                          >
                            Phone
                          </Typography>
                        <Typography 
                          variant="body1" 
                          component="a" 
                          href={company?.phone ? `tel:${company.phone}` : '#'} 
                          onClick={(e) => {
                            if (!company?.phone) {
                              e.preventDefault();
                            }
                          }}
                          sx={{ 
                            color: 'primary.main',
                            textDecoration: 'none',
                            cursor: company?.phone ? 'pointer' : 'default',
                            '&:hover': {
                              textDecoration: company?.phone ? 'underline' : 'none'
                              },
                              transform: 'skew(-2deg)'
                          }}
                        >
                          {company?.phone || 'Not specified'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 0.5,
                              transform: 'skew(-2deg)'
                            }}
                          >
                            LinkedIn
                          </Typography>
                        <Typography 
                          variant="body1" 
                          component="a" 
                          href={company?.linkedin ? (company.linkedin.startsWith('http') ? company.linkedin : `https://${company.linkedin}`) : '#'} 
                          target="_blank" 
                          onClick={(e) => {
                            if (!company?.linkedin) {
                              e.preventDefault();
                            }
                          }}
                          sx={{ 
                            color: 'primary.main',
                            wordBreak: 'break-all',
                            textDecoration: 'none',
                            cursor: company?.linkedin ? 'pointer' : 'default',
                            '&:hover': {
                              textDecoration: company?.linkedin ? 'underline' : 'none'
                              },
                              transform: 'skew(-2deg)'
                          }}
                        >
                          {company?.linkedin || 'Not specified'}
                      </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                    </Grid>
                  </Grid>
              </Box>
                </Card>

            {/* Interaction Status */}
            <Card 
              elevation={0} 
              sx={{ 
                bgcolor: 'background.paper',
                p: 3,
                borderRadius: 2,
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
              <Box sx={{ position: 'relative' }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    color: 'primary.main', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 2,
                    transform: 'skew(-2deg)'
                  }}
                >
                      <HelpOutlineIcon /> Interaction Status
                  </Typography>
              <Grid container spacing={1.5}>
                      {/* Approved on Podio? Dropdown */}
                      <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                          <InputLabel id="profile-approved-podio-label">Approved on Podio?</InputLabel>
                          <Select
                            labelId="profile-approved-podio-label"
                            label="Approved on Podio?"
                            name="approvedOnPodio"
                            value={company?.podio || 'No'}
                            onChange={handleProfileInputChange('podio')}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  maxHeight: 300,
                            minWidth: '270px !important',
                                  '& .MuiMenuItem-root': {
                              padding: '10px 16px',
                              fontSize: '0.95rem',
                                  },
                                },
                              },
                            }}
                            sx={{ 
                        minWidth: '270px',
                              '& .MuiSelect-select': {
                          padding: '10px 16px',
                          fontSize: '0.95rem',
                              },
                          transform: 'skew(-2deg)',
                          '& .MuiSelect-select': {
                            transform: 'skew(2deg)'
                          }
                            }}
                          >
                            <MenuItem value="Yes">Yes</MenuItem>
                            <MenuItem value="No">No</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
      
                      {/* Contacted? Dropdown (Conditional) */}
                      {company?.podio === 'Yes' && (
                        <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                            <InputLabel id="profile-contacted-label">Contacted?</InputLabel>
                            <Select
                              labelId="profile-contacted-label"
                              label="Contacted?"
                              name="contacted"
                              value={company?.contacted || ''}
                              onChange={handleProfileInputChange('contacted')}
                              MenuProps={{
                                PaperProps: {
                                  sx: {
                                    maxHeight: 300,
                              minWidth: '270px !important',
                                    '& .MuiMenuItem-root': {
                                padding: '10px 16px',
                                fontSize: '0.95rem',
                                    },
                                  },
                                },
                              }}
                              sx={{ 
                          minWidth: '270px',
                                '& .MuiSelect-select': {
                            padding: '10px 16px',
                            fontSize: '0.95rem',
                                },
                            transform: 'skew(-2deg)',
                            '& .MuiSelect-select': {
                              transform: 'skew(2deg)'
                            }
                              }}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                              <MenuItem value="No Answer">No Answer</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
      
                      {/* Interested? Dropdown (Conditional) */}
                      {company?.podio === 'Yes' && company?.contacted === 'Yes' && (
                        <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                            <InputLabel id="profile-interested-label">Interested?</InputLabel>
                            <Select
                              labelId="profile-interested-label"
                              label="Interested?"
                              name="interested"
                              value={company?.interested || ''}
                              onChange={handleProfileInputChange('interested')}
                              MenuProps={{
                                PaperProps: {
                                  sx: {
                                    maxHeight: 300,
                              minWidth: '270px !important',
                                    '& .MuiMenuItem-root': {
                                padding: '10px 16px',
                                fontSize: '0.95rem',
                                    },
                                  },
                                },
                              }}
                              sx={{ 
                          minWidth: '270px',
                                '& .MuiSelect-select': {
                            padding: '10px 16px',
                            fontSize: '0.95rem',
                                },
                            transform: 'skew(-2deg)',
                            '& .MuiSelect-select': {
                              transform: 'skew(2deg)'
                            }
                              }}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                              <MenuItem value="Approach in the future">Approach in the future</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
      
                      {/* Visit? Dropdown (Conditional) */}
                      {company?.podio === 'Yes' && company?.contacted === 'Yes' && company?.interested === 'Yes' && (
                        <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                            <InputLabel id="profile-visit-label">Visit?</InputLabel>
                            <Select
                              labelId="profile-visit-label"
                              label="Visit?"
                              name="visitStatus"
                              value={company?.visitStatus || company?.visit|| ''}
                              onChange={handleProfileInputChange('visitStatus')}
                              MenuProps={{
                                PaperProps: {
                                  sx: {
                                    maxHeight: 300,
                              minWidth: '270px !important',
                                    '& .MuiMenuItem-root': {
                                padding: '10px 16px',
                                fontSize: '0.95rem',
                                    },
                                  },
                                },
                              }}
                              sx={{ 
                          minWidth: '270px',
                                '& .MuiSelect-select': {
                            padding: '10px 16px',
                            fontSize: '0.95rem',
                                },
                            transform: 'skew(-2deg)',
                            '& .MuiSelect-select': {
                              transform: 'skew(2deg)'
                            }
                              }}
                            >
                              <MenuItem value="Scheduled">Scheduled</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
              </Box>
                 </Card>

            {/* Visit Outcome Section - Only show if company is in Raised state */}
            {company.currentStep === 4 && (
              <Card 
                elevation={0} 
                sx={{ 
                  bgcolor: 'background.paper',
                  p: 3,
                  borderRadius: 2,
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
                <Box sx={{ position: 'relative' }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      color: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 2,
                      transform: 'skew(-2deg)'
                    }}
                  >
                    <TrendingUpIcon /> Visit Outcome
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{ 
                          transform: 'skew(-2deg)'
                        }}
                      >
                        Outcome
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                        color: company.visitOutcome === 'Positive - Opportunity Raised' ? 'success.main' : 
                               company.visitOutcome === 'Positive - Need Follow-up' ? 'primary.main' : 
                                 company.visitOutcome === 'Negative - Partner Rejected' ? 'error.main' : 'text.primary',
                          transform: 'skew(-2deg)'
                        }}
                      >
                        {company.visitOutcome || 'Not specified'}
                      </Typography>
                    </Grid>
                    {company.visitOutcome === 'Positive - Opportunity Raised' && (
                      <Grid item xs={12} md={4}>
                        <Typography 
                          variant="subtitle2" 
                          color="text.secondary"
                          sx={{ 
                            transform: 'skew(-2deg)'
                          }}
                        >
                          Number of Slots
                        </Typography>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            transform: 'skew(-2deg)'
                          }}
                        >
                          {company.visitNumberOfSlots || 'Not specified'}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{ 
                          transform: 'skew(-2deg)'
                        }}
                      >
                        Outcome Notes
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          transform: 'skew(-2deg)'
                        }}
                      >
                        {company.visitOutcomeNotes || 'No notes provided'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Card>
            )}

            {/* Rejection Details Section - Only show if company is rejected */}
            {company.status === 'Rejected' && (
              <Card 
                elevation={0} 
                sx={{ 
                  bgcolor: 'error.lighter',
                  p: 3,
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(211,47,47,0.03) 0%, rgba(211,47,47,0) 100%)',
                    transform: 'skewY(-2deg)',
                    transformOrigin: 'top left'
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      color: 'error.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 2,
                      transform: 'skew(-2deg)'
                    }}
                  >
                    <EventBusyIcon /> Rejection Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{ 
                          transform: 'skew(-2deg)'
                        }}
                      >
                        Rejection Date
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{ 
                          transform: 'skew(-2deg)'
                        }}
                      >
                        {company.rejectionDate ? new Date(company.rejectionDate).toLocaleDateString() : 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{ 
                          transform: 'skew(-2deg)'
                        }}
                      >
                        Rejection Reason
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          transform: 'skew(-2deg)'
                        }}
                      >
                        {company.rejectionReason || 'No reason provided'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Card>
            )}

            {/* Comments Section */}
            <Card elevation={0} sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, width: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Toggle Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    onClick={() => setActiveTab(0)}
                    sx={{
                      flex: 1,
                      height: 64,
                      position: 'relative',
                      bgcolor: activeTab === 0 ? 'transparent' : 'background.paper',
                      color: activeTab === 0 ? 'primary.main' : 'text.secondary',
                      borderRadius: 0,
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: activeTab === 0 ? 
                          'linear-gradient(135deg, primary.lighter 0%, primary.light 100%)' : 
                          'none',
                        opacity: 0.1,
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: '3px',
                        bgcolor: activeTab === 0 ? 'primary.main' : 'transparent',
                        transform: activeTab === 0 ? 'none' : 'translateX(-100%)',
                        transition: 'transform 0.3s ease-in-out',
                      },
                      '&:hover': {
                        bgcolor: 'background.paper',
                        '&::after': {
                          transform: 'none',
                          bgcolor: activeTab === 0 ? 'primary.main' : 'grey.300',
                        }
                      }
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CommentIcon color={activeTab === 0 ? 'primary' : 'inherit'} />
                      <Box>
                        <Typography variant="button" sx={{ display: 'block' }}>
                Comments
              </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: activeTab === 0 ? 'primary.main' : 'text.secondary',
                            fontWeight: 500
                          }}
                        >
                          {(company?.comments || []).length} total
                        </Typography>
                      </Box>
                    </Stack>
                  </Button>
                  <Button
                    onClick={() => setActiveTab(1)}
                    sx={{
                      flex: 1,
                      height: 64,
                      position: 'relative',
                      bgcolor: activeTab === 1 ? 'transparent' : 'background.paper',
                      color: activeTab === 1 ? 'primary.main' : 'text.secondary',
                      borderRadius: 0,
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: activeTab === 1 ? 
                          'linear-gradient(135deg, primary.lighter 0%, primary.light 100%)' : 
                          'none',
                        opacity: 0.1,
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: '3px',
                        bgcolor: activeTab === 1 ? 'primary.main' : 'transparent',
                        transform: activeTab === 1 ? 'none' : 'translateX(-100%)',
                        transition: 'transform 0.3s ease-in-out',
                      },
                      '&:hover': {
                        bgcolor: 'background.paper',
                        '&::after': {
                          transform: 'none',
                          bgcolor: activeTab === 1 ? 'primary.main' : 'grey.300',
                        }
                      }
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AssignmentIcon color={activeTab === 1 ? 'primary' : 'inherit'} />
                      <Box>
                        <Typography variant="button" sx={{ display: 'block' }}>
                          Follow-ups
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: activeTab === 1 ? 'primary.main' : 'text.secondary',
                            fontWeight: 500
                          }}
                        >
                          {(company?.followups || []).length} total
                        </Typography>
                      </Box>
                    </Stack>
                  </Button>
                </Box>

                {/* Comments Content */}
                {activeTab === 0 && (
                  <Box sx={{ mt: 2 }}>
                    {/* Add Comment Input */}
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2,
                        mb: 2,
                        bgcolor: 'background.paper',
                        position: 'relative',
                        borderRadius: 2,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '60%',
                          background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%)',
                          borderRadius: '8px 8px 0 0'
                        }
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <Avatar 
                            sx={{ 
                              width: 36,
                              height: 36,
                              bgcolor: 'primary.main',
                              transform: 'rotate(-10deg)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          >
                            CU
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <TextField
                              fullWidth
                              multiline
                              rows={1}
                              placeholder="What are your thoughts?"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              variant="outlined"
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: 'grey.50',
                                  borderRadius: 1,
                                  '&:hover, &.Mui-focused': {
                                    '& > fieldset': {
                                      borderColor: 'primary.main',
                                      borderWidth: '1px',
                                    }
                                  }
                                }
                              }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                              <Button
                                variant="contained"
                                onClick={handleAddComment}
                                disabled={!comment.trim()}
                                startIcon={<SendIcon />}
                                size="small"
                                sx={{
                                  px: 2,
                                  py: 0.5,
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  transform: 'skew(-10deg)',
                                  '& .MuiButton-startIcon': {
                                    transform: 'skew(10deg)'
                                  },
                                  '& .MuiButton-label': {
                                    transform: 'skew(10deg)'
                                  },
                                  '&:hover': {
                                    bgcolor: 'primary.dark',
                                    transform: 'skew(-10deg) translateY(-2px)',
                                  }
                                }}
                              >
                                <span style={{ transform: 'skew(10deg)' }}>
                                  Post
                                </span>
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>

                    {/* Comments List */}
                    <Stack 
                      spacing={1.5}
                      sx={{ 
                        maxHeight: '200px',
                        overflowY: 'auto',
                        pr: 2,
                        '&::-webkit-scrollbar': {
                          width: '4px',
                        },
                        '&::-webkit-scrollbar-track': {
                          bgcolor: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          bgcolor: 'grey.300',
                          borderRadius: '10px',
                          '&:hover': {
                            bgcolor: 'grey.400',
                          }
                        }
                      }}
                    >
                {(company?.comments || []).length === 0 ? (
                        <Box 
                          sx={{ 
                            py: 2,
                            px: 2,
                            textAlign: 'center',
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '100%',
                              background: 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%)',
                              transform: 'skewY(-4deg)',
                              transformOrigin: 'top left'
                            }
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <CommentIcon 
                              sx={{ 
                                fontSize: 32,
                                color: 'grey.300',
                                mb: 1,
                                transform: 'rotate(-10deg)'
                              }} 
                            />
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              No Comments Yet
                  </Typography>
                            <Typography variant="caption" color="text.disabled" sx={{ maxWidth: 300, mx: 'auto' }}>
                              Be the first to share your thoughts
                            </Typography>
                          </Box>
                        </Box>
                ) : (
                  company?.comments
                    .filter(comment => comment && comment.text && comment.text.trim() !== '')
                          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                          .map((comment, index) => (
                            <Paper
                              key={comment.id}
                              elevation={0}
                              sx={{
                                p: 1.5,
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: '100%',
                                  background: `linear-gradient(135deg, ${
                                    index % 2 === 0 ? 
                                    'rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%' : 
                                    'rgba(25,118,210,0.02) 0%, rgba(25,118,210,0) 100%'
                                  })`,
                                  transform: 'skewY(-2deg)',
                                  transformOrigin: 'top left'
                                },
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                                }
                              }}
                            >
                              <Box sx={{ position: 'relative' }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Avatar 
                                    sx={{ 
                                      width: 32,
                                      height: 32,
                                      bgcolor: 'secondary.main',
                                      transform: 'rotate(-10deg)',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                  >
                          {comment.author ? comment.author.charAt(0).toUpperCase() : '?'}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                        {comment.author || 'Anonymous'}
                                      </Typography>
                                      <Typography 
                                        variant="caption" 
                                        sx={{ 
                                          color: 'text.secondary',
                                          bgcolor: 'grey.50',
                                          px: 0.75,
                                          py: 0.25,
                                          borderRadius: 1,
                                          transform: 'skew(-10deg)'
                                        }}
                                      >
                                        <span style={{ display: 'inline-block', transform: 'skew(10deg)' }}>
                                          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Unknown date'}
                                        </span>
                                      </Typography>
                                    </Box>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: 'text.primary',
                                        lineHeight: 1.4,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        fontSize: '0.875rem'
                                      }}
                                    >
                                      {comment.text}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </Paper>
                          ))
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Follow-ups Content */}
                {activeTab === 1 && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                      Follow-ups
                    </Typography>
                    <Stack spacing={2} sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
                      {(company?.followups || []).length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                          No follow-ups yet.
                        </Typography>
                      ) : (
                        company?.followups.map((followup) => (
                          <Box 
                            key={followup.id} 
                            sx={{
                              p: 2,
                              bgcolor: 'background.paper',
                              borderRadius: 2,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                              '&:hover': {
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                transform: 'translateY(-2px)',
                                transition: 'all 0.3s ease'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                {followup.title}
                              </Typography>
                              <Chip 
                                size="small" 
                                label={followup.status} 
                                color={followup.status === 'completed' ? 'success' : 'warning'}
                                sx={{ 
                                  ml: 1,
                                  textTransform: 'capitalize',
                                  color: '#fff',
                                  ...(followup.status !== 'completed' && {
                                    bgcolor: 'warning.main',
                                    '& .MuiChip-label': {
                                      color: '#fff'
                                    }
                                  }),
                                  ...(followup.status === 'completed' && {
                                    bgcolor: 'success.main',
                                    '& .MuiChip-label': {
                                      color: '#fff'
                                    }
                                  })
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Scheduled for: {new Date(followup.date).toLocaleString()}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                              {followup.text || followup.description}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                Created by {followup.author} on {new Date(followup.timestamp).toLocaleString()}
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleFollowupStatusChange(followup.id, followup.status === 'completed' ? 'pending' : 'completed')}
                                sx={{
                                  ...(followup.status !== 'completed' && {
                                    '&:hover': {
                                      borderColor: 'success.main',
                                      color: 'success.main',
                                      bgcolor: 'success.lighter'
                                    }
                                  }),
                                  ...(followup.status === 'completed' && {
                                    borderColor: 'success.main',
                                    color: 'success.main',
                                    '&:hover': {
                                      borderColor: 'warning.dark',
                                      color: 'warning.dark',
                                      bgcolor: 'warning.lighter',
                                      boxShadow: '0 0 8px rgba(245, 124, 0, 0.2)'
                                    }
                                  })
                                }}
                              >
                                {followup.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
                              </Button>
                            </Box>
                          </Box>
                        ))
                      )}
                    </Stack>
                    <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Follow-up Title"
                        placeholder="Enter follow-up title"
                        value={followup.title}
                        onChange={(e) => setFollowup({ ...followup, title: e.target.value })}
                        size="small"
                      />
                      <TextField
                        fullWidth
                        type="datetime-local"
                        label="Follow-up Date"
                        value={followup.date}
                        onChange={(e) => setFollowup({ ...followup, date: e.target.value })}
                        size="small"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Follow-up Description"
                        placeholder="Enter follow-up description"
                        value={followup.description}
                        onChange={(e) => setFollowup({ ...followup, description: e.target.value })}
                        size="small"
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddFollowup}
                        disabled={!followup.title || !followup.date || !followup.description}
                        startIcon={<SendIcon />}
                        size="small"
                      >
                        Add Follow-up
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </Card>
          </Stack>
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
            startIcon={<EditIcon />}
            onClick={() => {
              handleCloseProfile();
              handleEditCompany(company);
            }}
              sx={{
                transform: 'skew(-2deg)',
                '& .MuiButton-startIcon': {
                  transform: 'skew(2deg)'
                },
                '& .MuiButton-label': {
                  transform: 'skew(2deg)'
                }
            }}
          >
            Edit Company
          </Button>
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              handleDeleteCompany(company.id);
              handleCloseProfile();
            }}
              sx={{
                transform: 'skew(-2deg)',
                '& .MuiButton-startIcon': {
                  transform: 'skew(2deg)'
                },
                '& .MuiButton-label': {
                  transform: 'skew(2deg)'
                }
            }}
          >
            Delete Company
          </Button>
          </Box>
        </DialogActions>
      </Dialog>
    );
  };


  const handleAssignClick = (company) => {
    setSelectedCompany(company);
    setAssignDialogOpen(true);
  };

  const handleAssignClose = () => {
    setAssignDialogOpen(false);
    setSelectedMember('');
    setSelectedCompany(null);
  };

 

  const handleBulkAssignClick = () => {
    setBulkAssignDialogOpen(true);
  };

  const handleBulkAssignClose = () => {
    setBulkAssignDialogOpen(false);
    setSelectedMember('');
    setSelectedCompanies([]);
  };

  const handleBulkAssign =async () => {
    if (!selectedMember || selectedCompanies.length === 0) return;

    try {
      await Promise.all(
        selectedCompanies.map(async (companyId) => {
          // Find the full company object from local state (fallback to id-only object)
          const x = companies.find(c => c.id === companyId);
          const payload = {
            ...x,
            assigned_to: selectedMember,
          };
          console.log("Bulk assigning company payload:", payload);
          await marketResearchAPI.updateCompany(companyId, payload);
          setCompanies(prevCompanies => prevCompanies.map(c => 
            c.id === companyId ? { ...c, assigned_to: selectedMember } : c
          ));
        })
      );

      // Clear selections and close the bulk assign dialog
      setSelectedCompanies([]);
      handleBulkAssignClose();
    } catch (error) {
      console.error('Error assigning companies:', error);
    }
  };

  const handleSelectCompany = (companyId) => {
    setSelectedCompanies(prev => {
      if (prev.includes(companyId)) {
        return prev.filter(id => id !== companyId);
      } else {
        return [...prev, companyId];
      }
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const currentPageCompanyIds = companies
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map(company => company.id);
      setSelectedCompanies(currentPageCompanyIds);
    } else {
      setSelectedCompanies([]);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Function to get assigned member for a company
 

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Market Research
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Companies"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
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
                  ),
                  sx: {
                    height: '56px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                    '& .MuiInputLabel-root': {
                      color: 'text.secondary',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'text.primary',
                      '&::placeholder': {
                        color: 'text.secondary',
                        opacity: 0.7,
                      },
                    },
                  },
                }}
                placeholder="Search by company name, industry, account type, or contact person..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={selectedIndustry}
                  onChange={handleIndustryChange}
                  label="Industry"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        minWidth: '200px !important',
                        '& .MuiMenuItem-root': {
                          padding: '8px 16px',
                          fontSize: '0.9rem',
                        },
                      },
                    },
                  }}
                  sx={{ 
                    height: '56px',
                    minWidth: '200px',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                    '& .MuiSelect-select': {
                      padding: '14px 20px',
                      fontSize: '1.1rem',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      color: 'text.secondary',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>All Industries</em>
                  </MenuItem>
                  {industries.map((industry) => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Company Size</InputLabel>
                <Select
                  value={selectedSize}
                  onChange={handleSizeChange}
                  label="Company Size"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        minWidth: '200px !important',
                        '& .MuiMenuItem-root': {
                          padding: '8px 16px',
                          fontSize: '0.9rem',
                        },
                      },
                    },
                  }}
                  sx={{ 
                    height: '56px',
                    minWidth: '200px',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                    '& .MuiSelect-select': {
                      padding: '14px 20px',
                      fontSize: '1.1rem',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      color: 'text.secondary',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>All Sizes</em>
                  </MenuItem>
                  {companySizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={selectedAccountType}
                  onChange={handleAccountTypeChange}
                  label="Account Type"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        minWidth: '200px !important',
                        '& .MuiMenuItem-root': {
                          padding: '8px 16px',
                          fontSize: '0.9rem',
                        },
                      },
                    },
                  }}
                  sx={{ 
                    height: '56px',
                    minWidth: '200px',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                    '& .MuiSelect-select': {
                      padding: '14px 20px',
                      fontSize: '1.1rem',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      color: 'text.secondary',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>All Account Types</em>
                  </MenuItem>
                  {accountTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  label="Status"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        minWidth: '200px !important',
                        '& .MuiMenuItem-root': {
                          padding: '8px 16px',
                          fontSize: '0.9rem',
                        },
                      },
                    },
                  }}
                  sx={{ 
                    height: '56px',
                    minWidth: '200px',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                    '& .MuiSelect-select': {
                      padding: '14px 20px',
                      fontSize: '1.1rem',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      color: 'text.secondary',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>All Statuses</em>
                  </MenuItem>
                  <MenuItem value="Market Research">Market Research</MenuItem>
                  <MenuItem value="Contacted">Contacted</MenuItem>
                  <MenuItem value="Visit Scheduled">Visit Scheduled</MenuItem>
                  <MenuItem value="Visit Completed">Visit Completed</MenuItem>
                  <MenuItem value="Raised">Raised</MenuItem>
                  <MenuItem value="Partner Rejected">Partner Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddCompany}
                sx={{ 
                  height: '56px',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Add Company
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">Companies List</Typography>
              <IconButton
                onClick={handleRefresh}
                disabled={loading}
                color="primary"
                title="Refresh data from Podio"
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
              {loading && (
                <Typography variant="body2" color="text.secondary">
                  Loading...
                </Typography>
              )}
            </Box>
            {selectedCompanies.length > 0 && (
              <Button
                variant="contained"
                onClick={handleBulkAssignClick}
                startIcon={<AssignmentIcon />}
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                Assign Members
              </Button>
            )}
          </Box>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedCompanies.length > 0 && selectedCompanies.length < companies.length}
                      checked={companies.length > 0 && selectedCompanies.length === companies.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Company Name</TableCell>
                  <TableCell>Industry</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Account Type</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Interested</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No companies found. Start by adding a new company or adjust your search criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  companies
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((company) => (
                    <TableRow 
                      key={company.id}
                      hover
                      onClick={() => handleOpenProfile(company)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: theme.palette.action.hover
                        }
                      }}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedCompanies.includes(company.id)}
                          onChange={() => handleSelectCompany(company.id)}
                        />
                      </TableCell>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.industry}</TableCell>
                      <TableCell>{company.size}</TableCell>
                      <TableCell>{company.accountType}</TableCell>
                      <TableCell>{company.address}</TableCell>
                      <TableCell>{company.personName}</TableCell>
                      <TableCell>
                        <Chip
                          label={company.interested || 'Not Set'}
                          color={company.interested === 'Yes' ? 'success' : 
                                 company.interested === 'No' ? 'error' : 
                                 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            company.currentStep === -1 ? 'Rejected' : 
                            company.status && company.status !== 'Active' ? company.status :
                            companySteps[company.currentStep]?.label || 'Market Research'
                          }
                          color={
                            company.status === 'Rejected' ? 'error' :
                            company.currentStep === 4 ? 'success' :
                            company.currentStep === 3 ? 'info' :
                            company.currentStep === 2 ? 'warning' :
                            company.currentStep === 1 ? 'primary' :
                            'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {company.assignedTo && company.assignedTo !== '-' ? (
                          <Chip
                            label={company.assignedTo}
                            size="small"
                            color="primary"
                          />
                        ) : company.assigned_to ? (
                          <Chip
                            label={members.find(m => m.id === company.assigned_to)?.person || 'Unknown'}
                            size="small"
                            color="primary"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">Not assigned</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCompany(company);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCompany(company.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={companies.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedCompany ? 'Edit Company' : 'Add New Company'}</DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepButton onClick={() => setActiveStep(index)} icon={step.icon}>
                  {step.label}
                </StepButton>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && renderCompanyForm()} 
          {activeStep === 1 && renderContactForm()}

        </DialogContent>
        <DialogActions>
          {activeStep > 0 && (
             <Button onClick={handleBack}>Back</Button>
           )}
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {activeStep < steps.length - 1 ? (
            <Button 
              onClick={handleNext} 
              variant="contained" 
              disabled={!isStepComplete(activeStep)}
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSaveCompany} 
              variant="contained" 
              color="primary"
              disabled={!isStepComplete(activeStep)}
              startIcon={<SaveIcon />}
            >
              {selectedCompany ? 'Save Changes' : 'Add Company'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Company Profile Dialog */}
      {renderCompanyProfile()}

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={handleAssignClose} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Company</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Member</InputLabel>
            <Select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              label="Select Member"
            >
              {members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.person} ({member.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignClose}>Cancel</Button>
          <Button 
            onClick={handleAssign}
            variant="contained"
            disabled={!selectedMember}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Assign Dialog */}
      <Dialog open={bulkAssignDialogOpen} onClose={handleBulkAssignClose} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Assign Companies</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography>
              Assigning {selectedCompanies.length} companies to:
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
                    {member.person} ({member.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkAssignClose}>Cancel</Button>
          <Button 
            onClick={handleBulkAssign}
            variant="contained"
            disabled={!selectedMember}
          >
            Assign {selectedCompanies.length} Companies
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );};
export default MarketResearchPage; 