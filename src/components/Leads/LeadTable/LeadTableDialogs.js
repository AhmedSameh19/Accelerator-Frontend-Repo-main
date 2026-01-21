import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Stack, Typography } from '@mui/material';

export function AssignLeadDialog({ 
  open, 
  onClose, 
  members, 
  selectedMember, 
  setSelectedMember, 
  onConfirm 
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Lead</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Select Member</InputLabel>
          <Select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            label="Select Member"
          >
            {members.map((member) => (
              <MenuItem key={member.expa_person_id} value={member.expa_person_id}>
                {member.full_name} 
                {member?.role ? ' — ' + member.role : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          disabled={!selectedMember}
        >
          Assign 
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function BulkAssignDialog({ 
  open, 
  onClose, 
  members, 
  selectedMember, 
  setSelectedMember, 
  selectedLeadsCount, 
  onConfirm 
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bulk Assign Leads</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography>
            Assigning {selectedLeadsCount} leads to:
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Member</InputLabel>
            <Select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              label="Select Member"
            >
              {members.map((member) => (
                <MenuItem key={member.expa_person_id} value={member.expa_person_id}>
                  {member.full_name} 
                  {member?.role ? ' — ' + member.role : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          disabled={!selectedMember}
        >
          Assign {selectedLeadsCount} Leads 
        </Button>
      </DialogActions>
    </Dialog>
  );
}

