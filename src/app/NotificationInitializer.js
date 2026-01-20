import React, { useEffect } from 'react';
import { useNotifications } from '../context/NotificationsContext';

export default function NotificationInitializer() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    addNotification({
      title: 'Welcome Message',
      message: 'Wello and Otify love you ❤️',
      type: 'success',
    });
  }, [addNotification]);

  return null;
}
