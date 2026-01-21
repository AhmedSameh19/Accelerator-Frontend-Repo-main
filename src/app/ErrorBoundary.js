import React from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';

function getErrorMessage(error) {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message || 'Unknown error';
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Unhandled UI error:', error, info);
    }
  }

  handleReset = () => {
    this.setState({ error: null });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const message = getErrorMessage(error);

    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" variant="filled" sx={{ mb: 2 }}>
          Something went wrong.
        </Alert>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {message}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={this.handleReset}>
            Try again
          </Button>
          <Button variant="outlined" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </Box>
      </Box>
    );
  }
}
