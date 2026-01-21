import React from 'react';
import { Box, Typography, Avatar, IconButton, Chip, Stack, Stepper, Step, StepLabel } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DialogTitle } from '@mui/material';
import { AIESEC_STEPS } from './constants';
import { getCurrentStep, isStepActive } from './utils';

export default function LeadProfileHeader({ 
  lead, 
  leadId, 
  leadName, 
  leadStatus, 
  onClose, 
  handleStepClick 
}) {
  const currentStep = getCurrentStep(leadStatus);

  return (
    <DialogTitle sx={{ 
      pb: 0, 
      position: 'relative', 
      overflow: 'hidden', 
      background: 'linear-gradient(90deg, #0CB9C1 0%, #1976d2 100%)', 
      color: '#fff', 
      minHeight: { xs: 80, sm: 120 }, 
      px: { xs: 1, sm: 3 }, 
      fontSize: { xs: '1.1rem', sm: '1.5rem' } 
    }}>
      <Box display="flex" alignItems="center" gap={2} sx={{ 
        pt: 2, 
        pb: 1, 
        flexDirection: { xs: 'column', sm: 'row' }, 
        alignItems: { xs: 'center', sm: 'flex-start' } 
      }}>
        <Avatar 
          sx={{ 
            width: { xs: 48, sm: 70 },
            height: { xs: 48, sm: 70 },
            bgcolor: 'primary.main',
            fontSize: { xs: '1.2rem', sm: '2rem' },
            boxShadow: '0 6px 24px rgba(25,118,210,0.18)',
            border: '3px solid #fff',
            ml: { xs: 0, sm: 2 }
          }}
        >
          {(leadName || '')?.[0]?.toUpperCase()}
        </Avatar>
        <Box flex={1} sx={{ width: '100%', textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: '#fff', 
            mb: 0.5, 
            letterSpacing: 1, 
            fontSize: { xs: '1.1rem', sm: '2rem' } 
          }}>
            {leadName}
          </Typography>
          <Typography variant="subtitle1" sx={{ 
            color: '#e3f2fd', 
            mb: 1, 
            fontWeight: 500, 
            fontSize: { xs: '0.9rem', sm: '1.1rem' } 
          }}>
            {lead.home_lc_name ? 'LC: ' + lead.home_lc_name : ''}
          </Typography>
          <Stack spacing={1}>
            <Box display="flex" alignItems="center" gap={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
              <Chip
                label={leadStatus}
                sx={{
                  bgcolor:
                    leadStatus?.toLowerCase() === 'accepted' ? '#43a047' :
                    leadStatus?.toLowerCase() === 'rejected' ? '#e53935' :
                    leadStatus?.toLowerCase() === 'pending' ? '#fbc02d' :
                    '#1976d2',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: { xs: '0.7rem', sm: '1rem' },
                  px: { xs: 1, sm: 2 }  
                }}
              />
            </Box>
          </Stack>
        </Box>
        <IconButton 
          onClick={onClose}
          size="medium"
          sx={{
            bgcolor: 'rgba(255,255,255,0.8)',
            color: '#1976d2',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            '&:hover': {
              bgcolor: '#fff',
              color: '#0CB9C1',
              transform: 'rotate(90deg)',
              transition: 'all 0.3s ease'
            },
            position: 'absolute',
            top: 8,
            right: 8
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Stepper for AIESEC Status */}
      <Box sx={{ px: { xs: 0.5, sm: 4 }, pt: { xs: 1, sm: 2 }, pb: { xs: 0.5, sm: 1 } }}>
        <Stepper activeStep={currentStep} alternativeLabel sx={{ minWidth: 0, width: '100%' }}>
          {AIESEC_STEPS.map((step, index) => {
            const stepActive = isStepActive(index, leadStatus);
            return (
              <Step key={step.label} completed={index < currentStep} sx={{ minWidth: 0, px: { xs: 0.5, sm: 1 } }}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: { xs: 20, sm: 28 },
                        height: { xs: 20, sm: 28 },
                        borderRadius: '50%',
                        backgroundColor: stepActive ? '#037ef3' : '#fff',
                        border: stepActive ? 'none' : '2px solid #037ef3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stepActive ? 'white' : '#037ef3',
                        fontSize: { xs: '0.8rem', sm: '1rem' },
                        fontWeight: 500,
                        minWidth: 0
                      }}
                    >
                      {step.index}
                    </Box>
                  )}
                  sx={{
                    minWidth: 0,
                    '& .MuiStepLabel-label': {
                      fontSize: { xs: '0.65rem', sm: '0.85rem' },
                      px: 0,
                      whiteSpace: 'nowrap',
                      minWidth: 0
                    },
                    '& .MuiStepLabel-alternativeLabel': {
                      top: { xs: 18, sm: 22 }
                    }
                  }}
                >
                  {step.label === 'Open' ? (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#fff',
                        fontWeight: stepActive ? 600 : 400,
                        mt: 0.5,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: { xs: '0.65rem', sm: '0.85rem' },
                        px: 0,
                        '&:hover': { color: '#0CB9C1' }
                      }}
                      onClick={() => handleStepClick('open')}
                    >
                      {step.label}
                    </Typography>
                  ) : step.label === 'Applied' && currentStep >= 1 ? (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#fff',
                        fontWeight: 600,
                        mt: 0.5,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: { xs: '0.65rem', sm: '0.85rem' },
                        px: 0,
                        '&:hover': { color: '#0CB9C1' }
                      }}
                      onClick={() => handleStepClick('applied')}
                    >
                      {step.label}
                    </Typography>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#fff',
                        fontWeight: stepActive ? 600 : 400,
                        mt: 0.5,
                        fontSize: { xs: '0.65rem', sm: '0.85rem' },
                        px: 0
                      }}
                    >
                      {step.label}
                    </Typography>
                  )}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    </DialogTitle>
  );
}

