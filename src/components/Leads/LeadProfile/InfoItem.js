import React from 'react';
import { Box, Typography } from '@mui/material';

export const InfoItem = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 2 } }}>
    {icon}
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
        {value || '-'}
      </Typography>
    </Box>
  </Box>
);

