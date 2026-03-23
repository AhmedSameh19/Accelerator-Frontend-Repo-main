import { API_BASE } from './apiBase';

export async function isAuthenticated() {
  console.log('🔍 [authStatus] isAuthenticated() called');
  console.log('🔍 [authStatus] Current cookies:', document.cookie);
  
  try {
    // Use API_BASE from apiBase.js, append /api if not already included
    const apiBaseUrl = API_BASE ? `${API_BASE}/api` : 'https://api-accelerator.aiesec.org.eg/api/v1';
    const checkUrl = `${apiBaseUrl}/auth/check`;
    console.log('🔍 [authStatus] Making request to', checkUrl);
    
    const res = await fetch(checkUrl, { 
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('🔍 [authStatus] Auth check response status:', res.status);
    console.log('🔍 [authStatus] Auth check response headers:', Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      console.log('❌ [authStatus] Auth check failed, response not ok');
      return false;
    }
    
    // Check content type before parsing JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ [authStatus] Response is not JSON, content-type:', contentType);
      const text = await res.text();
      console.error('❌ [authStatus] Response text (first 200 chars):', text.substring(0, 200));
      return false;
    }
    
    const data = await res.json();
    console.log('🔍 [authStatus] Auth check response data:', data);
    console.log('🔍 [authStatus] Authentication result:', data.authenticated);
    return data.authenticated === true;
  } catch (error) {
    console.error('❌ [authStatus] Error in isAuthenticated:', error);
    return false;
  }
} 