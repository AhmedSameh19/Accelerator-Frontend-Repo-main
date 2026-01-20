import React from 'react';
import { Grid, Box, Typography, Card, CardContent, Chip, Paper, Button } from '@mui/material';
import { 
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import ExpaMetrics from './ExpaMetrics';
import MarketResearchMetrics from './MarketResearchMetrics';

function Dashboard() {
  const { currentUser } = useAuth();
  
  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a202c', mb: 1 }}>
          Hi, {currentUser?.name || 'User'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Welcome to your AIESEC CRM Dashboard
        </Typography>
      </Box>

      {/* Main Coming Soon Card */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <DashboardIcon sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Dashboard Coming Soon
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 }}>
            We're building a comprehensive dashboard with real-time analytics, lead tracking, and performance insights.
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.8, lineHeight: 1.7 }}>
            Get ready for interactive charts, lead conversion tracking, team performance metrics, and personalized insights that will help you optimize your recruitment efforts.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            sx={{ 
              bgcolor: 'white', 
              color: '#667eea', 
              fontWeight: 600,
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: '#f8fafc',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Get Notified When Available
          </Button>
        </Box>
      </Paper>

      {/* EXPA Metrics Section (added, do not modify existing sections) */}
      <ExpaMetrics />

      {/* Market Research Metrics Section */}
      <MarketResearchMetrics />

      {/* Features Grid */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1a202c' }}>
        What's Coming
      </Typography>
      
      <Grid container spacing={3}>
        <Grid span={{ xs: 12, md: 6, lg: 4 }}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%', 
              p: 3, 
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                borderColor: '#037ef3'
              }
            }}
          >
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon sx={{ fontSize: 40, color: '#037ef3' }} />
                <Box sx={{ ml: 2, flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a202c' }}>
                    Real-time Analytics
                  </Typography>
                  <Chip 
                    label="In Development" 
                    color="primary"
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Live dashboards with real-time lead tracking, conversion rates, and performance metrics.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid span={{ xs: 12, md: 6, lg: 4 }}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%', 
              p: 3, 
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                borderColor: '#30C39E'
              }
            }}
          >
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon sx={{ fontSize: 40, color: '#30C39E' }} />
                <Box sx={{ ml: 2, flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a202c' }}>
                    Lead Conversion Tracking
                  </Typography>
                  <Chip 
                    label="Coming Soon" 
                    color="success"
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Track leads through the entire funnel with detailed conversion analytics and insights.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid span={{ xs: 12, md: 6, lg: 4 }}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%', 
              p: 3, 
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                borderColor: '#F85A40'
              }
            }}
          >
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon sx={{ fontSize: 40, color: '#F85A40' }} />
                <Box sx={{ ml: 2, flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a202c' }}>
                    Team Performance
                  </Typography>
                  <Chip 
                    label="Planned" 
                    color="secondary"
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Monitor team performance, individual KPIs, and productivity metrics with detailed reporting.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
