import React, { memo } from 'react';
import LeadKeyInfoCard from './LeadKeyInfoCard';
import { LeadPersonalInfo, LeadAIESECInfo, LeadEducationInfo, LeadOpportunityInfo } from './LeadInfoSections';

/**
 * Shared lead information sections wrapper
 * Used in both Calls and Customer Interviews tabs
 */
const LeadInfoSectionsWrapper = memo(({ leadId, lead, leadName, leadStatus, opportunitySectionRef }) => (
  <>
    <LeadKeyInfoCard leadId={leadId} lead={lead} leadStatus={leadStatus} />
    <LeadPersonalInfo lead={lead} leadName={leadName} />
    <LeadAIESECInfo lead={lead} leadStatus={leadStatus} />
    <LeadEducationInfo lead={lead} />
    <LeadOpportunityInfo lead={lead} opportunitySectionRef={opportunitySectionRef} />
  </>
));

LeadInfoSectionsWrapper.displayName = 'LeadInfoSectionsWrapper';

export default LeadInfoSectionsWrapper;
