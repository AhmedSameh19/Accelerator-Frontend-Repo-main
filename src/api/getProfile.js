import { API_BASE } from '../utils/apiBase';
import { getCrmAccessToken } from '../utils/crmToken';

export async function getProfile() {
  const token = getCrmAccessToken();
  if (!token) return null;

  try {
    const r = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    });
    if (!r.ok) return null;

    const contentType = r.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn('Unexpected profile response content-type:', contentType);
      return null;
    }

    const j = await r.json();
    return j?.user || null; // expects { user: { role, mc_code, lc_code, lc_name, ... } }
  } catch (err) {
    console.error('Failed to fetch profile', err);
    return null;
  }
}
