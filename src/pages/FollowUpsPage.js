import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useCRMType } from '../context/CRMTypeContext';
import { followUpStatusEmitter } from './MarketResearchPage';
import Cookies from 'js-cookie';
import leadsApi from '../api/services/leadsApi';
import marketResearchAPI from '../api/services/marketResearchAPI';
function FollowUpsPage() {
  const { crmType } = useCRMType();
  const [followUps, setFollowUps] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [newFollowUp, setNewFollowUp] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTitle, setFollowUpTitle] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [leads, setLeads] = useState([]);
  const [companies, setCompanies] = useState([]);
  const theme = useTheme();
  const personId = Cookies.get('person_id') || null;

  // Load entities and follow-ups when component mounts
  useEffect(() => {
    const loadFollowUps = async () => {
      let allFollowUps = [];
  
      if (crmType === 'oGX') {
        
        if (!personId) return;
  
        try {
          const response = await leadsApi.getFollowUpsCreatedBy();
          // Assuming response.data is an array of follow-ups created by personId
          allFollowUps = response;
        } catch (error) {
          console.error('Failed to fetch follow-ups:', error);
        }
      } else {
        try {
          const storedCompanies = await marketResearchAPI.getCompanies();
          setCompanies(storedCompanies);
  
          // Flatten all follow-ups from companies
          allFollowUps = storedCompanies.flatMap(company => 
            (company.followups || []).map(f => ({
              ...f,
              entityId: company.id,
              entityName: company.name || 'Unknown Company',
              entityPhone: company.personContact || '-',
              entityType: 'company',
              companyName: company.name || 'Unknown Company'
            }))
          );
          // Optional: filter by personId if needed
          if (personId) {
            allFollowUps = allFollowUps.filter(f => f.id === personId);
            console.log("allFollowUpsL",allFollowUps)

          }
        } catch (error) {
          console.error('Failed to fetch companies/follow-ups:', error);
        }
      }
  
      setFollowUps(allFollowUps);
    };
  
    loadFollowUps();
  }, [crmType, personId]);
  

  // Subscribe to follow-up status changes from other components
  // useEffect(() => {
  //   const handleExternalStatusChange = ({ followupId, newStatus }) => {
  //     setFollowUps(prevFollowUps => 
  //       prevFollowUps.map(f => 
  //         f.id === followupId ? { ...f, status: newStatus } : f
  //       )
  //     );
  //   };

  //   followUpStatusEmitter.on('statusChange', handleExternalStatusChange);
  //   return () => {
  //     followUpStatusEmitter.off('statusChange', handleExternalStatusChange);
  //   };
  // }, []);

  const handleAddFollowUp = async () => {
    if (!newFollowUp.trim() || !followUpDate || !selectedEntity ) return;

    if (crmType === 'oGX') {
      const lead = leads.find(l => l.id === selectedEntity);
      if (!lead?.id || !newFollowUp.trim() || !followUpDate) return;
      try {
        const followUpData = {
          text: newFollowUp,
          next_follow_up_date: followUpDate,
          status: 'pending', // new follow-ups are pending by default
          created_by: lead.created_by // optional: your logged-in user
        };
    
        // Call backend API
        const response = await leadsApi.createFollowUp(lead.id, followUpData);
    
        // Update local state to show the new follow-up immediately
        setFollowUps((prev) => [response.data, ...prev]);
    
        // Reset the input fields
        setNewFollowUp('');
        setFollowUpDate('');
    
      } catch (error) {
        console.error('Failed to create follow-up:', error);
      }
    } else {
      const company = companies.find(c => c.id === selectedEntity);
      if (!company) return;

      const name = Cookies.get('user_name');
      const id = Cookies.get('person_id');
      const newFollowupp = {
        followUpID: Date.now(),
        id: id, // Generate unique ID for the followup
        text: newFollowUp,
        date: followUpDate,
        timestamp: new Date().toISOString(),
        author: name,
        status: 'pending',
        entityPhone: company.phone || '-',
        entityType: 'company',
        companyName: company.name, // Add this explicitly
        companyId: company.id      // Add this explicitly
      };
      console.log(newFollowUp)
       // Update company state
      const updatedCompany = {
      ...company,
      followups: [...(company.followups || []), newFollowupp],
      lastUpdated: new Date().toISOString()
    };
    try {
      // Call backend API
      const response = await marketResearchAPI.updateCompany(company.id, updatedCompany);
      console.log(response)
      setFollowUps((prev) => [response.data.followups, ...prev]);

    } catch (error) {
      console.error('Error updating company:', error);
      // Optionally, show a notification to the user
    }
    }

    // Reset form
    setNewFollowUp('');
    setFollowUpDate('');
    setFollowUpTitle('');
    setSelectedEntity('');
  };

  // const handleStatusChange = (followUp, newStatus) => {
    // // Update follow-ups state
    // const updatedFollowUps = followUps.map(f => 
    //   f.id === followUp.id ? { ...f, status: newStatus } : f
    // );
    // setFollowUps(updatedFollowUps);

    // // Update follow-ups storage
    // const storageKey = followUp.entityType === 'lead' 
    //   ? `lead_followups_${followUp.entityId}`
    //   : `company_followups_${followUp.entityId}`;
    
    // const entityFollowUps = JSON.parse(localStorage.getItem(storageKey) || '[]');
    // const updatedEntityFollowUps = entityFollowUps.map(f => 
    //   f.id === followUp.id ? { ...f, status: newStatus } : f
    // );
    // localStorage.setItem(storageKey, JSON.stringify(updatedEntityFollowUps));

    // // If it's a company follow-up, update the company profile as well
    // if (followUp.entityType === 'company') {
    //   const companies = JSON.parse(localStorage.getItem('companies') || '[]');
    //   const updatedCompanies = companies.map(company => {
    //     if (company.id === followUp.entityId) {
    //       return {
    //         ...company,
    //         followups: (company.followups || []).map(f =>
    //           f.id === followUp.id ? { ...f, status: newStatus } : f
    //         ),
    //         lastUpdated: new Date().toISOString()
    //       };
    //     }
    //     return company;
    //   });
    //   localStorage.setItem('companies', JSON.stringify(updatedCompanies));

    //   // Emit event for real-time sync
    //   followUpStatusEmitter.emit('statusChange', {
    //     followupId: followUp.id,
    //     newStatus,
    //     companyId: followUp.entityId
    //   });
    // }
  // };
  const handleStatusChange = async (followUp) => {
    if (!followUp?.id) return;
    if(crmType=='oGX'){
      try {
        // Call the backend to update status
        const updatedFollowUp = await leadsApi.updateFollowUp(followUp.expa_person_id, followUp.id);
    
        // Optionally update local state if you maintain followUps array
        setFollowUps(prev => prev.map(f => f.id === followUp.id ? { ...f, ...updatedFollowUp} : f));
      } catch (error) {
        console.error('Error updating follow-up status:', error);
      }
    }
    else{
      try{
              // Fetch company
                // Fetch company data
        const companyArray = await marketResearchAPI.getCompany(followUp.companyId);
        const companyData = companyArray[0]; // Extract the actual company object

        if (!companyData) {
          throw new Error("Company not found");
        }

        // Get current follow-ups
        const followUps = companyData.followups || [];

        // Update the status for the specific follow-up
        const updatedFollowUps = followUps.map(f => 
          f.followUpID === followUp.followUpID 
            ? { ...f, status: newStatus }
            : f
        );

        // Assign back to the company object
        companyData.followups = updatedFollowUps;

        // Update company in backend
        const updatedCompany = await marketResearchAPI.updateCompany(followUp.companyId, companyData);

        setFollowUps(updatedFollowUps)
        console.log(followUps)

      }catch(error){
        console.error('Error updating follow-up status:', error);

      }
    }
   
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredFollowUps = followUps.filter(followUp => {
    if (activeTab === 0) return followUp.status === 'pending';
    if (activeTab === 1) return followUp.status === 'completed';
    return true;
  });

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Typography variant="h4" sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
        {crmType === 'oGX' ? 'Lead Follow-ups' : 'Company Follow-ups'}
      </Typography>

      <Card elevation={0} sx={{ mb: { xs: 2, sm: 3 } }}>
        <CardHeader 
          title={
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                width: '100%',
                '& .MuiTabs-flexContainer': {
                  justifyContent: 'space-between'
                },
                '& .MuiTab-root': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minWidth: 0,
                  flex: 1,
                  px: { xs: 0.5, sm: 1 }
                }
              }}
            >
              <Tab label="PENDING" />
              <Tab label="COMPLETED" />
              <Tab label="ALL" />
            </Tabs>
          }
          sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 } }}
        />
        <CardContent sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 } }}>
          <List>
            {filteredFollowUps.map((followUp) => (
              <ListItem 
                key={followUp.id}
                sx={{ 
                  bgcolor: theme.palette.background.default,
                  borderRadius: 1,
                  mb: { xs: 0.5, sm: 1 },
                  p: { xs: 1, sm: 2 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 0 } }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.primary.main,
                          width: { xs: 32, sm: 40 },
                          height: { xs: 32, sm: 40 }
                        }}
                      >
                        {followUp.entityType === 'lead' ? (
                          <PersonIcon />
                        ) : (
                          <BusinessIcon />
                        )}
                      </Avatar>
                      <Box>
                        {/* <Typography variant="subtitle2" fontWeight="medium" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {followUp.entityName}
                        </Typography> */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            {followUp.created_by_member_name||followUp.author} • {new Date(followUp.created_at||followUp.timestamp).toLocaleString()}
                          </Typography>
                          {followUp.entityPhone !== '-' && (
                            <IconButton
                              size="small"
                              onClick={() => window.location.href = `tel:${followUp.entityPhone}`}
                              sx={{ 
                                color: theme.palette.primary.main,
                                width: { xs: 24, sm: 32 },
                                height: { xs: 24, sm: 32 },
                                '&:hover': {
                                  bgcolor: theme.palette.primary.light
                                }
                              }}
                            >
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: { xs: 0.5, sm: 1 }, width: '100%' }}>
                      <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {followUp.follow_up_text||followUp.text}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
                        <Chip
                          label={`Scheduled: ${new Date(followUp.follow_up_at||followUp.date).toLocaleString()}`}
                          size="small"
                          color={followUp.status === 'completed' ? 'success' : 'warning'}
                          icon={<ScheduleIcon />}
                          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, height: { xs: '20px', sm: '24px' } }}
                        />
                        <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 120 } }}>
                          <Select
                            value={followUp.status}
                            onChange={(e) => handleStatusChange(followUp, e.target.value)}
                            size="small"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ mb: { xs: 2, sm: 3 } }}>
        <CardHeader 
          title={`Add New ${crmType === 'oGX' ? 'Lead' : 'Company'} Follow-up`} 
          sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 } }}
        />
        <CardContent sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 } }}>
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="entity-select-label">
                Select {crmType === 'oGX' ? 'Lead' : 'Company'}
              </InputLabel>
              <Select
                labelId="entity-select-label"
                value={selectedEntity}
                label={`Select ${crmType === 'oGX' ? 'Lead' : 'Company'}`}
                onChange={(e) => setSelectedEntity(e.target.value)}
                sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}
              >
                {(crmType === 'oGX' ? leads : companies).map((entity) => (
                  <MenuItem key={entity.id} value={entity.id}>
                    {crmType === 'oGX' ? (entity.name || entity.full_name) : entity.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* <TextField
              fullWidth
              variant="outlined"
              placeholder="Follow-up title"
              value={followUpTitle}
              onChange={(e) => setFollowUpTitle(e.target.value)}
              sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}
            /> */}
            <TextField
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              placeholder="Add a follow-up note..."
              value={newFollowUp}
              onChange={(e) => setNewFollowUp(e.target.value)}
              sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}
            />
            <TextField
              fullWidth
              type="datetime-local"
              variant="outlined"
              label="Follow-up Date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}
            />
            <Button
              variant="contained"
              startIcon={<ScheduleIcon />}
              onClick={handleAddFollowUp}
              disabled={!selectedEntity || !newFollowUp.trim() || !followUpDate }
              sx={{ fontSize: { xs: '0.8rem', sm: '1rem' }, py: { xs: 1, sm: 1.5 } }}
            >
              Schedule Follow-up
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default FollowUpsPage; 