import { useEffect, useRef, useState } from 'react';

import Cookies from 'js-cookie';

import { fetchActiveMembersRecursive } from '../../../api/services/membersAPI';

export function useTeamMembers({ homeLcId }) {
  const fetchedRef = useRef(false);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      if (fetchedRef.current) return;

      const reportsToId = Cookies.get('person_id');
      if (!homeLcId || !reportsToId) return;

      fetchedRef.current = true;

      try {
        setError(null);
        const teamMembers = await fetchActiveMembersRecursive(homeLcId, reportsToId);
        setMembers(Array.isArray(teamMembers) ? teamMembers : []);
      } catch (e) {
        setError(e);
        setMembers([]);
      }
    };

    run();
  }, [homeLcId]);

  return { members, error };
}
