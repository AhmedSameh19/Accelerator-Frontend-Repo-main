import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  ListItem,
  ListItemIcon,
  ListItemText,
  List as MUIList,
  Checkbox,
  Button,
  TextField,
} from '@mui/material';
import {
  AssignmentInd as AssignmentIndIcon,
  Work as WorkIcon,
  LocalHospital as LocalHospitalIcon,
  Settings as SettingsIcon,
  Chat as ChatIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  InsertDriveFile as InsertDriveFileIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { updateStandards as defaultUpdateStandards } from '../api/services/realizationsService';

const PreparationStepsTab = ({
  selectedLead,
  fileToBase64,
  prepState,
  setPrepState,
  updateStandardsFn = defaultUpdateStandards,
}) => {
  const leadId = selectedLead?.expa_person_id;
  const leadPrep = useMemo(() => (leadId ? prepState[leadId] || {} : {}), [leadId, prepState]);

  const handleToggle = async (standardKey, checked) => {
    if (!leadId) return;

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
      const response = await updateStandardsFn(leadId, {
        standardName: standardKey,
        value: checked
      });

      const serverRow = response?.data ?? response;

      // Update state with backend response (optional, ensures sync)
      setPrepState(prev => ({
        ...prev,
        [leadId]: {
          ...prev[leadId],
          ...(serverRow || {})
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

  return (
    <Box sx={{ p: 4, color: 'text.secondary' }}>
      <Typography variant="h6" color="primary" sx={{ mb: 3, fontWeight: 700 }}>Preparation Steps</Typography>
      <Stack spacing={3}>
        {/* #1 PSG */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIndIcon color="primary" /> #1 PGS
            </Typography>
            <MUIList dense>
              <ListItem alignItems="flex-start">
                <ListItemIcon><ChatIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={leadPrep.pgs === true}
                    onChange={e => handleToggle('pgs', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="PGS is done" />
                </Box>
              </ListItem>
              <ListItem>
                <TextField
                  label="Notes"
                  size="small"
                  fullWidth
                  value={prepState[leadId]?.iceNotes || ''}
                  onChange={e => {
                    if (!leadId) return;
                    setPrepState(prev => ({
                      ...prev,
                      [leadId]: {
                        ...prev[leadId],
                        iceNotes: e.target.value
                      }
                    }));
                  }}
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>
        {/* #2 OPS */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon color="primary" /> #2 OPS
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><InsertDriveFileIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={leadPrep.ops === true}
                    onChange={e => handleToggle('ops', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="Passport (3 months before realization date)" />
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    {leadPrep.passportFile ? 'Change File' : 'Upload File'}
                    <input
                      type="file"
                      hidden
                      onChange={async (e) => {
                        if (!leadId) return;
                        const file = e.target.files[0];
                        if (file) {
                          const base64 = await fileToBase64(file);
                          setPrepState(prev => ({
                            ...prev,
                            [leadId]: {
                              ...prev[leadId],
                              passportFile: base64
                            }
                          }));
                        }
                      }}
                    />
                  </Button>
                </Box>
              </ListItem>
              <ListItem>
                <ListItemIcon><AttachMoneyIcon color="action" /></ListItemIcon>
                <ListItemText primary="EP starts collecting pocket money for the experience (3 months before realization date)" />
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>
        {/* #3 Health Insurance */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalHospitalIcon color="primary" /> #3 Health Insurance
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><LocalHospitalIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={leadPrep.health_insurance === true}
                    onChange={e => handleToggle('health_insurance', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="Health Insurance is done" />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>
        {/* #4 Expectation Settings */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon color="primary" /> #4 Expectation Settings
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><SettingsIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={leadPrep.expectation_settings === true}
                    onChange={e => handleToggle('expectation_settings', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="Expectation setting" />
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ ml: 1, minWidth: 80 }}
                    onClick={() => {/* Add send logic here */ }}
                  >
                    Send
                  </Button>
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>
        {/* Communication */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon color="primary" /> Communication
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><ChatIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={leadPrep.communication_10_days_before === true}
                    onChange={e => handleToggle('communication_10_days_before', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="10 days before Realization" />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>
        {/* #7 Accommodation */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HomeIcon color="primary" /> #7 Accommodation
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><HomeIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={leadPrep.accommodation === true}
                    onChange={e => handleToggle('accommodation', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="Accommodation place" />
                  <TextField
                    label="Accommodation place"
                    size="small"
                    fullWidth
                    value={leadPrep.accommodationPlace || ''}
                    onChange={e => {
                      if (!leadId) return;
                      setPrepState(prev => ({
                        ...prev,
                        [leadId]: {
                          ...prev[leadId],
                          accommodationPlace: e.target.value
                        }
                      }));
                    }}
                    variant="outlined"
                  />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>
        {/* #8 IPS */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon color="primary" /> #8 IPS
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon><SchoolIcon color="action" /></ListItemIcon>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                  <Checkbox
                    checked={leadPrep.ips === true}
                    onChange={e => handleToggle('ips', e.target.checked)}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="IPS is done" />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default PreparationStepsTab;
