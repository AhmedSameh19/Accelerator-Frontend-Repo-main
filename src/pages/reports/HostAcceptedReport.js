import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { API_BASE } from '../../utils/apiBase';
import { getCrmAccessToken } from '../../utils/crmToken';

const apiBase = API_BASE;

export default function HostAcceptedReport(){
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  useEffect(()=>{ (async()=>{
    const token = getCrmAccessToken();
    if (!token) return;

    setLoading(true);
    setError(null);
    try{
      // Fetch detailed leads list, not just counts
      const url = `${apiBase}/api/expa/accepted-by-host/detail`;
      const r = await fetch(url, { 
        headers:{ Authorization:`Bearer ${token}` },
        credentials: 'include' // Include cookies for cookie-based RBAC fallback
      });
      if (!r.ok) throw new Error(`Request failed with status ${r.status}`);
      const j = await r.json();
      const data = j.leads || j.rows || j.data || [];
      setRows(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error('Failed to load accepted by host leads', err);
      setRows([]);
      setError('Unable to load accepted by host leads. Please try again.');
    } finally { setLoading(false); }
  })(); },[]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Accepted by Host LC — Report</Typography>
      <Card>
        <CardContent>
          {loading ? <CircularProgress size={24} /> : error ? (
            <Typography color="error" variant="body2">{error}</Typography>
          ) : (
            <Table size="small">
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
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No leads found</TableCell>
                  </TableRow>
                ) : (
                  rows.map((lead, idx) => (
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
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

