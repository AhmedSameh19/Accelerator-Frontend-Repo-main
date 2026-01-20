import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  Divider,
  Tabs,
  Tab,
  Link,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  EventBusy as EventBusyIcon,
  EventAvailable as EventAvailableIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import marketResearchAPI from '../api/services/marketResearchAPI';
function VisitsPage() {
  const [companies, setCompanies] = useState([]);
  const [openVisitProfileDialog, setOpenVisitProfileDialog] = useState(false);
  const [openOutcomeDialog, setOpenOutcomeDialog] = useState(false);
  const [selectedVisitCompany, setSelectedVisitCompany] = useState(null);
  const [visitDetails, setVisitDetails] = useState({ 
    notes: '', 
    visitactualdate: null
  });
  const [outcomeDetails, setOutcomeDetails] = useState({
    outcome: '',
    numberOfSlots: 0,
    notes: '',
    followUpDate: null,
    followUpTime: '09:00'
  });

  useEffect(() => {
  
    const fetchCompaniesVisits = async () => {
    try{
      const response = await marketResearchAPI.getCompaniesVisits();
      console.log("response: ", response);
      setCompanies(response);
      }
    catch(error){
      console.error("Error getting companies visits:", error);
    }
    };
    fetchCompaniesVisits();
    
  }, []);

  const handleOpenVisitProfile =async (company) => {
    try{
      const response = await marketResearchAPI.getCompany(company.id);
      console.log("response: ", response);
      setSelectedVisitCompany(response[0]);
      
      
    }catch(error){
      console.error("Error getting company:", error);
    }
    setVisitDetails({
      notes: company.visitnotes || '',
      visitactualdate: company.visitactualdate || company.visitDate || null
    });
    // Initialize visit details from company if they exist, otherwise use defaults
    setOpenVisitProfileDialog(true);
  };

  const handleCloseVisitProfile = () => {
    setOpenVisitProfileDialog(false);
    setSelectedVisitCompany(null);
    setVisitDetails({ notes: '', actualDate: null }); // Reset details
  };

  const handleVisitDetailsChange = (field) => (event) => {
    setVisitDetails(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleDateChange = (newDate) => {
    if (!newDate) return;

    // Update both actual and scheduled dates
    setVisitDetails(prev => ({ 
      ...prev, 
      visitactualdate: newDate
    }));

    // Update the company's visit date
    if (selectedVisitCompany) {
      const updatedCompany = {
        ...selectedVisitCompany,
        visitDate: newDate,
        visitactualdate: newDate
      };
      setSelectedVisitCompany(updatedCompany);
    }
  };

  const handleSaveCompany = async () => {
    if (!selectedVisitCompany) return;

    try {
      // Create updated company object with all details
      const updatedCompany = {
        ...selectedVisitCompany,
        // Visit details - map to backend field names
        visitnotes: visitDetails.notes,
        visitactualdate: visitDetails.visitactualdate,
        visitDate: visitDetails.actualDate, // Use actual date as scheduled date
        visitStatus: 'Scheduled',
        // Keep existing outcome details if any
        visitoutcome: selectedVisitCompany.visitOutcome || '',
        visitnumberofslots: selectedVisitCompany.visitNumberOfSlots || 0,
        visitoutcomenotes: selectedVisitCompany.visitOutcomeNotes || '',
        // Update step to Visit Scheduled
        currentStep: 2, // Visit Scheduled step
        // Keep existing comments
        comments: selectedVisitCompany.comments || [],
        // Add status history entry
        statusHistory: [
          ...(selectedVisitCompany.statusHistory || []),
          {
            step: 2,
            date: new Date().toISOString(),
            note: 'Status updated to Visit Scheduled via visit details save.'
          }
        ],
      };
      // Call backend API to update the company
      console.log('Updating company with visit details:', updatedCompany);
      const response = await marketResearchAPI.updateCompany(selectedVisitCompany.id, updatedCompany);
      console.log('Backend response:', response);

      
      const visitDate = visitDetails.visitactualdate;
      
      // if (visitDate) {
      //   // Remove any existing visit event for this company
      //   const filteredEvents = calendarEvents.filter(event => 
      //     !(event.type === 'visit' && event.companyId === selectedVisitCompany.id)
      //   );

        // Create new visit event
        const visitEvent = {
          id: `visit-${selectedVisitCompany.id}`,
          title: `${selectedVisitCompany.name} - Visit`,
          description: visitDetails.notes || 'Company visit',
          date: new Date(visitDate).toISOString().split('T')[0],
          time: '09:00', // Default time
          duration: 120, // 2 hours default duration
          type: 'visit',
          companyId: selectedVisitCompany.id,
          companyName: selectedVisitCompany.name,
          status: 'scheduled',
          assignedTo: ['Current User']
        };

     
      handleCloseVisitProfile();
      } catch (error) {
      console.error('Error saving company visit details:', error);
      // You could show an error message to the user here
    }
  };

  const handleMarkVisitComplete = async () => {
    if (!selectedVisitCompany) return;

    // Create updated company object with visit details and mark as completed
    const updatedCompany = {
      ...selectedVisitCompany,
      visitNotes: visitDetails.notes,
      visitactualdate: visitDetails.visitactualdate,
      visitStatus: 'Completed',
      currentStep: 3 // Visit Completed step
    };

    try {
      // Call backend API to update company
      console.log('Calling backend API to mark visit complete:', updatedCompany);
      const response = await marketResearchAPI.updateCompany(selectedVisitCompany.id, updatedCompany);
      console.log('Backend API response:', response);

      // Update the current view after successful API call
      const updatedVisits = companies.map(c => 
        c.id === updatedCompany.id ? response.data : c
      ).filter(company => company.visitStatus === 'Scheduled');
      
      setCompanies(updatedVisits);
    } catch (error) {
      console.error('Error marking visit complete:', error);
    }

    // Don't close the visit profile dialog, just open the outcome dialog
    setOpenOutcomeDialog(true);
  };

  const handleCloseOutcomeDialog = () => {
    setOpenOutcomeDialog(false);
    setOutcomeDetails({
      outcome: '',
      numberOfSlots: 0,
      notes: '',
      followUpDate: null,
      followUpTime: '09:00'
    });
    // Now we can close the visit profile dialog
    handleCloseVisitProfile();
  };

  const handleOutcomeChange = (field) => (event) => {
    console.log('Outcome change:', field, event.target.value); // Debug log
    setOutcomeDetails(prev => ({ 
      ...prev, 
      [field]: event.target.value,
      // Reset numberOfSlots if outcome is not "Positive - Opportunity Raised"
      ...(field === 'outcome' && event.target.value !== 'Positive - Opportunity Raised' && { numberOfSlots: 0 })
    }));
  };

  const handleSaveOutcome =async () => {
    console.log('Save Outcome clicked');
    console.log('Selected Company:', selectedVisitCompany);
    console.log('Outcome Details:', outcomeDetails);

    if (!selectedVisitCompany || !outcomeDetails.outcome) {
      console.log('Validation failed:', { 
        hasCompany: !!selectedVisitCompany, 
        hasOutcome: !!outcomeDetails.outcome 
      });
      return;
    }

    // Create updated company object with outcome details
    const updatedCompany = {
      ...selectedVisitCompany,
      // Visit details
      visitNotes: visitDetails.notes,
      visitactualdate: visitDetails.visitactualdate,
      visitStatus: outcomeDetails.outcome === 'Negative - Partner Rejected' ? 'No' : 'Completed',
      // Outcome details
      visitoutcome: outcomeDetails.outcome,
      visitnumberofslots: outcomeDetails.numberOfSlots,
      visitoutcomenotes: outcomeDetails.notes,
      // Update step based on outcome
      currentStep: outcomeDetails.outcome === 'Positive - Opportunity Raised' ? 4 :
                  outcomeDetails.outcome === 'Negative - Partner Rejected' ? 5 : 3,
      // Keep existing comments
      comments: selectedVisitCompany.comments || [],
      // Add status history entry
      statusHistory: [
        ...(selectedVisitCompany.statusHistory || []),
        
        {
          step: outcomeDetails.outcome === 'Positive - Opportunity Raised' ? 4 :
                outcomeDetails.outcome === 'Negative - Partner Rejected' ? 5 : 3,
          date: new Date().toISOString(),
          note: `Visit outcome: ${outcomeDetails.outcome}`
        }
      ],
      followUpDate:outcomeDetails.followUpDate,
      followUpTime:outcomeDetails.followUpTime,
    };

    console.log('Updated Company Object:', updatedCompany);

    // If outcome is "Negative - Partner Rejected", update company status and rejection details
    if (outcomeDetails.outcome === 'Negative - Partner Rejected') {
      const rejectionDate = new Date().toISOString();
      console.log('Processing rejection details');
      
      // Update company status and basic rejection info
      updatedCompany.status = 'Rejected';
      updatedCompany.rejectionReason = outcomeDetails.notes;
      updatedCompany.rejectionDate = rejectionDate;
      updatedCompany.lastUpdated = rejectionDate;
      
      // Add detailed rejection information
      updatedCompany.rejectionDetails = {
        date: rejectionDate,
        reason: outcomeDetails.notes,
        visitId: selectedVisitCompany.id,
        visitDate: visitDetails.visitactualdate,
        recordedBy: 'Current User',
        type: 'visit_rejection',
        visitNotes: visitDetails.notes,
        visitStatus: 'No',
      };
      
      // Add rejection to status history
      updatedCompany.statusHistory.push({
        step: 5,
        date: rejectionDate,
        type: 'rejection',
        note: `Company rejected after visit. Reason: ${outcomeDetails.notes}`,
        details: {
          visitDate: visitDetails.visitactualdate,
          rejectionReason: outcomeDetails.notes,
          visitNotes: visitDetails.notes,
          visitStatus: 'No',
        }
      });

      console.log('Updated Company with Rejection Details:', updatedCompany);
    }

    try {
      // Call backend API to update company
      console.log('Calling backend API to update company:', updatedCompany);
      const response = await marketResearchAPI.updateCompany(selectedVisitCompany.id, updatedCompany);
      console.log('Backend API response:', response);
      console.log("Companies::",companies)
      // Update the current view after successful API call
      const updatedVisits = companies.map(c => 
        c.id === updatedCompany.id ? response.data : c
      ).filter(company => company.visitStatus=== 'Scheduled');
      
      console.log('Updated Visits List:', updatedVisits);
      setCompanies(updatedVisits);

      // Close both dialogs
      handleCloseOutcomeDialog();
      console.log('Successfully saved outcome and closed dialogs');
    } catch (error) {
      console.error('Error saving outcome to backend:', error);
      // Optionally show user notification about the error
    }
  };

  const handleEditCompany = (company) => {
    // TODO: Maybe link this to the Market Research edit dialog?
    console.log('Edit company (basic info): ', company);
    alert('Basic company info editing should be done from the Market Research page.');
  };

  const handleDeleteCompany = async (companyId) => {
    try {
      // Find the company to update
      const companyToUpdate = companies.find(company => company.id === companyId);
      if (!companyToUpdate) {
        console.error('Company not found:', companyId);
        return;
      }

      // Create updated company object
      const updatedCompany = {
        ...companyToUpdate,
        visitStatus: null,
        visit: null,
        currentStep: 2, // Reset to Visit Scheduled step
        // Preserve the visit date fields
        visitDate: companyToUpdate.visitDate,
        visitactualdate: companyToUpdate.visitactualdate
      };

      // Call backend API to update company
      console.log('Calling backend API to reset visit status:', updatedCompany);
      const response = await marketResearchAPI.updateCompany(companyId, updatedCompany);
      console.log('Backend API response:', response);

      // Update the current view after successful API call
      const updatedVisits = companies.map(c => 
        c.id === companyId ? response.data : c
      ).filter(company => company.visitStatus === 'Scheduled');
      
      setCompanies(updatedVisits);
    } catch (error) {
      console.error('Error resetting visit status:', error);
    }
  };
  
  const updateCompanyInBackend = async (updatedCompany) => {
    try {
      // Call backend API to update company
      console.log('Calling backend API to update company:', updatedCompany);
      const response = await marketResearchAPI.updateCompany(updatedCompany.id, updatedCompany);
      console.log('Backend API response:', response);

      // Update the current view after successful API call
      const updatedVisits = companies.map(c => 
        c.id === updatedCompany.id ? response.data : c
      ).filter(company => company.visitStatus === 'Scheduled');
      
      setCompanies(updatedVisits);
    } catch (error) {
      console.error('Error updating company in backend:', error);
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Company Visits
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Scheduled Visits
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Table sx={{ minWidth: 750, width: '100%', tableLayout: 'fixed' }} aria-label="scheduled visits table">
                  <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                      <TableCell sx={{ py: 1, px: 2, fontWeight: 'bold', textAlign: 'left' }}>Company</TableCell>
                      <TableCell sx={{ py: 1, px: 2, fontWeight: 'bold', textAlign: 'left' }}>Contact Person</TableCell>
                      <TableCell sx={{ py: 1, px: 2, fontWeight: 'bold', textAlign: 'left' }}>Location</TableCell>
                      <TableCell sx={{ py: 1, px: 2, fontWeight: 'bold', textAlign: 'left' }}>Visit Date</TableCell>
                      <TableCell sx={{ py: 1, px: 2, fontWeight: 'bold', textAlign: 'center' }}>Status</TableCell>
                      <TableCell sx={{ py: 1, px: 2, fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {companies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No visits scheduled. Companies with 'Visit Status' set to 'Scheduled' will appear here.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      companies.map((company) => (
                        <TableRow 
                          key={company.id} 
                          hover 
                          onClick={() => handleOpenVisitProfile(company)}
                          sx={{ 
                            cursor: 'pointer', 
                            '&:last-child td, &:last-child th': { border: 0 } 
                          }}
                        >
                          <TableCell sx={{ py: 1.5, px: 2, verticalAlign: 'top' }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                                {company.name?.[0]?.toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                  {company.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {company.industry}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.5, px: 2, verticalAlign: 'top' }}>
                            <Typography variant="body2">
                              {company.contact_person}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {company.contact_position}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.5, px: 2, verticalAlign: 'top' }}>
                            <Typography variant="body2">
                              {company.address}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.5, px: 2, verticalAlign: 'top' }}>
                            <Typography variant="body2">
                              {company.visitactualdate ? new Date(company.visitactualdate).toLocaleDateString() : 'Not set'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.5, px: 2, textAlign: 'center', verticalAlign: 'top' }}>
                            <Chip
                              icon={company.visit === 'Completed' ? <EventAvailableIcon /> : <EventBusyIcon />}
                              label={company.visit || 'Scheduled'}
                              color={company.visit === 'Completed' ? 'success' : 
                                    (company.status === 'Rejected' || company.visit === 'Rejected') ? 'error' : 'warning'}
                              size="small"
                              sx={{ minWidth: '100px' }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1.5, px: 2, textAlign: 'center', verticalAlign: 'top' }}>
                            <Box display="flex" justifyContent="center" gap={0.5}>
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={(e) => { e.stopPropagation(); handleEditCompany(company); }}
                                title="Edit Basic Info (Market Research)"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={(e) => { e.stopPropagation(); handleDeleteCompany(company.id); }}
                                title="Delete Company"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Visit Profile Dialog */}
      {openVisitProfileDialog && selectedVisitCompany && (
        <Dialog 
          open={openVisitProfileDialog} 
          onClose={handleCloseVisitProfile}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              bgcolor: 'background.paper',
              minHeight: '80vh',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1, position: 'relative', overflow: 'hidden' }}>
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100%',
                background: 'linear-gradient(135deg, rgba(25,118,210,0.05) 0%, rgba(25,118,210,0) 100%)',
                transform: 'skewY(-4deg)',
                transformOrigin: 'top left'
              }}
            />
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ position: 'relative' }}>
              <Box display="flex" gap={3}>
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem',
                    transform: 'rotate(-10deg)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                >
                  {selectedVisitCompany.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 600, 
                      color: 'primary.main', 
                      mb: 0.5,
                      transform: 'skew(-2deg)'
                    }}
                  >
                    {selectedVisitCompany.name || 'Unnamed Company'}
              </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      transform: 'skew(-2deg)'
                    }}
                  >
                    <BusinessIcon fontSize="small" />
                    {selectedVisitCompany.industry || 'No Industry'} • {selectedVisitCompany.size || 'No Size'}
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                onClick={handleCloseVisitProfile} 
                size="small"
                sx={{
                  bgcolor: 'background.paper',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    bgcolor: 'grey.100',
                    transform: 'rotate(90deg)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 0 }}>
            <Stack spacing={2} sx={{ p: 2 }}>
              {/* Company Details & Contact Person */}
              <Card 
                elevation={0} 
                sx={{ 
                  bgcolor: 'background.paper',
                  p: 3,
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(25,118,210,0.03) 0%, rgba(25,118,210,0) 100%)',
                    transform: 'skewY(-2deg)',
                    transformOrigin: 'top left'
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Grid container spacing={4}>
                    {/* Company Information */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ pr: { md: 4 }, borderRight: { md: 1 }, borderColor: 'divider' }}>
                        <Typography 
                          variant="h6" 
                          gutterBottom 
                          sx={{ 
                            color: 'primary.main', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            mb: 3,
                            transform: 'skew(-2deg)'
                          }}
                        >
                          <BusinessIcon /> Company Information
                      </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography 
                              variant="subtitle2" 
                              color="text.secondary" 
                              sx={{ 
                                mb: 0.5,
                                transform: 'skew(-2deg)'
                              }}
                            >
                              Website
                            </Typography>
                            <Typography 
                              variant="body1" 
                              component="a" 
                              href={selectedVisitCompany?.website ? (selectedVisitCompany.website.startsWith('http') ? selectedVisitCompany.website : `https://${selectedVisitCompany.website}`) : '#'} 
                              target="_blank" 
                              onClick={(e) => {
                                if (!selectedVisitCompany?.website) {
                                  e.preventDefault();
                                }
                              }}
                              sx={{ 
                                color: 'primary.main', 
                                wordBreak: 'break-all',
                                textDecoration: 'none',
                                cursor: selectedVisitCompany?.website ? 'pointer' : 'default',
                                '&:hover': {
                                  textDecoration: selectedVisitCompany?.website ? 'underline' : 'none'
                                },
                                transform: 'skew(-2deg)'
                              }}
                            >
                              {selectedVisitCompany?.website || 'Not specified'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography 
                              variant="subtitle2" 
                              color="text.secondary" 
                              sx={{ 
                                mb: 0.5,
                                transform: 'skew(-2deg)'
                              }}
                            >
                              Industry
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 500,
                                transform: 'skew(-2deg)'
                              }}
                            >
                                {selectedVisitCompany?.industry || 'Not specified'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography 
                              variant="subtitle2" 
                              color="text.secondary" 
                              sx={{ 
                                mb: 0.5,
                                transform: 'skew(-2deg)'
                              }}
                            >
                              Company Size
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 500,
                                transform: 'skew(-2deg)'
                              }}
                            >
                              {selectedVisitCompany?.size || 'Not specified'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography 
                              variant="subtitle2" 
                              color="text.secondary" 
                              sx={{ 
                                mb: 0.5,
                                transform: 'skew(-2deg)'
                              }}
                            >
                              Address
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 500,
                                transform: 'skew(-2deg)'
                              }}
                            >
                              {selectedVisitCompany?.address || 'Not specified'}
                            </Typography>
                          </Grid>
                        </Grid>
                        </Box>
                    </Grid>

                    {/* Contact Person */}
                    <Grid item xs={12} md={6}>
                    <Box>
                        <Typography 
                          variant="h6" 
                          gutterBottom 
                          sx={{ 
                            color: 'primary.main', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            mb: 3,
                            transform: 'skew(-2deg)'
                          }}
                        >
                          <PersonIcon /> Contact Person
                      </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography 
                              variant="subtitle2" 
                              color="text.secondary" 
                              sx={{ 
                                mb: 0.5,
                                transform: 'skew(-2deg)'
                              }}
                            >
                              Name
                          </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 500,
                                transform: 'skew(-2deg)'
                              }}
                            >
                              {selectedVisitCompany?.contact_person || 'Not specified'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography 
                              variant="subtitle2" 
                              color="text.secondary" 
                              sx={{ 
                                mb: 0.5,
                                transform: 'skew(-2deg)'
                              }}
                            >
                              Position
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 500,
                                transform: 'skew(-2deg)'
                              }}
                            >
                              {selectedVisitCompany?.contact_position || 'Not specified'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography 
                              variant="subtitle2" 
                              color="text.secondary" 
                              sx={{ 
                                mb: 0.5,
                                transform: 'skew(-2deg)'
                              }}
                            >
                              Email
                            </Typography>
                            <Typography 
                              variant="body1" 
                              component="a" 
                              href={selectedVisitCompany?.email ? `mailto:${selectedVisitCompany.email}` : '#'} 
                              onClick={(e) => {
                                if (!selectedVisitCompany?.email) {
                                  e.preventDefault();
                                }
                              }}
                              sx={{ 
                                color: 'primary.main',
                                wordBreak: 'break-all',
                                textDecoration: 'none',
                                cursor: selectedVisitCompany?.email ? 'pointer' : 'default',
                                '&:hover': {
                                  textDecoration: selectedVisitCompany?.email ? 'underline' : 'none'
                                },
                                transform: 'skew(-2deg)'
                              }}
                            >
                              {selectedVisitCompany?.email || 'Not specified'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography 
                              variant="subtitle2" 
                              color="text.secondary" 
                              sx={{ 
                                mb: 0.5,
                                transform: 'skew(-2deg)'
                              }}
                            >
                              Phone
                            </Typography>
                            <Typography 
                              variant="body1" 
                              component="a" 
                              href={selectedVisitCompany?.phone ? `tel:${selectedVisitCompany.phone}` : '#'} 
                              onClick={(e) => {
                                if (!selectedVisitCompany?.phone) {
                                  e.preventDefault();
                                }
                              }}
                              sx={{ 
                                color: 'primary.main',
                                textDecoration: 'none',
                                cursor: selectedVisitCompany?.phone ? 'pointer' : 'default',
                                '&:hover': {
                                  textDecoration: selectedVisitCompany?.phone ? 'underline' : 'none'
                                },
                                transform: 'skew(-2deg)'
                              }}
                            >
                              {selectedVisitCompany?.phone || 'Not specified'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography 
                              variant="subtitle2" 
                              color="text.secondary" 
                              sx={{ 
                                mb: 0.5,
                                transform: 'skew(-2deg)'
                              }}
                            >
                              LinkedIn
                            </Typography>
                            <Typography 
                              variant="body1" 
                              component="a" 
                              href={selectedVisitCompany?.linkedin ? (selectedVisitCompany.linkedin.startsWith('http') ? selectedVisitCompany.linkedin : `https://${selectedVisitCompany.linkedin}`) : '#'} 
                              target="_blank" 
                              onClick={(e) => {
                                if (!selectedVisitCompany?.linkedin) {
                                  e.preventDefault();
                                }
                              }}
                              sx={{ 
                                color: 'primary.main',
                                wordBreak: 'break-all',
                                textDecoration: 'none',
                                cursor: selectedVisitCompany?.linkedin ? 'pointer' : 'default',
                                '&:hover': {
                                  textDecoration: selectedVisitCompany?.linkedin ? 'underline' : 'none'
                                },
                                transform: 'skew(-2deg)'
                              }}
                            >
                              {selectedVisitCompany?.linkedin || 'Not specified'}
                            </Typography>
                          </Grid>
                        </Grid>
                        </Box>
                </Grid>
                  </Grid>
                </Box>
              </Card>

              {/* Visit Details */}
              <Card 
                elevation={0} 
                sx={{ 
                  bgcolor: 'background.paper',
                  p: 2,
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(25,118,210,0.03) 0%, rgba(25,118,210,0) 100%)',
                    transform: 'skewY(-2deg)',
                    transformOrigin: 'top left'
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      color: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 2,
                      transform: 'skew(-2deg)'
                    }}
                  >
                    <EventIcon /> Visit Details
                      </Typography>
                  <Stack spacing={1}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 1.5, 
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5
                          }}
                        >
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            sx={{ 
                              transform: 'skew(-2deg)'
                            }}
                          >
                            Scheduled Date
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              transform: 'skew(-2deg)'
                            }}
                          >
                            {selectedVisitCompany.visitactualdate ? new Date(selectedVisitCompany.visitactualdate).toLocaleDateString() : 'Not set'}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 1.5, 
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5
                          }}
                        >
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            sx={{ 
                              transform: 'skew(-2deg)'
                            }}
                          >
                            Actual Visit Date
                          </Typography>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              value={visitDetails.visitactualdate}
                              onChange={handleDateChange}
                              renderInput={(params) => (
                                <TextField 
                                  {...params} 
                                  fullWidth 
                                  size="small"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      bgcolor: 'background.paper',
                                      borderRadius: 1,
                                      '&:hover, &.Mui-focused': {
                                        '& > fieldset': {
                                          borderColor: 'primary.main',
                                          borderWidth: '1px',
                                        }
                                      }
                                    }
                                  }}
                                />
                              )}
                            />
                          </LocalizationProvider>
                        </Paper>
                      </Grid>
                    </Grid>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary" 
                        sx={{ 
                          transform: 'skew(-2deg)'
                        }}
                      >
                            Visit Notes
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                        rows={3}
                            value={visitDetails.visitnotes}
                            onChange={handleVisitDetailsChange('notes')}
                            placeholder={selectedVisitCompany.visitnotes}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            '&:hover, &.Mui-focused': {
                              '& > fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: '1px',
                              }
                            }
                          }
                        }}
                      />
                    </Paper>
                  </Stack>
            </Box>
              </Card>
            </Stack>
          </DialogContent>
          
          {/* Dialog Actions */}
          <DialogActions 
            sx={{ 
              p: 2, 
              justifyContent: 'space-between',
              bgcolor: 'grey.50',
              borderTop: 1,
              borderColor: 'divider'
            }}
          >
            <Button 
              onClick={handleMarkVisitComplete} 
              variant="contained" 
              color="success" 
              startIcon={<CheckCircleIcon />}
              disabled={!visitDetails.visitactualdate}
              sx={{ 
                px: 3,
                transform: 'skew(-2deg)',
                '& .MuiButton-startIcon': {
                  transform: 'skew(2deg)'
                },
                '& .MuiButton-label': {
                  transform: 'skew(2deg)'
                }
              }}
            >
              Mark Visit Completed
            </Button>
            <Box>
              <Button 
                onClick={handleCloseVisitProfile}
                variant="outlined"
                color="inherit"
                sx={{
                  transform: 'skew(-2deg)',
                  '& .MuiButton-label': {
                    transform: 'skew(2deg)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveCompany} 
                variant="contained"
                startIcon={<SaveIcon />} 
                sx={{ 
                  ml: 2,
                  transform: 'skew(-2deg)',
                  '& .MuiButton-startIcon': {
                    transform: 'skew(2deg)'
                  },
                  '& .MuiButton-label': {
                    transform: 'skew(2deg)'
                  }
                }}
              >
                Save Details
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}

      {/* --- Visit Outcome Dialog --- */}
      <Dialog 
        open={openOutcomeDialog} 
        onClose={handleCloseOutcomeDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <TrendingUpIcon />
            <Typography variant="h6" component="span">
              Visit Outcome
            </Typography>
          </Box>
          <IconButton onClick={handleCloseOutcomeDialog} size="small" sx={{ color: 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Visit Outcome Dropdown */}
            <FormControl fullWidth>
              <InputLabel id="visit-outcome-label">Visit Outcome</InputLabel>
              <Select
                labelId="visit-outcome-label"
                label="Visit Outcome"
                value={outcomeDetails.outcome}
                onChange={handleOutcomeChange('outcome')}
              >
                <MenuItem value=""><em>Select an outcome</em></MenuItem>
                <MenuItem value="Positive - Opportunity Raised">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon fontSize="small" color="success" />
                    Positive - Opportunity Raised
                  </Box>
                </MenuItem>
                <MenuItem value="Positive - Need Follow-up">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon fontSize="small" color="primary" />
                    Positive - Need Follow-up
                  </Box>
                </MenuItem>
                <MenuItem value="Negative - Partner Rejected">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventBusyIcon fontSize="small" color="error" />
                    Negative - Partner Rejected
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Number of Slots - Only show when Positive - Opportunity Raised is selected */}
            {outcomeDetails.outcome === 'Positive - Opportunity Raised' && (
              <TextField
                fullWidth
                label="Number of Slots"
                type="number"
                value={outcomeDetails.numberOfSlots}
                onChange={handleOutcomeChange('numberOfSlots')}
                InputProps={{
                  inputProps: { min: 1 }
                }}
                helperText="Enter the number of opportunity slots raised"
              />
            )}

            {/* Rejection Details Card - Only show when Negative - Partner Rejected is selected */}
            {outcomeDetails.outcome === 'Negative - Partner Rejected' && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'error.lighter' }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle2" color="error" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventBusyIcon fontSize="small" />
                    Rejection Details
                  </Typography>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Rejection Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Rejection Reason
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={outcomeDetails.notes}
                      onChange={handleOutcomeChange('notes')}
                      placeholder="Enter detailed reason for rejection..."
                      required
                    />
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* Follow-up Date and Time - Only show when Positive - Need Follow-up is selected */}
            {outcomeDetails.outcome === 'Positive - Need Follow-up' && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Schedule Follow-up
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Follow-up Date"
                        value={outcomeDetails.followUpDate}
                        onChange={(newValue) => setOutcomeDetails(prev => ({ ...prev, followUpDate: newValue }))}
                        renderInput={(params) => (
                          <TextField {...params} fullWidth />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Follow-up Time"
                      type="time"
                      value={outcomeDetails.followUpTime}
                      onChange={(e) => setOutcomeDetails(prev => ({ ...prev, followUpTime: e.target.value }))}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 300 // 5 min
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Outcome Notes - Only show when not Negative - Partner Rejected */}
            {outcomeDetails.outcome !== 'Negative - Partner Rejected' && (
              <TextField
                fullWidth
                label="Outcome Notes"
                multiline
                rows={4}
                value={outcomeDetails.notes}
                onChange={handleOutcomeChange('notes')}
                variant="outlined"
                placeholder="Enter detailed notes about the visit outcome, including key discussion points, action items, and next steps..."
                InputProps={{
                  startAdornment: (
                    <DescriptionIcon color="action" sx={{ mr: 1, mt: 2 }} />
                  ),
                }}
              />
            )}
          </Stack>
        </DialogContent>
        
        <DialogActions 
          sx={{ 
            p: 2, 
            justifyContent: 'flex-end',
            bgcolor: 'grey.50',
            borderTop: 1,
            borderColor: 'divider'
          }}
        >
          <Button 
            onClick={handleCloseOutcomeDialog}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              console.log('Save Outcome button clicked');
              handleSaveOutcome();
            }} 
            variant="contained"
            startIcon={<SaveIcon />} 
            disabled={!outcomeDetails.outcome || 
              (outcomeDetails.outcome === 'Positive - Need Follow-up' && !outcomeDetails.followUpDate)}
            sx={{ ml: 2 }}
          >
            Save Outcome
          </Button>
        </DialogActions>
      </Dialog>
      {/* --- End Visit Outcome Dialog --- */}

    </Box>
  );
}

export default VisitsPage; 