import React, { useState } from 'react';
import {
  Paper,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import { AssignmentInd as AssignmentIndIcon, Edit as EditIcon } from '@mui/icons-material';
import { INTERESTED_OPTIONS, EXPECTATIONS_EMAIL_STATUS_OPTIONS, REASON_OPTIONS } from './constants';

export default function ICXLeadStatusSection({
  contacted,
  interviewed,
  expectationsEmailStatus,
  outOfProcess,
  reason,
  onContactedChange,
  onInterviewedChange,
  onExpectationsEmailStatusChange,
  onOutOfProcessChange,
  onReasonChange,
}) {
  const [editing, setEditing] = useState({
    contacted: false,
    interviewed: false,
    expectationsEmailStatus: false,
    outOfProcess: false,
    reason: false,
  });

  const handleEdit = (field) => {
    setEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field, handler, event) => {
    handler(event);
    setEditing((prev) => ({ ...prev, [field]: false }));
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 1, sm: 2.5 },
        borderRadius: 3,
        bgcolor: '#f8fafc',
        mb: { xs: 1, sm: 2 },
        boxShadow: '0 1px 4px rgba(40,60,90,0.04)',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: 'primary.main',
          fontWeight: 700,
          mb: { xs: 1, sm: 2 },
          letterSpacing: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: { xs: '0.9rem', sm: '1.25rem' },
        }}
      >
        <AssignmentIndIcon color="primary" /> Lead Status
      </Typography>

      <Grid container spacing={1}>
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ mb: { xs: 1, sm: 2 } }}>
            <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Contacted
            </Typography>
            {contacted && !editing.contacted ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={contacted} color="primary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
                <IconButton size="small" onClick={() => handleEdit('contacted')} sx={{ p: 0.5 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <FormControl fullWidth sx={{ minWidth: 150 }}>
                <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Contacted</InputLabel>
                <Select
                  value={contacted || ''}
                  onChange={(e) => handleChange('contacted', onContactedChange, e)}
                  label="Contacted"
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.95rem' },
                    height: { xs: 40, sm: 56 },
                    minHeight: { xs: 40, sm: 56 },
                    minWidth: 150,
                    width: '100%',
                    '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' },
                  }}
                >
                  {INTERESTED_OPTIONS.map((option) => (
                    <MenuItem
                      key={option}
                      value={option}
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Grid>

        {contacted === 'Yes' ? (
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ mb: { xs: 1, sm: 2 } }}>
              <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Interviewed
              </Typography>
              {interviewed && !editing.interviewed ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={interviewed} color="primary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
                  <IconButton size="small" onClick={() => handleEdit('interviewed')} sx={{ p: 0.5 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <FormControl fullWidth sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Interviewed</InputLabel>
                  <Select
                    value={interviewed || ''}
                    onChange={(e) => handleChange('interviewed', onInterviewedChange, e)}
                    label="Interviewed"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.95rem' },
                      height: { xs: 40, sm: 56 },
                      minHeight: { xs: 40, sm: 56 },
                      minWidth: 150,
                      width: '100%',
                      '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' },
                    }}
                  >
                    {INTERESTED_OPTIONS.map((option) => (
                      <MenuItem
                        key={option}
                        value={option}
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Grid>
        ) : null}

        {interviewed === 'Yes' ? (
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ mb: { xs: 1, sm: 2 } }}>
              <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Expectations Email Status
              </Typography>
              {expectationsEmailStatus && !editing.expectationsEmailStatus ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={expectationsEmailStatus} color="primary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
                  <IconButton size="small" onClick={() => handleEdit('expectationsEmailStatus')} sx={{ p: 0.5 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <FormControl fullWidth sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Email Status</InputLabel>
                  <Select
                    value={expectationsEmailStatus || ''}
                    onChange={(e) => handleChange('expectationsEmailStatus', onExpectationsEmailStatusChange, e)}
                    label="Email Status"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.95rem' },
                      height: { xs: 40, sm: 56 },
                      minHeight: { xs: 40, sm: 56 },
                      minWidth: 150,
                      width: '100%',
                      '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' },
                    }}
                  >
                    {EXPECTATIONS_EMAIL_STATUS_OPTIONS.map((option) => (
                      <MenuItem
                        key={option}
                        value={option}
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Grid>
        ) : null}

        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ mb: { xs: 1, sm: 2 } }}>
            <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Out of Process
            </Typography>
            {outOfProcess && !editing.outOfProcess ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={outOfProcess} color={outOfProcess === 'Yes' ? 'warning' : 'success'} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
                <IconButton size="small" onClick={() => handleEdit('outOfProcess')} sx={{ p: 0.5 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <FormControl fullWidth sx={{ minWidth: 150 }}>
                <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Out of Process</InputLabel>
                <Select
                  value={outOfProcess || ''}
                  onChange={(e) => handleChange('outOfProcess', onOutOfProcessChange, e)}
                  label="Out of Process"
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.95rem' },
                    height: { xs: 40, sm: 56 },
                    minHeight: { xs: 40, sm: 56 },
                    minWidth: 150,
                    width: '100%',
                    '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' },
                  }}
                >
                  {INTERESTED_OPTIONS.map((option) => (
                    <MenuItem
                      key={option}
                      value={option}
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Grid>

        {outOfProcess === 'Yes' ? (
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ mb: { xs: 1, sm: 2 } }}>
              <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Reason
              </Typography>
              {reason && !editing.reason ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={reason} color="primary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
                  <IconButton size="small" onClick={() => handleEdit('reason')} sx={{ p: 0.5 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <FormControl fullWidth sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, top: '-4px' }}>Reason</InputLabel>
                  <Select
                    value={reason || ''}
                    onChange={(e) => handleChange('reason', onReasonChange, e)}
                    label="Reason"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.95rem' },
                      height: { xs: 40, sm: 56 },
                      minHeight: { xs: 40, sm: 56 },
                      minWidth: 150,
                      width: '100%',
                      '.MuiSelect-select': { py: { xs: 1, sm: 2 }, minWidth: 130, width: '100%' },
                    }}
                  >
                    {REASON_OPTIONS.map((option) => (
                      <MenuItem
                        key={option}
                        value={option}
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, minHeight: { xs: 36, sm: 52 }, minWidth: 150, width: '100%' }}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Grid>
        ) : null}
      </Grid>
    </Paper>
  );
}
