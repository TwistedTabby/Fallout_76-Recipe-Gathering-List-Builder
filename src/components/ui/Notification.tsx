import React from 'react';
import { NotificationState } from '../../hooks/useNotification';

interface NotificationProps {
  notification?: NotificationState;
  message?: string;
  type?: string;
  visible?: boolean;
  onClose?: () => void;
}

/**
 * A reusable notification component for displaying messages
 */
const Notification: React.FC<NotificationProps> = ({ notification, message: propMessage, type: propType, visible: propVisible, onClose }) => {
  // Handle both usage patterns - either passing a notification object or individual props
  const message = notification?.message || propMessage || '';
  const type = notification?.type || propType || 'info';
  const visible = notification?.visible ?? propVisible ?? false;

  if (!visible) return null;

  return (
    <div className={`notification notification-${type} ${visible ? 'visible' : ''}`}>
      <div className="notification-content">
        {message}
      </div>
      {onClose && (
        <button className="notification-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

export default Notification; 