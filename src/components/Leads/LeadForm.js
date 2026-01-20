import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Box
} from '@mui/material';

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' }
];

const oGXProductOptions = [
  { value: 'GV New', label: 'GV New' },
  { value: 'GTa', label: 'GTa' },
  { value: 'GTe', label: 'GTe' },
  { value: 'GV Old', label: 'GV Old' },
  { value: 'GT', label: 'GT' },
  { value: 'GE', label: 'GE' }
];

const iCXProductOptions = [
  { value: 'iGV', label: 'iGV' },
  { value: 'iGTa', label: 'iGTa' },
  { value: 'iGTe', label: 'iGTe' }
];

const companySizeOptions = [
  { value: 'small', label: 'Small (1-50)' },
  { value: 'medium', label: 'Medium (51-200)' },
  { value: 'large', label: 'Large (201+)' }
];

const industryOptions = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' }
];

function LeadForm({ open, onClose, onSave, initialData, isICX = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    status: 'open',
    score: 0,
    product: '',
    // oGX specific fields
    background: '',
    graduation: '',
    // iCX specific fields
    company_name: '',
    contact_person: '',
    position: '',
    company_size: '',
    industry: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        source: '',
        status: 'open',
        score: 0,
        product: '',
        background: '',
        graduation: '',
        company_name: '',
        contact_person: '',
        position: '',
        company_size: '',
        industry: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {isICX ? (
              <>
                <Grid item xs={12}>
                  <TextField
                    name="company_name"
                    label="Company Name"
                    value={formData.company_name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="contact_person"
                    label="Contact Person"
                    value={formData.contact_person}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="position"
                    label="Position"
                    value={formData.position}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="source"
                label="Source"
                value={formData.source}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="status"
                label="Status"
                select
                value={formData.status}
                onChange={handleChange}
                fullWidth
              >
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="score"
                label="Score"
                type="number"
                value={formData.score}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, max: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="product"
                label="Product"
                select
                value={formData.product}
                onChange={handleChange}
                fullWidth
              >
                {(isICX ? iCXProductOptions : oGXProductOptions).map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {isICX ? (
              <>
                <Grid item xs={12}>
                  <TextField
                    name="company_size"
                    label="Company Size"
                    select
                    value={formData.company_size}
                    onChange={handleChange}
                    fullWidth
                  >
                    {companySizeOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="industry"
                    label="Industry"
                    select
                    value={formData.industry}
                    onChange={handleChange}
                    fullWidth
                  >
                    {industryOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12}>
                  <TextField
                    name="background"
                    label="Background"
                    value={formData.background}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="graduation"
                    label="Graduation Year"
                    type="number"
                    value={formData.graduation}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 2000, max: 2100 }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? 'Update' : 'Add'} {isICX ? 'iCX' : 'oGX'} Lead
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default LeadForm;
