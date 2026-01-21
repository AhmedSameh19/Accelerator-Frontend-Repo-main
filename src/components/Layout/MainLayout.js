import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Menu,
  MenuItem,
  useTheme,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCRMType } from '../../context/CRMTypeContext';
import NotificationsMenu from '../Notifications/NotificationsMenu';
import DrawerContent from './DrawerContent';
import {
  COLLAPSED_DRAWER_WIDTH,
  DRAWER_WIDTH,
  getActiveMenuTitle,
  getMenuItems,
} from './navigationConfig';

function MainLayout({ children }) {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const { crmType, toggleCRMType } = useCRMType();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = getMenuItems(crmType);
  const activeTitle = getActiveMenuTitle(menuItems, location.pathname);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }); // Clear EXPA tokens (cookies)
    } catch (err) {
      console.error('Failed to log out from EXPA:', err);
    }
    logout();
    handleProfileMenuClose();
    navigate('/login');
  };

  const drawer = (
    <DrawerContent
      open={open}
      theme={theme}
      menuItems={menuItems}
      activePath={location.pathname}
      currentUser={currentUser}
      onToggleOpen={handleDrawerToggle}
      onNavigate={navigate}
    />
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: 'transparent',
      background: 'linear-gradient(90deg, #1976d2 0%, #0CB9C1 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        background: 'linear-gradient(90deg, #1976d2 0%, #0CB9C1 100%)',
      }
    }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${open ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px)`,
          ml: `${open ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          background: 'linear-gradient(90deg, #0CB9C1 0%, #1976d2 100%)',
          color: '#fff',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          borderRadius: 0
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: '#fff' }}>
            {activeTitle}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={crmType === 'iCX'}
                onChange={toggleCRMType}
                color="default"
              />
            }
            label={crmType}
            sx={{ color: '#fff', mr: 2 }}
          />
          <NotificationsMenu />
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleProfileMenuOpen}
          >
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          '& .MuiDrawer-paper': {
            width: open ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            bgcolor: '#037ef3',
            borderRight: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            height: '100vh',
            overflow: 'hidden',
            borderRadius: 0
          },
        }}
        open={open}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${open ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px)`,
          marginLeft: `${open ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px`,
          marginTop: '64px',
          padding: '16px',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  );
}

export default MainLayout;
