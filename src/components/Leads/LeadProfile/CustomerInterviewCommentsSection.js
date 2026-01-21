import React from 'react';
import { Paper, Typography, TextField, Button, List, ListItem, Box } from '@mui/material';
import { Comment as CommentIcon } from '@mui/icons-material';

export default function CustomerInterviewCommentsSection({
  comments,
  newComment,
  setNewComment,
  onAddComment,
  isB2C
}) {
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
      />
      <Button
        fullWidth
        variant="contained"
        onClick={onAddComment}
        startIcon={<CommentIcon />}
        disabled={!isB2C}
      >
        Add Customer Interview Comment
      </Button>
      <List sx={{ mt: 2 }}>
        {comments.map((comment) => (
          <ListItem 
            key={comment.id}
            sx={{ 
              bgcolor: 'background.default',
              borderRadius: 1,
              mb: 1,
              flexDirection: 'column'
            }}
          >
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {new Date(comment.created_at).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {comment.author}
              </Typography>
            </Box>
            <Typography variant="body2">
              {comment.text}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

