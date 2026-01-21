import React, { useState, useEffect } from 'react';
import { useAddLeadComment } from '../../hooks/leads/useAddLeadComment';
import {
  Dialog,
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
  useTheme,
  Stack,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  ButtonGroup,
  Autocomplete,
} from '@mui/material';
import {
  Comment as CommentIcon,
  Person as PersonIcon,
  AssignmentInd as AssignmentIndIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useCRMType } from '../../context/CRMTypeContext';
import { COUNTRY_OPTIONS, PROJECT_OPTIONS } from '../../constants/leadProfileOptions';
import LeadProfileHeader from './LeadProfile/LeadProfileHeader';
import LeadKeyInfoCard from './LeadProfile/LeadKeyInfoCard';
import { LeadPersonalInfo, LeadAIESECInfo, LeadEducationInfo, LeadOpportunityInfo } from './LeadProfile/LeadInfoSections';
import LeadStatusSection from './LeadProfile/LeadStatusSection';
import { LeadCommentsSection, LeadFollowUpsSection } from './LeadProfile/LeadCommentsSection';
import BackToProcessDialog from './LeadProfile/BackToProcessDialog';
import BackToProcessStatusSection from './LeadProfile/BackToProcessStatusSection';
import CustomerInterviewStatusSection from './LeadProfile/CustomerInterviewStatusSection';
import CustomerInterviewCommentsSection from './LeadProfile/CustomerInterviewCommentsSection';
import MarkBackToProcessSection from './LeadProfile/MarkBackToProcessSection';
import { CONTACT_STATUS_OPTIONS, INTERESTED_OPTIONS, PROCESS_STATUS_OPTIONS, REASON_OPTIONS } from './LeadProfile/constants';
import { useLeadProfileState } from './LeadProfile/useLeadProfileState';

function LeadProfile({ lead, open, onClose, onStatusChange, navigationState }) {
  const { crmType } = useCRMType();
  const isB2C = crmType === 'B2C';

  // Check if we're coming from the EPs Back to Process page
  const isFromBackToProcess = navigationState?.from === 'eps-back-to-process';
  // Check if we're coming from the leads page
  const isFromLeadsPage = navigationState?.from === 'leads';

  // Support both legacy lead shape and new backend shape
  const leadId = lead?.expa_person_id;
  const leadName = lead?.full_name ?? '';
  const leadStatus = lead?.expa_status ?? '';

  const { addComment: addLeadComment, loading: addingComment } = useAddLeadComment({ leadId });

  // Use custom hook for all state management
  const {
    // State
    contactStatus, setContactStatus,
    interested, setInterested,
    processStatus, setProcessStatus,
    reason, setReason,
    project, setProject,
    country, setCountry,
    backToProcessContactStatus, setBackToProcessContactStatus,
    backToProcessInterested, setBackToProcessInterested,
    backToProcessStatus, setBackToProcessStatus,
    backToProcessReason, setBackToProcessReason,
    hasBackToProcessStatus, setHasBackToProcessStatus,
    activeSection, setActiveSection,
    activeTab, setActiveTab,
    followUpFilter, setFollowUpFilter,
    newComment, setNewComment,
    newFollowUp, setNewFollowUp,
    followUpDate, setFollowUpDate,
    comments, setComments,
    followUps, setFollowUps,
    customerInterviewComments, setCustomerInterviewComments,
    newCustomerInterviewComment, setNewCustomerInterviewComment,
    customerInterviewContactStatus, setCustomerInterviewContactStatus,
    customerInterviewInterested, setCustomerInterviewInterested,
    customerInterviewProcessStatus, setCustomerInterviewProcessStatus,
    customerInterviewReason, setCustomerInterviewReason,
    isMarkedBackToProcess, setIsMarkedBackToProcess,
    showBackToProcessDialog, setShowBackToProcessDialog,
    backToProcessComment, setBackToProcessComment,
    opportunityApplications,
    loadingApplications,
    section, setSection,
    opportunitySectionRef,
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
  } = useLeadProfileState({ lead, leadId, onStatusChange });

  const [showMarkedConfirmation, setShowMarkedConfirmation] = useState(false);
  const theme = useTheme();

  const handleStepClickWrapper = handleStepClick || ((step) => {
    if (step === 'applied') {
      if (!leadId) return;
      window.open(`/lead-applications/${leadId}`, '_blank');
    } else {
      setSection('profile');
    }
  });

  // Fix tab when coming from back to process page
  useEffect(() => {
    if (isFromBackToProcess && activeTab === 1) {
      setActiveTab(0);
    }
  }, [isFromBackToProcess, activeTab]);

  // All state, effects, and handlers are now handled by useLeadProfileState hook

  // Use constants from extracted file
  const contactStatusOptions = CONTACT_STATUS_OPTIONS;
  const interestedOptions = INTERESTED_OPTIONS;
  const processStatusOptions = PROCESS_STATUS_OPTIONS;
  const reasonOptions = REASON_OPTIONS;
  const projectOptions = PROJECT_OPTIONS;
  const countryOptions = COUNTRY_OPTIONS;

  // Wrap handleConfirmBackToProcess to add confirmation message
  const handleConfirmBackToProcessWithConfirmation = async () => {
    await handleConfirmBackToProcess();
    setShowMarkedConfirmation(true);
    setTimeout(() => {
      setShowMarkedConfirmation(false);
    }, 3000);
  };

  useEffect(() => {
    if (isFromBackToProcess && activeTab === 1) {
      setActiveTab(0);
    }
  }, [isFromBackToProcess, activeTab]);

  // Always use OGX Realization Profile Style for all leads
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            overflowX: 'hidden',
            m: { xs: 0, sm: 2 },
            width: { xs: '100vw', sm: 'auto' },
            maxWidth: { xs: '100vw', sm: 600 },
            minHeight: { xs: '100vh', sm: 'auto' },
          }
        }
      }}
    >
      <LeadProfileHeader
        lead={lead}
        leadId={leadId}
        leadName={leadName}
        leadStatus={leadStatus}
        onClose={onClose}
        handleStepClick={handleStepClick}
      />

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
              <LeadKeyInfoCard leadId={leadId} lead={lead} leadStatus={leadStatus} />

              <LeadPersonalInfo lead={lead} leadName={leadName} />

              <LeadAIESECInfo lead={lead} leadStatus={leadStatus} />

              <LeadEducationInfo lead={lead} />

              <LeadOpportunityInfo lead={lead} opportunitySectionRef={opportunitySectionRef} />

              <LeadStatusSection
                contactStatus={contactStatus}
                interested={interested}
                processStatus={processStatus}
                reason={reason}
                project={project}
                country={country}
                onContactStatusChange={handleContactStatusChange}
                onInterestedChange={handleInterestedChange}
                onProcessStatusChange={handleProcessStatusChange}
                onReasonChange={handleReasonChange}
                onProjectChange={handleProjectChange}
                onCountryChange={handleCountryChange}
                isB2C={isB2C}
              />

              {(isFromBackToProcess || hasBackToProcessStatus) && (
                <BackToProcessStatusSection
                  backToProcessContactStatus={backToProcessContactStatus}
                  backToProcessInterested={backToProcessInterested}
                  backToProcessStatus={backToProcessStatus}
                  backToProcessReason={backToProcessReason}
                  onContactStatusChange={handleBackToProcessContactStatusChange}
                  onInterestedChange={handleBackToProcessInterestedChange}
                  onStatusChange={handleBackToProcessStatusChange}
                  onReasonChange={handleBackToProcessReasonChange}
                  isB2C={isB2C}
                  isFromLeadsPage={isFromLeadsPage}
                />
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
                    <LeadCommentsSection
                      comments={comments}
                      newComment={newComment}
                      setNewComment={setNewComment}
                      onAddComment={handleAddComment}
                      addingComment={addingComment}
                      isB2C={isB2C}
                    />
                  ) : (
                    <LeadFollowUpsSection
                      followUps={followUps}
                      followUpFilter={followUpFilter}
                      setFollowUpFilter={setFollowUpFilter}
                      newFollowUp={newFollowUp}
                      setNewFollowUp={setNewFollowUp}
                      followUpDate={followUpDate}
                      setFollowUpDate={setFollowUpDate}
                      onAddFollowUp={handleAddFollowUp}
                      isB2C={isB2C}
                    />
                  )}
                </Box>
              </Paper>
            </Stack>
          )}

          {/* Customer Interviews Output Tab */}
          {!isFromBackToProcess && activeTab === 1 && (
            <Stack spacing={3}>
              <LeadKeyInfoCard leadId={leadId} lead={lead} leadStatus={leadStatus} />

              <LeadPersonalInfo lead={lead} leadName={leadName} />

              <LeadAIESECInfo lead={lead} leadStatus={leadStatus} />

              <LeadEducationInfo lead={lead} />

              <LeadOpportunityInfo lead={lead} opportunitySectionRef={opportunitySectionRef} />

              <CustomerInterviewStatusSection
                customerInterviewContactStatus={customerInterviewContactStatus}
                customerInterviewInterested={customerInterviewInterested}
                customerInterviewProcessStatus={customerInterviewProcessStatus}
                customerInterviewReason={customerInterviewReason}
                onContactStatusChange={handleCustomerInterviewContactStatusChange}
                onInterestedChange={handleCustomerInterviewInterestedChange}
                onProcessStatusChange={handleCustomerInterviewProcessStatusChange}
                onReasonChange={handleCustomerInterviewReasonChange}
                isB2C={isB2C}
              />

              <CustomerInterviewCommentsSection
                comments={customerInterviewComments}
                newComment={newCustomerInterviewComment}
                setNewComment={setNewCustomerInterviewComment}
                onAddComment={handleAddCustomerInterviewComment}
                isB2C={isB2C}
              />

              <MarkBackToProcessSection
                isMarkedBackToProcess={isMarkedBackToProcess}
                onMarkBackToProcess={handleMarkBackToProcess}
                isB2C={isB2C}
              />
            </Stack>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      <BackToProcessDialog
        open={showBackToProcessDialog}
        onClose={() => setShowBackToProcessDialog(false)}
        backToProcessComment={backToProcessComment}
        setBackToProcessComment={setBackToProcessComment}
        onConfirm={handleConfirmBackToProcessWithConfirmation}
      />
    </Dialog>
  );
}

export default LeadProfile; 