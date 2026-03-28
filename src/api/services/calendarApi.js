/**
 * Calendar API – FastAPI backend (scheduled visits + Google Calendar).
 * Base URL: REACT_APP_FASTAPI_BASE or http://localhost:8000/api/v1
 */
import axios from 'axios';
import Cookies from 'js-cookie';
import { getCrmAccessToken } from '../../utils/crmToken';

const API_BASE =
  process.env.REACT_APP_FASTAPI_BASE ||
  process.env.REACT_APP_API_BASE_URL ||
  'https://accelerator.aiesec.eg/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getCrmAccessToken();
    if (token && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

function getUserId() {
  return Cookies.get('person_id') || '';
}

export const calendarApi = {
  getScheduledVisits: async () => {
    const res = await api.get('/market-research/scheduled-visits');
    return res.data;
  },

  getGoogleStatus: async () => {
    const userId = getUserId();
    const res = await api.get('/calendar/google/status', { params: { user_id: userId } });
    return res.data;
  },

  getConnectGoogleUrl: () => {
    const userId = getUserId();
    return `${API_BASE}/calendar/google/connect?user_id=${encodeURIComponent(userId)}`;
  },

  getGoogleEvents: async (timeMin, timeMax) => {
    const userId = getUserId();
    const params = { user_id: userId };
    if (timeMin) params.time_min = timeMin;
    if (timeMax) params.time_max = timeMax;
    const res = await api.get('/calendar/google/events', { params });
    return res.data;
  },

  createGoogleEvent: async (summary, startIso, endIso, description) => {
    const userId = getUserId();
    const res = await api.post(
      '/calendar/google/events',
      { summary, start: startIso, end: endIso, description: description || '' },
      { params: { user_id: userId } }
    );
    return res.data;
  },
};

export default calendarApi;
