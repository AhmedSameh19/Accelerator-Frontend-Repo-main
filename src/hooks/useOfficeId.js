/**
 * Hook to get the current user's office/LC ID
 * Consolidates office ID resolution logic in one place
 */

import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOfficeId } from '../../utils/officeUtils';
import { MC_EGYPT_CODE } from '../../lcCodes';

/**
 * Custom hook to get the current user's office/LC ID
 * 
 * @param {Object} options - Hook options
 * @param {boolean} options.useAdminOverride - If true and user is admin, returns MC_EGYPT_CODE
 * @returns {Object} - { officeId, isAdmin, currentUser }
 */
export function useOfficeId({ useAdminOverride = false } = {}) {
  const { currentUser, isAdmin } = useAuth();

  const officeId = useMemo(() => {
    if (useAdminOverride && isAdmin) {
      return MC_EGYPT_CODE;
    }
    return getOfficeId(currentUser);
  }, [currentUser, isAdmin, useAdminOverride]);

  return {
    officeId,
    isAdmin,
    currentUser,
  };
}

export default useOfficeId;
