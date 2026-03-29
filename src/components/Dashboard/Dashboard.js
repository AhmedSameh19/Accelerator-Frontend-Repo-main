import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, Card, CardContent, Chip,
  CircularProgress, IconButton, Tooltip, Divider, Stack, Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  FlightTakeoff as FlightTakeoffIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Business as BusinessIcon,
  EventNote as EventNoteIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
  Tooltip as RTooltip,
  Legend,
  XAxis, YAxis, CartesianGrid,
} from 'recharts';
import Cookies from 'js-cookie';
import { useAuth } from '../../context/AuthContext';
import dashboardAPI from '../../api/services/dashboardAPI';

// ─── Palette ──────────────────────────────────────────────────────────────────
const PALETTE = {
  blue:   '#037EF3',
  green:  '#00C16E',
  amber:  '#FFC845',
  red:    '#F85A40',
  purple: '#7C3AED',
  teal:   '#0EA5E9',
  pink:   '#EC4899',
};

const STATUS_COLORS = {
  lead:       PALETTE.blue,
  contacted:  PALETTE.teal,
  visited:    PALETTE.amber,
  opportunity: PALETTE.purple,
  realized:   PALETTE.green,
  realized_v2: PALETTE.green,
  pending:    PALETTE.amber,
  completed:  PALETTE.green,
  approved:   PALETTE.green,
  rejected:   PALETTE.red,
  unknown:    '#94a3b8',
};

function colorFor(status) {
  const normalized = (status || 'unknown').toLowerCase().replace(/[^a-z_]/g, '_');
  return STATUS_COLORS[normalized] || STATUS_COLORS.unknown;
}

// ─── Small reusable components ────────────────────────────────────────────────
function KPICard({ title, value, subtitle, icon, color, loading }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.10)', transform: 'translateY(-2px)' },
      }}
    >
      {/* Accent bar */}
      <Box sx={{ height: 4, bgcolor: color, width: '100%' }} />
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {title}
            </Typography>
            {loading ? (
              <CircularProgress size={20} sx={{ mt: 1, display: 'block', color }} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color, fontFeatureSettings: '"tnum"' }}>
                {value?.toLocaleString?.() ?? value ?? '—'}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{
            p: 1.5, borderRadius: 2, bgcolor: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ children, chip }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
        {children}
      </Typography>
      {chip && <Chip label={chip} size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />}
    </Box>
  );
}

const RADIAN = Math.PI / 180;
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function StatusPie({ data, loading }) {
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (!data || data.length === 0) return <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>No data</Typography>;

  return (
    <Box>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%" outerRadius={80}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={colorFor(entry.name)} />
            ))}
          </Pie>
          <RTooltip
            formatter={(value, name) => [value, name]}
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.10)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <Stack spacing={0.5} sx={{ px: 1 }}>
        {data.slice(0, 8).map((item) => (
          <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colorFor(item.name), flexShrink: 0 }} />
              <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{item.name}</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 700, fontFeatureSettings: '"tnum"' }}>{item.value.toLocaleString()}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function FollowUpBar({ ogx, icx, loading }) {
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;

  const data = [
    { name: 'OGX', Pending: ogx.pending, Completed: ogx.completed },
    { name: 'ICX', Pending: icx.pending, Completed: icx.completed },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barCategoryGap="40%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
        <RTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.10)' }} />
        <Legend iconType="circle" iconSize={8} />
        <Bar dataKey="Pending" fill={PALETTE.amber} radius={[4, 4, 0, 0]} />
        <Bar dataKey="Completed" fill={PALETTE.green} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function MarketBar({ igv, b2b, loading }) {
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;

  const data = [
    { name: 'IGV', Total: igv.total, Visited: igv.visits_scheduled },
    { name: 'B2B', Total: b2b.total, Visited: b2b.visits_scheduled },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barCategoryGap="40%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
        <RTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.10)' }} />
        <Legend iconType="circle" iconSize={8} />
        <Bar dataKey="Total" fill={PALETTE.purple} radius={[4, 4, 0, 0]} />
        <Bar dataKey="Visited" fill={PALETTE.teal} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Transforms ───────────────────────────────────────────────────────────────
function distToChartData(dist) {
  return Object.entries(dist || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Resolve LC ID from various storage mechanisms
  const lcId = parseInt(
    Cookies.get('lc_id') ||
    Cookies.get('home_lc_id') ||
    Cookies.get('userLC') ||
    localStorage.getItem('lc_id') ||
    localStorage.getItem('home_lc_id') ||
    localStorage.getItem('userLC') ||
    currentUser?.home_lc_id ||
    '1609',
    10
  );

  const load = useCallback(async (invalidate = false) => {
    try {
      if (invalidate) {
        setRefreshing(true);
        await dashboardAPI.invalidateCache(lcId);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await dashboardAPI.getStats(lcId);
      setStats(data);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lcId]);

  useEffect(() => { load(); }, [load]);

  const isLoading = loading;
  const ogx = stats?.ogx;
  const icx = stats?.icx;
  const mr = stats?.market_research;

  const lcName = currentUser?.home_lc_name || `LC ${lcId}`;
  const firstName = currentUser?.name?.split(' ')[0] || 'User';

  return (
    <Box sx={{ pb: 6 }}>
      {/* ─── Header ─── */}
      <Box sx={{
        mb: 4,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
      }}>
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, fontFamily: 'Montserrat, sans-serif', color: 'text.primary', mb: 0.5, letterSpacing: '-0.02em' }}
          >
            Hi, {firstName}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Live analytics for <strong>{lcName}</strong>
            {lcId !== 1609 && (
              <Chip
                label={`LC ${lcId}`}
                size="small"
                sx={{ ml: 1, borderRadius: 1.5, fontWeight: 700, bgcolor: `${PALETTE.blue}18`, color: PALETTE.blue, border: 'none' }}
              />
            )}
          </Typography>
        </Box>
        <Tooltip title={refreshing ? 'Refreshing…' : 'Force refresh (clears cache)'}>
          <span>
            <IconButton
              onClick={() => load(true)}
              disabled={refreshing || isLoading}
              sx={{
                border: '1px solid', borderColor: 'divider', borderRadius: 2,
                '&:hover': { bgcolor: `${PALETTE.blue}12` },
              }}
            >
              <RefreshIcon sx={{ fontSize: 20, transition: 'transform 0.4s', transform: refreshing ? 'rotate(360deg)' : 'none' }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* ─── Top KPI Row ─── */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={6} sm={4} md={2}>
          <KPICard
            title="OGX Leads" icon={<PeopleIcon />} color={PALETTE.blue}
            value={ogx?.leads?.total} loading={isLoading}
            subtitle={`${ogx?.leads?.assigned ?? '—'} assigned`}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <KPICard
            title="OGX Realizations" icon={<AssignmentTurnedInIcon />} color={PALETTE.green}
            value={ogx?.realizations?.total} loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <KPICard
            title="ICX Leads" icon={<FlightTakeoffIcon />} color={PALETTE.teal}
            value={icx?.leads?.total} loading={isLoading}
            subtitle={`${icx?.leads?.assigned ?? '—'} assigned`}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <KPICard
            title="ICX Realizations" icon={<CheckCircleOutlineIcon />} color={PALETTE.purple}
            value={icx?.realizations?.total} loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <KPICard
            title="Market Research" icon={<BusinessIcon />} color={PALETTE.pink}
            value={mr?.total} loading={isLoading}
            subtitle={`${mr?.total_visits ?? '—'} visits`}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <KPICard
            title="Follow-Ups" icon={<NotificationsIcon />} color={PALETTE.amber}
            value={(ogx?.follow_ups?.total ?? 0) + (icx?.follow_ups?.total ?? 0)}
            loading={isLoading}
            subtitle={`${(ogx?.follow_ups?.pending ?? 0) + (icx?.follow_ups?.pending ?? 0)} pending`}
          />
        </Grid>
      </Grid>

      {/* ─── Row 2: OGX + ICX Lead Status Pies ─── */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <SectionTitle chip="OGX">Lead Status Distribution</SectionTitle>
            <StatusPie
              data={distToChartData(ogx?.leads?.status_distribution)}
              loading={isLoading}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <SectionTitle chip="ICX">Lead Status Distribution</SectionTitle>
            <StatusPie
              data={distToChartData(icx?.leads?.status_distribution)}
              loading={isLoading}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={12} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <SectionTitle>Follow-Up Overview</SectionTitle>
            <FollowUpBar
              ogx={ogx?.follow_ups ?? { pending: 0, completed: 0 }}
              icx={icx?.follow_ups ?? { pending: 0, completed: 0 }}
              loading={isLoading}
            />
            <Divider sx={{ my: 1.5 }} />
            <Grid container spacing={1}>
              {[
                { label: 'OGX Total', val: ogx?.follow_ups?.total, color: PALETTE.blue },
                { label: 'ICX Total', val: icx?.follow_ups?.total, color: PALETTE.teal },
                { label: 'Pending', val: (ogx?.follow_ups?.pending ?? 0) + (icx?.follow_ups?.pending ?? 0), color: PALETTE.amber },
                { label: 'Done', val: (ogx?.follow_ups?.completed ?? 0) + (icx?.follow_ups?.completed ?? 0), color: PALETTE.green },
              ].map(({ label, val, color }) => (
                <Grid item xs={6} key={label}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}10`, textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color, fontFeatureSettings: '"tnum"' }}>
                      {isLoading ? '…' : (val ?? 0).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* ─── Row 3: Realizations + Market Research ─── */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <SectionTitle chip="OGX">Realization Statuses</SectionTitle>
            <StatusPie
              data={distToChartData(ogx?.realizations?.status_distribution)}
              loading={isLoading}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <SectionTitle chip="ICX">Realization Statuses</SectionTitle>
            <StatusPie
              data={distToChartData(icx?.realizations?.status_distribution)}
              loading={isLoading}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={12} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <SectionTitle>Market Research Pipeline</SectionTitle>
            <MarketBar
              igv={mr?.igv ?? { total: 0, visits_scheduled: 0 }}
              b2b={mr?.b2b ?? { total: 0, visits_scheduled: 0 }}
              loading={isLoading}
            />
            <Divider sx={{ my: 1.5 }} />
            <Grid container spacing={1}>
              {[
                { label: 'IGV Total', val: mr?.igv?.total, color: PALETTE.purple },
                { label: 'B2B Total', val: mr?.b2b?.total, color: PALETTE.pink },
                { label: 'IGV Visits', val: mr?.igv?.visits_scheduled, color: PALETTE.teal },
                { label: 'B2B Visits', val: mr?.b2b?.visits_scheduled, color: PALETTE.amber },
              ].map(({ label, val, color }) => (
                <Grid item xs={6} key={label}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}10`, textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color, fontFeatureSettings: '"tnum"' }}>
                      {isLoading ? '…' : (val ?? 0).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* ─── Row 4: MR Status Breakdown ─── */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <SectionTitle chip="IGV">Market Research Status</SectionTitle>
            <StatusPie
              data={distToChartData(mr?.igv?.status_distribution)}
              loading={isLoading}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <SectionTitle chip="B2B">Market Research Status</SectionTitle>
            <StatusPie
              data={distToChartData(mr?.b2b?.status_distribution)}
              loading={isLoading}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
