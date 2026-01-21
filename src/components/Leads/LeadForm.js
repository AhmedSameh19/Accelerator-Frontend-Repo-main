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

import { ICXFields, OGXFields, CommonFields } from './LeadForm/LeadFormFields';

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
            {isICX ? <ICXFields formData={formData} handleChange={handleChange} /> : <OGXFields formData={formData} handleChange={handleChange} />}
            <CommonFields formData={formData} handleChange={handleChange} isICX={isICX} />
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
