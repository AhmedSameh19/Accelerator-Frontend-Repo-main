import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { API_BASE } from '../../utils/apiBase';
import { getCrmAccessToken } from '../../utils/crmToken';

const apiBase = API_BASE;

export default function TopDemandReport(){
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(()=>{ (async()=>{
    const token = getCrmAccessToken();
    if (!token) return;

    setLoading(true);
    setError(null);
    try{
      const [r1, r2] = await Promise.all([
        fetch(`${apiBase}/api/expa/demand/countries?limit=20`, { 
          headers:{ Authorization:`Bearer ${token}` },
          credentials: 'include' // Include cookies for cookie-based RBAC fallback
        }),
        fetch(`${apiBase}/api/expa/demand/projects?limit=20`, { 
          headers:{ Authorization:`Bearer ${token}` },
          credentials: 'include' // Include cookies for cookie-based RBAC fallback
        })
      ]);
      if (!r1.ok || !r2.ok) {
        throw new Error(`Request failed with status ${!r1.ok ? r1.status : r2.status}`);
      }
      const j1 = await r1.json();
      const j2 = await r2.json();
      setCountries(Array.isArray(j1?.data) ? j1.data : []);
      setProjects(Array.isArray(j2?.data) ? j2.data : []);
    } catch (err) {
      console.error('Failed to load demand metrics', err);
      setCountries([]);
      setProjects([]);
      setError('Unable to load top demand data. Please try again.');
    } finally { setLoading(false); }
  })(); },[]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Top Demand — Report</Typography>
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>Top Countries</Typography>
            {loading ? <CircularProgress size={24} /> : error ? (
              <Typography color="error" variant="body2">{error}</Typography>
            ) : (
              <Box sx={{ overflowX: 'auto', width: '100%' }}>
                <Table size="small" sx={{ whiteSpace: 'nowrap' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Country</TableCell>
                      <TableCell align="right">Applications</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {countries.map((c, idx) => (
                      <TableRow key={`${c.country}-${idx}`}>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            title={c.country}
                            sx={{
                              maxWidth: { xs: '150px', sm: '300px' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {c.country || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{c.demand ?? 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>Top Projects</Typography>
            {loading ? <CircularProgress size={24} /> : error ? (
              <Typography color="error" variant="body2">{error}</Typography>
            ) : (
              <Box sx={{ overflowX: 'auto', width: '100%' }}>
                <Table size="small" sx={{ whiteSpace: 'nowrap' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Project</TableCell>
                      <TableCell align="right">Applications</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projects.map((p, idx) => (
                      <TableRow key={`${p.project_id}-${idx}`}>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            title={p.project_title}
                            sx={{
                              maxWidth: { xs: '150px', sm: '300px' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {p.project_title || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{p.demand ?? 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

