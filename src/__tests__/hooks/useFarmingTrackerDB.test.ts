import { renderHook, act } from '@testing-library/react';
import { useFarmingTrackerDB } from '../../hooks/useFarmingTrackerDB';
import { setupMockLocalStorage, resetMockLocalStorage, mockRoutes } from '../../testUtils/testHelpers';

// We're using fake-indexeddb/auto in testUtils.ts, so we don't need to mock isIndexedDBAvailable
// Instead, we'll just use the real implementation with the fake IndexedDB

describe('useFarmingTrackerDB', () => {
  beforeEach(() => {
    setupMockLocalStorage();
  });

  afterEach(() => {
    resetMockLocalStorage();
    jest.clearAllMocks();
  });

  test('should initialize with loading state', async () => {
    const { result } = renderHook(() => useFarmingTrackerDB());
    
    // The hook starts with loading state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  test('should load routes', async () => {
    const { result } = renderHook(() => useFarmingTrackerDB());
    
    // Wait for the initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Load routes
    let routes;
    await act(async () => {
      routes = await result.current.loadRoutes();
    });
    
    expect(routes).toEqual([]);
  });

  test('should save and load a route', async () => {
    const { result } = renderHook(() => useFarmingTrackerDB());
    
    // Wait for the initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Save a route
    await act(async () => {
      await result.current.saveRoute(mockRoutes[0]);
    });
    
    // Load routes to verify
    let routes: any[] = [];
    await act(async () => {
      routes = await result.current.loadRoutes() || [];
    });
    
    expect(routes).toHaveLength(1);
    expect(routes[0]).toEqual(mockRoutes[0]);
  });

  test('should update a route', async () => {
    const { result } = renderHook(() => useFarmingTrackerDB());
    
    // Wait for the initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Save a route first
    await act(async () => {
      await result.current.saveRoute(mockRoutes[0]);
    });
    
    // Update the route
    const updatedRoute = { ...mockRoutes[0], name: 'Updated Route Name' };
    await act(async () => {
      await result.current.saveRoute(updatedRoute);
    });
    
    // Load routes to verify
    let routes: any[] = [];
    await act(async () => {
      routes = await result.current.loadRoutes() || [];
    });
    
    expect(routes).toHaveLength(1);
    expect(routes[0].name).toBe('Updated Route Name');
  });

  test('should delete a route', async () => {
    const { result } = renderHook(() => useFarmingTrackerDB());
    
    // Wait for the initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Save a route first
    await act(async () => {
      await result.current.saveRoute(mockRoutes[0]);
    });
    
    // Delete the route
    await act(async () => {
      await result.current.deleteRoute(mockRoutes[0].id);
    });
    
    // Load routes to verify
    let routes;
    await act(async () => {
      routes = await result.current.loadRoutes();
    });
    
    expect(routes).toHaveLength(0);
  });

  // Tests for active tracking functionality
  test('should save and load active tracking', async () => {
    const { result } = renderHook(() => useFarmingTrackerDB());
    
    // Wait for the initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Create mock tracking data
    const mockTracking = {
      routeId: 'route-1',
      startTime: Date.now(),
      currentStopIndex: 0,
      collectedItems: { 'item-1': true, 'item-2': false },
      collectedQuantities: {}
    };
    
    // Save tracking data
    await act(async () => {
      await result.current.saveActiveTracking(mockTracking);
    });
    
    // Load tracking data to verify
    let loadedTracking;
    await act(async () => {
      loadedTracking = await result.current.loadActiveTracking();
    });
    
    expect(loadedTracking).toEqual(mockTracking);
  });
  
  test('should clear active tracking when saving null', async () => {
    const { result } = renderHook(() => useFarmingTrackerDB());
    
    // Wait for the initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Create mock tracking data
    const mockTracking = {
      routeId: 'route-1',
      startTime: Date.now(),
      currentStopIndex: 0,
      collectedItems: { 'item-1': true, 'item-2': false },
      collectedQuantities: {}
    };
    
    // Save tracking data
    await act(async () => {
      await result.current.saveActiveTracking(mockTracking);
    });
    
    // Verify tracking was saved
    let loadedTracking;
    await act(async () => {
      loadedTracking = await result.current.loadActiveTracking();
    });
    expect(loadedTracking).toEqual(mockTracking);
    
    // Clear tracking data
    await act(async () => {
      await result.current.saveActiveTracking(null);
    });
    
    // Verify tracking was cleared
    await act(async () => {
      loadedTracking = await result.current.loadActiveTracking();
    });
    expect(loadedTracking).toBeNull();
  });
  
  test('should handle saving and loading current route ID', async () => {
    const { result } = renderHook(() => useFarmingTrackerDB());
    
    // Wait for the initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Save current route ID
    await act(async () => {
      await result.current.saveCurrentRouteId('route-1');
    });
    
    // Load current route ID to verify
    let currentRouteId;
    await act(async () => {
      currentRouteId = await result.current.loadCurrentRouteId();
    });
    
    expect(currentRouteId).toBe('route-1');
    
    // Clear current route ID
    await act(async () => {
      await result.current.saveCurrentRouteId(null);
    });
    
    // Verify current route ID was cleared
    await act(async () => {
      currentRouteId = await result.current.loadCurrentRouteId();
    });
    
    expect(currentRouteId).toBeNull();
  });

  // Tests for route history functionality
  test('should save and load route history', async () => {
    const { result } = renderHook(() => useFarmingTrackerDB());
    
    // Wait for the initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Create mock history data
    const mockHistory = {
      id: 'history-1',
      routeId: 'route-1',
      routeName: 'Test Route',
      startTime: Date.now() - 3600000, // 1 hour ago
      endTime: Date.now(),
      duration: 3600000, // 1 hour
      collectedItems: { 'item-1': true, 'item-2': false },
      collectedQuantities: { 'item-1': 5, 'item-2': 0 }
    };
    
    // Save history data
    await act(async () => {
      await result.current.saveRouteHistory(mockHistory);
    });
    
    // Load all history data to verify
    let loadedHistories;
    await act(async () => {
      loadedHistories = await result.current.loadAllRouteHistory();
    });
    
    expect(loadedHistories).toHaveLength(1);
    expect(loadedHistories[0]).toEqual(mockHistory);
    
    // Load history for specific route
    let routeHistories;
    await act(async () => {
      routeHistories = await result.current.loadRouteHistoryByRouteId('route-1');
    });
    
    expect(routeHistories).toHaveLength(1);
    expect(routeHistories[0]).toEqual(mockHistory);
  });
  
  test('should delete route history', async () => {
    const { result } = renderHook(() => useFarmingTrackerDB());
    
    // Wait for the initial loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Create mock history data
    const mockHistory = {
      id: 'history-1',
      routeId: 'route-1',
      routeName: 'Test Route',
      startTime: Date.now() - 3600000, // 1 hour ago
      endTime: Date.now(),
      duration: 3600000, // 1 hour
      collectedItems: { 'item-1': true, 'item-2': false },
      collectedQuantities: { 'item-1': 5, 'item-2': 0 }
    };
    
    // Save history data
    await act(async () => {
      await result.current.saveRouteHistory(mockHistory);
    });
    
    // Verify history was saved
    let loadedHistories;
    await act(async () => {
      loadedHistories = await result.current.loadAllRouteHistory();
    });
    expect(loadedHistories).toHaveLength(1);
    
    // Delete history
    await act(async () => {
      await result.current.deleteRouteHistory('history-1');
    });
    
    // Verify history was deleted
    await act(async () => {
      loadedHistories = await result.current.loadAllRouteHistory();
    });
    expect(loadedHistories).toHaveLength(0);
  });

  // Note: The hook doesn't have importRoutes or clearAllRoutes methods,
  // so we'll skip those tests for now
}); 