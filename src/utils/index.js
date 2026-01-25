/**
 * Utils Index
 * 
 * Central export point for all utility functions.
 * Import utils from here for cleaner imports.
 * 
 * @example
 * import { getOfficeId, sortData, printSelectedLeads } from '../utils';
 */

// Office utilities
export { getOfficeId, getMCCode, normalizeOfficeName } from './officeUtils';

// Sorting utilities
export { safeCompare, numericCompare, sortData } from './sortUtils';

// Print utilities
export { printSelectedLeads, generatePrintStyles, generatePrintRow } from './printUtils';

// Base API utilities
export { getApiBase, baseurl } from './apiBase';

// Auth utilities
export { isTokenValid, getTokenExpiryTime } from './authStatus';

// Token utilities
export { TOKEN_KEYS } from './tokenKeys';

// CRM utilities
export { getCRMToken, setCRMToken, clearCRMToken } from './crmToken';

// File utilities
export { fileToBase64 } from './fileToBase64';
