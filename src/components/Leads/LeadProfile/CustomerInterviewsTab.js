import React, { memo } from 'react';
import { Stack } from '@mui/material';
import LeadInfoSectionsWrapper from './LeadInfoSectionsWrapper';
import CustomerInterviewStatusSection from './CustomerInterviewStatusSection';
import CustomerInterviewCommentsSection from './CustomerInterviewCommentsSection';
import MarkBackToProcessSection from './MarkBackToProcessSection';

const CustomerInterviewsTab = memo(({
  leadId, lead, leadName, leadStatus, opportunitySectionRef,
  customerInterviewContactStatus, customerInterviewInterested, customerInterviewProcessStatus, customerInterviewReason,
  customerInterviewComments, newCustomerInterviewComment, isMarkedBackToProcess,
  onCustomerInterviewContactStatusChange, onCustomerInterviewInterestedChange, onCustomerInterviewProcessStatusChange, onCustomerInterviewReasonChange,
  onAddCustomerInterviewComment, setNewCustomerInterviewComment, onMarkBackToProcess,
  isB2C,
}) => (
  <Stack spacing={3}>
    <LeadInfoSectionsWrapper {...{ leadId, lead, leadName, leadStatus, opportunitySectionRef }} />
    <CustomerInterviewStatusSection {...{ customerInterviewContactStatus, customerInterviewInterested, customerInterviewProcessStatus, customerInterviewReason, onContactStatusChange: onCustomerInterviewContactStatusChange, onInterestedChange: onCustomerInterviewInterestedChange, onProcessStatusChange: onCustomerInterviewProcessStatusChange, onReasonChange: onCustomerInterviewReasonChange, isB2C }} />
    <CustomerInterviewCommentsSection {...{ comments: customerInterviewComments, newComment: newCustomerInterviewComment, setNewComment: setNewCustomerInterviewComment, onAddComment: onAddCustomerInterviewComment, isB2C }} />
    <MarkBackToProcessSection {...{ isMarkedBackToProcess, onMarkBackToProcess, isB2C }} />
  </Stack>
));

CustomerInterviewsTab.displayName = 'CustomerInterviewsTab';

export default CustomerInterviewsTab;
