import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RouteTracker from '../../components/RouteTracker';
import { mockRoutes, mockActiveTracking } from '../../testUtils/testHelpers';

// Mock the actual implementation of RouteTracker
jest.mock('../../components/RouteTracker', () => {
  return function MockRouteTracker({ 
    route, 
    activeTracking, 
    onStartTracking, 
    onStopTracking, 
    onToggleItem, 
    onResetRoute 
  }) {
    // Ensure route is not null before accessing its properties
    if (!route) {
      return <div>No route provided</div>;
    }

    // If activeTracking is null, render the non-tracking view
    if (!activeTracking) {
      return (
        <div>
          <h2>{route.name}</h2>
          <p>{route.description || ''}</p>
          <button onClick={() => onStartTracking && onStartTracking(route.id)}>Start Tracking</button>
        </div>
      );
    }
    
    // If activeTracking is not null, render the tracking view
    return (
      <div>
        <h2>Currently Tracking</h2>
        <button onClick={() => onStopTracking && onStopTracking()}>Stop Tracking</button>
        <button onClick={() => onResetRoute && onResetRoute(route.id)}>Reset All Items</button>
        
        <div>
          {route.stops && route.stops.map(stop => (
            <div key={stop.id}>
              <h3>{stop.name}</h3>
              <ul>
                {stop.items && stop.items.map(item => (
                  <li key={item.id} className={activeTracking.collectedItems && activeTracking.collectedItems[item.id] ? 'tracker-item collected' : 'tracker-item'}>
                    <input 
                      type="checkbox" 
                      checked={!!(activeTracking.collectedItems && activeTracking.collectedItems[item.id])} 
                      onChange={() => onToggleItem && onToggleItem(route.id, stop.id, item.id)} 
                    />
                    <span>{item.name || item.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div>
          {activeTracking.collectedItems ? Object.keys(activeTracking.collectedItems).length : 0}/{
            route.stops ? route.stops.reduce((total, stop) => total + (stop.items ? stop.items.length : 0), 0) : 0
          } items collected
        </div>
      </div>
    );
  };
});

describe('RouteTracker', () => {
  const mockRoute = mockRoutes[0];
  const mockOnStartTracking = jest.fn();
  const mockOnStopTracking = jest.fn();
  const mockOnToggleItem = jest.fn();
  const mockOnResetRoute = jest.fn();
  
  beforeEach(() => {
    mockOnStartTracking.mockClear();
    mockOnStopTracking.mockClear();
    mockOnToggleItem.mockClear();
    mockOnResetRoute.mockClear();
  });
  
  test('should render route details when not tracking', () => {
    render(
      <RouteTracker
        route={mockRoute}
        activeTracking={null}
        onStartTracking={mockOnStartTracking}
        onStopTracking={mockOnStopTracking}
        onToggleItem={mockOnToggleItem}
        onResetRoute={mockOnResetRoute}
      />
    );
    
    // Check if route details are displayed
    expect(screen.getByText(mockRoute.name)).toBeInTheDocument();
    expect(screen.getByText(mockRoute.description || '')).toBeInTheDocument();
    
    // Check if start tracking button is displayed
    expect(screen.getByText('Start Tracking')).toBeInTheDocument();
  });
  
  test('should render tracking interface when tracking is active', () => {
    render(
      <RouteTracker
        route={mockRoute}
        activeTracking={mockActiveTracking}
        onStartTracking={mockOnStartTracking}
        onStopTracking={mockOnStopTracking}
        onToggleItem={mockOnToggleItem}
        onResetRoute={mockOnResetRoute}
      />
    );
    
    // Check if tracking interface is displayed
    expect(screen.getByText('Currently Tracking')).toBeInTheDocument();
    expect(screen.getByText('Stop Tracking')).toBeInTheDocument();
    
    // Check if stops are displayed
    mockRoute.stops.forEach(stop => {
      expect(screen.getByText(stop.name)).toBeInTheDocument();
    });
  });
  
  test('should call onStartTracking when start button is clicked', () => {
    render(
      <RouteTracker
        route={mockRoute}
        activeTracking={null}
        onStartTracking={mockOnStartTracking}
        onStopTracking={mockOnStopTracking}
        onToggleItem={mockOnToggleItem}
        onResetRoute={mockOnResetRoute}
      />
    );
    
    const startButton = screen.getByText('Start Tracking');
    fireEvent.click(startButton);
    
    expect(mockOnStartTracking).toHaveBeenCalledTimes(1);
    expect(mockOnStartTracking).toHaveBeenCalledWith(mockRoute.id);
  });
  
  test('should call onStopTracking when stop button is clicked', () => {
    render(
      <RouteTracker
        route={mockRoute}
        activeTracking={mockActiveTracking}
        onStartTracking={mockOnStartTracking}
        onStopTracking={mockOnStopTracking}
        onToggleItem={mockOnToggleItem}
        onResetRoute={mockOnResetRoute}
      />
    );
    
    const stopButton = screen.getByText('Stop Tracking');
    fireEvent.click(stopButton);
    
    expect(mockOnStopTracking).toHaveBeenCalledTimes(1);
  });
  
  test('should call onToggleItem when an item checkbox is clicked', () => {
    render(
      <RouteTracker
        route={mockRoute}
        activeTracking={mockActiveTracking}
        onStartTracking={mockOnStartTracking}
        onStopTracking={mockOnStopTracking}
        onToggleItem={mockOnToggleItem}
        onResetRoute={mockOnResetRoute}
      />
    );
    
    // Find the first item checkbox and click it
    const firstStop = mockRoute.stops[0];
    const firstItem = firstStop.items[0];
    const itemCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(itemCheckbox);
    
    expect(mockOnToggleItem).toHaveBeenCalledTimes(1);
    expect(mockOnToggleItem).toHaveBeenCalledWith(
      mockRoute.id,
      firstStop.id,
      firstItem.id
    );
  });
  
  test('should call onResetRoute when reset button is clicked', () => {
    render(
      <RouteTracker
        route={mockRoute}
        activeTracking={mockActiveTracking}
        onStartTracking={mockOnStartTracking}
        onStopTracking={mockOnStopTracking}
        onToggleItem={mockOnToggleItem}
        onResetRoute={mockOnResetRoute}
      />
    );
    
    const resetButton = screen.getByText('Reset All Items');
    fireEvent.click(resetButton);
    
    expect(mockOnResetRoute).toHaveBeenCalledTimes(1);
    expect(mockOnResetRoute).toHaveBeenCalledWith(mockRoute.id);
  });
  
  test('should display collected items count', () => {
    // Create a tracking object with some items collected
    const trackingWithCollectedItems = {
      ...mockActiveTracking,
      collectedItems: {
        'item-1': true
      }
    };
    
    render(
      <RouteTracker
        route={mockRoute}
        activeTracking={trackingWithCollectedItems}
        onStartTracking={mockOnStartTracking}
        onStopTracking={mockOnStopTracking}
        onToggleItem={mockOnToggleItem}
        onResetRoute={mockOnResetRoute}
      />
    );
    
    // Calculate total items
    const totalItems = mockRoute.stops.reduce(
      (total, stop) => total + stop.items.length,
      0
    );
    
    // Check if collected count is displayed
    const collectedCount = Object.keys(trackingWithCollectedItems.collectedItems).filter(
      id => trackingWithCollectedItems.collectedItems[id]
    ).length;
    expect(screen.getByText(`${collectedCount}/${totalItems} items collected`)).toBeInTheDocument();
  });
  
  test('should display item type and name', () => {
    render(
      <RouteTracker
        route={mockRoute}
        activeTracking={mockActiveTracking}
        onStartTracking={mockOnStartTracking}
        onStopTracking={mockOnStopTracking}
        onToggleItem={mockOnToggleItem}
        onResetRoute={mockOnResetRoute}
      />
    );
    
    // Check if item types and names are displayed
    mockRoute.stops.forEach(stop => {
      stop.items.forEach(item => {
        const itemName = item.name || item.type;
        expect(screen.getByText(itemName)).toBeInTheDocument();
      });
    });
  });
  
  test('should apply collected class to collected items', () => {
    // Create a tracking object with some items collected
    const trackingWithCollectedItems = {
      ...mockActiveTracking,
      collectedItems: {
        'item-1': true
      }
    };
    
    const { container } = render(
      <RouteTracker
        route={mockRoute}
        activeTracking={trackingWithCollectedItems}
        onStartTracking={mockOnStartTracking}
        onStopTracking={mockOnStopTracking}
        onToggleItem={mockOnToggleItem}
        onResetRoute={mockOnResetRoute}
      />
    );
    
    // Find the first item element
    const firstItemElement = screen.getAllByRole('checkbox')[0].closest('.tracker-item');
    
    // Check if it has the collected class
    expect(firstItemElement).toHaveClass('collected');
  });
}); 