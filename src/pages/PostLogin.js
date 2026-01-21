import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { API_BASE } from '../utils/apiBase';
import { getCrmAccessToken } from '../utils/crmToken';

export default function PostLogin() {
  const [to, setTo] = useState(null);

  useEffect(() => {
    const token = getCrmAccessToken();
    if (!token) {
      setTo('/login');
      return;
    }

    fetch(`${API_BASE}/api/auth/resolve-dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(j => setTo(j?.redirect || '/'))
      .catch(() => setTo('/login'));
  }, []);

  if (!to) return <div>Loading your dashboard…</div>;

  return <Navigate to={to} replace />;
}

