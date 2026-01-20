import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LeadStatusCard from './LeadStatusCard';
import { Assessment as AssessmentIcon } from '@mui/icons-material';
import { getProfile } from '../../api/getProfile';
import { API_BASE } from '../../utils/apiBase';
import { getCrmAccessToken } from '../../utils/crmToken';

const apiBase = API_BASE;

// replace api hooks with role-aware fetch
function useMetric(endpoint) {
  const [payload, setPayload] = useState({ scope:null, total:0, rows:[] });
  const [loading, setLoading] = useState(true);
  const token = getCrmAccessToken();

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        const prof = await getProfile();
        if (!prof) { if(mounted) setPayload({scope:null,total:0,rows:[]}); return; }
        const r = await fetch(`${apiBase}${endpoint}`, { 
          headers: { Authorization:`Bearer ${token}` },
          credentials: 'include' // Include cookies for cookie-based RBAC fallback
        });
        const j = await r.json();
        if (!mounted) return;
        // normalize
        if (Array.isArray(j?.data)) { // old shape
          setPayload({ scope: prof.mc_code && !prof.lc_code ? 'national' : 'lc',
                       total: j.data.reduce((s,x)=>s+(x.count||x.demand||0),0),
                       rows: j.data });
        } else if (j?.data && Array.isArray(j.data)) {
          // demand endpoints return { scope, data: [...] }
          setPayload({ scope: j.scope || null, total: j.data.reduce((s,x)=>s+(x.demand||0),0), rows: j.data });
        } else {
          setPayload({ scope: j.scope || null, total: j.total||0, rows: j.rows||j.data||[] });
        }
      } catch(_e) {
        if (mounted) setPayload({ scope:null,total:0,rows:[] });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (token) run(); else setLoading(false);

    return () => { mounted=false; };
  }, [endpoint, token]);

  return { loading, ...payload };
}

export default function ExpaMetrics() {
  const nav = useNavigate();
  const applied   = useMetric('/api/expa/leads/applied');
  const accepted  = useMetric('/api/expa/leads/accepted');
  const hostAcc   = useMetric('/api/expa/accepted-by-host');
  const topProj   = useMetric('/api/expa/demand/projects?limit=5'); // returns {data:[...]} shape from backend
  const topCntry  = useMetric('/api/expa/demand/countries?limit=5');

  const topCountry = Array.isArray(topCntry.rows) && topCntry.rows.length
    ? { name: topCntry.rows[0]?.country ?? '—', count: topCntry.rows[0]?.demand ?? 0 }
    : { name:'—', count:0 };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Section title */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#1a202c' }}>
        CRM Overview
      </Typography>

      {/* First row: KPI cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <div onClick={()=>nav('/reports/applied')} style={{ cursor:'pointer' }}>
            {applied.loading ? (
              <Card sx={{ height: '100%' }}><CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}><CircularProgress size={28} /></CardContent></Card>
            ) : (
              <LeadStatusCard title="Applied (Home LC)" count={applied.total} change={0} color="primary" icon={<AssessmentIcon />} />
            )}
          </div>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <div onClick={()=>nav('/reports/accepted')} style={{ cursor:'pointer' }}>
            {accepted.loading ? (
              <Card sx={{ height: '100%' }}><CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}><CircularProgress size={28} /></CardContent></Card>
            ) : (
              <LeadStatusCard title="Accepted (Home LC)" count={accepted.total} change={0} color="success" icon={<AssessmentIcon />} />
            )}
          </div>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <div onClick={()=>nav('/reports/host-accepted')} style={{ cursor:'pointer' }}>
            {hostAcc.loading ? (
              <Card sx={{ height: '100%' }}><CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}><CircularProgress size={28} /></CardContent></Card>
            ) : (
              <LeadStatusCard title="Accepted by Host LC" count={hostAcc.total} change={0} color="warning" icon={<AssessmentIcon />} />
            )}
          </div>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <div onClick={()=>nav('/reports/top-demand')} style={{ cursor:'pointer' }}>
            {topCntry.loading ? (
              <Card sx={{ height: '100%' }}><CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}><CircularProgress size={28} /></CardContent></Card>
            ) : (
              <LeadStatusCard title="Top Country (by apps)" count={topCountry.count} change={0} color="secondary" icon={<AssessmentIcon />} />
            )}
          </div>
        </Grid>
      </Grid>

      {/* Second row: Top lists */}
      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: '#1a202c' }}>
                Top Projects
              </Typography>
              {topProj.loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
              ) : (
                <List dense disablePadding>
                  {(topProj.rows || []).map((p, idx) => (
                    <React.Fragment key={p.project_id || idx}>
                      <ListItem sx={{ py: 1 }}>
                        <ListItemText
                          primaryTypographyProps={{ sx: { fontWeight: 500 } }}
                          primary={p.project_title || '—'}
                          secondary={`Applications: ${p.demand ?? 0}`}
                        />
                      </ListItem>
                      {idx < (topProj.rows?.length || 0) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: '#1a202c' }}>
                Top Countries
              </Typography>
              {topCntry.loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
              ) : (
                <List dense disablePadding>
                  {(topCntry.rows || []).map((c, idx) => (
                    <React.Fragment key={`${c.country}-${idx}`}>
                      <ListItem sx={{ py: 1 }}>
                        <ListItemText
                          primaryTypographyProps={{ sx: { fontWeight: 500 } }}
                          primary={c.country || '—'}
                          secondary={`Applications: ${c.demand ?? 0}`}
                        />
                      </ListItem>
                      {idx < (topCntry.rows?.length || 0) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

