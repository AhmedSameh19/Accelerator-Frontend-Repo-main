import React from 'react';
import { Grid, TextField, MenuItem } from '@mui/material';
import { 
  STATUS_OPTIONS, 
  OGX_PRODUCT_OPTIONS, 
  ICX_PRODUCT_OPTIONS, 
  COMPANY_SIZE_OPTIONS, 
  INDUSTRY_OPTIONS 
} from './constants';

export function ICXFields({ formData, handleChange }) {
  return (
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
  );
}

export function OGXFields({ formData, handleChange, hideName = false }) {
  return (
    <>
      {!hideName && (
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
  );
}

export function CommonFields({ formData, handleChange, isICX }) {
  return (
    <>
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
          {STATUS_OPTIONS.map(option => (
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
          {(isICX ? ICX_PRODUCT_OPTIONS : OGX_PRODUCT_OPTIONS).map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      {isICX && (
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
              {COMPANY_SIZE_OPTIONS.map(option => (
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
              {INDUSTRY_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </>
      )}
    </>
  );
}

