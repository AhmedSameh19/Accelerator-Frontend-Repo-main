import React, { memo } from 'react';
import { Stack, Paper, ButtonGroup, Button, Box } from '@mui/material';
import { Comment as CommentIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import LeadInfoSectionsWrapper from './LeadInfoSectionsWrapper';
import LeadStatusSection from './LeadStatusSection';
import ICXLeadStatusSection from './ICXLeadStatusSection';
import BackToProcessStatusSection from './BackToProcessStatusSection';
import { LeadCommentsSection, LeadFollowUpsSection } from './LeadCommentsSection';
import { SECTIONS } from './LeadProfileConfig';

const CallsTab = memo(({
  leadId, lead, leadName, leadStatus, opportunitySectionRef,
  contactStatus, interested, processStatus, reason, project, country,
  icxContacted, icxInterviewed, icxExpectationsEmailStatus, icxOutOfProcess, icxReason,
  backToProcessContactStatus, backToProcessInterested, backToProcessStatus, backToProcessReason, hasBackToProcessStatus,
  activeSection, comments, newComment, followUps, followUpFilter, newFollowUp, followUpDate,
  onContactStatusChange, onInterestedChange, onProcessStatusChange, onReasonChange, onProjectChange, onCountryChange,
  onICXContactedChange, onICXInterviewedChange, onICXExpectationsEmailStatusChange, onICXOutOfProcessChange, onICXReasonChange,
  onBackToProcessContactStatusChange, onBackToProcessInterestedChange, onBackToProcessStatusChange, onBackToProcessReasonChange,
  onAddComment, onAddFollowUp, setActiveSection, setNewComment, setFollowUpFilter, setNewFollowUp, setFollowUpDate,
  isB2C, isICX, isFromBackToProcess, isFromLeadsPage, addingComment, onMarkFollowUpComplete
}) => (
  <Stack spacing={3}>
    <LeadInfoSectionsWrapper {...{ leadId, lead, leadName, leadStatus, opportunitySectionRef }} />
    {isICX ? (
      <ICXLeadStatusSection
        contacted={icxContacted}
        interviewed={icxInterviewed}
        expectationsEmailStatus={icxExpectationsEmailStatus}
        outOfProcess={icxOutOfProcess}
        reason={icxReason}
        onContactedChange={onICXContactedChange}
        onInterviewedChange={onICXInterviewedChange}
        onExpectationsEmailStatusChange={onICXExpectationsEmailStatusChange}
        onOutOfProcessChange={onICXOutOfProcessChange}
        onReasonChange={onICXReasonChange}
      />
    ) : (
      <LeadStatusSection {...{ contactStatus, interested, processStatus, reason, project, country, onContactStatusChange, onInterestedChange, onProcessStatusChange, onReasonChange, onProjectChange, onCountryChange, isB2C }} />
    )}
    {(isFromBackToProcess || hasBackToProcessStatus) && (
      <BackToProcessStatusSection {...{ backToProcessContactStatus, backToProcessInterested, backToProcessStatus, backToProcessReason, onContactStatusChange: onBackToProcessContactStatusChange, onInterestedChange: onBackToProcessInterestedChange, onStatusChange: onBackToProcessStatusChange, onReasonChange: onBackToProcessReasonChange, isB2C, isFromLeadsPage }} />
    )}
    <Paper elevation={2} sx={{ p: { xs: 1, sm: 2.5 }, borderRadius: 3, bgcolor: 'white', mt: { xs: 1, sm: 2 }, boxShadow: '0 2px 12px rgba(40,60,90,0.06)' }}>
      <ButtonGroup variant="contained" fullWidth sx={{ mb: { xs: 1, sm: 2 }, width: '100%', overflow: 'hidden' }}>
        <Button onClick={() => setActiveSection(SECTIONS.COMMENTS)} variant={activeSection === SECTIONS.COMMENTS ? 'contained' : 'outlined'} startIcon={<CommentIcon />} disabled={isB2C} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, py: { xs: 0.5, sm: 1 }, minWidth: 0, flex: 1, px: { xs: 0.5, sm: 1 } }}>Comments</Button>
        <Button onClick={() => setActiveSection(SECTIONS.FOLLOWUPS)} variant={activeSection === SECTIONS.FOLLOWUPS ? 'contained' : 'outlined'} startIcon={<ScheduleIcon />} disabled={isB2C} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, py: { xs: 0.5, sm: 1 }, minWidth: 0, flex: 1, px: { xs: 0.5, sm: 1 } }}>Follow-ups</Button>
      </ButtonGroup>
      <Box>
        {activeSection === SECTIONS.COMMENTS ? (
          <LeadCommentsSection {...{ comments, newComment, setNewComment, onAddComment, addingComment, isB2C }} />
        ) : (
          <LeadFollowUpsSection {...{ followUps, followUpFilter, setFollowUpFilter, newFollowUp, setNewFollowUp, followUpDate, setFollowUpDate, onAddFollowUp, onMarkFollowUpComplete, isB2C, lead }} />
        )}
      </Box>
    </Paper>
  </Stack>
));

CallsTab.displayName = 'CallsTab';

export default CallsTab;
