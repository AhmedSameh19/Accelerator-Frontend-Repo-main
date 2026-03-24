import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Divider, Stack, useTheme } from '@mui/material';
import { fetchOpportunityApplications } from '../../api/services/aiesecApi';
import PageHeader from './LeadApplicationsPage/PageHeader';
import ApplicationCard from './LeadApplicationsPage/ApplicationCard';
import InterviewSection from './LeadApplicationsPage/InterviewSection';
import { useInterviewHandlers } from '../../hooks/leads/useInterviewHandlers';

export default function LeadApplicationsPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const {
    interviewData,
    handleInterviewedChange,
    handleInterviewStatusChange,
    handleRejectionReasonChange,
    loadInterviewData
  } = useInterviewHandlers();

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
  }, [leadId, loadInterviewData]);

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
      bgcolor: 'background.default',
      boxSizing: 'border-box',
      pb: 8
    }}>
      <PageHeader onBack={handleBack} />
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 1, md: 0 } }}>
        <Divider sx={{ mb: 4, borderColor: 'divider' }} />
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
            {applications.map((app, idx) => (
              <React.Fragment key={app.id}>
                <ApplicationCard
                  app={app}
                  index={idx}
                  theme={theme}
                />
                {app.status?.toLowerCase().includes('rejected') && (
                  <Box sx={{ px: { xs: 2, md: 4 } }}>
                    <InterviewSection
                      appId={app.id}
                      interviewData={interviewData}
                      onInterviewedChange={(appId, value) => handleInterviewedChange(appId, value, interviewData[appId])}
                      onInterviewStatusChange={(appId, value) => handleInterviewStatusChange(appId, value, interviewData[appId])}
                      onRejectionReasonChange={(appId, value) => handleRejectionReasonChange(appId, value, interviewData[appId])}
                    />
                  </Box>
                )}
              </React.Fragment>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
} 