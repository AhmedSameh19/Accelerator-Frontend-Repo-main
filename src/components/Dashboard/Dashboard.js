import React from 'react';
import { Grid, Box, Typography, Card, CardContent, Chip, Paper, Button, Stack, useTheme } from '@mui/material';
import { 
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  QueryStats as QueryStatsIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import LeadStatusCard from './LeadStatusCard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

const MOCK_FUNNEL_DATA = [
  { name: 'Total Leads', value: 450, color: '#037EF3' },
  { name: 'Applied', value: 320, color: '#FFC845' },
  { name: 'Accepted', value: 85, color: '#00C16E' },
  { name: 'Realized', value: 42, color: '#F85A40' },
];

const MOCK_TREND_DATA = [
  { name: 'Jan', leads: 40, apps: 24 },
  { name: 'Feb', leads: 30, apps: 13 },
  { name: 'Mar', leads: 20, apps: 98 },
  { name: 'Apr', leads: 27, apps: 39 },
  { name: 'May', leads: 18, apps: 48 },
  { name: 'Jun', leads: 23, apps: 38 },
];

function Dashboard() {
  const muiTheme = useTheme();
  const { currentUser } = useAuth();
  
  return (
    <Box sx={{ pb: 6 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Montserrat, sans-serif', color: 'text.primary', mb: 0.5, letterSpacing: '-0.02em' }}>
            Hi, {currentUser?.name?.split(' ')[0] || 'User'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with AIESEC Egypt chapters today.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<QueryStatsIcon />}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          View Full Report
        </Button>
      </Box>

      {/* KPI Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <LeadStatusCard title="Total Leads" count="1,284" change={12} color="primary" icon={<PeopleIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <LeadStatusCard title="Applications" count="342" change={8} color="warning" icon={<AssessmentIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <LeadStatusCard title="Realizations" count="86" change={-2} color="success" icon={<AssignmentTurnedInIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <LeadStatusCard title="Conversion" count="14.2%" change={5} color="secondary" icon={<TrendingUpIcon />} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Performance Trend */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
                Performance Overview
              </Typography>
              <Chip label="Last 6 Months" size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />
            </Box>
            <Box sx={{ height: 350, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_TREND_DATA}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#037EF3" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#037EF3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={muiTheme.palette.divider} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: muiTheme.palette.text.secondary }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: muiTheme.palette.text.secondary }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 12, 
                      border: `1px solid ${muiTheme.palette.divider}`, 
                      boxShadow: '0 10px 25px var(--color-shadow)',
                      backgroundColor: 'var(--color-bg-card)',
                      color: 'var(--color-text-primary)'
                    }}
                    itemStyle={{ color: 'var(--color-text-primary)' }}
                  />
                  <Area type="monotone" dataKey="leads" stroke="#037EF3" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                  <Area type="monotone" dataKey="apps" stroke="#00C16E" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Funnel Chart */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif', mb: 3 }}>
              Conversion Pipeline
            </Typography>
            <Box sx={{ height: 300, width: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_FUNNEL_DATA} layout="vertical" margin={{ left: -20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: muiTheme.palette.text.primary }} width={80} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }} 
                    contentStyle={{ 
                      borderRadius: 12,
                      backgroundColor: 'var(--color-bg-card)',
                      border: `1px solid ${muiTheme.palette.divider}`,
                      color: 'var(--color-text-primary)'
                    }} 
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                    {MOCK_FUNNEL_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Stack spacing={1} sx={{ mt: 2 }}>
              {MOCK_FUNNEL_DATA.map((item) => (
                <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">{item.value} ({Math.round(item.value / 4.5)}%)</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
