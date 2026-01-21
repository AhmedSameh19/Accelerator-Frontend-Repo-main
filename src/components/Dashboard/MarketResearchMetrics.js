import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  Business as BusinessIcon,
  Phone as PhoneIcon,
  EventAvailable as EventAvailableIcon,
  MeetingRoom as MeetingRoomIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { API_BASE } from '../../utils/apiBase';
import { getCrmAccessToken } from '../../utils/crmToken';

const apiBase = API_BASE;

// Funnel stages matching the screenshot
const funnelStages = [
  {
    label: 'Market Research',
    icon: <BusinessIcon />,
    description: 'Initial research phase',
    key: 'market_research',
    color: '#4CAF50'
  },
  {
    label: 'Contacted',
    icon: <PhoneIcon />,
    description: 'Company has been contacted',
    key: 'contacted',
    color: '#2196F3'
  },
  {
    label: 'Visit Scheduled',
    icon: <EventAvailableIcon />,
    description: 'Visit has been scheduled',
    key: 'visit_scheduled',
    color: '#2196F3'
  },
  {
    label: 'Visit Completed',
    icon: <MeetingRoomIcon />,
    description: 'Company visit completed',
    key: 'visit_completed',
    color: '#2196F3'
  },
  {
    label: 'Opportunity Raised',
    icon: <TrendingUpIcon />,
    description: 'Opportunity has been raised',
    key: 'opportunity_raised',
    color: '#2196F3'
  }
];

const accountTypeColors = {
  iCX: { primary: '#4CAF50', light: '#E8F5E9' },
  B2B: { primary: '#2196F3', light: '#E3F2FD' },
  B2C: { primary: '#FF9800', light: '#FFF3E0' }
};

function MarketResearchMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const token = getCrmAccessToken();

    async function fetchMetrics() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${apiBase}/api/market-research/metrics`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch market research metrics');
        }

        const data = await response.json();
        if (!mounted) return;

        if (data.success && data.data) {
          setMetrics(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Error fetching market research metrics:', err);
        setError(err.message);
        // Set empty metrics on error
        setMetrics({
          iCX: {
            market_research: 0,
            contacted: 0,
            visit_scheduled: 0,
            visit_completed: 0,
            opportunity_raised: 0
          },
          B2B: {
            market_research: 0,
            contacted: 0,
            visit_scheduled: 0,
            visit_completed: 0,
            opportunity_raised: 0
          },
          B2C: {
            market_research: 0,
            contacted: 0,
            visit_scheduled: 0,
            visit_completed: 0,
            opportunity_raised: 0
          }
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (token) {
      fetchMetrics();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, []);

  const renderFunnelForAccountType = (accountType, accountMetrics) => {
    if (!accountMetrics) return null;

    return (
      <Card
        key={accountType}
        elevation={0}
        sx={{
          height: '100%',
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Account Type Header */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a202c' }}>
                {accountType} Metrics
              </Typography>
              <Chip
                label={`${accountMetrics.market_research || 0} Total`}
                size="small"
                sx={{
                  bgcolor: accountTypeColors[accountType]?.light || '#f5f5f5',
                  color: accountTypeColors[accountType]?.primary || '#666',
                  fontWeight: 600
                }}
              />
            </Box>
            <Divider />
          </Box>

          {/* Funnel Visualization */}
          <Box sx={{ position: 'relative' }}>
            <Stepper orientation="vertical" activeStep={-1}>
              {funnelStages.map((stage, index) => {
                const count = accountMetrics[stage.key] || 0;
                const isCompleted = count > 0;
                const prevCount = index > 0 ? (accountMetrics[funnelStages[index - 1].key] || 0) : accountMetrics.market_research || 0;
                const conversionRate = prevCount > 0 ? ((count / prevCount) * 100).toFixed(1) : 0;

                return (
                  <Step key={stage.key} completed={isCompleted}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: isCompleted ? stage.color : '#e0e0e0',
                            color: isCompleted ? 'white' : '#9e9e9e',
                            border: `3px solid ${isCompleted ? stage.color : '#e0e0e0'}`,
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {stage.icon}
                        </Box>
                      )}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: isCompleted ? 600 : 400,
                            color: isCompleted ? '#1a202c' : '#9e9e9e'
                          }}
                        >
                          {stage.label}
                        </Typography>
                        <Chip
                          label={count}
                          size="small"
                          sx={{
                            bgcolor: isCompleted ? stage.color : '#e0e0e0',
                            color: isCompleted ? 'white' : '#9e9e9e',
                            fontWeight: 600,
                            minWidth: 50
                          }}
                        />
                        {index > 0 && prevCount > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            ({conversionRate}%)
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        {stage.description}
                      </Typography>
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1a202c' }}>
          Market Research Funnel
        </Typography>
        <Card>
          <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error && !metrics) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1a202c' }}>
          Market Research Funnel
        </Typography>
        <Card>
          <CardContent>
            <Typography color="error">Error loading market research metrics: {error}</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Section Title */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1a202c' }}>
        Market Research Funnel
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track companies through the funnel from initial research to opportunity raised, separated by account type
      </Typography>

      {/* Metrics by Account Type */}
      <Grid container spacing={3}>
        {metrics?.iCX && (
          <Grid item xs={12} md={4}>
            {renderFunnelForAccountType('iCX', metrics.iCX)}
          </Grid>
        )}
        {metrics?.B2B && (
          <Grid item xs={12} md={4}>
            {renderFunnelForAccountType('B2B', metrics.B2B)}
          </Grid>
        )}
        {metrics?.B2C && (
          <Grid item xs={12} md={4}>
            {renderFunnelForAccountType('B2C', metrics.B2C)}
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default MarketResearchMetrics;

