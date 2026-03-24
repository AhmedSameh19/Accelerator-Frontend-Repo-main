import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function CustomerSurveysPage() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        p: { xs: 3, md: 5 }, 
        borderRadius: 4, 
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(25,118,210,0.15)',
        maxWidth: 600,
        width: '100%'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <img 
            src="/assets/images/Accelerator logo.png" 
            alt="Accelerator Logo" 
            style={{ 
              width: '48px', 
              height: '48px', 
              marginRight: '16px'
            }} 
          />
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            Customer Surveys
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          We're working on an enhanced customer surveys management system. This feature will be available soon!
        </Typography>
      </Box>
    </Box>
  );
} 