import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Avatar, Chip, Grid, Divider, IconButton, Tooltip, CircularProgress, Alert } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import CakeIcon from '@mui/icons-material/Cake';
import SchoolIcon from '@mui/icons-material/School';
import WcIcon from '@mui/icons-material/Wc';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../context/AuthContext';
import { fetchCurrentPersonDetails, fetchParentDetails, fetchManagerDetails } from '../api/services/aiesecApi';
import Cookies from 'js-cookie';
import { EXPA_ACCESS_TOKEN_KEY } from '../utils/tokenKeys';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [personDetails, setPersonDetails] = useState(null);
  const [parentDetails, setParentDetails] = useState(null);
  const [managerDetails, setManagerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPersonDetails();
  }, []);

  const fetchPersonDetails = async () => {
    try {
      setLoading(true);
      const accessToken = Cookies.get(EXPA_ACCESS_TOKEN_KEY);
      const personId = Cookies.get('person_id');
      
      if (!accessToken) {
        console.log('🔍 [ProfilePage] No access token found, using current user data');
        setLoading(false);
        return;
      }

      console.log('🔍 [ProfilePage] Fetching person details with token and ID:', { 
        hasToken: !!accessToken, 
        personId 
      });

      // Fetch person details
      const data = await fetchCurrentPersonDetails(accessToken);
      console.log('🔍 [ProfilePage] Person details fetched:', data);
      setPersonDetails(data);

      // Fetch parent details if person ID is available
      if (personId) {
        try {
          const parentData = await fetchParentDetails(personId, accessToken);
          console.log('🔍 [ProfilePage] Parent details fetched:', parentData);
          setParentDetails(parentData);
        } catch (parentError) {
          console.warn('⚠️ [ProfilePage] Could not fetch parent details:', parentError.message);
          // Don't fail the entire request if parent details fail
        }

        try {
          const managerData = await fetchManagerDetails(personId, accessToken);
          console.log('🔍 [ProfilePage] Manager details fetched:', managerData);
          setManagerDetails(managerData);
        } catch (managerError) {
          console.warn('⚠️ [ProfilePage] Could not fetch manager details:', managerError.message);
          // Don't fail the entire request if manager details fail
        }
      }
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
  const userData = personDetails || currentUser;
  const person = personDetails?.person || userData;

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
  const lc = safeToString(get(person, 'home_lc.name') || currentUser?.lc);
  const mc = safeToString(get(person, 'home_mc.name'));
  const entity = safeToString(get(person, 'home_entity.name'));
  const phone = safeToString(person?.phone || get(person, 'contact_info.phone') || currentUser?.phone);
  const createdAt = safeToString(person?.created_at || currentUser?.created_at);
  const updatedAt = safeToString(person?.updated_at || currentUser?.updated_at);
  const status = safeToString(person?.status || currentUser?.status);
  const gender = safeToString(person?.gender || currentUser?.gender);
  const birthday = safeToString(person?.birthday || currentUser?.birthday);
  
  // Handle backgrounds - could be array, object, or string
  const getBackgroundsDisplay = (bgs) => {
    if (Array.isArray(bgs)) {
      return bgs.join(', ');
    } else if (typeof bgs === 'object' && bgs !== null) {
      // If it's an object, try to extract meaningful values
      return Object.keys(bgs).join(', ');
    } else if (typeof bgs === 'string') {
      return bgs;
    }
    return 'N/A';
  };
  
  const backgrounds = getBackgroundsDisplay(person?.backgrounds || currentUser?.backgrounds);
  const education = safeToString(person?.education || currentUser?.education);
  const profilePhoto = person?.profile_photo_url || currentUser?.profile_photo_url || null;
  
  // Handle permissions - could be array, object, or string
  const getPermissionsDisplay = (perms) => {
    if (Array.isArray(perms)) {
      return perms.join(', ');
    } else if (typeof perms === 'object' && perms !== null) {
      // If it's an object with permission keys, extract the keys
      return Object.keys(perms).filter(key => perms[key] === true).join(', ');
    } else if (typeof perms === 'string') {
      return perms;
    }
    return 'N/A';
  };
  
  const permissions = getPermissionsDisplay(person?.permissions || currentUser?.permissions);
  const currentOffice = safeToString(get(person, 'current_office.title'));
  
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
  
  // Handle contact info - ensure it's properly formatted
  const getContactInfo = (contact) => {
    if (typeof contact === 'object' && contact !== null) {
      return contact;
    }
    return {};
  };
  
  const contactInfo = getContactInfo(person?.contact_info || currentUser?.contact_info);
  
  // Handle address - could be object or string
  const getAddressDisplay = (addr) => {
    if (typeof addr === 'object' && addr !== null) {
      // If it's an object, try to extract meaningful parts
      return Object.values(addr).filter(val => val && typeof val === 'string').join(', ');
    } else if (typeof addr === 'string') {
      return addr;
    }
    return 'N/A';
  };
  
  const address = getAddressDisplay(get(person, 'address'));
  const nationality = safeToString(person?.nationality);
  
  // Ensure current positions and offices are arrays
  const currentPositions = Array.isArray(personDetails?.current_positions) ? personDetails.current_positions : [];
  const currentOffices = Array.isArray(personDetails?.current_offices) ? personDetails.current_offices : [];
  const currentTeams = Array.isArray(personDetails?.current_teams) ? personDetails.current_teams : [];

  // Find current role (active, end_date null)
  const activeRole = roles.find(r => r && typeof r === 'object' && !r.end_date) || roles[0] || {};
  const currentRole = safeToString(activeRole && typeof activeRole === 'object' ? activeRole.role : null);
  const currentRoleEntity = safeToString(activeRole && typeof activeRole === 'object' ? get(activeRole, 'entity.name') : null);

  // Extract parent and manager information
  const parent = parentDetails?.parent || null;
  const manager = managerDetails?.manager || null;

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
      mt: 6,
      px: 0,
      pb: 8,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5fafd 0%, #e3f2fd 100%)',
      borderRadius: 6,
      boxShadow: '0 8px 40px rgba(25,118,210,0.08)',
    }}>
      {/* Gradient Header with Avatar */}
      <Paper elevation={4} sx={{
        p: 0,
        mb: 6,
        borderRadius: 5,
        overflow: 'hidden',
        background: 'linear-gradient(90deg, #1976d2 0%, #0CB9C1 100%)',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(25,118,210,0.10)',
        width: '100%',
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 7, position: 'relative' }}>
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
          <Chip label={status} color={status === 'active' ? 'success' : 'default'} sx={{ mb: 2, fontWeight: 700, fontSize: 18, px: 2, py: 1 }} />
          <Typography variant="h5" sx={{ color: '#e3f2fd', fontWeight: 600, mb: 1 }}>
            {currentRole} {currentRoleEntity !== 'N/A' ? `@ ${currentRoleEntity}` : ''}
          </Typography>
          <Typography variant="body1" sx={{ color: '#e3f2fd', mb: 1, fontWeight: 500 }}>
            LC: {lc} {mc !== 'N/A' && `| MC: ${mc}`}
          </Typography>
          <Tooltip title="Edit profile (coming soon)">
            <span>
              <IconButton disabled sx={{ color: '#fff', mt: 1 }}>
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Paper>

      {/* Info Sections - 3 columns on desktop, 1 on mobile, equal height */}
      <Grid container spacing={4} alignItems="stretch" sx={{ width: '100%', m: 0 }}>
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
              <Box display="flex" alignItems="center" gap={1}><EmailIcon color="primary" /> <b>Email:</b> {email}</Box>
              <Box display="flex" alignItems="center" gap={1}><PhoneIcon color="primary" /> <b>Phone:</b> {phone}</Box>
              <Box display="flex" alignItems="center" gap={1}><WcIcon color="primary" /> <b>Gender:</b> {gender}</Box>
              <Box display="flex" alignItems="center" gap={1}><CakeIcon color="primary" /> <b>Birthday:</b> {birthday}</Box>
              <Box display="flex" alignItems="center" gap={1}><LocationOnIcon color="primary" /> <b>Nationality:</b> {nationality}</Box>
              <Box display="flex" alignItems="center" gap={1}><LocationOnIcon color="primary" /> <b>Address:</b> {address}</Box>
              <Box display="flex" alignItems="center" gap={1}><SchoolIcon color="primary" /> <b>Backgrounds:</b> {backgrounds}</Box>
              <Box display="flex" alignItems="center" gap={1}><SchoolIcon color="primary" /> <b>Education:</b> {education}</Box>
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
              <Box display="flex" alignItems="center" gap={1}><BusinessIcon color="primary" /> <b>LC:</b> {lc}</Box>
              <Box display="flex" alignItems="center" gap={1}><BusinessIcon color="primary" /> <b>MC:</b> {mc}</Box>
              <Box display="flex" alignItems="center" gap={1}><BusinessIcon color="primary" /> <b>Entity:</b> {entity}</Box>
              <Box display="flex" alignItems="center" gap={1}><BadgeIcon color="primary" /> <b>EXPA ID:</b> {id}</Box>
              <Box display="flex" alignItems="center" gap={1}><BadgeIcon color="primary" /> <b>Status:</b> {status}</Box>
              <Box display="flex" alignItems="center" gap={1}><BadgeIcon color="primary" /> <b>Current Office:</b> {currentOffice}</Box>
              <Box display="flex" alignItems="center" gap={1}><BadgeIcon color="primary" /> <b>Permissions:</b> {permissions}</Box>
              {currentOffices.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>Active Offices:</Box>
                  {currentOffices.map((office, index) => (
                    <Box key={index} sx={{ ml: 1 }}>
                      <Box><b>{office.tag || 'Office'}:</b> {office.full_name || office.name}</Box>
                      {office.email && <Box sx={{ ml: 2, fontSize: '0.9em', color: 'text.secondary' }}>📧 {office.email}</Box>}
                    </Box>
                  ))}
                </>
              )}
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

      {/* Current Teams Section */}
      {currentTeams.length > 0 && (
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{
              p: 4,
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(25,118,210,0.07)',
              bgcolor: 'rgba(255,255,255,0.98)',
            }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', letterSpacing: 1, textAlign: 'center' }}>
                <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Current Teams
              </Typography>
              <Grid container spacing={2}>
                {currentTeams.map((team, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box sx={{
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      textAlign: 'center',
                      bgcolor: 'rgba(25,118,210,0.05)'
                    }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {team.name || 'Team'}
                      </Typography>
                      {team.description && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                          {team.description}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Parent and Manager Information */}
      {(parent || manager) && (
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            {parent && (
              <Paper elevation={3} sx={{
                p: 4,
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(25,118,210,0.07)',
                bgcolor: 'rgba(255,255,255,0.98)',
              }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', letterSpacing: 1, textAlign: 'center' }}>
                  <SupervisorAccountIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Parent Information
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="primary" />
                    <Box>
                      <b>Name:</b> {safeToString(parent.full_name || parent.name)}
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmailIcon color="primary" />
                    <Box>
                      <b>Email:</b> {safeToString(parent.email)}
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PhoneIcon color="primary" />
                    <Box>
                      <b>Phone:</b> {safeToString(parent.phone)}
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <BusinessIcon color="primary" />
                    <Box>
                      <b>LC:</b> {safeToString(get(parent, 'home_lc.name'))}
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <BadgeIcon color="primary" />
                    <Box>
                      <b>EXPA ID:</b> {safeToString(parent.id)}
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <BadgeIcon color="primary" />
                    <Box>
                      <b>Status:</b> {safeToString(parent.status)}
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {manager && (
              <Paper elevation={3} sx={{
                p: 4,
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(25,118,210,0.07)',
                bgcolor: 'rgba(255,255,255,0.98)',
              }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', letterSpacing: 1, textAlign: 'center' }}>
                  <SupervisorAccountIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Manager Information
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="primary" />
                    <Box>
                      <b>Name:</b> {safeToString(manager.full_name || manager.name)}
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmailIcon color="primary" />
                    <Box>
                      <b>Email:</b> {safeToString(manager.email)}
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PhoneIcon color="primary" />
                    <Box>
                      <b>Phone:</b> {safeToString(manager.phone)}
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <BusinessIcon color="primary" />
                    <Box>
                      <b>LC:</b> {safeToString(get(manager, 'home_lc.name'))}
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <BadgeIcon color="primary" />
                    <Box>
                      <b>EXPA ID:</b> {safeToString(manager.id)}
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <BadgeIcon color="primary" />
                    <Box>
                      <b>Status:</b> {safeToString(manager.status)}
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}

      {/* Additional Info Section */}
      {personDetails && (
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{
              p: 4,
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(25,118,210,0.07)',
              bgcolor: 'rgba(255,255,255,0.98)',
            }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', letterSpacing: 1, textAlign: 'center' }}>
                <CalendarTodayIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Additional Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box><b>Created:</b> {createdAt}</Box>
                    <Box><b>Last Updated:</b> {updatedAt}</Box>
                    <Box><b>EXPA ID:</b> {id}</Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box><b>Status:</b> {status}</Box>
                    <Box><b>Gender:</b> {gender}</Box>
                    <Box><b>Nationality:</b> {nationality}</Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ProfilePage; 
