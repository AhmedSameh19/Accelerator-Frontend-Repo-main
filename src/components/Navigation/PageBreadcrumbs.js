import React from 'react';
import { Breadcrumbs, Link, Typography, Box, IconButton } from '@mui/material';
import { NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function PageBreadcrumbs({ items, onBack, title }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      {onBack && (
        <IconButton 
          onClick={onBack} 
          sx={{ 
            bgcolor: 'background.paper', 
            boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)',
            mt: 0.5,
            transition: 'all 0.2s ease-in-out',
            '&:hover': { 
              bgcolor: 'background.paper', 
              transform: 'translateX(-4px)',
              boxShadow: '0 4px 12px -2px rgba(0,0,0,0.08)'
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      )}
      <Box>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return isLast ? (
              <Typography key={index} color="text.primary" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                {item.label}
              </Typography>
            ) : (
              <Link
                key={index}
                underline="hover"
                color="text.secondary"
                sx={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}
                onClick={() => item.path && navigate(item.path)}
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
        {title && (
          <Typography variant="h4" sx={{ mt: 1, color: 'text.primary', letterSpacing: '-0.02em' }}>
            {title}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
