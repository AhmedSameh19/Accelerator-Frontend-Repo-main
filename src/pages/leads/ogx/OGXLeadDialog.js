import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import {
  Email as EmailIcon,
  Event as EventIcon,
  Flag as FlagIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  School as SchoolIcon,
  Work as WorkIcon,
} from '@mui/icons-material';

export default function OGXLeadDialog({
  open,
  onClose,
  selectedLead,
  newLead,
  handleInputChange,
  countries,
  languages,
  educationLevels,
  exchangeTypes,
  statuses,
  onSave,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{selectedLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={newLead.fullName}
              onChange={handleInputChange('fullName')}
              required
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newLead.email}
              onChange={handleInputChange('email')}
              required
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={newLead.phone}
              onChange={handleInputChange('phone')}
              required
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={newLead.country}
                onChange={handleInputChange('country')}
                label="Country"
                required
                startAdornment={<FlagIcon sx={{ mr: 1, color: 'primary.main' }} />}
              >
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="City"
              value={newLead.city}
              onChange={handleInputChange('city')}
              required
              InputProps={{
                startAdornment: <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={newLead.language}
                onChange={handleInputChange('language')}
                label="Language"
                required
                startAdornment={<LanguageIcon sx={{ mr: 1, color: 'primary.main' }} />}
              >
                {languages.map((language) => (
                  <MenuItem key={language} value={language}>
                    {language}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Education Level</InputLabel>
              <Select
                value={newLead.educationLevel}
                onChange={handleInputChange('educationLevel')}
                label="Education Level"
                required
                startAdornment={<SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />}
              >
                {educationLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Exchange Type</InputLabel>
              <Select
                value={newLead.exchangeType}
                onChange={handleInputChange('exchangeType')}
                label="Exchange Type"
                required
                startAdornment={<WorkIcon sx={{ mr: 1, color: 'primary.main' }} />}
              >
                {exchangeTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newLead.status}
                onChange={handleInputChange('status')}
                label="Status"
                required
                startAdornment={<EventIcon sx={{ mr: 1, color: 'primary.main' }} />}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" color="primary" startIcon={<SaveIcon />}>
          {selectedLead ? 'Save Changes' : 'Add Lead'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
