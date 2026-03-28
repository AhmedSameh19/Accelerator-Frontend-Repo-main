/**
 * Single CRM FastAPI base for local dev vs deploy.
 * Set REACT_APP_FASTAPI_BASE or REACT_APP_API_BASE_URL in .env (see .env.example).
 */
const LOCAL_CRM = 'https://accelerator.aiesec.eg/api/v1';

export const CRM_API_V1_BASE =
  process.env.REACT_APP_FASTAPI_BASE ||
  process.env.REACT_APP_API_BASE_URL ||
  LOCAL_CRM;
