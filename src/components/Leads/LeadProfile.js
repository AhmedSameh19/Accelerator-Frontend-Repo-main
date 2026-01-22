import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Box, Tabs, Tab } from '@mui/material';
import { useCRMType } from '../../context/CRMTypeContext';
import LeadProfileHeader from './LeadProfile/LeadProfileHeader';
import BackToProcessDialog from './LeadProfile/BackToProcessDialog';
import CallsTab from './LeadProfile/CallsTab';
import CustomerInterviewsTab from './LeadProfile/CustomerInterviewsTab';
import { useLeadProfileState } from './LeadProfile/useLeadProfileState';
import { NAVIGATION_STATES, TABS, CONFIRMATION_TIMEOUT, DIALOG_CONFIG, CONTENT_STYLES, TAB_STYLES } from './LeadProfile/LeadProfileConfig';

function LeadProfile({ lead, open, onClose, onStatusChange, navigationState }) {
  const { crmType } = useCRMType();
  const isB2C = crmType === 'B2C';
  const isFromBackToProcess = navigationState?.from === NAVIGATION_STATES.BACK_TO_PROCESS;
  const isFromLeadsPage = navigationState?.from === NAVIGATION_STATES.LEADS;
  const leadId = lead?.expa_person_id;
  const leadName = lead?.full_name ?? '';
  const leadStatus = lead?.expa_status ?? '';

  const {
    contactStatus, interested, processStatus, reason, project, country,
    backToProcessContactStatus, backToProcessInterested, backToProcessStatus, backToProcessReason, hasBackToProcessStatus,
    activeSection, activeTab, followUpFilter, newComment, newFollowUp, followUpDate,
    comments, followUps, customerInterviewComments, newCustomerInterviewComment,
    customerInterviewContactStatus, customerInterviewInterested, customerInterviewProcessStatus, customerInterviewReason,
    isMarkedBackToProcess, showBackToProcessDialog, backToProcessComment, opportunitySectionRef, addingComment,
    setActiveSection, setActiveTab, setFollowUpFilter, setNewComment, setNewFollowUp, setFollowUpDate,
    setNewCustomerInterviewComment, setShowBackToProcessDialog, setBackToProcessComment,
    handleContactStatusChange, handleInterestedChange, handleProcessStatusChange, handleReasonChange,
    handleProjectChange, handleCountryChange, handleAddComment, handleAddFollowUp,
    handleAddCustomerInterviewComment, handleCustomerInterviewContactStatusChange, handleCustomerInterviewInterestedChange,
    handleCustomerInterviewProcessStatusChange, handleCustomerInterviewReasonChange, handleMarkBackToProcess,
    handleConfirmBackToProcess, handleBackToProcessContactStatusChange, handleBackToProcessInterestedChange,
    handleBackToProcessStatusChange, handleBackToProcessReasonChange, handleStepClick, handleTabChange,
  } = useLeadProfileState({ lead, leadId, onStatusChange });

  const [showMarkedConfirmation, setShowMarkedConfirmation] = useState(false);

  const handleStepClickWrapper = useCallback((step) => {
    handleStepClick?.(step) || (step === 'applied' && leadId && window.open(`/lead-applications/${leadId}`, '_blank'));
  }, [handleStepClick, leadId]);

  useEffect(() => {
    if (isFromBackToProcess && activeTab === TABS.CUSTOMER_INTERVIEWS) setActiveTab(TABS.CALLS);
  }, [isFromBackToProcess, activeTab, setActiveTab]);

  const handleConfirmBackToProcessWithConfirmation = useCallback(async () => {
    await handleConfirmBackToProcess();
    setShowMarkedConfirmation(true);
    setTimeout(() => setShowMarkedConfirmation(false), CONFIRMATION_TIMEOUT);
  }, [handleConfirmBackToProcess]);

  const tabWidthStyle = useMemo(() => ({
    width: isFromBackToProcess ? '100%' : '50%',
    maxWidth: isFromBackToProcess ? '100%' : '50%',
  }), [isFromBackToProcess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth={DIALOG_CONFIG.maxWidth} fullWidth={DIALOG_CONFIG.fullWidth} slotProps={{ paper: { sx: DIALOG_CONFIG.paperSx } }}>
      <LeadProfileHeader {...{ lead, leadId, leadName, leadStatus, onClose, handleStepClick: handleStepClickWrapper }} />
      <DialogContent dividers sx={{ p: { xs: 0, sm: 0 }, ...CONTENT_STYLES }}>
        <Box sx={{ p: { xs: 0.5, sm: 3 } }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="lead profile tabs" sx={{ ...TAB_STYLES.container, '& .MuiTab-root': { ...TAB_STYLES.container['& .MuiTab-root'], ...tabWidthStyle } }}>
            <Tab label="Calls" />
            {!isFromBackToProcess && <Tab label="Customer Interviews Output" />}
          </Tabs>
          {activeTab === TABS.CALLS && (
            <CallsTab {...{
              leadId, lead, leadName, leadStatus, opportunitySectionRef,
              contactStatus, interested, processStatus, reason, project, country,
              backToProcessContactStatus, backToProcessInterested, backToProcessStatus, backToProcessReason, hasBackToProcessStatus,
              activeSection, comments, newComment, followUps, followUpFilter, newFollowUp, followUpDate,
              onContactStatusChange: handleContactStatusChange, onInterestedChange: handleInterestedChange,
              onProcessStatusChange: handleProcessStatusChange, onReasonChange: handleReasonChange,
              onProjectChange: handleProjectChange, onCountryChange: handleCountryChange,
              onBackToProcessContactStatusChange: handleBackToProcessContactStatusChange,
              onBackToProcessInterestedChange: handleBackToProcessInterestedChange,
              onBackToProcessStatusChange: handleBackToProcessStatusChange,
              onBackToProcessReasonChange: handleBackToProcessReasonChange,
              onAddComment: handleAddComment, onAddFollowUp: handleAddFollowUp,
              setActiveSection, setNewComment, setFollowUpFilter, setNewFollowUp, setFollowUpDate,
              isB2C, isFromBackToProcess, isFromLeadsPage, addingComment,
            }} />
          )}
          {!isFromBackToProcess && activeTab === TABS.CUSTOMER_INTERVIEWS && (
            <CustomerInterviewsTab {...{
              leadId, lead, leadName, leadStatus, opportunitySectionRef,
              customerInterviewContactStatus, customerInterviewInterested, customerInterviewProcessStatus, customerInterviewReason,
              customerInterviewComments, newCustomerInterviewComment, isMarkedBackToProcess,
              onCustomerInterviewContactStatusChange: handleCustomerInterviewContactStatusChange,
              onCustomerInterviewInterestedChange: handleCustomerInterviewInterestedChange,
              onCustomerInterviewProcessStatusChange: handleCustomerInterviewProcessStatusChange,
              onCustomerInterviewReasonChange: handleCustomerInterviewReasonChange,
              onAddCustomerInterviewComment: handleAddCustomerInterviewComment,
              setNewCustomerInterviewComment, onMarkBackToProcess: handleMarkBackToProcess,
              isB2C,
            }} />
          )}
        </Box>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
      <BackToProcessDialog open={showBackToProcessDialog} onClose={() => setShowBackToProcessDialog(false)} backToProcessComment={backToProcessComment} setBackToProcessComment={setBackToProcessComment} onConfirm={handleConfirmBackToProcessWithConfirmation} />
    </Dialog>
  );
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(LeadProfile); 