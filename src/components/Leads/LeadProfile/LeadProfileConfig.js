/**
 * Configuration constants for LeadProfile component
 */

// UI Configuration
export const CONFIRMATION_TIMEOUT = 3000; // milliseconds

// Navigation states
export const NAVIGATION_STATES = {
  BACK_TO_PROCESS: 'eps-back-to-process',
  LEADS: 'leads',
};

// Tab indices
export const TABS = {
  CALLS: 0,
  CUSTOMER_INTERVIEWS: 1,
};

// Section types
export const SECTIONS = {
  COMMENTS: 'comments',
  FOLLOWUPS: 'followups',
  PROFILE: 'profile',
};

// Dialog configuration
export const DIALOG_CONFIG = {
  maxWidth: 'xs',
  fullWidth: true,
  paperSx: {
    overflowX: 'hidden',
    m: { xs: 0, sm: 2 },
    width: { xs: '100vw', sm: 'auto' },
    maxWidth: { xs: '100vw', sm: 600 },
    minHeight: { xs: '100vh', sm: 'auto' },
  },
};

// Content styling
export const CONTENT_STYLES = {
  background: 'linear-gradient(180deg, #f8fafc 0%, #e3f2fd 100%)',
  overflowX: 'hidden',
  minHeight: { xs: 'calc(100vh - 80px)', sm: 'auto' },
  padding: { xs: 0.5, sm: 3 },
};

// Tab styling
export const TAB_STYLES = {
  container: {
    '& .MuiTabs-flexContainer': {
      justifyContent: 'space-between',
    },
    '& .MuiTab-root': {
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
      fontWeight: 500,
      textTransform: 'none',
      minHeight: { xs: '40px', sm: '48px' },
      py: 1,
    },
  },
};
