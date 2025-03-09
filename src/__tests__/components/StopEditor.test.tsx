import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StopEditor from '../../components/StopEditor';
import { mockRoutes } from '../../testUtils/testHelpers';
import { ItemType } from '../../types/farmingTracker';

// Mock FontAwesomeIcon
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="mock-icon" />
}));

describe('StopEditor', () => {
  const mockStop = mockRoutes[0].stops[0];
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  
  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
  });
  
  test('should render with stop data', () => {
    render(
      <StopEditor
        stop={mockStop}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Check if stop data is displayed in the form
    expect(screen.getByLabelText('Stop Name:')).toHaveValue(mockStop.name);
    expect(screen.getByLabelText('Notes:')).toHaveValue(mockStop.description || '');
  });
  
  test('should render with empty form for new stop', () => {
    render(
      <StopEditor
        stop={null}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Check if form is empty
    expect(screen.getByLabelText('Stop Name:')).toHaveValue('');
    expect(screen.getByLabelText('Notes:')).toHaveValue('');
  });
  
  test('should call onSave with updated stop data when form is submitted', () => {
    render(
      <StopEditor
        stop={mockStop}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Update form fields
    const nameInput = screen.getByLabelText('Stop Name:');
    const notesInput = screen.getByLabelText('Notes:');
    
    fireEvent.change(nameInput, { target: { value: 'Updated Stop Name' } });
    fireEvent.change(notesInput, { target: { value: 'Updated notes' } });
    
    // Submit form
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Check if onSave was called with updated data
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      id: mockStop.id,
      name: 'Updated Stop Name',
      description: 'Updated notes'
    }));
  });
  
  test('should call onCancel when cancel button is clicked', () => {
    render(
      <StopEditor
        stop={mockStop}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
  
  test('should add a new item when add item button is clicked', () => {
    render(
      <StopEditor
        stop={mockStop}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Select an item type
    const itemTypeSelect = screen.getByLabelText('Item Type:');
    fireEvent.change(itemTypeSelect, { target: { value: 'Bobblehead' } });
    
    // Click add item button
    const addButton = screen.getByText('Add Item');
    fireEvent.click(addButton);
    
    // Submit form to check if the new item was added
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Check if onSave was called with the new item added
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    const savedStop = mockOnSave.mock.calls[0][0];
    expect(savedStop.items.length).toBe(mockStop.items.length + 1);
    expect(savedStop.items[savedStop.items.length - 1].type).toBe('Bobblehead');
  });
  
  test('should remove an item when delete button is clicked', () => {
    render(
      <StopEditor
        stop={mockStop}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Find all delete buttons for items and click the first one
    const deleteButtons = screen.getAllByTitle('Delete Item');
    fireEvent.click(deleteButtons[0]);
    
    // Submit form to check if the item was removed
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Check if onSave was called with the item removed
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    const savedStop = mockOnSave.mock.calls[0][0];
    expect(savedStop.items.length).toBe(mockStop.items.length - 1);
  });
  
  test('should update item name when name input appears and changes', () => {
    // Create a stop with an item that requires a custom name
    const stopWithCustomNameItem = {
      ...mockStop,
      items: [
        {
          id: 'item1',
          type: 'Event' as ItemType,
          name: 'Test Event',
          quantity: 1,
          collected: false
        }
      ]
    };
    
    render(
      <StopEditor
        stop={stopWithCustomNameItem}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Click edit button for the item
    const editButton = screen.getByTitle('Edit Item');
    fireEvent.click(editButton);
    
    // Now the item name input should appear
    const itemNameInput = screen.getByLabelText('Item Name:');
    fireEvent.change(itemNameInput, { target: { value: 'Updated Event Name' } });
    
    // Click update item button
    const updateButton = screen.getByText('Update Item');
    fireEvent.click(updateButton);
    
    // Submit form to check if the item name was updated
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Check if onSave was called with the updated item name
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    const savedStop = mockOnSave.mock.calls[0][0];
    expect(savedStop.items[0].name).toBe('Updated Event Name');
  });
  
  test('should validate required fields before saving', () => {
    render(
      <StopEditor
        stop={mockStop}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Clear the stop name
    const nameInput = screen.getByLabelText('Stop Name:');
    fireEvent.change(nameInput, { target: { value: '' } });
    
    // Try to submit the form
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Check if onSave was not called due to validation failure
    expect(mockOnSave).not.toHaveBeenCalled();
    
    // Check if validation error message is displayed
    expect(screen.getByText('Stop name is required')).toBeInTheDocument();
  });
}); 