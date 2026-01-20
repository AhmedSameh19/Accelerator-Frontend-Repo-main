import React from 'react';
import {
  Autocomplete,
  Card,
  CardContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';

export default function OGXFiltersCard({
  searchTerm,
  setSearchTerm,
  selectedCountry,
  setSelectedCountry,
  selectedHostLC,
  setSelectedHostLC,
  selectedLanguage,
  setSelectedLanguage,
  selectedExchangeType,
  setSelectedExchangeType,
  selectedStatus,
  setSelectedStatus,
  uniqueHostMCs,
  uniqueHostLCs,
  uniqueHomeLCs,
  exchangeTypes,
  statuses,
}) {
  return (
    <Card sx={{ mb: { xs: 2, sm: 3 } }}>
      <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
        <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Search EPs"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                endAdornment:
                  searchTerm && (
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': { color: 'primary.main' },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
              }}
              placeholder="Search by EP ID, OP ID, name, or phone..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: { xs: '48px', sm: '56px' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth>
              <Autocomplete
                value={selectedCountry}
                onChange={(event, newValue) => {
                  setSelectedCountry(newValue);
                }}
                options={['Show All', ...uniqueHostMCs]}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Host MC"
                    variant="outlined"
                    sx={{
                      minWidth: { xs: '100%', sm: '156px' },
                      '& .MuiOutlinedInput-root': {
                        height: { xs: '48px', sm: '56px' },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                )}
                ListboxProps={{
                  sx: {
                    maxHeight: '300px',
                    minWidth: {
                      xs: '100% !important',
                      sm: '156px !important',
                    },
                    '& .MuiAutocomplete-option': {
                      fontSize: { xs: '0.875rem', sm: '0.9rem' },
                      padding: '8px 16px',
                      minHeight: '40px',
                    },
                  },
                }}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth>
              <Autocomplete
                value={selectedHostLC}
                onChange={(event, newValue) => {
                  setSelectedHostLC(newValue);
                }}
                options={['Show All', ...uniqueHostLCs]}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Host LC"
                    variant="outlined"
                    sx={{
                      minWidth: { xs: '100%', sm: '156px' },
                      '& .MuiOutlinedInput-root': {
                        height: { xs: '48px', sm: '56px' },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                )}
                ListboxProps={{
                  sx: {
                    maxHeight: '300px',
                    minWidth: {
                      xs: '100% !important',
                      sm: '156px !important',
                    },
                    '& .MuiAutocomplete-option': {
                      fontSize: { xs: '0.875rem', sm: '0.9rem' },
                      padding: '8px 16px',
                      minHeight: '40px',
                    },
                  },
                }}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth>
              <Autocomplete
                value={selectedLanguage}
                onChange={(event, newValue) => {
                  setSelectedLanguage(newValue);
                }}
                options={['Show All', ...uniqueHomeLCs]}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Home LC"
                    variant="outlined"
                    sx={{
                      minWidth: { xs: '100%', sm: '156px' },
                      '& .MuiOutlinedInput-root': {
                        height: { xs: '48px', sm: '56px' },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                )}
                ListboxProps={{
                  sx: {
                    maxHeight: '300px',
                    minWidth: {
                      xs: '100% !important',
                      sm: '156px !important',
                    },
                    '& .MuiAutocomplete-option': {
                      fontSize: { xs: '0.875rem', sm: '0.9rem' },
                      padding: '8px 16px',
                      minHeight: '40px',
                    },
                  },
                }}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Product</InputLabel>
              <Select
                value={selectedExchangeType}
                onChange={(e) => setSelectedExchangeType(e.target.value)}
                label="Product"
                sx={{
                  height: { xs: '48px', sm: '56px' },
                  minWidth: { xs: '100%', sm: '156px' },
                  '& .MuiSelect-select': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: { xs: '8px 14px', sm: '12px 14px' },
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: '300px',
                      minWidth: {
                        xs: '100% !important',
                        sm: '156px !important',
                      },
                      '& .MuiMenuItem-root': {
                        fontSize: { xs: '0.875rem', sm: '0.9rem' },
                        padding: '8px 16px',
                        minHeight: '40px',
                      },
                    },
                  },
                }}
              >
                <MenuItem value="">
                  <em>All Products</em>
                </MenuItem>
                {exchangeTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => {
                  console.log('Status changed to:', e.target.value);
                  setSelectedStatus(e.target.value);
                }}
                label="Status"
                sx={{
                  height: { xs: '48px', sm: '56px' },
                  minWidth: { xs: '100%', sm: '156px' },
                  '& .MuiSelect-select': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: { xs: '8px 14px', sm: '12px 14px' },
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: '300px',
                      minWidth: {
                        xs: '100% !important',
                        sm: '156px !important',
                      },
                      '& .MuiMenuItem-root': {
                        fontSize: { xs: '0.875rem', sm: '0.9rem' },
                        padding: '8px 16px',
                        minHeight: '40px',
                      },
                    },
                  },
                }}
              >
                <MenuItem value="">
                  <em>All Statuses</em>
                </MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
