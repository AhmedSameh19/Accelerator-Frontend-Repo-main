import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  List as MUIList,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  School as SchoolIcon,
  FlightTakeoff as FlightTakeoffIcon,
  Chat as ChatIcon,
  Work as WorkIcon,
  EventNote as EventNoteIcon,
  RateReview as RateReviewIcon,
} from '@mui/icons-material';
import { updateStandards } from '../api/services/realizationsService';
const ExperienceTab = ({ selectedLead, formatDateTime, fileToBase64, prepState, setPrepState }) => {
  if (!selectedLead) return null;
  const leadId = selectedLead?.expa_person_id || selectedLead?.id;
  if (!selectedLead) return null;
  const handleToggle = async (standardKey, checked) => {
    const persistKeys = new Set([
      'health_insurance',
      'expectation_settings',
      'visa_and_work_permit',
      'communication_10_days_before',
      'arrival_pickup',
      'accommodation',
      'ips',
      'ops',
      'pgs',
      'alignment_space',
      'first_day_of_work',
      'job_description',
      'working_hours',
      'duration',
      'opportunity_benefits',
      'value_driven_leadership_education',
      'communication_first_10_days',
      'communication_second_10_days',
      'communication_third_10_days',
      'communication_fourth_10_days',
      'departure_support',
      'debrief',
    ]);

    setPrepState(prev => ({
      ...prev,
      [leadId]: {
        ...prev[leadId],
        [standardKey]: checked
      }
    }));

    if (!persistKeys.has(standardKey)) return;
  
    try {
      const response = await updateStandards(leadId, {
        standardName: standardKey,
        value: checked,
      });
  
      // Update state with backend response (optional, ensures sync)
      setPrepState(prev => ({
        ...prev,
        [leadId]: {
          ...prev[leadId],
          ...(response?.data ?? response) // full row from backend
        }
      }));
    } catch (error) {
      console.error(error);
      // Optionally revert local state if API fails
      setPrepState(prev => ({
        ...prev,
        [leadId]: {
          ...prev[leadId],
          [standardKey]: !checked
        }
      }));
    }
  };
  // Calculate progress based on communication checkboxes
  const calculateProgress = () => {
    const communicationChecks = [
      prepState[leadId]?.communication_first_10_days,
      prepState[leadId]?.communication_second_10_days,
      prepState[leadId]?.communication_third_10_days,
      prepState[leadId]?.communication_fourth_10_days,
    ];
    
    const checkedCount = communicationChecks.filter(Boolean).length;
    return (checkedCount / communicationChecks.length) * 100;
  };

  return (
    <Box sx={{ p: 4, color: 'text.secondary' }}>
      <Typography variant="h6" color="primary" sx={{ mb: 3, fontWeight: 700 }}>Experience</Typography>
      <Stack spacing={3}>
        {/* #9 First Day of Work */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventNoteIcon color="primary" /> #9 First Day of Work
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><EventNoteIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={prepState[leadId]?.first_day_of_work === true}
                    onChange={e=>handleToggle('first_day_of_work', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="First day of work done" />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>

        {/* #10 Alignment spaces with the OP */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon color="primary" /> #10 Alignment spaces with the OP
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><WorkIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={prepState[leadId]?.alignment_space === true}
                    onChange={e=>handleToggle('alignment_space', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="Alignment spaces" />
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    Upload Files
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="application/pdf,image/*"
                      onChange={async e => {
                        const files = Array.from(e.target.files);
                        try {
                          const uploadedFiles = await Promise.all(
                            files.map(async file => {
                              const base64Data = await fileToBase64(file);
                              return {
                                name: file.name,
                                type: file.type,
                                data: base64Data,
                                size: file.size,
                                uploadDate: new Date().toISOString()
                              };
                            })
                          );
                          setPrepState(prev => ({
                            ...prev,
                            [leadId]: {
                              ...prev[leadId],
                              alignmentSpacesFiles: [
                                ...(prev[leadId]?.alignmentSpacesFiles || []),
                                ...uploadedFiles
                              ]
                            }
                          }));
                        } catch (error) {
                          console.error('File conversion failed:', error);
                        }
                      }}
                    />
                  </Button>
                  {prepState[leadId]?.alignmentSpacesFiles?.map((file, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        <a
                          href={file.data}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#1976d2', textDecoration: 'underline' }}
                        >
                          {file.name}
                        </a>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Uploaded: {formatDateTime(new Date(file.uploadDate))}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>

        {/* #11 Job Description */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon color="primary" /> #11 Job Description
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><WorkIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={prepState[leadId]?.job_description === true}
                    onChange={e=>handleToggle('job_description', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="Job Description meets the OPP application" />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>

        {/* Communication - 1st 10 days */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon color="primary" /> Communication - 1st 10 days
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><ChatIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={prepState[leadId]?.communication_first_10_days === true}
                    onChange={e=>handleToggle('communication_first_10_days', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="1st 10 days in experience" />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>

        {/* #12 Working hours */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon color="primary" /> #12 Working hours
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><AccessTimeIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={prepState[leadId]?.working_hours === true}
                    onChange={e=>handleToggle('working_hours', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="Same stated in the opp" />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>

        {/* Communication - 2nd 10 days */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon color="primary" /> Communication - 2nd 10 days
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><ChatIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={prepState[leadId]?.communication_second_10_days === true}
                    onChange={e=>handleToggle('communication_second_10_days', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="2nd 10 days in Experience" />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>

        {/* #13 Duration */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon color="primary" /> #13 Duration
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><EventIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={prepState[leadId]?.duration === true}
                    onChange={e=>handleToggle('duration', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="Minimum duration is reached" />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>

        {/* #14 Opportunity benefits */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoneyIcon color="primary" /> #14 Opportunity benefits
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><AttachMoneyIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={prepState[leadId]?.opportunity_benefits === true}
                    onChange={e=>handleToggle('opportunity_benefits', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="EP was delivered the benefits mentioned in the opportunity description on the platform" />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>

        {/* Communication - 3rd 10 days */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon color="primary" /> Communication - 3rd 10 days
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><ChatIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={prepState[leadId]?.communication_third_10_days === true}
                    onChange={e=>handleToggle('communication_third_10_days', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="3rd 10 days in Experience" />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>

        {/* #15 Value-driven leadership education */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon color="primary" /> #15 Value-driven leadership education
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><SchoolIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={prepState[leadId]?.value_driven_leadership_education === true}
                    onChange={e=>handleToggle('value_driven_leadership_education', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="EP was delivered and educational space for at least one AIESEC value" />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>

        {/* Communication - 4th 10 days */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon color="primary" /> Communication - 4th 10 days
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><ChatIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={prepState[leadId]?.communication_fourth_10_days === true}
                    onChange={e=>handleToggle('communication_fourth_10_days', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="4th 10 days in Experience" />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>

        {/* #16 Departure support */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FlightTakeoffIcon color="primary" /> #16 Departure support
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><FlightTakeoffIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={prepState[leadId]?.departure_support === true}
                    onChange={e=>handleToggle('departure_support', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="Departure done" />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>

        {/* #17 Review Checkpoints */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <RateReviewIcon color="primary" /> #17 Review Checkpoints
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><RateReviewIcon color="action" /></ListItemIcon>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Communication Progress
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                      {Math.round(calculateProgress())}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculateProgress()} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'rgba(25, 118, 210, 0.12)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: 'primary.main'
                      }
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {calculateProgress() === 100 
                      ? 'All communication checkpoints have been reviewed!'
                      : 'Complete all communication checkpoints to reach 100%'}
                  </Typography>
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default ExperienceTab; 