import { render, screen, fireEvent } from '@testing-library/react';
import InventoryTracker from '../../components/InventoryTracker';
import { mockActiveTracking } from '../../testUtils/testHelpers';

// Mock FontAwesomeIcon
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: any }) => {
    return <span data-testid={`icon-${icon.iconName || 'unknown'}`}></span>;
  }
}));

describe('InventoryTracker', () => {
  const mockOnUpdateInventory = jest.fn();
  
  beforeEach(() => {
    mockOnUpdateInventory.mockClear();
  });
  
  test('should render empty inventory state', () => {
    const emptyInventoryTracking = {
      ...mockActiveTracking,
      inventoryData: {
        routeInventory: {}
      }
    };
    
    render(
      <InventoryTracker
        activeTracking={emptyInventoryTracking}
        onUpdateInventory={mockOnUpdateInventory}
      />
    );
    
    expect(screen.getByText('Inventory Tracker')).toBeInTheDocument();
    expect(screen.getByText('No items in inventory yet')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Item name')).toBeInTheDocument();
  });
  
  test('should render inventory items', () => {
    const inventoryTracking = {
      ...mockActiveTracking,
      inventoryData: {
        routeInventory: {
          'Acid': 5,
          'Steel': 10
        }
      }
    };
    
    render(
      <InventoryTracker
        activeTracking={inventoryTracking}
        onUpdateInventory={mockOnUpdateInventory}
      />
    );
    
    expect(screen.getByText('Acid')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Steel')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
  
  test('should add new item to inventory', () => {
    const emptyInventoryTracking = {
      ...mockActiveTracking,
      inventoryData: {
        routeInventory: {}
      }
    };
    
    render(
      <InventoryTracker
        activeTracking={emptyInventoryTracking}
        onUpdateInventory={mockOnUpdateInventory}
      />
    );
    
    // Add a new item
    const nameInput = screen.getByPlaceholderText('Item name');
    const quantityInput = screen.getByRole('spinbutton');
    const addButton = screen.getByText('Add');
    
    fireEvent.change(nameInput, { target: { value: 'Copper' } });
    fireEvent.change(quantityInput, { target: { value: '3' } });
    fireEvent.click(addButton);
    
    // Check if onUpdateInventory was called with the correct data
    expect(mockOnUpdateInventory).toHaveBeenCalledWith({ 'Copper': 3 });
    
    // Check if inputs were reset
    expect(nameInput).toHaveValue('');
    expect(quantityInput).toHaveValue(1);
  });
  
  test('should update existing item quantity', () => {
    const inventoryTracking = {
      ...mockActiveTracking,
      inventoryData: {
        routeInventory: {
          'Acid': 5
        }
      }
    };
    
    const { container } = render(
      <InventoryTracker
        activeTracking={inventoryTracking}
        onUpdateInventory={mockOnUpdateInventory}
      />
    );
    
    // Find the row containing 'Acid'
    const acidRow = Array.from(container.querySelectorAll('tr')).find(
      row => row.textContent?.includes('Acid')
    );
    
    expect(acidRow).toBeTruthy();
    
    if (acidRow) {
      // Find the first button in the row (which should be the plus button)
      const buttons = acidRow.querySelectorAll('button');
      const plusButton = buttons[0]; // First button should be plus
      
      expect(plusButton).toBeTruthy();
      
      // Click the plus button
      fireEvent.click(plusButton);
      
      // Check if onUpdateInventory was called with the correct data
      expect(mockOnUpdateInventory).toHaveBeenCalledWith({ 'Acid': 6 });
    }
  });
  
  test('should remove item when quantity reaches zero', () => {
    const inventoryTracking = {
      ...mockActiveTracking,
      inventoryData: {
        routeInventory: {
          'Acid': 1
        }
      }
    };
    
    const { container } = render(
      <InventoryTracker
        activeTracking={inventoryTracking}
        onUpdateInventory={mockOnUpdateInventory}
      />
    );
    
    // Find the row containing 'Acid'
    const acidRow = Array.from(container.querySelectorAll('tr')).find(
      row => row.textContent?.includes('Acid')
    );
    
    expect(acidRow).toBeTruthy();
    
    if (acidRow) {
      // Find the second button in the row (which should be the minus button)
      const buttons = acidRow.querySelectorAll('button');
      const minusButton = buttons[1]; // Second button should be minus
      
      expect(minusButton).toBeTruthy();
      
      // Click the minus button
      fireEvent.click(minusButton);
      
      // Check if onUpdateInventory was called with empty object
      expect(mockOnUpdateInventory).toHaveBeenCalledWith({});
    }
  });
  
  test('should not add item with empty name', () => {
    const emptyInventoryTracking = {
      ...mockActiveTracking,
      inventoryData: {
        routeInventory: {}
      }
    };
    
    render(
      <InventoryTracker
        activeTracking={emptyInventoryTracking}
        onUpdateInventory={mockOnUpdateInventory}
      />
    );
    
    // Try to add an item with empty name
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
    
    // Check that onUpdateInventory was not called
    expect(mockOnUpdateInventory).not.toHaveBeenCalled();
  });
}); 