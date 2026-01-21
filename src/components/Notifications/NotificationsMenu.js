import React from 'react';
import {
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { useNotifications } from '../../context/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';

function NotificationsMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification, 
    clearAllNotifications 
  } = useNotifications();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleClearNotification = (notificationId) => {
    clearNotification(notificationId);
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          size="large"
          color="inherit"
          onClick={handleClick}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)'
            }
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            mt: 1.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {notifications.length > 0 && (
            <Box>
              <Tooltip title="Mark all as read">
                <IconButton size="small" onClick={markAllAsRead} sx={{ mr: 1 }}>
                  <DoneAllIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear all">
                <IconButton size="small" onClick={clearAllNotifications}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {notification.read ? (
                      <CheckCircleIcon color="action" fontSize="small" />
                    ) : (
                      <CircleIcon color="primary" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block' }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  <Box>
                    {!notification.read && (
                      <Tooltip title="Mark as read">
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(notification.id)}
                          sx={{ mr: 0.5 }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleClearNotification(notification.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
}

export default NotificationsMenu; 