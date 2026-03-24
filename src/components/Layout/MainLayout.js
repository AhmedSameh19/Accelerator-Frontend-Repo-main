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
  useMediaQuery,
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
import { API_BASE } from '../../utils/apiBase';
import { logout as logoutExpa } from '../../api/services/authService.ts';
import NotificationsMenu from '../Notifications/NotificationsMenu';
import { useTheme as useAppTheme } from '../../context/ThemeContext';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import DrawerContent from './DrawerContent';
import {
  COLLAPSED_DRAWER_WIDTH,
  DRAWER_WIDTH,
  getActiveMenuTitle,
  getMenuItems,
} from './navigationConfig';

function MainLayout({ children }) {
  const muiTheme = useTheme();
  const { theme: themeMode, toggleTheme } = useAppTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const { crmType, toggleCRMType } = useCRMType();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = getMenuItems(crmType);
  const activeTitle = getActiveMenuTitle(menuItems, location.pathname);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logoutExpa(); 
    } catch (err) {
      console.error('Failed to log out from EXPA:', err);
    }
    logout(); // Clear auth context
    handleProfileMenuClose();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <DrawerContent
      open={isMobile ? true : open}
      theme={muiTheme}
      menuItems={menuItems}
      activePath={location.pathname}
      currentUser={currentUser}
      onToggleOpen={handleDrawerToggle}
      onNavigate={handleNavigate}
    />
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: muiTheme.palette.background.default,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        background: muiTheme.palette.background.default,
      }
    }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${open ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px)`, xs: '100%' },
          ml: { md: `${open ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px`, xs: 0 },
          transition: muiTheme.transitions.create(['width', 'margin'], {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.leavingScreen,
          }),
          background: muiTheme.palette.background.paper,
          color: muiTheme.palette.text.primary,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: muiTheme.palette.text.primary }}>
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
            sx={{ color: muiTheme.palette.text.primary, mr: 2 }}
          />
          <NotificationsMenu />
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{ mx: 1 }}
            title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
          >
            {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
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
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : open}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: isMobile ? DRAWER_WIDTH : (open ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH),
            boxSizing: 'border-box',
            transition: muiTheme.transitions.create('width', {
              easing: muiTheme.transitions.easing.sharp,
              duration: muiTheme.transitions.duration.enteringScreen,
            }),
            bgcolor: muiTheme.palette.primary.main,
            borderRight: 'none',
            borderColor: 'transparent',
            height: '100vh',
            overflow: 'hidden',
            borderRadius: 0
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${open ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px)`, xs: '100%' },
          marginLeft: { md: `${open ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px`, xs: 0 },
          marginTop: '64px',
          padding: '16px',
          transition: muiTheme.transitions.create(['width', 'margin'], {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.leavingScreen,
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
        <MenuItem onClick={toggleTheme}>
          Switch to {themeMode === 'light' ? 'Dark' : 'Light'} Mode
        </MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  );
}

export default MainLayout;
