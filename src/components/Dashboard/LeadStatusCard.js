import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

function LeadStatusCard({ title, count, change, icon, color }) {
  return (
    <Card
      sx={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        borderRadius: 2,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: theme => `0 8px 22px ${theme.palette[color]?.main || 'rgba(0,0,0,0.12)'}`
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
        <Typography variant="subtitle2" color="text.secondary">
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
