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

/**
 * Resolve current user's person id in sync format (for alt_person_id when cookie uses different format).
 * Call with Authorization: Bearer <expa_access_token>.
 */
export const getSyncPersonId = async (accessToken) => {
  if (!accessToken) return null;
  try {
    const response = await api.get('members/me/sync-person-id', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data?.sync_person_id ?? null;
  } catch (e) {
    return null;
  }
};

/**
 * Fetch only the members who report to the currently authenticated user (EXPA token).
 * Uses GET /members/me/reports so the backend resolves "me" from the token – no path param.
 * Returns one level (direct reports only). Use fetchActiveMembersRecursiveFromToken for full tree.
 */
export const fetchMyReports = async (accessToken) => {
  if (!accessToken) return [];
  try {
    const response = await api.get('members/me/reports', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (e) {
    console.error('Error fetching my reports:', e);
    return [];
  }
};

export const fetchActiveMembers = async (home_lc_id, reports_to_expa_person_id, options = {}) => {
  try {
    const params = {};
    if (options.alt_person_id) params.alt_person_id = options.alt_person_id;
    const response = await api.get(
      `members/by-lc/${home_lc_id}/reports-to/${reports_to_expa_person_id}`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching active members:', error);
    throw error;
  }
};

/** Fetch all members in an LC. Use as fallback when reports-to returns empty (e.g. EXPA org structure not set). */
export const fetchMembersByLc = async (home_lc_id) => {
  if (!home_lc_id) return [];
  try {
    const response = await api.get(`members/by-lc/${home_lc_id}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching members by LC:', error);
    return [];
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
// Stops when endpoint returns [] or {}. Pass alt_person_id when cookie person id format differs from sync.
export const fetchActiveMembersRecursive = async (
  home_lc_id,
  reports_to_expa_person_id,
  { maxRequests = 500, alt_person_id = null } = {}
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
    const useAlt = managerId === reports_to_expa_person_id ? alt_person_id : null;
    const data = await fetchActiveMembers(home_lc_id, managerId, { alt_person_id: useAlt || undefined });
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

/**
 * Fetch all members who report to the logged-in user (TLs, TMs, LCVPs in your tree).
 * First request uses GET /members/me/reports (backend resolves "me" from token), so you
 * always get only your reporters, never the whole LC.
 */
export const fetchActiveMembersRecursiveFromToken = async (home_lc_id, accessToken, { maxRequests = 500 } = {}) => {
  if (!home_lc_id || !accessToken) return [];

  const seen = new Set();
  const result = [];
  const directReports = await fetchMyReports(accessToken);
  const queue = [];
  for (const m of directReports) {
    const key = getMemberDedupKey(m);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(m);
    const role = getMemberRole(m);
    if (String(role || '').toUpperCase() !== 'TM') queue.push(getMemberIdentifier(m));
  }
  let requests = 0;
  while (queue.length > 0) {
    if (requests >= maxRequests) break;
    const managerId = queue.shift();
    if (managerId == null) continue;
    requests += 1;
    const data = await fetchActiveMembers(home_lc_id, managerId, {});
    const members = normalizeMembersList(data);
    if (members.length === 0) continue;
    for (const m of members) {
      const key = getMemberDedupKey(m);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(m);
      const role = getMemberRole(m);
      if (String(role || '').toUpperCase() === 'TM') continue;
      const nextManagerId = getMemberIdentifier(m);
      if (nextManagerId != null) queue.push(nextManagerId);
    }
  }
  return result;
};
