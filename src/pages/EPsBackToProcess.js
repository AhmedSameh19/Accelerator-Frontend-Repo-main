import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';
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
  Collapse,
  Alert
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
import { useAuth } from '../context/AuthContext';
import { useCRMType } from '../context/CRMTypeContext';
import { LC_CODES } from '../lcCodes';
import b2cAPI from '../api/services/b2cAPI';

function EPsBackToProcess() {
  const { currentUser, isAdmin } = useAuth();
  const { crmType } = useCRMType();
  const [eps, setEps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEP, setExpandedEP] = useState(null);
  const [error, setError] = useState(null);
  const [epComments, setEpComments] = useState({}); // Store comments for each EP: { expa_person_id: [comments] }
  const [loadingComments, setLoadingComments] = useState({}); // Track which EPs are loading comments
  const navigate = useNavigate();

  // Get home_lc_id similar to LeadsPage
  const getOfficeId = useCallback(() => {
    // Try multiple sources for LC/office information
    let officeId = null;
    let lcName = null;
    
    // 1. Try current_offices from user object
    if (currentUser?.current_offices?.[0]?.id) {
      officeId = currentUser.current_offices[0].id;
      return officeId;
    }
    
    // 2. Try LC name from various sources
    lcName = currentUser?.lc || 
             currentUser?.userLC || 
             localStorage.getItem('userLC') ||
             Cookies.get('userLC') ||
             null;
    
    // 3. Try to find LC ID from LC_CODES
    if (lcName && Array.isArray(LC_CODES)) {
      const found = LC_CODES.find((lc) => 
        lc.name === lcName || 
        lc.name?.toLowerCase() === lcName?.toLowerCase() ||
        lc.id?.toString() === lcName?.toString()
      );
      if (found) {
        return found.id;
      }
    }
    
    return null;
  }, [currentUser]);

  const homeLcId = useMemo(() => getOfficeId(), [getOfficeId]);

  const loadEPsBackToProcess = useCallback(async () => {
    console.log('Loading EPs Back to Process...');

    setLoading(true);
    setError(null);
    
    try {
      let epsData = [];
      
      if (isAdmin) {
        // For admins, fetch from all LCs to get all EPs
        const allLcIds = LC_CODES.map(lc => lc.id);
        console.log('🔍 [EPsBackToProcess] Admin user - fetching from all LCs:', allLcIds);
        // fetchAll=true will paginate through all results
        epsData = await b2cAPI.getAllBackToProcess(allLcIds, 1000, true);
      } else if (homeLcId) {
        // For regular users, fetch from their LC
        console.log('🔍 [EPsBackToProcess] Fetching for home_lc_id:', homeLcId);
        // fetchAll=true will paginate through all results
        epsData = await b2cAPI.getBackToProcess(homeLcId, 1000, true);
      } else {
        throw new Error('LC ID (home_lc_id) is required. Please ensure your user account has an LC assigned.');
      }
      
      // Ensure eps is an array
      setEps(Array.isArray(epsData) ? epsData : []);
      console.log('✅ [EPsBackToProcess] Loaded EPs:', epsData.length);
      console.log('✅ [EPsBackToProcess] Sample EP:', epsData[0]);
    } catch (error) {
      console.error('❌ Error loading EPs back to process:', error);
      setError(error.message || 'Failed to load EPs back to process');
      setEps([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [homeLcId, isAdmin]);

  useEffect(() => {
    // Don't load data if CRM type is iCX
    if (crmType !== 'iCX') {
      loadEPsBackToProcess(); 
    } else {
      setLoading(false);
      setEps([]);
    }
  }, [loadEPsBackToProcess, crmType]);  
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter EPs based on search query
  const filteredEPs = eps.filter(ep => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      ep.name?.toLowerCase().includes(searchLower) ||
      ep.full_name?.toLowerCase().includes(searchLower) ||
      ep.email?.toLowerCase().includes(searchLower) ||
      ep.phone?.toLowerCase().includes(searchLower) ||
      ep.lc?.toLowerCase().includes(searchLower) ||
      ep.home_lc?.toLowerCase().includes(searchLower) ||
      ep.home_lc_name?.toLowerCase().includes(searchLower) ||
      ep.selected_programmes?.toLowerCase().includes(searchLower) ||
      ep.product?.toLowerCase().includes(searchLower) ||
      ep.expa_status?.toLowerCase().includes(searchLower) ||
      ep.status?.toLowerCase().includes(searchLower)
    );
  });

  const handleRowClick = (ep) => {
    // Backend returns expa_person_id as the lead identifier
    const leadId = ep.expa_person_id || ep.id;
    if (leadId) {
      navigate(`/leads/${leadId}`, {
        state: { from: 'eps-back-to-process' }
      });
    }
  };

  const handleExpandClick = async (epId) => {
    const newExpandedState = expandedEP === epId ? null : epId;
    setExpandedEP(newExpandedState);
    
    // If expanding and comments not yet loaded, fetch them
    if (newExpandedState && !epComments[epId]) {
      setLoadingComments(prev => ({ ...prev, [epId]: true }));
      try {
        console.log(`🔍 [EPsBackToProcess] Fetching comments for EP: ${epId}`);
        const comments = await b2cAPI.getComments(epId);
        console.log(`✅ [EPsBackToProcess] Fetched ${comments.length} comments for EP: ${epId}`);
        
        // Normalize comments to expected format
        const normalizedComments = Array.isArray(comments) ? comments.map(comment => ({
          id: comment.id || comment._id,
          text: comment.text || comment.comment || comment.content || '',
          created_at: comment.created_at || comment.createdAt || comment.timestamp || comment.date,
          author: comment.author || comment.author_name || comment.created_by_name || comment.creator_name || 'Unknown'
        })) : [];
        
        setEpComments(prev => ({ ...prev, [epId]: normalizedComments }));
      } catch (error) {
        console.error(`❌ [EPsBackToProcess] Error fetching comments for EP ${epId}:`, error);
        setEpComments(prev => ({ ...prev, [epId]: [] })); // Set empty array on error
      } finally {
        setLoadingComments(prev => ({ ...prev, [epId]: false }));
      }
    }
  };

  // Show message if CRM type is iCX
  if (crmType === 'iCX') {
    return (
      null
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
          EPs Back to Process
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {filteredEPs.length} {filteredEPs.length === 1 ? 'EP' : 'EPs'} {searchQuery ? 'found' : 'total'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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

      <TableContainer component={Paper} elevation={2} sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Table sx={{ minWidth: { xs: 800, sm: 1000 }, whiteSpace: 'nowrap' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell 
                sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  position: 'sticky',
                  left: 0,
                  bgcolor: 'primary.main',
                  zIndex: 3,
                  borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                Name
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Contact Info</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>LC</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Program</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Comments</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEPs.map((ep) => (
              <React.Fragment key={ep.expa_person_id || ep.id || `ep-${ep.full_name}`}>
                <TableRow
                  hover
                  onClick={() => handleRowClick(ep)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                   <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      bgcolor: 'background.paper',
                      zIndex: 1,
                      borderRight: '1px solid rgba(224, 224, 224, 1)'
                    }}
                  >
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
                      label={ep.home_lc_name || ep.lc || ep.home_lc || '-'}
                      size="small"
                      color="info"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ep.selected_programmes || ep.product || '-'}
                      size="small"
                      sx={{
                        bgcolor: (ep.selected_programmes || ep.product)?.toLowerCase().includes('gv') ? '#F85A40' :
                                (ep.selected_programmes || ep.product)?.toLowerCase().includes('gta') ? '#0CB9C1' :
                                (ep.selected_programmes || ep.product)?.toLowerCase().includes('gte') ? '#F48924' : '#e0e0e0',
                        color: '#fff',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ep.expa_status || ep.status || '-'}
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
                        const epId = ep.expa_person_id || ep.id;
                        handleExpandClick(epId);
                      }}
                    >
                      {expandedEP === (ep.expa_person_id || ep.id) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={expandedEP === (ep.expa_person_id || ep.id)} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 2 }}>
                        <Typography variant="h6" gutterBottom component="div" sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}>
                          Lead Comments
                        </Typography>
                        {loadingComments[ep.expa_person_id || ep.id] ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={24} />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                              Loading comments...
                            </Typography>
                          </Box>
                        ) : (
                          <>
                            {epComments[ep.expa_person_id || ep.id]?.length > 0 ? (
                              epComments[ep.expa_person_id || ep.id].map((comment, index) => {
                                // Format date
                                let formattedDate = 'Date not available';
                                if (comment.created_at) {
                                  try {
                                    const dateObj = new Date(comment.created_at);
                                    if (!isNaN(dateObj.getTime())) {
                                      formattedDate = dateObj.toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      });
                                    }
                                  } catch (e) {
                                    formattedDate = comment.created_at;
                                  }
                                }
                                
                                return (
                                  <Paper
                                    key={comment.id || `comment-${index}`}
                                    elevation={1}
                                    sx={{
                                      p: 2,
                                      mb: 1.5,
                                      bgcolor: '#f8fafc',
                                      borderRadius: 2,
                                      border: '1px solid #e0e0e0',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        {formattedDate}
                                      </Typography>
                                      <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                        {comment.author}
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                                      {comment.text}
                                    </Typography>
                                  </Paper>
                                );
                              })
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                                No comments available for this lead
                              </Typography>
                            )}
                          </>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
            {filteredEPs.length === 0 && (
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