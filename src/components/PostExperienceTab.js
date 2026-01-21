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
import { getStandards, updateStandards } from '../api/services/realizationsService';
import { useEffect } from 'react';
import { useState } from 'react';

const PostExperienceTab = ({ selectedLead}) => {
  if (!selectedLead) return null;
  const [prepState, setPrepState] = useState({});

  useEffect(() => {
    const fetchPrepState = async () => {
      if (!selectedLead?.id) return;
  
      try {
        const response = await getStandards(selectedLead.id);
        const data = response; // object containing all standards
        if (data) {
          setPrepState({ [selectedLead.id]: data });
        } else {
          // EP has no record yet, initialize empty
          setPrepState({ [selectedLead.id]: {} });
        }
      } catch (error) {
        console.error('Failed to fetch prep state:', error);
      }
    };
    
    fetchPrepState();
  }, [selectedLead?.id]);
  console.log('selectedLead', prepState);
  const handleToggle = async (standardKey, checked) => {
    setPrepState(prev => ({
      ...prev,
      [selectedLead.id]: {
        ...prev[selectedLead.id],
        [standardKey]: checked
      }
    }));
  
    try {
      const response = await updateStandards(selectedLead.id, {
        standardName: standardKey,
        value: checked
      });
  
      // Update state with backend response (optional, ensures sync)
      setPrepState(prev => ({
        ...prev,
        [selectedLead.id]: {
          ...prev[selectedLead.id],
          ...response.data // full row from backend
        }
      }));
    } catch (error) {
      console.error(error);
      // Optionally revert local state if API fails
      setPrepState(prev => ({
        ...prev,
        [selectedLead.id]: {
          ...prev[selectedLead.id],
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
                    checked={prepState[selectedLead.id]?.debreif === true}
                    onChange={e=>handleToggle('debreif', e.target.checked)}
                    
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
