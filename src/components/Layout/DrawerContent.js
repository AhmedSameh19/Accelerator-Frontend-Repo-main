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
})
{

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'var(--color-bg-sidebar)',
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
            color: 'var(--color-text-primary)',
          }}
        >
          The Accelerator
        </Typography>
        <IconButton
          onClick={onToggleOpen}
          sx={{
            color: 'var(--color-text-primary)',
            transform: open ? 'none' : 'rotate(180deg)',
            transition: 'transform 0.3s',
            mr: open ? 0 : '4px',
          }}
        >
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider sx={{ borderColor: 'var(--color-border)' }} />
      <List
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: open ? 'flex-start' : 'space-evenly',
          py: open ? 0 : 2,
        }}
      >
        {Object.entries(
          menuItems
            .filter((item) => item.show)
            .reduce((acc, item) => {
              const group = item.group || 'Other';
              if (!acc[group]) acc[group] = [];
              acc[group].push(item);
              return acc;
            }, {})
        ).map(([group, items]) => (
          <React.Fragment key={group}>
            {group !== 'Overview' && open && (
              <Typography
                variant="overline"
                sx={{
                  px: 3,
                  pt: 2,
                  pb: 0.5,
                  color: 'var(--color-text-muted)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  display: open ? 'block' : 'none',
                  lineHeight: 1
                }}
              >
                {group}
              </Typography>
            )}
            {items.map((item) => (
              <ListItem
                key={item.text}
                disablePadding
                sx={{
                  mb: open ? 0.5 : 0,
                  mx: 1,
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <ListItemButton
                  onClick={() => onNavigate(item.path)}
                  selected={activePath === item.path}
                  sx={{
                    color: '#fff',
                    height: open ? 'auto' : 44,
                    minHeight: 44,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: 'var(--color-bg-secondary)',
                      color: 'var(--color-brand-blue)',
                      '&:hover': {
                        bgcolor: 'var(--color-bg-secondary)',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'var(--color-bg-secondary)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: activePath === item.path ? '#fff' : 'rgba(255,255,255,0.8)',
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
                        color: 'inherit',
                        fontWeight: activePath === item.path ? 600 : 400,
                        fontSize: '0.9rem',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </React.Fragment>
        ))}
      </List>
      <Box sx={{ p: 2, bgcolor: 'var(--color-bg-sidebar)' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            p: 1,
            borderRadius: 0,
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            minHeight: 'auto',
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              flexShrink: 0,
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
              justifyContent: 'flex-start',
              ml: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                color: 'var(--color-text-primary)',
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
                color: 'var(--color-text-secondary)',
                fontWeight: 400,
                fontSize: 12,
                lineHeight: 1.2,
              }}
            >
              {currentUser?.role || 'user@example.com'}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: 'var(--color-text-muted)',
                fontWeight: 400,
                fontSize: 10,
                lineHeight: 1.2,
                mt: 0.5,
              }}
            >
              {currentUser?.lc || 'N/A'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
