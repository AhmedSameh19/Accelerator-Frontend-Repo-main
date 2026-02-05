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
} from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { updateStandards as defaultUpdateStandards } from '../api/services/realizationsService';

const PostExperienceTab = ({
  selectedLead,
  prepState,
  setPrepState,
  updateStandardsFn = defaultUpdateStandards,
}) => {
  if (!selectedLead) return null;
  const leadId = selectedLead?.application_id || selectedLead?.id || selectedLead?.expa_person_id;

  const handleToggle = async (standardKey, checked) => {
    setPrepState(prev => ({
      ...prev,
      [leadId]: {
        ...prev[leadId],
        [standardKey]: checked
      }
    }));
  
    try {
      const response = await updateStandardsFn(leadId, {
        standardName: standardKey,
        value: checked
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
  
  return (
    <Box sx={{ p: 4, color: 'text.secondary' }}>
      <Typography variant="h6" color="primary" sx={{ mb: 3, fontWeight: 700 }}>
        Post Experience
      </Typography>
      <Stack spacing={3}>
        {/* #18 Debrief with AIESEC */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#1976d2',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <ChatIcon color="primary" /> #18 Debrief with AIESEC
            </Typography>
            <MUIList dense>
              <ListItem>
                <ListItemIcon>
                  <ChatIcon color="action" />
                </ListItemIcon>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Checkbox
                    checked={prepState[leadId]?.debrief === true}
                    onChange={e=>handleToggle('debrief', e.target.checked)}
                    
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="EP finished the debriefing space" />
                </Box>
              </ListItem>
            </MUIList>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default PostExperienceTab;
