const FALLBACK_PORTS = new Set(['3000', '5173']);
const DEFAULT_LOCAL_PORT = '5002';

function normalizeBaseUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function resolveEnvBase() {
  const primary = normalizeBaseUrl(process.env.REACT_APP_API_BASE);
  if (primary) return primary;
  const legacy = normalizeBaseUrl(process.env.REACT_APP_API_BASE_URL);
  if (legacy) return legacy;
  return '';
}

function computeApiBase() {
  const envBase = resolveEnvBase();
  if (envBase) return envBase;

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port, origin } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocal) {
      if (!port || FALLBACK_PORTS.has(port)) {
        return `${protocol}//${hostname}:${DEFAULT_LOCAL_PORT}`;
      }
      return `${protocol}//${hostname}:${DEFAULT_LOCAL_PORT}`;
    }

    // Non-local deployments default to same origin to avoid extra config
    return origin;
  }

  return '';
}

export const API_BASE = computeApiBase();
