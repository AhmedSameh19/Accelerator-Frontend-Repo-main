import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, List, ListItem, Box, Snackbar, Alert } from '@mui/material';
import { Comment as CommentIcon } from '@mui/icons-material';

export default function CustomerInterviewCommentsSection({
  comments,
  newComment,
  setNewComment,
  onAddComment,
  isB2C
}) {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() && isB2C) {
      // Save the comment text before clearing
      const commentText = newComment;
      // Clear the input immediately for better UX
      setNewComment('');
      
      try {
        // Pass the comment text to the handler
        await onAddComment(commentText);
        // Show success message only if no error was thrown
        setSnackbar({
          open: true,
          message: 'Comment submitted successfully!',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error in handleSubmit:', error);
        // Restore the comment text if submission failed
        setNewComment(commentText);
        
        // Extract error message
        let errorMessage = 'Failed to submit comment. Please try again.';
        if (error?.response?.status === 500) {
          errorMessage = 'Server error (500): The server encountered an error. Please try again later.';
        } else if (error?.response?.status) {
          errorMessage = `Error (${error.response.status}): ${error.response.data?.message || error.message || 'Please try again.'}`;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Paper elevation={1} sx={{ 
      p: { xs: 1.5, sm: 2.5 }, 
      borderRadius: 3, 
      bgcolor: '#f8fafc', 
      mb: 2, 
      boxShadow: '0 1px 4px rgba(40,60,90,0.04)' 
    }}>
      <Typography variant="h6" sx={{ 
        color: 'primary.main', 
        fontWeight: 700, 
        mb: 2, 
        letterSpacing: 1, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1 
      }}>
        <CommentIcon color="primary" /> Customer Interview Comments
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Add a customer interview comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!isB2C}
          sx={{ mb: 1 }}
          onKeyDown={(e) => {
            // Prevent Enter from submitting, only allow Shift+Enter for new line
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
            }
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          startIcon={<CommentIcon />}
          disabled={!isB2C || !newComment.trim()}
        >
          Add Customer Interview Comment
        </Button>
      </form>
      <List sx={{ mt: 2 }}>
        {comments && comments.length > 0 ? (
          comments.map((comment, index) => {
            // Handle different date formats from API
            const date = comment.created_at || comment.createdAt || comment.timestamp || comment.date;
            let formattedDate = 'Date not available';
            
            if (date) {
              try {
                const dateObj = new Date(date);
                if (!isNaN(dateObj.getTime())) {
                  formattedDate = dateObj.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                }
              } catch (e) {
                formattedDate = date;
              }
            }
            
            // Backend returns comment.comment, frontend uses comment.text
            const commentText = comment.comment || comment.text || comment.content || '';
            // Backend returns creator_name
            const author = comment.creator_name || comment.author || comment.author_name || comment.created_by_name || 'Unknown';
            
            return (
              <ListItem 
                key={comment.id || comment._id || `comment-${index}`}
                sx={{ 
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  mb: 1.5,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {formattedDate}
                  </Typography>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                    {author}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {commentText}
                </Typography>
              </ListItem>
            );
          })
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No comments yet. Be the first to add a comment!
            </Typography>
          </Box>
        )}
      </List>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity || (snackbar.message.includes('Failed') ? 'error' : 'success')}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

