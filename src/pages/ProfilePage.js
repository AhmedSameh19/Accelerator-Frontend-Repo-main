import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Avatar, Grid, Divider, CircularProgress, Alert, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import CakeIcon from '@mui/icons-material/Cake';

import WorkIcon from '@mui/icons-material/Work';

import PageBreadcrumbs from '../components/Navigation/PageBreadcrumbs';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentPersonDetails } from '../api/services/aiesecApi';
import Cookies from 'js-cookie';
import { CRM_ACCESS_TOKEN_KEY } from '../utils/tokenKeys';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [personDetails, setPersonDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPersonDetails();
  }, []);

  const fetchPersonDetails = async () => {
    try {
      setLoading(true);
      const accessToken = Cookies.get(CRM_ACCESS_TOKEN_KEY);
      const data = await fetchCurrentPersonDetails(accessToken);
      console.log('🔍 [ProfilePage] Person details fetched:', data);
      setPersonDetails(data);
    } catch (err) {
      console.error('❌ [ProfilePage] Error fetching person details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely get nested values
  const get = (obj, path, fallback = 'N/A') => {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj) ?? fallback;
  };

  // Use personDetails if available, otherwise fall back to currentUser
  const person = personDetails?.person || currentUser;

  // Helper function to safely convert any value to string
  const safeToString = (value) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    if (typeof value === 'object') {
      return 'N/A'; // Don't render objects directly
    }
    return String(value);
  };

  // Extract data with fallbacks
  const id = safeToString(person?.id || currentUser?.id);
  const name = safeToString(person?.full_name || person?.name || currentUser?.name);
  const email = safeToString(person?.email || currentUser?.email);
  const aiesec_email = safeToString(person?.aiesec_email || currentUser?.email);

  const lc = safeToString(get(person, 'home_lc.name') || currentUser?.lc);
  const mc = safeToString(get(person, 'home_lc.country'));
  
  const birthday = safeToString(person?.dob || currentUser?.dob);
  const profilePhoto = person?.profile_photo_url || currentUser?.profile_photo_url || null;
  
  // Handle roles - ensure it's always an array
  const getRolesArray = (rolesData) => {
    if (Array.isArray(rolesData)) {
      return rolesData;
    } else if (typeof rolesData === 'object' && rolesData !== null) {
      // If it's an object, convert to array format
      return [rolesData];
    }
    return [];
  };
  
  const roles = getRolesArray(person?.roles || currentUser?.roles);
  
 
    
  
  // Ensure current positions and offices are arrays
  const currentPositions = Array.isArray(personDetails?.current_positions) ? personDetails.current_positions : [];
  const currentOffices = Array.isArray(personDetails?.current_offices) ? personDetails.current_offices : [];
  const currentTeams = Array.isArray(personDetails?.current_teams) ? personDetails.current_teams : [];

  // Find current role (active, end_date null)
  const activeRole = roles.find(r => r && typeof r === 'object' && !r.end_date) || roles[0] || {};
  const currentRole = safeToString(activeRole && typeof activeRole === 'object' ? activeRole.role : null);
  const currentRoleEntity = safeToString(activeRole && typeof activeRole === 'object' ? get(activeRole, 'entity.name') : null);

 
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
        <Alert severity="error">
          Failed to load profile details: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{
      maxWidth: 1000,
      width: '100%',
      mx: 'auto',
      mt: { xs: 2, md: 6 },
      p: { xs: 2, md: 0 },
      pb: 8,
      minHeight: '100vh',
      bgcolor: 'background.default',
      borderRadius: 6,
    }}>
      <PageBreadcrumbs 
        items={[
          { label: 'Home', path: '/' },
          { label: 'My Profile' }
        ]} 
        onBack={() => navigate('/')} 
      />

      {/* Gradient Header with Avatar */}
      <Paper elevation={0} sx={{
        p: 0,
        mb: 6,
        borderRadius: 4,
        overflow: 'hidden',
        bgcolor: 'primary.main',
        background: 'linear-gradient(135deg, #037EF3 0%, #025bb5 100%)',
        position: 'relative',
        width: '100%',
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5, position: 'relative' }}>
          <Avatar
            src={profilePhoto}
            sx={{
              width: 140,
              height: 140,
              mb: 3,
              border: '8px solid #fff',
              boxShadow: '0 12px 40px rgba(25,118,210,0.18)',
              background: 'linear-gradient(135deg, #e3f2fd 0%, #b2ebf2 100%)',
              fontSize: 56,
              color: '#1976d2',
            }}
          >
            {name[0]}
          </Avatar>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', mb: 1, letterSpacing: 1 }}>
            {name}
          </Typography>
          {/* <Chip label={status} color={status === 'active' ? 'success' : 'default'} sx={{ mb: 2, fontWeight: 700, fontSize: 18, px: 2, py: 1 }} /> */}
          <Typography variant="h5" sx={{ color: '#e3f2fd', fontWeight: 600, mb: 1 }}>
            {aiesec_email !== 'N/A' ? ` ${aiesec_email}` : ''}
          </Typography>
          <Typography variant="body1" sx={{ color: '#e3f2fd', mb: 1, fontWeight: 500 }}>
            LC: {lc} {mc !== 'N/A' && `| MC: ${mc}`}
          </Typography>

        </Box>
      </Paper>

      {/* Info Sections - 3 columns on desktop, 1 on mobile, equal height */}
      <Grid container spacing={ { xs: 2, md: 4 } } alignItems="stretch" sx={{ width: '100%', m: 0 }}>
        {/* Personal Info */}
        <Grid item xs={12} md={4} sx={{ width: '100%' }}>
          <Paper elevation={3} sx={{
            p: 4,
            borderRadius: 4,
            minHeight: 370,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(25,118,210,0.07)',
            bgcolor: 'rgba(255,255,255,0.98)',
            width: '100%',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', letterSpacing: 1, textAlign: 'center' }}>
              <BadgeIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Personal Info
            </Typography>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={1}><EmailIcon color="primary" /> <b>Personal Email:</b> {email}</Box>
              <Box display="flex" alignItems="center" gap={1}><CakeIcon color="primary" /> <b>Birthday:</b> {birthday}</Box>
           
            </Stack>
          </Paper>
        </Grid>
        {/* AIESEC Info */}
        <Grid item xs={12} md={4} sx={{ width: '100%' }}>
          <Paper elevation={3} sx={{
            p: 4,
            borderRadius: 4,
            minHeight: 370,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(25,118,210,0.07)',
            bgcolor: 'rgba(255,255,255,0.98)',
            width: '100%',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', letterSpacing: 1, textAlign: 'center' }}>
              <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> AIESEC Info
            </Typography>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={1}><EmailIcon color="primary" /> <b>AIESEC Email:</b> {aiesec_email}</Box>
              <Box display="flex" alignItems="center" gap={1}><BusinessIcon color="primary" /> <b>LC:</b> {lc}</Box>
              <Box display="flex" alignItems="center" gap={1}><BusinessIcon color="primary" /> <b>MC:</b> {mc}</Box>
              <Box display="flex" alignItems="center" gap={1}><BadgeIcon color="primary" /> <b>EXPA ID:</b> {id}</Box>

            </Stack>
          </Paper>
        </Grid>
        {/* Current Positions & Roles */}
        <Grid item xs={12} md={4} sx={{ width: '100%' }}>
          <Paper elevation={3} sx={{
            p: 4,
            borderRadius: 4,
            minHeight: 370,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(25,118,210,0.07)',
            bgcolor: 'rgba(255,255,255,0.98)',
            width: '100%',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', letterSpacing: 1, textAlign: 'center' }}>
              <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Current Positions
            </Typography>
            <Stack spacing={2}>
              {currentPositions.length > 0 ? (
                currentPositions.map((position, index) => {
                  // Ensure position is an object
                  if (!position || typeof position !== 'object') {
                    return null;
                  }
                  return (
                    <Box key={index} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
                      <Box sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                        {position.role || position.title || 'N/A'}
                      </Box>
                      <Box><b>Title:</b> {position.title || 'N/A'}</Box>
                      <Box><b>Term:</b> {get(position, 'term.name') || 'N/A'}</Box>
                      <Box><b>Function:</b> {get(position, 'function.name') || 'N/A'}</Box>
                      <Box><b>Duration:</b> {get(position, 'duration.name') || 'N/A'}</Box>
                      <Box><b>Department:</b> {get(position, 'committee_department.name') || 'N/A'}</Box>
                      <Box><b>Start Date:</b> {formatDate(position.start_date)}</Box>
                      <Box><b>End Date:</b> {position.end_date ? formatDate(position.end_date) : 'Present'}</Box>
                      {index < currentPositions.length - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  );
                }).filter(Boolean)
              ) : (
                <Box><b>Current Role:</b> {currentRole} {currentRoleEntity !== 'N/A' ? `@ ${currentRoleEntity}` : ''}</Box>
              )}
              {currentOffices.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>Current Offices:</Box>
                  {currentOffices.map((office, index) => {
                    // Ensure office is an object
                    if (!office || typeof office !== 'object') {
                      return null;
                    }
                    return (
                      <Box key={index} sx={{ p: 1, border: '1px solid #f0f0f0', borderRadius: 1, mb: 1 }}>
                        <Box sx={{ fontWeight: 600 }}>{office.full_name || office.name || 'N/A'}</Box>
                        <Box><b>Type:</b> {office.tag || 'N/A'}</Box>
                        <Box><b>Email:</b> {office.email || 'N/A'}</Box>
                      </Box>
                    );
                  }).filter(Boolean)}
                </>
              )}
              {currentTeams.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>Current Teams:</Box>
                  {currentTeams.map((team, index) => {
                    // Ensure team is an object
                    if (!team || typeof team !== 'object') {
                      return null;
                    }
                    return (
                      <Box key={index} sx={{ ml: 2, mb: 0.5 }}>
                        • {team.name || 'N/A'}
                      </Box>
                    );
                  }).filter(Boolean)}
                </>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>


    </Box>
  );
};

export default ProfilePage; 
