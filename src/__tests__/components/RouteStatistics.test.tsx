import { render, screen } from '@testing-library/react';
import RouteStatistics from '../../components/RouteStatistics';
import { mockRoutes } from '../../testUtils/testHelpers';

// Mock FontAwesomeIcon
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="mock-icon" />
}));

describe('RouteStatistics', () => {
  test('should render global statistics', () => {
    const { container } = render(
      <RouteStatistics
        routes={mockRoutes}
        selectedRouteId={null}
      />
    );
    
    // Check if global stats are displayed
    expect(screen.getByText('Total Routes')).toBeInTheDocument();
    expect(screen.getByText('Total Stops')).toBeInTheDocument();
    expect(screen.getByText('Total Items')).toBeInTheDocument();
    expect(screen.getByText('Completed Runs')).toBeInTheDocument();
    
    // Check if the values are correct by finding the specific elements
    const statValues = container.querySelectorAll('.stat-value');
    expect(statValues[0].textContent).toBe('2'); // Total Routes
    expect(statValues[1].textContent).toBe('1'); // Total Stops
    expect(statValues[2].textContent).toBe('1'); // Total Items
    expect(statValues[3].textContent).toBe('2'); // Completed Runs
  });
  
  test('should render selected route statistics', () => {
    render(
      <RouteStatistics
        routes={mockRoutes}
        selectedRouteId="route-1"
      />
    );
    
    // Check if route-specific stats are displayed
    expect(screen.getByText('Test Route 1 Statistics')).toBeInTheDocument();
    
    // Check for the presence of specific sections in the route stats
    const routeStatsHeadings = screen.getAllByText(/Stops|Items|Completed Runs|Item Types/);
    expect(routeStatsHeadings.length).toBeGreaterThanOrEqual(4);
    
    // Check if the values are correct
    expect(screen.getByText('Bobblehead')).toBeInTheDocument(); // Item type
  });
  
  test('should handle empty routes array', () => {
    const { container } = render(
      <RouteStatistics
        routes={[]}
        selectedRouteId={null}
      />
    );
    
    // Check if global stats are displayed with zeros
    expect(screen.getByText('Total Routes')).toBeInTheDocument();
    
    // Check if the values are all zeros
    const statValues = container.querySelectorAll('.stat-value');
    expect(statValues[0].textContent).toBe('0'); // Total Routes
  });
  
  test('should handle invalid selectedRouteId', () => {
    render(
      <RouteStatistics
        routes={mockRoutes}
        selectedRouteId="non-existent-id"
      />
    );
    
    // Check if only global stats are displayed
    expect(screen.getByText('Total Routes')).toBeInTheDocument();
    expect(screen.queryByText(/Statistics/)).not.toBeInTheDocument();
  });
}); 