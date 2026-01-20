import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import b2cAPI from '../api/services/b2cAPI';
function EPsBackToProcess() {
  const [eps, setEps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEP, setExpandedEP] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
   
    loadEPsBackToProcess(); 
  }, []);

  
 const loadEPsBackToProcess = async () => {
    console.log('EPs Back to Process with comments:');

    setLoading(true);
    // Get all leads from localStorage
    const response = await b2cAPI.getBackToProcess();
    const eps = response.data;
    
    setEps(eps);
    setLoading(false);
  };  
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // const filteredEPs = eps.filter(ep => {
  //   const searchLower = searchQuery.toLowerCase();
  //   return (
  //     ep.name?.toLowerCase().includes(searchLower) ||
  //     ep.email?.toLowerCase().includes(searchLower) ||
  //     ep.phone?.toLowerCase().includes(searchLower) ||
  //     ep.lc?.toLowerCase().includes(searchLower)
  //   );
  // });

  const handleRowClick = (ep) => {
    navigate(`/leads/${ep.id}`, {
      state: { from: 'eps-back-to-process' }
    });
  };

  const handleExpandClick = (epId) => {
    setExpandedEP(expandedEP === epId ? null : epId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
        EPs Back to Process
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, email, phone, or LC..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Contact Info</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>LC</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Program</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Comments</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {eps.map((ep) => (
              <React.Fragment key={ep.id}>
                <TableRow
                  hover
                  onClick={() => handleRowClick(ep)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="primary" />
                      <Typography>{ep.name || ep.full_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{ep.email || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">{ep.phone || '-'}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ep.lc || ep.home_lc || '-'}
                      size="small"
                      color="info"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ep.product || '-'}
                      size="small"
                      sx={{
                        bgcolor: ep.product?.toLowerCase().includes('gv') ? '#F85A40' :
                                ep.product?.toLowerCase().includes('gta') ? '#0CB9C1' :
                                ep.product?.toLowerCase().includes('gte') ? '#F48924' : '#e0e0e0',
                        color: '#fff',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ep.status || '-'}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpandClick(ep.id);
                      }}
                    >
                      {expandedEP === ep.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={expandedEP === ep.id} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 2 }}>
                        <Typography variant="h6" gutterBottom component="div" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          Back to Process Comments
                        </Typography>
                        {ep.comments?.length > 0 ? (
                          ep.comments.map((comment) => (
                            <Paper
                              key={comment.id}
                              elevation={1}
                              sx={{
                                p: 2,
                                mb: 1,
                                bgcolor: '#f8fafc',
                                borderRadius: 2
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(comment.created_at).toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {comment.author}
                                </Typography>
                              </Box>
                              <Typography variant="body2">
                                {comment.text}
                              </Typography>
                            </Paper>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No comments available
                          </Typography>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
            {eps.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    {searchQuery ? 'No matching EPs found' : 'No EPs marked back to process'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default EPsBackToProcess; 