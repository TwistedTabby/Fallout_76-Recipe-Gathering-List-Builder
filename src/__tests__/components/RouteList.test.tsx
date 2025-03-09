import { render, screen, fireEvent } from '@testing-library/react';
import RouteList from '../../components/RouteList';
import { mockRoutes } from '../../testUtils/testHelpers';

// Mock FontAwesomeIcon
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="mock-icon" />
}));

describe('RouteList', () => {
  const mockOnSelectRoute = jest.fn();
  const mockOnDeleteRoute = jest.fn();
  const mockOnEditRoute = jest.fn();
  const mockOnStartTracking = jest.fn();
  const mockOnCreateRoute = jest.fn();
  const mockOnDuplicateRoute = jest.fn();
  
  beforeEach(() => {
    mockOnSelectRoute.mockClear();
    mockOnDeleteRoute.mockClear();
    mockOnEditRoute.mockClear();
    mockOnStartTracking.mockClear();
    mockOnCreateRoute.mockClear();
    mockOnDuplicateRoute.mockClear();
  });
  
  test('should render routes list', () => {
    render(
      <RouteList 
        routes={mockRoutes}
        currentRouteId={null}
        onSelectRoute={mockOnSelectRoute}
        onCreateRoute={mockOnCreateRoute}
        onEditRoute={mockOnEditRoute}
        onDeleteRoute={mockOnDeleteRoute}
        onStartTracking={mockOnStartTracking}
        onDuplicateRoute={mockOnDuplicateRoute}
      />
    );
    
    // Check if route list header is displayed
    expect(screen.getByText('Your Routes')).toBeInTheDocument();
    
    // Check if routes are displayed
    mockRoutes.forEach(route => {
      expect(screen.getByText(route.name)).toBeInTheDocument();
    });
  });
  
  test('should display message when no routes exist', () => {
    render(
      <RouteList
        routes={[]}
        currentRouteId={null}
        onSelectRoute={mockOnSelectRoute}
        onDeleteRoute={mockOnDeleteRoute}
        onEditRoute={mockOnEditRoute}
        onStartTracking={mockOnStartTracking}
        onCreateRoute={mockOnCreateRoute}
      />
    );
    
    expect(screen.getByText("You don't have any routes yet. Create your first route to get started!")).toBeInTheDocument();
  });
  
  test('should select route when clicked', () => {
    render(
      <RouteList 
        routes={mockRoutes}
        currentRouteId={null}
        onSelectRoute={mockOnSelectRoute}
        onCreateRoute={mockOnCreateRoute}
        onEditRoute={mockOnEditRoute}
        onDeleteRoute={mockOnDeleteRoute}
        onStartTracking={mockOnStartTracking}
        onDuplicateRoute={mockOnDuplicateRoute}
      />
    );
    
    // Click on the first route
    const firstRouteElement = screen.getByText(mockRoutes[0].name);
    fireEvent.click(firstRouteElement);
    
    // Check if onSelectRoute was called with the correct route ID
    expect(mockOnSelectRoute).toHaveBeenCalledWith(mockRoutes[0].id);
  });
  
  test('should apply active class to the selected route', () => {
    render(
      <RouteList
        routes={mockRoutes}
        currentRouteId={mockRoutes[0].id}
        onSelectRoute={mockOnSelectRoute}
        onCreateRoute={mockOnCreateRoute}
        onEditRoute={mockOnEditRoute}
        onDeleteRoute={mockOnDeleteRoute}
        onStartTracking={mockOnStartTracking}
        onDuplicateRoute={mockOnDuplicateRoute}
      />
    );
    
    // Check if the first route has the active class
    const firstRouteElement = screen.getByText(mockRoutes[0].name).closest('.route-item');
    expect(firstRouteElement).toHaveClass('active');
  });
  
  test('should call onCreateRoute when create button is clicked', () => {
    render(
      <RouteList
        routes={mockRoutes}
        currentRouteId={null}
        onSelectRoute={mockOnSelectRoute}
        onDeleteRoute={mockOnDeleteRoute}
        onEditRoute={mockOnEditRoute}
        onStartTracking={mockOnStartTracking}
        onCreateRoute={mockOnCreateRoute}
      />
    );
    
    fireEvent.click(screen.getByText('Create New Route'));
    
    expect(mockOnCreateRoute).toHaveBeenCalledTimes(1);
  });
  
  test('should call onDeleteRoute when delete button is clicked', () => {
    render(
      <RouteList
        routes={mockRoutes}
        currentRouteId={null}
        onSelectRoute={mockOnSelectRoute}
        onDeleteRoute={mockOnDeleteRoute}
        onEditRoute={mockOnEditRoute}
        onStartTracking={mockOnStartTracking}
        onCreateRoute={mockOnCreateRoute}
      />
    );
    
    // Find all delete buttons and click the first one
    const deleteButtons = screen.getAllByTitle('Delete Route');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnDeleteRoute).toHaveBeenCalledWith(mockRoutes[0].id);
  });
  
  test('should call onEditRoute when edit button is clicked', () => {
    render(
      <RouteList
        routes={mockRoutes}
        currentRouteId={null}
        onSelectRoute={mockOnSelectRoute}
        onDeleteRoute={mockOnDeleteRoute}
        onEditRoute={mockOnEditRoute}
        onStartTracking={mockOnStartTracking}
        onCreateRoute={mockOnCreateRoute}
      />
    );
    
    // Find all edit buttons and click the first one
    const editButtons = screen.getAllByTitle('Edit Route');
    fireEvent.click(editButtons[0]);
    
    expect(mockOnEditRoute).toHaveBeenCalledWith(mockRoutes[0].id);
  });
  
  test('should call onStartTracking when start button is clicked', () => {
    render(
      <RouteList
        routes={mockRoutes}
        currentRouteId={null}
        onSelectRoute={mockOnSelectRoute}
        onDeleteRoute={mockOnDeleteRoute}
        onEditRoute={mockOnEditRoute}
        onStartTracking={mockOnStartTracking}
        onCreateRoute={mockOnCreateRoute}
      />
    );
    
    // Find all start buttons and click the first one
    const startButtons = screen.getAllByTitle('Start Tracking');
    fireEvent.click(startButtons[0]);
    
    expect(mockOnStartTracking).toHaveBeenCalledWith(mockRoutes[0].id);
  });
  
  test('should prevent event propagation when clicking action buttons', () => {
    render(
      <RouteList
        routes={mockRoutes}
        currentRouteId={null}
        onSelectRoute={mockOnSelectRoute}
        onDeleteRoute={mockOnDeleteRoute}
        onEditRoute={mockOnEditRoute}
        onStartTracking={mockOnStartTracking}
        onCreateRoute={mockOnCreateRoute}
      />
    );
    
    // Click delete button
    const deleteButtons = screen.getAllByTitle('Delete Route');
    fireEvent.click(deleteButtons[0]);
    
    // onSelectRoute should not be called when clicking the delete button
    expect(mockOnSelectRoute).not.toHaveBeenCalled();
    
    // Click edit button
    const editButtons = screen.getAllByTitle('Edit Route');
    fireEvent.click(editButtons[0]);
    
    // onSelectRoute should not be called when clicking the edit button
    expect(mockOnSelectRoute).not.toHaveBeenCalled();
    
    // Click start button
    const startButtons = screen.getAllByTitle('Start Tracking');
    fireEvent.click(startButtons[0]);
    
    // onSelectRoute should not be called when clicking the start button
    expect(mockOnSelectRoute).not.toHaveBeenCalled();
  });
  
  test('should render empty state when no routes are provided', () => {
    render(
      <RouteList 
        routes={[]}
        currentRouteId={null}
        onSelectRoute={mockOnSelectRoute}
        onCreateRoute={mockOnCreateRoute}
        onEditRoute={mockOnEditRoute}
        onDeleteRoute={mockOnDeleteRoute}
        onStartTracking={mockOnStartTracking}
        onDuplicateRoute={mockOnDuplicateRoute}
      />
    );
    
    expect(screen.getByText('No routes found')).toBeInTheDocument();
    expect(screen.getByText('Create your first route')).toBeInTheDocument();
  });
  
  test('should render create button', () => {
    render(
      <RouteList 
        routes={mockRoutes}
        currentRouteId={null}
        onSelectRoute={mockOnSelectRoute}
        onCreateRoute={mockOnCreateRoute}
        onEditRoute={mockOnEditRoute}
        onDeleteRoute={mockOnDeleteRoute}
        onStartTracking={mockOnStartTracking}
        onDuplicateRoute={mockOnDuplicateRoute}
      />
    );
    
    // Check if create button is displayed
    expect(screen.getByText('Create New Route')).toBeInTheDocument();
  });
}); 