import React from 'react';
import { Paper, Grid, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { AssignmentInd as AssignmentIndIcon } from '@mui/icons-material';
import { CONTACT_STATUS_OPTIONS, INTERESTED_OPTIONS, PROCESS_STATUS_OPTIONS, REASON_OPTIONS } from './constants';

export default function CustomerInterviewStatusSection({
  customerInterviewContactStatus,
  customerInterviewInterested,
  customerInterviewProcessStatus,
  customerInterviewReason,
  onContactStatusChange,
  onInterestedChange,
  onProcessStatusChange,
  onReasonChange,
  isB2C
}) {
  return (
    <Paper elevation={1} sx={{ 
      p: { xs: 1, sm: 2.5 }, 
      borderRadius: 3, 
      bgcolor: '#f8fafc', 
      mb: { xs: 1, sm: 2 }, 
      boxShadow: '0 1px 4px rgba(40,60,90,0.04)' 
    }}>
      <Typography variant="h6" sx={{ 
        color: 'primary.main', 
        fontWeight: 700, 
        mb: { xs: 1, sm: 2 }, 
        letterSpacing: 1, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        fontSize: { xs: '0.9rem', sm: '1.25rem' } 
      }}>
        <AssignmentIndIcon color="primary" /> Lead Status (Customer Interview)
      </Typography>
      <Grid container spacing={0.5}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
            <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>
              Contact Status
            </InputLabel>
            <Select
              value={customerInterviewContactStatus}
              onChange={onContactStatusChange}
              label="Contact Status"
              disabled={!isB2C}
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '0.95rem' }, 
                height: { xs: 40, sm: 56 }, 
                minHeight: { xs: 40, sm: 56 }, 
                minWidth: 150, 
                width: '100%', 
                '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } 
              }}
            >
              {CONTACT_STATUS_OPTIONS.map((option) => (
                <MenuItem 
                  key={option} 
                  value={option} 
                  sx={{ 
                    fontSize: { xs: '0.8rem', sm: '0.95rem' }, 
                    minHeight: { xs: 36, sm: 52 }, 
                    minWidth: 150, 
                    width: '100%' 
                  }}
                >
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {customerInterviewContactStatus === 'Yes' && (
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
              <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>
                Interested
              </InputLabel>
              <Select
                value={customerInterviewInterested}
                onChange={onInterestedChange}
                label="Interested"
                disabled={!isB2C}
                sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.95rem' }, 
                  height: { xs: 40, sm: 56 }, 
                  minHeight: { xs: 40, sm: 56 }, 
                  minWidth: 150, 
                  width: '100%', 
                  '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } 
                }}
              >
                {INTERESTED_OPTIONS.map((option) => (
                  <MenuItem 
                    key={option} 
                    value={option} 
                    sx={{ 
                      fontSize: { xs: '0.8rem', sm: '0.95rem' }, 
                      minHeight: { xs: 36, sm: 52 }, 
                      minWidth: 150, 
                      width: '100%' 
                    }}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {customerInterviewInterested === 'Yes' && (
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
              <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>
                Process Status
              </InputLabel>
              <Select
                value={customerInterviewProcessStatus}
                onChange={onProcessStatusChange}
                label="Process Status"
                disabled={!isB2C}
                sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.95rem' }, 
                  height: { xs: 40, sm: 56 }, 
                  minHeight: { xs: 40, sm: 56 }, 
                  minWidth: 150, 
                  width: '100%', 
                  '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } 
                }}
              >
                {PROCESS_STATUS_OPTIONS.map((option) => (
                  <MenuItem 
                    key={option} 
                    value={option} 
                    sx={{ 
                      fontSize: { xs: '0.8rem', sm: '0.95rem' }, 
                      minHeight: { xs: 36, sm: 52 }, 
                      minWidth: 150, 
                      width: '100%' 
                    }}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {customerInterviewProcessStatus === 'Out of Process' && (
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 }, minWidth: 150 }}>
              <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>
                Reason
              </InputLabel>
              <Select
                value={customerInterviewReason}
                onChange={onReasonChange}
                label="Reason"
                disabled={!isB2C}
                sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.95rem' }, 
                  height: { xs: 40, sm: 56 }, 
                  minHeight: { xs: 40, sm: 56 }, 
                  minWidth: 150, 
                  width: '100%', 
                  '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' } 
                }}
              >
                {REASON_OPTIONS.map((option) => (
                  <MenuItem 
                    key={option} 
                    value={option} 
                    sx={{ 
                      fontSize: { xs: '0.8rem', sm: '0.95rem' }, 
                      minHeight: { xs: 36, sm: 52 }, 
                      minWidth: 150, 
                      width: '100%' 
                    }}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}

