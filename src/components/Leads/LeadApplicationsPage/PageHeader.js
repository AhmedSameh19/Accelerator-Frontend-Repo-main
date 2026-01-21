import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function PageHeader({ onBack }) {
  const theme = useTheme();

  return (
    <Box sx={{
      width: '100%',
      bgcolor: 'white',
      boxShadow: '0 4px 24px rgba(40,60,90,0.10)',
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      px: { xs: 2, md: 6 },
      py: { xs: 2, md: 3 },
      mb: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{
          borderRadius: 3,
          fontWeight: 700,
          px: 3,
          py: 1.2,
          fontSize: '1rem',
          color: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
          background: 'linear-gradient(90deg, #e3f2fd 0%, #f8fafc 100%)',
          boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
          transition: 'all 0.2s',
          '&:hover': {
            background: 'linear-gradient(90deg, #0CB9C1 0%, #1976d2 100%)',
            color: '#fff',
            borderColor: theme.palette.primary.main,
            boxShadow: '0 4px 16px rgba(25,118,210,0.16)'
          }
        }}
        variant="outlined"
      >
        Back to Leads
      </Button>
      <Typography variant="h4" sx={{ fontWeight: 900, color: theme.palette.primary.main, letterSpacing: 1, textAlign: 'center', flex: 1 }}>
        Opportunity Applications
      </Typography>
      <Box sx={{ width: 120 }} />
    </Box>
  );
}

