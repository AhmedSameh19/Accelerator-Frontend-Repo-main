import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { SearchOff as SearchOffIcon } from '@mui/icons-material';

/**
 * Standardized Empty State Component for AIESEC CRM
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.title - Headline text
 * @param {string} props.description - Subtext explaining the state
 * @param {string} props.actionLabel - Label for the CTA button
 * @param {Function} props.onAction - Callback for the CTA button
 * @param {boolean} props.isFiltered - Whether this state is due to active filters
 */
const EmptyState = ({
  icon = <SearchOffIcon sx={{ fontSize: 64, opacity: 0.5 }} />,
  title = "No data found",
  description = "There are no items to display here at the moment.",
  actionLabel,
  onAction,
  isFiltered = false
}) => {
  return (
    <Box
      sx={{
        py: 8,
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        minHeight: 300,
        bgcolor: 'var(--color-bg-secondary)',
        borderRadius: 4,
        border: '2px dashed var(--color-border)',
        width: '100%'
      }}
    >
      <Box sx={{ mb: 2, color: 'text.disabled' }}>
        {icon}
      </Box>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          fontFamily: 'Montserrat, sans-serif', 
          fontWeight: 700,
          color: 'text.primary'
        }}
      >
        {isFiltered ? "No results match your filters" : title}
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ maxWidth: 400, mb: 3 }}
      >
        {isFiltered 
          ? "Try adjusting your filters or search terms to find what you're looking for." 
          : description}
      </Typography>
      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{
            py: 1,
            px: 4,
            borderRadius: '50px',
            textTransform: 'none',
            fontWeight: 600,
            fontFamily: 'Montserrat, sans-serif',
            boxShadow: '0 4px 14px var(--color-shadow)'
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
