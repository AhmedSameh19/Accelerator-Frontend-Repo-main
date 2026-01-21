import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import LeadProfileComponent from '../../components/Leads/LeadProfile';
import leadsApi from '../../api/services/leadsApi';

function LeadProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
    

  const handleClose = () => {
    // Go back to the previous page
    navigate(-1);
  };

  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!lead) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Lead not found
        </Typography>
      </Box>
    );
  }

  return (
    <LeadProfileComponent
      lead={lead}
      open={true}
      onClose={handleClose}
      onAddComment={handleAddComment}
      onStatusChange={handleStatusChange}
      navigationState={location.state}
    />
  );
}

export default LeadProfile; 