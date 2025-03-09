import { useState, useEffect, useCallback } from 'react';
import { openDB } from 'idb';
import { FarmingTrackerDB, Route, RouteProgress } from '../types/farmingTracker';
import { isIndexedDBAvailable } from '../utils/farmingTrackerUtils';

/**
 * Custom hook for managing database operations in the Farming Tracker application
 */
export function useFarmingTrackerDB() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStorageReliable, setIsStorageReliable] = useState(true);

  /**
   * Initialize the database
   * @returns A promise that resolves to the database instance
   */
  const initDB = useCallback(async () => {
    if (!isIndexedDBAvailable()) {
      throw new Error('IndexedDB is not available in this browser');
    }
    
    return openDB<FarmingTrackerDB>('farming-tracker-db', 1, {
      upgrade(db) {
        // Create a store for routes
        const routeStore = db.createObjectStore('routes', {
          keyPath: 'id'
        });
        routeStore.createIndex('by-name', 'name');

        // Create a store for active tracking
        db.createObjectStore('activeTracking', {
          keyPath: 'routeId'
        });

        // Create a store for current route ID
        db.createObjectStore('currentRouteId', {
          keyPath: 'id'
        });

        // Create a store for item inventory
        db.createObjectStore('itemInventory', {
          keyPath: 'name'
        });
      }
    });
  }, []);

  /**
   * Check if storage is available and reliable
   */
  const checkStorage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    if (isIndexedDBAvailable()) {
      try {
        const db = await initDB();
        await db.get('routes', 'test-connection');
        setIsStorageReliable(true);
      } catch (error) {
        console.error('IndexedDB test failed:', error);
        setIsStorageReliable(false);
        setError(error instanceof Error ? error : new Error('Unknown error testing IndexedDB'));
      }
    } else {
      setIsStorageReliable(false);
      setError(new Error('IndexedDB is not available'));
    }
    
    setIsLoading(false);
  }, [initDB]);

  // Check storage on hook initialization
  useEffect(() => {
    checkStorage();
  }, [checkStorage]);

  /**
   * Load all routes from the database
   * @returns A promise that resolves to an array of routes
   */
  const loadRoutes = useCallback(async (): Promise<Route[]> => {
    try {
      const db = await initDB();
      const allRoutes = await db.getAll('routes');
      return allRoutes;
    } catch (error) {
      console.error('Error loading routes from IndexedDB:', error);
      
      // Fallback to localStorage
      try {
        const savedRoutes = localStorage.getItem('farmingRoutes');
        if (savedRoutes) {
          return JSON.parse(savedRoutes);
        }
      } catch (localStorageError) {
        console.error('Error loading from localStorage fallback:', localStorageError);
      }
      
      return [];
    }
  }, [initDB]);

  /**
   * Save a route to the database
   * @param route The route to save
   */
  const saveRoute = useCallback(async (route: Route): Promise<void> => {
    try {
      const db = await initDB();
      await db.put('routes', route);
      
      // Also save to localStorage as backup
      const allRoutes = await loadRoutes();
      const updatedRoutes = allRoutes.map(r => r.id === route.id ? route : r);
      if (!updatedRoutes.some(r => r.id === route.id)) {
        updatedRoutes.push(route);
      }
      localStorage.setItem('farmingRoutes', JSON.stringify(updatedRoutes));
    } catch (error) {
      console.error('Error saving route to IndexedDB:', error);
      
      // Fallback to localStorage
      try {
        const savedRoutes = localStorage.getItem('farmingRoutes');
        let routes = savedRoutes ? JSON.parse(savedRoutes) : [];
        const index = routes.findIndex((r: Route) => r.id === route.id);
        
        if (index >= 0) {
          routes[index] = route;
        } else {
          routes.push(route);
        }
        
        localStorage.setItem('farmingRoutes', JSON.stringify(routes));
      } catch (localStorageError) {
        console.error('Error saving to localStorage fallback:', localStorageError);
        throw localStorageError;
      }
    }
  }, [initDB, loadRoutes]);

  /**
   * Delete a route from the database
   * @param routeId The ID of the route to delete
   */
  const deleteRoute = useCallback(async (routeId: string): Promise<void> => {
    try {
      const db = await initDB();
      await db.delete('routes', routeId);
      
      // Also update localStorage
      const savedRoutes = localStorage.getItem('farmingRoutes');
      if (savedRoutes) {
        const routes = JSON.parse(savedRoutes);
        const updatedRoutes = routes.filter((r: Route) => r.id !== routeId);
        localStorage.setItem('farmingRoutes', JSON.stringify(updatedRoutes));
      }
    } catch (error) {
      console.error('Error deleting route from IndexedDB:', error);
      
      // Fallback to localStorage
      try {
        const savedRoutes = localStorage.getItem('farmingRoutes');
        if (savedRoutes) {
          const routes = JSON.parse(savedRoutes);
          const updatedRoutes = routes.filter((r: Route) => r.id !== routeId);
          localStorage.setItem('farmingRoutes', JSON.stringify(updatedRoutes));
        }
      } catch (localStorageError) {
        console.error('Error updating localStorage fallback:', localStorageError);
        throw localStorageError;
      }
    }
  }, [initDB]);

  /**
   * Save the current route ID
   * @param routeId The ID of the current route
   */
  const saveCurrentRouteId = useCallback(async (routeId: string | null): Promise<void> => {
    try {
      const db = await initDB();
      
      if (routeId) {
        await db.put('currentRouteId', { id: 'current', value: routeId });
        localStorage.setItem('currentRouteId', routeId);
      } else {
        await db.delete('currentRouteId', 'current');
        localStorage.removeItem('currentRouteId');
      }
    } catch (error) {
      console.error('Error saving current route ID to IndexedDB:', error);
      
      // Fallback to localStorage
      try {
        if (routeId) {
          localStorage.setItem('currentRouteId', routeId);
        } else {
          localStorage.removeItem('currentRouteId');
        }
      } catch (localStorageError) {
        console.error('Error saving to localStorage fallback:', localStorageError);
        throw localStorageError;
      }
    }
  }, [initDB]);

  /**
   * Load the current route ID
   * @returns A promise that resolves to the current route ID or null
   */
  const loadCurrentRouteId = useCallback(async (): Promise<string | null> => {
    try {
      const db = await initDB();
      const currentRouteIdObj = await db.get('currentRouteId', 'current');
      
      if (currentRouteIdObj) {
        return currentRouteIdObj.value;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading current route ID from IndexedDB:', error);
      
      // Fallback to localStorage
      try {
        const currentRouteId = localStorage.getItem('currentRouteId');
        return currentRouteId;
      } catch (localStorageError) {
        console.error('Error loading from localStorage fallback:', localStorageError);
        return null;
      }
    }
  }, [initDB]);

  /**
   * Save active tracking data
   * @param tracking The tracking data to save
   */
  const saveActiveTracking = useCallback(async (tracking: RouteProgress | null): Promise<void> => {
    try {
      const db = await initDB();
      
      if (tracking) {
        // Add the id property for IndexedDB
        await db.put('activeTracking', { ...tracking, id: 'current' });
        localStorage.setItem('activeTracking', JSON.stringify(tracking));
      } else {
        // If tracking is null, delete from both storages
        await db.delete('activeTracking', 'current');
        localStorage.removeItem('activeTracking');
      }
    } catch (error) {
      console.error('Error saving active tracking to IndexedDB:', error);
      
      // Fallback to localStorage
      try {
        if (tracking) {
          localStorage.setItem('activeTracking', JSON.stringify(tracking));
        } else {
          localStorage.removeItem('activeTracking');
        }
      } catch (localStorageError) {
        console.error('Error saving to localStorage fallback:', localStorageError);
        throw localStorageError;
      }
    }
  }, [initDB]);

  /**
   * Load active tracking data
   * @returns A promise that resolves to the active tracking data or null
   */
  const loadActiveTracking = useCallback(async (): Promise<RouteProgress | null> => {
    try {
      const db = await initDB();
      
      // Get all active tracking entries and find the most recent one
      const activeTrackingEntries = await db.getAll('activeTracking');
      const activeTrackingObj = activeTrackingEntries.length > 0 ? activeTrackingEntries[0] : null;
      
      if (activeTrackingObj) {
        // Remove the id property before returning
        const { id, ...trackingData } = activeTrackingObj;
        return trackingData as RouteProgress;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading active tracking from IndexedDB:', error);
      
      // Fallback to localStorage
      try {
        const savedTracking = localStorage.getItem('activeTracking');
        if (savedTracking) {
          return JSON.parse(savedTracking);
        }
        return null;
      } catch (localStorageError) {
        console.error('Error loading from localStorage fallback:', localStorageError);
        return null;
      }
    }
  }, [initDB]);

  return {
    initDB,
    isLoading,
    error,
    isStorageReliable,
    checkStorage,
    loadRoutes,
    saveRoute,
    deleteRoute,
    saveCurrentRouteId,
    loadCurrentRouteId,
    saveActiveTracking,
    loadActiveTracking
  };
} 