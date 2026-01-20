import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, CardHeader, Button, Grid, Chip, Divider, Stack, useTheme, Fade, Stepper, Step, StepLabel,
  FormControl, InputLabel, Select, MenuItem, TextField, Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import WorkIcon from '@mui/icons-material/Work';
import LinkIcon from '@mui/icons-material/Link';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { fetchOpportunityApplications } from '../../api/services/aiesecApi';

export default function LeadApplicationsPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interview state for each application
  const [interviewData, setInterviewData] = useState({});

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        const apps = await fetchOpportunityApplications(leadId, "2020-01-01");
        setApplications(apps);
        loadInterviewData(apps);
      } catch (error) {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [leadId]);

  // Helper for status color
  const getStatusColor = (status) => {
    if (!status) return 'default';
    const s = status.toLowerCase();
    if (s.includes('accepted') || s.includes('approved')) return 'success';
    if (s.includes('open') || s.includes('applied')) return 'primary';
    if (s.includes('rejected') || s.includes('broken')) return 'error';
    if (s.includes('realized') || s.includes('finished')) return 'info';
    return 'default';
  };

  // Helper for product color
  const getProductColor = (prod) => {
    if (!prod) return '#e0e0e0';
    const p = prod.toLowerCase();
    if (p.includes('gv')) return '#F85A40';
    if (p.includes('gta')) return '#0CB9C1';
    if (p.includes('gte')) return '#F48924';
    return theme.palette.primary.main;
  };

  // Interview handlers
  const handleInterviewedChange = (appId, value) => {
    const updatedData = {
      ...interviewData,
      [appId]: {
        ...interviewData[appId],
        interviewed: value,
        interviewStatus: value !== 'Yes' ? '' : (interviewData[appId]?.interviewStatus || ''),
        rejectionReason: value !== 'Yes' ? '' : (interviewData[appId]?.rejectionReason || '')
      }
    };
    setInterviewData(updatedData);
    
    // Auto-save to localStorage
    const interviewEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      applicationId: appId,
      interviewed: value,
      interviewStatus: value !== 'Yes' ? '' : (interviewData[appId]?.interviewStatus || ''),
      rejectionReason: value !== 'Yes' ? '' : (interviewData[appId]?.rejectionReason || ''),
      author: 'Current User'
    };
    localStorage.setItem(`application_interview_status_${appId}`, JSON.stringify(interviewEntry));
  };

  const handleInterviewStatusChange = (appId, value) => {
    const updatedData = {
      ...interviewData,
      [appId]: {
        ...interviewData[appId],
        interviewStatus: value,
        rejectionReason: value !== 'Rejected' ? '' : (interviewData[appId]?.rejectionReason || '')
      }
    };
    setInterviewData(updatedData);
    
    // Auto-save to localStorage
    const interviewEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      applicationId: appId,
      interviewed: interviewData[appId]?.interviewed || '',
      interviewStatus: value,
      rejectionReason: value !== 'Rejected' ? '' : (interviewData[appId]?.rejectionReason || ''),
      author: 'Current User'
    };
    localStorage.setItem(`application_interview_status_${appId}`, JSON.stringify(interviewEntry));
  };

  const handleRejectionReasonChange = (appId, value) => {
    const updatedData = {
      ...interviewData,
      [appId]: {
        ...interviewData[appId],
        rejectionReason: value
      }
    };
    setInterviewData(updatedData);
    
    // Auto-save to localStorage
    const interviewEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      applicationId: appId,
      interviewed: interviewData[appId]?.interviewed || '',
      interviewStatus: interviewData[appId]?.interviewStatus || '',
      rejectionReason: value,
      author: 'Current User'
    };
    localStorage.setItem(`application_interview_status_${appId}`, JSON.stringify(interviewEntry));
  };

  // Load interview data for all applications
  const loadInterviewData = (apps) => {
    const loadedData = {};
    apps.forEach(app => {
      const storedData = localStorage.getItem(`application_interview_status_${app.id}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        loadedData[app.id] = {
          interviewed: parsedData.interviewed || '',
          interviewStatus: parsedData.interviewStatus || '',
          rejectionReason: parsedData.rejectionReason || ''
        };
      }
    });
    setInterviewData(loadedData);
  };

  // Robust back navigation
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/leads');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #f8fafc 100%)',
      boxSizing: 'border-box',
      pb: 8
    }}>
      {/* Header */}
      <Box sx={{
        width: '100%',
        bgcolor: 'white',
        boxShadow: '0 4px 24px rgba(40,60,90,0.10)',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        px: { xs: 2, md: 6 },
        py: { xs: 2, md: 3 },
        mb: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{
            borderRadius: 3,
            fontWeight: 700,
            px: 3,
            py: 1.2,
            fontSize: '1rem',
            color: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            background: 'linear-gradient(90deg, #e3f2fd 0%, #f8fafc 100%)',
            boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
            transition: 'all 0.2s',
            '&:hover': {
              background: 'linear-gradient(90deg, #0CB9C1 0%, #1976d2 100%)',
              color: '#fff',
              borderColor: theme.palette.primary.main,
              boxShadow: '0 4px 16px rgba(25,118,210,0.16)'
            }
          }}
          variant="outlined"
        >
          Back to Leads
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 900, color: theme.palette.primary.main, letterSpacing: 1, textAlign: 'center', flex: 1 }}>
          Opportunity Applications
        </Typography>
        <Box sx={{ width: 120 }} /> {/* Spacer for symmetry */}
      </Box>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 1, md: 0 } }}>
        <Divider sx={{ mb: 4, borderColor: theme.palette.primary.light, opacity: 0.4 }} />
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: theme.palette.primary.dark, letterSpacing: 0.5, textAlign: 'left' }}>
          {applications.length > 0 ? `Showing ${applications.length} Application${applications.length > 1 ? 's' : ''}` : 'No Applications'}
        </Typography>
        {loading ? (
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 8 }}>
            Loading applications...
          </Typography>
        ) : applications.length === 0 ? (
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 8 }}>
            No applications found.
          </Typography>
        ) : (
          <Stack spacing={4}>
            {applications.map((app, idx) => {
              const oppLink = app.opportunity?.id ? `https://aiesec.org/opportunity/${app.opportunity.id}` : null;
              return (
                <Fade in timeout={600 + idx * 100} key={app.id}>
                  <Card
                    elevation={4}
                    sx={{
                      borderRadius: 4,
                      bgcolor: 'white',
                      transition: 'box-shadow 0.2s',
                      boxShadow: '0 4px 24px rgba(40,60,90,0.10)',
                      cursor: oppLink ? 'pointer' : 'default',
                      '&:hover': {
                        boxShadow: oppLink ? '0 8px 32px rgba(25,118,210,0.18)' : undefined,
                        borderColor: oppLink ? theme.palette.primary.main : undefined,
                        background: oppLink ? 'linear-gradient(90deg, #e3f2fd 0%, #f8fafc 100%)' : undefined,
                      },
                      width: '100%',
                      px: 0,
                      py: 0,
                    }}
                    onClick={() => {
                      if (oppLink) window.open(oppLink, '_blank');
                    }}
                  >
                    <CardHeader
                      avatar={<AssignmentIndIcon color="primary" />}
                      title={<Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>{app.opportunity?.title || '-'}</Typography>}
                      subheader={<Stack direction="row" spacing={1}>
                        <Chip label={app.status} color={getStatusColor(app.status)} size="small" sx={{ fontWeight: 700, fontSize: '0.95rem' }} />
                        <Chip label={app.opportunity?.programme?.short_name_display || '-'} size="small" sx={{ fontWeight: 700, fontSize: '0.95rem', bgcolor: getProductColor(app.opportunity?.programme?.short_name_display), color: '#fff' }} />
                      </Stack>}
                      sx={{ pb: 0 }}
                    />
                    <CardContent sx={{ pt: 1, width: '100%', px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
                      <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
                        {/* EP Info */}
                        <Grid item xs={12} md={6} sx={{ width: '100%' }}>
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>EP Information</Typography>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <PersonIcon color="primary" />
                            <Typography variant="body1" fontWeight={700}>{app.person?.full_name || '-'}</Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PhoneIcon color="primary" />
                            <Typography variant="body2">{app.person?.contact_detail?.phone || '-'}</Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ mt: 1 }}>EP ID: <b>{app.person?.id || '-'}</b></Typography>
                          <Typography variant="body2">Application ID: <b>{app.id}</b></Typography>
                        </Grid>
                        {/* Opportunity Info */}
                        <Grid item xs={12} md={6} sx={{ width: '100%' }}>
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>Opportunity</Typography>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <WorkIcon color="primary" />
                            <Typography variant="body1" fontWeight={700}>{app.opportunity?.title || '-'}</Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <LinkIcon color="primary" />
                            <a href={app.person?.cvs?.[0]?.url || '#'} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main, fontWeight: 600, textDecoration: 'underline' }} onClick={e => e.stopPropagation()}>CV Link</a>
                          </Stack>
                          <Typography variant="body2" sx={{ mt: 1 }}>OP ID: <b>{app.opportunity?.id || '-'}</b></Typography>
                          <Typography variant="body2">Sub-product: <b>{app.opportunity?.sub_product?.name || '-'}</b></Typography>
                        </Grid>
                        {/* Home/Host Info */}
                        <Grid item xs={12} md={6} sx={{ width: '100%' }}>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>Home & Host Info</Typography>
                          <Typography variant="body2">Home LC: <b>{app.person?.home_lc?.name || '-'}</b></Typography>
                          <Typography variant="body2">Home MC: <b>{app.person?.home_mc?.name || '-'}</b></Typography>
                          <Typography variant="body2">Host LC: <b>{app.opportunity?.host_lc?.name || '-'}</b></Typography>
                          <Typography variant="body2">Host MC: <b>{app.opportunity?.home_mc?.name || '-'}</b></Typography>
                        </Grid>
                        {/* Timeline as Stepper */}
                        <Grid item xs={12} md={6} sx={{ width: '100%' }}>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>Timeline</Typography>
                          <Stepper alternativeLabel activeStep={
                            [app.person?.created_at, app.created_at, app.date_matched, app.date_approved, app.date_realized, app.experience_end_date].filter(Boolean).length - 1
                          } sx={{ mb: 2 }}>
                            {[
                              { label: 'Signed Up', date: app.person?.created_at },
                              { label: 'Applied', date: app.created_at },
                              { label: 'Accepted', date: app.date_matched },
                              { label: 'Approved', date: app.date_approved },
                              { label: 'Realized', date: app.date_realized },
                              { label: 'Finished', date: app.experience_end_date }
                            ].map((step, idx) => (
                              <Step key={step.label} completed={!!step.date}>
                                <StepLabel
                                  StepIconProps={{
                                    style: {
                                      color: step.date ? theme.palette.primary.main : '#bdbdbd',
                                      fontWeight: 700
                                    }
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{step.label}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {step.date ? new Date(step.date).toLocaleDateString() : ''}
                                  </Typography>
                                </StepLabel>
                              </Step>
                            ))}
                          </Stepper>
                        </Grid>
                        
                        {/* Interview Section - Only show if application status is rejected */}
                        {app.status?.toLowerCase().includes('rejected') && (
                          <Grid item xs={12} sx={{ width: '100%' }}>
                            <Divider sx={{ my: 2 }} />
                            <Paper 
                              elevation={1} 
                              sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8fafc', boxShadow: '0 1px 4px rgba(40,60,90,0.04)' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 700, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AssignmentIndIcon color="primary" /> Interview Status
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}>
                                  <FormControl fullWidth sx={{ mb: 2, minWidth: 150 }}>
                                    <InputLabel sx={{ fontSize: '0.95rem', top: '-4px' }}>Interviewed</InputLabel>
                                    <Select
                                      value={interviewData[app.id]?.interviewed || ''}
                                      onChange={(e) => handleInterviewedChange(app.id, e.target.value)}
                                      label="Interviewed"
                                      sx={{ fontSize: '0.95rem', height: 56, minHeight: 56, minWidth: 150, width: '100%', '.MuiSelect-select': { py: 2, minWidth: 130, width: '100%' } }}
                                    >
                                      <MenuItem value="" sx={{ fontSize: '0.95rem', minHeight: 52, minWidth: 150, width: '100%' }}>Select</MenuItem>
                                      <MenuItem value="Yes" sx={{ fontSize: '0.95rem', minHeight: 52, minWidth: 150, width: '100%' }}>Yes</MenuItem>
                                      <MenuItem value="No" sx={{ fontSize: '0.95rem', minHeight: 52, minWidth: 150, width: '100%' }}>No</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                                {(interviewData[app.id]?.interviewed === 'Yes') && (
                                  <Grid item xs={12} sm={6} md={4}>
                                    <FormControl fullWidth sx={{ mb: 2, minWidth: 150 }}>
                                      <InputLabel sx={{ fontSize: '0.95rem', top: '-4px' }}>Interview Status</InputLabel>
                                      <Select
                                        value={interviewData[app.id]?.interviewStatus || ''}
                                        onChange={(e) => handleInterviewStatusChange(app.id, e.target.value)}
                                        label="Interview Status"
                                        sx={{ fontSize: '0.95rem', height: 56, minHeight: 56, minWidth: 150, width: '100%', '.MuiSelect-select': { py: 2, minWidth: 130, width: '100%' } }}
                                      >
                                        <MenuItem value="" sx={{ fontSize: '0.95rem', minHeight: 52, minWidth: 150, width: '100%' }}>Select</MenuItem>
                                        <MenuItem value="Accepted" sx={{ fontSize: '0.95rem', minHeight: 52, minWidth: 150, width: '100%' }}>Accepted</MenuItem>
                                        <MenuItem value="Rejected" sx={{ fontSize: '0.95rem', minHeight: 52, minWidth: 150, width: '100%' }}>Rejected</MenuItem>
                                      </Select>
                                    </FormControl>
                                  </Grid>
                                )}
                                {(interviewData[app.id]?.interviewStatus === 'Rejected') && (
                                  <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                      fullWidth
                                      label="Reason for Rejection"
                                      value={interviewData[app.id]?.rejectionReason || ''}
                                      onChange={(e) => handleRejectionReasonChange(app.id, e.target.value)}
                                      multiline
                                      rows={2}
                                      sx={{ 
                                        fontSize: '0.95rem', 
                                        minWidth: 150, 
                                        width: '100%',
                                        '& .MuiInputLabel-root': {
                                          fontSize: '0.95rem',
                                          top: '-4px'
                                        },
                                        '& .MuiInputBase-root': {
                                          fontSize: '0.95rem',
                                          minHeight: 56
                                        }
                                      }}
                                      placeholder="Enter the reason for rejection..."
                                    />
                                  </Grid>
                                )}
                              </Grid>
                            </Paper>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Fade>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
} 