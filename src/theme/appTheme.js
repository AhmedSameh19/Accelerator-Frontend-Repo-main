import { createTheme } from '@mui/material';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#037EF3', // AIESEC Blue
      light: '#42a5f5',
      dark: '#025bb5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00C16E', // AIESEC Green
      light: '#33cd8b',
      dark: '#009a58',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#FFC845', // AIESEC Yellow
      contrastText: '#1E293B',
    },
    error: {
      main: '#F85A40', // AIESEC Orange
      contrastText: '#ffffff',
    },
    background: {
      default: '#F4F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.015em' },
    h3: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600, fontSize: '1.75rem', letterSpacing: '-0.01em' },
    h4: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.01em' },
    h5: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600, fontSize: '1rem' },
    subtitle1: { fontWeight: 500, color: '#475569' },
    subtitle2: { fontWeight: 500, color: '#64748B' },
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
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
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
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E2E8F0',
          transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.08)',
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
        },
        elevation1: {
          boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        }
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px',
          borderBottom: '1px solid #E2E8F0',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#F8FAFC',
          color: '#475569',
        }
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }
      }
    }
  },
});
