import { renderHook, act } from '@testing-library/react';
import { useNotification } from '../../hooks/useNotification';

describe('useNotification', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should initialize with default values', () => {
    const { result } = renderHook(() => useNotification());
    
    expect(result.current.notification).toEqual({
      message: '',
      type: 'info',
      visible: false
    });
  });

  test('should show notification with string parameters', () => {
    const { result } = renderHook(() => useNotification());
    
    act(() => {
      result.current.showNotification('Test message', 'success', 2000);
    });
    
    expect(result.current.notification).toEqual({
      message: 'Test message',
      type: 'success',
      visible: true
    });
  });

  test('should show notification with options object', () => {
    const { result } = renderHook(() => useNotification());
    
    act(() => {
      result.current.showNotification({
        message: 'Test message from object',
        type: 'error',
        duration: 1000
      });
    });
    
    expect(result.current.notification).toEqual({
      message: 'Test message from object',
      type: 'error',
      visible: true
    });
  });

  test('should use default values when not provided in options object', () => {
    const { result } = renderHook(() => useNotification());
    
    act(() => {
      result.current.showNotification({
        message: 'Message with defaults'
      });
    });
    
    expect(result.current.notification).toEqual({
      message: 'Message with defaults',
      type: 'info', // Default type
      visible: true
    });
  });

  test('should auto-hide notification after duration (string params)', () => {
    const { result } = renderHook(() => useNotification());
    
    act(() => {
      result.current.showNotification('Auto-hide test', 'info', 1000);
    });
    
    expect(result.current.notification.visible).toBe(true);
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(result.current.notification.visible).toBe(false);
  });

  test('should auto-hide notification after duration (options object)', () => {
    const { result } = renderHook(() => useNotification());
    
    act(() => {
      result.current.showNotification({
        message: 'Auto-hide test with object',
        duration: 2000
      });
    });
    
    expect(result.current.notification.visible).toBe(true);
    
    // Fast-forward time but not enough to hide
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(result.current.notification.visible).toBe(true);
    
    // Fast-forward remaining time
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(result.current.notification.visible).toBe(false);
  });

  test('should manually hide notification', () => {
    const { result } = renderHook(() => useNotification());
    
    act(() => {
      result.current.showNotification('Manual hide test');
    });
    
    expect(result.current.notification.visible).toBe(true);
    
    act(() => {
      result.current.hideNotification();
    });
    
    expect(result.current.notification.visible).toBe(false);
  });
}); 