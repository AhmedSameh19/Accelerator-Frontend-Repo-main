import React from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';

export default function OGXBulkAssignDialog({
  open,
  onClose,
  selectedLeadsCount,
  selectedMember,
  setSelectedMember,
  members,
  onConfirm,
  loading = false,
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bulk Assign Realizations</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography>
            {selectedLeadsCount === 1 
              ? 'Assigning 1 realization to:' 
              : `Assigning ${selectedLeadsCount} realizations to:`}
          </Typography>
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Select Member</InputLabel>
            <Select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              label="Select Member"
            >
              {members && members.length > 0 ? (
                members.map((member) => (
                  <MenuItem key={member.expa_person_id} value={member.expa_person_id}>
                    {member.full_name} ({member.role})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No team members available</MenuItem>
              )}
            </Select>
          </FormControl>
          {members && members.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No team members found. Please refresh and try again.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          disabled={!selectedMember || loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {loading ? 'Assigning...' : `Assign ${selectedLeadsCount} Realization${selectedLeadsCount > 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
