export function getProgrammeChipSx(programme) {
  return {
    bgcolor:
      programme?.toLowerCase() === 'gv'
        ? '#F85A40'
        : programme?.toLowerCase() === 'gta'
          ? '#0CB9C1'
          : programme?.toLowerCase() === 'gte'
            ? '#F48924'
            : '#e0e0e0',
    color: '#fff',
    fontWeight: 700,
  };
}

export function getStatusChipSx(status) {
  return {
    bgcolor:
      status?.toLowerCase() === 'approved'
        ? '#4caf50'
        : status?.toLowerCase() === 'realized'
          ? '#1976d2'
          : status?.toLowerCase() === 'finished'
            ? '#ffc107'
            : status?.toLowerCase() === 'completed'
              ? '#ff9800'
              : status?.toLowerCase() === 'rejected'
                ? '#f44336'
                : status?.toLowerCase() === 'on hold'
                  ? '#ff9800'
                  : '#e0e0e0',
    color: '#fff',
    fontWeight: 700,
  };
}
