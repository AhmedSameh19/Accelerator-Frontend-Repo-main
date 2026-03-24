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
      left: { xs: -45, sm: -112, md: -136 },
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
      left: { xs: 35, sm: 87, lg: 108 },
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
        width: { xs: 130, sm: 232, md: 270 },
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
                transform: {
                  xs: `scale(${person.imgScale})`,
                  sm: `scale(${person.imgScale})`,
                  md: `scale(${person.imgScale})`,
                },
              }
              : {}),
            ...(person.imgTranslateY
              ? {
                transform: {
                  xs: `translateY(${person.imgTranslateY.xs}px)`,
                  sm: `translateY(${person.imgTranslateY.sm}px)`,
                  md: `translateY(${person.imgTranslateY.md}px)`,
                },
                transformOrigin: 'bottom center',
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
        <Box sx={{ fontSize: { xs: '0.8rem', md: '0.88rem' }, fontWeight: 700, lineHeight: 1.2 }}>
          {`${person.name} - ${person.role}`}
        </Box>
        <Box sx={{ fontSize: { xs: '0.72rem', md: '0.78rem' }, opacity: 0.9 }}>
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
        bgcolor: '#1976d2',
        background: LOGIN_PAGE_MAIN_GRADIENT,
        position: 'relative',
        width: '100vw',
        maxWidth: '100vw',
        /* hidden clips drop-shadows / blurred halos → hard vertical/horizontal seams */
        overflowX: 'hidden',
        overflowY: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: LOGIN_PAGE_BG_RADIAL_OVERLAY,
          zIndex: 1,
          pointerEvents: 'none',
          transform: 'translateZ(0)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '40%',
          height: '40%',
          background: 'rgba(0, 193, 110, 0.1)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 1,
          pointerEvents: 'none',
          transform: 'translateZ(0)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          width: '100%',
          p: { xs: 2.5, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 2,
        }}
      >
        <Box
          component="img"
          src="/assets/images/accelerator_logo.png"
          alt="Accelerator Logo"
          sx={{
            height: { xs: '48px', sm: '60px' },
            width: 'auto',
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 600,
            fontSize: { xs: '0.9rem', sm: '1.25rem' },
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
            maxWidth: 828,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              gap: '5px',
            }}
          >
            <Box
              sx={{
                width: { xs: 'min(94vw, 520px)', sm: 'min(90vw, 772px)', md: 856 },
                height: { xs: 280, sm: 398, md: 430 },
                position: 'relative',
                mb: 0,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
                justifyContent: 'center',
                px: { xs: 0.5, sm: 1 },
                overflow: 'visible',
              }}
            >
              {/*
              Group halo only (no per-column blurred boxes — those read as rectangular lines).
              Sakr/Yassin: drop-shadow on masked imgs only; Wello: no glow.
            */}
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  left: { xs: '-18%', sm: '-16%', md: '-14%' },
                  right: { xs: '-18%', sm: '-16%', md: '-14%' },
                  top: { xs: '-20%', sm: '-18%', md: '-14%' },
                  bottom: { xs: '-8%', sm: '-6%', md: '-4%' },
                  zIndex: 0,
                  pointerEvents: 'none',
                  overflow: 'visible',
                  transform: 'translateZ(0)',
                  isolation: 'isolate',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '38%',
                    transform: 'translate3d(-50%, -50%, 0)',
                    width: '155%',
                    height: '140%',
                    borderRadius: '50%',
                    background:
                      'radial-gradient(ellipse 88% 80% at 50% 36%, rgba(255, 255, 255, 0.2) 0%, rgba(200, 230, 255, 0.16) 28%, rgba(120, 185, 255, 0.1) 48%, rgba(3, 126, 243, 0.04) 62%, transparent 78%)',
                    filter: 'blur(52px)',
                    opacity: 1,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '36%',
                    transform: 'translate3d(-50%, -50%, 0)',
                    width: '110%',
                    height: '95%',
                    borderRadius: '50%',
                    background:
                      'radial-gradient(ellipse 72% 68% at 50% 34%, rgba(255, 255, 255, 0.55) 0%, rgba(248, 252, 255, 0.35) 30%, rgba(232, 246, 255, 0.18) 52%, rgba(160, 210, 255, 0.08) 68%, transparent 82%)',
                    filter: 'blur(36px)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '34%',
                    transform: 'translate3d(-50%, -50%, 0)',
                    width: '72%',
                    height: '58%',
                    borderRadius: '50%',
                    background:
                      'radial-gradient(ellipse 58% 50% at 50% 40%, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.35) 42%, rgba(220, 238, 255, 0.12) 62%, transparent 80%)',
                    filter: 'blur(24px)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '30%',
                    transform: 'translate3d(-50%, -50%, 0)',
                    width: '44%',
                    height: '34%',
                    borderRadius: '50%',
                    background:
                      'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.15) 48%, transparent 72%)',
                    filter: 'blur(18px)',
                    opacity: 0.9,
                  }}
                />
              </Box>

              {HERO_PEOPLE.map((person) => (
                <PortraitLink key={person.key} person={person} />
              ))}
            </Box>
            <Typography
              variant="h2"
              sx={{
                color: 'white',
                fontWeight: 800,
                fontFamily: 'Montserrat, sans-serif',
                fontSize: { xs: '2rem', md: '3.5rem' },
                textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                mb: 0,
                mt: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Welcome to the Accelerator
            </Typography>
          </Box>

          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 400,
              maxWidth: 500,
              fontSize: { xs: '1rem', md: '1.25rem' },
              mb: { xs: 2.5, md: 4 },
            }}
          >
            Manage your EPs, track performance, and drive impact in AIESEC in Egypt
          </Typography>

          {!isLoggedIn && (
            <Button
              onClick={loginWithExpa}
              variant="contained"
              size="large"
              sx={{
                py: 2,
                px: { xs: 5, md: 8 },
                fontSize: { xs: '1rem', md: '1.1rem' },
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
                textTransform: 'none',
                background: '#fff',
                color: '#037EF3',
                borderRadius: '50px',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  background: '#f8f9fa',
                  transform: 'scale(1.02)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                },
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
            >
              Log in with EXPA
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
          p: { xs: 2.5, sm: 3 },
          textAlign: 'center',
          zIndex: 2,
          mt: 'auto',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: { xs: '0.7rem', sm: '0.875rem' },
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
          2025 © Courtesy of AIESEC in Egypt. Developed by{' '}
          <a
            href="https://www.linkedin.com/in/mohamed-wael-407945228/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mohamed Wael
          </a>
          , with contributions from{' '}
          <a
            href="https://www.linkedin.com/in/ahmed-sameh-7872091b5"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ahmed Sakr
          </a>
          {' '}and{' '}
          <a
            href="https://www.linkedin.com/in/yassin-amr-330930196/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Yassin Hawash
          </a>
          .
        </Typography>

      </Box>
    </Box>
  );
};

export default LoginPage;