import React, { useEffect, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, Stack } from '@mui/material';
import { isAuthenticated } from '../utils/authStatus';

/** Main backdrop from `LoginPageeee gradient.js` (linear + full-screen radial overlay). */
const LOGIN_PAGE_MAIN_GRADIENT = 'linear-gradient(90deg, #1976d2 0%, #0CB9C1 100%)';
const LOGIN_PAGE_BG_RADIAL_OVERLAY =
  'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)';

/** Scale Wello.webp so its on-screen height matches sakr.webp in the same column (width-bound `object-fit: contain`). */
const WELLO_MATCH_SAKR_SCALE = (999 / 862) * (1365 / 1364);

/** Rim glow on portrait wrapper; extra offset shadows on outer edges (Sakr left, Yassin right). */
function portraitRimFilter(personKey) {
  const base =
    'drop-shadow(0 0 10px rgba(255, 255, 255, 0.65)) drop-shadow(0 0 22px rgba(200, 235, 255, 0.5)) drop-shadow(0 0 40px rgba(120, 200, 255, 0.35))';
  const outwardSakr =
    'drop-shadow(-14px 0 18px rgba(255, 255, 255, 0.55)) drop-shadow(-26px 0 32px rgba(200, 235, 255, 0.48)) drop-shadow(-40px 0 56px rgba(120, 200, 255, 0.32))';
  const outwardYassin =
    'drop-shadow(14px 0 18px rgba(255, 255, 255, 0.55)) drop-shadow(26px 0 32px rgba(200, 235, 255, 0.48)) drop-shadow(40px 0 56px rgba(120, 200, 255, 0.32))';
  if (personKey === 'sakr') return `${base} ${outwardSakr}`;
  if (personKey === 'yassin') return `${base} ${outwardYassin}`;
  return base;
}

const HERO_PEOPLE = [
  {
    key: 'sakr',
    name: 'Ahmed Sakr',
    role: 'MC Staff',
    image: '/assets/images/sakr.webp',
    linkedin:
      'https://www.linkedin.com/in/ahmed-sameh-7872091b5',
    zIndex: 2,
    overlapSx: {
      mr: { xs: -10, sm: -12, md: -14 },
      position: 'relative',
      left: { xs: -68, sm: -112, md: -136 },
    },
  },
  {
    key: 'wello',
    name: 'Mohamed Wael',
    role: 'MCVP IM',
    image: '/assets/images/wello.webp',
    linkedin: 'https://www.linkedin.com/in/mohamed-wael-407945228/',
    zIndex: 3,
    overlapSx: { mx: { xs: -8, sm: -10, md: -14 } },
    imgScale: WELLO_MATCH_SAKR_SCALE,
  },
  {
    key: 'yassin',
    name: 'Yassin Hawash',
    role: 'MC Staff',
    image: '/assets/images/yassin.webp',
    linkedin: 'https://www.linkedin.com/in/yassin-amr-330930196/',
    zIndex: 2,
    overlapSx: {
      ml: { xs: -8, sm: -10, md: -14 },
      position: 'relative',
      left: { xs: 52, sm: 87, lg: 108 },
    },
  },
];

/** Memoized so auth `loading` / other parent state does not re-render heavy filter stacks. */
const PortraitLink = memo(function PortraitLink({ person }) {
  return (
    <Box
      component="a"
      href={person.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${person.name} LinkedIn`}
      sx={{
        position: 'relative',
        zIndex: person.zIndex,
        ...person.overlapSx,
        flex: '0 0 auto',
        width: 270,
        height: '100%',
        alignSelf: 'stretch',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        outline: 'none',
        overflow: 'visible',
        isolation: 'isolate',
        '&:hover .person-hover-details': {
          opacity: 1,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          maxHeight: '100%',
          maxWidth: '100%',
          width: 'auto',
          height: 'auto',
          display: 'inline-flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          overflow: 'visible',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          ...(person.key !== 'wello'
            ? {
              filter: portraitRimFilter(person.key),
            }
            : {}),
        }}
      >
        <Box
          component="img"
          src={person.image}
          alt={person.name}
          width="270"
          height="430"
          loading="lazy"
          fetchpriority="low"
          sx={{
            display: 'block',
            maxHeight: '100%',
            maxWidth: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            WebkitMaskImage:
              'linear-gradient(to bottom, #000 0%, #000 95%, rgba(0,0,0,0.94) 97%, rgba(0,0,0,0.64) 99%, transparent 100%)',
            maskImage:
              'linear-gradient(to bottom, #000 0%, #000 95%, rgba(0,0,0,0.94) 97%, rgba(0,0,0,0.64) 99%, transparent 100%)',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            position: 'relative',
            zIndex: 2,
            ...(person.imgScale != null
              ? {
                transformOrigin: 'bottom center',
                transform: 'scale(' + person.imgScale + ')',
              }
              : {}),
          }}
        />
      </Box>
      <Box
        className="person-hover-details"
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 6,
          px: 1.5,
          py: 1.25,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.52) 60%, rgba(0,0,0,0) 100%)',
          color: 'white',
          textAlign:
            person.key === 'yassin' ? 'right' : person.key === 'wello' ? 'center' : 'left',
          opacity: 0,
          transition: 'opacity 0.12s ease-out',
          pointerEvents: 'none',
          transform: 'translateZ(0)',
          willChange: 'opacity',
        }}
      >
        <Box sx={{ fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.2 }}>
          {`${person.name} - ${person.role}`}
        </Box>
        <Box sx={{ fontSize: '0.78rem', opacity: 0.9 }}>
          Click to go to LinkedIn
        </Box>
      </Box>
    </Box>
  );
});

const LoginPage = () => {
  const navigate = useNavigate();
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
    const authUrl = "https://auth.aiesec.org/oauth/authorize?client_id=0Bwg6JeTDUb6h0O9SHNkOwepr3W34gcwVjj_VsLr9vs&redirect_uri=https://accelerator.aiesec.org.eg/auth/callback&response_type=code";

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
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F4F6F9',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#ffffff',
            borderRadius: 4,
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            p: { xs: 4, sm: 8 },
            position: 'relative',
            zIndex: 10,
          }}
        >
          <Box
            component="img"
            src="/assets/images/accelerator_logo.png"
            alt="Accelerator Logo"
            width="180"
            height="60"
            fetchpriority="high"
            loading="eager"
            sx={{
              height: '60px',
              width: 'auto',
              mb: 4,
            }}
          />

          <Typography
            variant="h4"
            sx={{
              color: '#1A1D23',
              fontWeight: 800,
              fontFamily: 'Montserrat, sans-serif',
              mb: 1,
              textAlign: 'center',
            }}
          >
            Welcome Back
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#64748B',
              mb: 4,
              textAlign: 'center',
              maxWidth: 320,
            }}
          >
            Manage your EPs, track performance, and drive impact in AIESEC in Egypt
          </Typography>

          {!isLoggedIn ? (
            <Button
              onClick={loginWithExpa}
              variant="contained"
              size="large"
              sx={{
                width: '100%',
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                textTransform: 'none',
                background: '#037EF3',
                color: '#fff',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: '#0266C8',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(3, 126, 243, 0.3)',
                },
              }}
            >
              Log in with EXPA
            </Button>
          ) : (
            <Typography sx={{ color: '#037EF3', fontWeight: 600 }}>
              You are already logged in. Redirecting...
            </Typography>
          )}

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #E2E8F0', width: '100%', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              2025 © AIESEC in Egypt
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* Hero People - Desktop Only */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 856,
          height: 380,
          justifyContent: 'center',
          alignItems: 'flex-end',
          zIndex: 1,
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      >
        {HERO_PEOPLE.map((person) => (
          <PortraitLink key={person.key} person={person} />
        ))}
      </Box>
    </Box>
  );
};

export default LoginPage;