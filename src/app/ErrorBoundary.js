import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL UI ERROR:', error, errorInfo);
  }

  handleReset = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              textAlign: 'center',
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 5,
                borderRadius: 4,
                bgcolor: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                border: '1px solid #eee',
              }}
            >
              <Box
                sx={{
                  bgcolor: '#FFF0F0',
                  p: 2,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ErrorOutlineIcon sx={{ fontSize: 60, color: '#F85A40' }} />
              </Box>

              <Box>
                <Typography variant="h4" fontWeight="800" gutterBottom color="#F85A40">
                  Oops! Something went wrong
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                  We encountered an unexpected crash. Don't worry, your data is safe. 
                  Please try refreshing the page or returning home.
                </Typography>
              </Box>

              {process.env.NODE_ENV === 'development' && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: '#f8f9fa',
                    borderRadius: 2,
                    textAlign: 'left',
                    width: '100%',
                    overflow: 'auto',
                    maxHeight: 200,
                  }}
                >
                  <Typography variant="caption" component="pre" sx={{ color: '#d32f2f', fontFamily: 'monospace' }}>
                    {this.state.error?.toString()}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={this.handleGoHome}
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  Go Home
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReset}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    bgcolor: '#037EF3',
                    '&:hover': { bgcolor: '#0262BE' },
                  }}
                >
                  Reload Page
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
