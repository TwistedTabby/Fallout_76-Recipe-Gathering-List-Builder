import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ItemConfirmationDialog from '../../components/ItemConfirmationDialog';
import { Item } from '../../types/farmingTracker';

describe('ItemConfirmationDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  
  const mockItem: Item = {
    id: 'test-item-1',
    name: 'Test Item',
    description: 'Test description',
    type: 'bobblehead'
  };
  
  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });
  
  test('should render bobblehead confirmation dialog correctly', () => {
    render(
      <ItemConfirmationDialog
        item={mockItem}
        confirmationType="bobblehead"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Confirm Bobblehead Collection')).toBeInTheDocument();
    expect(screen.getByText(`Did you collect the ${mockItem.name}?`)).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    
    // Check for Yes, No, and Cancel buttons
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
  
  test('should render magazine confirmation dialog correctly', () => {
    const magazineItem: Item = {
      ...mockItem,
      type: 'magazine'
    };
    
    render(
      <ItemConfirmationDialog
        item={magazineItem}
        confirmationType="magazine"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Confirm Magazine Collection')).toBeInTheDocument();
    expect(screen.getByText(`Did you collect the ${mockItem.name}?`)).toBeInTheDocument();
    
    // Check for Yes, No, and Cancel buttons
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
  
  test('should render event confirmation dialog correctly', () => {
    const eventItem: Item = {
      ...mockItem,
      type: 'event'
    };
    
    render(
      <ItemConfirmationDialog
        item={eventItem}
        confirmationType="event"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Confirm Event Completion')).toBeInTheDocument();
    expect(screen.getByText(`Did the event "${mockItem.name}" occur?`)).toBeInTheDocument();
    
    // Check for Yes, No, and Cancel buttons
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
  
  test('should render spawned item confirmation dialog correctly', () => {
    const spawnedItem: Item = {
      ...mockItem,
      type: 'spawned'
    };
    
    render(
      <ItemConfirmationDialog
        item={spawnedItem}
        confirmationType="spawned"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Confirm Item Spawn')).toBeInTheDocument();
    expect(screen.getByText(`Did "${mockItem.name}" spawn?`)).toBeInTheDocument();
    
    // Check for Yes, No, and Cancel buttons
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
  
  test('should render consumable dialog with quantity controls', () => {
    const consumableItem: Item = {
      ...mockItem,
      type: 'consumable',
      quantity: 5
    };
    
    render(
      <ItemConfirmationDialog
        item={consumableItem}
        confirmationType="consumable"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Specify Quantity Collected')).toBeInTheDocument();
    expect(screen.getByText(`How many ${mockItem.name} did you collect? (0 is valid)`)).toBeInTheDocument();
    
    // Check for Confirm and Cancel buttons (not Yes/No for consumables)
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.queryByText('Yes')).not.toBeInTheDocument();
    expect(screen.queryByText('No')).not.toBeInTheDocument();
  });
  
  test('should call onCancel when Cancel button is clicked', () => {
    render(
      <ItemConfirmationDialog
        item={mockItem}
        confirmationType="bobblehead"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
  
  test('should call onConfirm with "yes" when Yes button is clicked', () => {
    render(
      <ItemConfirmationDialog
        item={mockItem}
        confirmationType="bobblehead"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.click(screen.getByText('Yes'));
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).toHaveBeenCalledWith(undefined, 'yes');
    expect(mockOnCancel).not.toHaveBeenCalled();
  });
  
  test('should call onConfirm with "no" when No button is clicked', () => {
    render(
      <ItemConfirmationDialog
        item={mockItem}
        confirmationType="bobblehead"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.click(screen.getByText('No'));
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).toHaveBeenCalledWith(undefined, 'no');
    expect(mockOnCancel).not.toHaveBeenCalled();
  });
  
  test('should call onConfirm with quantity for consumables', () => {
    const consumableItem: Item = {
      ...mockItem,
      type: 'consumable',
      quantity: 5
    };
    
    render(
      <ItemConfirmationDialog
        item={consumableItem}
        confirmationType="consumable"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    // Default quantity should be the item's quantity
    fireEvent.click(screen.getByText('Confirm'));
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).toHaveBeenCalledWith(5);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });
  
  test('should update quantity when plus/minus buttons are clicked', () => {
    const consumableItem: Item = {
      ...mockItem,
      type: 'consumable',
      quantity: 5
    };
    
    render(
      <ItemConfirmationDialog
        item={consumableItem}
        confirmationType="consumable"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    // Initial quantity should be 5
    expect(screen.getByText('5')).toBeInTheDocument();
    
    // Click plus button twice
    const plusButton = screen.getByRole('button', { name: /\+/i });
    fireEvent.click(plusButton);
    fireEvent.click(plusButton);
    
    // Quantity should now be 7
    expect(screen.getByText('7')).toBeInTheDocument();
    
    // Click minus button once
    const minusButton = screen.getByRole('button', { name: /-/i });
    fireEvent.click(minusButton);
    
    // Quantity should now be 6
    expect(screen.getByText('6')).toBeInTheDocument();
    
    // Confirm with updated quantity
    fireEvent.click(screen.getByText('Confirm'));
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).toHaveBeenCalledWith(6);
  });
}); 