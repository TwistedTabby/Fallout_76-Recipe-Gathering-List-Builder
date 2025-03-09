import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A reusable confirmation dialog component
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <div className="confirm-dialog-message">{message}</div>
        <div className="confirm-dialog-buttons">
          <button 
            className="confirm-dialog-button confirm-dialog-button-cancel" 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="confirm-dialog-button confirm-dialog-button-confirm" 
            onClick={onConfirm}
          >
            Confirm
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
    message: '',
  });

  /**
   * Show a confirmation dialog and return a promise that resolves to the user's choice
   * @param message The message to display in the dialog
   * @returns A promise that resolves to true if confirmed, false if canceled
   */
  const confirm = React.useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        message,
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
    message: dialogState.message,
    onConfirm: dialogState.onConfirm || closeDialog,
    onCancel: dialogState.onCancel || closeDialog
  };

  return {
    confirm,
    dialogProps
  };
} 