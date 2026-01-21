import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, useTheme, Container, Stack } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { isAuthenticated } from '../utils/authStatus';
import Cookies from 'js-cookie';

const REDIRECT_URI = 'https://accelerator.aiesec.org.eg/auth/callback';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const theme = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to check auth and update state
  const checkAuthAndUpdate = async () => {
    console.log('🔍 [LoginPage] Starting auth check...');
    setLoading(true);
    
    try {
      console.log('🔍 [LoginPage] Calling isAuthenticated()...');
    const authenticated = await isAuthenticated();
      console.log('🔍 [LoginPage] isAuthenticated() result:', authenticated);
      
    setIsLoggedIn(authenticated);
    setLoading(false);
      
    if (authenticated) {
        console.log('🔍 [LoginPage] User is authenticated, navigating to /leads');
      navigate('/leads', { replace: true });
      } else {
        console.log('🔍 [LoginPage] User is not authenticated, staying on login page');
      }
    } catch (error) {
      console.error('❌ [LoginPage] Error in checkAuthAndUpdate:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 [LoginPage] useEffect triggered, checking URL params...');
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    console.log('🔍 [LoginPage] URL params - error:', error);
    
    if (error) {
      console.error('❌ [LoginPage] Auth error in URL:', error);
      const errorDescription = urlParams.get('error_description');
      console.error('❌ [LoginPage] Error description:', errorDescription);
    }
    
    console.log('🔍 [LoginPage] Checking current auth status...');
    checkAuthAndUpdate();
  }, [navigate]);

  const loginWithExpa = () => {
    console.log("🔍 [LoginPage] loginWithExpa() called");
    console.log("🔍 [LoginPage] Current URL:", window.location.href);
    console.log("🔍 [LoginPage] Current origin:", window.location.origin);

    // Use the static EXPA auth URL as it was working before
    const authUrl = "https://auth.aiesec.org/oauth/authorize?client_id=0Bwg6JeTDUb6h0O9SHNkOwepr3W34gcwVjj_VsLr9vs&redirect_uri=http://localhost:3000/auth/callback&response_type=code";

    console.log("🔍 [LoginPage] Auth URL:", authUrl);
    console.log("🔍 [LoginPage] Redirecting to auth URL...");

    // Redirect to the auth URL in the same tab
    window.location.href = authUrl;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(90deg, #1976d2 0%, #0CB9C1 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 1,
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 2,
        }}
      >
        <Box
          component="img"
          src="/assets/images/Accelerator logo.png"
          alt="Accelerator Logo"
          sx={{
            height: '60px',
            width: 'auto',
            // filter: 'brightness(0) invert(1)', // Removed to show original colors
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 600,
          }}
        >
          AIESEC in Egypt
        </Typography>
      </Box>

      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
          py: 4,
        }}
      >
        <Stack
          spacing={4}
          alignItems="center"
          sx={{
            maxWidth: 600,
            textAlign: 'center',
          }}
        >
          <Box
            component="img"
            src="/assets/images/Accelerator logo.png"
            alt="Accelerator Logo"
            sx={{
              height: '180px',
              width: 'auto',
              mb: 2,
              // filter: 'brightness(0) invert(1)', // Removed to show original colors
            }}
          />
          <Typography 
            variant="h2"
            sx={{ 
              color: 'white',
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              mb: 2,
            }}
          >
            Welcome to The Accelerator
          </Typography>

          <Typography 
            variant="h5"
            sx={{ 
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 400,
              maxWidth: 500,
              mb: 4,
            }}
          >
            Manage your EPs, track performance, and drive impact in AIESEC in Egypt
          </Typography>

          {!loading && !isLoggedIn && (
            <Button
              onClick={loginWithExpa}
              variant="contained"
              size="large"
              sx={{ 
                py: 2.5,
                px: 8,
                fontSize: '1.2rem',
                fontWeight: 600,
                letterSpacing: '0.5px',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                color: 'primary.main',
                borderRadius: '12px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                },
                '&:active': {
                  transform: 'translateY(1px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                },
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover::before': {
                  opacity: 1,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
                  transform: 'translateX(-100%)',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                '&:hover::after': {
                  transform: 'translateX(100%)',
                },
                '& .MuiButton-label': {
                  position: 'relative',
                  zIndex: 1,
                },
              }}
            >
              Continue with EXPA
            </Button>
          )}
          {isLoggedIn && (
            <Typography sx={{ color: 'white', fontWeight: 600 }}>
              You are already logged in.
            </Typography>
          )}
        </Stack>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 3,
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        <Typography
  variant="body2"
  sx={{
    color: 'rgba(255,255,255,0.8)',
    '& a': {
      color: 'rgba(255,255,255,0.9)',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: 'white',
        textDecoration: 'underline',
      },
    },
  }}
>
  Made with ❤️ by{' '}
  <a 
    href="https://www.linkedin.com/in/mohamed-wael-407945228/" 
    target="_blank" 
    rel="noopener noreferrer"
  >
    Mohamed Wael
  </a>{' '}
  &{' '}
  <a
    href="https://www.linkedin.com/in/ahmed-sameh-7872091b5"
    target="_blank"
    rel="noopener noreferrer"
  >
    Ahmed Sakr
  </a>{' '}
  for AIESEC in Egypt
</Typography>

      </Box>
    </Box>
  );
};

export default LoginPage;