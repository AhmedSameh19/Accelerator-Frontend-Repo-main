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
  Box,
  StepLabel,
  Stepper,
  Step,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { ERROR_MESSAGES } from '../../utils/errorHandler';
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
    background: '',
    graduation: '',
    company_name: '',
    contact_person: '',
    position: '',
    company_size: '',
    industry: ''
  });
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const steps = ['Primary Information', 'Additional Details'];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '', email: '', phone: '', source: '', status: 'open', score: 0, product: '',
        background: '', graduation: '', company_name: '', contact_person: '',
        position: '', company_size: '', industry: ''
      });
    }
    setErrors({});
    setActiveStep(0);
  }, [initialData, open]);

  const validateField = (name, value) => {
    let error = '';
    if (!value && ['name', 'email', 'company_name', 'contact_person'].includes(name)) {
      error = ERROR_MESSAGES.REQUIRED;
    } else if (name === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
      error = ERROR_MESSAGES.INVALID_EMAIL;
    } else if (name === 'phone' && value && !/^01[0-2,5]\d{8}$/.test(value.replace(/\s/g, ''))) {
      error = ERROR_MESSAGES.INVALID_PHONE;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      validateField(name, value);
    }
  };

  const validateStep = () => {
    const currentErrors = {};
    if (activeStep === 0) {
      if (isICX) {
        if (!formData.company_name) currentErrors.company_name = ERROR_MESSAGES.REQUIRED;
        if (!formData.contact_person) currentErrors.contact_person = ERROR_MESSAGES.REQUIRED;
      } else {
        if (!formData.name) currentErrors.name = ERROR_MESSAGES.REQUIRED;
      }
      if (!formData.email) currentErrors.email = ERROR_MESSAGES.REQUIRED;
      else if (!/\S+@\S+\.\S+/.test(formData.email)) currentErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }
    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (validateStep()) {
      onSave(formData);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {isICX ? (
              <>
                <Grid item xs={12}>
                  <TextField
                    name="company_name"
                    label="Company Name"
                    value={formData.company_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.company_name}
                    helperText={errors.company_name}
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
                    onBlur={handleBlur}
                    error={!!errors.contact_person}
                    helperText={errors.contact_person}
                    fullWidth
                    required
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
                  onBlur={handleBlur}
                  error={!!errors.name}
                  helperText={errors.name}
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
                onBlur={handleBlur}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phone"
                label="Phone (01X XXXX XXXX)"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.phone}
                helperText={errors.phone}
                fullWidth
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <CommonFields formData={formData} handleChange={handleChange} isICX={isICX} />
            {isICX ? null : <OGXFields formData={formData} handleChange={handleChange} hideName={true} />}
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      fullScreen={fullScreen}
      PaperProps={{
        sx: { borderRadius: fullScreen ? 0 : 3 }
      }}
    >
      <DialogTitle sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
        {initialData ? 'Edit Lead' : 'Add New Lead'}
      </DialogTitle>
      <DialogContent sx={{ pb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ pt: 2, pb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel error={activeStep === 0 && (!!errors.name || !!errors.email || !!errors.company_name || !!errors.contact_person)}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent(activeStep)}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>Cancel</Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep > 0 && (
          <Button onClick={handleBack} sx={{ mr: 1, borderRadius: 2 }}>
            Back
          </Button>
        )}
        {activeStep === steps.length - 1 ? (
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            sx={{ borderRadius: 2, px: 3 }}
          >
            {initialData ? 'Update' : 'Add'} {isICX ? 'iCX' : 'oGX'} Lead
          </Button>
        ) : (
          <Button 
            onClick={handleNext} 
            variant="contained" 
            color="primary"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default LeadForm;
