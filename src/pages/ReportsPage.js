import React from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent,
  Button, Chip
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  NotificationsActive as NotificationsIcon
} from '@mui/icons-material';

function ReportsPage() {
  const comingSoonFeatures = [
    {
      icon: <AssessmentIcon sx={{ fontSize: 40, color: '#037ef3' }} />,
      title: 'Lead Analytics',
      description: 'Comprehensive lead generation and conversion analytics with interactive charts and real-time data visualization.',
      status: 'In Development'
    },
    {
      icon: <TimelineIcon sx={{ fontSize: 40, color: '#30C39E' }} />,
      title: 'Performance Tracking',
      description: 'Track team performance, individual KPIs, and conversion rates with detailed reporting and insights.',
      status: 'Planned'
    },
    {
      icon: <BarChartIcon sx={{ fontSize: 40, color: '#F85A40' }} />,
      title: 'Conversion Funnel',
      description: 'Visualize your lead conversion funnel and identify bottlenecks in the recruitment process.',
      status: 'In Development'
    },
    {
      icon: <PieChartIcon sx={{ fontSize: 40, color: '#FFC845' }} />,
      title: 'Source Analysis',
      description: 'Analyze lead sources and understand which channels drive the most qualified candidates.',
      status: 'Planned'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      title: 'Trend Reports',
      description: 'Monitor trends over time with customizable date ranges and automated report generation.',
      status: 'Coming Soon'
    },
    {
      icon: <NotificationsIcon sx={{ fontSize: 40, color: '#607d8b' }} />,
      title: 'Automated Insights',
      description: 'Get automated insights and recommendations to improve your recruitment performance.',
      status: 'Future'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Development':
        return 'primary';
      case 'Planned':
        return 'secondary';
      case 'Coming Soon':
        return 'success';
      case 'Future':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a202c', mb: 1 }}>
            Reports & Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Comprehensive insights and analytics for your recruitment performance
          </Typography>
        </Box>
        <Chip 
          label="Coming Soon" 
          color="primary" 
          variant="filled"
          sx={{ 
            fontSize: '1rem', 
            fontWeight: 600, 
            px: 2, 
            py: 1,
            bgcolor: '#037ef3',
            color: 'white'
          }} 
        />
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
          <AssessmentIcon sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Reports Coming Soon
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 }}>
            We're building powerful analytics and reporting tools to help you track, analyze, and optimize your recruitment performance.
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.8, lineHeight: 1.7 }}>
            Get ready for comprehensive dashboards, conversion funnels, team performance tracking, and automated insights that will transform how you manage your leads and measure success.
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

      {/* Features Grid */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1a202c' }}>
        What's Coming
      </Typography>
      
      <Grid container spacing={3}>
        {comingSoonFeatures.map((feature, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
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
                  {feature.icon}
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a202c' }}>
                      {feature.title}
                    </Typography>
                    <Chip 
                      label={feature.status} 
                      color={getStatusColor(feature.status)}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Info Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          mt: 4, 
          p: 3, 
          borderRadius: 3,
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a202c' }}>
          🚀 What to Expect
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Real-time analytics and performance tracking
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Interactive charts and visualizations
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Customizable reports and dashboards
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Team performance insights
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Export capabilities (PDF, Excel)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Automated insights and recommendations
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default ReportsPage;
