import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

function LeadStatusCard({ title, count, change, icon, color }) {
  return (
    <Card
      sx={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        borderRadius: 4,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme => `0 20px 40px -12px ${theme.palette[color]?.main || 'rgba(0,0,0,0.12)'}`,
          borderColor: `${color}.main`,
        }
      }}
    >
      {/* Responsive icon chip (top-right) */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 10, sm: 12 },
          right: { xs: 10, sm: 12 },
          p: { xs: 1, sm: 1.25 },
          borderRadius: 2,
          bgcolor: `${color}.light`,
          color: `${color}.main`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // icon scales with viewport
          '& svg': {
            fontSize: { xs: 18, sm: 20, md: 22 }
          }
        }}
      >
        {icon}
      </Box>

      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pr: { xs: 6.5, sm: 7.5 } }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
          {title}
        </Typography>

        <Typography
          variant="h4"
          sx={{ mt: 1, fontWeight: 600, lineHeight: 1.1, wordBreak: 'break-word' }}
        >
          {Number.isFinite(Number(count)) ? Number(count) : 0}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 1,
            color: (Number(change) || 0) >= 0 ? 'success.main' : 'error.main',
            display: 'flex',
            alignItems: 'center',
            minHeight: 22
          }}
        >
          {(Number(change) || 0) >= 0 ? '+' : ''}{Number(change) || 0}% from last week
        </Typography>
      </CardContent>
    </Card>
  );
}

export default LeadStatusCard;
