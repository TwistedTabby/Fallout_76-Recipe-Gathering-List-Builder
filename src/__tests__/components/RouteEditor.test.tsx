import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RouteEditor from '../../components/RouteEditor';
import { mockRoutes } from '../../testUtils/testHelpers';

// Mock FontAwesomeIcon
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="mock-icon" />
}));

describe('RouteEditor', () => {
  const mockRoute = mockRoutes[0];
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnDeleteStop = jest.fn();
  const mockOnEditStop = jest.fn();
  const mockOnAddStop = jest.fn();
  
  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
    mockOnDeleteStop.mockClear();
    mockOnEditStop.mockClear();
    mockOnAddStop.mockClear();
  });
  
  test('should render with route data', () => {
    render(
      <RouteEditor
        route={mockRoute}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onAddStop={mockOnAddStop}
        onEditStop={mockOnEditStop}
        onDeleteStop={mockOnDeleteStop}
      />
    );
    
    // Check if route data is displayed in the form
    expect(screen.getByLabelText('Route Name:')).toHaveValue(mockRoute.name);
    expect(screen.getByLabelText('Description:')).toHaveValue(mockRoute.description || '');
    
    // Check if stops are displayed
    mockRoute.stops.forEach(stop => {
      expect(screen.getByText(stop.name)).toBeInTheDocument();
    });
  });
  
  test('should render with empty form for new route', () => {
    render(
      <RouteEditor
        route={null}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onAddStop={mockOnAddStop}
        onEditStop={mockOnEditStop}
        onDeleteStop={mockOnDeleteStop}
      />
    );
    
    // Check if form is empty
    expect(screen.getByLabelText('Route Name:')).toHaveValue('');
    expect(screen.getByLabelText('Description:')).toHaveValue('');
    
    // Check if no stops are displayed
    expect(screen.getByText('No stops added yet. Add a stop to get started.')).toBeInTheDocument();
  });
  
  test('should call onSave with updated route data when form is submitted', () => {
    render(
      <RouteEditor
        route={mockRoute}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onAddStop={mockOnAddStop}
        onEditStop={mockOnEditStop}
        onDeleteStop={mockOnDeleteStop}
      />
    );
    
    // Update form fields
    const nameInput = screen.getByLabelText('Route Name:');
    const descriptionInput = screen.getByLabelText('Description:');
    
    fireEvent.change(nameInput, { target: { value: 'Updated Route Name' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });
    
    // Submit form
    const saveButton = screen.getByText('Save Route');
    fireEvent.click(saveButton);
    
    // Check if onSave was called with updated data
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      id: mockRoute.id,
      name: 'Updated Route Name',
      description: 'Updated description'
    }));
  });
  
  test('should call onCancel when cancel button is clicked', () => {
    render(
      <RouteEditor
        route={mockRoute}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onAddStop={mockOnAddStop}
        onEditStop={mockOnEditStop}
        onDeleteStop={mockOnDeleteStop}
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
  
  test('should call onAddStop when add stop button is clicked', () => {
    render(
      <RouteEditor
        route={mockRoute}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onAddStop={mockOnAddStop}
        onEditStop={mockOnEditStop}
        onDeleteStop={mockOnDeleteStop}
      />
    );
    
    const addButton = screen.getByText('Add Stop');
    fireEvent.click(addButton);
    
    expect(mockOnAddStop).toHaveBeenCalledTimes(1);
    expect(mockOnAddStop).toHaveBeenCalledWith(mockRoute.id);
  });
  
  test('should call onEditStop when edit stop button is clicked', () => {
    render(
      <RouteEditor
        route={mockRoute}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onAddStop={mockOnAddStop}
        onEditStop={mockOnEditStop}
        onDeleteStop={mockOnDeleteStop}
      />
    );
    
    // Find all edit buttons for stops and click the first one
    const editButtons = screen.getAllByTitle('Edit Stop');
    fireEvent.click(editButtons[0]);
    
    expect(mockOnEditStop).toHaveBeenCalledTimes(1);
    expect(mockOnEditStop).toHaveBeenCalledWith(mockRoute.id, mockRoute.stops[0].id);
  });
  
  test('should call onDeleteStop when delete stop button is clicked', () => {
    render(
      <RouteEditor
        route={mockRoute}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onAddStop={mockOnAddStop}
        onEditStop={mockOnEditStop}
        onDeleteStop={mockOnDeleteStop}
      />
    );
    
    // Find all delete buttons for stops and click the first one
    const deleteButtons = screen.getAllByTitle('Delete Stop');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnDeleteStop).toHaveBeenCalledTimes(1);
    expect(mockOnDeleteStop).toHaveBeenCalledWith(mockRoute.id, mockRoute.stops[0].id);
  });
  
  test('should validate required fields before saving', () => {
    render(
      <RouteEditor
        route={mockRoute}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onAddStop={mockOnAddStop}
        onEditStop={mockOnEditStop}
        onDeleteStop={mockOnDeleteStop}
      />
    );
    
    // Clear the route name
    const nameInput = screen.getByLabelText('Route Name:');
    fireEvent.change(nameInput, { target: { value: '' } });
    
    // Try to submit the form
    const saveButton = screen.getByText('Save Route');
    fireEvent.click(saveButton);
    
    // Check if onSave was not called due to validation failure
    expect(mockOnSave).not.toHaveBeenCalled();
    
    // Check if validation error message is displayed
    expect(screen.getByText('Route name is required')).toBeInTheDocument();
  });
  
  test('should display stop items count', () => {
    render(
      <RouteEditor
        route={mockRoute}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onAddStop={mockOnAddStop}
        onEditStop={mockOnEditStop}
        onDeleteStop={mockOnDeleteStop}
      />
    );
    
    // Check if item counts are displayed for each stop
    mockRoute.stops.forEach(stop => {
      const itemCount = stop.items.length;
      expect(screen.getByText(`${itemCount} item${itemCount !== 1 ? 's' : ''}`)).toBeInTheDocument();
    });
  });
}); 