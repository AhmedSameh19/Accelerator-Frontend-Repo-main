import React, { useState } from 'react';
import { Paper, Grid, Typography, FormControl, InputLabel, Select, MenuItem, Chip, Box, IconButton } from '@mui/material';
import { AssignmentInd as AssignmentIndIcon, Edit as EditIcon } from '@mui/icons-material';
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
  const [editing, setEditing] = useState({
    contactStatus: false,
    interested: false,
    processStatus: false,
    reason: false
  });

  const handleEdit = (field) => {
    setEditing({ ...editing, [field]: true });
  };

  const handleChange = (field, handler, event) => {
    handler(event);
    setEditing({ ...editing, [field]: false });
  };
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
      <Grid container spacing={1}>
        {/* Contact Status */}
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ mb: { xs: 1, sm: 2 } }}>
            <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Contact Status
            </Typography>
            {isB2C && customerInterviewContactStatus && !editing.contactStatus ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={customerInterviewContactStatus} 
                  color="primary" 
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                />
                <IconButton 
                  size="small" 
                  onClick={() => handleEdit('contactStatus')}
                  sx={{ p: 0.5 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <FormControl fullWidth sx={{ minWidth: 150 }}>
                <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>
                  Contact Status
                </InputLabel>
                <Select
                  value={customerInterviewContactStatus || ''}
                  onChange={(e) => handleChange('contactStatus', onContactStatusChange, e)}
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
            )}
          </Box>
        </Grid>

        {/* Interested - Only show if Contact Status is Yes */}
        {customerInterviewContactStatus === 'Yes' && (
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ mb: { xs: 1, sm: 2 } }}>
              <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Interested
              </Typography>
              {isB2C && customerInterviewInterested && !editing.interested ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={customerInterviewInterested} 
                    color={customerInterviewInterested.toLowerCase() === 'yes' ? 'success' : 'default'}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => handleEdit('interested')}
                    sx={{ p: 0.5 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <FormControl fullWidth sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>
                    Interested
                  </InputLabel>
                  <Select
                    value={customerInterviewInterested || ''}
                    onChange={(e) => handleChange('interested', onInterestedChange, e)}
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
              )}
            </Box>
          </Grid>
        )}

        {/* Process Status - Only show if Interested is Yes */}
        {customerInterviewInterested === 'Yes' && (
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ mb: { xs: 1, sm: 2 } }}>
              <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Process Status
              </Typography>
              {isB2C && customerInterviewProcessStatus && !editing.processStatus ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={customerInterviewProcessStatus} 
                    color={customerInterviewProcessStatus.toLowerCase() === 'in process' ? 'success' : 'warning'}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => handleEdit('processStatus')}
                    sx={{ p: 0.5 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <FormControl fullWidth sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>
                    Process Status
                  </InputLabel>
                  <Select
                    value={customerInterviewProcessStatus || ''}
                    onChange={(e) => handleChange('processStatus', onProcessStatusChange, e)}
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
              )}
            </Box>
          </Grid>
        )}

        {/* Reason - Only show if Process Status is Out of Process */}
        {customerInterviewProcessStatus === 'Out of Process' && (
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ mb: { xs: 1, sm: 2 } }}>
              <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Reason
              </Typography>
              {isB2C && customerInterviewReason && !editing.reason ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={customerInterviewReason} 
                    color="warning"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => handleEdit('reason')}
                    sx={{ p: 0.5 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <FormControl fullWidth sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>
                    Reason
                  </InputLabel>
                  <Select
                    value={customerInterviewReason || ''}
                    onChange={(e) => handleChange('reason', onReasonChange, e)}
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
              )}
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}

