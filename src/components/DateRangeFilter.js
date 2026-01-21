import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Button,
  Popover,
  IconButton,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  CalendarToday as CalendarIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  ViewWeek as ViewWeekIcon,
  ViewModule as ViewModuleIcon,
  Clear as ClearIcon,
  FilterAltOff as FilterAltOffIcon,
} from '@mui/icons-material';

const DateRangeFilter = ({ onDateFilterChange, customFields, onClearFilter, currentDateRange }) => {
  const [selectedField, setSelectedField] = useState(currentDateRange?.field || '');
  const [selectedRange, setSelectedRange] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeFilter, setActiveFilter] = useState(!!currentDateRange?.field);

  const defaultDateFields = [
    { value: 'apdDate', label: 'Date Approved', icon: <EventIcon /> },
    { value: 'slotStartDate', label: 'Slot Start Date', icon: <DateRangeIcon /> },
    { value: 'slotEndDate', label: 'Slot End Date', icon: <DateRangeIcon /> },
    { value: 'realizedDate', label: 'Date Realized', icon: <EventIcon /> },
    { value: 'finishDate', label: 'Experience End Date', icon: <EventIcon /> },
  ];

  const leadsDateFields = [
    { value: 'created_at', label: 'Date Signed Up', icon: <EventIcon /> },
    { value: 'applied_date', label: 'Date Applied', icon: <EventIcon /> },
    { value: 'accepted_date', label: 'Date Accepted', icon: <EventIcon /> },
    { value: 'approved_date', label: 'Date Approved', icon: <EventIcon /> },
    { value: 'realized_date', label: 'Date Realized', icon: <EventIcon /> },
    { value: 'finished_date', label: 'Date Finished', icon: <EventIcon /> },
    { value: 'completed_date', label: 'Date Completed', icon: <EventIcon /> }
  ];

  const dateFields = customFields === 'leads' ? leadsDateFields : defaultDateFields;

  const dateRanges = [
    { value: 'today', label: 'Today', icon: <TodayIcon />, color: '#2196f3' },
    { value: 'thisWeek', label: 'This Week', icon: <ViewWeekIcon />, color: '#4caf50' },
    { value: 'thisSprint', label: 'This Sprint (15 days)', icon: <ViewModuleIcon />, color: '#ff9800' },
    { value: 'thisMonth', label: 'This Month', icon: <CalendarIcon />, color: '#9c27b0' },
    { value: 'thisQuarter', label: 'This Quarter', icon: <ScheduleIcon />, color: '#f44336' },
    { value: 'custom', label: 'Custom Date', icon: <DateRangeIcon />, color: '#795548' },
  ];

  const calculateDateRange = (range) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate = new Date(today);
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    switch (range) {
      case 'today':
        break;
        
      case 'thisWeek': {
        // Get the first day of the current week (Sunday)
        const diff = today.getDate() - today.getDay();
        startDate = new Date(today.setDate(diff));
        break;
      }
        
      case 'thisSprint': {
        // Last 15 days including today
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 14);
        break;
      }
        
      case 'thisMonth': {
        // First day of current month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        // Last day of current month
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      }
        
      case 'thisQuarter': {
        const quarter = Math.floor(today.getMonth() / 3);
        // First day of current quarter
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        // Last day of current quarter
        endDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59, 999);
        break;
      }
        
      default:
        return null;
    }

    return { startDate, endDate };
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFieldChange = (event) => {
    const field = event.target.value;
    setSelectedField(field);
    setActiveFilter(true);
    
    // If a range is already selected, apply the filter with the new field
    if (selectedRange) {
      if (selectedRange === 'custom') {
        if (customStartDate && customEndDate) {
          onDateFilterChange({
            field,
            startDate: new Date(customStartDate),
            endDate: new Date(new Date(customEndDate).setHours(23, 59, 59, 999))
          });
        }
      } else {
        const dates = calculateDateRange(selectedRange);
        if (dates) {
          onDateFilterChange({
            field,
            startDate: dates.startDate,
            endDate: dates.endDate
          });
        }
      }
    }
  };

  const handleRangeChange = (event) => {
    const range = event.target.value;
    setSelectedRange(range);
    setActiveFilter(true);
    
    if (!selectedField) return;

    if (range === 'custom') {
      // Clear any existing custom dates
      setCustomStartDate('');
      setCustomEndDate('');
    } else {
      const dates = calculateDateRange(range);
      if (dates) {
        onDateFilterChange({
          field: selectedField,
          startDate: dates.startDate,
          endDate: dates.endDate
        });
      }
    }
  };

  const handleCustomDateChange = (type, value) => {
    if (type === 'start') {
      setCustomStartDate(value);
      setActiveFilter(true);
      if (customEndDate && value) {
        const startDate = new Date(value);
        const endDate = new Date(new Date(customEndDate).setHours(23, 59, 59, 999));
        if (startDate <= endDate) {
          onDateFilterChange({
            field: selectedField,
            startDate,
            endDate
          });
        }
      }
    } else {
      setCustomEndDate(value);
      setActiveFilter(true);
      if (customStartDate && value) {
        const startDate = new Date(customStartDate);
        const endDate = new Date(new Date(value).setHours(23, 59, 59, 999));
        if (startDate <= endDate) {
          onDateFilterChange({
            field: selectedField,
            startDate,
            endDate
          });
        }
      }
    }
  };

  const getSelectedFieldLabel = () => {
    const field = dateFields.find(f => f.value === selectedField);
    return field ? field.label : '';
  };

  const getSelectedRangeLabel = () => {
    const range = dateRanges.find(r => r.value === selectedRange);
    return range ? range.label : '';
  };

  const open = Boolean(anchorEl);

  const clearFilter = () => {
    setSelectedField('');
    setSelectedRange('');
    setCustomStartDate('');
    setCustomEndDate('');
    setActiveFilter(false);
    onDateFilterChange({
      field: '',
      startDate: null,
      endDate: null
    });
    if (onClearFilter) {
      onClearFilter();
    }
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Button
        variant={activeFilter ? "contained" : "outlined"}
        color={activeFilter ? "primary" : "inherit"}
        onClick={handleClick}
        startIcon={<FilterListIcon />}
        sx={{
          ml: 1,
          minWidth: 130,
          position: 'relative',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        }}
      >
        {activeFilter ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="button">Date Filter</Typography>
            <Chip
              label={getSelectedFieldLabel()}
              size="small"
              sx={{
                height: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'inherit',
                fontSize: '0.75rem',
              }}
            />
          </Stack>
        ) : (
          'Date Filter'
        )}
      </Button>
      
      {activeFilter && (
        <Tooltip title="Clear filter">
          <IconButton
            onClick={clearFilter}
            size="small"
            color="primary"
            sx={{
              ml: 1,
              bgcolor: 'rgba(25, 118, 210, 0.08)',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.15)',
              },
            }}
          >
            <FilterAltOffIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ 
          width: 340,
          maxHeight: '80vh',
          overflow: 'auto',
          '::-webkit-scrollbar': {
            width: '8px',
          },
          '::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
          '::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}>
          <Box sx={{ 
            p: 2.5,
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Date Filter
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Select a date field and range to filter the data
              </Typography>
            </Box>
            {activeFilter && (
              <Tooltip title="Clear filter">
                <IconButton
                  onClick={clearFilter}
                  size="small"
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)',
                    },
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box sx={{ p: 2.5 }}>
            <FormControl fullWidth>
              <InputLabel>Filter By</InputLabel>
              <Select
                value={selectedField}
                label="Filter By"
                onChange={handleFieldChange}
                sx={{
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  },
                }}
              >
                {dateFields.map((field) => (
                  <MenuItem 
                    key={field.value} 
                    value={field.value}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    {field.icon}
                    {field.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedField && (
              <Box sx={{ mt: 3 }}>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary"
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  Select Date Range
                </Typography>
                <RadioGroup
                  value={selectedRange}
                  onChange={handleRangeChange}
                >
                  <Stack spacing={1}>
                    {dateRanges.map((range) => (
                      <FormControlLabel
                        key={range.value}
                        value={range.value}
                        control={
                          <Radio 
                            sx={{
                              color: range.color,
                              '&.Mui-checked': {
                                color: range.color,
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 1,
                          }}>
                            {React.cloneElement(range.icon, { 
                              sx: { color: range.color } 
                            })}
                            <Typography>{range.label}</Typography>
                          </Box>
                        }
                        sx={{
                          mx: 0,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            borderRadius: 1,
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </RadioGroup>

                {selectedRange === 'custom' && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={2}>
                      <TextField
                        label="Start Date"
                        type="date"
                        value={customStartDate}
                        onChange={(e) => handleCustomDateChange('start', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      />
                      <TextField
                        label="End Date"
                        type="date"
                        value={customEndDate}
                        onChange={(e) => handleCustomDateChange('end', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      />
                    </Stack>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {activeFilter && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}>
              <Typography variant="body2" color="text.secondary">
                Active Filter:
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip
                  label={getSelectedFieldLabel()}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={getSelectedRangeLabel()}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>
            </Box>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

export default DateRangeFilter; 