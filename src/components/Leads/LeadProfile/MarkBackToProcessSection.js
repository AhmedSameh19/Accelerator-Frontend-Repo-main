import React from 'react';
import { Paper, Typography, Button } from '@mui/material';
import { AssignmentInd as AssignmentIndIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

export default function MarkBackToProcessSection({
  isMarkedBackToProcess,
  onMarkBackToProcess,
  isB2C
}) {
  if (isMarkedBackToProcess) {
    return (
      <Paper elevation={1} sx={{ 
        p: 2.5, 
        borderRadius: 3, 
        bgcolor: '#e8f5e9', 
        boxShadow: '0 1px 4px rgba(40,60,90,0.04)' 
      }}>
        <Typography variant="body1" color="success.main" sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          fontWeight: 600 
        }}>
          <CheckCircleIcon /> This EP is already marked back to process.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ 
      p: 2.5, 
      borderRadius: 3, 
      bgcolor: '#f8fafc', 
      boxShadow: '0 1px 4px rgba(40,60,90,0.04)' 
    }}>
      <Button
        fullWidth
        variant="contained"
        onClick={onMarkBackToProcess}
        startIcon={<AssignmentIndIcon />}
        disabled={!isB2C}
        sx={{
          background: 'linear-gradient(90deg, #0CB9C1 0%, #1976d2 100%)',
          '&:hover': {
            background: 'linear-gradient(90deg, #0aa8af 0%, #1565c0 100%)',
          }
        }}
      >
        Mark EP Back to Process
      </Button>
    </Paper>
  );
}

