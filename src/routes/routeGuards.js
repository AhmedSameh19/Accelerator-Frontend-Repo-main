import React from 'react';
import { Navigate } from 'react-router-dom';
import { isCrmAuthenticated } from '../utils/crmToken';

export function ProtectedRoute({ children }) {
  if (!isCrmAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function PublicRoute({ children }) {
  if (isCrmAuthenticated()) {
    return <Navigate to="/post-login" replace />;
  }
  return children;
}
