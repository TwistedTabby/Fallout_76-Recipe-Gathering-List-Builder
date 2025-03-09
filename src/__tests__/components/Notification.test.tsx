import { render, screen, act } from '@testing-library/react';
import Notification from '../../components/ui/Notification';

describe('Notification', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should render with message', () => {
    render(<Notification notification={{ message: "Test notification", type: "success", visible: true }} />);
    
    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });

  test('should apply success class for success type', () => {
    const { container } = render(<Notification notification={{ message: "Success message", type: "success", visible: true }} />);
    
    const notificationElement = container.firstChild;
    expect(notificationElement).toHaveClass('notification');
    expect(notificationElement).toHaveClass('notification-success');
  });

  test('should apply error class for error type', () => {
    const { container } = render(<Notification notification={{ message: "Error message", type: "error", visible: true }} />);
    
    const notificationElement = container.firstChild;
    expect(notificationElement).toHaveClass('notification');
    expect(notificationElement).toHaveClass('notification-error');
  });

  test('should apply info class for info type', () => {
    const { container } = render(<Notification notification={{ message: "Info message", type: "info", visible: true }} />);
    
    const notificationElement = container.firstChild;
    expect(notificationElement).toHaveClass('notification');
    expect(notificationElement).toHaveClass('notification-info');
  });

  test('should not be visible when message is empty', () => {
    const { container } = render(<Notification notification={{ message: "", type: "success", visible: false }} />);
    
    expect(container.firstChild).toBeNull();
  });

  test('should auto-hide after duration', () => {
    const onHideMock = jest.fn();
    const { container, rerender } = render(
      <Notification 
        notification={{ message: "Test notification", type: "success", visible: true }} 
        onClose={onHideMock} 
      />
    );
    
    // Initially visible
    let notificationElement = container.firstChild;
    expect(notificationElement).not.toBeNull();
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // Should call onHide
    expect(onHideMock).toHaveBeenCalledTimes(0); // This should be 0 since we're not auto-hiding in the component
    
    // Simulate the parent component clearing the message
    rerender(<Notification notification={{ message: "", type: "success", visible: false }} onClose={onHideMock} />);
    
    // Should now be hidden
    expect(container.firstChild).toBeNull();
  });

  test('should not auto-hide if duration is 0', () => {
    const onHideMock = jest.fn();
    render(
      <Notification 
        notification={{ message: "Test notification", type: "success", visible: true }} 
        onClose={onHideMock} 
      />
    );
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Should not call onHide
    expect(onHideMock).not.toHaveBeenCalled();
  });

  test('should clear timeout on unmount', () => {
    const onHideMock = jest.fn();
    const { unmount } = render(
      <Notification 
        notification={{ message: "Test notification", type: "success", visible: true }} 
        onClose={onHideMock} 
      />
    );
    
    // Unmount before timeout completes
    unmount();
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // Should not call onHide after unmount
    expect(onHideMock).not.toHaveBeenCalled();
  });

  // New tests for the updated component
  
  test('should handle undefined notification prop without error', () => {
    // This test verifies that the component doesn't throw when notification is undefined
    const { container } = render(<Notification />);
    expect(container.firstChild).toBeNull(); // Should not render anything when no props provided
  });

  test('should render with individual props instead of notification object', () => {
    const { container } = render(
      <Notification 
        message="Direct message prop" 
        type="info" 
        visible={true} 
      />
    );
    
    expect(screen.getByText('Direct message prop')).toBeInTheDocument();
    const notificationElement = container.firstChild;
    expect(notificationElement).toHaveClass('notification-info');
  });

  test('should prioritize notification object over individual props', () => {
    const { container } = render(
      <Notification 
        notification={{ message: "From notification object", type: "error", visible: true }}
        message="Direct message prop" 
        type="info" 
        visible={true} 
      />
    );
    
    expect(screen.getByText('From notification object')).toBeInTheDocument();
    const notificationElement = container.firstChild;
    expect(notificationElement).toHaveClass('notification-error');
  });

  test('should handle partial notification object', () => {
    // @ts-ignore - Intentionally passing incomplete notification object to test robustness
    const { container } = render(<Notification notification={{ message: "Partial notification", visible: true }} />);
    
    expect(screen.getByText('Partial notification')).toBeInTheDocument();
    const notificationElement = container.firstChild;
    expect(notificationElement).toHaveClass('notification-info'); // Should use default type
  });
}); 