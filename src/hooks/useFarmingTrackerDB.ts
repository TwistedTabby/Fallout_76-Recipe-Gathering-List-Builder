import { useState, useEffect, useCallback } from 'react';
import { openDB } from 'idb';
import { FarmingTrackerDB, Route, RouteProgress, RouteHistory } from '../types/farmingTracker';
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
    
    return openDB<FarmingTrackerDB>('farming-tracker-db', 4, {
      upgrade(db, oldVersion) {
        
        // If this is a fresh database (version 0)
        if (oldVersion < 1) {
          // Create a store for routes
          const routeStore = db.createObjectStore('routes', {
            keyPath: 'id'
          });
          routeStore.createIndex('by-name', 'name');

          // Create a store for current route ID
          db.createObjectStore('currentRouteId', {
            keyPath: 'id'
          });

          // Create a store for item inventory
          db.createObjectStore('itemInventory', {
            keyPath: 'name'
          });
        }
        
        // If upgrading from version 1 to 2, delete and recreate the activeTracking store
        if (oldVersion < 2) {
          // Delete the old activeTracking store if it exists
          if (db.objectStoreNames.contains('activeTracking')) {
            db.deleteObjectStore('activeTracking');
          }
          
          // Create a new activeTracking store with the correct keyPath
          db.createObjectStore('activeTracking', {
            keyPath: 'id'
          });
        }

        // If upgrading from version 2 to 3, change the keyPath from 'id' to 'routeId'
        if (oldVersion < 3) {
          // Delete the old activeTracking store if it exists
          if (db.objectStoreNames.contains('activeTracking')) {
            db.deleteObjectStore('activeTracking');
          }
          
          // Create a new activeTracking store with 'routeId' as the keyPath
          db.createObjectStore('activeTracking', {
            keyPath: 'routeId'
          });
        }

        // If upgrading from version 3 to 4, add the routeHistory store
        if (oldVersion < 4) {
          // Create a store for route history
          const historyStore = db.createObjectStore('routeHistory', {
            keyPath: 'id'
          });
          
          // Create indexes for querying history by routeId and date
          historyStore.createIndex('by-routeId', 'routeId');
          historyStore.createIndex('by-date', 'startTime');
        }
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
        // Ensure we have a valid routeId as it's the keyPath
        if (!tracking.routeId) {
          throw new Error('Cannot save tracking without a routeId');
        }
        
        // Save the tracking data directly
        await db.put('activeTracking', tracking);
        
        // Also save to localStorage as backup
        localStorage.setItem('activeTracking', JSON.stringify(tracking));
      } else {
        // If tracking is null, delete from both storages
        // Get all active tracking entries to delete them
        const allTracking = await db.getAll('activeTracking');
        for (const track of allTracking) {
          await db.delete('activeTracking', track.routeId);
        }
        localStorage.removeItem('activeTracking');
      }
    } catch (error) {
      console.error('Error saving active tracking to IndexedDB:', error);
      
      // Try localStorage as fallback
      if (tracking) {
        try {
          localStorage.setItem('activeTracking', JSON.stringify(tracking));
        } catch (localStorageError) {
          console.error('Error saving to localStorage fallback:', localStorageError);
          throw localStorageError;
        }
      } else {
        try {
          localStorage.removeItem('activeTracking');
        } catch (localStorageError) {
          console.error('Error removing from localStorage fallback:', localStorageError);
        }
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
      
      // Get all active tracking entries (should be only one)
      const allTracking = await db.getAll('activeTracking');
      
      if (allTracking && allTracking.length > 0) {
        return allTracking[0];
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

  /**
   * Save a route history entry
   * @param history The route history entry to save
   */
  const saveRouteHistory = useCallback(async (history: RouteHistory): Promise<void> => {
    try {
      const db = await initDB();
      await db.put('routeHistory', history);
      
      // Also save to localStorage as backup
      try {
        const savedHistories = localStorage.getItem('routeHistories');
        let histories = savedHistories ? JSON.parse(savedHistories) : [];
        
        // Check if this history entry already exists
        const index = histories.findIndex((h: RouteHistory) => h.id === history.id);
        
        if (index >= 0) {
          histories[index] = history;
        } else {
          histories.push(history);
        }
        
        // Limit the number of histories stored in localStorage to prevent exceeding storage limits
        if (histories.length > 100) {
          histories = histories.slice(-100); // Keep only the most recent 100 entries
        }
        
        localStorage.setItem('routeHistories', JSON.stringify(histories));
      } catch (localStorageError) {
        console.error('Error saving history to localStorage backup:', localStorageError);
      }
    } catch (error) {
      console.error('Error saving route history to IndexedDB:', error);
      
      // Fallback to localStorage
      try {
        const savedHistories = localStorage.getItem('routeHistories');
        let histories = savedHistories ? JSON.parse(savedHistories) : [];
        
        const index = histories.findIndex((h: RouteHistory) => h.id === history.id);
        
        if (index >= 0) {
          histories[index] = history;
        } else {
          histories.push(history);
        }
        
        localStorage.setItem('routeHistories', JSON.stringify(histories));
      } catch (localStorageError) {
        console.error('Error saving to localStorage fallback:', localStorageError);
        throw localStorageError;
      }
    }
  }, [initDB]);

  /**
   * Load all route history entries
   * @returns A promise that resolves to an array of route history entries
   */
  const loadAllRouteHistory = useCallback(async (): Promise<RouteHistory[]> => {
    try {
      const db = await initDB();
      const allHistory = await db.getAll('routeHistory');
      return allHistory;
    } catch (error) {
      console.error('Error loading route history from IndexedDB:', error);
      
      // Fallback to localStorage
      try {
        const savedHistories = localStorage.getItem('routeHistories');
        if (savedHistories) {
          return JSON.parse(savedHistories);
        }
      } catch (localStorageError) {
        console.error('Error loading from localStorage fallback:', localStorageError);
      }
      
      return [];
    }
  }, [initDB]);

  /**
   * Load route history entries for a specific route
   * @param routeId The ID of the route to load history for
   * @returns A promise that resolves to an array of route history entries for the specified route
   */
  const loadRouteHistoryByRouteId = useCallback(async (routeId: string): Promise<RouteHistory[]> => {
    try {
      const db = await initDB();
      const index = db.transaction('routeHistory').store.index('by-routeId');
      const history = await index.getAll(routeId);
      return history;
    } catch (error) {
      console.error(`Error loading route history for route ${routeId} from IndexedDB:`, error);
      
      // Fallback to localStorage
      try {
        const savedHistories = localStorage.getItem('routeHistories');
        if (savedHistories) {
          const histories = JSON.parse(savedHistories);
          return histories.filter((h: RouteHistory) => h.routeId === routeId);
        }
      } catch (localStorageError) {
        console.error('Error loading from localStorage fallback:', localStorageError);
      }
      
      return [];
    }
  }, [initDB]);

  /**
   * Delete a route history entry
   * @param historyId The ID of the history entry to delete
   */
  const deleteRouteHistory = useCallback(async (historyId: string): Promise<void> => {
    try {
      const db = await initDB();
      await db.delete('routeHistory', historyId);
      
      // Also delete from localStorage
      try {
        const savedHistories = localStorage.getItem('routeHistories');
        if (savedHistories) {
          const histories = JSON.parse(savedHistories);
          const updatedHistories = histories.filter((h: RouteHistory) => h.id !== historyId);
          localStorage.setItem('routeHistories', JSON.stringify(updatedHistories));
        }
      } catch (localStorageError) {
        console.error('Error updating localStorage after deletion:', localStorageError);
      }
    } catch (error) {
      console.error(`Error deleting route history ${historyId} from IndexedDB:`, error);
      
      // Fallback to localStorage
      try {
        const savedHistories = localStorage.getItem('routeHistories');
        if (savedHistories) {
          const histories = JSON.parse(savedHistories);
          const updatedHistories = histories.filter((h: RouteHistory) => h.id !== historyId);
          localStorage.setItem('routeHistories', JSON.stringify(updatedHistories));
        }
      } catch (localStorageError) {
        console.error('Error deleting from localStorage fallback:', localStorageError);
        throw localStorageError;
      }
    }
  }, [initDB]);

  /**
   * Delete all route history entries for a specific route
   * @param routeId The ID of the route to delete all history for
   */
  const deleteAllRouteHistoryByRouteId = useCallback(async (routeId: string): Promise<void> => {
    try {
      const db = await initDB();
      const index = db.transaction('routeHistory', 'readwrite').store.index('by-routeId');
      const histories = await index.getAll(routeId);
      
      // Delete each history entry
      const tx = db.transaction('routeHistory', 'readwrite');
      for (const history of histories) {
        await tx.store.delete(history.id);
      }
      await tx.done;
      
      // Also delete from localStorage
      try {
        const savedHistories = localStorage.getItem('routeHistories');
        if (savedHistories) {
          const allHistories = JSON.parse(savedHistories);
          const updatedHistories = allHistories.filter((h: RouteHistory) => h.routeId !== routeId);
          localStorage.setItem('routeHistories', JSON.stringify(updatedHistories));
        }
      } catch (localStorageError) {
        console.error('Error updating localStorage after deletion:', localStorageError);
      }
    } catch (error) {
      console.error(`Error deleting all route history for route ${routeId} from IndexedDB:`, error);
      
      // Fallback to localStorage
      try {
        const savedHistories = localStorage.getItem('routeHistories');
        if (savedHistories) {
          const histories = JSON.parse(savedHistories);
          const updatedHistories = histories.filter((h: RouteHistory) => h.routeId !== routeId);
          localStorage.setItem('routeHistories', JSON.stringify(updatedHistories));
        }
      } catch (localStorageError) {
        console.error('Error deleting from localStorage fallback:', localStorageError);
        throw localStorageError;
      }
    }
  }, [initDB]);

  /**
   * Get a route by its ID
   * @param routeId The ID of the route to retrieve
   * @returns A promise that resolves to the route or null if not found
   */
  const getRouteById = useCallback(async (routeId: string): Promise<Route | null> => {
    try {
      const db = await initDB();
      const route = await db.get('routes', routeId);
      return route || null;
    } catch (error) {
      console.error(`Error getting route ${routeId} from IndexedDB:`, error);
      
      // Fallback to localStorage
      try {
        const savedRoutes = localStorage.getItem('farmingRoutes');
        if (savedRoutes) {
          const routes = JSON.parse(savedRoutes);
          const route = routes.find((r: Route) => r.id === routeId);
          return route || null;
        }
      } catch (localStorageError) {
        console.error('Error loading from localStorage fallback:', localStorageError);
      }
      
      return null;
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
    loadActiveTracking,
    saveRouteHistory,
    loadAllRouteHistory,
    loadRouteHistoryByRouteId,
    deleteRouteHistory,
    deleteAllRouteHistoryByRouteId,
    getRouteById
  };
} 