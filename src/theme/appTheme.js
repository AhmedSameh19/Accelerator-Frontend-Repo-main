import { createTheme } from '@mui/material';

export const appTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: 'var(--color-brand-blue)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: 'var(--color-brand-green)',
      contrastText: '#ffffff',
    },
    warning: {
      main: 'var(--color-brand-yellow)',
      contrastText: '#1E293B',
    },
    error: {
      main: 'var(--color-brand-orange)',
      contrastText: '#ffffff',
    },
    background: {
      default: 'var(--color-bg-secondary)',
      paper: 'var(--color-bg-card)',
    },
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
    },
    divider: 'var(--color-border)',
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.015em' },
    h3: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600, fontSize: '1.75rem', letterSpacing: '-0.01em' },
    h4: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.01em' },
    h5: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600, fontSize: '1rem' },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    button: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
          transition: 'background-color 200ms ease, color 200ms ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 20px',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 2px 4px var(--color-shadow)',
        },
      },
      defaultProps: {
        disableElevation: true,
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px -2px var(--color-shadow)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-card)',
          backgroundImage: 'none',
          transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 25px -4px var(--color-shadow)',
            transform: 'translateY(-2px)',
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        },
        elevation1: {
          boxShadow: '0 2px 8px -2px var(--color-shadow)',
        },
        elevation2: {
          boxShadow: '0 4px 12px -2px var(--color-shadow)',
        }
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px',
          borderBottom: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'var(--color-bg-secondary)',
          color: 'var(--color-text-secondary)',
        }
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '4px 0 24px var(--color-shadow)',
          backgroundColor: 'var(--color-bg-sidebar)',
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px var(--color-shadow)',
          backgroundColor: 'var(--color-bg-card)',
          color: 'var(--color-text-primary)',
          backgroundImage: 'none',
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          '&.MuiChip-colorDefault': {
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
          },
        },
        label: {
          paddingLeft: '12px',
          paddingRight: '12px',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 700,
          borderRadius: 6,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--color-bg-secondary)',
          '&::after': {
            background: 'linear-gradient(90deg, transparent, var(--color-bg-card), transparent)',
          },
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--color-bg-card)',
          color: 'var(--color-text-primary)',
          boxShadow: '0 4px 12px var(--color-shadow)',
          borderRadius: 8,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        standardSuccess: {
          backgroundColor: mode === 'dark' ? 'rgba(29, 214, 122, 0.15)' : '#edf7ed',
          color: mode === 'dark' ? '#1DD67A' : '#1e4620',
        },
        standardError: {
          backgroundColor: mode === 'dark' ? 'rgba(255, 107, 82, 0.15)' : '#fdeded',
          color: mode === 'dark' ? '#FF6B52' : '#5f2120',
        },
        standardWarning: {
          backgroundColor: mode === 'dark' ? 'rgba(255, 209, 102, 0.15)' : '#fff4e5',
          color: mode === 'dark' ? '#FFD166' : '#663c00',
        },
        standardInfo: {
          backgroundColor: mode === 'dark' ? 'rgba(61, 158, 255, 0.15)' : '#e5f6fd',
          color: mode === 'dark' ? '#3D9EFF' : '#014361',
        },
      },
    },
  },
});
