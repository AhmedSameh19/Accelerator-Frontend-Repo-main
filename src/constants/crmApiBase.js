/**
 * Single CRM FastAPI base for local dev vs deploy.
 * Set any of: REACT_APP_FASTAPI_BASE, REACT_APP_API_BASE_URL, REACT_APP_API_BASE (build-time).
 */
const DEFAULT_CRM_API = 'https://api-accelerator.aiesec.org.eg/api/v1';

export const CRM_API_V1_BASE =
  process.env.REACT_APP_FASTAPI_BASE ||
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE ||
  DEFAULT_CRM_API;
