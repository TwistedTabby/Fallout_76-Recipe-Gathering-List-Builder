import React from 'react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  showCancel?: boolean;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A reusable confirmation dialog component
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, options, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const {
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmButtonClass = ''
  } = options;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        {title && <div className="confirm-dialog-title">{title}</div>}
        <div className="confirm-dialog-message">{message}</div>
        <div className="confirm-dialog-buttons">
          <button 
            className="confirm-dialog-button confirm-dialog-button-cancel" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-dialog-button confirm-dialog-button-confirm ${confirmButtonClass}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

/**
 * Custom hook for using the confirm dialog
 */
export function useConfirmDialog() {
  const [dialogState, setDialogState] = React.useState<Omit<ConfirmDialogProps, 'onConfirm' | 'onCancel'> & {
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    options: { message: '' }
  });

  /**
   * Show a confirmation dialog and return a promise that resolves to the user's choice
   * @param options The options for the dialog (message is required)
   * @returns A promise that resolves to true if confirmed, false if canceled
   */
  const confirm = React.useCallback((options: string | ConfirmOptions): Promise<boolean> => {
    // Handle both string message and options object
    const dialogOptions: ConfirmOptions = typeof options === 'string' 
      ? { message: options } 
      : options;
    
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        options: dialogOptions,
        onConfirm: () => {
          setDialogState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialogState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  /**
   * Close the dialog without resolving the promise
   */
  const closeDialog = React.useCallback(() => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const dialogProps: ConfirmDialogProps = {
    isOpen: dialogState.isOpen,
    options: dialogState.options,
    onConfirm: dialogState.onConfirm || closeDialog,
    onCancel: dialogState.onCancel || closeDialog
  };

  return {
    confirm,
    dialogProps
  };
} 