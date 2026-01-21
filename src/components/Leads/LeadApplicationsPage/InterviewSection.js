import React from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem, TextField, Paper, Typography } from '@mui/material';
import { AssignmentInd as AssignmentIndIcon } from '@mui/icons-material';
import { INTERVIEWED_OPTIONS, INTERVIEW_STATUS_OPTIONS } from './constants';

export default function InterviewSection({ 
  appId, 
  interviewData, 
  onInterviewedChange, 
  onInterviewStatusChange, 
  onRejectionReasonChange 
}) {
  const data = interviewData[appId] || {};

  return (
    <Grid item xs={12} sx={{ width: '100%' }}>
      <Paper 
        elevation={1} 
        sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8fafc', boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 700, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIndIcon color="primary" /> Interview Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth sx={{ mb: 2, minWidth: 150 }}>
              <InputLabel sx={{ fontSize: '0.95rem', top: '-4px' }}>Interviewed</InputLabel>
              <Select
                value={data.interviewed || ''}
                onChange={(e) => onInterviewedChange(appId, e.target.value)}
                label="Interviewed"
                sx={{ fontSize: '0.95rem', height: 56, minHeight: 56, minWidth: 150, width: '100%', '.MuiSelect-select': { py: 2, minWidth: 130, width: '100%' } }}
              >
                {INTERVIEWED_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.95rem', minHeight: 52, minWidth: 150, width: '100%' }}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {data.interviewed === 'Yes' && (
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth sx={{ mb: 2, minWidth: 150 }}>
                <InputLabel sx={{ fontSize: '0.95rem', top: '-4px' }}>Interview Status</InputLabel>
                <Select
                  value={data.interviewStatus || ''}
                  onChange={(e) => onInterviewStatusChange(appId, e.target.value)}
                  label="Interview Status"
                  sx={{ fontSize: '0.95rem', height: 56, minHeight: 56, minWidth: 150, width: '100%', '.MuiSelect-select': { py: 2, minWidth: 130, width: '100%' } }}
                >
                  {INTERVIEW_STATUS_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.95rem', minHeight: 52, minWidth: 150, width: '100%' }}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {data.interviewStatus === 'Rejected' && (
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Reason for Rejection"
                value={data.rejectionReason || ''}
                onChange={(e) => onRejectionReasonChange(appId, e.target.value)}
                multiline
                rows={2}
                sx={{ 
                  fontSize: '0.95rem', 
                  minWidth: 150, 
                  width: '100%',
                  '& .MuiInputLabel-root': {
                    fontSize: '0.95rem',
                    top: '-4px'
                  },
                  '& .MuiInputBase-root': {
                    fontSize: '0.95rem',
                    minHeight: 56
                  }
                }}
                placeholder="Enter the reason for rejection..."
              />
            </Grid>
          )}
        </Grid>
      </Paper>
    </Grid>
  );
}

