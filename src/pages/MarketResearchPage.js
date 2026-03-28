import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  Tooltip,
  InputAdornment,
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
  CalendarToday as CalendarTodayIcon,
  SearchOff as SearchOffIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import EmptyState from '../components/Common/EmptyState';
import { useCRMType } from '../context/CRMTypeContext';
import { useSnackbarContext } from '../context/SnackbarContext';
import { EventEmitter } from 'events';
import { useAuth } from '../context/AuthContext';
import { LC_CODES, MC_EGYPT_CODE } from '../lcCodes';
import marketResearchAPI from '../api/services/marketResearchAPI';
import podioAPI from '../api/services/podioAPI';
import { fetchActiveMembersRecursive, fetchMembersByLc, getSyncPersonId } from '../api/services/membersAPI';
import Cookies from 'js-cookie';
import { getCrmAccessToken } from '../utils/crmToken';
import { getLCNameById, getLCIdByName } from '../utils/officeUtils';
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

/** Get logged-in user's LC name for filtering. Prefer same sources as sidebar: currentUser.lc, then current_offices[0].name, then userLC storage, then resolve from office id. */
function getUserLCName(currentUser) {
  const fromOfficeName = currentUser?.current_offices?.[0]?.name && String(currentUser.current_offices[0].name).trim();
  const name = currentUser?.lc || currentUser?.userLC || fromOfficeName || localStorage.getItem('userLC') || Cookies.get('userLC');
  if (name && String(name).trim()) {
    const trimmed = String(name).trim();
    const asNum = parseInt(trimmed, 10);
    if (!Number.isNaN(asNum) && LC_CODES && LC_CODES.some(lc => lc.id === asNum)) {
      const resolved = getLCNameById(asNum);
      if (resolved) return resolved;
    }
    return trimmed;
  }
  const officeId = getOfficeId(currentUser);
  if (officeId != null) return getLCNameById(officeId) || null;
  return null;
}

/** Normalize value for display: show category "text" instead of raw JSON/object. */
function displayText(val, fallback = '-') {
  if (val == null || val === '') return fallback;
  if (typeof val === 'object' && val !== null) {
    if (typeof val.text === 'string' && val.text) return val.text;
    if (typeof val.name === 'string' && val.name) return val.name;
    return fallback;
  }
  const s = String(val).trim();
  if (!s) return fallback;
  if ((s.startsWith('{') && s.includes('"text"')) || (s.startsWith('{') && s.includes("'text'"))) {
    try {
      const parsed = JSON.parse(s.replace(/'/g, '"'));
      if (parsed && (parsed.text || parsed.name)) return parsed.text || parsed.name;
    } catch (_) {
      const m = s.match(/"text"\s*:\s*"([^"]+)"/) || s.match(/'text'\s*:\s*'([^']+)'/);
      if (m) return m[1];
    }
  }
  return s;
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
  const [scheduledVisitDate, setScheduledVisitDate] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [comment, setComment] = useState('');
  const [followup, setFollowup] = useState({
    title: '',
    date: '',
    description: ''
  });
  const { showSuccess, showError, showWarning, showInfo } = useSnackbarContext();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const initialCompanyState = {
    name: '',
    industry: '',
    submittedByLc: '',
    submittedByLcId: null,
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
  const [showAllLCs, setShowAllLCs] = useState(false); // When true, fetch without lc_id to show all companies
  const [lastFetchPageSize, setLastFetchPageSize] = useState(0); // For "Load more": when >= page size there may be more
  const membersFetched = useRef(false);
  const [opportunityRaisedSlots, setOpportunityRaisedSlots] = useState('');
  const [opportunityRaisedNotes, setOpportunityRaisedNotes] = useState('');
  const [members, setActiveMembers] = useState([]);
  const accountTypes = useMemo(() => {
    // Derive distinct account types from loaded companies so the dropdown only shows real values
    const set = new Set();
    for (const c of allCompanies) {
      const raw =
        displayText(c.accountType, '') ||
        displayText(c.type, '');
      const value = (raw || '').trim();
      if (value) set.add(value);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allCompanies]);
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

  // Sync opportunity-raised form when opening a company at step 3
  useEffect(() => {
    if (selectedCompanyData?.currentStep === 3) {
      setOpportunityRaisedSlots(selectedCompanyData.visitNumberOfSlots || '');
      setOpportunityRaisedNotes(selectedCompanyData.visitOutcomeNotes || '');
    }
  }, [selectedCompanyData?.id, selectedCompanyData?.currentStep]);

  // Load scheduled visit date when company card opens (Podio only)
  useEffect(() => {
    if (!openProfileDialog || !selectedCompany?.id || !usePodioData) {
      setScheduledVisitDate(null);
      return;
    }
    let cancelled = false;
    marketResearchAPI.getPodioScheduledVisit(selectedCompany.id)
      .then((data) => {
        if (!cancelled && data?.visit_date) setScheduledVisitDate(new Date(data.visit_date));
        else if (!cancelled) setScheduledVisitDate(null);
      })
      .catch(() => { if (!cancelled) setScheduledVisitDate(null); });
    return () => { cancelled = true; };
  }, [openProfileDialog, selectedCompany?.id, usePodioData]);

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

 


// Fetch TLs, TMs, LCVPs that report to the logged-in user. Uses by-lc/reports-to (no EXPA) first
  // so assign works when EXPA returns 502; only uses token for resolving person id.
  const currentMembers = useCallback(async (lcCode, token) => {
    if (!lcCode) {
      setActiveMembers([]);
      return;
    }
    try {
      const personId = Cookies.get('person_id') || (token ? await getSyncPersonId(token) : null) || null;
      let members = [];
      if (personId) {
        members = await fetchActiveMembersRecursive(lcCode, personId);
      }
      // Fallback: if no one reports to you in EXPA (e.g. org structure not set), show all LC members
      if (!members || members.length === 0) {
        members = await fetchMembersByLc(lcCode);
      }
      const mapped = (members || []).map((m) => ({
        id: m.expa_person_id ?? m.member_id,
        person: m.full_name ?? m.person,
        role: m.role ?? '',
      }));
      setActiveMembers(mapped);
    } catch (error) {
      console.error('Error fetching active members:', error);
      setActiveMembers([]);
      showError('Failed to fetch members');
    }
  }, []);
  // Update fetchLeads to accept lcCode as a parameter
 
useEffect(() => {
  const lcCode = isAdmin ? MC_EGYPT_CODE : getOfficeId(currentUser);
  const token = currentUser?.token || getCrmAccessToken();

  if (!isAdmin && !lcCode) {
    showError("No office assigned to your account. Cannot fetch companies.");
    return;
  }

  // Fetch members that report to the logged-in user (TLs, TMs, LCVPs) on page load
  if (lcCode) {
    if (!membersFetched.current) {
      currentMembers(lcCode, token);
      membersFetched.current = true;
    }
  }
}, [currentUser, isAdmin, currentMembers]);

  // When opening assign dialog, refetch members
  useEffect(() => {
    if (!assignDialogOpen || !currentUser) return;
    const lcCode = isAdmin ? MC_EGYPT_CODE : getOfficeId(currentUser);
    const token = currentUser?.token || getCrmAccessToken();
    if (lcCode) {
      currentMembers(lcCode, token);
    }
  }, [assignDialogOpen, currentUser, isAdmin, currentMembers]);

  // Map backend Podio response item to component company format
  const mapBackendItemToCompany = (item) => ({
    ...initialCompanyState,
    id: item.item_id || item.itemId,
    name: item.company_name || item.companyName || '-',
    companyName: item.company_name || item.companyName || '-',
    industry: item.industry || '',  // only from Podio industry field; leave blank if not present
    submittedByLc: item.local_committee || '',  // LC that submitted the company (display name)
    submittedByLcId: item.local_committee_id ?? null,  // Podio LC option id for filtering by id
    size: item.size || '-',
    type: item.type_of_pr_deal || '-',
    accountType: item.type_of_pr_deal || '-',
    address: item.address || '-',
    location: item.local_committee || item.address || '-',
    personName: item.contact_person_name || '-',
    contact_person: item.contact_person_name || '-',
    email: item.contact_email || '',
    phone: item.contact_phone || '',
    personContact: item.contact_phone || '',
    linkedin: item.contact_linkedin || '',
    position: item.contact_position || '',
    website: item.website || '',
    interested: null,
    status: 'Active',
    podio: 'Yes',
    podioItemId: item.item_id || item.itemId,
    assignedTo: '-',
    currentStep: 0,
    comments: [],
    followups: [],
    statusHistory: [],
    visitOutcome: '',
    visitNumberOfSlots: '',
    visitOutcomeNotes: '',
    contacted: null,
    visitStatus: null,
    product: item.product,
    sub_project_igv: item.sub_project_igv,
    reason_of_approach: item.reason_of_approach,
  });

  // Map legacy ICX Podio response to component format
  const mapLegacyPodioToCompany = (comp) => ({
    ...initialCompanyState,
    id: comp.podioItemId || comp.podioDealId,
    name: comp.companyName || comp.name,
    companyName: comp.companyName || comp.name,
    industry: comp.industry || '',
    submittedByLc: comp.submittedByLc || comp.localCommittee || comp.local_committee || '',
    submittedByLcId: comp.submittedByLcId ?? comp.local_committee_id ?? null,
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
    visitStatus: null,
  });

  // Page size for Podio requests (smaller = faster, less timeout risk)
  const PODIO_PAGE_SIZE = 100;
  const MARKET_RESEARCH_ASSIGNMENTS_KEY = 'market_research_assignments';

  const getStoredAssignments = () => {
    try {
      const raw = localStorage.getItem(MARKET_RESEARCH_ASSIGNMENTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  };
  const setStoredAssignment = (companyId, memberId, memberName) => {
    const next = { ...getStoredAssignments(), [String(companyId)]: { member_id: memberId, member_name: memberName } };
    localStorage.setItem(MARKET_RESEARCH_ASSIGNMENTS_KEY, JSON.stringify(next));
  };
  const mergeAssignmentsIntoCompanies = (companyList) => {
    const assignments = getStoredAssignments();
    if (!companyList || Object.keys(assignments).length === 0) return companyList;
    return companyList.map((c) => {
      const a = assignments[String(c.id)];
      if (!a) return c;
      return { ...c, assigned_to: a.member_id, assignedTo: a.member_name || c.assignedTo };
    });
  };

  // Fetch companies from Podio or local database.
  // Pass filters.showAllLCs to override state. Pass options.append and options.offset for "Load more".
  const fetchCompanies = useCallback(async (filters = {}, options = {}) => {
    const useShowAll = filters.showAllLCs !== undefined ? filters.showAllLCs : showAllLCs;
    const lcId = useShowAll ? null : getOfficeId(currentUser);
    const append = options.append === true;
    const offset = options.offset ?? 0;
    setLoading(true);
    try {
      let parsedCompanies = [];

      if (usePodioData) {
        // Use FastAPI backend with pagination (limit 100 per request to avoid timeout)
        try {
          const backendResponse = await marketResearchAPI.getFromBackend({
            limit: PODIO_PAGE_SIZE,
            offset,
            ...(lcId != null && { lc_id: lcId }),
          });
          const rawItems = backendResponse?.items ?? backendResponse?.data?.items ?? backendResponse?.data ?? [];
          const items = Array.isArray(rawItems) ? rawItems : [];
          parsedCompanies = items.map(mapBackendItemToCompany);
          // Merge saved interaction status and funnel from localStorage so list shows correct step/status
          parsedCompanies = parsedCompanies.map(c => {
            try {
              const stored = localStorage.getItem(`company_profile_${c.id}`);
              if (stored) {
                const p = JSON.parse(stored);
                if (p && typeof p === 'object') return { ...c, ...p };
              }
            } catch (e) {}
            return c;
          });
          parsedCompanies = mergeAssignmentsIntoCompanies(parsedCompanies);
          setLastFetchPageSize(parsedCompanies.length);
          if (append) {
            setAllCompanies(prev => [...prev, ...parsedCompanies]);
            // companies will be updated by the search/filter effect that depends on allCompanies
          } else {
            setAllCompanies(parsedCompanies);
            setCompanies(parsedCompanies);
          }
          if (parsedCompanies.length > 0 && !append) {
            showSuccess(useShowAll ? `Loaded ${parsedCompanies.length} companies (all LCs).` : `Loaded ${parsedCompanies.length} companies from Market Research.`);
          } else if (parsedCompanies.length === 0 && !append && lcId != null) {
            showInfo(`No companies submitted by your LC (${getUserLCName(currentUser) || lcId}) in Podio. Use "Show all LCs" to see all companies.`);
          }
          return;
        } catch (backendErr) {
          console.warn('[MarketResearch] FastAPI backend fetch failed:', backendErr?.message);
          showWarning('Could not load companies. Ensure the FastAPI backend is running (port 8000) and Podio is configured.');
          setAllCompanies([]);
          setCompanies([]);
          setLastFetchPageSize(0);
        }
      } else {
        // Fetch from local database (existing behavior)
        const response = await marketResearchAPI.getCompanies();
        let parsedCompanies = response.map(comp => ({
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
        parsedCompanies = mergeAssignmentsIntoCompanies(parsedCompanies);
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
          let parsedCompanies = response.map(comp => ({
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
          parsedCompanies = mergeAssignmentsIntoCompanies(parsedCompanies);
          setAllCompanies(parsedCompanies);
          setCompanies(parsedCompanies);
        } catch (fallbackError) {
          console.error("Fallback fetch also failed:", fallbackError);
          setAllCompanies([]);
          setCompanies([]);
          setLastFetchPageSize(0);
        }
      } else {
        setAllCompanies([]);
        setCompanies([]);
      }
      setLastFetchPageSize(0);
    } finally {
      setLoading(false);
    }
  }, [usePodioData, currentUser, showAllLCs]);

  // Local search function (Podio and non-Podio): filter by logged-in user's LC unless showAllLCs, plus search/filters
  const handleLocalSearch = useCallback(() => {
    const searchTermLower = searchTerm.toLowerCase();
    const userOfficeId = getOfficeId(currentUser);
    const userLCName = getUserLCName(currentUser);
    const filteredCompanies = allCompanies.filter(company => {
      // When "Show all LCs" is on, skip LC filter
      if (!showAllLCs) {
        const companyLcId = company.submittedByLcId != null ? company.submittedByLcId : (() => {
          const raw = displayText(company.submittedByLc, '').trim();
          if (/^\d+$/.test(raw)) return parseInt(raw, 10);
          return getLCIdByName(raw);
        })();
        if (userOfficeId != null) {
          if (companyLcId != null && companyLcId === userOfficeId) {
            // Match by LC id
          } else if (companyLcId != null) {
            return false;
          } else {
            const companyLcRaw = displayText(company.submittedByLc, '').trim();
            const companyLcForMatch = companyLcRaw.toLowerCase();
            const matchName = userLCName ? userLCName.trim().toLowerCase() : '';
            if (!matchName || !companyLcForMatch) return false;
            const allowedNames = matchName === 'alexandria' ? ['alexandria', 'alex'] : [matchName];
            if (!allowedNames.includes(companyLcForMatch)) return false;
          }
        } else if (userLCName) {
          const companyLcRaw = displayText(company.submittedByLc, '').trim();
          const companyLcForMatch = companyLcRaw.toLowerCase();
          const matchName = userLCName.trim().toLowerCase();
          if (!companyLcForMatch) return false;
          const allowedNames = matchName === 'alexandria' ? ['alexandria', 'alex'] : [matchName];
          if (!allowedNames.includes(companyLcForMatch)) return false;
        } else if (company.created_by_lc != null && company.created_by_lc !== '' && userOfficeId != null && company.created_by_lc !== userOfficeId) {
          return false;
        }
      }

      // Search term filter (use displayText so object/JSON values are searchable)
      const industryStr = displayText(company.industry, '');
      const submittedByLcStr = displayText(company.submittedByLc, '');
      const accountTypeStr = displayText(company.accountType, '') || displayText(company.type, '');
      const matchesSearch = searchTerm === '' || 
        company.name?.toLowerCase().includes(searchTermLower) ||
        company.companyName?.toLowerCase().includes(searchTermLower) ||
        industryStr?.toLowerCase().includes(searchTermLower) ||
        submittedByLcStr?.toLowerCase().includes(searchTermLower) ||
        accountTypeStr?.toLowerCase().includes(searchTermLower) ||
        company.personName?.toLowerCase().includes(searchTermLower) ||
        company.contact_person?.toLowerCase().includes(searchTermLower) ||
        company.address?.toLowerCase().includes(searchTermLower) ||
        company.location?.toLowerCase().includes(searchTermLower);

      // Industry filter
      const matchesIndustry = selectedIndustry === '' || industryStr === selectedIndustry;

      // Company size filter
      const matchesSize = selectedSize === '' || displayText(company.size, '') === selectedSize;

      // Account type filter
      const matchesAccountType = selectedAccountType === '' || 
        accountTypeStr === selectedAccountType;

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
  }, [searchTerm, selectedIndustry, selectedSize, selectedAccountType, selectedStatus, allCompanies, currentUser, showAllLCs]);
  // When Podio data loads, apply same LC + filters via handleLocalSearch
  useEffect(() => {
    if (usePodioData && allCompanies.length > 0) {
      handleLocalSearch();
    }
  }, [usePodioData, allCompanies, handleLocalSearch]);

  // Load companies on mount. In "my LC" mode wait for user context so we send lc_id (fix: avoid fetch without lc_id then filter to 0).
  const initialLoadDone = useRef(false);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const podioError = urlParams.get('podio_error');
    if (podioError) {
      window.history.replaceState({}, '', window.location.pathname);
      setUsePodioData(false);
    }
    initialLoadDone.current = false;
  }, [usePodioData]);
  useEffect(() => {
    const officeId = getOfficeId(currentUser);
    if (initialLoadDone.current) return;
    if (!usePodioData) {
      initialLoadDone.current = true;
      fetchCompanies();
      return;
    }
    if (!showAllLCs && officeId == null) return;
    initialLoadDone.current = true;
    fetchCompanies();
    Promise.race([
      podioAPI.getStatus().catch(() => ({ authenticated: false })),
      new Promise((resolve) => setTimeout(() => resolve({ authenticated: false }), 8000)),
    ]).then((status) => {
      if (status?.authenticated || status?.authorized) return;
      if (!usePodioData) return;
      podioAPI.getAuthUrl().then(({ authUrl }) => { if (authUrl) window.location.href = authUrl; }).catch(() => {});
    });
  }, [usePodioData, currentUser, showAllLCs]);
  useEffect(() => {
    const officeId = getOfficeId(currentUser);
    if (initialLoadDone.current || !usePodioData || showAllLCs) return;
    if (officeId == null) return;
    initialLoadDone.current = true;
    fetchCompanies();
  }, [currentUser]);
  

  // Keep table in sync with loaded Podio data (we do not filter Podio data in the debounced effect)

  // Debounced search effect - applies local filtering (including LC filter) for both Podio and non-Podio data
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleLocalSearch();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedIndustry, selectedSize, selectedAccountType, selectedStatus, usePodioData, handleLocalSearch]);

  const handleSaveCompany = async () => {
    if (!selectedCompany?.id) {
      handleCloseDialog();
      return;
    }
    const now = new Date().toISOString();
    const officeId = getOfficeId(currentUser);

    try {
      const response = await marketResearchAPI.updateCompany(selectedCompany.id, {
        ...newCompany,
        updated_at: now,
        created_by_lc: officeId,
      });

      setAllCompanies((prev) =>
        prev.map((comp) => (comp.id === selectedCompany.id ? response.data : comp))
      );
      setCompanies((prev) =>
        prev.map((comp) => (comp.id === selectedCompany.id ? response.data : comp))
      );

      handleCloseDialog();
    } catch (err) {
      console.error('Error saving company:', err);
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
    const mergeStoredFollowups = (data) => {
      if (!data || !data.id) return data;
      try {
        const stored = localStorage.getItem(`company_followups_${data.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return { ...data, followups: parsed };
          }
        }
      } catch (e) {}
      return data;
    };

    const mergeStoredProfile = (data) => {
      if (!data || !data.id) return data;
      try {
        const stored = localStorage.getItem(`company_profile_${data.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            return { ...data, ...parsed };
          }
        }
      } catch (e) {}
      return data;
    };

    try {
      const response = await marketResearchAPI.getCompany(company.id);
      const fullCompanyData = response[0];
      let merged = mergeStoredFollowups(fullCompanyData || company);
      merged = mergeStoredProfile(merged);
      setSelectedCompany(merged);
      setSelectedCompanyData(merged);
      setOpenProfileDialog(true);
    } catch (err) {
      console.error("Error fetching company data:", err);
      let merged = mergeStoredFollowups(company);
      merged = mergeStoredProfile(merged);
      setSelectedCompany(merged);
      setSelectedCompanyData(merged);
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
        if (value === 'Completed' && (selectedCompany.currentStep == null || selectedCompany.currentStep < 3)) {
          updatedFields.currentStep = 3;
          statusUpdateNote = `Status updated to ${companySteps[3].label} via profile interaction.`;
        }
        break;

      case 'visitCompleted':
        if (value === 'Yes') {
          updatedFields.visitStatus = 'Completed';
          updatedFields.visit = 'Completed';
          if (selectedCompany.currentStep == null || selectedCompany.currentStep < 3) {
            updatedFields.currentStep = 3;
            statusUpdateNote = `Status updated to ${companySteps[3].label} via profile interaction.`;
          }
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
  
    setSelectedCompany(updatedCompany);
    console.log("Updated selectedCompany with:", updatedCompany);

    // Persist interaction status and funnel so they survive refresh (e.g. for Podio-sourced companies)
    try {
      const profileSlice = {
        podio: updatedCompany.podio,
        contacted: updatedCompany.contacted,
        interested: updatedCompany.interested,
        visitStatus: updatedCompany.visitStatus,
        visit: updatedCompany.visit,
        currentStep: updatedCompany.currentStep,
        statusHistory: updatedCompany.statusHistory,
        visitOutcome: updatedCompany.visitOutcome,
        visitNumberOfSlots: updatedCompany.visitNumberOfSlots,
        visitOutcomeNotes: updatedCompany.visitOutcomeNotes
      };
      localStorage.setItem(`company_profile_${selectedCompany.id}`, JSON.stringify(profileSlice));
    } catch (e) {
      console.warn('Failed to persist company profile to localStorage', e);
    }

    try {
      const response = await marketResearchAPI.updateCompany(selectedCompany.id, updatedCompany);
      const result = response && (typeof response === 'object' && response.id !== undefined) ? response : updatedCompany;
      setAllCompanies(prev =>
        prev.map(comp => (comp.id === selectedCompany.id ? result : comp))
      );
    } catch (error) {
      console.error('Error updating company:', error);
      setAllCompanies(prev =>
        prev.map(comp => (comp.id === selectedCompany.id ? updatedCompany : comp))
      );
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
    const followUpID = Date.now();
    const newFollowup = {
      followUpID,
      id: followUpID, // Unique ID for the follow-up (used by Calendar and status updates)
      title: followup.title,
      text: followup.description,
      date: followup.date,
      timestamp: new Date().toISOString(),
      author: name,
      status: 'pending',
      entityPhone: selectedCompany.phone || '-',
      entityType: 'company',
      companyName: selectedCompany.name,
      companyId: selectedCompany.id,
      entityId: selectedCompany.id, // For Calendar event source
    };

    // Update company state
    const updatedCompany = {
      ...selectedCompany,
      followups: [...(selectedCompany.followups || []), newFollowup],
      lastUpdated: new Date().toISOString()
    };

    // Persist to localStorage so Calendar shows follow-ups by date and can sync to Google
    try {
      localStorage.setItem(
        `company_followups_${selectedCompany.id}`,
        JSON.stringify(updatedCompany.followups)
      );
    } catch (e) {
      console.warn('Failed to persist follow-ups to localStorage', e);
    }

    const updatedCompanies = allCompanies.map(company =>
      company.id === selectedCompany.id ? updatedCompany : company
    );
    setAllCompanies(updatedCompanies);
    setSelectedCompany(updatedCompany);
    try {
      const response = await marketResearchAPI.updateCompany(selectedCompany.id, updatedCompany);
      setAllCompanies(prev =>
        prev.map(comp => (comp.id === selectedCompany.id ? response.data : comp))
      );
    } catch (error) {
      console.error('Error updating company:', error);
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
        try {
          localStorage.setItem(`company_followups_${companyId}`, JSON.stringify(updatedCompany.followups));
        } catch (e) {}
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

    const updatedCompanies = allCompanies.map(company =>
      company.id === selectedCompany.id ? updatedCompany : company
    );
    setAllCompanies(updatedCompanies);
    setSelectedCompany(updatedCompany);
    try {
      localStorage.setItem(`company_followups_${selectedCompany.id}`, JSON.stringify(updatedCompany.followups));
    } catch (e) {}

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
    const updatedCompany = {
      ...selectedCompany,
      currentStep: newStep,
      lastUpdated: now
    };

    setSelectedCompany(updatedCompany);
    setAllCompanies(prev =>
      prev.map(comp => (comp.id === companyId ? updatedCompany : comp))
    );

    // Persist funnel step so it survives refresh (e.g. for Podio-sourced companies)
    try {
      const existing = localStorage.getItem(`company_profile_${companyId}`);
      const profile = existing ? { ...JSON.parse(existing), currentStep: newStep } : { currentStep: newStep };
      localStorage.setItem(`company_profile_${companyId}`, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to persist funnel step to localStorage', e);
    }

    try {
      const response = await marketResearchAPI.updateCompany(companyId, {
        currentStep: newStep,
        updated_at: now
      });
      const result = response && (typeof response === 'object' && response.id !== undefined) ? response : updatedCompany;
      setSelectedCompany(result);
      setAllCompanies(prev =>
        prev.map(comp => (comp.id === companyId ? result : comp))
      );
    } catch (err) {
      console.error("Failed to update company step:", err);
    }
  };

  const handleMarkOpportunityRaised = async (slots = '', notes = '') => {
    if (!selectedCompany) return;
    const now = new Date().toISOString();
    const updatedCompany = {
      ...selectedCompany,
      visitOutcome: 'Positive - Opportunity Raised',
      visitNumberOfSlots: slots || selectedCompany.visitNumberOfSlots || '',
      visitOutcomeNotes: notes || selectedCompany.visitOutcomeNotes || '',
      currentStep: 4,
      lastUpdated: now,
      statusHistory: [
        ...(selectedCompany.statusHistory || []),
        { step: 4, date: now, note: 'Opportunity raised – end of funnel!' }
      ]
    };
    setSelectedCompany(updatedCompany);
    setSelectedCompanyData(updatedCompany);
    setAllCompanies(prev =>
      prev.map(c => (c.id === selectedCompany.id ? updatedCompany : c))
    );
    setCompanies(prev =>
      prev.map(c => (c.id === selectedCompany.id ? updatedCompany : c))
    );
    try {
      const profile = {
        ...(JSON.parse(localStorage.getItem(`company_profile_${selectedCompany.id}`) || '{}')),
        visitOutcome: updatedCompany.visitOutcome,
        visitNumberOfSlots: updatedCompany.visitNumberOfSlots,
        visitOutcomeNotes: updatedCompany.visitOutcomeNotes,
        currentStep: 4,
        statusHistory: updatedCompany.statusHistory
      };
      localStorage.setItem(`company_profile_${selectedCompany.id}`, JSON.stringify(profile));
    } catch (e) {}
    try {
      const response = await marketResearchAPI.updateCompany(selectedCompany.id, updatedCompany);
      const result = response && (typeof response === 'object' && response.id !== undefined) ? response : updatedCompany;
      setSelectedCompany(result);
      setAllCompanies(prev => prev.map(c => (c.id === selectedCompany.id ? result : c)));
      setCompanies(prev => prev.map(c => (c.id === selectedCompany.id ? result : c)));
    } catch (err) {
      console.error('Error updating company:', err);
    }
    showSuccess('Congratulations! Opportunity raised – end of funnel! 🎉');
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
                  {[displayText(company.submittedByLc, ''), displayText(company.industry, ''), displayText(company.size, 'No Size')].filter(Boolean).join(' • ') || '—'}
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
                      (index === 2 && !!scheduledVisitDate) || // Visit Scheduled completed when user has set a visit date
                      (index === 3 && (company.visitStatus === 'Completed' || company.visit === 'Completed')) || // Visit Completed when marked in Interaction Status
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

            {/* Schedule visit – mini calendar date picker (Podio only); appears in Calendar page and syncs to Google */}
            {usePodioData && company?.id != null && (
              <Card elevation={0} sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <EventAvailableIcon /> Schedule visit
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Pick a date from the calendar below. The visit will appear on the Calendar page and sync to Google Calendar when connected.
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Visit date & time"
                    value={scheduledVisitDate}
                    onChange={async (date) => {
                      if (!date || company?.id == null) return;
                      setScheduledVisitDate(date);
                      const podioItemId = Number(company.id);
                      if (Number.isNaN(podioItemId)) return;
                      try {
                        await marketResearchAPI.createOrUpdatePodioScheduledVisit({
                          podio_item_id: podioItemId,
                          company_name: company.name || company.companyName || 'Company',
                          visit_date: date.toISOString(),
                        });
                        showSuccess('Visit date and time saved. It will appear on the Calendar page and sync to Google Calendar when connected.');
                        const newStep = Math.max(company.currentStep || 0, 2);
                        const updated = { ...company, currentStep: newStep };
                        setSelectedCompany(updated);
                        setSelectedCompanyData(updated);
                        setAllCompanies(prev => prev.map(c => c.id === company.id ? { ...c, currentStep: newStep } : c));
                        setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, currentStep: newStep } : c));
                        try {
                          const existing = localStorage.getItem(`company_profile_${company.id}`);
                          const profile = existing ? { ...JSON.parse(existing), currentStep: newStep } : { currentStep: newStep };
                          localStorage.setItem(`company_profile_${company.id}`, JSON.stringify(profile));
                        } catch (e) {}
                      } catch (e) {
                        showError('Failed to save visit date.');
                      }
                    }}
                    ampm
                    minutesStep={5}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start" sx={{ mr: 0 }}>
                              <CalendarTodayIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      },
                      openPickerButton: { size: 'small' },
                    }}
                  />
                </LocalizationProvider>
              </Card>
            )}

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
                          {displayText(company?.industry, '')}
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
                            Submitted by LC
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              transform: 'skew(-2deg)'
                            }}
                          >
                          {displayText(company?.submittedByLc, '')}
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
                          {displayText(company?.size, 'Not specified')}
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
                          {displayText(company?.type, 'Not specified')}
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
                          {displayText(company?.address, 'Not specified')}
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
                              <MenuItem value="Completed">Completed</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      )}

                      {/* Visit completed? – show after a visit is scheduled (date picker or Visit? = Scheduled) */}
                      {(scheduledVisitDate || company?.visitStatus === 'Scheduled' || company?.visit === 'Scheduled') && (
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel id="profile-visit-completed-label">Visit completed?</InputLabel>
                            <Select
                              labelId="profile-visit-completed-label"
                              label="Visit completed?"
                              name="visitCompleted"
                              value={company?.visitStatus === 'Completed' || company?.visit === 'Completed' ? 'Yes' : 'No'}
                              onChange={handleProfileInputChange('visitCompleted')}
                              MenuProps={{
                                PaperProps: {
                                  sx: {
                                    maxHeight: 300,
                                    minWidth: '270px !important',
                                    '& .MuiMenuItem-root': { padding: '10px 16px', fontSize: '0.95rem' },
                                  },
                                },
                              }}
                              sx={{
                                minWidth: '270px',
                                '& .MuiSelect-select': { padding: '10px 16px', fontSize: '0.95rem' },
                                transform: 'skew(-2deg)',
                                '& .MuiSelect-select': { transform: 'skew(2deg)' },
                              }}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
              </Box>
                 </Card>

            {/* Opportunity Raised – special celebratory card when at Visit Completed (step 3) */}
            {company.currentStep === 3 && (
              <Card
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.12) 0%, rgba(56, 142, 60, 0.06) 50%, rgba(46, 125, 50, 0.08) 100%)',
                  border: '2px solid',
                  borderColor: 'success.main',
                  boxShadow: '0 8px 32px rgba(46, 125, 50, 0.2)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 80%, rgba(46, 125, 50, 0.08) 0%, transparent 50%)',
                    pointerEvents: 'none'
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Typography variant="h5" sx={{ color: 'success.dark', fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🎉 Opportunity Raised – Last step of the funnel
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Mark this company as opportunity raised to complete the funnel and celebrate the win.
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Number of slots (optional)"
                        value={opportunityRaisedSlots}
                        onChange={(e) => setOpportunityRaisedSlots(e.target.value)}
                        placeholder={company.visitNumberOfSlots || ''}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        label="Outcome notes (optional)"
                        value={opportunityRaisedNotes}
                        onChange={(e) => setOpportunityRaisedNotes(e.target.value)}
                        placeholder={company.visitOutcomeNotes || ''}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                      />
                    </Grid>
                  </Grid>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => {
                      handleMarkOpportunityRaised(opportunityRaisedSlots, opportunityRaisedNotes);
                    }}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      bgcolor: 'success.main',
                      color: 'white',
                      boxShadow: '0 4px 14px rgba(46, 125, 50, 0.4)',
                      '&:hover': {
                        bgcolor: 'success.dark',
                        boxShadow: '0 6px 20px rgba(46, 125, 50, 0.5)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                    startIcon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
                  >
                    Mark as Opportunity Raised 🎉
                  </Button>
                </Box>
              </Card>
            )}

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
          <Tooltip title={!members || members.length === 0 ? 'No team members available' : 'Assign company to a team member'}>
            <span>
              <Button
                startIcon={<AssignmentIcon />}
                disabled={!members || members.length === 0}
                onClick={() => {
                  if (members && members.length > 0) handleAssignClick(company);
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
                Assign
              </Button>
            </span>
          </Tooltip>
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

  const handleAssign = async () => {
    if (!selectedCompany || !selectedMember) return;
    const memberName = members.find((m) => m.id === selectedMember)?.person || 'member';
    try {
      const itemId = Number(selectedCompany.id) || selectedCompany.podioItemId || selectedCompany.id;
      await marketResearchAPI.assignCompany(itemId, String(selectedMember));
      setStoredAssignment(selectedCompany.id, selectedMember, memberName);
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === selectedCompany.id
            ? { ...c, assigned_to: selectedMember, assignedTo: memberName }
            : c
        )
      );
      setAllCompanies((prev) =>
        prev.map((c) =>
          c.id === selectedCompany.id
            ? { ...c, assigned_to: selectedMember, assignedTo: memberName }
            : c
        )
      );
      showSuccess(`Company assigned to ${memberName}`);
      handleAssignClose();
    } catch (error) {
      console.error('Error assigning company:', error);
      showError(error?.response?.data?.detail || error?.message || 'Failed to assign company');
    }
  };

 

  const handleBulkAssignClick = () => {
    setBulkAssignDialogOpen(true);
  };

  const handleBulkAssignClose = () => {
    setBulkAssignDialogOpen(false);
    setSelectedMember('');
    setSelectedCompanies([]);
  };

  const handleBulkAssign = async () => {
    if (!selectedMember || selectedCompanies.length === 0) return;
    const memberName = members.find((m) => m.id === selectedMember)?.person || 'member';
    try {
      await Promise.all(
        selectedCompanies.map((companyId) =>
          marketResearchAPI.assignCompany(companyId, selectedMember)
        )
      );
      selectedCompanies.forEach((companyId) =>
        setStoredAssignment(companyId, selectedMember, memberName)
      );
      setCompanies((prevCompanies) =>
        prevCompanies.map((c) =>
          selectedCompanies.includes(c.id)
            ? { ...c, assigned_to: selectedMember, assignedTo: memberName }
            : c
        )
      );
      setAllCompanies((prev) =>
        prev.map((c) =>
          selectedCompanies.includes(c.id)
            ? { ...c, assigned_to: selectedMember, assignedTo: memberName }
            : c
        )
      );
      setSelectedCompanies([]);
      handleBulkAssignClose();
      showSuccess(`Assigned ${selectedCompanies.length} companies to ${memberName}`);
    } catch (error) {
      console.error('Error assigning companies:', error);
      showError(error?.response?.data?.detail || error?.message || 'Failed to assign companies');
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

      {/* Embedded Podio form section - uses backend proxy to bypass X-Frame-Options */}
      {usePodioData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Submit via Podio Form
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Open the Podio form to submit new market research entries. After submitting, set the form&apos;s redirect URL in Podio to this page so you return here automatically.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={async () => {
                try {
                  const url = await marketResearchAPI.getPodioFormUrl();
                  if (url) window.location.href = url;
                  else showWarning('Could not get Podio form URL.');
                } catch (e) {
                  showWarning('Could not open Podio form. Ensure the backend is running.');
                }
              }}
            >
              Open Podio form
            </Button>
          </CardContent>
        </Card>
      )}

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
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">Companies List</Typography>
              {showAllLCs && usePodioData && (
                <Chip
                  label="Showing all LCs"
                  size="small"
                  onDelete={() => { setShowAllLCs(false); fetchCompanies({ showAllLCs: false }); }}
                  color="info"
                  variant="outlined"
                />
              )}
              {usePodioData && !showAllLCs && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => { setShowAllLCs(true); fetchCompanies({ showAllLCs: true }); }}
                  disabled={loading}
                  title="Show companies from all LCs"
                >
                  View all LCs
                </Button>
              )}
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
          <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <Table sx={{ minWidth: { xs: 800, md: 1000 }, whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell 
                    padding="checkbox"
                    sx={{ 
                      position: 'sticky', 
                      left: 0, 
                      bgcolor: '#F4F6F9', 
                      zIndex: 3,
                      borderRight: '1px solid rgba(224, 224, 224, 0.12)'
                    }}
                  >
                    <Checkbox
                      indeterminate={selectedCompanies.length > 0 && selectedCompanies.length < companies.length}
                      checked={companies.length > 0 && selectedCompanies.length === companies.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell
                    sx={{ 
                      position: 'sticky', 
                      left: 48, 
                      bgcolor: '#F4F6F9', 
                      zIndex: 3,
                      fontWeight: 700,
                      borderRight: '1px solid rgba(224, 224, 224, 0.12)'
                    }}
                  >
                    Company Name
                  </TableCell>
                  <TableCell>Industry</TableCell>
                  <TableCell>Submitted by LC</TableCell>
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
                    <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
                      <EmptyState
                        title="No Companies Found"
                        description={allCompanies.length > 0 && (getUserLCName(currentUser) || getOfficeId(currentUser))
                          ? `Showing only companies from your LC (${getUserLCName(currentUser) || `ID ${getOfficeId(currentUser)}`}). None of the ${allCompanies.length} loaded match.`
                          : "Start by adding a new company or adjust your search criteria."}
                        actionLabel={usePodioData && getOfficeId(currentUser) != null && !showAllLCs ? "Show all LCs" : undefined}
                        onAction={() => { setShowAllLCs(true); fetchCompanies({ showAllLCs: true }); }}
                      />
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
                        bgcolor: (company.currentStep === 4 || company.visitOutcome === 'Positive - Opportunity Raised')
                          ? 'rgba(46, 125, 50, 0.12)'
                          : 'inherit',
                        '&:hover': {
                          bgcolor: (company.currentStep === 4 || company.visitOutcome === 'Positive - Opportunity Raised')
                            ? 'rgba(46, 125, 50, 0.2)'
                            : theme.palette.action.hover
                        }
                      }}
                    >
                      <TableCell 
                        padding="checkbox" 
                        onClick={(e) => e.stopPropagation()}
                        sx={{ 
                          position: 'sticky', 
                          left: 0, 
                          bgcolor: selectedCompanies.includes(company.id) ? 'action.selected' : 'background.paper', 
                          zIndex: 1,
                          borderRight: '1px solid rgba(224, 224, 224, 0.12)'
                        }}
                      >
                        <Checkbox
                          checked={selectedCompanies.includes(company.id)}
                          onChange={() => handleSelectCompany(company.id)}
                        />
                      </TableCell>
                      <TableCell
                        sx={{ 
                          position: 'sticky', 
                          left: 48, 
                          bgcolor: selectedCompanies.includes(company.id) ? 'action.selected' : 'background.paper', 
                          zIndex: 1,
                          borderRight: '1px solid rgba(224, 224, 224, 0.12)',
                          fontWeight: 600
                        }}
                      >
                        <Typography
                          variant="body2"
                          title={company.name}
                          sx={{
                            fontWeight: 600,
                            maxWidth: { xs: '120px', sm: '220px' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {company.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{displayText(company.industry, '')}</TableCell>
                      <TableCell>{displayText(company.submittedByLc, '')}</TableCell>
                      <TableCell>{displayText(company.size)}</TableCell>
                      <TableCell>{displayText(company.accountType)}</TableCell>
                      <TableCell>{displayText(company.address)}</TableCell>
                      <TableCell>{displayText(company.personName)}</TableCell>
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
                        <Tooltip title={!members || members.length === 0 ? 'No team members available' : 'Assign company to a team member'}>
                          <span>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<AssignmentIcon />}
                              disabled={!members || members.length === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (members && members.length > 0) handleAssignClick(company);
                              }}
                              sx={{ ml: 0.5, minWidth: 'auto', px: 1 }}
                            >
                              Assign
                            </Button>
                          </span>
                        </Tooltip>
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
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={companies.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
            {usePodioData && lastFetchPageSize >= PODIO_PAGE_SIZE && !loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => fetchCompanies({}, { append: true, offset: allCompanies.length })}
                  startIcon={<RefreshIcon />}
                >
                  Load more companies
                </Button>
              </Box>
            )}
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Company</DialogTitle>
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
              Save Changes
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
  );
}
export default MarketResearchPage; 