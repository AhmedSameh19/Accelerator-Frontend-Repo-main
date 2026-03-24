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

  if (!to) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #1976d2', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ fontFamily: 'Inter, sans-serif', color: '#666' }}>Loading your dashboard…</div>
        </div>
      </div>
    );
  }

  return <Navigate to={to} replace />;
}

