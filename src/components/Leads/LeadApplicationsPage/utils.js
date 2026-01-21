// Helper for status color
export function getStatusColor(status) {
  if (!status) return 'default';
  const s = status.toLowerCase();
  if (s.includes('accepted') || s.includes('approved')) return 'success';
  if (s.includes('open') || s.includes('applied')) return 'primary';
  if (s.includes('rejected') || s.includes('broken')) return 'error';
  if (s.includes('realized') || s.includes('finished')) return 'info';
  return 'default';
}

// Helper for product color
export function getProductColor(prod, theme) {
  if (!prod) return '#e0e0e0';
  const p = prod.toLowerCase();
  if (p.includes('gv')) return '#F85A40';
  if (p.includes('gta')) return '#0CB9C1';
  if (p.includes('gte')) return '#F48924';
  return theme?.palette?.primary?.main || '#1976d2';
}

