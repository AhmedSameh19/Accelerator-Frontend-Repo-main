import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export default function OGXLoadingOverlay({ loading }) {
  if (!loading) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        borderRadius: 2,
      }}
    >
      <Box
        component="img"
        src="/assets/images/Accelerator logo.png"
        alt="Loading..."
        sx={{
          width: 80,
          height: 80,
          animation: `${spin} 2s linear infinite`,
          mb: 2,
        }}
      />
      <Typography variant="h6" color="primary" sx={{ fontWeight: 500 }}>
        Loading Realizations...
      </Typography>
    </Box>
  );
}
