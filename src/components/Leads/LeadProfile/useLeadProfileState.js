import { useState, useEffect, useRef } from 'react';
import leadsApi from '../../../api/services/leadsApi';
import b2cAPI from '../../../api/services/b2cAPI';
import { fetchOpportunityApplications } from '../../../api/services/aiesecApi';
import { useAddLeadComment } from '../../../hooks/leads/useAddLeadComment';

export function useLeadProfileState({ lead, leadId, icxApplicationId = null, onStatusChange, isICX = false }) {
  const { addComment: addLeadComment, loading: addingComment } = useAddLeadComment({
    leadId,
    icxApplicationId,
    isICX,
  });

  const normalizeYesNo = (value) => {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return value || '';
  };

  // Regular lead status states
  const [contactStatus, setContactStatus] = useState('');
  const [interested, setInterested] = useState('');
  const [processStatus, setProcessStatus] = useState('');
  const [reason, setReason] = useState('');
  const [project, setProject] = useState('');
  const [country, setCountry] = useState('');

  // iCX lead status states
  const [icxContacted, setIcxContacted] = useState('');
  const [icxInterviewed, setIcxInterviewed] = useState('');
  const [icxExpectationsEmailStatus, setIcxExpectationsEmailStatus] = useState('');
  const [icxOutOfProcess, setIcxOutOfProcess] = useState('');
  const [icxReason, setIcxReason] = useState('');

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
    if (isICX && !icxApplicationId) return;

    // Reset all states
    setContactStatus('');
    setInterested('');
    setProcessStatus('');
    setReason('');
    setProject('');
    setCountry('');

    setIcxContacted('');
    setIcxInterviewed('');
    setIcxExpectationsEmailStatus('');
    setIcxOutOfProcess('');
    setIcxReason('');
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
        const response = isICX
          ? await leadsApi.getICXComments(icxApplicationId)
          : await leadsApi.getComments(leadId);
        setComments(response || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    const fetchCustomerInterviewsComments = async () => {
      try {
        const comments = await b2cAPI.getComments(leadId);
        // Backend returns array directly, normalize to our expected format
        const normalizedComments = Array.isArray(comments) ? comments.map(comment => ({
          id: comment.id,
          text: comment.comment || comment.text,
          created_at: comment.created_at,
          author: comment.creator_name || comment.author || 'Unknown'
        })) : [];
        setCustomerInterviewComments(normalizedComments);
      } catch (error) {
        console.error('Error fetching customer interview comments:', error);
        setCustomerInterviewComments([]);
      }
    };

    const fetchCustomerInterviewStatus = async () => {
      try {
        const response = await b2cAPI.getCustomerInterviewStatus(leadId);
        console.log('🔍 [useLeadProfileState] Fetched customer interview status:', response);
        if (response && typeof response === 'object') {
          // Backend returns fields directly (contact_status, interested, process_status, reason)
          setCustomerInterviewContactStatus(response.contact_status || '');
          setCustomerInterviewInterested(response.interested || '');
          setCustomerInterviewProcessStatus(response.process_status || '');
          setCustomerInterviewReason(response.reason || '');
        }
      } catch (error) {
        console.error('Error fetching customer interview status:', error);
        // If endpoint doesn't exist yet, fall back to localStorage
        const storedCustomerInterviewStatus = localStorage.getItem(customerInterviewStorageKey);
        if (storedCustomerInterviewStatus) {
          const status = JSON.parse(storedCustomerInterviewStatus);
          setCustomerInterviewContactStatus(status.contactStatus || '');
          setCustomerInterviewInterested(status.interested || '');
          setCustomerInterviewProcessStatus(status.processStatus || '');
          setCustomerInterviewReason(status.reason || '');
        }
      }
    };

    const fetchContactStatus = async () => {
      try {
        const data = isICX
          ? await leadsApi.getICXLeadStatus(icxApplicationId)
          : await leadsApi.getContactStatus(leadId);
        if (data) {
          if (isICX) {
            setIcxContacted(normalizeYesNo(data.contacted));
            setIcxInterviewed(normalizeYesNo(data.interviewed));
            setIcxExpectationsEmailStatus(data.expectations_email_status || '');
            setIcxOutOfProcess(normalizeYesNo(data.out_of_process));
            setIcxReason(data.reason || '');
          } else {
            setContactStatus(data.contact_status || '');
            setInterested(data.interested || '');
            setProcessStatus(data.process_status || '');
            setReason(data.reason || '');
            setProject(data.project || '');
            setCountry(data.country || '');
          }
        }
      } catch (error) {
        console.error('Error fetching contact status:', error);
      }
    };

    const fetchFollowUps = async () => {
      try {
        const response = isICX
          ? await leadsApi.getICXFollowUps(icxApplicationId)
          : await leadsApi.getFollowUps(leadId);
        // Handle different response formats: array, { data: array }, or { data: { data: array } }
        let followUpsArray = [];
        if (Array.isArray(response)) {
          followUpsArray = response;
        } else if (response?.data) {
          followUpsArray = Array.isArray(response.data) ? response.data : [];
        }
        setFollowUps(followUpsArray);
      } catch (error) {
        console.error('Failed to fetch follow-ups:', error);
      }
    };

    fetchComments();
    fetchCustomerInterviewsComments();
    fetchContactStatus();
    fetchFollowUps();
    fetchCustomerInterviewStatus();
  }, [leadId, icxApplicationId, isICX]);

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

  // Note: Customer interview status is now saved to backend via API calls in handlers
  // localStorage is only used as fallback when fetching from backend fails

  // Helper function to fetch and update status from backend
  const fetchAndUpdateStatus = async () => {
    if (!leadId) return;
    if (isICX && !icxApplicationId) return;
    try {
      const data = isICX
        ? await leadsApi.getICXLeadStatus(icxApplicationId)
        : await leadsApi.getContactStatus(leadId);
      if (data) {
        if (isICX) {
          setIcxContacted(normalizeYesNo(data.contacted));
          setIcxInterviewed(normalizeYesNo(data.interviewed));
          setIcxExpectationsEmailStatus(data.expectations_email_status || '');
          setIcxOutOfProcess(normalizeYesNo(data.out_of_process));
          setIcxReason(data.reason || '');
        } else {
          setContactStatus(data.contact_status || '');
          setInterested(data.interested || '');
          setProcessStatus(data.process_status || '');
          setReason(data.reason || '');
          setProject(data.project || '');
          setCountry(data.country || '');
        }
        console.log('✅ Status updated from backend:', data);
      }
    } catch (error) {
      console.error('Error fetching updated status:', error);
    }
  };

  // Handlers for status changes
  const handleContactStatusChange = async (event) => {
    if (!leadId) return;
    if (isICX) return;
    const value = event.target.value;
    setContactStatus(value);
    
    if (value.toLowerCase() !== 'yes') {
      setInterested('');
      setProcessStatus('');
      setReason('');
      setProject('');
      setCountry('');
    }
    
    try {
      await leadsApi.updateLeadStatus(leadId, { contact_status: value });
      // Fetch updated status from backend to ensure UI matches backend state
      await fetchAndUpdateStatus();
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  // iCX status handlers
  const handleICXContactedChange = async (event) => {
    if (!leadId) return;
    if (!icxApplicationId) return;
    const value = event.target.value;
    setIcxContacted(value);

    if (value !== 'Yes') {
      setIcxInterviewed('');
      setIcxExpectationsEmailStatus('');
    }

    try {
      await leadsApi.patchICXLeadStatus(icxApplicationId, { contacted: value });
      await fetchAndUpdateStatus();
    } catch (error) {
      console.error('Error updating iCX contacted status:', error);
    }
  };

  const handleICXInterviewedChange = async (event) => {
    if (!leadId) return;
    if (!icxApplicationId) return;
    const value = event.target.value;
    setIcxInterviewed(value);

    if (value !== 'Yes') {
      setIcxExpectationsEmailStatus('');
    }

    try {
      await leadsApi.patchICXLeadStatus(icxApplicationId, { interviewed: value });
      await fetchAndUpdateStatus();
    } catch (error) {
      console.error('Error updating iCX interviewed status:', error);
    }
  };

  const handleICXExpectationsEmailStatusChange = async (event) => {
    if (!leadId) return;
    if (!icxApplicationId) return;
    const value = event.target.value;
    setIcxExpectationsEmailStatus(value);

    try {
      await leadsApi.patchICXLeadStatus(icxApplicationId, { expectations_email_status: value });
      await fetchAndUpdateStatus();
    } catch (error) {
      console.error('Error updating iCX expectations email status:', error);
    }
  };

  const handleICXOutOfProcessChange = async (event) => {
    if (!leadId) return;
    if (!icxApplicationId) return;
    const value = event.target.value;
    setIcxOutOfProcess(value);

    if (value !== 'Yes') {
      setIcxReason('');
    }

    try {
      await leadsApi.patchICXLeadStatus(icxApplicationId, { out_of_process: value });
      await fetchAndUpdateStatus();
    } catch (error) {
      console.error('Error updating iCX out of process:', error);
    }
  };

  const handleICXReasonChange = async (event) => {
    if (!leadId) return;
    if (!icxApplicationId) return;
    const value = event.target.value;
    setIcxReason(value);

    try {
      await leadsApi.patchICXLeadStatus(icxApplicationId, { reason: value });
      await fetchAndUpdateStatus();
    } catch (error) {
      console.error('Error updating iCX reason:', error);
    }
  };

  const handleInterestedChange = async (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setInterested(value);
    
    if (value.toLowerCase() !== 'yes') {
      setProcessStatus('');
      setReason('');
      setProject('');
      setCountry('');
    }
    
    try {
      await leadsApi.updateLeadStatus(leadId, { interested: value });
      // Fetch updated status from backend to ensure UI matches backend state
      await fetchAndUpdateStatus();
    } catch (error) {
      console.error('Error updating interested status:', error);
    }
  };

  const handleProcessStatusChange = async (event) => {
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
    
    try {
      await leadsApi.updateLeadStatus(leadId, { process_status: value });
      // Fetch updated status from backend to ensure UI matches backend state
      await fetchAndUpdateStatus();
    } catch (error) {
      console.error('Error updating process status:', error);
    }
  };

  const handleReasonChange = async (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setReason(value);
    try {
      await leadsApi.updateLeadStatus(leadId, { reason: value });
      // Fetch updated status from backend to ensure UI matches backend state
      await fetchAndUpdateStatus();
    } catch (error) {
      console.error('Error updating reason:', error);
    }
  };

  const handleProjectChange = async (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setProject(value);
    try {
      await leadsApi.updateLeadStatus(leadId, { project: value });
      // Fetch updated status from backend to ensure UI matches backend state
      await fetchAndUpdateStatus();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleCountryChange = async (event, newValue) => {
    if (!leadId) return;
    const value = newValue || '';
    setCountry(value);
    try {
      await leadsApi.updateLeadStatus(leadId, { country: value });
      // Fetch updated status from backend to ensure UI matches backend state
      await fetchAndUpdateStatus();
    } catch (error) {
      console.error('Error updating country:', error);
    }
  };

  // Handler for adding comments
  const handleAddComment = async () => {
    const effectiveId = isICX ? icxApplicationId : leadId;
    if (!effectiveId || !newComment.trim()) return;
    const text = newComment.trim();
    await addLeadComment(text);
    setNewComment('');
    try {
      const fresh = isICX
        ? await leadsApi.getICXComments(icxApplicationId)
        : await leadsApi.getComments(leadId);
      setComments(Array.isArray(fresh) ? fresh : []);
    } catch (e) {
      // keep existing comments if refresh fails
    }
  };

  // Handler for adding follow-ups
  const handleAddFollowUp = async () => {
    const effectiveId = isICX ? icxApplicationId : leadId;
    if (!effectiveId || !newFollowUp.trim() || !followUpDate) return;
    try {
      const followUpAtDate = new Date(followUpDate);
      if (Number.isNaN(followUpAtDate.getTime())) {
        alert('Please select a valid follow-up date/time.');
        return;
      }

      const followUpData = {
        text: newFollowUp,
        next_follow_up_date: followUpAtDate.toISOString(),
        lead_name: lead?.full_name,
        lead_phone: lead?.phone
      };
      const response = isICX
        ? await leadsApi.createICXFollowUp(icxApplicationId, followUpData)
        : await leadsApi.createFollowUp(leadId, followUpData);
      // Handle different response formats
      const createdFollowUp = response?.data || response;
      if (createdFollowUp) {
        setFollowUps((prev) => [createdFollowUp, ...prev]);
      } else {
        // Refresh the list if response format is unexpected
        const updatedFollowUps = isICX
          ? await leadsApi.getICXFollowUps(icxApplicationId)
          : await leadsApi.getFollowUps(leadId);
        setFollowUps(updatedFollowUps || []);
      }
      setNewFollowUp('');
      setFollowUpDate('');
    } catch (error) {
      console.error('Failed to create follow-up:', error);

      const backendMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to schedule follow-up.';
      alert(backendMessage);
    }
  };

  // Handler for marking follow-up as completed
  const handleMarkFollowUpComplete = async (followUp) => {
    const effectiveId = isICX ? icxApplicationId : leadId;
    if (!effectiveId || !followUp?.id) return;
    try {
      if (isICX) {
        await leadsApi.updateICXFollowUpStatus(icxApplicationId, followUp.id);
      } else {
        await leadsApi.updateFollowUp(leadId, followUp.id);
      }
      // Refresh follow-ups list
      const response = isICX
        ? await leadsApi.getICXFollowUps(icxApplicationId)
        : await leadsApi.getFollowUps(leadId);
      // Handle different response formats
      let followUpsArray = [];
      if (Array.isArray(response)) {
        followUpsArray = response;
      } else if (response?.data) {
        followUpsArray = Array.isArray(response.data) ? response.data : [];
      }
      setFollowUps(followUpsArray);
    } catch (error) {
      console.error('Failed to mark follow-up as completed:', error);
    }
  };

  // Handler for customer interview comments
  const handleAddCustomerInterviewComment = async (commentText) => {
    // Use provided commentText or fall back to state
    const textToSubmit = commentText || newCustomerInterviewComment;
    if (!leadId || !textToSubmit?.trim()) {
      throw new Error('Comment text is required');
    }
    
    // Add the comment
    let commentAdded = false;
    try {
      const response = await b2cAPI.addComment(leadId, textToSubmit.trim());
      // Only clear input if we got a successful response
      if (response || response === undefined) {
        setNewCustomerInterviewComment('');
        commentAdded = true;
      }
    } catch (error) {
      console.error('Error adding customer interview comment:', error);
      // Re-throw error so component can handle it
      throw error;
    }
    
    // Only try to refresh if comment was successfully added
    if (!commentAdded) {
      return;
    }
    
    // Try to refresh comments list, but don't fail if this doesn't work
    // The comment was already successfully added
    try {
      const comments = await b2cAPI.getComments(leadId);
      // Backend returns array directly, normalize to our expected format
      const normalizedComments = Array.isArray(comments) ? comments.map(comment => ({
        id: comment.id,
        text: comment.comment || comment.text,
        created_at: comment.created_at,
        author: comment.creator_name || comment.author || 'Unknown'
      })) : [];
      setCustomerInterviewComments(normalizedComments);
    } catch (refreshError) {
      console.warn('Failed to refresh comments list, but comment was added:', refreshError);
      // Add the comment optimistically to the list
      const optimisticComment = {
        id: Date.now(),
        text: textToSubmit.trim(),
        created_at: new Date().toISOString(),
        author: 'You'
      };
      setCustomerInterviewComments(prev => [optimisticComment, ...prev]);
    }
  };

  // Helper function to fetch and update customer interview status from backend
  const fetchAndUpdateCustomerInterviewStatus = async () => {
    if (!leadId) return;
    try {
      const data = await b2cAPI.getCustomerInterviewStatus(leadId);
      console.log('🔍 [useLeadProfileState] Fetching updated customer interview status:', data);
      if (data && typeof data === 'object') {
        // Backend returns fields directly from B2CLeadStatusSnapshot model
        setCustomerInterviewContactStatus(data.contact_status || '');
        setCustomerInterviewInterested(data.interested || '');
        setCustomerInterviewProcessStatus(data.process_status || '');
        setCustomerInterviewReason(data.reason || '');
        console.log('✅ Customer Interview Status updated from backend:', {
          contact_status: data.contact_status,
          interested: data.interested,
          process_status: data.process_status,
          reason: data.reason
        });
      }
    } catch (error) {
      console.error('Error fetching updated customer interview status:', error);
    }
  };

  // Handlers for customer interview status
  const handleCustomerInterviewContactStatusChange = async (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setCustomerInterviewContactStatus(value);
    
    let updatedInterested = customerInterviewInterested;
    let updatedProcessStatus = customerInterviewProcessStatus;
    let updatedReason = customerInterviewReason;
    
    if (value.toLowerCase() !== 'yes') {
      updatedInterested = '';
      updatedProcessStatus = '';
      updatedReason = '';
      setCustomerInterviewInterested('');
      setCustomerInterviewProcessStatus('');
      setCustomerInterviewReason('');
    }
    
    try {
      const result = await b2cAPI.updateCustomerInterviewStatus(leadId, {
        contact_status: value,
        interested: updatedInterested,
        process_status: updatedProcessStatus,
        reason: updatedReason,
      });
      console.log('✅ [useLeadProfileState] Customer interview contact status updated:', result);
      // Fetch updated status from backend to ensure UI matches backend state
      await fetchAndUpdateCustomerInterviewStatus();
    } catch (error) {
      console.error('❌ [useLeadProfileState] Error updating customer interview contact status:', error);
      // Show error to user - you might want to add a snackbar notification here
      alert(`Failed to save status: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCustomerInterviewInterestedChange = async (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setCustomerInterviewInterested(value);
    
    let updatedProcessStatus = customerInterviewProcessStatus;
    let updatedReason = customerInterviewReason;
    
    if (value.toLowerCase() !== 'yes') {
      updatedProcessStatus = '';
      updatedReason = '';
      setCustomerInterviewProcessStatus('');
      setCustomerInterviewReason('');
    }
    
    try {
      const result = await b2cAPI.updateCustomerInterviewStatus(leadId, {
        contact_status: customerInterviewContactStatus,
        interested: value,
        process_status: updatedProcessStatus,
        reason: updatedReason,
      });
      console.log('✅ [useLeadProfileState] Customer interview interested status updated:', result);
      // Fetch updated status from backend to ensure UI matches backend state
      await fetchAndUpdateCustomerInterviewStatus();
    } catch (error) {
      console.error('❌ [useLeadProfileState] Error updating customer interview interested status:', error);
      alert(`Failed to save status: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCustomerInterviewProcessStatusChange = async (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setCustomerInterviewProcessStatus(value);
    
    let updatedReason = customerInterviewReason;
    
    if (value.toLowerCase() !== 'out of process') {
      updatedReason = '';
      setCustomerInterviewReason('');
    }
    
    try {
      const result = await b2cAPI.updateCustomerInterviewStatus(leadId, {
        contact_status: customerInterviewContactStatus,
        interested: customerInterviewInterested,
        process_status: value,
        reason: updatedReason,
      });
      console.log('✅ [useLeadProfileState] Customer interview process status updated:', result);
      // Fetch updated status from backend to ensure UI matches backend state
      await fetchAndUpdateCustomerInterviewStatus();
    } catch (error) {
      console.error('❌ [useLeadProfileState] Error updating customer interview process status:', error);
      alert(`Failed to save status: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCustomerInterviewReasonChange = async (event) => {
    if (!leadId) return;
    const value = event.target.value;
    setCustomerInterviewReason(value);
    
    try {
      const result = await b2cAPI.updateCustomerInterviewStatus(leadId, {
        contact_status: customerInterviewContactStatus,
        interested: customerInterviewInterested,
        process_status: customerInterviewProcessStatus,
        reason: value,
      });
      console.log('✅ [useLeadProfileState] Customer interview reason updated:', result);
      // Fetch updated status from backend to ensure UI matches backend state
      await fetchAndUpdateCustomerInterviewStatus();
    } catch (error) {
      console.error('❌ [useLeadProfileState] Error updating customer interview reason:', error);
      alert(`Failed to save status: ${error.message || 'Unknown error'}`);
    }
  };

  // Back to process handlers
  const handleMarkBackToProcess = () => {
    setShowBackToProcessDialog(true);
  };

  const handleConfirmBackToProcess = async () => {
    if (!backToProcessComment.trim()) return;
    
    if (!leadId) {
      console.error('Cannot mark lead back to process: leadId is missing');
      return;
    }
    
    try {
      // Backend expects only expa_person_id in the payload
      // The backend will fetch all lead data from the database
      await b2cAPI.addBackToProcess(leadId);
      
      // Mark as successful in local state
      setIsMarkedBackToProcess(true);
      localStorage.setItem(`lead_marked_back_to_process_${leadId}`, JSON.stringify(true));
      
      // Clear the comment and close dialog
      setBackToProcessComment('');
      setShowBackToProcessDialog(false);
      
      console.log('✅ Lead successfully marked back to process');
    } catch (error) {
      console.error('❌ Error marking lead back to process:', error);
      // Show error to user (you might want to add a snackbar/alert here)
      alert(error.message || 'Failed to mark lead back to process. Please try again.');
      // Don't close the dialog on error so user can retry
    }
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

    icxContacted,
    icxInterviewed,
    icxExpectationsEmailStatus,
    icxOutOfProcess,
    icxReason,
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

    handleICXContactedChange,
    handleICXInterviewedChange,
    handleICXExpectationsEmailStatusChange,
    handleICXOutOfProcessChange,
    handleICXReasonChange,
    handleAddComment,
    handleAddFollowUp,
    handleMarkFollowUpComplete,
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

