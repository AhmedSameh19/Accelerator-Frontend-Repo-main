/**
 * Hook for snackbar/notification management
 */

import { useState, useCallback } from 'react';

/**
 * Default snackbar state
 */
const DEFAULT_SNACKBAR = {
  open: false,
  message: '',
  severity: 'success',
};

/**
 * Custom hook for snackbar management
 * 
 * @param {Object} initialState - Initial snackbar state
 * @returns {Object} - Snackbar state and actions
 */
export function useSnackbar(initialState = DEFAULT_SNACKBAR) {
  const [snackbar, setSnackbar] = useState(initialState);

  /**
   * Show a success message
   */
  const showSuccess = useCallback((message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success',
    });
  }, []);

  /**
   * Show an error message
   */
  const showError = useCallback((message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error',
    });
  }, []);

  /**
   * Show a warning message
   */
  const showWarning = useCallback((message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'warning',
    });
  }, []);

  /**
   * Show an info message
   */
  const showInfo = useCallback((message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'info',
    });
  }, []);

  /**
   * Close the snackbar
   */
  const closeSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  /**
   * Show a custom snackbar
   */
  const show = useCallback((message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  return {
    snackbar,
    setSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeSnackbar,
    show,
  };
}

export default useSnackbar;
