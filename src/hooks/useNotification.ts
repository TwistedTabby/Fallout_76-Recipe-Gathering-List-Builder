import { useState, useCallback, useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationState {
  message: string;
  type: NotificationType;
  visible: boolean;
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
   * @param message The message to display
   * @param type The type of notification (success, error, or info)
   * @param duration How long to display the notification in milliseconds (default: 3000)
   */
  const showNotification = useCallback((
    message: string, 
    type: NotificationType = 'info',
    duration: number = 3000
  ) => {
    setNotification({
      message,
      type,
      visible: true
    });
    
    // Hide notification after the specified duration
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, duration);
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