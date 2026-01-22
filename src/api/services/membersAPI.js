import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchActiveMembers = async (home_lc_id, reports_to_expa_person_id) => {
  try {
    const response = await api.get(`members/by-lc/${home_lc_id}/reports-to/${reports_to_expa_person_id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching active members:', error);
    throw error;
  }
};

const normalizeMembersList = (data) => {
  if (Array.isArray(data)) return data;
  // Some backends return {} when empty
  if (data && typeof data === 'object') return [];
  return [];
};

const getMemberIdentifier = (member) => {
  // Prefer expa_person_id for reports-to recursion if present, otherwise fallback
  return (
    member?.expa_person_id ??
    member?.id ??
    member?.person_id ??
    null
  );
};

const getMemberDedupKey = (member) => {
  const id = getMemberIdentifier(member);
  return id == null ? null : String(id);
};

const getMemberRole = (member) => {
  return member?.role ?? member?.member_role ?? member?.memberRole ?? null;
};

// Fetch all members who (directly/indirectly) report to the given member.
// Stops when endpoint returns [] or {}.
export const fetchActiveMembersRecursive = async (
  home_lc_id,
  reports_to_expa_person_id,
  { maxRequests = 500 } = {}
) => {
  if (!home_lc_id || !reports_to_expa_person_id) return [];

  const seen = new Set();
  const result = [];
  const queue = [reports_to_expa_person_id];
  let requests = 0;

  while (queue.length > 0) {
    if (requests >= maxRequests) break;
    const managerId = queue.shift();
    if (managerId == null) continue;

    requests += 1;
    const data = await fetchActiveMembers(home_lc_id, managerId);
    const members = normalizeMembersList(data);
    if (members.length === 0) continue;

    for (const m of members) {
      const key = getMemberDedupKey(m);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(m);

      const role = getMemberRole(m);
      // If the member is a TM, do not recurse under them (no further API requests).
      if (String(role || '').toUpperCase() === 'TM') continue;

      const nextManagerId = getMemberIdentifier(m);
      if (nextManagerId != null) queue.push(nextManagerId);
    }
  }

  return result;
};
