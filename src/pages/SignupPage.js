import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, TextField, Button, Paper, Alert,
  Link, CircularProgress, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import { signup } from '../api/services/authService.ts';
import { LC_CODES } from '../lcCodes';
import { ERROR_MESSAGES } from '../utils/errorHandler';

function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    lc_code: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const lcCodes = LC_CODES;
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validateField = (name, value) => {
    let errorMsg = '';
    if (!value && name !== 'confirmPassword') {
      errorMsg = ERROR_MESSAGES.REQUIRED;
    } else if (name === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
      errorMsg = ERROR_MESSAGES.INVALID_EMAIL;
    } else if (name === 'password' && value && value.length < 8) {
      errorMsg = ERROR_MESSAGES.PASSWORD_SHORT;
    } else if (name === 'confirmPassword') {
      if (!value) errorMsg = ERROR_MESSAGES.REQUIRED;
      else if (value !== formData.password) errorMsg = 'Passwords do not match';
    }
    
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
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

  const validate = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.lc_code) {
      setErrors(prev => ({ ...prev, lc_code: 'Please select your Local Committee' }));
      return false;
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { confirmPassword, ...signupData } = formData;
      await signup(signupData);
      setSuccess(true);
      setFormData({ name: '', email: '', password: '', confirmPassword: '', lc_code: '' });
      setErrors({});
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.friendlyMessage || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#037EF3',
      background: 'linear-gradient(135deg, #037EF3 0%, #025bb5 100%)',
      display: 'flex',
      alignItems: 'center',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ 
          padding: { xs: 3, md: 5 }, 
          width: '100%', 
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom 
              sx={{ fontWeight: 800, fontFamily: 'Montserrat, sans-serif', color: 'primary.main', letterSpacing: '-0.02em' }}>
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join the Accelerator and manage your chapter
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              Account created successfully! Your account is pending approval from an administrator.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading || success}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading || success}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={loading || success}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm"
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={loading || success}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
            <FormControl fullWidth margin="normal" required variant="outlined" error={!!errors.lc_code}>
              <InputLabel id="lc-code-label">Local Committee</InputLabel>
              <Select
                labelId="lc-code-label"
                id="lc_code"
                name="lc_code"
                value={formData.lc_code}
                label="Local Committee"
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading || success}
                sx={{ borderRadius: 2 }}
              >
                {lcCodes.map(lc => (
                  <MenuItem key={lc.id} value={lc.id}>
                    {lc.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.lc_code && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {errors.lc_code}
                </Typography>
              )}
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: '1rem' }}
              disabled={loading || success}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link href="/login" sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default SignupPage;
