import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import DateRangeFilter from '../../../components/DateRangeFilter';

export default function LeadsHeader({
  loading,
  onRefresh,
  dateRange,
  onDateFilterChange,
  onClearFilter,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        mb: 3,
        gap: { xs: 2, sm: 0 },
      }}
    >
      <Typography
        variant="h5"
        sx={{ fontWeight: 600, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
      >
        Lead Management (AIESEC)
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Refresh API
        </Button>

        <DateRangeFilter
          onDateFilterChange={onDateFilterChange}
          customFields="leads"
          onClearFilter={onClearFilter}
          currentDateRange={dateRange}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        />
      </Box>
    </Box>
  );
}
