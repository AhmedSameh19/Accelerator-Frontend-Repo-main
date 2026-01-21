import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import {
  AssignmentInd as AssignmentIndIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import DateRangeFilter from '../../../components/DateRangeFilter';

export default function OGXHeaderActions({
  loading,
  fetchLeads,
  selectedLeadsCount,
  onAssignSelected,
  onPrint,
  onDateFilterChange,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        mb: { xs: 2, sm: 3 },
        gap: { xs: 2, sm: 0 },
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: 'primary.main',
          fontSize: { xs: '1.5rem', sm: '2.125rem' },
        }}
      >
        OGX Realizations
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 },
          width: { xs: '100%', sm: 'auto' },
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchLeads}
          disabled={loading}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Refresh API
        </Button>

        {selectedLeadsCount > 0 && (
          <Button
            variant="contained"
            startIcon={<AssignmentIndIcon />}
            onClick={onAssignSelected}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              position: 'relative',
              '&::after':
                selectedLeadsCount > 0
                  ? {
                      content: `"${selectedLeadsCount}"`,
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: '#f44336',
                      color: 'white',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }
                  : {},
            }}
          >
            Assign Selected
          </Button>
        )}

        <Button
          variant="contained"
          color="primary"
          startIcon={<PrintIcon />}
          onClick={onPrint}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            position: 'relative',
            '&::after':
              selectedLeadsCount > 0
                ? {
                    content: `"${selectedLeadsCount}"`,
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: '#f44336',
                    color: 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }
                : {},
          }}
        >
          Print Report
        </Button>

        <DateRangeFilter onDateFilterChange={onDateFilterChange} />
      </Box>
    </Box>
  );
}
