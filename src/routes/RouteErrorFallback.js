import React from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Alert, Box, Button, Typography } from '@mui/material';

function getRouteErrorMessage(error) {
  if (!error) return 'Unknown error';
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`;
  }
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message || 'Unknown error';
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}

export default function RouteErrorFallback() {
  const error = useRouteError();
  const message = getRouteErrorMessage(error);

  return (
    <Box sx={{ p: 2 }}>
      <Alert severity="error" variant="filled" sx={{ mb: 2 }}>
        Page error
      </Alert>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {message}
      </Typography>
      <Button variant="contained" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </Box>
  );
}
