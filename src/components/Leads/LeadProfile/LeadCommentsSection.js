import React from 'react';
import { Paper, ButtonGroup, Button, TextField, List, ListItem, Typography, Box, useTheme } from '@mui/material';
import { Comment as CommentIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { Chip } from '@mui/material';

export function LeadCommentsSection({
  comments,
  newComment,
  setNewComment,
  onAddComment,
  addingComment,
  isB2C
}) {
  const theme = useTheme();

  return (
    <>
      <TextField
        fullWidth
        multiline
        rows={2}
        variant="outlined"
        placeholder="Add a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        disabled={isB2C || addingComment}
        sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '1rem' } }}
      />
      <Button
        fullWidth
        variant="contained"
        onClick={onAddComment}
        startIcon={<CommentIcon />}
        disabled={isB2C || addingComment || !newComment.trim()}
        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 0.5, sm: 1 } }}
      >
        Add Comment
      </Button>
      <List sx={{ mt: { xs: 1, sm: 2 } }}>
        {comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            No comments yet.
          </Typography>
        ) : (
          comments.map((comment, index) => (
            <ListItem
              key={comment.id || index}
              sx={{
                bgcolor: theme.palette.background.paper,
                borderRadius: 1,
                mb: { xs: 0.5, sm: 1 },
                flexDirection: 'column',
                p: { xs: 1, sm: 2 }
              }}
            >
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: { xs: 0.5, sm: 1 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                  {new Date(comment.created_at || comment.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                  {comment.creator_name || 'Unknown'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {comment.comment}
              </Typography>
            </ListItem>
          ))
        )}
      </List>
    </>
  );
}

export function LeadFollowUpsSection({
  followUps,
  followUpFilter,
  setFollowUpFilter,
  newFollowUp,
  setNewFollowUp,
  followUpDate,
  setFollowUpDate,
  onAddFollowUp,
  onMarkFollowUpComplete,
  isB2C,
  lead
}) {
  const theme = useTheme();
  const filteredFollowUps = followUps.filter(followUp => followUp.status?.toLowerCase() === followUpFilter);

  return (
    <>
      <Box sx={{ mb: { xs: 1, sm: 2 }, width: '100%', overflow: 'hidden' }}>
        <ButtonGroup variant="contained" fullWidth sx={{ width: '100%', overflow: 'hidden' }}>
          <Button
            onClick={() => setFollowUpFilter('pending')}
            variant={followUpFilter === 'pending' ? 'contained' : 'outlined'}
            sx={{
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              py: { xs: 0.5, sm: 1 },
              minWidth: 0,
              flex: 1,
              px: { xs: 0.5, sm: 1 }
            }}
          >
            PENDING
          </Button>
          <Button
            onClick={() => setFollowUpFilter('completed')}
            variant={followUpFilter === 'completed' ? 'contained' : 'outlined'}
            sx={{
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              py: { xs: 0.5, sm: 1 },
              minWidth: 0,
              flex: 1,
              px: { xs: 0.5, sm: 1 }
            }}
          >
            COMPLETED
          </Button>
        </ButtonGroup>
      </Box>
      <TextField
        fullWidth
        multiline
        rows={2}
        variant="outlined"
        placeholder="Add a follow-up note..."
        value={newFollowUp}
        onChange={(e) => setNewFollowUp(e.target.value)}
        disabled={isB2C}
        sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '1rem' } }}
      />
      <TextField
        fullWidth
        type="datetime-local"
        variant="outlined"
        label="Follow-up Date"
        value={followUpDate}
        onChange={(e) => setFollowUpDate(e.target.value)}
        disabled={isB2C}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '1rem' } }}
      />
      <Button
        fullWidth
        variant="contained"
        onClick={onAddFollowUp}
        startIcon={<ScheduleIcon />}
        disabled={isB2C || !newFollowUp.trim() || !followUpDate}
        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 0.5, sm: 1 } }}
      >
        Schedule Follow-up
      </Button>
      <List sx={{ mt: { xs: 1, sm: 2 } }}>
        {filteredFollowUps.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, textAlign: 'center', py: 2 }}>
            No {followUpFilter} follow-ups yet.
          </Typography>
        ) : (
          filteredFollowUps.map((followUp) => (
            <ListItem
              key={followUp.id}
              sx={{
                bgcolor: theme.palette.background.default,
                borderRadius: 1,
                mb: { xs: 0.5, sm: 1 },
                flexDirection: 'column',
                p: { xs: 1, sm: 2 }
              }}
            >
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: { xs: 0.5, sm: 1 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                  {new Date(followUp.created_at).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                  {followUp.created_by_member_name || 'N/A'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {followUp.follow_up_text}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mt: 1 }}>
                <Chip
                  label={`Scheduled: ${followUp.follow_up_at ? new Date(followUp.follow_up_at).toLocaleString() : 'N/A'}`}
                  size="small"
                  color={followUp.status === 'completed' ? 'success' : 'warning'}
                  icon={<ScheduleIcon />}
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, height: { xs: '20px', sm: '24px' } }}
                />
                {followUp.status !== 'completed' && onMarkFollowUpComplete && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    onClick={() => onMarkFollowUpComplete(followUp)}
                    disabled={isB2C}
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, py: 0.5, px: 1 }}
                  >
                    Mark Complete
                  </Button>
                )}
              </Box>
            </ListItem>
          ))
        )}
      </List>
    </>
  );
}

