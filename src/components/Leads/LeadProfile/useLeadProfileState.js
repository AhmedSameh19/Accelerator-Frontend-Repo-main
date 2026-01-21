import { useState, useEffect, useRef } from 'react';
import leadsApi from '../../../api/services/leadsApi';
import b2cAPI from '../../../api/services/b2cAPI';
import { fetchOpportunityApplications } from '../../../api/services/aiesecApi';
import { useAddLeadComment } from '../../../hooks/leads/useAddLeadComment';

export function useLeadProfileState({ lead, leadId, onStatusChange }) {
  const { addComment: addLeadComment, loading: addingComment } = useAddLeadComment({ leadId });

  // Regular lead status states
  const [contactStatus, setContactStatus] = useState('');
  const [interested, setInterested] = useState('');
  const [processStatus, setProcessStatus] = useState('');
  const [reason, setReason] = useState('');
  const [project, setProject] = useState('');
  const [country, setCountry] = useState('');

  // Back to process status states
  const [backToProcessContactStatus, setBackToProcessContactStatus] = useState('');
  const [backToProcessInterested, setBackToProcessInterested] = useState('');
  const [backToProcessStatus, setBackToProcessStatus] = useState('');
  const [backToProcessReason, setBackToProcessReason] = useState('');
  const [hasBackToProcessStatus, setHasBackToProcessStatus] = useState(false);

  // UI states
  const [activeSection, setActiveSection] = useState('comments');
  const [activeTab, setActiveTab] = useState(0);
  const [followUpFilter, setFollowUpFilter] = useState('pending');

  // Comments and FollowUps
  const [newComment, setNewComment] = useState('');
  const [newFollowUp, setNewFollowUp] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [comments, setComments] = useState([]);
  const [followUps, setFollowUps] = useState([]);

  // Customer Interview states
  const [customerInterviewComments, setCustomerInterviewComments] = useState([]);
  const [newCustomerInterviewComment, setNewCustomerInterviewComment] = useState('');
  const [customerInterviewContactStatus, setCustomerInterviewContactStatus] = useState('');
  const [customerInterviewInterested, setCustomerInterviewInterested] = useState('');
  const [customerInterviewProcessStatus, setCustomerInterviewProcessStatus] = useState('');
  const [customerInterviewReason, setCustomerInterviewReason] = useState('');

  // Back to process dialog states
  const [isMarkedBackToProcess, setIsMarkedBackToProcess] = useState(false);
  const [showBackToProcessDialog, setShowBackToProcessDialog] = useState(false);
  const [backToProcessComment, setBackToProcessComment] = useState('');

  // Opportunity applications
  const [opportunityApplications, setOpportunityApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [section, setSection] = useState('profile');
  const opportunitySectionRef = useRef(null);

  // Load all data when leadId changes
  useEffect(() => {
    if (!leadId) return;

    // Reset all states
    setContactStatus('');
    setInterested('');
    setProcessStatus('');
    setReason('');
    setProject('');
    setCountry('');
    setBackToProcessContactStatus('');
    setBackToProcessInterested('');
    setBackToProcessStatus('');
    setBackToProcessReason('');
    setComments([]);
    setCustomerInterviewComments([]);
    setFollowUps([]);
    setNewComment('');
    setNewCustomerInterviewComment('');
    setNewFollowUp('');
    setFollowUpDate('');

    // Load from localStorage
    const storageKey = `lead_status_history_${leadId}`;
    const backToProcessStorageKey = `lead_back_to_process_status_history_${leadId}`;
    const storageKeyMarkedBackToProcess = `lead_marked_back_to_process_${leadId}`;
    const customerInterviewStorageKey = `lead_customer_interview_status_${leadId}`;

    const storedMarkedStatus = localStorage.getItem(storageKeyMarkedBackToProcess);
    if (storedMarkedStatus) {
      setIsMarkedBackToProcess(JSON.parse(storedMarkedStatus));
    }

    const storedBackToProcessHistory = localStorage.getItem(backToProcessStorageKey);
    if (storedBackToProcessHistory) {
      const history = JSON.parse(storedBackToProcessHistory);
      if (history.length > 0) {
        const currentStatus = history[history.length - 1];
        setBackToProcessContactStatus(currentStatus.contactStatus || '');
        setBackToProcessInterested(currentStatus.interested || '');
        setBackToProcessStatus(currentStatus.processStatus || '');
        setBackToProcessReason(currentStatus.reason || '');
        setHasBackToProcessStatus(true);
      }
    }

    const storedCustomerInterviewStatus = localStorage.getItem(customerInterviewStorageKey);
    if (storedCustomerInterviewStatus) {
      const status = JSON.parse(storedCustomerInterviewStatus);
      setCustomerInterviewContactStatus(status.contactStatus || '');
      setCustomerInterviewInterested(status.interested || '');
      setCustomerInterviewProcessStatus(status.processStatus || '');
      setCustomerInterviewReason(status.reason || '');
    }

    // Fetch from API
    const fetchComments = async () => {
      try {
        const response = await leadsApi.getComments(leadId);
        setComments(response || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    const fetchCustomerInterviewsComments = async () => {
      try {
        const response = await b2cAPI.getComments(leadId);
        setCustomerInterviewComments(response.comments || []);
      } catch (error) {
        console.error('Error fetching customer interview comments:', error);
      }
    };

    const fetchContactStatus = async () => {
      try {
        const data = await leadsApi.getContactStatus(leadId);
        if (data) {
          setContactStatus(data.contact_status || '');
          setInterested(data.interested || '');
          setProcessStatus(data.process_status || '');
          setReason(data.reason || '');
          setProject(data.project || '');
          setCountry(data.country || '');
        }
      } catch (error) {
        console.error('Error fetching contact status:', error);
      }
    };

    const fetchFollowUps = async () => {
      try {
        const response = await leadsApi.getFollowUps(leadId);
        setFollowUps(response || []);
      } catch (error) {
        console.error('Failed to fetch follow-ups:', error);
      }
    };

    fetchComments();
    fetchCustomerInterviewsComments();
    fetchContactStatus();
    fetchFollowUps();
  }, [leadId]);

  // Load opportunity applications
  useEffect(() => {
    const loadOpportunityApplications = async () => {
      if (!leadId) return;
      setLoadingApplications(true);
      try {
        const applications = await fetchOpportunityApplications(leadId, "2020-01-01");
        setOpportunityApplications(applications);
      } catch (error) {
        console.error('Error loading opportunity applications:', error);
      } finally {
        setLoadingApplications(false);
      }
    };
    loadOpportunityApplications();
  }, [leadId]);

  // Update lead when opportunity data changes
  useEffect(() => {
    if (opportunityApplications.length > 0 && onStatusChange) {
      const latestApp = opportunityApplications[0];
      const opportunity = latestApp.opportunity;
      const updatedLead = {
        ...lead,
        he_mc: opportunity?.host_mc?.name || lead?.he_mc || '-',
        he_lc: opportunity?.host_lc?.name || lead?.he_lc || '-',
        opp_link: opportunity?.id ? `https://aiesec.org/opportunity/${opportunity.id}` : lead?.opp_link || '-',
        product: opportunity?.programme?.short_name_display || lead?.product || '-'
      };
      onStatusChange(updatedLead);
    }
  }, [opportunityApplications, lead, onStatusChange]);

  // Save customer interview status to localStorage
  useEffect(() => {
    if (leadId && (customerInterviewContactStatus || customerInterviewInterested || customerInterviewProcessStatus || customerInterviewReason)) {
      const status = {
        contactStatus: customerInterviewContactStatus,
        interested: customerInterviewInterested,
        processStatus: customerInterviewProcessStatus,
        reason: customerInterviewReason,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`lead_customer_interview_status_${leadId}`, JSON.stringify(status));
    }
  }, [customerInterviewContactStatus, customerInterviewInterested, customerInterviewProcessStatus, customerInterviewReason, leadId]);

  // Handlers for status changes
  const handleContactStatusChange = (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setContactStatus(value);
    
    if (value.toLowerCase() !== 'yes') {
      setInterested('');
      setProcessStatus('');
      setReason('');
      setProject('');
      setCountry('');
    }
    
    leadsApi.updateLeadStatus(leadId, { contact_status: value });
  };

  const handleInterestedChange = (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setInterested(value);
    
    if (value.toLowerCase() !== 'yes') {
      setProcessStatus('');
      setReason('');
      setProject('');
      setCountry('');
    }
    
    leadsApi.updateLeadStatus(leadId, { interested: value });
  };

  const handleProcessStatusChange = (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setProcessStatus(value);
    
    if (value.toLowerCase() !== 'in process' && value.toLowerCase() !== 'out of process') {
      setReason('');
      setProject('');
      setCountry('');
    } else if (value.toLowerCase() === 'in process') {
      setReason('');
    } else if (value.toLowerCase() === 'out of process') {
      setProject('');
      setCountry('');
    }
    
    leadsApi.updateLeadStatus(leadId, { process_status: value });
  };

  const handleReasonChange = (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setReason(value);
    leadsApi.updateLeadStatus(leadId, { reason: value });
  };

  const handleProjectChange = (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setProject(value);
    leadsApi.updateLeadStatus(leadId, { project: value });
  };

  const handleCountryChange = (event, newValue) => {
    if (!leadId) return;
    const value = newValue || '';
    setCountry(value);
    leadsApi.updateLeadStatus(leadId, { country: value });
  };

  // Handler for adding comments
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

  // Handler for adding follow-ups
  const handleAddFollowUp = async () => {
    if (!leadId || !newFollowUp.trim() || !followUpDate) return;
    try {
      const followUpData = {
        text: newFollowUp,
        next_follow_up_date: followUpDate,
      };
      const response = await leadsApi.createFollowUp(leadId, followUpData);
      setFollowUps((prev) => [response, ...prev]);
      setNewFollowUp('');
      setFollowUpDate('');
    } catch (error) {
      console.error('Failed to create follow-up:', error);
    }
  };

  // Handler for customer interview comments
  const handleAddCustomerInterviewComment = async () => {
    if (!leadId || !newCustomerInterviewComment.trim()) return;
    try {
      const response = await b2cAPI.addComment(leadId, newCustomerInterviewComment.trim());
      const updatedComments = response.data.comments || [];
      setCustomerInterviewComments(updatedComments);
      setNewCustomerInterviewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Handlers for customer interview status
  const handleCustomerInterviewContactStatusChange = (event) => {
    const value = event.target.value;
    setCustomerInterviewContactStatus(value);
    if (value.toLowerCase() !== 'yes') {
      setCustomerInterviewInterested('');
      setCustomerInterviewProcessStatus('');
      setCustomerInterviewReason('');
    }
  };

  const handleCustomerInterviewInterestedChange = (event) => {
    const value = event.target.value;
    setCustomerInterviewInterested(value);
    if (value.toLowerCase() !== 'yes') {
      setCustomerInterviewProcessStatus('');
      setCustomerInterviewReason('');
    }
  };

  const handleCustomerInterviewProcessStatusChange = (event) => {
    const value = event.target.value;
    setCustomerInterviewProcessStatus(value);
    if (value.toLowerCase() !== 'out of process') {
      setCustomerInterviewReason('');
    }
  };

  const handleCustomerInterviewReasonChange = (event) => {
    setCustomerInterviewReason(event.target.value);
  };

  // Back to process handlers
  const handleMarkBackToProcess = () => {
    setShowBackToProcessDialog(true);
  };

  const handleConfirmBackToProcess = async () => {
    if (!backToProcessComment.trim()) return;
    setIsMarkedBackToProcess(true);
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
      };
      await b2cAPI.addBackToProcess(epData);
      localStorage.setItem(`lead_marked_back_to_process_${leadId}`, JSON.stringify(true));
    }
    setBackToProcessComment('');
    setShowBackToProcessDialog(false);
  };

  // Back to process status handlers (save to localStorage)
  const handleBackToProcessContactStatusChange = (event) => {
    const newValue = event.target.value;
    setBackToProcessContactStatus(newValue);
    if (leadId) {
      const statusEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        contactStatus: newValue,
        interested: newValue === 'Yes' ? backToProcessInterested : '',
        processStatus: newValue === 'Yes' && backToProcessInterested === 'Yes' ? backToProcessStatus : '',
        reason: newValue === 'Yes' && backToProcessInterested === 'Yes' && backToProcessStatus === 'Out of Process' ? backToProcessReason : '',
        author: 'Current User'
      };
      const storageKey = `lead_back_to_process_status_history_${leadId}`;
      const existingHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedHistory = [...existingHistory, statusEntry];
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      setHasBackToProcessStatus(true);
    }
    if (newValue !== 'Yes') {
      setBackToProcessInterested('');
      setBackToProcessStatus('');
      setBackToProcessReason('');
    }
  };

  const handleBackToProcessInterestedChange = (event) => {
    const newValue = event.target.value;
    setBackToProcessInterested(newValue);
    if (leadId) {
      const statusEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        contactStatus: backToProcessContactStatus,
        interested: newValue,
        processStatus: newValue === 'Yes' ? backToProcessStatus : '',
        reason: newValue === 'Yes' && backToProcessStatus === 'Out of Process' ? backToProcessReason : '',
        author: 'Current User'
      };
      const storageKey = `lead_back_to_process_status_history_${leadId}`;
      const existingHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedHistory = [...existingHistory, statusEntry];
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      setHasBackToProcessStatus(true);
    }
    if (newValue !== 'Yes') {
      setBackToProcessStatus('');
      setBackToProcessReason('');
    }
  };

  const handleBackToProcessStatusChange = (event) => {
    const newValue = event.target.value;
    setBackToProcessStatus(newValue);
    if (leadId) {
      const statusEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        contactStatus: backToProcessContactStatus,
        interested: backToProcessInterested,
        processStatus: newValue,
        reason: newValue === 'Out of Process' ? backToProcessReason : '',
        author: 'Current User'
      };
      const storageKey = `lead_back_to_process_status_history_${leadId}`;
      const existingHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedHistory = [...existingHistory, statusEntry];
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      setHasBackToProcessStatus(true);
    }
    if (newValue !== 'Out of Process') {
      setBackToProcessReason('');
    }
  };

  const handleBackToProcessReasonChange = (event) => {
    const newValue = event.target.value;
    setBackToProcessReason(newValue);
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
      setHasBackToProcessStatus(true);
    }
  };

  // Step click handler
  const handleStepClick = (step) => {
    if (step === 'applied') {
      if (!leadId) return;
      window.open(`/lead-applications/${leadId}`, '_blank');
    } else {
      setSection('profile');
    }
  };

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return {
    // State
    contactStatus,
    interested,
    processStatus,
    reason,
    project,
    country,
    backToProcessContactStatus,
    backToProcessInterested,
    backToProcessStatus,
    backToProcessReason,
    hasBackToProcessStatus,
    activeSection,
    activeTab,
    followUpFilter,
    newComment,
    newFollowUp,
    followUpDate,
    comments,
    followUps,
    customerInterviewComments,
    newCustomerInterviewComment,
    customerInterviewContactStatus,
    customerInterviewInterested,
    customerInterviewProcessStatus,
    customerInterviewReason,
    isMarkedBackToProcess,
    showBackToProcessDialog,
    backToProcessComment,
    opportunityApplications,
    loadingApplications,
    section,
    opportunitySectionRef,
    addingComment,

    // Setters
    setActiveSection,
    setFollowUpFilter,
    setNewComment,
    setNewFollowUp,
    setFollowUpDate,
    setNewCustomerInterviewComment,
    setShowBackToProcessDialog,
    setBackToProcessComment,

    // Handlers
    handleContactStatusChange,
    handleInterestedChange,
    handleProcessStatusChange,
    handleReasonChange,
    handleProjectChange,
    handleCountryChange,
    handleAddComment,
    handleAddFollowUp,
    handleAddCustomerInterviewComment,
    handleCustomerInterviewContactStatusChange,
    handleCustomerInterviewInterestedChange,
    handleCustomerInterviewProcessStatusChange,
    handleCustomerInterviewReasonChange,
    handleMarkBackToProcess,
    handleConfirmBackToProcess,
    handleBackToProcessContactStatusChange,
    handleBackToProcessInterestedChange,
    handleBackToProcessStatusChange,
    handleBackToProcessReasonChange,
    handleStepClick,
    handleTabChange,
    addLeadComment,
  };
}

