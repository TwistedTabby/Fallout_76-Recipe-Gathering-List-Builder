import { useState, useCallback, useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationState {
  message: string;
  type: NotificationType;
  visible: boolean;
}

export interface NotificationOptions {
  message: string;
  type?: NotificationType;
  duration?: number;
}

/**
 * Custom hook for managing notifications
 */
export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    visible: false
  });

  /**
   * Show a notification message
   * @param messageOrOptions The message to display or an options object
   * @param type The type of notification (success, error, or info)
   * @param duration How long to display the notification in milliseconds (default: 3000)
   */
  const showNotification = useCallback((
    messageOrOptions: string | NotificationOptions, 
    type: NotificationType = 'info',
    duration: number = 3000
  ) => {
    // Handle both string message and options object
    let message: string;
    let notificationType: NotificationType = type;
    let notificationDuration: number = duration;

    if (typeof messageOrOptions === 'string') {
      message = messageOrOptions;
    } else {
      message = messageOrOptions.message;
      notificationType = messageOrOptions.type || type;
      notificationDuration = messageOrOptions.duration || duration;
    }

    setNotification({
      message,
      type: notificationType,
      visible: true
    });
    
    // Hide notification after the specified duration
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, notificationDuration);
  }, []);

  /**
   * Hide the current notification
   */
  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification
  };
} 