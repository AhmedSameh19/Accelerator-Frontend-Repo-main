import React from 'react';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  styled,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function DrawerContent({
  open,
  theme,
  menuItems,
  activePath,
  currentUser,
  onToggleOpen,
  onNavigate,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'transparent',
        background: 'linear-gradient(90deg, #1976d2 0%, #0CB9C1 100%)',
      }}
    >
      <DrawerHeader>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            ml: 2,
            fontWeight: 600,
            display: open ? 'block' : 'none',
            color: '#fff',
          }}
        >
          The Accelerator
        </Typography>
        <IconButton
          onClick={onToggleOpen}
          sx={{
            color: '#fff',
            transform: open ? 'none' : 'rotate(180deg)',
            transition: 'transform 0.3s',
            mr: open ? 0 : '4px',
          }}
        >
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: open ? 'flex-start' : 'space-evenly',
          py: open ? 0 : 2,
        }}
      >
        {menuItems
          .filter((item) => item.show)
          .map((item) => (
            <ListItem
              key={item.text}
              disablePadding
              sx={{
                mb: open ? 1 : 0,
                mx: 1,
                borderRadius: 0,
              }}
            >
              <ListItemButton
                onClick={() => onNavigate(item.path)}
                selected={activePath === item.path}
                sx={{
                  color: '#fff',
                  height: open ? 'auto' : 40,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.12)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: '#fff',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: open ? 1 : 0,
                    transition: 'opacity 0.2s',
                    '& .MuiTypography-root': {
                      color: '#fff',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
      <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            borderRadius: 0,
            bgcolor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            {currentUser?.name?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              opacity: open ? 1 : 0,
              transition: 'opacity 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              ml: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                lineHeight: 1.2,
              }}
            >
              {currentUser?.name || 'User'}
            </Typography>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontWeight: 400,
                fontSize: 12,
                lineHeight: 1.2,
              }}
            >
              {currentUser?.email || 'user@example.com'}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 400,
                fontSize: 10,
                lineHeight: 1.2,
                mt: 0.5,
              }}
            >
              LC: {currentUser?.lc || 'N/A'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
