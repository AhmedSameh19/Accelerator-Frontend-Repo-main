import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
} from '@mui/material';

export default function LeadsFiltersPanel({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  contactStatusFilter,
  onContactStatusFilterChange,
  interestedFilter,
  onInterestedFilterChange,
  processStatusFilter,
  onProcessStatusFilterChange,
  reasonFilter,
  onReasonFilterChange,
}) {
  return (
    <Paper sx={{ width: '100%', mb: 3, overflowX: 'auto' }}>
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
            }}
          >
            <TextField
              label="Search by EP ID, name, email, or phone number"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              size="small"
              sx={{ minWidth: { xs: '100%', sm: 300 } }}
            />

            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => onStatusFilterChange(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="applied">Applied</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="realized">Realized</MenuItem>
                <MenuItem value="finished">Finished</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel>Contact Status</InputLabel>
              <Select
                value={contactStatusFilter}
                label="Contact Status"
                onChange={(e) => onContactStatusFilterChange(e.target.value)}
              >
                <MenuItem value="">All Contact Statuses</MenuItem>
                <MenuItem value="Yes">Yes Contacted</MenuItem>
                <MenuItem value="No">No Contacted</MenuItem>
                <MenuItem value="No answer">No answer</MenuItem>
                <MenuItem value="Busy">Busy</MenuItem>
                <MenuItem value="Out of Service">Out of Service</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
            }}
          >
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel>Interested</InputLabel>
              <Select
                value={interestedFilter}
                label="Interested"
                onChange={(e) => onInterestedFilterChange(e.target.value)}
              >
                <MenuItem value="">All Interest Levels</MenuItem>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel>Process Status</InputLabel>
              <Select
                value={processStatusFilter}
                label="Process Status"
                onChange={(e) => onProcessStatusFilterChange(e.target.value)}
              >
                <MenuItem value="">All Process Statuses</MenuItem>
                <MenuItem value="In Process">In Process</MenuItem>
                <MenuItem value="Out of Process">Out of Process</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel>Reason</InputLabel>
              <Select
                value={reasonFilter}
                label="Reason"
                onChange={(e) => onReasonFilterChange(e.target.value)}
              >
                <MenuItem value="">All Reasons</MenuItem>
                <MenuItem value="Military service">Military service</MenuItem>
                <MenuItem value="Health Issues">Health Issues</MenuItem>
                <MenuItem value="Financial issues">Financial issues</MenuItem>
                <MenuItem value="Summer course">Summer course</MenuItem>
                <MenuItem value="Bad Lead">Bad Lead</MenuItem>
                <MenuItem value="Not Interested">Not Interested</MenuItem>
                <MenuItem value="Parent's Issue">Parent's Issue</MenuItem>
                <MenuItem value="Backed out">Backed out</MenuItem>
                <MenuItem value="Other Plans">Other Plans</MenuItem>
                <MenuItem value="Currently working">Currently working</MenuItem>
                <MenuItem value="Want to join AIESEC">Want to join AIESEC</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
