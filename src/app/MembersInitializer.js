import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTeamMembersContext } from '../context/TeamMembersContext';

/**
 * Runs once when the user is authenticated.
 * Triggers the member fetch from the TeamMembersContext so that all pages
 * (OGX/ICX leads, realizations, market research) share a single cached
 * fetch — stored in localStorage for 24 hours.
 *
 * This must be rendered inside both AuthProvider and TeamMembersProvider.
 */
export default function MembersInitializer() {
  const { currentUser, isAdmin } = useAuth();
  const { fetchMembers, hasFetched } = useTeamMembersContext();

  useEffect(() => {
    if (currentUser && !hasFetched) {
      fetchMembers(currentUser, isAdmin);
    }
  }, [currentUser, isAdmin, hasFetched, fetchMembers]);

  return null;
}
