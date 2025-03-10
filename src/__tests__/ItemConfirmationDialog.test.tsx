import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ItemConfirmationDialog from '../components/ItemConfirmationDialog';
import { Item } from '../types/farmingTracker';

// Mock the CollectibleSelector component
jest.mock('../components/CollectibleSelector', () => {
  return jest.fn(({ type, onSelect, onCancel }) => (
    <div data-testid="mock-collectible-selector">
      <div>Mock {type} Selector</div>
      <button onClick={() => onSelect('Test Item', type === 'magazine' ? 1 : undefined)}>
        Select Item
      </button>
      <button onClick={onCancel}>Cancel Selection</button>
    </div>
  ));
});

describe('ItemConfirmationDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  
  const mockItem: Item = {
    id: 'test-item-1',
    type: 'magazine',
    name: 'Test Magazine',
    quantity: 1,
    collected: false,
    description: 'Test description'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders magazine confirmation dialog correctly', () => {
    render(
      <ItemConfirmationDialog 
        item={mockItem}
        confirmationType="magazine"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Confirm Magazine Collection')).toBeInTheDocument();
    expect(screen.getByText('Did you collect a magazine?')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('renders bobblehead confirmation dialog correctly', () => {
    render(
      <ItemConfirmationDialog 
        item={{ ...mockItem, type: 'bobblehead', name: 'Test Bobblehead' }}
        confirmationType="bobblehead"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Confirm Bobblehead Collection')).toBeInTheDocument();
    expect(screen.getByText('Did you collect a bobblehead?')).toBeInTheDocument();
  });

  test('renders consumable confirmation dialog correctly', () => {
    render(
      <ItemConfirmationDialog 
        item={{ ...mockItem, type: 'consumable', name: 'Test Consumable', quantity: 5 }}
        confirmationType="consumable"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Specify Quantity Collected')).toBeInTheDocument();
    expect(screen.getByText('How many Test Consumable did you collect? (0 is valid)')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Default quantity
  });

  test('clicking No calls onConfirm with no answer', () => {
    render(
      <ItemConfirmationDialog 
        item={mockItem}
        confirmationType="magazine"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('No'));
    expect(mockOnConfirm).toHaveBeenCalledWith(undefined, 'no');
  });

  test('clicking Yes for magazine shows collectible selector', () => {
    render(
      <ItemConfirmationDialog 
        item={mockItem}
        confirmationType="magazine"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Yes'));
    expect(screen.getByTestId('mock-collectible-selector')).toBeInTheDocument();
    expect(screen.getByText('Mock magazine Selector')).toBeInTheDocument();
  });

  test('clicking Yes for bobblehead shows collectible selector', () => {
    render(
      <ItemConfirmationDialog 
        item={{ ...mockItem, type: 'bobblehead', name: 'Test Bobblehead' }}
        confirmationType="bobblehead"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Yes'));
    expect(screen.getByTestId('mock-collectible-selector')).toBeInTheDocument();
    expect(screen.getByText('Mock bobblehead Selector')).toBeInTheDocument();
  });

  test('selecting an item from collectible selector calls onConfirm with details', () => {
    render(
      <ItemConfirmationDialog 
        item={mockItem}
        confirmationType="magazine"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Show the collectible selector
    fireEvent.click(screen.getByText('Yes'));
    
    // Select an item from the mock selector
    fireEvent.click(screen.getByText('Select Item'));
    
    // Check that onConfirm was called with the right parameters
    expect(mockOnConfirm).toHaveBeenCalledWith(
      undefined, 
      'yes', 
      { name: 'Test Item', issueNumber: 1 }
    );
  });

  test('canceling collectible selection hides the selector', () => {
    render(
      <ItemConfirmationDialog 
        item={mockItem}
        confirmationType="magazine"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Show the collectible selector
    fireEvent.click(screen.getByText('Yes'));
    
    // Cancel the selection
    fireEvent.click(screen.getByText('Cancel Selection'));
    
    // Check that we're back to the confirmation dialog
    expect(screen.getByText('Confirm Magazine Collection')).toBeInTheDocument();
  });

  test('clicking Cancel calls onCancel', () => {
    render(
      <ItemConfirmationDialog 
        item={mockItem}
        confirmationType="magazine"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('changing quantity for consumables works', () => {
    render(
      <ItemConfirmationDialog 
        item={{ ...mockItem, type: 'consumable', name: 'Test Consumable', quantity: 5 }}
        confirmationType="consumable"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Initial quantity should be 5
    expect(screen.getByText('5')).toBeInTheDocument();
    
    // Click the minus button twice
    const minusButton = screen.getByRole('button', { name: /minus/i });
    fireEvent.click(minusButton);
    fireEvent.click(minusButton);
    
    // Quantity should now be 3
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Click the plus button
    const plusButton = screen.getByRole('button', { name: /plus/i });
    fireEvent.click(plusButton);
    
    // Quantity should now be 4
    expect(screen.getByText('4')).toBeInTheDocument();
    
    // Confirm the quantity
    fireEvent.click(screen.getByText('Confirm'));
    expect(mockOnConfirm).toHaveBeenCalledWith(4);
  });
}); 