/**
 * Utility functions for office/LC management
 * Used across LeadsPage, OGXRealizationsPage, and other components
 */

import Cookies from 'js-cookie';
import { LC_CODES } from '../lcCodes';

/**
 * Get office ID from current user object
 * Tries multiple sources: current_offices, lc name from user/localStorage/cookies
 * 
 * @param {Object} currentUser - The current user object from AuthContext
 * @returns {number|null} - The office/LC ID or null if not found
 */
export function getOfficeId(currentUser) {
  // 1. Try current_offices from user object (most reliable)
  if (currentUser?.current_offices?.[0]?.id) {
    return currentUser.current_offices[0].id;
  }

  // 2. Try LC name from various sources
  const lcName = currentUser?.lc || 
                 currentUser?.userLC || 
                 localStorage.getItem('userLC') ||
                 Cookies.get('userLC') ||
                 null;

  // 3. Try to find LC ID from LC_CODES
  if (lcName && Array.isArray(LC_CODES)) {
    const found = LC_CODES.find((lc) => 
      lc.name === lcName || 
      lc.name?.toLowerCase() === lcName?.toLowerCase() ||
      lc.id?.toString() === lcName?.toString()
    );
    if (found) {
      return found.id;
    }
  }

  return null;
}

/**
 * Get LC name from LC ID using LC_CODES
 * 
 * @param {number} lcId - The LC ID to look up
 * @returns {string|null} - The LC name or null if not found
 */
export function getLCNameById(lcId) {
  if (!lcId || !Array.isArray(LC_CODES)) return null;
  const lc = LC_CODES.find(lc => lc.id === lcId);
  return lc ? lc.name : null;
}

/**
 * Get LC ID from LC name using LC_CODES
 * 
 * @param {string} lcName - The LC name to look up
 * @returns {number|null} - The LC ID or null if not found
 */
export function getLCIdByName(lcName) {
  if (!lcName || !Array.isArray(LC_CODES)) return null;
  const lc = LC_CODES.find(lc => 
    lc.name === lcName || 
    lc.name?.toLowerCase() === lcName?.toLowerCase()
  );
  return lc ? lc.id : null;
}
