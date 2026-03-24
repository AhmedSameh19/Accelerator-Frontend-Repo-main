import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, FormControl, InputLabel, Select, MenuItem, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { API_BASE } from '../../utils/apiBase';
import { getCrmAccessToken } from '../../utils/crmToken';

const apiBase = API_BASE;

export default function AcceptedReport(){
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [lc, setLc] = useState('');
  const [error, setError] = useState(null);

  useEffect(()=>{ (async()=>{
    const token = getCrmAccessToken();
    if (!token) return;

    setLoading(true);
    setError(null);
    try{
      // Fetch detailed leads list, not just counts
      let url = `${apiBase}/api/expa/leads/accepted/detail`;
      if (profile?.mc_code && !profile?.lc_code && lc) {
        url = `${apiBase}/api/expa/leads/accepted/detail?lc_id=${encodeURIComponent(lc)}`;
      }
      const r = await fetch(url, { 
        headers:{ Authorization:`Bearer ${token}` },
        credentials: 'include' // Include cookies for cookie-based RBAC fallback
      });
      if (!r.ok) throw new Error(`Request failed with status ${r.status}`);
      const j = await r.json();
      const data = j.leads || j.rows || j.data || [];
      setRows(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error('Failed to load accepted leads', err);
      setRows([]);
      setError('Unable to load accepted leads. Please try again.');
    } finally { setLoading(false); }
  })(); },[profile, lc]);

  const isMC = profile?.mc_code && !profile?.lc_code;
  const displayRows = isMC && lc
    ? rows.filter(r => String(r.lc_id) === String(lc))
    : rows;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Accepted — Report</Typography>
      {isMC && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <FormControl fullWidth>
              <InputLabel id="lc-label">Filter by LC</InputLabel>
              <Select labelId="lc-label" value={lc} label="Filter by LC" onChange={(e)=>setLc(e.target.value)}>
                <MenuItem value="">All LCs (national)</MenuItem>
                {rows.map(r => (
                  <MenuItem key={r.lc_id} value={r.lc_id}>{r.lc_name || r.lc_id}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent>
          {loading ? <CircularProgress size={24} /> : error ? (
            <Typography color="error" variant="body2">{error}</Typography>
          ) : (
            <Box sx={{ overflowX: 'auto', width: '100%' }}>
              <Table size="small" sx={{ whiteSpace: 'nowrap' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>LC</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No leads found</TableCell>
                    </TableRow>
                  ) : (
                    displayRows.map((lead, idx) => (
                      <TableRow key={lead.id || idx}>
                        <TableCell>{lead.full_name || '-'}</TableCell>
                        <TableCell>{lead.email || '-'}</TableCell>
                        <TableCell>{lead.phone || '-'}</TableCell>
                        <TableCell>{lead.lc || '-'}</TableCell>
                        <TableCell>{lead.product || '-'}</TableCell>
                        <TableCell>{lead.status || '-'}</TableCell>
                        <TableCell>{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

