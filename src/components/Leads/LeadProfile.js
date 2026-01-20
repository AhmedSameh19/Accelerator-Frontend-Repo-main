import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import leadsApi from '../../api/services/leadsApi';
import b2cAPI from '../../api/services/b2cAPI';
import { useAddLeadComment } from '../../pages/leads/hooks/useAddLeadComment';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  TextField,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Avatar,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  ButtonGroup,
  StepConnector,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { 
  Comment as CommentIcon, 
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Link as LinkIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Flag as FlagIcon,
  AssignmentInd as AssignmentIndIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { fetchOpportunityApplications } from '../../api/services/aiesecApi';
import { useCRMType } from '../../context/CRMTypeContext';
import { COUNTRY_OPTIONS, PROJECT_OPTIONS } from '../../constants/leadProfileOptions';

// AIESEC Status Steps with indices
const aiesecSteps = [
  { index: 1, label: 'Open' },
  { index: 2, label: 'Applied' },
  { index: 3, label: 'Accepted' },
  { index: 4, label: 'Approved' },
  { index: 5, label: 'Realized' },
  { index: 6, label: 'Finished' },
  { index: 7, label: 'Completed' }
];

// Status colors for different states
const getStepStyle = (stepIndex, currentStepIndex) => {
  if (stepIndex <= currentStepIndex) {
    return {
      '& .MuiStepLabel-label': {
        color: '#037ef3', // AIESEC Blue
        fontWeight: 'bold'
      },
      '& .MuiStepIcon-root': {
        color: '#037ef3'
      },
      '& .MuiStepIcon-text': {
        fill: 'white'
      },
      '& .MuiStepConnector-line': {
        borderColor: '#037ef3'
      }
    };
  }
  return {};
};

function LeadProfile({ lead, open, onClose, onStatusChange, navigationState }) {
  const { crmType } = useCRMType();
  const isB2C = crmType === 'B2C';
  
  // Check if we're coming from the EPs Back to Process page
  const isFromBackToProcess = navigationState?.from === 'eps-back-to-process';
  // Check if we're coming from the leads page
  const isFromLeadsPage = navigationState?.from === 'leads';

  // Support both legacy lead shape and new backend shape
  const leadId = lead?.expa_person_id ;
  const leadName = lead?.full_name ?? '';
  const leadStatus = lead?.expa_status ?? '';

  const { addComment: addLeadComment, loading: addingComment } = useAddLeadComment({ leadId });
  
  // Regular lead status states
  const [contactStatus, setContactStatus] = useState('');
  const [interested, setInterested] = useState('');
  const [processStatus, setProcessStatus] = useState('');
  const [reason, setReason] = useState('');

  const [statusHistory, setStatusHistory] = useState([]);
  
  // Back to process status states (separate from regular status)
  const [backToProcessContactStatus, setBackToProcessContactStatus] = useState('');
  const [backToProcessInterested, setBackToProcessInterested] = useState('');
  const [backToProcessStatus, setBackToProcessStatus] = useState('');
  const [backToProcessReason, setBackToProcessReason] = useState('');
  const [backToProcessHistory, setBackToProcessHistory] = useState([]);
  
  const [activeSection, setActiveSection] = useState('comments');
  const [activeTab, setActiveTab] = useState(0);
  const [followUpFilter, setFollowUpFilter] = useState('pending');
  
  // Other states remain the same
  const [newComment, setNewComment] = useState('');
  const [newFollowUp, setNewFollowUp] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [comments, setComments] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [opportunityApplications, setOpportunityApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const theme = useTheme();

  // State for which section to show: 'profile' or 'applications'
  const [section, setSection] = useState('profile');
  const opportunitySectionRef = useRef(null);


  const handleStepClick = (step) => {
    if (step === 'applied') {
      if (!leadId) return;
      window.open(`/lead-applications/${leadId}`, '_blank');
    } else {
      setSection('profile');
    }
  };

  
  // Add new state for customer interview comments
  const [customerInterviewComments, setCustomerInterviewComments] = useState([]);
  const [newCustomerInterviewComment, setNewCustomerInterviewComment] = useState('');

  // Add new state for tracking marked status
  const [isMarkedBackToProcess, setIsMarkedBackToProcess] = useState(false);
  const [showMarkedConfirmation, setShowMarkedConfirmation] = useState(false);

  // Add new state for back to process comment dialog
  const [showBackToProcessDialog, setShowBackToProcessDialog] = useState(false);
  const [backToProcessComment, setBackToProcessComment] = useState('');

  // Add state to track if back to process status has values
  const [hasBackToProcessStatus, setHasBackToProcessStatus] = useState(false);

  // Add new state variables for Customer Interviews Output tab
  const [customerInterviewContactStatus, setCustomerInterviewContactStatus] = useState('');
  const [customerInterviewInterested, setCustomerInterviewInterested] = useState('');
  const [customerInterviewProcessStatus, setCustomerInterviewProcessStatus] = useState('');
  const [customerInterviewReason, setCustomerInterviewReason] = useState('');



  // Add new handlers for Customer Interviews Output tab
  const handleCustomerInterviewContactStatusChange = (event) => {
    setCustomerInterviewContactStatus(event.target.value);
    if (event.target.value.toLowerCase() !== 'yes') {
      setCustomerInterviewInterested('');
      setCustomerInterviewProcessStatus('');
      setCustomerInterviewReason('');
    }
  };

  const handleCustomerInterviewInterestedChange = (event) => {
    setCustomerInterviewInterested(event.target.value);
    if ((event.target.value).toLowerCase() !== 'yes') {
      setCustomerInterviewProcessStatus('');
      setCustomerInterviewReason('');
    }
  };

  const handleCustomerInterviewProcessStatusChange = (event) => {
    setCustomerInterviewProcessStatus(event.target.value);
    if (event.target.value.toLowerCase() !== 'out of process') {
      setCustomerInterviewReason('');
    }
  };

  const handleCustomerInterviewReasonChange = (event) => {
    setCustomerInterviewReason(event.target.value);
  };





  // Load status history when lead changes
  useEffect(() => {
    // Reset all status values when lead changes or when opening a new lead
    setContactStatus('');
    setInterested('');
    setProcessStatus('');
    setReason('');
    setStatusHistory([]);
    setBackToProcessContactStatus('');
    setBackToProcessInterested('');
    setBackToProcessStatus('');
    setBackToProcessReason('');
    setBackToProcessHistory([]);
    setComments([]);
    setCustomerInterviewComments([]);
    setFollowUps([]);
    setNewComment('');
    setNewCustomerInterviewComment('');
    setNewFollowUp('');
    setFollowUpDate('');
    
    if (leadId) {
      const storageKey = `lead_status_history_${leadId}`;
      const backToProcessStorageKey = `lead_back_to_process_status_history_${leadId}`;
      const storageKeyComments = `lead_comments_${leadId}`;
      const storageKeyCustomerInterviewComments = `lead_customer_interview_comments_${leadId}`;
      const storageKeyFollowUps = `lead_followups_${leadId}`;
      const storageKeyMarkedBackToProcess = `lead_marked_back_to_process_${leadId}`;
      
      // Load marked back to process status
      const storedMarkedStatus = localStorage.getItem(storageKeyMarkedBackToProcess);
      if (storedMarkedStatus) {
        setIsMarkedBackToProcess(JSON.parse(storedMarkedStatus));
      }
      
      // Load regular status history
      const storedHistory = localStorage.getItem(storageKey);
      if (storedHistory) {
        const history = JSON.parse(storedHistory);
        setStatusHistory(history);
        
        // Set current values from the most recent entry
        if (history.length > 0) {
          const currentStatus = history[history.length - 1];
          setContactStatus(currentStatus.contactStatus || '');
          setInterested(currentStatus.interested || '');
          setProcessStatus(currentStatus.processStatus || '');
          setReason(currentStatus.reason || '');
        }
      }

      // Load back to process status history
      const storedBackToProcessHistory = localStorage.getItem(backToProcessStorageKey);
      if (storedBackToProcessHistory) {
        const history = JSON.parse(storedBackToProcessHistory);
        setBackToProcessHistory(history);
        
        // Set current values from the most recent entry
        if (history.length > 0) {
          const currentStatus = history[history.length - 1];
          setBackToProcessContactStatus(currentStatus.contactStatus || '');
          setBackToProcessInterested(currentStatus.interested || '');
          setBackToProcessStatus(currentStatus.processStatus || '');
          setBackToProcessReason(currentStatus.reason || '');
          setHasBackToProcessStatus(true);
        }
      }

      // Load comments specific to this EP
      const fetchComments = async () => {
        if (!leadId) return;
  
        try {
          const response = await leadsApi.getComments(leadId); // returns an array (normalized)
          setComments(response || []);
          console.log('Fetched comments:', response);
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
      };
  
      fetchComments();

      const fetchCustomerInterviewsComments= async ()=>{
        if (!leadId) return;
  
        try {
          const response = await b2cAPI.getComments(leadId); // call your GET /ep/:epId/comments
          setCustomerInterviewComments(response.comments|| []); // set state with comments array
          console.log('Fetched comments:aloooo', response.comments);
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
      }
      fetchCustomerInterviewsComments();

      const fetchContactStatus = async () => {
        try {
          const data = await leadsApi.getContactStatus(leadId);  // Call your existing API function
          console.log('Contact status fetched successfully:', data);
          if (data) {
            const statusData = data;
      
            // Set all relevant fields from the backend
            setContactStatus(statusData.contact_status || '');
            setInterested(statusData.interested || '');
            setProcessStatus(statusData.process_status || '');
            setReason(statusData.reason || '');
            setProject(statusData.project || '');
            setCountry(statusData.country || '');
          } else {
            // No data returned, initialize all fields to empty string
            setContactStatus('');
            setInterested('');
            setProcessStatus('');
            setReason('');
            setProject('');
            setCountry('');
          }
        } catch (error) {
          console.error('Error fetching contact status:', error);
          // Optional: show an error fallback
          setContactStatus('Error fetching status');
          setInterested('');
          setProcessStatus('');
          setReason('');
          setProject('');
          setCountry('');
        }
      };
      
      // Call it once on mount
      fetchContactStatus();
      


      // Load customer interview status
      const customerInterviewStorageKey = `lead_customer_interview_status_${leadId}`;
      const storedCustomerInterviewStatus = localStorage.getItem(customerInterviewStorageKey);
      if (storedCustomerInterviewStatus) {
        const status = JSON.parse(storedCustomerInterviewStatus);
        setCustomerInterviewContactStatus(status.contactStatus || '');
        setCustomerInterviewInterested(status.interested || '');
        setCustomerInterviewProcessStatus(status.processStatus || '');
        setCustomerInterviewReason(status.reason || '');
      }


    }
  }, [leadId]);

  // Load opportunity applications when lead changes
  useEffect(() => {
    const loadOpportunityApplications = async () => {
      if (leadId) {
        setLoadingApplications(true);
        try {
          const applications = await fetchOpportunityApplications(leadId, "2020-01-01");
          setOpportunityApplications(applications);
        } catch (error) {
          console.error('Error loading opportunity applications:', error);
        } finally {
          setLoadingApplications(false);
        }
      }
    };

    loadOpportunityApplications();
  }, [leadId]);

  // Separate effect for updating opportunity data
  useEffect(() => {
    if (opportunityApplications.length > 0) {
      const latestApp = opportunityApplications[0];
      const opportunity = latestApp.opportunity;

      const updatedLead = {
        ...lead,
        he_mc: opportunity?.host_mc?.name || lead?.he_mc || '-',
        he_lc: opportunity?.host_lc?.name || lead?.he_lc || '-',
        opp_link: opportunity?.id ? `https://aiesec.org/opportunity/${opportunity.id}` : lead?.opp_link || '-',
        product: opportunity?.programme?.short_name_display || lead?.product || '-'
      };

      if (onStatusChange) {
        onStatusChange(updatedLead);
      }
    }
  }, [opportunityApplications, lead, onStatusChange]);

  // Add handlers for status changes
  const handleContactStatusChange = (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setContactStatus(value);
  
    // Reset dependent fields if necessary
    if (value.toLowerCase() !== 'yes') {
      setInterested('');
      setProcessStatus('');
      setReason('');
      setProject('');
      setCountry('');
    }
  
    // Send all relevant fields to backend
    leadsApi.updateLeadStatus(leadId, {
      contact_status: value,
    });
  
    console.log('Updating contact status for lead in frontend:', leadId, 'to:', value);
  };
  
  const handleInterestedChange = (event) => {
    if (!leadId) return;
    const value = event.target.value;
    console.log('Updating interested field for lead in frontend:', leadId, 'to:', value);
    setInterested(value);
  
    // Reset dependent fields if necessary
    if (value.toLowerCase() !== 'yes') {
      setProcessStatus('');
      setReason('');
      setProject('');
      setCountry('');
    }
  
    leadsApi.updateLeadStatus(leadId, {
      interested: value,      
    });
  };
  
  const handleProcessStatusChange = (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setProcessStatus(value);
  
    // Reset dependent fields if necessary
    if (value.toLowerCase() !== 'in process' && value.toLowerCase() !== 'out of process') {
      setReason('');
      setProject('');
      setCountry('');
    } else if (value.toLowerCase() === 'in process') {
      setReason(''); // only project + country matter
    } else if (value.toLowerCase() === 'out of process') {
      setProject('');
      setCountry('');
    }
  
    leadsApi.updateLeadStatus(leadId, {
      
      process_status: value,
     
    });
  };
  
  const handleReasonChange = (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setReason(value);
  
    leadsApi.updateLeadStatus(leadId, {
     
      reason: value,
      
    });
  };
  
  const handleProjectChange = (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setProject(value);
  
    leadsApi.updateLeadStatus(leadId, {
   
      project: value,
     
    });
  };
  
  const handleCountryChange = (event, newValue) => {
    if (!leadId) return;
    const value = newValue || ''; // newValue is the selected country string
    setCountry(value);
  
    // Send all dependent fields to backend
    leadsApi.updateLeadStatus(leadId, {
      
      country: value,
      
    });
  
    console.log('Country updated to:', value);
  };
  
  

  const handleAddComment = async () => {
    if (!leadId || !newComment.trim()) return;

    const text = newComment.trim();
    await addLeadComment(text);
    setNewComment('');

    try {
      const fresh = await leadsApi.getComments(leadId);
      setComments(Array.isArray(fresh) ? fresh : []);
    } catch (e) {
      // keep existing comments if refresh fails
    }


  };
  


  // Get current AIESEC status step
  const getCurrentStep = () => {
    const currentStatus = leadStatus?.toLowerCase() || 'open';
    return aiesecSteps.findIndex(step => step.label.toLowerCase() === currentStatus);
  };

  // Check if step should be colored
  const isStepActive = (stepIndex) => {
    const currentStep = getCurrentStep();
    return stepIndex <= currentStep;
  };

  // Info Item Component
  const InfoItem = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 2 } }}>
      {icon}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          {value || '-'}
        </Typography>
      </Box>
    </Box>
  );

  // Add status options
  const contactStatusOptions = ['Yes', 'No', 'No Answer', 'Busy', 'Out of Service'];
  const interestedOptions = ['Yes', 'No'];
  const processStatusOptions = ['In Process', 'Out of Process'];
  const reasonOptions = [
    'Military Service',
    'Health Issues',
    'Financial Issues',
    'Summer Course',
    'Bad Lead',
    'Not Interested',
    "Parent's Issue",
    'Backed Out',
    'Other Plans',
    'Currently Working',
    'Wants to Join AIESEC'
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Add handler for customer interview comments
  const handleAddCustomerInterviewComment = async () => {

      if (!leadId || !newCustomerInterviewComment.trim()) return;

    try {
      // Call backend to add comment
      const response = await b2cAPI.addComment(leadId, newCustomerInterviewComment.trim());
      
      // response.data should contain the updated comments array
      const updatedComments = response.data.comments || [];
  
      // Update state
      setCustomerInterviewComments(updatedComments);
  
      // Clear input
      setNewCustomerInterviewComment('');
  
 
  
      console.log('Comment added successfully:', customerInterviewComments.trim());
  
    } catch (error) {
      console.error('Error adding comment:', error);
      // Optionally show an error toast or alert
    }
  };

  
  // Modify handler for marking EP back to process
  const handleMarkBackToProcess = () => {
    setShowBackToProcessDialog(true);
  };

  const handleConfirmBackToProcess = async() => {
    if (!backToProcessComment.trim()) return;

    setIsMarkedBackToProcess(true);
    setShowMarkedConfirmation(true);
    
    // Save to localStorage
    if (leadId) {
  
      const epData = {
     
      comments: [
        {
          text: backToProcessComment,
          created_at: new Date().toISOString(),
        },
        ...customerInterviewComments
      ],
      ...lead,
      }
      const response = await b2cAPI.addBackToProcess(epData);
      console.log('Response from marking back to process:', response.data);
    }
    
    // Reset and close dialog
    setBackToProcessComment('');
    setShowBackToProcessDialog(false);
    
    // Hide the confirmation after 3 seconds
    setTimeout(() => {
      setShowMarkedConfirmation(false);
    }, 3000);
  };

  // Add handlers for back to process status changes
  const handleBackToProcessContactStatusChange = (event) => {
    const newValue = event.target.value;
    setBackToProcessContactStatus(newValue);
    
    // Save to localStorage
    if (leadId) {
      const statusEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        contactStatus: newValue,
        interested: newValue === 'yes' ? backToProcessInterested : '',
        processStatus: newValue === 'yes' && backToProcessInterested === 'yes' ? backToProcessStatus : '',
        reason: newValue === 'yes' && backToProcessInterested === 'yes' && backToProcessStatus === 'out of process' ? backToProcessReason : '',
        author: 'Current User'
      };

      const storageKey = `lead_back_to_process_status_history_${leadId}`;
      const existingHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedHistory = [...existingHistory, statusEntry];
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      setBackToProcessHistory(updatedHistory);
      setHasBackToProcessStatus(true);
    }

    if (newValue !== 'yes') {
      setBackToProcessInterested('');
      setBackToProcessStatus('');
      setBackToProcessReason('');
    }
  };

  const handleBackToProcessInterestedChange = (event) => {
    const newValue = event.target.value;
    setBackToProcessInterested(newValue);
    
    // Save to localStorage
    if (leadId) {
      const statusEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        contactStatus: backToProcessContactStatus,
        interested: newValue,
        processStatus: newValue === 'yes' ? backToProcessStatus : '',
        reason: newValue === 'yes' && backToProcessStatus === 'out of process' ? backToProcessReason : '',
        author: 'Current User'
      };

      const storageKey = `lead_back_to_process_status_history_${leadId}`;
      const existingHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedHistory = [...existingHistory, statusEntry];
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      setBackToProcessHistory(updatedHistory);
      setHasBackToProcessStatus(true);
    }

    if (newValue !== 'yes') {
      setBackToProcessStatus('');
      setBackToProcessReason('');
    }
  };

  const handleBackToProcessStatusChange = (event) => {
    const newValue = event.target.value;
    setBackToProcessStatus(newValue);
    
    // Save to localStorage
    if (leadId) {
      const statusEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        contactStatus: backToProcessContactStatus,
        interested: backToProcessInterested,
        processStatus: newValue,
        reason: newValue === 'out of process' ? backToProcessReason : '',
        author: 'Current User'
      };

      const storageKey = `lead_back_to_process_status_history_${leadId}`;
      const existingHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedHistory = [...existingHistory, statusEntry];
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      setBackToProcessHistory(updatedHistory);
      setHasBackToProcessStatus(true);
    }

    if (newValue !== 'out of process') {
      setBackToProcessReason('');
    }
  };

  const handleBackToProcessReasonChange = (event) => {
    const newValue = event.target.value;
    setBackToProcessReason(newValue);
    
    // Save to localStorage
    if (leadId) {
      const statusEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        contactStatus: backToProcessContactStatus,
        interested: backToProcessInterested,
        processStatus: backToProcessStatus,
        reason: newValue,
        author: 'Current User'
      };

      const storageKey = `lead_back_to_process_status_history_${leadId}`;
      const existingHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedHistory = [...existingHistory, statusEntry];
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      setBackToProcessHistory(updatedHistory);
      setHasBackToProcessStatus(true);
    }
  };

  // Save new back to process status entry
  const saveNewBackToProcessStatus = (newStatus) => {
    if (!leadId) return;

    const statusEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...newStatus,
      author: 'Current User'
    };

    const updatedHistory = [...backToProcessHistory, statusEntry];
    
    // Update history in localStorage
    localStorage.setItem(`lead_back_to_process_status_history_${leadId}`, JSON.stringify(updatedHistory));
    
    // Update state
    setBackToProcessHistory(updatedHistory);
    setBackToProcessContactStatus(newStatus.contactStatus);
    setBackToProcessInterested(newStatus.interested || '');
    setBackToProcessStatus(newStatus.processStatus || '');
    setBackToProcessReason(newStatus.reason || '');

    // Trigger refresh in parent component
    if (onStatusChange) {
      onStatusChange();
    }
  };

  // Save customer interview status
  const saveCustomerInterviewStatus = () => {
    if (!leadId) return;

    const status = {
      contactStatus: customerInterviewContactStatus,
      interested: customerInterviewInterested,
      processStatus: customerInterviewProcessStatus,
      reason: customerInterviewReason,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(`lead_customer_interview_status_${leadId}`, JSON.stringify(status));
  };

  // Add effect to save customer interview status when it changes
  useEffect(() => {
    if (leadId && (customerInterviewContactStatus || customerInterviewInterested || customerInterviewProcessStatus || customerInterviewReason)) {
      saveCustomerInterviewStatus();
    }
  }, [customerInterviewContactStatus, customerInterviewInterested, customerInterviewProcessStatus, customerInterviewReason, leadId]);

  // Add state for project and country
  const [project, setProject] = useState('');
  const [country, setCountry] = useState('');
  const projectOptions = PROJECT_OPTIONS;
  const countryOptions = COUNTRY_OPTIONS;
  const handleAddFollowUp = async () => {
    if (!leadId || !newFollowUp.trim() || !followUpDate) return;
    try {
      const followUpData = {
        text: newFollowUp,
        next_follow_up_date: followUpDate,
      };
  
      // Call backend API
      const response = await leadsApi.createFollowUp(leadId, followUpData);
      
      // Update local state to show the new follow-up immediately
      setFollowUps((prev) => [response, ...prev]);
      // Reset the input fields
      setNewFollowUp('');
      setFollowUpDate('');
  
    } catch (error) {
      console.error('Failed to create follow-up:', error);
    }
  };
  useEffect(() => {
    const fetchFollowUps = async () => {
      if (!leadId) return;
  
      try {
        const response = await leadsApi.getFollowUps(leadId);
        setFollowUps(response || []);
      } catch (error) {
        console.error('Failed to fetch follow-ups:', error);
      }
    };
  
    fetchFollowUps();
  }, [leadId]);
  // Always use OGX Realization Profile Style for all leads
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          overflowX: 'hidden',
          m: { xs: 0, sm: 2 },
          width: { xs: '100vw', sm: 'auto' },
          maxWidth: { xs: '100vw', sm: 600 },
          minHeight: { xs: '100vh', sm: 'auto' },
        }
      }}
    >
      <DialogTitle sx={{ pb: 0, position: 'relative', overflow: 'hidden', background: 'linear-gradient(90deg, #0CB9C1 0%, #1976d2 100%)', color: '#fff', minHeight: { xs: 80, sm: 120 }, px: { xs: 1, sm: 3 }, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
        <Box display="flex" alignItems="center" gap={2} sx={{ pt: 2, pb: 1, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' } }}>
            <Avatar 
              sx={{ 
                width: { xs: 48, sm: 70 },
                height: { xs: 48, sm: 70 },
                bgcolor: 'primary.main',
                fontSize: { xs: '1.2rem', sm: '2rem' },
                boxShadow: '0 6px 24px rgba(25,118,210,0.18)',
                border: '3px solid #fff',
                ml: { xs: 0, sm: 2 }
              }}
            >
              {leadName?.[0]?.toUpperCase()}
            </Avatar>
          <Box flex={1} sx={{ width: '100%', textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 0.5, letterSpacing: 1, fontSize: { xs: '1.1rem', sm: '2rem' } }}>
              {leadName}
              </Typography>
            <Typography variant="subtitle1" sx={{ color: '#e3f2fd', mb: 1, fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
              {lead.home_lc_name ? `LC: ${lead.home_lc_name}` : ''}
              </Typography>
            <Stack spacing={1}>
              <Box display="flex" alignItems="center" gap={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                <Chip
                  label={leadStatus}
                  sx={{
                    bgcolor:
                      leadStatus?.toLowerCase() === 'accepted' ? '#43a047' :
                      leadStatus?.toLowerCase() === 'rejected' ? '#e53935' :
                      leadStatus?.toLowerCase() === 'pending' ? '#fbc02d' :
                      '#1976d2',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: { xs: '0.7rem', sm: '1rem' },
                    px: { xs: 1, sm: 2 }  
                  }}
                />
            </Box>
            </Stack>
          </Box>
          <IconButton 
            onClick={onClose}
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
              top: 8,
              right: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {/* Stepper for AIESEC Status */}
        <Box sx={{ px: { xs: 0.5, sm: 4 }, pt: { xs: 1, sm: 2 }, pb: { xs: 0.5, sm: 1 } }}>
          <Stepper activeStep={getCurrentStep()} alternativeLabel sx={{ minWidth: 0, width: '100%' }}>
            {aiesecSteps.map((step, index) => (
              <Step key={step.label} completed={index < getCurrentStep()} sx={{ minWidth: 0, px: { xs: 0.5, sm: 1 } }}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: { xs: 20, sm: 28 },
                        height: { xs: 20, sm: 28 },
                        borderRadius: '50%',
                        backgroundColor: isStepActive(index) ? '#037ef3' : '#fff',
                        border: isStepActive(index) ? 'none' : '2px solid #037ef3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isStepActive(index) ? 'white' : '#037ef3',
                        fontSize: { xs: '0.8rem', sm: '1rem' },
                        fontWeight: 500,
                        minWidth: 0
                      }}
                    >
                      {step.index}
                    </Box>
                  )}
                  sx={{
                    minWidth: 0,
                    '& .MuiStepLabel-label': {
                      fontSize: { xs: '0.65rem', sm: '0.85rem' },
                      px: 0,
                      whiteSpace: 'nowrap',
                      minWidth: 0
                    },
                    '& .MuiStepLabel-alternativeLabel': {
                      top: { xs: 18, sm: 22 }
                    }
                  }}
                >
                  {step.label === 'Open' ? (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#fff',
                        fontWeight: isStepActive(index) ? 600 : 400,
                        mt: 0.5,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: { xs: '0.65rem', sm: '0.85rem' },
                        px: 0,
                        '&:hover': { color: '#0CB9C1' }
                      }}
                      onClick={() => handleStepClick('open')}
                    >
                      {step.label}
                    </Typography>
                  ) : step.label === 'Applied' && getCurrentStep() >= 1 ? (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#fff',
                        fontWeight: 600,
                        mt: 0.5,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: { xs: '0.65rem', sm: '0.85rem' },
                        px: 0,
                        '&:hover': { color: '#0CB9C1' }
                      }}
                      onClick={() => handleStepClick('applied')}
                    >
                      {step.label}
                    </Typography>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#fff',
                        fontWeight: isStepActive(index) ? 600 : 400,
                        mt: 0.5,
                        fontSize: { xs: '0.65rem', sm: '0.85rem' },
                        px: 0
                      }}
                    >
                      {step.label}
                    </Typography>
                  )}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Render Applications Section if section === 'applications' */}
        {section === 'applications' && (
          <Box sx={{ p: 3 }}>
            {/* Render opportunity applications here, e.g. a table or list */}
            <Typography variant="h6" sx={{ mb: 2 }}>Opportunity Applications</Typography>
            {/* Example: */}
            <List>
              {opportunityApplications.map((app) => (
                <ListItem key={app.id}>
                  <ListItemText
                    primary={app.opportunity.title}
                    secondary={`Applied on: ${new Date(app.created_at).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 0, sm: 0 }, background: 'linear-gradient(180deg, #f8fafc 0%, #e3f2fd 100%)', overflowX: 'hidden', minHeight: { xs: 'calc(100vh - 80px)', sm: 'auto' } }}>
        <Box sx={{ p: { xs: 0.5, sm: 3 } }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="lead profile tabs"
            sx={{
              '& .MuiTabs-flexContainer': {
                justifyContent: 'space-between'
              },
              '& .MuiTab-root': {
                width: isFromBackToProcess ? '100%' : '50%',
                maxWidth: isFromBackToProcess ? '100%' : '50%',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontWeight: 500,
                textTransform: 'none',
                minHeight: { xs: '40px', sm: '48px' },
                py: 1
              }
            }}
          >
            <Tab label="Calls" />
            {!isFromBackToProcess && <Tab label="Customer Interviews Output" />}
          </Tabs>

          {/* Calls Tab Content */}
          {activeTab === 0 && (
            <Stack spacing={3}>
              {/* Top Key Info Card */}
              <Paper elevation={3} sx={{ p: { xs: 1, sm: 3 }, borderRadius: 3, bgcolor: 'white', mb: { xs: 1.5, sm: 3 }, boxShadow: '0 4px 16px rgba(40,60,90,0.10)' }}>
                <Grid container spacing={0.5} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>EP ID</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>{leadId ?? '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Program</Typography>
                    <Chip label={lead.selected_programmes} size="small" sx={{ bgcolor: lead.selected_programmes?.toLowerCase().includes('gv') ? '#F85A40' : lead.selected_programmes?.toLowerCase().includes('gta') ? '#0CB9C1' : lead.selected_programmes?.toLowerCase().includes('gte') ? '#F48924' : '#e0e0e0', color: '#fff', fontWeight: 700, fontSize: { xs: '0.6rem', sm: '0.75rem' }, px: { xs: '4px', sm: '6px' }, height: { xs: '16px', sm: '20px' }, minHeight: { xs: '16px', sm: '20px' }, borderRadius: '4px', lineHeight: 1.1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Status</Typography>
                    <Chip label={leadStatus || '-'} color="primary" size="small" sx={{ fontWeight: 700, fontSize: { xs: '0.6rem', sm: '0.75rem' }, px: { xs: '4px', sm: '6px' }, height: { xs: '16px', sm: '20px' }, minHeight: { xs: '16px', sm: '20px' }, borderRadius: '4px', lineHeight: 1.1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Home LC / MC</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={lead.home_lc_name || lead.lc || lead.home_lc || '-'} color="info" size="small" sx={{ fontWeight: 600, fontSize: { xs: '0.6rem', sm: '0.75rem' }, px: { xs: '4px', sm: '6px' }, height: { xs: '16px', sm: '20px' }, minHeight: { xs: '16px', sm: '20px' }, borderRadius: '4px', lineHeight: 1.1 }} />
                      <Chip label={lead.home_mc_name || lead.mc || lead.home_mc || '-'} color="info" size="small" sx={{ fontWeight: 600, fontSize: { xs: '0.6rem', sm: '0.75rem' }, px: { xs: '4px', sm: '6px' }, height: { xs: '16px', sm: '20px' }, minHeight: { xs: '16px', sm: '20px' }, borderRadius: '4px', lineHeight: 1.1 }} />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Personal Info */}
              <Paper elevation={1} sx={{ p: { xs: 1, sm: 2.5 }, borderRadius: 3, bgcolor: '#f8fafc', mb: { xs: 1, sm: 2 }, boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: { xs: 1, sm: 2 }, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                  <PersonIcon color="primary" /> Personal Information
                </Typography>
                <Grid container spacing={0.5}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<PersonIcon color="primary" />} label="Name" value={leadName} />
                    <InfoItem icon={<EmailIcon color="primary" />} label="Email" value={lead.email} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<PersonIcon color="primary" />} label="Gender" value={lead.gender} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<CalendarIcon color="primary" />} label="DOB" value={lead.dob} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<PhoneIcon color="primary" />} label="Phone" value={lead.phone} />
                  </Grid>
                  {/* <Grid item xs={12} sm={6}>
                    <InfoItem icon={<SchoolIcon color="primary" />} label="Campus" value={lead.lc_alignment?.keywords || lead.keywords || lead.campus || '-'} />
                  </Grid> */}
                </Grid>
              </Paper>

              {/* AIESEC Info */}
              <Paper elevation={1} sx={{ p: { xs: 1, sm: 2.5 }, borderRadius: 3, bgcolor: '#f8fafc', mb: { xs: 1, sm: 2 }, boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: { xs: 1, sm: 2 }, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                  <WorkIcon fontSize="medium" color="action" /> AIESEC Information
                </Typography>
                <Grid container spacing={0.5}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<PersonIcon color="primary" />} label="Person Status" value={<Chip label={leadStatus || '-'} color="primary" size="small" sx={{ fontWeight: 600, fontSize: { xs: '0.6rem', sm: '0.75rem' }, height: { xs: '16px', sm: '20px' } }} />} />
                  </Grid>
                  {/* <Grid item xs={12} sm={6}>
                    <InfoItem icon={<LinkIcon color="primary" />} label="EXPA Referral Type" value={lead.source || lead.referral} />
                  </Grid> */}
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<CalendarIcon color="primary" />} label="Signed up at" value={lead.created_at} />
                  </Grid>
                </Grid>
              </Paper>

              {/* Education Info */}
              <Paper elevation={1} sx={{ p: { xs: 1, sm: 2.5 }, borderRadius: 3, bgcolor: '#f8fafc', mb: { xs: 1, sm: 2 }, boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: { xs: 1, sm: 2 }, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                  <SchoolIcon fontSize="medium" color="action" /> Education
                </Typography>
                <Grid container spacing={0.5}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<SchoolIcon color="primary" />} label="Backgrounds" value={lead.academic_backgrounds[0] || lead.backgrounds} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<SchoolIcon color="primary" />} label="Latest Graduation Year" value={lead.latest_graduation_date} />
                  </Grid>
                </Grid>
              </Paper>

              {/* Opportunity Info */}
              <Paper ref={opportunitySectionRef} elevation={1} sx={{ p: { xs: 1, sm: 2.5 }, borderRadius: 3, bgcolor: '#f8fafc', mb: { xs: 1, sm: 2 }, boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: { xs: 1, sm: 2 }, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                  <WorkIcon fontSize="medium" color="action" /> Opportunity
                </Typography>
                <Grid container spacing={0.5}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkIcon color="primary" />
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Applications</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', ml: 1, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>{lead.opportunity_applications_count|| 0}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Lead Status Section - Always visible */}
              <Paper elevation={1} sx={{ p: { xs: 1, sm: 2.5 }, borderRadius: 3, bgcolor: '#f8fafc', mb: { xs: 1, sm: 2 }, boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: { xs: 1, sm: 2 }, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                  <AssignmentIndIcon color="primary" /> Lead Status
                </Typography>
                <Grid container spacing={0.5}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
                      <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Contact Status</InputLabel>
                      <Select
                        value={contactStatus}
                        onChange={handleContactStatusChange}
                        label="Contact Status"
                        disabled={isB2C}
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, height: { xs: 40, sm: 56 }, minHeight: { xs: 40, sm: 56 }, minWidth: 150, width: '100%', '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } }}
                      >
                        {contactStatusOptions.map((option) => (
                          <MenuItem key={option} value={option} sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {contactStatus.toLowerCase() === 'yes' && (
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
                        <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Interested</InputLabel>
                        <Select
                          value={interested}
                          onChange={handleInterestedChange}
                          label="Interested"
                          disabled={isB2C}
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, height: { xs: 40, sm: 56 }, minHeight: { xs: 40, sm: 56 }, minWidth: 150, width: '100%', '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } }}
                        >
                          {interestedOptions.map((option) => (
                            <MenuItem key={option} value={option} sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {interested.toLowerCase() === 'yes' && (
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
                        <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Process Status</InputLabel>
                        <Select
                          value={processStatus}
                          onChange={handleProcessStatusChange}
                          label="Process Status"
                          disabled={isB2C}
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, height: { xs: 40, sm: 56 }, minHeight: { xs: 40, sm: 56 }, minWidth: 150, width: '100%', '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } }}
                        >
                          {processStatusOptions.map((option) => (
                            <MenuItem key={option} value={option} sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {processStatus.toLowerCase() === 'out of process' && (
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
                        <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Reason</InputLabel>
                        <Select
                          value={reason}
                          onChange={handleReasonChange}
                          label="Reason"
                          disabled={isB2C}
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, height: { xs: 40, sm: 56 }, minHeight: { xs: 40, sm: 56 }, minWidth: 150, width: '100%', '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } }}
                        >
                          {reasonOptions.map((option) => (
                            <MenuItem key={option} value={option} sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {processStatus.toLowerCase() === 'in process' && (
                    <>
                      <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
                          <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Project</InputLabel>
                          <Select
                            value={project}
                            onChange={handleProjectChange}
                            label="Project"
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, height: { xs: 40, sm: 56 }, minHeight: { xs: 40, sm: 56 }, minWidth: 150, width: '100%', '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } }}
                          >
                            {projectOptions.map(option => (
                              <MenuItem key={option} value={option} sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Autocomplete
                          options={countryOptions}
                          value={country || null}                 // must be null if empty
                          onChange={handleCountryChange}          // now uses (event, value)
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Country"
                              variant="outlined"
                              sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minWidth: 150, mb: 2 }}
                            />
                          )}
                          fullWidth
                          disableClearable={false}
                          isOptionEqualToValue={(option, value) => option === value}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>



              {/* Back to Process Status Section */}
              {(isFromBackToProcess || hasBackToProcessStatus) && (
                <Paper elevation={1} sx={{ p: { xs: 1, sm: 2.5 }, borderRadius: 3, bgcolor: '#f8fafc', mb: { xs: 1, sm: 2 }, boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}>
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: { xs: 1, sm: 2 }, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                    <AssignmentIndIcon color="primary" /> Back to Process Status
                  </Typography>
                  <Grid container spacing={0.5}>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
                        <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Contact Status</InputLabel>
                        <Select
                          value={backToProcessContactStatus}
                          onChange={handleBackToProcessContactStatusChange}
                          label="Contact Status"
                          disabled={isB2C || isFromLeadsPage}
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, height: { xs: 40, sm: 56 }, minHeight: { xs: 40, sm: 56 }, minWidth: 150, width: '100%', '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } }}
                        >
                          {contactStatusOptions.map((option) => (
                            <MenuItem key={option} value={option} sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {backToProcessContactStatus === 'Yes' && (
                      <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
                          <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Interested</InputLabel>
                          <Select
                            value={backToProcessInterested}
                            onChange={handleBackToProcessInterestedChange}
                            label="Interested"
                            disabled={isB2C || isFromLeadsPage}
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, height: { xs: 40, sm: 56 }, minHeight: { xs: 40, sm: 56 }, minWidth: 150, width: '100%', '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } }}
                          >
                            {interestedOptions.map((option) => (
                              <MenuItem key={option} value={option} sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    {backToProcessInterested === 'Yes' && (
                      <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
                          <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Process Status</InputLabel>
                          <Select
                            value={backToProcessStatus}
                            onChange={handleBackToProcessStatusChange}
                            label="Process Status"
                            disabled={isB2C || isFromLeadsPage}
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, height: { xs: 40, sm: 56 }, minHeight: { xs: 40, sm: 56 }, minWidth: 150, width: '100%', '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } }}
                          >
                            {processStatusOptions.map((option) => (
                              <MenuItem key={option} value={option} sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    {backToProcessStatus === 'Out of Process' && (
                      <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
                          <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Reason</InputLabel>
                          <Select
                            value={backToProcessReason}
                            onChange={handleBackToProcessReasonChange}
                            label="Reason"
                            disabled={isB2C || isFromLeadsPage}
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, height: { xs: 40, sm: 56 }, minHeight: { xs: 40, sm: 56 }, minWidth: 150, width: '100%', '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } }}
                          >
                            {reasonOptions.map((option) => (
                              <MenuItem key={option} value={option} sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              )}

      

              {/* Comments and Follow-ups Section */}
              <Paper elevation={2} sx={{ p: { xs: 1, sm: 2.5 }, borderRadius: 3, bgcolor: 'white', mt: { xs: 1, sm: 2 }, boxShadow: '0 2px 12px rgba(40,60,90,0.06)' }}>
                <ButtonGroup variant="contained" fullWidth sx={{ mb: { xs: 1, sm: 2 }, width: '100%', overflow: 'hidden' }}>
                  <Button 
                    onClick={() => setActiveSection('comments')}
                    variant={activeSection === 'comments' ? 'contained' : 'outlined'}
                    startIcon={<CommentIcon />}
                    disabled={isB2C}
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.875rem' }, 
                      py: { xs: 0.5, sm: 1 },
                      minWidth: 0,
                      flex: 1,
                      px: { xs: 0.5, sm: 1 }
                    }}
                  >
                    Comments
                  </Button>
                  <Button
                    onClick={() => setActiveSection('followups')}
                    variant={activeSection === 'followups' ? 'contained' : 'outlined'}
                    startIcon={<ScheduleIcon />}
                    disabled={isB2C}
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.875rem' }, 
                      py: { xs: 0.5, sm: 1 },
                      minWidth: 0,
                      flex: 1,
                      px: { xs: 0.5, sm: 1 }
                    }}
                  >
                    Follow-ups
                  </Button>
                </ButtonGroup>
                <Box>
                  {activeSection === 'comments' ? (
                   <>
                     <TextField
                       fullWidth
                       multiline
                       rows={2}
                       variant="outlined"
                       placeholder="Add a comment..."
                       value={newComment}
                       onChange={(e) => setNewComment(e.target.value)}
                       disabled={isB2C || addingComment}
                       sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '1rem' } }}
                     />
                     <Button
                       fullWidth
                       variant="contained"
                       onClick={handleAddComment}
                       startIcon={<CommentIcon />}
                       disabled={isB2C || addingComment || !newComment.trim()}
                       sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 0.5, sm: 1 } }}
                     >
                       Add Comment
                     </Button>
                     <List sx={{ mt: { xs: 1, sm: 2 } }}>
                       {comments.length === 0 ? (
                         <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                           No comments yet.
                         </Typography>
                       ) : (
                         comments.map((comment, index) => (
                           <ListItem
                             key={comment.id || index} // fallback to index if no id
                             sx={{
                               bgcolor: theme.palette.background.paper,
                               borderRadius: 1,
                               mb: { xs: 0.5, sm: 1 },
                               flexDirection: 'column',
                               p: { xs: 1, sm: 2 }
                             }}
                           >
                             <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: { xs: 0.5, sm: 1 } }}>
                               <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                 {new Date(comment.created_at || comment.timestamp).toLocaleString()}
                               </Typography>
                               <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                 {comment.creator_name || 'Unknown'}
                               </Typography>
                             </Box>
                             <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                               {comment.comment}
                             </Typography>
                           </ListItem>
                         ))
                       )}
                     </List>
                   </>
                   
                  ) : (
                    <>
                      {/* Follow-ups Tabs */}
                      <Box sx={{ mb: { xs: 1, sm: 2 }, width: '100%', overflow: 'hidden' }}>
                        <ButtonGroup variant="contained" fullWidth sx={{ width: '100%', overflow: 'hidden' }}>
                          <Button 
                            onClick={() => setFollowUpFilter('pending')}
                            variant={followUpFilter === 'pending' ? 'contained' : 'outlined'}
                            sx={{ 
                              fontSize: { xs: '0.7rem', sm: '0.875rem' }, 
                              py: { xs: 0.5, sm: 1 },
                              minWidth: 0,
                              flex: 1,
                              px: { xs: 0.5, sm: 1 }
                            }}
                          >
                            PENDING
                          </Button>
                          <Button
                            onClick={() => setFollowUpFilter('completed')}
                            variant={followUpFilter === 'completed' ? 'contained' : 'outlined'}
                            sx={{ 
                              fontSize: { xs: '0.7rem', sm: '0.875rem' }, 
                              py: { xs: 0.5, sm: 1 },
                              minWidth: 0,
                              flex: 1,
                              px: { xs: 0.5, sm: 1 }
                            }}
                          >
                            COMPLETED
                          </Button>
                        </ButtonGroup>
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        variant="outlined"
                        placeholder="Add a follow-up note..."
                        value={newFollowUp}
                        onChange={(e) => setNewFollowUp(e.target.value)}
                        disabled={isB2C}
                        sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '1rem' } }}
                      />
                      <TextField
                        fullWidth
                        type="datetime-local"
                        variant="outlined"
                        label="Follow-up Date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        disabled={isB2C}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '1rem' } }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleAddFollowUp}
                        startIcon={<ScheduleIcon />}
                        disabled={isB2C}
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 0.5, sm: 1 } }}
                      >
                        Schedule Follow-up
                      </Button>
                      <List sx={{ mt: { xs: 1, sm: 2 } }}>
                      {followUps.filter(followUp => followUp.status?.toLowerCase() === followUpFilter).length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, textAlign: 'center', py: 2 }}>
                          No {followUpFilter} follow-ups yet.
                        </Typography>
                      ) : (
                        followUps.filter(followUp => followUp.status?.toLowerCase() === followUpFilter).map((followUp) => (
                          <ListItem 
                            key={followUp.id}
                            sx={{ 
                              bgcolor: theme.palette.background.default,
                              borderRadius: 1,
                              mb: { xs: 0.5, sm: 1 },
                              flexDirection: 'column',
                              p: { xs: 1, sm: 2 }
                            }}
                          >
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: { xs: 0.5, sm: 1 } }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                {new Date(followUp.created_at).toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                {followUp.created_by_member_name || 'N/A'}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mb: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {followUp.follow_up_text}
                            </Typography>
                            <Chip
                              label={`Scheduled: ${followUp.follow_up_at ? new Date(followUp.follow_up_at).toLocaleString() : 'N/A'}`}
                              size="small"
                              color={followUp.status === 'completed' ? 'success' : 'warning'}
                              icon={<ScheduleIcon />}
                              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, height: { xs: '20px', sm: '24px' } }}
                            />
                          </ListItem>
                        ))
                      )}
                      </List>
                    </>
                  )}
                </Box>
              </Paper>
            </Stack>
          )}

          {/* Customer Interviews Output Tab */}
          {!isFromBackToProcess && activeTab === 1 && (
            <Stack spacing={3}>
              {/* Top Key Info Card */}
              <Paper elevation={3} sx={{ p: { xs: 1, sm: 3 }, borderRadius: 3, bgcolor: 'white', mb: { xs: 1.5, sm: 3 }, boxShadow: '0 4px 16px rgba(40,60,90,0.10)' }}>
                <Grid container spacing={0.5} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>EP ID</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>{leadId ?? '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Program</Typography>
                    <Chip label={lead.product} size="small" sx={{ bgcolor: lead.product?.toLowerCase().includes('gv') ? '#F85A40' : lead.product?.toLowerCase().includes('gta') ? '#0CB9C1' : lead.product?.toLowerCase().includes('gte') ? '#F48924' : '#e0e0e0', color: '#fff', fontWeight: 700, fontSize: { xs: '0.6rem', sm: '0.75rem' }, px: { xs: '4px', sm: '6px' }, height: { xs: '16px', sm: '20px' }, minHeight: { xs: '16px', sm: '20px' }, borderRadius: '4px', lineHeight: 1.1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Status</Typography>
                    <Chip label={leadStatus || '-'} color="primary" size="small" sx={{ fontWeight: 700, fontSize: { xs: '0.6rem', sm: '0.75rem' }, px: { xs: '4px', sm: '6px' }, height: { xs: '16px', sm: '20px' }, minHeight: { xs: '16px', sm: '20px' }, borderRadius: '4px', lineHeight: 1.1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Home LC / MC</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={lead.home_lc_name || lead.lc || lead.home_lc || '-'} color="info" size="small" sx={{ fontWeight: 600, fontSize: { xs: '0.6rem', sm: '0.75rem' }, px: { xs: '4px', sm: '6px' }, height: { xs: '16px', sm: '20px' }, minHeight: { xs: '16px', sm: '20px' }, borderRadius: '4px', lineHeight: 1.1 }} />
                      <Chip label={lead.home_mc_name || lead.mc || lead.home_mc || '-'} color="info" size="small" sx={{ fontWeight: 600, fontSize: { xs: '0.6rem', sm: '0.75rem' }, px: { xs: '4px', sm: '6px' }, height: { xs: '16px', sm: '20px' }, minHeight: { xs: '16px', sm: '20px' }, borderRadius: '4px', lineHeight: 1.1 }} />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Personal Information */}
              <Paper elevation={1} sx={{ p: { xs: 1, sm: 2.5 }, borderRadius: 3, bgcolor: '#f8fafc', mb: { xs: 1, sm: 2 }, boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: { xs: 1, sm: 2 }, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                  <PersonIcon color="primary" /> Personal Information
                </Typography>
                <Grid container spacing={0.5}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<PersonIcon color="primary" />} label="Name" value={leadName} />
                    <InfoItem icon={<EmailIcon color="primary" />} label="Email" value={lead.email} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<PersonIcon color="primary" />} label="Gender" value={lead.gender} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<PhoneIcon color="primary" />} label="Phone" value={lead.phone} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<SchoolIcon color="primary" />} label="Campus" value={lead.lc_alignment?.keywords || lead.keywords || lead.campus || '-'} />
                  </Grid>
                </Grid>
              </Paper>

              {/* AIESEC Information */}
              <Paper elevation={1} sx={{ p: { xs: 1, sm: 2.5 }, borderRadius: 3, bgcolor: '#f8fafc', mb: { xs: 1, sm: 2 }, boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: { xs: 1, sm: 2 }, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                  <WorkIcon fontSize="medium" color="action" /> AIESEC Information
                </Typography>
                <Grid container spacing={0.5}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<PersonIcon color="primary" />} label="Person Status" value={<Chip label={leadStatus || '-'} color="primary" size="small" sx={{ fontWeight: 600, fontSize: { xs: '0.6rem', sm: '0.75rem' }, height: { xs: '16px', sm: '20px' } }} />} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<LinkIcon color="primary" />} label="EXPA Referral Type" value={lead.source || lead.referral} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<CalendarIcon color="primary" />} label="Signed up at" value={lead.created_at} />
                  </Grid>
                </Grid>
              </Paper>

              {/* Education */}
              <Paper elevation={1} sx={{ p: { xs: 1, sm: 2.5 }, borderRadius: 3, bgcolor: '#f8fafc', mb: { xs: 1, sm: 2 }, boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: { xs: 1, sm: 2 }, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                  <SchoolIcon fontSize="medium" color="action" /> Education
                </Typography>
                <Grid container spacing={0.5}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<SchoolIcon color="primary" />} label="Backgrounds" value={lead.background || lead.backgrounds} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<SchoolIcon color="primary" />} label="Latest Graduation Year" value={lead.graduation || lead.latest_graduation_year} />
                  </Grid>
                </Grid>
              </Paper>

              {/* Opportunity */}
              <Paper ref={opportunitySectionRef} elevation={1} sx={{ p: { xs: 1, sm: 2.5 }, borderRadius: 3, bgcolor: '#f8fafc', mb: { xs: 1, sm: 2 }, boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: { xs: 1, sm: 2 }, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                  <WorkIcon fontSize="medium" color="action" /> Opportunity
                </Typography>
                <Grid container spacing={0.5}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkIcon color="primary" />
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Applications</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', ml: 1, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>{opportunityApplications?.length || 0}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<LinkIcon color="primary" />} label="Opportunity Link" value={lead.opp_link ? <a href={lead.opp_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 600 }}>{lead.opp_link}</a> : '-'} />
                  </Grid>
                </Grid>
              </Paper>

              {/* Lead Status Section - Independent for Customer Interviews */}
              <Paper elevation={1} sx={{ p: { xs: 1, sm: 2.5 }, borderRadius: 3, bgcolor: '#f8fafc', mb: { xs: 1, sm: 2 }, boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: { xs: 1, sm: 2 }, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                  <AssignmentIndIcon color="primary" /> Lead Status (Customer Interview)
                </Typography>
                <Grid container spacing={0.5}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
                      <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Contact Status</InputLabel>
                      <Select
                        value={customerInterviewContactStatus}
                        onChange={handleCustomerInterviewContactStatusChange}
                        label="Contact Status"
                        disabled={!isB2C}
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, height: { xs: 40, sm: 56 }, minHeight: { xs: 40, sm: 56 }, minWidth: 150, width: '100%', '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } }}
                      >
                        {contactStatusOptions.map((option) => (
                          <MenuItem key={option} value={option} sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {customerInterviewContactStatus === 'Yes' && (
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
                        <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Interested</InputLabel>
                        <Select
                          value={customerInterviewInterested}
                          onChange={handleCustomerInterviewInterestedChange}
                          label="Interested"
                          disabled={!isB2C}
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, height: { xs: 40, sm: 56 }, minHeight: { xs: 40, sm: 56 }, minWidth: 150, width: '100%', '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } }}
                        >
                          {interestedOptions.map((option) => (
                            <MenuItem key={option} value={option} sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {customerInterviewInterested === 'Yes' && (
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
                        <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Process Status</InputLabel>
                        <Select
                          value={customerInterviewProcessStatus}
                          onChange={handleCustomerInterviewProcessStatusChange}
                          label="Process Status"
                          disabled={!isB2C}
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, height: { xs: 40, sm: 56 }, minHeight: { xs: 40, sm: 56 }, minWidth: 150, width: '100%', '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } }}
                        >
                          {processStatusOptions.map((option) => (
                            <MenuItem key={option} value={option} sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {customerInterviewProcessStatus === 'Out of Process' && (
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
                        <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Reason</InputLabel>
                        <Select
                          value={customerInterviewReason}
                          onChange={handleCustomerInterviewReasonChange}
                          label="Reason"
                          disabled={!isB2C}
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, height: { xs: 40, sm: 56 }, minHeight: { xs: 40, sm: 56 }, minWidth: 150, width: '100%', '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } }}
                        >
                          {reasonOptions.map((option) => (
                            <MenuItem key={option} value={option} sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {processStatus === 'In Process' && (
                    <>
                      <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
                          <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Project</InputLabel>
                          <Select
                            value={project}
                            onChange={e => setProject(e.target.value)}
                            label="Project"
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, height: { xs: 40, sm: 56 }, minHeight: { xs: 40, sm: 56 }, minWidth: 150, width: '100%', '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } }}
                          >
                            {projectOptions.map(option => (
                              <MenuItem key={option} value={option} sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Autocomplete
                          options={countryOptions}
                          value={country}
                          onChange={(e, newValue) => setCountry(newValue || '')}
                          renderInput={(params) => (
                            <TextField {...params} label="Country" variant="outlined" sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minWidth: 150, mb: 2 }} />
                          )}
                          fullWidth
                          disableClearable={false}
                          isOptionEqualToValue={(option, value) => option === value}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>

              {/* Customer Interview Comments */}
              <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: 3, bgcolor: '#f8fafc', mb: 2, boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 2, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CommentIcon color="primary" /> Customer Interview Comments
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Add a customer interview comment..."
                  value={newCustomerInterviewComment}
                  onChange={(e) => setNewCustomerInterviewComment(e.target.value)}
                  disabled={!isB2C}
                  sx={{ mb: 1 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAddCustomerInterviewComment}
                  startIcon={<CommentIcon />}
                  disabled={!isB2C}
                >
                  Add Customer Interview Comment
                </Button>
                <List sx={{ mt: 2 }}>
                  {customerInterviewComments.map((comment) => (
                    <ListItem 
                      key={comment.id}
                      sx={{ 
                        bgcolor: theme.palette.background.default,
                        borderRadius: 1,
                        mb: 1,
                        flexDirection: 'column'
                      }}
                    >
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.created_at).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {comment.author}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {comment.text}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>

              {/* Mark EP Back to Process Button or Info */}
              {!isMarkedBackToProcess ? (
                <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8fafc', boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleMarkBackToProcess}
                    startIcon={<AssignmentIndIcon />}
                    disabled={!isB2C}
                    sx={{
                      background: 'linear-gradient(90deg, #0CB9C1 0%, #1976d2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #0aa8af 0%, #1565c0 100%)',
                      }
                    }}
                  >
                    Mark EP Back to Process
                  </Button>
                </Paper>
              ) : (
                <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#e8f5e9', boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}>
                  <Typography variant="body1" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                    <CheckCircleIcon /> This EP is already marked back to process.
                  </Typography>
                </Paper>
              )}
            </Stack>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      {/* Back to Process Comment Dialog */}
      <Dialog 
        open={showBackToProcessDialog} 
        onClose={() => setShowBackToProcessDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(90deg, #0CB9C1 0%, #1976d2 100%)',
          color: '#fff',
          fontWeight: 600
        }}>
          Mark EP Back to Process
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please provide a reason for marking this EP back to process:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Enter your comment..."
            value={backToProcessComment}
            onChange={(e) => setBackToProcessComment(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setShowBackToProcessDialog(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmBackToProcess}
            variant="contained"
            disabled={!backToProcessComment.trim()}
            sx={{
              background: 'linear-gradient(90deg, #0CB9C1 0%, #1976d2 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #0aa8af 0%, #1565c0 100%)',
              }
            }}
          >
            Confirm
          </Button>
      </DialogActions>
      </Dialog>

      {/* Add this useEffect after activeTab is defined */}
      {useEffect(() => {
        if (isFromBackToProcess && activeTab === 1) {
          setActiveTab(0);
        }
      }, [isFromBackToProcess, activeTab])}
    </Dialog>
  );
}

export default LeadProfile; 