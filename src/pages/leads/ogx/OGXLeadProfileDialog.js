import React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  Email as EmailIcon,
  Event as EventIcon,
  Flag as FlagIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Work as WorkIcon,
} from '@mui/icons-material';

import ExperienceTab from '../../../components/ExperienceTab';
import PostExperienceTab from '../../../components/PostExperienceTab';
import PreparationStepsTab from '../../../components/PreparationStepsTab';

import { getProgrammeChipSx, getStatusChipSx } from './ogxChipStyles';
import { LC_CODES } from '../../../lcCodes';

export default function OGXLeadProfileDialog({
  open,
  onClose,
  selectedLead,

  tab,
  setTab,

  prepState,
  setPrepState,
  fileToBase64,

  getCountryCode,
  copyToClipboard,
  formatDate,
}) {
  if (!selectedLead) return null;

  // Helper function to get LC name by ID
  const getLCNameById = (lcId) => {
    const lc = LC_CODES.find(lc => lc.id === lcId);
    return lc ? lc.name : null;
  };

  // Get home LC name from home_lc_id
  const homeLCName = getLCNameById(selectedLead.home_lc_id);

  // Helper function to get AIESEC opportunity URL
  const getOpportunityUrl = (programme, oppId) => {
    if (!programme || !oppId) return null;
    
    const programType = programme.toLowerCase();
    let urlPath = '';
    
    if (programType.includes('gv') || programType === 'global volunteer') {
      urlPath = 'global-volunteer';
    } else if (programType.includes('gte') || programType === 'global teacher') {
      urlPath = 'global-teacher';
    } else if (programType.includes('gta') || programType === 'global talent') {
      urlPath = 'global-talent';
    } else {
      return null;
    }
    
    return `https://aiesec.org/opportunity/${urlPath}/${oppId}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper',
          minHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(40,60,90,0.18)',
          animation: 'fadeIn 0.4s cubic-bezier(.4,0,.2,1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 0,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(90deg, #0CB9C1 0%, #1976d2 100%)',
          color: '#fff',
          minHeight: 120,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={3}
          sx={{
            pt: 3,
            pb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
          }}
        >
          <Avatar
            sx={{
              width: { xs: 70, sm: 90 },
              height: { xs: 70, sm: 90 },
              bgcolor: 'primary.main',
              fontSize: { xs: '2rem', sm: '2.8rem' },
              boxShadow: '0 6px 24px rgba(25,118,210,0.18)',
              border: '4px solid #fff',
              ml: { xs: 0, sm: 2 },
            }}
          >
            {(selectedLead.full_name || selectedLead.fullName)?.[0]?.toUpperCase()}
          </Avatar>
          <Box flex={1} sx={{ width: '100%', textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#fff',
                mb: 1,
                letterSpacing: 1,
                fontSize: { xs: '1.5rem', sm: '2rem' },
              }}
            >
              {selectedLead.full_name || selectedLead.fullName}
            </Typography>
            <Stack spacing={1}>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
              >
                <Chip
                  label={selectedLead.status}
                  sx={{
                    ...getStatusChipSx(selectedLead.status),
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    px: 2,
                  }}
                />
              </Box>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: '#e3f2fd',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    minWidth: { xs: 'auto', sm: 120 },
                  }}
                >
                  <FlagIcon fontSize="small" />
                  Sending:
                </Typography>
                <Typography variant="body1" sx={{ color: '#e3f2fd' }}>
                  {homeLCName} • Egypt
                </Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: '#e3f2fd',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    minWidth: { xs: 'auto', sm: 120 },
                  }}
                >
                  <LocationIcon fontSize="small" />
                  Host:
                </Typography>
                <Typography variant="body1" sx={{ color: '#e3f2fd' }}>
                  {selectedLead.host_lc_name} • {selectedLead.host_mc_name}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <IconButton
            onClick={onClose}
            size="medium"
            sx={{
              bgcolor: 'rgba(255,255,255,0.8)',
              color: '#1976d2',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              '&:hover': {
                bgcolor: '#fff',
                color: '#0CB9C1',
                transform: 'rotate(90deg)',
                transition: 'all 0.3s ease',
              },
              position: 'absolute',
              top: 16,
              right: 24,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Tabs for profile sections */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          background: 'white',
          px: { xs: 1, sm: 3 },
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minWidth: 0,
              flex: 1,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontWeight: 600,
              textTransform: 'none',
              py: { xs: 1, sm: 2 },
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 700,
              },
            },
          }}
        >
          <Tab label="Information" />
          <Tab label="Preparation" />
          <Tab label="Experience" />
          <Tab label="Post Experience" />
        </Tabs>
      </Box>

      <DialogContent
        dividers
        sx={{ p: 0, background: 'linear-gradient(180deg, #f8fafc 0%, #e3f2fd 100%)' }}
      >
        {tab === 0 && (
          <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
            {(() => {
              const InfoRow = ({ title, value, icon }) => (
                <Grid container alignItems="center" spacing={1} sx={{ mb: 1.2 }}>
                  <Grid item xs={12} sm={5} md={4}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      }}
                    >
                      {icon && icon}
                      {title}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={7} md={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          wordBreak: 'break-all',
                          transition: 'color 0.2s',
                          '& a:hover': {
                            color: '#1976d2',
                            textDecoration: 'underline',
                          },
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        }}
                      >
                        {title === 'Phone Number' ? (
                          <a
                            href={`tel:${getCountryCode(selectedLead.home_mc_name || selectedLead.homeMC)}${value}`}
                            style={{ color: '#1976d2', textDecoration: 'underline' }}
                          >
                            {getCountryCode(selectedLead.home_mc_name || selectedLead.homeMC)} {value}
                          </a>
                        ) : title === 'Email' ? (
                          <a
                            href={`mailto:${value}`}
                            style={{ color: '#1976d2', textDecoration: 'underline' }}
                          >
                            {value}
                          </a>
                        ) : (
                          value || '-'
                        )}
                      </Typography>
                      {(title === 'Phone Number' || title === 'Email') && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(value, title, selectedLead);
                          }}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            },
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              );

              return (
                <>
                  {/* Contact Information */}
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: 'white',
                      mb: 2,
                      boxShadow: '0 2px 12px rgba(40,60,90,0.06)',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 700,
                        mb: 2,
                        letterSpacing: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <EmailIcon fontSize="medium" color="action" /> Contact Information
                    </Typography>
                    <InfoRow
                      title="Email"
                      value={selectedLead.email}
                      icon={<EmailIcon fontSize="small" color="action" />}
                    />
                    <InfoRow
                      title="Phone Number"
                      value={selectedLead.contact_number || selectedLead.phone}
                      icon={<PhoneIcon fontSize="small" color="action" />}
                    />
                  </Paper>

                  {/* Lead Information */}
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: 'white',
                      mb: 2,
                      boxShadow: '0 2px 12px rgba(40,60,90,0.06)',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 700,
                        mb: 2,
                        letterSpacing: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <PersonIcon fontSize="medium" color="action" /> Lead Information
                    </Typography>
                    <InfoRow
                      title="EP ID_Opp ID"
                      value={`${selectedLead.expa_person_id}_${selectedLead.opp_id}`}
                      icon={<PersonIcon fontSize="small" color="action" />}
                    />
                    <InfoRow
                      title="Full Name"
                      value={selectedLead.full_name || selectedLead.fullName}
                      icon={<PersonIcon fontSize="small" color="action" />}
                    />
                    <InfoRow
                      title="Status"
                      value={selectedLead.status}
                      icon={<EventIcon fontSize="small" color="action" />}
                    />
                  </Paper>

                  {/* Location Information */}
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: 'white',
                      mb: 2,
                      boxShadow: '0 2px 12px rgba(40,60,90,0.06)',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 700,
                        mb: 2,
                        letterSpacing: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <LocationIcon fontSize="medium" color="action" /> Location Information
                    </Typography>
                    <InfoRow
                      title="Host MC"
                      value={selectedLead.host_mc_name || selectedLead.hostMC}
                      icon={<FlagIcon fontSize="small" color="action" />}
                    />
                    <InfoRow
                      title="Host LC"
                      value={selectedLead.host_lc_name || selectedLead.hostLC}
                      icon={<LocationIcon fontSize="small" color="action" />}
                    />
                  </Paper>

                  {/* Exchange Information */}
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: 'white',
                      mb: 2,
                      boxShadow: '0 2px 12px rgba(40,60,90,0.06)',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 700,
                        mb: 2,
                        letterSpacing: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <WorkIcon fontSize="medium" color="action" /> Exchange Information
                    </Typography>
                    <InfoRow
                      title="Opportunity Link"
                      value={(() => {
                        const oppUrl = getOpportunityUrl(selectedLead.programme, selectedLead.opp_id);
                        return oppUrl ? (
                          <a
                            href={oppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#1976d2', textDecoration: 'underline' }}
                          >
                            {oppUrl}
                          </a>
                        ) : (
                          selectedLead.opportunityLink ? (
                            <a
                              href={selectedLead.opportunityLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#1976d2', textDecoration: 'underline' }}
                            >
                              {selectedLead.opportunityLink}
                            </a>
                          ) : '-'
                        );
                      })()
                      }
                      icon={<BusinessIcon fontSize="small" color="action" />}
                    />
                    <Grid container alignItems="center" spacing={1} sx={{ mb: 1.2 }}>
                      <Grid item xs={5} md={4}>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <WorkIcon fontSize="small" color="action" /> Product
                        </Typography>
                      </Grid>
                      <Grid item xs={7} md={8}>
                        <Chip
                          label={selectedLead.programme}
                          sx={{
                            ...getProgrammeChipSx(selectedLead.programme),
                            fontSize: '1rem',
                            boxShadow: '0 2px 8px rgba(40,60,90,0.10)',
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Dates */}
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: 'white',
                      mb: 2,
                      boxShadow: '0 2px 12px rgba(40,60,90,0.06)',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 700,
                        mb: 2,
                        letterSpacing: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <EventIcon fontSize="medium" color="action" /> Dates
                    </Typography>

                    <Table size="small" sx={{ minWidth: 320, background: 'white', borderRadius: 1 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: 700, color: 'primary.main', border: 0, fontSize: '1rem' }}
                          >
                            Field
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 700, color: 'primary.main', border: 0, fontSize: '1rem' }}
                          >
                            Date
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { label: 'Date Approved', value: selectedLead.apdDate },
                          { label: 'Slot Start Date', value: selectedLead.slot_start_date },
                          { label: 'Slot End Date', value: selectedLead.slot_end_date },
                          { label: 'Date Realized', value: selectedLead.realizedDate },
                          { label: 'Experience End Date', value: selectedLead.finishDate },
                        ].map((row, idx) => (
                          <TableRow
                            key={row.label}
                            sx={{ background: idx % 2 === 0 ? 'grey.100' : 'white' }}
                          >
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                border: 0,
                                width: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <EventIcon fontSize="small" color="action" /> {row.label}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: 'text.secondary',
                                border: 0,
                                fontWeight: 500,
                                fontSize: '1rem',
                              }}
                            >
                              {formatDate(row.value) || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>

                  {/* Additional Information */}
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: 'white',
                      mb: 2,
                      boxShadow: '0 2px 12px rgba(40,60,90,0.06)',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 700,
                        mb: 2,
                        letterSpacing: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <SchoolIcon fontSize="medium" color="action" /> Additional Information
                    </Typography>
                    <InfoRow
                      title="Title"
                      value={selectedLead.opp_title}
                      icon={<BusinessIcon fontSize="small" color="action" />}
                    />

                    <InfoRow
                      title="Signup Date"
                      value={formatDate(selectedLead.created_at)}
                      icon={<EventIcon fontSize="small" color="action" />}
                    />
                  </Paper>

             
                </>
              );
            })()}
          </Stack>
        )}

        {tab === 1 && (
          <PreparationStepsTab
            selectedLead={selectedLead}
            prepState={prepState}
            setPrepState={setPrepState}
            fileToBase64={fileToBase64}
          />
        )}

        {tab === 2 && (
          <ExperienceTab
            selectedLead={selectedLead}
            prepState={prepState}
            setPrepState={setPrepState}
            formatDateTime={formatDate}
            fileToBase64={fileToBase64}
          />
        )}

        {tab === 3 && (
          <PostExperienceTab
            selectedLead={selectedLead}
            formatDateTime={formatDate}
            fileToBase64={fileToBase64}
          />
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          gap: 1,
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
            transformOrigin: 'top left',
          },
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', gap: 1 }}>
          <Button
            onClick={onClose}
            sx={{
              transform: 'skew(-2deg)',
              '& .MuiButton-label': {
                transform: 'skew(2deg)',
              },
            }}
          >
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
