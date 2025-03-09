import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog, { ConfirmOptions } from '../../components/ui/ConfirmDialog';

describe('ConfirmDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  
  const defaultOptions: ConfirmOptions = {
    message: "Test Message"
  };
  
  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });
  
  test('should not render when isOpen is false', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        options={defaultOptions}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.queryByText('Test Message')).not.toBeInTheDocument();
  });
  
  test('should render when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        options={defaultOptions}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
  
  test('should call onConfirm when confirm button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        options={defaultOptions}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.click(screen.getByText('Confirm'));
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });
  
  test('should call onCancel when cancel button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        options={defaultOptions}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
  
  test('should render with custom button text and title', () => {
    const customOptions: ConfirmOptions = {
      title: "Custom Title",
      message: "Custom Message",
      confirmText: "Yes, Proceed",
      cancelText: "No, Go Back",
      confirmButtonClass: "btn-warning"
    };
    
    render(
      <ConfirmDialog
        isOpen={true}
        options={customOptions}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Message')).toBeInTheDocument();
    expect(screen.getByText('Yes, Proceed')).toBeInTheDocument();
    expect(screen.getByText('No, Go Back')).toBeInTheDocument();
    
    const confirmButton = screen.getByText('Yes, Proceed');
    expect(confirmButton.className).toContain('btn-warning');
  });
}); 