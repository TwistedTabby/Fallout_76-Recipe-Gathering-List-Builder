import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { openDB, DBSchema } from 'idb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faList, 
  faEdit, 
  faPlay, 
  faTrash, 
  faTimes, 
  faArrowLeft, 
  faArrowRight,
  faDownload,
  faUpload,
  faEllipsisV,
  faHistory,
  faPlus
} from '@fortawesome/free-solid-svg-icons';

// Define the database schema
interface FarmingTrackerDB extends DBSchema {
  routes: {
    key: string;
    value: Route;
    indexes: { 'by-name': string };
  };
  activeTracking: {
    key: string;
    value: RouteProgress & { id?: string };
  };
  currentRouteId: {
    key: string;
    value: { id: string; value: string };
  };
  itemInventory: {
    key: string; // item name
    value: {
      name: string;
      currentAmount: number;
      lastUpdated: number;
    };
  };
}

// Check if IndexedDB is available
const isIndexedDBAvailable = () => {
  try {
    // This will throw an error in browsers where IndexedDB is not available
    // or is disabled (e.g., in private browsing mode in some browsers)
    return typeof window !== 'undefined' && 
           'indexedDB' in window && 
           window.indexedDB !== null;
  } catch (e) {
    return false;
  }
};

// Initialize the database
const initDB = async () => {
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
};

// Types
interface Item {
  id: string;
  type: string;
  name: string;
  quantity: number;
  collected: boolean;
  description?: string; // Optional description field for location information
}

interface Stop {
  id: string;
  name: string;
  description: string;
  items: Item[];
  collectData?: boolean; // Flag to indicate if baseline inventory data should be collected
}

interface Route {
  id: string;
  name: string;
  description: string;
  stops: Stop[];
  completedRuns?: number; // Track the number of completed runs
  autoInventoryChecks?: boolean; // Flag to indicate if inventory should be checked before first and after last stop
}

// Add these new interfaces after the existing interfaces
interface RouteProgress {
  routeId: string;
  startTime: number;
  currentStopIndex: number;
  collectedItems: Record<string, boolean>; // Maps item IDs to collection status
  notes: string;
  inventoryData?: {
    preRoute?: Record<string, number>; // Maps item names to pre-route inventory counts
    postRoute?: Record<string, number>; // Maps item names to post-route inventory counts
    routeInventory?: Record<string, number>; // Current inventory levels by item name
    stops?: Record<string, {
      preStop?: Record<string, number>; // Maps item names to pre-stop inventory counts
      postStop?: Record<string, number>; // Maps item names to post-stop inventory counts
      addedAmount?: Record<string, number>; // Amount added during this stop by item name
    }>;
  };
}

// Default item types
const DEFAULT_ITEM_TYPES = [
  'Bobblehead',
  'Magazine',
  'Event',
  'Consumable',
  'Harvestable',
  'Task'
];

// Item type rules
const ITEM_TYPES_REQUIRING_NAME = ['Event', 'Task', 'Harvestable', 'Consumable'];
const ITEM_TYPES_WITH_DEFAULT_NAME = ['Bobblehead', 'Magazine'];

// Utility functions for item type rules
const requiresCustomName = (itemType: string): boolean => {
  return ITEM_TYPES_REQUIRING_NAME.includes(itemType);
};

const usesDefaultName = (itemType: string): boolean => {
  return ITEM_TYPES_WITH_DEFAULT_NAME.includes(itemType);
};

const getItemNameOrDefault = (itemName: string, itemType: string): string => {
  // If the item type uses a default name (like Bobblehead or Magazine), return the type as the name
  if (usesDefaultName(itemType)) {
    return itemType;
  }
  // Otherwise, return the provided name or the type as fallback
  return itemName.trim() || itemType;
};

const validateItemName = (itemName: string, itemType: string): boolean => {
  // If the item type requires a custom name, make sure one is provided
  if (requiresCustomName(itemType)) {
    return !!itemName.trim();
  }
  // For types that use default names, no validation needed
  return true;
};

const FarmingTracker: React.FC = () => {
  // Add a ref for the focus recovery button
  const focusRecoveryRef = useRef<HTMLButtonElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // State for routes
  const [routes, setRoutes] = useState<Route[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  
  // State for route creation
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteDescription, setNewRouteDescription] = useState('');
  const [newRouteAutoInventoryChecks, setNewRouteAutoInventoryChecks] = useState(false);
  
  // State for route editing
  const [editingRouteName, setEditingRouteName] = useState('');
  const [editingRouteDescription, setEditingRouteDescription] = useState('');
  const [editingRouteAutoInventoryChecks, setEditingRouteAutoInventoryChecks] = useState(false);
  const [isEditingRouteDetails, setIsEditingRouteDetails] = useState(false);
  
  // State for stop creation
  const [newStopName, setNewStopName] = useState('');
  const [newStopDescription, setNewStopDescription] = useState('');
  const [newStopCollectData, setNewStopCollectData] = useState(false);
  
  // State for item creation
  const [newItemType, setNewItemType] = useState(DEFAULT_ITEM_TYPES[0]);
  const [newItemNames, setNewItemNames] = useState<Record<string, string>>({});
  const [newItemDescriptions, setNewItemDescriptions] = useState<Record<string, string>>({});
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  
  // UI state
  const [isReorderingMode, setIsReorderingMode] = useState(false);
  const [isReorderingItems, setIsReorderingItems] = useState(false);
  const [isEditingStop, setIsEditingStop] = useState<string | null>(null);
  const [editStopName, setEditStopName] = useState('');
  const [editStopDescription, setEditStopDescription] = useState('');
  const [editStopCollectData, setEditStopCollectData] = useState(false);
  
  // Item editing state
  const [isEditingItem, setIsEditingItem] = useState<{stopId: string, itemId: string} | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemType, setEditItemType] = useState('');
  const [editItemDescription, setEditItemDescription] = useState('');
  const [editItemQuantity, setEditItemQuantity] = useState(1);

  // Tracking state
  const [activeTracking, setActiveTracking] = useState<RouteProgress | null>(null);
  const [trackingNotes, setTrackingNotes] = useState<string>('');
  const [inventoryInputMode, setInventoryInputMode] = useState<'pre' | 'post' | 'pre-stop' | 'post-stop' | null>(null);
  const [inventoryInputValues, setInventoryInputValues] = useState<Record<string, number>>({});
  const [currentStopId, setCurrentStopId] = useState<string | null>(null);

  // Add state for expanded routes
  const [expandedRoutes, setExpandedRoutes] = useState<Record<string, boolean>>({});

  // Add notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  }>({
    message: '',
    type: 'info',
    visible: false
  });

  // Add state for custom confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  // Add state for expanded actions
  const [expandedActions, setExpandedActions] = useState<Record<string, boolean>>({});

  // Add state for Create new Route section visibility
  const [isCreateRouteExpanded, setIsCreateRouteExpanded] = useState(true);

  // Refs
  const routeNameInputRef = useRef<HTMLInputElement>(null);
  const stopNameInputRef = useRef<HTMLInputElement>(null);
  const itemNameInputRef = useRef<HTMLInputElement>(null);

  // Update isCreateRouteExpanded based on routes existence
  useEffect(() => {
    setIsCreateRouteExpanded(routes.length === 0);
  }, [routes]);

  // Function to show a custom confirm dialog
  const customConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        message,
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };
  
  // Function to show notifications
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({
      message,
      type,
      visible: true
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Helper function to handle keyboard events
  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    // Don't trigger action on Enter key in textareas to allow for multiline input
    if (e.key === 'Enter' && !e.shiftKey && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
      action();
    }
  };

  // Ensure focus recovery button is properly initialized
  useEffect(() => {
    // Make sure the focus recovery button is properly set up
    if (focusRecoveryRef.current) {
      focusRecoveryRef.current.tabIndex = -1;
    }
  }, []);

  // Add a global event listener to handle focus after dialogs
  useEffect(() => {
    // This helps with focus issues after confirm dialogs
    const handleFocusIn = () => {
      // If we detect the document has focus but no specific element has focus,
      // we can try to restore focus to our app
      if (document.activeElement === document.body) {
        console.log('Document has focus but no element - restoring focus');
        restoreFocus();
      }
    };
    
    // Add the event listener
    document.addEventListener('focusin', handleFocusIn);
    
    // Clean up
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  // Check storage availability on component mount
  useEffect(() => {
    const checkStorage = async () => {
      if (isIndexedDBAvailable()) {
        try {
          const db = await initDB();
          await db.get('routes', 'test-connection');
          // Storage notification removed
        } catch (error) {
          console.error('IndexedDB test failed:', error);
          // Only show notification if storage is unavailable, as this is important for data safety
          showNotification("Please export your data before refreshing or closing the tab as your browser's storage may not be reliable.", 'info');
        }
      } else {
        // Only show notification if storage is unavailable, as this is important for data safety
        showNotification("Please export your data before refreshing or closing the tab as your browser's storage may not be reliable.", 'info');
      }
    };
    
    checkStorage();
  }, []);

  // Load routes from IndexedDB on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const db = await initDB();
        
        // Load routes
        const allRoutes = await db.getAll('routes');
        if (allRoutes.length > 0) {
          setRoutes(allRoutes);
          
          // Load active tracking first
          // Get all active tracking entries and find the most recent one
          const activeTrackingEntries = await db.getAll('activeTracking');
          const activeTrackingObj = activeTrackingEntries.length > 0 ? activeTrackingEntries[0] : null;
          if (activeTrackingObj) {
            // Remove the id property before setting state
            const { id, ...trackingData } = activeTrackingObj;
            const typedTrackingData = trackingData as RouteProgress;
            setActiveTracking(typedTrackingData);
            setTrackingNotes(trackingData.notes || '');
            
            // Find and activate the route associated with the tracking session
            const trackedRoute = allRoutes.find(route => route.id === trackingData.routeId);
            if (trackedRoute) {
              setCurrentRoute(trackedRoute);
            }
          } else {
            // If no active tracking, check for current route ID or activate the only route
            if (allRoutes.length === 1) {
              // If there's only one route, activate it automatically
              setCurrentRoute(allRoutes[0]);
            } else {
              const currentRouteIdObj = await db.get('currentRouteId', 'current');
              if (currentRouteIdObj) {
                const route = await db.get('routes', currentRouteIdObj.value);
                if (route) {
                  setCurrentRoute(route);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading data from IndexedDB:', error);
        
        // Fallback to localStorage if IndexedDB fails
        try {
          const savedRoutes = localStorage.getItem('farmingRoutes');
          if (savedRoutes) {
            const parsedRoutes = JSON.parse(savedRoutes);
            setRoutes(parsedRoutes);
            
            // Load active tracking first from localStorage
            const savedTracking = localStorage.getItem('activeTracking');
            if (savedTracking) {
              const parsedTracking = JSON.parse(savedTracking);
              setActiveTracking(parsedTracking);
              setTrackingNotes(parsedTracking.notes || '');
              
              // Find and activate the route associated with the tracking session
              const trackedRoute = parsedRoutes.find((route: Route) => route.id === parsedTracking.routeId);
              if (trackedRoute) {
                setCurrentRoute(trackedRoute);
              }
            } else {
              // If no active tracking, check for current route ID or activate the only route
              if (parsedRoutes.length === 1) {
                // If there's only one route, activate it automatically
                setCurrentRoute(parsedRoutes[0]);
              } else {
                const currentRouteId = localStorage.getItem('currentRouteId');
                if (currentRouteId) {
                  const foundRoute = parsedRoutes.find((route: Route) => route.id === currentRouteId);
                  if (foundRoute) {
                    setCurrentRoute(foundRoute);
                  }
                }
              }
            }
          }
        } catch (localStorageError) {
          console.error('Error loading from localStorage fallback:', localStorageError);
        }
      }
    };
    
    loadData();
  }, []);

  // Initialize editing state when current route changes
  useEffect(() => {
    if (currentRoute) {
      setEditingRouteName(currentRoute.name);
      setEditingRouteDescription(currentRoute.description);
      setEditingRouteAutoInventoryChecks(currentRoute.autoInventoryChecks || false);
      setIsEditingRouteDetails(false);
    }
  }, [currentRoute?.id]);

  // Save routes to IndexedDB whenever they change
  useEffect(() => {
    const saveRoutes = async () => {
      if (routes.length === 0) return;
      
      try {
        const db = await initDB();
        
        // Use a transaction for batch operations
        const tx = db.transaction('routes', 'readwrite');
        const routeStore = tx.objectStore('routes');
        
        // Use put for each route to handle updates properly
        for (const route of routes) {
          await routeStore.put(route);
        }
        
        // Commit the transaction
        await tx.done;

        // Also save to localStorage as backup
        localStorage.setItem('farmingRoutes', JSON.stringify(routes));
      } catch (error) {
        console.error('Error saving routes to IndexedDB:', error);
        
        // Fallback to localStorage
        try {
          localStorage.setItem('farmingRoutes', JSON.stringify(routes));
        } catch (localStorageError) {
          console.error('Error saving to localStorage fallback:', localStorageError);
        }
      }
    };
    
    saveRoutes();
  }, [routes]);

  // Save current route ID to IndexedDB whenever it changes
  useEffect(() => {
    const saveCurrentRouteId = async () => {
      try {
        const db = await initDB();
        
        if (currentRoute) {
          await db.put('currentRouteId', { id: 'current', value: currentRoute.id });
          localStorage.setItem('currentRouteId', currentRoute.id);
        } else {
          await db.delete('currentRouteId', 'current');
          localStorage.removeItem('currentRouteId');
        }
      } catch (error) {
        console.error('Error saving current route ID to IndexedDB:', error);
        
        // Fallback to localStorage
        try {
          if (currentRoute) {
            localStorage.setItem('currentRouteId', currentRoute.id);
          } else {
            localStorage.removeItem('currentRouteId');
          }
        } catch (localStorageError) {
          console.error('Error saving to localStorage fallback:', localStorageError);
        }
      }
    };
    
    saveCurrentRouteId();
  }, [currentRoute]);

  // Save active tracking to IndexedDB whenever it changes
  useEffect(() => {
    let isMounted = true;
    
    const saveActiveTracking = async () => {
      try {
        const db = await initDB();
        
        // Check if component is still mounted before proceeding
        if (!isMounted) return;
        
        if (activeTracking) {
          // Add the id property for IndexedDB
          await db.put('activeTracking', { ...activeTracking, id: 'current', routeId: activeTracking.routeId });
          localStorage.setItem('activeTracking', JSON.stringify(activeTracking));
        } else {
          // If activeTracking is null, ensure both storages are cleared using our dedicated function
          await deleteActiveTracking();
        }
      } catch (error) {
        console.error('Error saving active tracking to IndexedDB:', error);
        
        if (!isMounted) return;
        
        // Fallback to localStorage
        try {
          if (activeTracking) {
            localStorage.setItem('activeTracking', JSON.stringify(activeTracking));
          } else {
            await deleteActiveTracking();
          }
        } catch (localStorageError) {
          console.error('Error saving to localStorage fallback:', localStorageError);
        }
      }
    };
    
    saveActiveTracking();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [activeTracking]);

  // Create a new route
  const createRoute = () => {
    if (!newRouteName.trim()) return;
    
    const newRoute: Route = {
      id: uuidv4(),
      name: newRouteName,
      description: newRouteDescription,
      stops: [],
      autoInventoryChecks: newRouteAutoInventoryChecks
    };
    
    setRoutes([...routes, newRoute]);
    setCurrentRoute(newRoute);
    setNewRouteName('');
    setNewRouteDescription('');
    setNewRouteAutoInventoryChecks(false);
  };

  // Add a stop to the current route
  const addStop = () => {
    if (!currentRoute || !newStopName.trim()) return;
    
    const newStop: Stop = {
      id: uuidv4(),
      name: newStopName,
      description: newStopDescription,
      items: [],
      collectData: newStopCollectData
    };
    
    const updatedRoute = {
      ...currentRoute,
      stops: [...currentRoute.stops, newStop]
    };
    
    setCurrentRoute(updatedRoute);
    updateRouteInList(updatedRoute);
    setNewStopName('');
    setNewStopDescription('');
    setNewStopCollectData(false);
  };

  // Add an item to a stop
  const addItemToStop = (stopId: string) => {
    // Get the item name and description from state
    const itemName = newItemNames[stopId] || '';
    const description = newItemDescriptions[stopId] || '';
    
    // Validate the item name based on type
    if (!currentRoute || !validateItemName(itemName, newItemType)) {
      showNotification(`Please provide a name for the ${newItemType}`, 'error');
      return;
    }
    
    // Get the final item name based on type rules
    const finalItemName = getItemNameOrDefault(itemName, newItemType);
    
    const newItem: Item = {
      id: uuidv4(),
      type: newItemType,
      name: finalItemName,
      // Only use the quantity field for Consumable items, set to 1 for all others
      quantity: newItemType === 'Consumable' ? newItemQuantity : 1,
      collected: false,
      description: description // Add the description field
    };
    
    const updatedStops = currentRoute.stops.map(stop => {
      if (stop.id === stopId) {
        return {
          ...stop,
          items: [...stop.items, newItem]
        };
      }
      return stop;
    });
    
    const updatedRoute = {
      ...currentRoute,
      stops: updatedStops
    };
    
    setCurrentRoute(updatedRoute);
    updateRouteInList(updatedRoute);
    setNewItemNames(prev => ({...prev, [stopId]: ''}));
    setNewItemDescriptions(prev => ({...prev, [stopId]: ''})); // Clear the description field
    setNewItemQuantity(1);
  };

  // Update the route in the routes list
  const updateRouteInList = (updatedRoute: Route) => {
    const updatedRoutes = routes.map(route => 
      route.id === updatedRoute.id ? updatedRoute : route
    );
    setRoutes(updatedRoutes);
  };

  // Function to update route name and description
  const updateRouteDetails = () => {
    if (!currentRoute || !editingRouteName.trim()) return;
    
    const updatedRoute = {
      ...currentRoute,
      name: editingRouteName.trim(),
      description: editingRouteDescription.trim(),
      autoInventoryChecks: editingRouteAutoInventoryChecks
    };
    
    setCurrentRoute(updatedRoute);
    updateRouteInList(updatedRoute);
    
    // Save the updated route to IndexedDB
    const saveUpdatedRoute = async () => {
      try {
        const db = await initDB();
        await db.put('routes', updatedRoute);
        showNotification('Route details updated successfully', 'success');
      } catch (error) {
        console.error('Error saving updated route:', error);
        showNotification('Failed to save route details', 'error');
      }
    };
    
    saveUpdatedRoute();
    setIsEditingRouteDetails(false);
  };

  // Helper function to restore focus
  const restoreFocus = () => {
    // Try multiple approaches to restore focus
    const attemptFocus = () => {
      // First try to focus the recovery button
      if (focusRecoveryRef.current) {
        try {
          focusRecoveryRef.current.focus();
          console.log('Focus set to recovery button');
          return true;
        } catch (e) {
          console.error('Failed to focus recovery button:', e);
        }
      }
      
      // If that fails, try the main container
      if (mainContainerRef.current) {
        try {
          mainContainerRef.current.focus();
          console.log('Focus set to main container');
          return true;
        } catch (e) {
          console.error('Failed to focus main container:', e);
        }
      }
      
      // If all else fails, try to focus the document body
      try {
        document.body.focus();
        console.log('Focus set to document body');
        return true;
      } catch (e) {
        console.error('Failed to focus document body:', e);
      }
      
      return false;
    };
    
    // Try immediately
    if (attemptFocus()) return;
    
    // If immediate attempt fails, try with requestAnimationFrame
    requestAnimationFrame(() => {
      if (attemptFocus()) return;
      
      // If that fails, try with setTimeout
      setTimeout(() => {
        attemptFocus();
      }, 100);
    });
  };

  // Delete a route
  const deleteRoute = async (routeId: string) => {
    const confirmed = await customConfirm('Are you sure you want to delete this route? This action cannot be undone.');
    
    if (!confirmed) return;
    
    try {
      // Remove from routes array
      const updatedRoutes = routes.filter(route => route.id !== routeId);
      setRoutes(updatedRoutes);
      
      // If the deleted route was the current route, set current route to null
      if (currentRoute?.id === routeId) {
        setCurrentRoute(null);
        setIsReorderingMode(false);
        setIsReorderingItems(false);
      }

      // If the deleted route was being tracked, clear the tracking state
      if (activeTracking && (activeTracking as RouteProgress).routeId === routeId) {
        setActiveTracking(null);
        setTrackingNotes('');
        setInventoryInputMode(null);
        setInventoryInputValues({});
      }
      
      // Delete from IndexedDB
      if (isIndexedDBAvailable()) {
        const db = await openDB<FarmingTrackerDB>('farming-tracker-db', 1);
        await db.delete('routes', routeId);
        
        // Also delete any active tracking for this route
        const activeTrackingItems = await db.getAll('activeTracking');
        for (const tracking of activeTrackingItems) {
          if (tracking.routeId === routeId) {
            await db.delete('activeTracking', tracking.id || '');
          }
        }
      }
      
      showNotification('Route deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting route:', err);
      showNotification('Failed to delete route', 'error');
    }
  };

  // Delete a stop
  const deleteStop = async (stopId: string) => {
    if (!currentRoute) return;
    
    const stopToDelete = currentRoute.stops.find(stop => stop.id === stopId);
    const confirmDelete = await customConfirm(`Are you sure you want to delete the stop "${stopToDelete?.name || 'Unknown'}"?`);
    
    if (!confirmDelete) {
      // Restore focus when user cancels
      restoreFocus();
      return; // User cancelled the deletion
    }
    
    const updatedStops = currentRoute.stops.filter(stop => stop.id !== stopId);
    const updatedRoute = {
      ...currentRoute,
      stops: updatedStops
    };
    
    setCurrentRoute(updatedRoute);
    updateRouteInList(updatedRoute);
    showNotification('Stop deleted successfully!', 'success');
    
    // Restore focus after deletion
    restoreFocus();
  };

  // Delete an item
  const deleteItem = async (stopId: string, itemId: string) => {
    if (!currentRoute) return;
    
    const stop = currentRoute.stops.find(s => s.id === stopId);
    const itemToDelete = stop?.items.find(item => item.id === itemId);
    const confirmDelete = await customConfirm(`Are you sure you want to delete the item "${itemToDelete?.name || 'Unknown'}"?`);
    
    if (!confirmDelete) {
      // Restore focus when user cancels
      restoreFocus();
      return; // User cancelled the deletion
    }
    
    const updatedStops = currentRoute.stops.map(stop => {
      if (stop.id === stopId) {
        return {
          ...stop,
          items: stop.items.filter(item => item.id !== itemId)
        };
      }
      return stop;
    });
    
    const updatedRoute = {
      ...currentRoute,
      stops: updatedStops
    };
    
    setCurrentRoute(updatedRoute);
    updateRouteInList(updatedRoute);
    
    // Do not restore focus after deletion to prevent page from scrolling to the top
  };

  // Function to reorder stops
  const reorderStops = (fromIndex: number, toIndex: number) => {
    if (!currentRoute) return;
    
    const stops = [...currentRoute.stops];
    const [movedStop] = stops.splice(fromIndex, 1);
    stops.splice(toIndex, 0, movedStop);
    
    const updatedRoute = {
      ...currentRoute,
      stops
    };
    
    setCurrentRoute(updatedRoute);
    updateRouteInList(updatedRoute);
    showNotification("Stop reordered successfully", "success");
  };

  // Function to reorder items within a stop
  const reorderItems = (stopId: string, fromIndex: number, toIndex: number) => {
    if (!currentRoute) return;
    
    const updatedStops = currentRoute.stops.map(stop => {
      if (stop.id === stopId) {
        const items = [...stop.items];
        const [movedItem] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, movedItem);
        
        return {
          ...stop,
          items
        };
      }
      return stop;
    });
    
    const updatedRoute = {
      ...currentRoute,
      stops: updatedStops
    };
    
    setCurrentRoute(updatedRoute);
    updateRouteInList(updatedRoute);
    showNotification("Item reordered successfully", "success");
  };

  // Toggle reordering mode
  const toggleReorderingMode = () => {
    setIsReorderingMode(prev => !prev);
    
    // If we're entering reordering mode, ensure buttons are visible after render
    if (!isReorderingMode) {
      setTimeout(() => {
        // Force a repaint to ensure buttons are visible
        const reorderButtons = document.querySelectorAll('.reorder-button');
        reorderButtons.forEach(button => {
          if (button instanceof HTMLElement) {
            button.style.display = 'inline-flex';
            button.style.visibility = 'visible';
            button.style.opacity = '1';
            button.style.position = 'relative';
            button.style.zIndex = '1000';
          }
        });
        
        // Force a resize event to trigger any responsive layout adjustments
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  };

  // Toggle reordering items mode
  const toggleReorderingItemsMode = () => {
    // If we're entering reordering mode, cancel any ongoing stop editing
    if (!isReorderingItems) {
      cancelEditStop();
    }
    
    setIsReorderingItems(prev => !prev);
    
    // If we're entering reordering mode, ensure buttons are visible after render
    if (!isReorderingItems) {
      setTimeout(() => {
        // Force a repaint to ensure buttons are visible
        const reorderButtons = document.querySelectorAll('.reorder-button');
        reorderButtons.forEach(button => {
          if (button instanceof HTMLElement) {
            button.style.display = 'inline-flex';
            button.style.visibility = 'visible';
            button.style.opacity = '1';
            button.style.position = 'relative';
            button.style.zIndex = '1000';
          }
        });
        
        // Force a resize event to trigger any responsive layout adjustments
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  };

  // Start tracking a route
  const startRouteTracking = () => {
    if (!currentRoute) return;
    
    // Prevent starting a new tracking session if another route is being tracked
    if (activeTracking && 'routeId' in activeTracking && activeTracking.routeId !== currentRoute.id) {
      showNotification('Cannot start tracking - another route is currently being tracked.', 'error');
      return;
    }
    
    // Initialize tracking with all items marked as not collected
    const collectedItems: Record<string, boolean> = {};
    currentRoute.stops.forEach(stop => {
      stop.items.forEach(item => {
        collectedItems[item.id] = false;
      });
    });
    
    const newTracking: RouteProgress = {
      routeId: currentRoute.id,
      startTime: Date.now(),
      currentStopIndex: 0,
      collectedItems,
      notes: '',
      inventoryData: {
        preRoute: {},
        postRoute: {},
        routeInventory: {},
        stops: {}
      }
    };
    
    setActiveTracking(newTracking);
    
    // If auto inventory checks are enabled, prompt for pre-route inventory
    if (currentRoute.autoInventoryChecks) {
      // Initialize inventory input values
      const initialInventoryValues: Record<string, number> = {};
      
      // Find all harvestable items and group by name
      const itemsByName: Record<string, Item[]> = {};
      currentRoute.stops.forEach(stop => {
        stop.items.forEach(item => {
          if (item.type === 'Harvestable') {
            if (!itemsByName[item.name]) {
              itemsByName[item.name] = [];
              // Only initialize once per unique item name
              initialInventoryValues[item.name] = 0;
            }
            itemsByName[item.name].push(item);
          }
        });
      });
      
      // Only proceed with inventory input if there are harvestable items
      if (Object.keys(initialInventoryValues).length > 0) {
        setInventoryInputValues(initialInventoryValues);
        setInventoryInputMode('pre');
      }
    }
    
    // Check if the first stop needs inventory data collection
    const firstStop = currentRoute.stops[0];
    if (firstStop && firstStop.collectData) {
      // Initialize inventory input values
      const initialInventoryValues: Record<string, number> = {};
      
      // Find all harvestable items in the first stop and group by name
      const itemsByName: Record<string, Item[]> = {};
      firstStop.items.forEach(item => {
        if (item.type === 'Harvestable') {
          if (!itemsByName[item.name]) {
            itemsByName[item.name] = [];
            // Get the current known inventory level for this item
            const currentLevel = newTracking.inventoryData?.routeInventory?.[item.name] || 0;
            initialInventoryValues[item.name] = currentLevel;
          }
          itemsByName[item.name].push(item);
        }
      });
      
      // Only proceed with inventory input if there are harvestable items
      // and we're not already collecting pre-route inventory
      if (Object.keys(initialInventoryValues).length > 0 && !currentRoute.autoInventoryChecks) {
        setInventoryInputValues(initialInventoryValues);
        setCurrentStopId(firstStop.id);
        setInventoryInputMode('pre-stop');
      }
    }
  };

  // Toggle item collection status
  const toggleItemCollected = (itemId: string) => {
    if (!activeTracking) return;
    
    const updatedCollectedItems = {
      ...activeTracking.collectedItems,
      [itemId]: !activeTracking.collectedItems[itemId]
    };
    
    const updatedTracking = {
      ...activeTracking,
      collectedItems: updatedCollectedItems
    };
    
    setActiveTracking(updatedTracking);
  };

  // Move to the next stop in the route
  const moveToNextStop = () => {
    if (!activeTracking || !currentRoute) return;
    
    const currentStop = currentRoute.stops[activeTracking.currentStopIndex];
    
    // Check if we need to collect inventory data for the current stop
    // Only check if we haven't already collected post-stop inventory
    if (currentStop.collectData && 
        !activeTracking.inventoryData?.stops?.[currentStop.id]?.postStop) {
      // Initialize inventory input values
      const initialInventoryValues: Record<string, number> = {};
      
      // Find all harvestable items in the current stop
      currentStop.items.forEach(item => {
        if (item.type === 'Harvestable') {
          // Get the current known inventory level for this item
          const currentLevel = activeTracking.inventoryData?.routeInventory?.[item.name] || 0;
          initialInventoryValues[item.name] = currentLevel;
        }
      });
      
      if (Object.keys(initialInventoryValues).length > 0) {
        setInventoryInputValues(initialInventoryValues);
        setCurrentStopId(currentStop.id);
        setInventoryInputMode('post-stop');
        return; // Don't move to next stop yet, wait for inventory input
      }
    }
    
    // If we reach here, either no inventory data needed or no harvestable items
    if (activeTracking.currentStopIndex < currentRoute.stops.length - 1) {
      const nextStopIndex = activeTracking.currentStopIndex + 1;
      const nextStop = currentRoute.stops[nextStopIndex];
      
      const updatedTracking = {
        ...activeTracking,
        currentStopIndex: nextStopIndex
      };
      
      setActiveTracking(updatedTracking);
      
      // Check if we need to collect pre-stop inventory data for the next stop
      // Only check if we haven't already collected pre-stop inventory
      if (nextStop.collectData && 
          !activeTracking.inventoryData?.stops?.[nextStop.id]?.preStop) {
        // Initialize inventory input values
        const initialInventoryValues: Record<string, number> = {};
        
        // Find all harvestable items in the next stop
        nextStop.items.forEach(item => {
          if (item.type === 'Harvestable') {
            // Get the current known inventory level for this item
            const currentLevel = activeTracking.inventoryData?.routeInventory?.[item.name] || 0;
            initialInventoryValues[item.name] = currentLevel;
          }
        });
        
        // Only proceed with inventory input if there are harvestable items
        if (Object.keys(initialInventoryValues).length > 0) {
          setInventoryInputValues(initialInventoryValues);
          setCurrentStopId(nextStop.id);
          setInventoryInputMode('pre-stop');
        }
      }
    }
  };

  // Move to the previous stop in the route
  const moveToPreviousStop = () => {
    if (!activeTracking || !currentRoute) return;
    
    const currentStop = currentRoute.stops[activeTracking.currentStopIndex];
    
    // Check if we need to collect pre-stop inventory data for the current stop
    // (since we're moving backwards, we collect pre-stop data when leaving)
    // Only check if we haven't already collected pre-stop inventory
    if (currentStop.collectData && 
        !activeTracking.inventoryData?.stops?.[currentStop.id]?.preStop) {
      // Initialize inventory input values
      const initialInventoryValues: Record<string, number> = {};
      
      // Find all harvestable items in this stop
      currentStop.items.forEach(item => {
        if (item.type === 'Harvestable') {
          // Get the current known inventory level for this item
          const currentLevel = activeTracking.inventoryData?.routeInventory?.[item.name] || 0;
          initialInventoryValues[item.name] = currentLevel;
        }
      });
      
      // Only proceed with inventory input if there are harvestable items
      if (Object.keys(initialInventoryValues).length > 0) {
        setInventoryInputValues(initialInventoryValues);
        setCurrentStopId(currentStop.id);
        setInventoryInputMode('pre-stop');
        return; // Don't move to previous stop yet, wait for inventory input
      }
    }
    
    // If we reach here, either no inventory data needed or no harvestable items
    if (activeTracking.currentStopIndex > 0) {
      const prevStopIndex = activeTracking.currentStopIndex - 1;
      const prevStop = currentRoute.stops[prevStopIndex];
      
      const updatedTracking = {
        ...activeTracking,
        currentStopIndex: prevStopIndex
      };
      
      setActiveTracking(updatedTracking);
      
      // Check if we need to collect post-stop inventory data for the previous stop
      if (prevStop.collectData) {
        // Initialize inventory input values
        const initialInventoryValues: Record<string, number> = {};
        
        // Find all harvestable items in the previous stop
        prevStop.items.forEach(item => {
          if (item.type === 'Harvestable') {
            // Try to get the last known value from various sources in order of recency
            const lastKnownValue = 
              // First try the previous stop's pre-stop value
              activeTracking.inventoryData?.stops?.[prevStop.id]?.preStop?.[item.id] ??
              // Then try the pre-route value
              activeTracking.inventoryData?.preRoute?.[item.id] ??
              // Finally default to 0 if no previous values exist
              0;
            
            initialInventoryValues[item.id] = lastKnownValue;
          }
        });
        
        // Only proceed with inventory input if there are harvestable items
        if (Object.keys(initialInventoryValues).length > 0) {
          setInventoryInputValues(initialInventoryValues);
          setCurrentStopId(prevStop.id);
          setInventoryInputMode('post-stop');
        }
      }
    }
  };

  // Save tracking notes
  const saveTrackingNotes = () => {
    if (!activeTracking) return;
    
    const updatedTracking = {
      ...activeTracking,
      notes: trackingNotes
    };
    
    setActiveTracking(updatedTracking);
    
    showNotification('Notes saved successfully!', 'success');
  };

  // Save inventory data
  const saveInventoryData = async () => {
    if (!activeTracking || !currentRoute) return;

    const updatedTracking: RouteProgress = {
      ...activeTracking,
      inventoryData: {
        routeInventory: {},
        preRoute: {},
        postRoute: {},
        stops: {}
      }
    };

    // First, copy over any existing data
    if (activeTracking.inventoryData) {
      updatedTracking.inventoryData = {
        routeInventory: activeTracking.inventoryData.routeInventory || {},
        preRoute: activeTracking.inventoryData.preRoute || {},
        postRoute: activeTracking.inventoryData.postRoute || {},
        stops: activeTracking.inventoryData.stops || {}
      };
    }

    if (inventoryInputMode === 'pre') {
      // Save pre-route inventory data - using item names
      updatedTracking.inventoryData = {
        routeInventory: { ...inventoryInputValues },
        preRoute: inventoryInputValues,
        postRoute: updatedTracking.inventoryData?.postRoute || {},
        stops: updatedTracking.inventoryData?.stops || {}
      };
    } else if (inventoryInputMode === 'post') {
      // Save post-route inventory data - using item names
      updatedTracking.inventoryData = {
        routeInventory: updatedTracking.inventoryData?.routeInventory || {},
        preRoute: updatedTracking.inventoryData?.preRoute || {},
        postRoute: inventoryInputValues,
        stops: updatedTracking.inventoryData?.stops || {}
      };
    } else if (inventoryInputMode === 'pre-stop' && currentStopId) {
      // For stop-specific tracking, we need to map between names and UUIDs
      const uuidBasedValues: Record<string, number> = {};
      // This variable is not used in this block, so we can remove it

      // Get the current stop
      const currentStop = currentRoute.stops.find(stop => stop.id === currentStopId);
      if (currentStop) {
        // Group items by name
        const itemsByName: Record<string, Item[]> = {};
        currentStop.items.forEach(item => {
          if (item.type === 'Harvestable') {
            if (!itemsByName[item.name]) {
              itemsByName[item.name] = [];
            }
            itemsByName[item.name].push(item);
          }
        });

        // For each item name in the input values
        Object.entries(inventoryInputValues).forEach(([itemName, value]) => {
          const items = itemsByName[itemName] || [];
          if (items.length > 0) {
            // Distribute the value equally among all UUIDs for this item name
            const valuePerUUID = value / items.length;
            items.forEach(item => {
              uuidBasedValues[item.id] = valuePerUUID;
            });
          }
        });
      }

      // Save pre-stop inventory data with UUID-based values
      const currentStopData = updatedTracking.inventoryData?.stops?.[currentStopId] || {};
      updatedTracking.inventoryData = {
        routeInventory: updatedTracking.inventoryData?.routeInventory || {},
        preRoute: updatedTracking.inventoryData?.preRoute || {},
        postRoute: updatedTracking.inventoryData?.postRoute || {},
        stops: {
          ...updatedTracking.inventoryData?.stops,
          [currentStopId]: {
            ...currentStopData,
            preStop: uuidBasedValues
          }
        }
      };
    } else if (inventoryInputMode === 'post-stop' && currentStopId) {
      // Similar to pre-stop, but for post-stop values
      const uuidBasedValues: Record<string, number> = {};
      const addedAmounts: Record<string, number> = {};

      // Get the current stop
      const currentStop = currentRoute.stops.find(stop => stop.id === currentStopId);
      if (currentStop) {
        // Group items by name
        const itemsByName: Record<string, Item[]> = {};
        currentStop.items.forEach(item => {
          if (item.type === 'Harvestable') {
            if (!itemsByName[item.name]) {
              itemsByName[item.name] = [];
            }
            itemsByName[item.name].push(item);
          }
        });

        // For each item name in the input values
        Object.entries(inventoryInputValues).forEach(([itemName, value]) => {
          const items = itemsByName[itemName] || [];
          if (items.length > 0) {
            // Get the pre-stop value for this item name
            const preStopTotal = items.reduce((sum, item) => {
              return sum + (updatedTracking.inventoryData?.stops?.[currentStopId]?.preStop?.[item.id] || 0);
            }, 0);

            // Calculate the added amount
            const addedAmount = value - preStopTotal;
            addedAmounts[itemName] = addedAmount;

            // Update route inventory with the added amount
            const currentInventory = updatedTracking.inventoryData?.routeInventory?.[itemName] || 0;
            if (updatedTracking.inventoryData) {
              updatedTracking.inventoryData.routeInventory = {
                ...updatedTracking.inventoryData.routeInventory,
                [itemName]: currentInventory + addedAmount
              };
            }

            // Distribute the post-value equally among all UUIDs for this item name
            const valuePerUUID = value / items.length;
            items.forEach(item => {
              uuidBasedValues[item.id] = valuePerUUID;
            });
          }
        });
      }

      // Save post-stop inventory data with UUID-based values
      const currentStopData = updatedTracking.inventoryData?.stops?.[currentStopId] || {};
      updatedTracking.inventoryData = {
        ...updatedTracking.inventoryData,
        stops: {
          ...updatedTracking.inventoryData?.stops,
          [currentStopId]: {
            ...currentStopData,
            postStop: uuidBasedValues,
            addedAmount: addedAmounts
          }
        }
      };
    }

    setActiveTracking(updatedTracking);
    setInventoryInputMode(null);
    setInventoryInputValues({});
    setCurrentStopId(null);
  };

  // Complete the route tracking
  const completeRouteTracking = async () => {
    if (!activeTracking || !currentRoute) return;
    
    // If auto inventory checks are enabled and we haven't done post-route inventory yet
    if (currentRoute.autoInventoryChecks && 
        (!activeTracking.inventoryData?.postRoute || 
         Object.keys(activeTracking.inventoryData.postRoute).length === 0)) {
      
      // Initialize inventory input values with current values or zeros
      const initialInventoryValues: Record<string, number> = {};
      
      // Find all harvestable items (removed consumable)
      currentRoute.stops.forEach(stop => {
        stop.items.forEach(item => {
          if (item.type === 'Harvestable') {
            initialInventoryValues[item.id] = 0;
          }
        });
      });
      
      // Only proceed with inventory input if there are harvestable items
      if (Object.keys(initialInventoryValues).length > 0) {
        setInventoryInputValues(initialInventoryValues);
        setInventoryInputMode('post');
        return; // Don't complete tracking yet, wait for inventory input
      }
      // Otherwise, continue with completion
    }
    
    // Ask for confirmation before completing
    const confirmed = await customConfirm('Are you sure you want to complete this route? This will record it as a finished run.');
    if (!confirmed) return;
    
    // Update the completed runs count for the route
    const updatedRoute = {
      ...currentRoute,
      completedRuns: (currentRoute.completedRuns || 0) + 1
    };
    
    // Update the route in the routes list
    const updatedRoutes = routes.map(route => 
      route.id === updatedRoute.id ? updatedRoute : route
    );
    
    // Update state
    setRoutes(updatedRoutes);
    setCurrentRoute(updatedRoute);
    setActiveTracking(null);
    setTrackingNotes('');
    setInventoryInputMode(null);
    
    // Save the updated data
    saveAllData().catch(err => {
      console.error('Error saving completed run data:', err);
      showNotification('Route completed, but there was an error saving the data.', 'error');
    });
    
    showNotification('Route tracking completed!', 'success');
  };

  // Function to delete active tracking from storage
  const deleteActiveTracking = async (): Promise<boolean> => {
    try {
      if (isIndexedDBAvailable()) {
        const db = await openDB<FarmingTrackerDB>('farming-tracker-db', 1);
        // Delete all active tracking entries to ensure cleanup
        const activeTrackingEntries = await db.getAll('activeTracking');
        const tx = db.transaction('activeTracking', 'readwrite');
        for (const entry of activeTrackingEntries) {
          if (entry.id) {
            await tx.store.delete(entry.id);
          }
        }
        await tx.done;
      }
      // Always clear localStorage
      localStorage.removeItem('activeTracking');
      return true;
    } catch (err) {
      console.error('Error deleting active tracking:', err);
      return false;
    }
  };

  // Cancel the route tracking
  const cancelRouteTracking = async () => {
    // Ask for confirmation before canceling
    const confirmed = await customConfirm('Are you sure you want to cancel route tracking? All progress will be lost.');
    if (!confirmed) return;
    
    try {
      // First clear the state to prevent any auto-save effects
      setActiveTracking(null);
      setTrackingNotes('');
      setIsReorderingMode(false);
      setIsReorderingItems(false);
      setInventoryInputMode(null);
      setInventoryInputValues({});

      // Then explicitly clear from storage
      if (isIndexedDBAvailable()) {
        const db = await openDB<FarmingTrackerDB>('farming-tracker-db', 1);
        
        // Start a transaction and clear all active tracking entries
        const tx = db.transaction('activeTracking', 'readwrite');
        const store = tx.objectStore('activeTracking');
        
        // Get all keys and delete them
        const keys = await store.getAllKeys();
        for (const key of keys) {
          await store.delete(key);
        }
        
        // Wait for transaction to complete
        await tx.done;
      }

      // Clear from localStorage regardless of IndexedDB availability
      localStorage.removeItem('activeTracking');
      
      showNotification('Route tracking cancelled successfully', 'success');
    } catch (err) {
      console.error('Error clearing active tracking:', err);
      showNotification('Error clearing tracking data', 'error');
    }
  };

  // Add a manual save function
  const saveAllData = async () => {
    try {
      // First try IndexedDB
      if (isIndexedDBAvailable()) {
        const db = await initDB();
        
        // Save routes - use put instead of clear and add for better update handling
        const routeTx = db.transaction('routes', 'readwrite');
        for (const route of routes) {
          await routeTx.store.put(route);
        }
        await routeTx.done;
        
        // Save current route ID
        if (currentRoute) {
          await db.put('currentRouteId', { id: 'current', value: currentRoute.id });
        } else {
          await db.delete('currentRouteId', 'current');
        }
        
        // Save active tracking
        if (activeTracking) {
          await db.put('activeTracking', { ...activeTracking, id: 'current', routeId: activeTracking.routeId });
        } else {
          await db.delete('activeTracking', 'current');
        }
        
        showNotification('All data saved successfully!', 'success');
      } else {
        throw new Error('IndexedDB not available');
      }
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
      
      // Fallback to localStorage
      try {
        localStorage.setItem('farmingRoutes', JSON.stringify(routes));
        
        if (currentRoute) {
          localStorage.setItem('currentRouteId', currentRoute.id);
        } else {
          localStorage.removeItem('currentRouteId');
        }
        
        if (activeTracking) {
          localStorage.setItem('activeTracking', JSON.stringify(activeTracking));
        } else {
          localStorage.removeItem('activeTracking');
        }
        
        showNotification('All data saved successfully!', 'success');
      } catch (localStorageError) {
        console.error('Error saving to localStorage:', localStorageError);
        showNotification('Failed to save data. Please try again.', 'error');
      }
    }
  };

  // Add a function to download all data as a JSON file
  const downloadAllData = () => {
    try {
      // Create a data object with all the important information
      const dataToSave = {
        routes,
        currentRouteId: currentRoute?.id || null,
        activeTracking,
        version: '1.0.0', // Add a version number for future compatibility
        exportDate: new Date().toISOString()
      };
      
      // Convert to JSON
      const jsonData = JSON.stringify(dataToSave, null, 2);
      
      // Create a blob and download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element and trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `fallout76-routes-and-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      showNotification('Routes and history downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading data:', error);
      showNotification('Failed to download routes and history. Please try again.', 'error');
    }
  };

  // Add a function to download just the routes without history
  const downloadRoutesOnly = () => {
    try {
      // Create a data object with just the routes information
      const dataToSave = {
        routes,
        currentRouteId: currentRoute?.id || null,
        version: '1.0.0',
        exportDate: new Date().toISOString()
      };
      
      // Convert to JSON
      const jsonData = JSON.stringify(dataToSave, null, 2);
      
      // Create a blob and download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element and trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `fallout76-routes-only-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      showNotification('Routes downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading routes:', error);
      showNotification('Failed to download routes. Please try again.', 'error');
    }
  };

  // Add a function to load data from a JSON file
  const loadDataFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Get the selected file
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Create a file reader
    const reader = new FileReader();
    
    // Set up the onload event
    reader.onload = async (e) => {
      try {
        // Parse the JSON data
        const jsonData = e.target?.result as string;
        const parsedData = JSON.parse(jsonData);
        
        // Validate the data structure
        if (!parsedData.routes || !Array.isArray(parsedData.routes)) {
          throw new Error('Invalid data format: routes array not found');
        }
        
        // Check if we should merge with existing routes or replace them
        const confirmed = await customConfirm(
          'Do you want to merge with existing routes? Click OK to merge (update existing routes and add new ones), or Cancel to replace all routes.'
        );
        
        let updatedRoutes: Route[];
        
        if (confirmed) {
          // Merge approach: Update existing routes and add new ones
          const existingRouteMap = new Map(routes.map(route => [route.id, route]));
          
          // Process each imported route
          parsedData.routes.forEach((importedRoute: Route) => {
            if (existingRouteMap.has(importedRoute.id)) {
              // Update existing route
              existingRouteMap.set(importedRoute.id, importedRoute);
            } else {
              // Add new route
              existingRouteMap.set(importedRoute.id, importedRoute);
            }
          });
          
          // Convert map back to array
          updatedRoutes = Array.from(existingRouteMap.values());
        } else {
          // Replace approach: Use imported routes directly
          updatedRoutes = parsedData.routes;
        }
        
        // Set the routes
        setRoutes(updatedRoutes);
        
        // Set the current route if available
        if (parsedData.currentRouteId) {
          const currentRoute = updatedRoutes.find((r: Route) => r.id === parsedData.currentRouteId);
          if (currentRoute) {
            setCurrentRoute(currentRoute);
          }
        }
        
        // Set active tracking if available
        if (parsedData.activeTracking) {
          setActiveTracking(parsedData.activeTracking);
          setTrackingNotes(parsedData.activeTracking.notes || '');
        }
        
        // Save the imported data to IndexedDB and localStorage
        saveAllData().catch(err => {
          console.error('Error saving imported data:', err);
          showNotification('Routes and history imported successfully, but there was an issue saving to browser storage.', 'error');
        });
        
        showNotification(`Routes and history ${confirmed ? 'merged' : 'imported'} successfully!`, 'success');
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        showNotification('Failed to import routes and history. Please check the file format.', 'error');
      }
    };
    
    // Read the file as text
    reader.readAsText(file);
    
    // Reset the input field so the same file can be selected again
    event.target.value = '';
  };

  // Add a function to load just routes from a JSON file
  const loadRoutesOnlyFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Get the selected file
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Create a file reader
    const reader = new FileReader();
    
    // Set up the onload event
    reader.onload = async (e) => {
      try {
        // Parse the JSON data
        const jsonData = e.target?.result as string;
        const parsedData = JSON.parse(jsonData);
        
        // Validate the data structure
        if (!parsedData.routes || !Array.isArray(parsedData.routes)) {
          throw new Error('Invalid data format: routes array not found');
        }
        
        // Check if we should merge with existing routes or replace them
        const confirmed = await customConfirm(
          'Do you want to merge with existing routes? Click OK to merge (update existing routes and add new ones), or Cancel to replace all routes.'
        );
        
        let updatedRoutes: Route[];
        
        if (confirmed) {
          // Merge approach: Update existing routes and add new ones
          const existingRouteMap = new Map(routes.map(route => [route.id, route]));
          
          // Process each imported route
          parsedData.routes.forEach((importedRoute: Route) => {
            if (existingRouteMap.has(importedRoute.id)) {
              // Update existing route
              existingRouteMap.set(importedRoute.id, importedRoute);
            } else {
              // Add new route
              existingRouteMap.set(importedRoute.id, importedRoute);
            }
          });
          
          // Convert map back to array
          updatedRoutes = Array.from(existingRouteMap.values());
        } else {
          // Replace approach: Use imported routes directly
          updatedRoutes = parsedData.routes;
        }
        
        // Set the routes
        setRoutes(updatedRoutes);
        
        // Set the current route if available
        if (parsedData.currentRouteId) {
          const currentRoute = updatedRoutes.find((r: Route) => r.id === parsedData.currentRouteId);
          if (currentRoute) {
            setCurrentRoute(currentRoute);
          }
        }
        
        // Save the imported routes to IndexedDB and localStorage
        saveAllData().catch(err => {
          console.error('Error saving imported routes:', err);
          showNotification('Routes imported successfully, but there was an issue saving to browser storage.', 'error');
        });
        
        showNotification(`Routes ${confirmed ? 'merged' : 'imported'} successfully!`, 'success');
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        showNotification('Failed to import routes. Please check the file format.', 'error');
      }
    };
    
    // Read the file as text
    reader.readAsText(file);
    
    // Reset the input field so the same file can be selected again
    event.target.value = '';
  };

  // Update the setCurrentRoute function to collapse other routes when a route is activated
  const handleRouteActivation = (route: Route) => {
    setCurrentRoute(route);
    setIsReorderingMode(false);
    setIsReorderingItems(false);
    
    // Save the current route ID
    if (isIndexedDBAvailable()) {
      openDB<FarmingTrackerDB>('farming-tracker-db', 1).then(db => {
        db.put('currentRouteId', { id: 'current', value: route.id });
      }).catch((err: Error) => {
        console.error('Error saving current route ID:', err);
        showNotification('Failed to save current route.', 'error');
      });
    }
  };

  // Clear route history (reset completed runs)
  const clearRouteHistory = async (routeId: string) => {
    const confirmed = await customConfirm('Are you sure you want to clear the history for this route? This will reset the completed runs counter to zero.');
    
    if (!confirmed) return;
    
    try {
      // Find the route
      const routeToUpdate = routes.find(route => route.id === routeId);
      if (!routeToUpdate) return;
      
      // Update the route with reset completedRuns
      const updatedRoute = {
        ...routeToUpdate,
        completedRuns: 0
      };
      
      // Update in routes array
      const updatedRoutes = routes.map(route => 
        route.id === routeId ? updatedRoute : route
      );
      
      setRoutes(updatedRoutes);
      
      // If this is the current route, update currentRoute as well
      if (currentRoute?.id === routeId) {
        setCurrentRoute(updatedRoute);
      }
      
      // Save to IndexedDB
      if (isIndexedDBAvailable()) {
        const db = await openDB<FarmingTrackerDB>('farming-tracker-db', 1);
        await db.put('routes', updatedRoute);
      }
      
      showNotification('Route history cleared successfully', 'success');
    } catch (err) {
      console.error('Error clearing route history:', err);
      showNotification('Failed to clear route history', 'error');
    }
  };

  // Close actions flyout when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if any actions flyout is open
      const hasOpenActions = Object.values(expandedActions).some(isOpen => isOpen);
      
      if (!hasOpenActions) return;
      
      // Check if the click was outside of any actions button or flyout
      const target = event.target as HTMLElement;
      const isActionsButton = target.closest('button')?.textContent?.includes('Actions');
      const isActionsMenu = target.closest('div')?.classList.contains('actions-flyout');
      
      if (!isActionsButton && !isActionsMenu) {
        // Close all actions flyouts
        setExpandedActions({});
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [expandedActions]);

  // Edit a stop in the current route
  const editStop = (stopId: string) => {
    if (!currentRoute) return;
    
    // Close any item editing form
    cancelEditItem();
    
    const stop = currentRoute.stops.find(s => s.id === stopId);
    if (!stop) return;
    
    setIsEditingStop(stopId);
    setEditStopName(stop.name);
    setEditStopDescription(stop.description);
    setEditStopCollectData(stop.collectData || false);
  };

  // Save edited stop
  const saveEditedStop = () => {
    if (!currentRoute || !isEditingStop || !editStopName.trim()) return;
    
    const updatedStops = currentRoute.stops.map(stop => {
      if (stop.id === isEditingStop) {
        return {
          ...stop,
          name: editStopName,
          description: editStopDescription,
          collectData: editStopCollectData
        };
      }
      return stop;
    });
    
    const updatedRoute = {
      ...currentRoute,
      stops: updatedStops
    };
    
    setCurrentRoute(updatedRoute);
    updateRouteInList(updatedRoute);
    cancelEditStop();
  };

  // Cancel stop editing
  const cancelEditStop = () => {
    setIsEditingStop(null);
    setEditStopName('');
    setEditStopDescription('');
    setEditStopCollectData(false);
  };

  // Handle key press for stop editing
  const handleStopEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEditedStop();
    } else if (e.key === 'Escape') {
      cancelEditStop();
    }
  };

  // Edit an item in a stop
  const editItem = (stopId: string, itemId: string) => {
    if (!currentRoute) return;
    
    // Close any stop editing form
    cancelEditStop();
    
    const stop = currentRoute.stops.find(s => s.id === stopId);
    if (!stop) return;
    
    const item = stop.items.find(i => i.id === itemId);
    if (!item) return;
    
    setIsEditingItem({ stopId, itemId });
    
    // For Bobblehead and Magazine, we don't need to set the name as it's the same as the type
    // For other types, set the name from the item
    setEditItemName(item.name);
    setEditItemType(item.type);
    setEditItemDescription(item.description || '');
    setEditItemQuantity(item.quantity);
  };

  // Save edited item
  const saveEditedItem = () => {
    if (!currentRoute || !isEditingItem) return;
    
    // Validate the item name based on type
    if (!validateItemName(editItemName, editItemType)) {
      showNotification(`Please provide a name for the ${editItemType}`, 'error');
      return;
    }
    
    // Get the final item name based on type rules
    const finalItemName = getItemNameOrDefault(editItemName, editItemType);
    
    const updatedStops = currentRoute.stops.map(stop => {
      if (stop.id === isEditingItem.stopId) {
        return {
          ...stop,
          items: stop.items.map(item => {
            if (item.id === isEditingItem.itemId) {
              return {
                ...item,
                name: finalItemName,
                type: editItemType,
                description: editItemDescription,
                quantity: editItemType === 'Consumable' ? editItemQuantity : 1
              };
            }
            return item;
          })
        };
      }
      return stop;
    });
    
    const updatedRoute = {
      ...currentRoute,
      stops: updatedStops
    };
    
    setCurrentRoute(updatedRoute);
    updateRouteInList(updatedRoute);
    cancelEditItem();
  };

  // Cancel item editing
  const cancelEditItem = () => {
    setIsEditingItem(null);
    setEditItemName('');
    setEditItemType('');
    setEditItemDescription('');
    setEditItemQuantity(1);
  };

  // Handle key press in item edit form
  const handleItemEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEditedItem();
    } else if (e.key === 'Escape') {
      cancelEditItem();
    }
  };

  return (
    <div className="farming-tracker" ref={mainContainerRef} tabIndex={-1} style={{ outline: 'none' }}>
      {/* Hidden button for focus recovery */}
      <button 
        ref={focusRecoveryRef}
        style={{ 
          position: 'absolute', 
          opacity: 0, 
          height: 1, 
          width: 1, 
          padding: 0, 
          margin: 0, 
          border: 'none',
          clip: 'rect(0 0 0 0)',
          overflow: 'hidden'
        }}
        aria-hidden="true"
        tabIndex={0}
        onClick={() => {
          // If clicked, move focus to the main container
          if (mainContainerRef.current) {
            mainContainerRef.current.focus();
          }
        }}
      >Focus recovery</button>
      
      {/* Custom Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          onClick={(e) => {
            // Close dialog when clicking outside
            if (e.target === e.currentTarget) {
              confirmDialog.onCancel();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              confirmDialog.onConfirm();
            } else if (e.key === 'Escape') {
              confirmDialog.onCancel();
            }
          }}
        >
          <div 
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
            style={{ 
              backgroundColor: 'var(--background)', 
              border: '2px solid var(--primary-accent)',
              maxWidth: '90%',
              width: '400px'
            }}
          >
            <h3 id="dialog-title" className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Confirm</h3>
            <p className="mb-6" style={{ color: 'var(--text)' }}>{confirmDialog.message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => confirmDialog.onCancel()}
                className="px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: 'var(--secondary-accent)', 
                  color: 'var(--light-contrast)'
                }}
                aria-label="Cancel"
                onKeyDown={(e) => {
                  if (e.key === 'Tab' && e.shiftKey) {
                    e.preventDefault();
                    (document.getElementById('confirm-button') as HTMLElement)?.focus();
                  }
                }}
              >
                Cancel
              </button>
              <button
                id="confirm-button"
                onClick={() => confirmDialog.onConfirm()}
                className="px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                style={{ 
                  backgroundColor: 'var(--actionPositive)', 
                  color: 'var(--actionText)',
                  fontWeight: 'bold'
                }}
                autoFocus
                aria-label="Confirm"
                onKeyDown={(e) => {
                  if (e.key === 'Tab' && !e.shiftKey) {
                    e.preventDefault();
                    (document.querySelector('[aria-label="Cancel"]') as HTMLElement)?.focus();
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification */}
      {notification.visible && (
        <div 
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-opacity duration-300 ${
            notification.visible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            backgroundColor: notification.type === 'success' ? 'var(--main-accent)' : 
                            notification.type === 'error' ? 'var(--extra-pop)' : 
                            'var(--secondary-accent)',
            color: 'var(--dark-contrast)',
            border: '2px solid var(--light-contrast)',
            minWidth: '280px',
            maxWidth: '400px',
            fontWeight: 'bold'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-3 text-xl">
                {notification.type === 'success' ? '✓' : 
                notification.type === 'error' ? '✗' : 'ℹ'}
              </span>
              <span>{notification.message}</span>
            </div>
            <button 
              onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
              className="ml-4 text-lg font-bold hover:opacity-70 transition-opacity"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--main-accent)' }}>
        Fallout 76 Farming Route Builder
      </h1>
      
      {/* Active Route Tracking UI */}
      {activeTracking && currentRoute && (
        <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--secondary-accent)', color: 'var(--light-contrast)' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Tracking: {currentRoute.name}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={cancelRouteTracking}
                className="px-3 py-1 rounded text-sm font-bold"
                style={{ 
                  backgroundColor: 'var(--actionNegative)', 
                  color: 'var(--actionText)' 
                }}
              >
                Cancel
              </button>
              <button
                onClick={completeRouteTracking}
                className="px-3 py-1 rounded text-sm font-bold"
                style={{ 
                  backgroundColor: 'var(--actionPositive)', 
                  color: 'var(--actionText)' 
                }}
              >
                Complete
              </button>
            </div>
          </div>
          
          {/* Inventory Input UI */}
          {inventoryInputMode && (
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--background)', color: 'var(--dark-contrast)' }}>
              <h3 className="text-lg font-semibold mb-3">
                {inventoryInputMode === 'pre' ? 'Pre-Route' : 
                 inventoryInputMode === 'post' ? 'Post-Route' : 
                 inventoryInputMode === 'pre-stop' ? 'Pre-Stop' : 'Post-Stop'} Inventory Check
                {(inventoryInputMode === 'pre-stop' || inventoryInputMode === 'post-stop') && currentStopId && (
                  <span> for {currentRoute.stops.find(s => s.id === currentStopId)?.name}</span>
                )}
              </h3>
              <p className="mb-4">
                Please enter your current inventory counts for the following items:
              </p>
              
              <div className="space-y-3 mb-4">
                {Object.keys(inventoryInputValues).length > 0 ? (
                  (() => {
                    // Get all harvestable items
                    let harvestableItems: Item[] = [];
                    
                    if (inventoryInputMode === 'pre' || inventoryInputMode === 'post') {
                      // For route-level inventory, get all harvestable items
                      harvestableItems = currentRoute.stops.flatMap(stop => 
                        stop.items.filter(item => 
                          item.type === 'Harvestable'
                        )
                      );
                    } else if ((inventoryInputMode === 'pre-stop' || inventoryInputMode === 'post-stop') && currentStopId) {
                      // For stop-level inventory, get only harvestable items from the current stop
                      const currentStop = currentRoute.stops.find(s => s.id === currentStopId);
                      if (currentStop) {
                        harvestableItems = currentStop.items.filter(item => 
                          item.type === 'Harvestable'
                        );
                      }
                    }
                    
                    // Group items by name
                    const itemsByName: Record<string, Item[]> = {};
                    harvestableItems.forEach(item => {
                      if (!itemsByName[item.name]) {
                        itemsByName[item.name] = [];
                      }
                      itemsByName[item.name].push(item);
                    });
                    
                    // Create a list of unique items by name and sort them alphabetically
                    return Object.entries(itemsByName)
                      .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
                      .map(([name]) => {
                        return (
                          <div key={name} className="space-x-2 flex items-center">
                            <input
                              type="number"
                              min="0"
                              value={inventoryInputValues[name] || 0}
                              onChange={(e) => {
                                const newValue = Math.max(0, parseInt(e.target.value) || 0);
                                setInventoryInputValues(prev => ({
                                  ...prev,
                                  [name]: newValue
                                }));
                              }}
                              className="ml-2 p-1 w-20 text-right rounded"
                              style={{ 
                                backgroundColor: 'var(--light-contrast)', 
                                color: 'var(--dark-contrast)', 
                                border: '1px solid var(--secondary-accent)' 
                              }}
                            />
                            <label className="flex-grow">{name}:</label>
                          </div>
                        );
                      });
                  })()
                ) :
                  <p>No harvestable items found in this route.</p>
                }
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setInventoryInputMode(null);
                    setCurrentStopId(null);
                    
                    // Handle different skip scenarios
                    if (inventoryInputMode === 'post') {
                      // If this is post-route inventory, we need to force complete
                      const updatedTracking = {
                        ...activeTracking,
                        inventoryData: {
                          ...activeTracking.inventoryData,
                          postRoute: {} // Empty object to indicate we skipped
                        }
                      };
                      setActiveTracking(updatedTracking);
                      // Complete in the next tick
                      setTimeout(() => completeRouteTracking(), 0);
                    } else if (inventoryInputMode === 'pre-stop' && currentStopId) {
                      // If this is pre-stop inventory, continue with navigation
                      moveToPreviousStop();
                    } else if (inventoryInputMode === 'post-stop' && currentStopId) {
                      // If this is post-stop inventory, continue with navigation
                      moveToNextStop();
                    }
                  }}
                  className="px-3 py-1 rounded"
                  style={{ 
                    backgroundColor: 'var(--actionNegative)', 
                    color: 'var(--actionText)' 
                  }}
                >
                  Skip
                </button>
                <button
                  onClick={saveInventoryData}
                  className="px-3 py-1 rounded"
                  style={{ 
                    backgroundColor: 'var(--actionPositive)', 
                    color: 'var(--actionText)' 
                  }}
                >
                  Save Inventory
                </button>
              </div>
            </div>
          )}
          
          {/* Current Stop - Only show when not in inventory input mode */}
          {!inventoryInputMode && currentRoute.stops.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">
                  Stop {activeTracking.currentStopIndex + 1} of {currentRoute.stops.length}: {currentRoute.stops[activeTracking.currentStopIndex].name}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={moveToPreviousStop}
                    disabled={activeTracking.currentStopIndex === 0}
                    className="px-3 py-1 rounded text-sm"
                    style={{ 
                      backgroundColor: 'var(--background)', 
                      color: 'var(--dark-contrast)',
                      opacity: activeTracking.currentStopIndex === 0 ? 0.5 : 1
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-1" /> Previous
                  </button>
                  <button
                    onClick={moveToNextStop}
                    disabled={activeTracking.currentStopIndex === currentRoute.stops.length - 1}
                    className="px-3 py-1 rounded text-sm"
                    style={{ 
                      backgroundColor: 'var(--background)', 
                      color: 'var(--dark-contrast)',
                      opacity: activeTracking.currentStopIndex === currentRoute.stops.length - 1 ? 0.5 : 1
                    }}
                  >
                    Next <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
                  </button>
                </div>
              </div>
              
              {/* Display stop inventory data if available */}
              {activeTracking.inventoryData?.stops && 
               currentRoute.stops[activeTracking.currentStopIndex].collectData && 
               activeTracking.inventoryData.stops[currentRoute.stops[activeTracking.currentStopIndex].id] && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--background)', color: 'var(--dark-contrast)' }}>
                  <h4 className="text-md font-semibold mb-2">Stop Inventory Data</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Pre-stop inventory */}
                    {activeTracking.inventoryData.stops[currentRoute.stops[activeTracking.currentStopIndex].id].preStop && 
                     Object.keys(activeTracking.inventoryData.stops[currentRoute.stops[activeTracking.currentStopIndex].id].preStop || {}).length > 0 && (
                      <div className="p-2 rounded" style={{ backgroundColor: 'var(--secondary-background)' }}>
                        <h5 className="font-semibold mb-1">Pre-Stop Inventory</h5>
                        <ul className="text-sm">
                          {Object.entries(activeTracking.inventoryData.stops[currentRoute.stops[activeTracking.currentStopIndex].id].preStop || {})
                            .map(([itemId, count]) => {
                              const item = currentRoute.stops.flatMap(s => s.items).find(i => i.id === itemId);
                              return item ? (
                                <li key={itemId}>{item.name}: {count}</li>
                              ) : null;
                            })
                            .filter(Boolean)
                          }
                        </ul>
                      </div>
                    )}
                    
                    {/* Post-stop inventory */}
                    {activeTracking.inventoryData.stops[currentRoute.stops[activeTracking.currentStopIndex].id].postStop && 
                     Object.keys(activeTracking.inventoryData.stops[currentRoute.stops[activeTracking.currentStopIndex].id].postStop || {}).length > 0 && (
                      <div className="p-2 rounded" style={{ backgroundColor: 'var(--secondary-background)' }}>
                        <h5 className="font-semibold mb-1">Post-Stop Inventory</h5>
                        <ul className="text-sm">
                          {Object.entries(activeTracking.inventoryData.stops[currentRoute.stops[activeTracking.currentStopIndex].id].postStop || {})
                            .map(([itemId, count]) => {
                              const item = currentRoute.stops.flatMap(s => s.items).find(i => i.id === itemId);
                              return item ? (
                                <li key={itemId}>{item.name}: {count}</li>
                              ) : null;
                            })
                            .filter(Boolean)
                          }
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {currentRoute.stops[activeTracking.currentStopIndex].description && (
                <p className="mb-4 p-3 rounded" style={{ backgroundColor: 'var(--background)', color: 'var(--dark-contrast)' }}>
                  {currentRoute.stops[activeTracking.currentStopIndex].description}
                </p>
              )}
              
              {/* Items to collect at this stop */}
              <div className="p-4 rounded" style={{ backgroundColor: 'var(--background)', color: 'var(--dark-contrast)' }}>
                <h4 className="font-medium mb-2">Items to collect:</h4>
                {currentRoute.stops[activeTracking.currentStopIndex].items.length === 0 ? (
                  <p>No items to collect at this stop.</p>
                ) : (
                  <ul className="space-y-2">
                    {currentRoute.stops[activeTracking.currentStopIndex].items.map(item => (
                      <li key={item.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={activeTracking.collectedItems[item.id] || false}
                          onChange={() => toggleItemCollected(item.id)}
                          className="mr-2 h-5 w-5"
                          style={{ accentColor: 'var(--main-accent)' }}
                        />
                        <span className={activeTracking.collectedItems[item.id] ? 'line-through' : ''}>
                          {(item.type === 'Bobblehead' || item.type === 'Magazine') ? (
                            <>
                              {item.type}
                              {item.description && (
                                <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {item.description}
                                </span>
                              )}
                            </>
                          ) : item.type === 'Consumable' ? (
                            <>
                              {item.name} ({item.quantity}x {item.type})
                              {item.description && (
                                <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {item.description}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              {item.name} ({item.type})
                              {item.description && (
                                <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {item.description}
                                </span>
                              )}
                            </>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          
          {/* Notes */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Route Notes</h3>
            <textarea
              value={trackingNotes}
              onChange={(e) => setTrackingNotes(e.target.value)}
              onKeyDown={(e) => {
                // Allow shift+enter for new lines, but ctrl+enter to save
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  saveTrackingNotes();
                }
              }}
              className="w-full p-3 rounded mb-2"
              rows={4}
              style={{ backgroundColor: 'var(--background)', color: 'var(--dark-contrast)' }}
              placeholder="Add notes about your progress, items found, etc."
            />
            <div className="flex justify-between items-center">
              <button
                onClick={saveTrackingNotes}
                className="px-3 py-1 rounded"
                style={{ backgroundColor: 'var(--main-accent)', color: 'var(--light-contrast)' }}
              >
                Save Notes
              </button>
              <small style={{ color: 'var(--text-muted)' }}>Tip: Press Ctrl+Enter to save</small>
            </div>
          </div>
          
          {/* Progress Summary */}
          <div className="p-4 rounded" style={{ backgroundColor: 'var(--background)', color: 'var(--dark-contrast)' }}>
            <h3 className="text-lg font-semibold mb-2">Progress Summary</h3>
            
            {/* Calculate total items and collected items */}
            {(() => {
              let totalItems = 0;
              let collectedItemCount = 0;
              
              currentRoute.stops.forEach(stop => {
                stop.items.forEach(item => {
                  totalItems++;
                  if (activeTracking.collectedItems[item.id]) {
                    collectedItemCount++;
                  }
                });
              });
              
              const progressPercentage = totalItems > 0 ? Math.round((collectedItemCount / totalItems) * 100) : 0;
              
              return (
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Items Collected:</span>
                    <span>{collectedItemCount} / {totalItems} ({progressPercentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2.5 mb-4">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ 
                        width: `${progressPercentage}%`,
                        backgroundColor: 'var(--main-accent)'
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Stop:</span>
                    <span>{activeTracking.currentStopIndex + 1} / {currentRoute.stops.length}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2.5 mb-4">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ 
                        width: `${((activeTracking.currentStopIndex + 1) / currentRoute.stops.length) * 100}%`,
                        backgroundColor: 'var(--main-accent)'
                      }}
                    ></div>
                  </div>
                  <div className="text-sm">
                    <span>Started: {new Date(activeTracking.startTime).toLocaleString()}</span>
                  </div>
                  
                  {/* Inventory Results */}
                  {activeTracking.inventoryData && 
                   activeTracking.inventoryData.preRoute && 
                   Object.keys(activeTracking.inventoryData.preRoute).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <h4 className="font-medium mb-2">Inventory Tracking:</h4>
                      <div className="space-y-2">
                        {(() => {
                          // Get all harvestable items with inventory data
                          const harvestableItems = currentRoute.stops.flatMap(stop => 
                            stop.items.filter(item => 
                              item.type === 'Harvestable'
                            )
                          );
                          
                          // Group items by name
                          const itemsByName: Record<string, Item[]> = {};
                          harvestableItems.forEach(item => {
                            if (!itemsByName[item.name]) {
                              itemsByName[item.name] = [];
                            }
                            itemsByName[item.name].push(item);
                          });
                          
                          // Create a list of unique items by name
                          return Object.entries(itemsByName).map(([name]) => {
                            // Get the pre and post counts by name
                            const preCount = activeTracking.inventoryData?.preRoute?.[name] || 0;
                            const postCount = activeTracking.inventoryData?.postRoute?.[name];
                            const diff = postCount !== undefined ? postCount - preCount : null;
                            
                            return (
                              <div key={name} className="flex justify-between">
                                <span>{name}:</span>
                                <span>
                                  {preCount} → {postCount !== undefined ? postCount : '?'} 
                                  {diff !== null && (
                                    <span style={{ 
                                      color: diff > 0 ? 'var(--actionPositive)' : diff < 0 ? 'var(--actionNegative)' : 'inherit',
                                      marginLeft: '0.5rem'
                                    }}>
                                      ({diff > 0 ? '+' : ''}{diff})
                                    </span>
                                  )}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
      
      {/* Show the route builder UI only when not actively tracking */}
      {!activeTracking && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Route Management Section */}
          <div className="bg-opacity-10 p-4 rounded-lg" style={{ backgroundColor: 'var(--secondary-accent)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--main-accent)' }}>
              Route Management
            </h2>

            {/* Your Routes Section */}
            {routes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Your Routes</h3>
                
                {/* Active Tracking Warning */}
                {activeTracking && (activeTracking as RouteProgress).routeId && currentRoute?.id !== (activeTracking as RouteProgress).routeId && (
                  <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--main-accent)', color: 'var(--light-contrast)' }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold mb-1">Active Tracking Session</h4>
                        <p className="text-sm">
                          There is an active tracking session for route: {routes.find(r => r.id === (activeTracking as RouteProgress).routeId)?.name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const route = routes.find(r => r.id === (activeTracking as RouteProgress).routeId);
                            if (route) {
                              handleRouteActivation(route);
                            }
                          }}
                          className="px-3 py-1 rounded text-sm font-bold"
                          style={{ 
                            backgroundColor: 'var(--actionPositive)', 
                            color: 'var(--actionText)' 
                          }}
                        >
                          <FontAwesomeIcon icon={faPlay} className="mr-1" /> Resume
                        </button>
                        <button
                          onClick={cancelRouteTracking}
                          className="px-3 py-1 rounded text-sm font-bold"
                          style={{ 
                            backgroundColor: 'var(--actionNegative)', 
                            color: 'var(--actionText)' 
                          }}
                        >
                          <FontAwesomeIcon icon={faTimes} className="mr-1" /> Clear
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <ul className="space-y-4">
                  {routes.map(route => (
                    <li 
                      key={route.id}
                      className="rounded cursor-pointer overflow-hidden"
                      style={{ 
                        backgroundColor: currentRoute?.id === route.id ? 'var(--activeHighlight)' : 'var(--background)',
                        border: '1px solid var(--secondary-accent)',
                        color: currentRoute?.id === route.id ? 'var(--light-contrast)' : undefined
                      }}
                    >
                      <div className="p-4">
                        {/* Route title on top line */}
                        <div className="text-lg font-medium mb-2">{route?.name}</div>
                        
                        {/* Stops and runs on next line */}
                        <div className="flex items-center mb-3">
                          <span className="text-sm mr-4">{route?.stops.length} stops</span>
                          <span className="text-sm">{route?.completedRuns || 0} runs</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {currentRoute?.id === route.id ? (
                            // Active route - show main buttons and actions flyout
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Only toggle expanded view, don't set current route
                                  setExpandedRoutes(prev => ({
                                    ...prev,
                                    [route.id]: !prev[route.id]
                                  }));
                                }}
                                className="px-3 py-2 rounded text-sm stops-button min-w-[80px] flex items-center justify-center"
                                style={{ 
                                  backgroundColor: expandedRoutes[route.id] ? 'var(--activeButtonBg)' : 'var(--secondary-accent)', 
                                  color: expandedRoutes[route.id] ? 'var(--activeButtonText)' : 'var(--light-contrast)',
                                  border: expandedRoutes[route.id] ? '2px solid var(--light-contrast)' : 'none'
                                }}
                              >
                                <FontAwesomeIcon icon={faList} className="mr-1" /> Stops
                              </button>

                              {/* Start/Resume and Clear Session buttons */}
                              <div className="flex gap-2">
                                {!activeTracking && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startRouteTracking();
                                    }}
                                    className="px-3 py-2 rounded text-sm min-w-[80px] flex items-center justify-center"
                                    style={{ 
                                      backgroundColor: 'var(--actionPositive)', 
                                      color: 'var(--actionText)',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faPlay} className="mr-1" /> Start
                                  </button>
                                )}
                                {activeTracking && (activeTracking as RouteProgress).routeId === route.id && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRouteActivation(route);
                                      }}
                                      className="px-3 py-2 rounded text-sm min-w-[80px] flex items-center justify-center"
                                      style={{ 
                                        backgroundColor: 'var(--actionPositive)', 
                                        color: 'var(--actionText)',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      <FontAwesomeIcon icon={faPlay} className="mr-1" /> Resume
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        cancelRouteTracking();
                                      }}
                                      className="px-3 py-2 rounded text-sm min-w-[80px] flex items-center justify-center"
                                      style={{ 
                                        backgroundColor: 'var(--actionNegative)', 
                                        color: 'var(--actionText)',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      <FontAwesomeIcon icon={faTimes} className="mr-1" /> Clear
                                    </button>
                                  </div>
                                )}
                                {activeTracking && (activeTracking as RouteProgress).routeId !== route.id && (
                                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                    Another route is active
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Toggle actions flyout
                                  setExpandedActions(prev => ({
                                    ...prev,
                                    [route.id]: !prev[route.id]
                                  }));
                                }}
                                className="px-3 py-2 rounded text-sm min-w-[80px] flex items-center justify-center"
                                style={{ 
                                  backgroundColor: expandedActions[route.id] ? 'var(--activeButtonBg)' : 'var(--secondary-accent)', 
                                  color: expandedActions[route.id] ? 'var(--activeButtonText)' : 'var(--light-contrast)',
                                  border: expandedActions[route.id] ? '2px solid var(--light-contrast)' : 'none'
                                }}
                              >
                                <FontAwesomeIcon icon={faEllipsisV} className="mr-1" /> Actions
                              </button>
                            </>
                          ) : (
                            // Inactive route - show activate button
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRouteActivation(route);
                              }}
                              className="px-3 py-2 rounded text-sm min-w-[80px] flex items-center justify-center"
                              style={{ 
                                backgroundColor: 'var(--secondary-accent)', 
                                color: 'var(--light-contrast)'
                              }}
                            >
                              <FontAwesomeIcon icon={faEdit} className="mr-1" /> Activate
                            </button>
                          )}
                        </div>

                        {/* Actions flyout */}
                        {currentRoute?.id === route.id && expandedActions[route.id] && (
                          <div className="flex flex-wrap gap-2 mt-2 pl-2 pt-2 border-t actions-flyout" style={{ borderColor: 'var(--secondary-accent)' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearRouteHistory(route.id).catch(err => {
                                  console.error('Error clearing route history:', err);
                                  showNotification('Failed to clear route history.', 'error');
                                });
                                // Close the actions flyout
                                setExpandedActions(prev => ({
                                  ...prev,
                                  [route.id]: false
                                }));
                              }}
                              className="px-3 py-2 rounded text-sm min-w-[120px] flex items-center justify-center"
                              style={{ 
                                backgroundColor: 'var(--secondary-accent)', 
                                color: 'var(--light-contrast)'
                              }}
                            >
                              <FontAwesomeIcon icon={faHistory} className="mr-1" /> Clear History
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRoute(route.id).catch(err => {
                                  console.error('Error deleting route:', err);
                                  showNotification('Failed to delete route.', 'error');
                                });
                                // Close the actions flyout
                                setExpandedActions(prev => ({
                                  ...prev,
                                  [route.id]: false
                                }));
                              }}
                              className="px-3 py-2 rounded text-sm min-w-[80px] flex items-center justify-center"
                              style={{ 
                                backgroundColor: 'var(--actionNegative)', 
                                color: 'var(--actionText)'
                              }}
                            >
                              <FontAwesomeIcon icon={faTrash} className="mr-1" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Expanded stops view */}
                      {expandedRoutes[route.id] && (
                        <div className="p-3 border-t" style={{ borderColor: 'var(--secondary-accent)', backgroundColor: 'rgba(0,0,0,0.05)' }}>
                          <h4 className="text-sm font-medium mb-2">Stops:</h4>
                          {route?.stops.length === 0 ? (
                            <p className="text-sm">No stops added yet.</p>
                          ) : (
                            <ul className="space-y-2 pl-4">
                              {route?.stops.map((stop, index) => (
                                <li key={stop.id} className="text-sm">
                                  <div className="font-medium">{index + 1}. {stop?.name}</div>
                                  <div className="text-xs ml-4">{stop?.items.length} items</div>
                                  {stop.collectData && (
                                    <div className="text-xs ml-4 mt-1" style={{ color: 'var(--main-accent)' }}>
                                      Collects baseline data
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Create New Route */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--light-contrast)', border: '1px solid var(--secondary-accent)' }}>
              <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => setIsCreateRouteExpanded(!isCreateRouteExpanded)}
              >
                <h3 className="text-lg font-medium mb-2">Create New Route</h3>
                <FontAwesomeIcon 
                  icon={isCreateRouteExpanded ? faTimes : faPlus} 
                  className="text-lg"
                  style={{ color: 'var(--secondary-accent)' }}
                />
              </div>
              
              {isCreateRouteExpanded && (
                <>
                  <div className="mb-3">
                    <label className="block mb-1">Route Name:</label>
                    <input
                      type="text"
                      value={newRouteName}
                      onChange={(e) => setNewRouteName(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, createRoute)}
                      className="w-full p-2 rounded"
                      style={{ 
                        backgroundColor: 'var(--light-contrast)', 
                        color: 'var(--dark-contrast)', 
                        border: '1px solid var(--secondary-accent)' 
                      }}
                      placeholder="e.g., Acid Run"
                      ref={routeNameInputRef}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block mb-1">Description:</label>
                    <textarea
                      value={newRouteDescription}
                      onChange={(e) => setNewRouteDescription(e.target.value)}
                      className="w-full p-2 rounded"
                      style={{ 
                        backgroundColor: 'var(--light-contrast)', 
                        color: 'var(--dark-contrast)', 
                        border: '1px solid var(--secondary-accent)' 
                      }}
                      placeholder="e.g., A route for collecting acid from various locations"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newRouteAutoInventoryChecks}
                        onChange={(e) => setNewRouteAutoInventoryChecks(e.target.checked)}
                        className="mr-2"
                      />
                      <span>Auto Inventory Checks</span>
                    </label>
                    <small className="block mt-1" style={{ color: 'var(--text-muted)' }}>
                      When checked, the app will ask for inventory count information for harvestable items within the route.
                    </small>
                  </div>
                  
                  <button
                    onClick={createRoute}
                    className="px-4 py-2 rounded"
                    style={{ 
                      backgroundColor: 'var(--main-accent)', 
                      color: 'var(--dark-contrast)',
                      fontWeight: 'bold'
                    }}
                  >
                    Create Route
                  </button>
                  <small className="block mt-2" style={{ color: 'var(--text-muted)' }}>
                    Tip: Press Enter in the name field to create the route
                  </small>
                </>
              )}
            </div>
          </div>
          
          {/* Route Builder Section */}
          <div className="bg-opacity-10 p-4 rounded-lg" style={{ backgroundColor: 'var(--secondary-accent)' }}>
            {currentRoute ? (
              <>
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--main-accent)' }}>
                  Building Route: {currentRoute?.name}
                </h2>
                
                {/* Route Details Edit Section */}
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--light-contrast)', border: '1px solid var(--secondary-accent)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Route Details</h3>
                    <button
                      onClick={() => setIsEditingRouteDetails(!isEditingRouteDetails)}
                      className="px-3 py-1 rounded text-sm"
                      style={{ 
                        backgroundColor: isEditingRouteDetails ? 'var(--main-accent)' : 'var(--secondary-accent)', 
                        color: 'var(--light-contrast)' 
                      }}
                    >
                      {isEditingRouteDetails ? 'Cancel' : 'Edit Details'}
                    </button>
                  </div>
                  
                  {isEditingRouteDetails ? (
                    <>
                      <div className="mb-3">
                        <label className="block mb-1">Route Name:</label>
                        <input
                          type="text"
                          value={editingRouteName}
                          onChange={(e) => setEditingRouteName(e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, updateRouteDetails)}
                          className="w-full p-2 rounded"
                          style={{ 
                            backgroundColor: 'var(--light-contrast)', 
                            color: 'var(--dark-contrast)', 
                            border: '1px solid var(--secondary-accent)' 
                          }}
                          placeholder="Route name"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block mb-1">Description:</label>
                        <textarea
                          value={editingRouteDescription}
                          onChange={(e) => setEditingRouteDescription(e.target.value)}
                          className="w-full p-2 rounded"
                          style={{ 
                            backgroundColor: 'var(--light-contrast)', 
                            color: 'var(--dark-contrast)', 
                            border: '1px solid var(--secondary-accent)' 
                          }}
                          placeholder="Route description"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingRouteAutoInventoryChecks}
                            onChange={(e) => setEditingRouteAutoInventoryChecks(e.target.checked)}
                            className="mr-2"
                          />
                          <span>Auto Inventory Checks</span>
                        </label>
                        <small className="block mt-1" style={{ color: 'var(--text-muted)' }}>
                          When checked, the app will automatically ask for an inventory check before the first stop and after the last stop for harvestable items listed in the stops.
                        </small>
                      </div>
                      <button
                        onClick={updateRouteDetails}
                        className="px-4 py-2 rounded"
                        style={{ 
                          backgroundColor: 'var(--main-accent)', 
                          color: 'var(--dark-contrast)',
                          fontWeight: 'bold'
                        }}
                      >
                        Save Details
                      </button>
                    </>
                  ) : (
                    <div>
                      <p className="mb-1"><strong>Name:</strong> {currentRoute?.name}</p>
                      <p><strong>Description:</strong> {currentRoute?.description || 'No description provided'}</p>
                      {currentRoute?.autoInventoryChecks && (
                        <p className="mb-1"><strong>Auto Inventory Checks:</strong> Enabled</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Add Stop Form */}
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--light-contrast)', border: '1px solid var(--secondary-accent)' }}>
                  <h3 className="text-lg font-medium mb-2">Add New Stop</h3>
                  <div className="mb-3">
                    <label className="block mb-1">Stop Name:</label>
                    <input
                      type="text"
                      value={newStopName}
                      onChange={(e) => setNewStopName(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, addStop)}
                      className="w-full p-2 rounded"
                      style={{ 
                        backgroundColor: 'var(--light-contrast)', 
                        color: 'var(--dark-contrast)', 
                        border: '1px solid var(--secondary-accent)' 
                      }}
                      placeholder="e.g., Whitespring Resort"
                      ref={stopNameInputRef}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block mb-1">Description:</label>
                    <textarea
                      value={newStopDescription}
                      onChange={(e) => setNewStopDescription(e.target.value)}
                      className="w-full p-2 rounded"
                      style={{ 
                        backgroundColor: 'var(--light-contrast)', 
                        color: 'var(--dark-contrast)', 
                        border: '1px solid var(--secondary-accent)' 
                      }}
                      placeholder="e.g., Check the golf club for ghouls and rare junk"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newStopCollectData}
                        onChange={(e) => setNewStopCollectData(e.target.checked)}
                        className="mr-2"
                      />
                      <span>Collect inventory data</span>
                    </label>
                    <small className="block mt-1" style={{ color: 'var(--text-muted)' }}>
                      When checked, the app will ask for inventory counts for harvestable items for this stop at the start and end of the stop.
                    </small>
                  </div>
                  <button
                    onClick={addStop}
                    className="px-4 py-2 rounded"
                    style={{ 
                      backgroundColor: 'var(--main-accent)', 
                      color: 'var(--dark-contrast)',
                      fontWeight: 'bold'
                    }}
                  >
                    Add Stop
                  </button>
                  <small className="block mt-2" style={{ color: 'var(--text-muted)' }}>
                    Tip: Press Enter in the name field to add the stop
                  </small>
                </div>
                
                {/* Stops List */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Stops in this Route</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">{currentRoute.stops.length} stops total</span>
                    <button
                      onClick={toggleReorderingMode}
                      className="px-3 py-1 rounded text-sm"
                      style={{ 
                        backgroundColor: isReorderingMode ? 'var(--main-accent)' : 'var(--secondary-accent)', 
                        color: 'var(--light-contrast)' 
                      }}
                    >
                      {isReorderingMode ? 'Done Reordering' : 'Reorder Stops'}
                    </button>
                  </div>
                  {currentRoute.stops.length === 0 ? (
                    <p>No stops added to this route yet.</p>
                  ) : (
                    <div 
                      className="space-y-4 overflow-y-auto"
                      style={{ 
                        maxHeight: isReorderingMode ? '60vh' : 'none',
                        overflowX: 'visible',
                        paddingRight: '10px'
                      }}
                    >
                      {isReorderingMode ? (
                        // Reordering mode view
                        [...currentRoute.stops].map((stop, index) => (
                          <div 
                            key={stop.id}
                            className="p-3 rounded-lg flex items-center"
                            style={{ 
                              backgroundColor: 'var(--light-contrast)', 
                              border: '1px solid var(--secondary-accent)',
                              cursor: 'grab',
                              position: 'relative',
                              zIndex: 1
                            }}
                          >
                            <div className="flex-grow">
                              <h4 className="font-medium">{stop.name}</h4>
                              {stop.description && (
                                <p className="text-sm truncate">{stop.description}</p>
                              )}
                              <div className="text-xs">
                                {stop.items.length} items
                              </div>
                            </div>
                            <div className="flex flex-col space-y-1" style={{ zIndex: 2, position: 'relative' }}>
                              <button
                                onClick={() => index > 0 && reorderStops(index, index - 1)}
                                disabled={index === 0}
                                className="px-2 py-1 rounded text-sm reorder-button"
                                style={{ 
                                  backgroundColor: index === 0 ? 'var(--secondary-accent-muted)' : 'var(--secondary-accent)', 
                                  color: 'var(--light-contrast)',
                                  opacity: index === 0 ? 0.5 : 1,
                                  minWidth: '36px'
                                }}
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => index < currentRoute.stops.length - 1 && reorderStops(index, index + 1)}
                                disabled={index === currentRoute.stops.length - 1}
                                className="px-2 py-1 rounded text-sm reorder-button"
                                style={{ 
                                  backgroundColor: index === currentRoute.stops.length - 1 ? 'var(--secondary-accent-muted)' : 'var(--secondary-accent)', 
                                  color: 'var(--light-contrast)',
                                  opacity: index === currentRoute.stops.length - 1 ? 0.5 : 1,
                                  minWidth: '36px'
                                }}
                              >
                                ↓
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        // Normal view
                        [...currentRoute.stops].reverse().map((stop, index) => (
                          <div 
                            key={stop.id}
                            className="p-4 rounded-lg"
                            style={{ backgroundColor: 'var(--light-contrast)', border: '1px solid var(--secondary-accent)' }}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <h4 className="text-sm font-semibold" style={{ color: 'var(--dark-contrast)' }}>
                                  Stop {currentRoute.stops.length - index}
                                </h4>
                                <h4 className="font-medium">{stop.name}</h4>
                                {stop.collectData && (
                                  <div className="text-xs mt-1 px-2 py-1 inline-block rounded" style={{ 
                                    backgroundColor: 'var(--main-accent)', 
                                    color: 'var(--dark-contrast)' 
                                  }}>
                                    Collects baseline data
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={toggleReorderingItemsMode}
                                  className="px-2 py-1 rounded text-sm"
                                  style={{ 
                                    backgroundColor: isReorderingItems ? 'var(--extra-pop)' : 'var(--secondary-accent)', 
                                    color: 'var(--light-contrast)',
                                    fontWeight: isReorderingItems ? 'bold' : 'normal'
                                  }}
                                  aria-label={isReorderingItems ? "Exit item reordering mode" : "Reorder items"}
                                >
                                  {isReorderingItems ? "Done Reordering" : "Reorder Items"}
                                </button>
                                <button
                                  onClick={() => editStop(stop.id)}
                                  className="px-2 py-1 rounded text-sm"
                                  style={{ backgroundColor: 'var(--main-accent)', color: 'var(--dark-contrast)' }}
                                  aria-label={`Edit ${stop.name}`}
                                  disabled={isReorderingItems}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                  onClick={() => {
                                    deleteStop(stop.id).catch(err => {
                                      console.error('Error deleting stop:', err);
                                      showNotification('Failed to delete stop.', 'error');
                                    });
                                  }}
                                  className="px-2 py-1 rounded text-sm"
                                  style={{ backgroundColor: 'var(--extra-pop)', color: 'var(--light-contrast)' }}
                                  aria-label={`Remove ${stop.name}`}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                  <span className="sr-only">Remove</span>
                                </button>
                              </div>
                            </div>
                            
                            {stop.description && (
                              <p className="mb-3 text-sm">{stop.description}</p>
                            )}
                            
                            {/* Edit Stop Form */}
                            {isEditingStop === stop.id && (
                              <div className="mt-2 mb-4 p-3 rounded" style={{ backgroundColor: 'var(--secondary-bg)' }}>
                                <h5 className="font-medium mb-2">Edit Stop</h5>
                                <div className="mb-3">
                                  <label className="block text-sm mb-1">Stop Name</label>
                                  <input
                                    type="text"
                                    value={editStopName}
                                    onChange={(e) => setEditStopName(e.target.value)}
                                    onKeyDown={(e) => handleStopEditKeyPress(e)}
                                    className="w-full p-2 rounded"
                                    style={{ 
                                      backgroundColor: 'var(--light-contrast)', 
                                      color: 'var(--dark-contrast)', 
                                      border: '1px solid var(--secondary-accent)' 
                                    }}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="block text-sm mb-1">Description</label>
                                  <textarea
                                    value={editStopDescription}
                                    onChange={(e) => setEditStopDescription(e.target.value)}
                                    className="w-full p-2 rounded"
                                    style={{ 
                                      backgroundColor: 'var(--light-contrast)', 
                                      color: 'var(--dark-contrast)', 
                                      border: '1px solid var(--secondary-accent)' 
                                    }}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={editStopCollectData}
                                      onChange={(e) => setEditStopCollectData(e.target.checked)}
                                      className="mr-2"
                                    />
                                    <span>Collect baseline inventory data</span>
                                  </label>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={saveEditedStop}
                                    className="px-3 py-1 rounded"
                                    style={{ 
                                      backgroundColor: 'var(--main-accent)', 
                                      color: 'var(--dark-contrast)',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    Save Changes
                                  </button>
                                  <button
                                    onClick={cancelEditStop}
                                    className="px-3 py-1 rounded"
                                    style={{ 
                                      backgroundColor: 'var(--secondary-accent)', 
                                      color: 'var(--light-contrast)' 
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            {/* Items at this stop */}
                            <div className="mb-3">
                              <h5 className="font-medium mb-1">Items to collect:</h5>
                              {stop.items.length === 0 ? (
                                <p className="text-sm">No items added yet.</p>
                              ) : (
                                <ul className="space-y-1 reorder-items-container">
                                  {stop.items.map((item, itemIndex) => (
                                    <li key={item.id} className="flex justify-between items-center text-sm" style={{
                                      position: 'relative',
                                      overflow: 'visible',
                                      zIndex: 1
                                    }}>
                                      <span style={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {usesDefaultName(item.type) ? (
                                          <>
                                            <span className="font-medium">{item.type}</span>
                                            {item.description && (
                                              <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {item.description}
                                              </span>
                                            )}
                                          </>
                                        ) : item.type === 'Consumable' ? (
                                          <>
                                            <span className="font-medium">{item.name}</span> ({item.quantity}x {item.type})
                                            {item.description && (
                                              <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {item.description}
                                              </span>
                                            )}
                                          </>
                                        ) : (
                                          <>
                                            <span className="font-medium">{item.name}</span> ({item.type})
                                            {item.description && (
                                              <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {item.description}
                                              </span>
                                            )}
                                          </>
                                        )}
                                      </span>
                                      <div className="flex items-center space-x-1">
                                        {isReorderingItems ? (
                                          <>
                                            {itemIndex > 0 ? (
                                              <button
                                                onClick={() => reorderItems(stop.id, itemIndex, itemIndex - 1)}
                                                className="px-2 py-1 rounded text-sm mr-1 reorder-button"
                                                style={{ 
                                                  backgroundColor: '#3498db', // Bright blue background
                                                  color: 'white', // White text
                                                  width: '36px',
                                                  height: '36px',
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  fontWeight: 'bold',
                                                  position: 'static',
                                                  zIndex: 9999,
                                                  visibility: 'visible',
                                                  transform: 'none',
                                                  transition: 'none',
                                                  animation: 'none',
                                                  overflow: 'visible',
                                                  marginRight: '4px',
                                                  border: '2px solid #2980b9', // Darker blue border
                                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' // Add shadow for depth
                                                }}
                                                aria-label="Move item up"
                                              >
                                                ↑
                                              </button>
                                            ) : (
                                              <div style={{ width: '36px', height: '36px', marginRight: '4px' }}></div>
                                            )}
                                            
                                            {itemIndex < stop.items.length - 1 ? (
                                              <button
                                                onClick={() => reorderItems(stop.id, itemIndex, itemIndex + 1)}
                                                className="px-2 py-1 rounded text-sm mr-1 reorder-button"
                                                style={{ 
                                                  backgroundColor: '#3498db', // Bright blue background
                                                  color: 'white', // White text
                                                  width: '36px',
                                                  height: '36px',
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  fontWeight: 'bold',
                                                  position: 'static',
                                                  zIndex: 9999,
                                                  visibility: 'visible',
                                                  transform: 'none',
                                                  transition: 'none',
                                                  animation: 'none',
                                                  overflow: 'visible',
                                                  marginRight: '4px',
                                                  border: '2px solid #2980b9', // Darker blue border
                                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' // Add shadow for depth
                                                }}
                                                aria-label="Move item down"
                                              >
                                                ↓
                                              </button>
                                            ) : (
                                              <div style={{ width: '36px', height: '36px', marginRight: '4px' }}></div>
                                            )}
                                          </>
                                        ) : (
                                          <div className="flex space-x-1">
                                            <button
                                              onClick={() => {
                                                deleteItem(stop.id, item.id).catch(err => {
                                                  console.error('Error deleting item:', err);
                                                  showNotification('Failed to delete item.', 'error');
                                                });
                                              }}
                                              className="px-2 py-1 rounded text-sm"
                                              style={{ 
                                                backgroundColor: 'var(--extra-pop)', 
                                                color: 'var(--light-contrast)',
                                                width: '36px',
                                                height: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                              }}
                                              aria-label={`Remove ${item.name}`}
                                            >
                                              <FontAwesomeIcon icon={faTrash} />
                                              <span className="sr-only">Remove</span>
                                            </button>
                                            <button
                                              onClick={() => editItem(stop.id, item.id)}
                                              className="px-2 py-1 rounded text-sm"
                                              style={{ 
                                                backgroundColor: 'var(--main-accent)', 
                                                color: 'var(--dark-contrast)',
                                                width: '36px',
                                                height: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                              }}
                                              aria-label={`Edit ${item.name}`}
                                            >
                                              <FontAwesomeIcon icon={faEdit} />
                                              <span className="sr-only">Edit</span>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              
                              {/* Item Edit Form */}
                              {isEditingItem && isEditingItem.stopId === stop.id && (
                                <div className="mt-2 mb-4 p-3 rounded" style={{ backgroundColor: 'var(--secondary-bg)' }}>
                                  <h5 className="font-medium mb-2">Edit Item</h5>
                                  
                                  <div className="mb-3">
                                    <label className="block text-sm mb-1">Item Type</label>
                                    <select
                                      value={editItemType}
                                      onChange={(e) => setEditItemType(e.target.value)}
                                      className="w-full p-2 rounded"
                                      style={{ 
                                        backgroundColor: 'var(--light-contrast)', 
                                        color: 'var(--dark-contrast)', 
                                        border: '1px solid var(--secondary-accent)' 
                                      }}
                                    >
                                      {DEFAULT_ITEM_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                      ))}
                                    </select>
                                  </div>
                                  
                                  {/* Only show name field for types that require a custom name */}
                                  {requiresCustomName(editItemType) && (
                                    <div className="mb-3">
                                      <label className="block text-sm mb-1">Item Name</label>
                                      <input
                                        type="text"
                                        value={editItemName}
                                        onChange={(e) => setEditItemName(e.target.value)}
                                        onKeyDown={(e) => handleItemEditKeyPress(e)}
                                        className="w-full p-2 rounded"
                                        style={{ 
                                          backgroundColor: 'var(--light-contrast)', 
                                          color: 'var(--dark-contrast)', 
                                          border: '1px solid var(--secondary-accent)' 
                                        }}
                                        placeholder={`Enter ${editItemType} name`}
                                      />
                                    </div>
                                  )}
                                  
                                  <div className="mb-3">
                                    <label className="block text-sm mb-1">
                                      Description
                                      {(editItemType === 'Bobblehead' || editItemType === 'Magazine') && 
                                        <span className="text-xs ml-1" style={{ color: 'var(--actionPositive)' }}>
                                          (Recommended for {editItemType}s)
                                        </span>
                                      }
                                    </label>
                                    <textarea
                                      value={editItemDescription}
                                      onChange={(e) => setEditItemDescription(e.target.value)}
                                      className="w-full p-2 rounded"
                                      style={{ 
                                        backgroundColor: 'var(--light-contrast)', 
                                        color: 'var(--dark-contrast)', 
                                        border: '1px solid var(--secondary-accent)' 
                                      }}
                                      placeholder={
                                        (editItemType === 'Bobblehead' || editItemType === 'Magazine') 
                                          ? "e.g., On the shelf in the corner office (optional but recommended)" 
                                          : "e.g., Any helpful location details (optional)"
                                      }
                                    />
                                  </div>
                                  
                                  {editItemType === 'Consumable' && (
                                    <div className="mb-3">
                                      <label className="block text-sm mb-1">Quantity</label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={editItemQuantity}
                                        onChange={(e) => setEditItemQuantity(parseInt(e.target.value) || 1)}
                                        className="w-full p-2 rounded"
                                        style={{ 
                                          backgroundColor: 'var(--light-contrast)', 
                                          color: 'var(--dark-contrast)', 
                                          border: '1px solid var(--secondary-accent)' 
                                        }}
                                      />
                                    </div>
                                  )}
                                  
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={saveEditedItem}
                                      className="px-3 py-1 rounded"
                                      style={{ 
                                        backgroundColor: 'var(--main-accent)', 
                                        color: 'var(--dark-contrast)',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      Save Changes
                                    </button>
                                    <button
                                      onClick={cancelEditItem}
                                      className="px-3 py-1 rounded"
                                      style={{ 
                                        backgroundColor: 'var(--secondary-accent)', 
                                        color: 'var(--light-contrast)' 
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Add Item Form */}
                            <div className="p-3 rounded" style={{ backgroundColor: 'var(--background)' }}>
                              <h5 className="font-medium mb-2">Add Item to this Stop</h5>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                {/* Show Item Name for types that require a custom name */}
                                {requiresCustomName(newItemType) && (
                                  <div>
                                    <label className="block text-xs mb-1">Item Name:</label>
                                    <input
                                      type="text"
                                      value={newItemNames[stop.id] || ''}
                                      onChange={(e) => setNewItemNames(prev => ({...prev, [stop.id]: e.target.value}))}
                                      onKeyDown={(e) => handleKeyPress(e, () => addItemToStop(stop.id))}
                                      className="w-full p-1 rounded text-sm"
                                      style={{ 
                                        backgroundColor: 'var(--light-contrast)', 
                                        color: 'var(--dark-contrast)', 
                                        border: '1px solid var(--secondary-accent)' 
                                      }}
                                      placeholder="e.g., Nuka Cola"
                                      ref={itemNameInputRef}
                                    />
                                  </div>
                                )}

                                <div className={requiresCustomName(newItemType) ? '' : 'col-span-2'}>
                                  <label className="block text-xs mb-1">Item Type:</label>
                                  <select
                                    value={newItemType}
                                    onChange={(e) => setNewItemType(e.target.value)}
                                    className="w-full p-1 rounded text-sm"
                                    style={{ 
                                      backgroundColor: 'var(--light-contrast)', 
                                      color: 'var(--dark-contrast)', 
                                      border: '1px solid var(--secondary-accent)' 
                                    }}
                                  >
                                    {DEFAULT_ITEM_TYPES.map(type => (
                                      <option key={type} value={type}>{type}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              {/* Description field - especially useful for Bobbleheads and Magazines */}
                              <div className="mb-2">
                                <label className="block text-xs mb-1">
                                  Location Description:
                                  {usesDefaultName(newItemType) && 
                                    <span className="text-xs ml-1" style={{ color: 'var(--actionPositive)' }}>
                                      (Recommended for {newItemType}s)
                                    </span>
                                  }
                                </label>
                                <input
                                  type="text"
                                  value={newItemDescriptions[stop.id] || ''}
                                  onChange={(e) => setNewItemDescriptions(prev => ({...prev, [stop.id]: e.target.value}))}
                                  onKeyDown={(e) => handleKeyPress(e, () => addItemToStop(stop.id))}
                                  className="w-full p-1 rounded text-sm"
                                  style={{ 
                                    backgroundColor: 'var(--light-contrast)', 
                                    color: 'var(--dark-contrast)', 
                                    border: '1px solid var(--secondary-accent)' 
                                  }}
                                  placeholder={
                                    usesDefaultName(newItemType)
                                      ? "e.g., On the shelf in the corner office (optional but recommended)" 
                                      : "e.g., Any helpful location details (optional)"
                                  }
                                />
                              </div>
                              
                              {/* Only show quantity for Consumable items */}
                              {newItemType === 'Consumable' && (
                                <div className="mb-2">
                                  <label className="block text-xs mb-1">Quantity:</label>
                                  <input
                                    type="number"
                                    value={newItemQuantity}
                                    onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                                    onKeyDown={(e) => handleKeyPress(e, () => addItemToStop(stop.id))}
                                    min="1"
                                    className="w-full p-1 rounded text-sm"
                                    style={{ 
                                      backgroundColor: 'var(--light-contrast)', 
                                      color: 'var(--dark-contrast)', 
                                      border: '1px solid var(--secondary-accent)' 
                                    }}
                                  />
                                </div>
                              )}
                              
                              <button
                                onClick={() => addItemToStop(stop.id)}
                                className="w-full px-2 py-1 rounded text-sm"
                                style={{ 
                                  backgroundColor: 'var(--main-accent)', 
                                  color: 'var(--dark-contrast)',
                                  fontWeight: 'bold'
                                }}
                              >
                                Add Item
                              </button>
                              <small className="block mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                Tip: Press Enter in any field to add the item
                              </small>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <p className="mb-4">Select a route from the list or create a new one to start building.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Export/Import Buttons */}
      <div className="mt-8 border-t pt-8 border-gray-300" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold mb-3 text-center" style={{ color: 'var(--text)' }}>
          Routes & History
        </h2>
        <p className="text-center mb-6 max-w-2xl mx-auto" style={{ color: 'var(--text)' }}>
          You can download your routes and tracking history to save them for backup or to transfer to another device. 
          Downloaded files can be uploaded later to restore your routes and tracking progress.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={downloadAllData}
            className="px-4 py-2 rounded"
            style={{ 
              backgroundColor: 'var(--main-accent)', 
              color: 'var(--dark-contrast)',
              fontWeight: 'bold'
            }}
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" /> Download Routes & History
          </button>
          
          <label className="px-4 py-2 rounded cursor-pointer button" style={{ 
            backgroundColor: 'var(--main-accent)', 
            color: 'var(--dark-contrast)',
            fontWeight: 'bold'
          }}>
            <FontAwesomeIcon icon={faUpload} className="mr-2" /> Upload Routes & History
            <input
              type="file"
              accept=".json"
              onChange={loadDataFromFile}
              className="hidden"
            />
          </label>
        </div>

        <h2 className="text-2xl font-bold mb-3 text-center" style={{ color: 'var(--text)' }}>
          Routes Only
        </h2>
        <p className="text-center mb-6 max-w-2xl mx-auto" style={{ color: 'var(--text)' }}>
          If you only want to download or upload your routes without any tracking history, 
          use these options. This is useful for sharing route templates with others.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={downloadRoutesOnly}
            className="px-4 py-2 rounded"
            style={{ 
              backgroundColor: 'var(--main-accent)', 
              color: 'var(--dark-contrast)',
              fontWeight: 'bold'
            }}
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" /> Download Routes Only
          </button>
          
          <label className="px-4 py-2 rounded cursor-pointer button" style={{ 
            backgroundColor: 'var(--main-accent)', 
            color: 'var(--dark-contrast)',
            fontWeight: 'bold'
          }}>
            <FontAwesomeIcon icon={faUpload} className="mr-2" /> Upload Routes Only
            <input
              type="file"
              accept=".json"
              onChange={loadRoutesOnlyFromFile}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default FarmingTracker;