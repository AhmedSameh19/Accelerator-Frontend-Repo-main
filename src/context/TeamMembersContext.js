import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import { fetchActiveMembersRecursive, getSyncPersonId } from '../api/services/membersAPI';
import { LC_CODES, MC_EGYPT_CODE } from '../lcCodes';

const TeamMembersContext = createContext();

const STORAGE_KEY = 'team_members';
const STORAGE_TIMESTAMP_KEY = 'team_members_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Helper to get office ID from user
function getOfficeId(currentUser) {
  if (currentUser?.current_offices?.[0]?.id) {
    return currentUser.current_offices[0].id;
  }
  const lcName = currentUser?.lc || localStorage.getItem('userLC');
  if (lcName && Array.isArray(LC_CODES)) {
    const found = LC_CODES.find((lc) => lc.name === lcName);
    if (found) return found.id;
  }
  return null;
}

export function TeamMembersProvider({ children }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const fetchingRef = useRef(false);

  // Load from localStorage on initial mount
  useEffect(() => {
    const storedMembers = localStorage.getItem(STORAGE_KEY);
    const storedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);

    if (storedMembers && storedTimestamp) {
      const timestamp = parseInt(storedTimestamp, 10);
      const now = Date.now();

      // Check if cache is still valid (within 24 hours)
      if (now - timestamp < CACHE_DURATION) {
        try {
          const parsedMembers = JSON.parse(storedMembers);
          setMembers(parsedMembers);
          setHasFetched(true);
          setLoading(false);
          console.log('📦 [TeamMembersContext] Loaded members from cache:', parsedMembers.length);
          return;
        } catch (e) {
          console.error('Failed to parse stored members:', e);
          // Clear invalid data
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
        }
      } else {
        // Cache expired, clear it
        console.log('⏰ [TeamMembersContext] Cache expired, clearing...');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Fetch members from API
  const fetchMembers = useCallback(async (currentUser, isAdmin = false, forceRefresh = false) => {
    // Skip if already fetching
    if (fetchingRef.current) {
      console.log('🔄 [TeamMembersContext] Already fetching, skipping...');
      return members;
    }

    // Skip if already fetched and not forcing refresh
    if (hasFetched && !forceRefresh && members.length > 0) {
      console.log('✅ [TeamMembersContext] Using cached members:', members.length);
      return members;
    }

    const lcCode = isAdmin ? MC_EGYPT_CODE : getOfficeId(currentUser);
    const personId = Cookies.get('person_id');

    if (!lcCode || !personId) {
      console.warn('⚠️ [TeamMembersContext] No LC code or person_id available');
      setLoading(false);
      return [];
    }

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 [TeamMembersContext] Fetching members from API...');
      let altPersonId = null;
      if (currentUser?.token) {
        altPersonId = await getSyncPersonId(currentUser.token);
      }
      const effectivePersonId = altPersonId || personId;
      const teamMembers = await fetchActiveMembersRecursive(lcCode, effectivePersonId);

      // Store in localStorage with timestamp
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teamMembers));
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());

      setMembers(teamMembers);
      setHasFetched(true);
      setLoading(false);
      fetchingRef.current = false;
      console.log('✅ [TeamMembersContext] Fetched and cached members:', teamMembers.length);
      return teamMembers;
    } catch (e) {
      console.error('❌ [TeamMembersContext] Failed to fetch team members:', e);
      setError(e);
      setMembers([]);
      setLoading(false);
      fetchingRef.current = false;
      return [];
    }
  }, [hasFetched, members]);

  // Clear members (useful for logout)
  const clearMembers = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
    setMembers([]);
    setHasFetched(false);
    setError(null);
    fetchingRef.current = false;
    console.log('🧹 [TeamMembersContext] Cleared members cache');
  }, []);

  // Refresh members (force fetch from API)
  const refreshMembers = useCallback(async (currentUser, isAdmin = false) => {
    return fetchMembers(currentUser, isAdmin, true);
  }, [fetchMembers]);

  const value = {
    members,
    loading,
    error,
    hasFetched,
    fetchMembers,
    refreshMembers,
    clearMembers,
  };

  return (
    <TeamMembersContext.Provider value={value}>
      {children}
    </TeamMembersContext.Provider>
  );
}

export function useTeamMembersContext() {
  const context = useContext(TeamMembersContext);
  if (!context) {
    throw new Error('useTeamMembersContext must be used within a TeamMembersProvider');
  }
  return context;
}

export default TeamMembersContext;
