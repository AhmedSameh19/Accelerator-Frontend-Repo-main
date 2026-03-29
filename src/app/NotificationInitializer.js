import React from 'react';
import useUpcomingNotifications from '../hooks/useUpcomingNotifications';

/**
 * Runs once when the app boots (inside AuthProvider so user cookies are available).
 * Fetches upcoming/overdue follow-ups and scheduled company visits for the
 * current user and injects them into NotificationsContext.
 */
export default function NotificationInitializer() {
  useUpcomingNotifications();
  return null;
}
