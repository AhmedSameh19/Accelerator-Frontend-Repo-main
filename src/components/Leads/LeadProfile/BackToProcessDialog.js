import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField } from '@mui/material';

export default function BackToProcessDialog({
  open,
  onClose,
  backToProcessComment,
  setBackToProcessComment,
  onConfirm,
}) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(90deg, #0CB9C1 0%, #1976d2 100%)',
        color: '#fff',
        fontWeight: 600
      }}>
        Mark EP Back to Process
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Please provide a reason for marking this EP back to process:
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Enter your comment..."
          value={backToProcessComment}
          onChange={(e) => setBackToProcessComment(e.target.value)}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={!backToProcessComment.trim()}
          sx={{
            background: 'linear-gradient(90deg, #0CB9C1 0%, #1976d2 100%)',
            '&:hover': {
              background: 'linear-gradient(90deg, #0aa8af 0%, #1565c0 100%)',
            }
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

