import React from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { AssignmentInd as BulkAssignIcon } from '@mui/icons-material';

export default function LeadTableHeader({ 
  selectedLeadsCount, 
  members, 
  assignedMemberFilter, 
  setAssignedMemberFilter, 
  onBulkAssignClick 
}) {
  return (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h6">
        {selectedLeadsCount > 0 ? selectedLeadsCount + ' leads selected' : 'All Leads'}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Assigned member</InputLabel>
          <Select
            value={assignedMemberFilter}
            label="Assigned member"
            onChange={(e) => {
              setAssignedMemberFilter(e.target.value);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="__UNASSIGNED__">Unassigned</MenuItem>
            {members.map((m) => (
              <MenuItem key={m.expa_person_id} value={String(m.expa_person_id)}>
                {m.full_name}
                {m?.role ? ' (' + m.role + ')' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedLeadsCount > 0 && (
          <Button
            variant="contained"
            startIcon={<BulkAssignIcon />}
            onClick={onBulkAssignClick}
          >
            Assign Selected Leads
          </Button>
        )}
      </Box>
    </Box>
  );
}

