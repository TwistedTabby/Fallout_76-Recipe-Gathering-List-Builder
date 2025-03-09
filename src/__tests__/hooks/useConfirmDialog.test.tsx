import { renderHook, act } from '@testing-library/react';
import { useConfirmDialog, ConfirmOptions } from '../../components/ui/ConfirmDialog';

describe('useConfirmDialog', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should initialize with default values', () => {
    const { result } = renderHook(() => useConfirmDialog());
    
    expect(result.current.dialogProps).toEqual({
      isOpen: false,
      options: { message: '' },
      onConfirm: expect.any(Function),
      onCancel: expect.any(Function)
    });
  });

  test('should show dialog and resolve promise', async () => {
    const { result } = renderHook(() => useConfirmDialog());
    
    // Show dialog and store promise
    const confirmPromise = result.current.confirm('Test message');
    
    // Check that dialog is open
    expect(result.current.dialogProps.isOpen).toBe(true);
    expect(result.current.dialogProps.options.message).toBe('Test message');
    
    // Confirm dialog
    act(() => {
      result.current.dialogProps.onConfirm();
    });
    
    // Check that dialog is closed
    expect(result.current.dialogProps.isOpen).toBe(false);
    
    // Check that promise resolves to true
    await expect(confirmPromise).resolves.toBe(true);
  });

  test('should show dialog with options object', async () => {
    const { result } = renderHook(() => useConfirmDialog());
    
    const options: ConfirmOptions = {
      title: 'Test Title',
      message: 'Test message with options',
      confirmText: 'Yes',
      cancelText: 'No',
      confirmButtonClass: 'test-class'
    };
    
    // Show dialog with options and store promise
    const confirmPromise = result.current.confirm(options);
    
    // Check that dialog is open with correct options
    expect(result.current.dialogProps.isOpen).toBe(true);
    expect(result.current.dialogProps.options).toEqual(options);
    
    // Simulate canceling
    act(() => {
      result.current.dialogProps.onCancel();
    });
    
    // Check that dialog is closed
    expect(result.current.dialogProps.isOpen).toBe(false);
    
    // Check that promise resolves to false
    await expect(confirmPromise).resolves.toBe(false);
  });

  test('should close dialog when canceled', () => {
    const { result } = renderHook(() => useConfirmDialog());
    
    // Open dialog
    act(() => {
      result.current.confirm('Test message');
    });
    
    // Check that dialog is open
    expect(result.current.dialogProps.isOpen).toBe(true);
    
    // Close dialog using onCancel
    act(() => {
      result.current.dialogProps.onCancel();
    });
    
    // Check that dialog is closed
    expect(result.current.dialogProps.isOpen).toBe(false);
  });

  test('should resolve promise when confirmed', async () => {
    const { result } = renderHook(() => useConfirmDialog());
    
    // Show dialog and store promise
    let confirmPromise: Promise<boolean>;
    act(() => {
      confirmPromise = result.current.confirm('Test message');
    });
    
    // Check that dialog is open
    expect(result.current.dialogProps.isOpen).toBe(true);
    
    // Confirm dialog
    act(() => {
      result.current.dialogProps.onConfirm();
    });
    
    // Check that dialog is closed
    expect(result.current.dialogProps.isOpen).toBe(false);
    
    // Check that promise resolves to true
    await expect(confirmPromise).resolves.toBe(true);
  });

  test('should resolve promise to false when canceled', async () => {
    const { result } = renderHook(() => useConfirmDialog());
    
    // Show dialog and store promise
    let confirmPromise: Promise<boolean>;
    act(() => {
      confirmPromise = result.current.confirm('Test message');
    });
    
    // Check that dialog is open
    expect(result.current.dialogProps.isOpen).toBe(true);
    
    // Simulate canceling
    act(() => {
      result.current.dialogProps.onCancel();
    });
    
    // Check that dialog is closed
    expect(result.current.dialogProps.isOpen).toBe(false);
    
    // Check that promise resolves to false
    await expect(confirmPromise).resolves.toBe(false);
  });

  test('should handle confirm with custom options', async () => {
    const { result } = renderHook(() => useConfirmDialog());
    
    // Show dialog with custom options and store promise
    let confirmPromise!: Promise<boolean>;
    act(() => {
      confirmPromise = result.current.confirm({
        title: 'Custom Title',
        message: 'Custom message',
        confirmText: 'Yes',
        cancelText: 'No'
      });
    });
    
    // Check that dialog is open with custom options
    expect(result.current.dialogProps.isOpen).toBe(true);
    expect(result.current.dialogProps.options.title).toBe('Custom Title');
    expect(result.current.dialogProps.options.message).toBe('Custom message');
    expect(result.current.dialogProps.options.confirmText).toBe('Yes');
    expect(result.current.dialogProps.options.cancelText).toBe('No');
    
    // Confirm dialog
    act(() => {
      result.current.dialogProps.onConfirm();
    });
    
    // Check that dialog is closed
    expect(result.current.dialogProps.isOpen).toBe(false);
    
    // Check that promise resolves to true
    await expect(confirmPromise).resolves.toBe(true);
  });

  test('should handle cancel with custom options', async () => {
    const { result } = renderHook(() => useConfirmDialog());
    
    // Show dialog with custom options and store promise
    let confirmPromise!: Promise<boolean>;
    act(() => {
      confirmPromise = result.current.confirm({
        title: 'Custom Title',
        message: 'Custom message',
        confirmText: 'Yes',
        cancelText: 'No'
      });
    });
    
    // Check that dialog is open with custom options
    expect(result.current.dialogProps.isOpen).toBe(true);
    
    // Cancel dialog
    act(() => {
      result.current.dialogProps.onCancel();
    });
    
    // Check that dialog is closed
    expect(result.current.dialogProps.isOpen).toBe(false);
    
    // Check that promise resolves to false
    await expect(confirmPromise).resolves.toBe(false);
  });
}); 