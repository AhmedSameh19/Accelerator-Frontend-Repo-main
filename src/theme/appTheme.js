import { createTheme } from '@mui/material/styles';

export const appTheme = (mode) => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#3D9EFF' : '#037EF3',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#1DD67A' : '#00C16E',
        contrastText: '#ffffff',
      },
      warning: {
        main: isDark ? '#FFD166' : '#FFC845',
        contrastText: '#1E293B',
      },
      error: {
        main: isDark ? '#FF6B52' : '#F85A40',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#1A1D27' : '#F4F6F9',
        paper: isDark ? '#1E2130' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#E8EAF0' : '#1A1D23',
        secondary: isDark ? '#9AA0B8' : '#5A6071',
      },
      divider: isDark ? '#2A2D3E' : '#E2E6ED',
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
            backgroundColor: isDark ? '#1A1D27' : '#F4F6F9',
            color: isDark ? '#9AA0B8' : '#5A6071',
          }
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            boxShadow: '4px 0 24px var(--color-shadow)',
            backgroundColor: isDark ? '#161924' : '#F0F2F5',
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
              backgroundColor: isDark ? '#1A1D27' : '#F4F6F9',
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
            backgroundColor: isDark ? '#1A1D27' : '#F4F6F9',
            '&::after': {
              background: `linear-gradient(90deg, transparent, ${isDark ? '#1E2130' : '#FFFFFF'}, transparent)`,
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
            backgroundColor: isDark ? 'rgba(29, 214, 122, 0.15)' : '#edf7ed',
            color: isDark ? '#1DD67A' : '#1e4620',
          },
          standardError: {
            backgroundColor: isDark ? 'rgba(255, 107, 82, 0.15)' : '#fdeded',
            color: isDark ? '#FF6B52' : '#5f2120',
          },
          standardWarning: {
            backgroundColor: isDark ? 'rgba(255, 209, 102, 0.15)' : '#fff4e5',
            color: isDark ? '#FFD166' : '#663c00',
          },
          standardInfo: {
            backgroundColor: isDark ? 'rgba(61, 158, 255, 0.15)' : '#e5f6fd',
            color: isDark ? '#3D9EFF' : '#014361',
          },
        },
      },
    },
  });
};
