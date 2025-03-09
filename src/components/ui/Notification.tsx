import React from 'react';
import { NotificationState } from '../../hooks/useNotification';

interface NotificationProps {
  notification: NotificationState;
  onClose?: () => void;
}

/**
 * A reusable notification component for displaying messages
 */
const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  const { message, type, visible } = notification;

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