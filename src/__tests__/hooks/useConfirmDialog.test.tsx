import React from 'react';
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

  test('should show dialog with string message', async () => {
    const { result } = renderHook(() => useConfirmDialog());
    
    // Start the confirm process but don't resolve it yet
    let confirmPromise: Promise<boolean>;
    act(() => {
      confirmPromise = result.current.confirm('Test message');
    });
    
    // Check that dialog is open with the correct message
    expect(result.current.dialogProps.isOpen).toBe(true);
    expect(result.current.dialogProps.options).toEqual({ message: 'Test message' });
    
    // Simulate confirming
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
    
    // Start the confirm process but don't resolve it yet
    let confirmPromise: Promise<boolean>;
    act(() => {
      confirmPromise = result.current.confirm(options);
    });
    
    // Check that dialog is open with the correct options
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

  test('should close dialog with closeDialog function', () => {
    const { result } = renderHook(() => useConfirmDialog());
    
    // Open dialog
    act(() => {
      result.current.confirm('Test message');
    });
    
    expect(result.current.dialogProps.isOpen).toBe(true);
    
    // Close dialog using the onConfirm function (which calls closeDialog internally)
    act(() => {
      // We're accessing the internal implementation here, which is not ideal
      // but necessary to test the closeDialog function
      result.current.dialogProps.onConfirm();
    });
    
    expect(result.current.dialogProps.isOpen).toBe(false);
  });
}); 