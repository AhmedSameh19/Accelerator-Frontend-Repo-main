import React from 'react';
import { Paper, Grid, Typography, Box, Chip } from '@mui/material';

export default function LeadKeyInfoCard({ leadId, lead, leadStatus }) {
  const getProgramColor = (program) => {
    if (!program) return '#e0e0e0';
    const lower = program.toLowerCase();
    if (lower.includes('gv')) return '#F85A40';
    if (lower.includes('gta')) return '#0CB9C1';
    if (lower.includes('gte')) return '#F48924';
    return '#e0e0e0';
  };

  return (
    <Paper elevation={3} sx={{ 
      p: { xs: 1, sm: 3 }, 
      borderRadius: 3, 
      bgcolor: 'white', 
      mb: { xs: 1.5, sm: 3 }, 
      boxShadow: '0 4px 16px rgba(40,60,90,0.10)' 
    }}>
      <Grid container spacing={0.5} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
            EP ID
          </Typography>
          <Typography variant="h5" sx={{ 
            fontWeight: 800, 
            color: 'primary.main', 
            letterSpacing: 1, 
            fontSize: { xs: '1.1rem', sm: '1.5rem' } 
          }}>
            {leadId ?? '-'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
            Program
          </Typography>
          <Chip 
            label={lead.selected_programmes || lead.product || '-'} 
            size="small" 
            sx={{ 
              bgcolor: getProgramColor(lead.selected_programmes || lead.product), 
              color: '#fff', 
              fontWeight: 700, 
              fontSize: { xs: '0.6rem', sm: '0.75rem' }, 
              px: { xs: '4px', sm: '6px' }, 
              height: { xs: '16px', sm: '20px' }, 
              minHeight: { xs: '16px', sm: '20px' }, 
              borderRadius: '4px', 
              lineHeight: 1.1 
            }} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
            Status
          </Typography>
          <Chip 
            label={leadStatus || '-'} 
            color="primary" 
            size="small" 
            sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '0.6rem', sm: '0.75rem' }, 
              px: { xs: '4px', sm: '6px' }, 
              height: { xs: '16px', sm: '20px' }, 
              minHeight: { xs: '16px', sm: '20px' }, 
              borderRadius: '4px', 
              lineHeight: 1.1 
            }} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
            Home LC / MC
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={lead.home_lc_name || lead.lc || lead.home_lc || '-'} 
              color="info" 
              size="small" 
              sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '0.6rem', sm: '0.75rem' }, 
                px: { xs: '4px', sm: '6px' }, 
                height: { xs: '16px', sm: '20px' }, 
                minHeight: { xs: '16px', sm: '20px' }, 
                borderRadius: '4px', 
                lineHeight: 1.1 
              }} 
            />
            <Chip 
              label={lead.home_mc_name || lead.mc || lead.home_mc || '-'} 
              color="info" 
              size="small" 
              sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '0.6rem', sm: '0.75rem' }, 
                px: { xs: '4px', sm: '6px' }, 
                height: { xs: '16px', sm: '20px' }, 
                minHeight: { xs: '16px', sm: '20px' }, 
                borderRadius: '4px', 
                lineHeight: 1.1 
              }} 
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

