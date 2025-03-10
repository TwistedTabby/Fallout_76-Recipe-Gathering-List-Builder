import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useFarmingTrackerDB } from '../hooks/useFarmingTrackerDB';
import { useNotification } from '../hooks/useNotification';
import { useConfirmDialog } from './ui/ConfirmDialog';
import Notification from './ui/Notification';
import ConfirmDialog from './ui/ConfirmDialog';
import RouteList from './RouteList';
import RouteEditor from './RouteEditor';
import RouteTracker from './RouteTracker';
import ImportExportTools from './tools/ImportExportTools';
// import InventoryTracker from './InventoryTracker';
import RouteStatistics from './RouteStatistics';
import StopEditor from './StopEditor';
import RouteHistory from './RouteHistory';
import { Route, RouteProgress, Stop, RouteHistory as RouteHistoryType } from '../types/farmingTracker';

// Utility function to calculate added items between pre and post route inventory
const calculateAddedItems = (
  preRouteInventory: Record<string, number>,
  postRouteInventory: Record<string, number>
): Record<string, number> => {
  const addedItems: Record<string, number> = {};
  
  // Get all unique item names from both inventories
  const allItemNames = new Set([
    ...Object.keys(preRouteInventory),
    ...Object.keys(postRouteInventory)
  ]);
  
  // Calculate differences
  allItemNames.forEach(itemName => {
    const preCount = preRouteInventory[itemName] || 0;
    const postCount = postRouteInventory[itemName] || 0;
    const difference = postCount - preCount;
    
    // Only include items that have a positive difference (were added)
    if (difference > 0) {
      addedItems[itemName] = difference;
    }
  });
  
  return addedItems;
};

/**
 * Main container component for the Farming Tracker application
 */
const FarmingTrackerApp: React.FC = () => {
  // Database hook
  const {
    isLoading,
    error,
    isStorageReliable,
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
    deleteAllRouteHistoryByRouteId
  } = useFarmingTrackerDB();

  // Notification hook
  const { notification, showNotification, hideNotification } = useNotification();

  // Confirm dialog hook
  const { confirm, dialogProps } = useConfirmDialog();

  // State for routes and current route
  const [routes, setRoutes] = useState<Route[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  
  // State for active tracking
  const [activeTracking, setActiveTracking] = useState<RouteProgress | null>(null);

  // State for view management
  const [view, setView] = useState<'list' | 'editor' | 'stopEditor' | 'tracker' | 'routeStats' | 'routeHistory'>('list');
  
  // State for the stop being edited
  const [currentStop, setCurrentStop] = useState<Stop | null>(null);
  
  // State for showing import/export tools
  const [showTools, setShowTools] = useState(false);

  // State for showing inventory tracker
  const [showInventory, setShowInventory] = useState(false);

  // State for route histories
  const [routeHistories, setRouteHistories] = useState<RouteHistoryType[]>([]);
  const [isLoadingHistories, setIsLoadingHistories] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load data from database
  const loadData = async () => {
    try {
      // Load routes
      const loadedRoutes = await loadRoutes();
      setRoutes(loadedRoutes);

      // Load current route ID
      const currentRouteId = await loadCurrentRouteId();
      if (currentRouteId) {
        const currentRoute = loadedRoutes.find(route => route.id === currentRouteId);
        if (currentRoute) {
          setCurrentRoute(currentRoute);
        }
      }

      // Load active tracking
      const tracking = await loadActiveTracking();
      if (tracking) {
        setActiveTracking(tracking);
        setView('tracker');
      }

      // Load route histories
      const loadHistories = async () => {
        setIsLoadingHistories(true);
        try {
          const histories = await loadAllRouteHistory();
          setRouteHistories(histories);
        } catch (error) {
          console.error('Error loading route histories:', error);
          showNotification({
            type: 'error',
            message: 'Failed to load route histories',
            duration: 3000
          });
        } finally {
          setIsLoadingHistories(false);
        }
      };
      
      await loadHistories();

      // Show notification if storage is not reliable
      if (!isStorageReliable) {
        showNotification({
          type: 'warning',
          message: 'Using localStorage fallback. Your data will only be saved in this browser.',
          duration: 10000
        });
      }
    } catch (err) {
      console.error('Error loading data:', err);
      showNotification({
        type: 'error',
        message: 'Error loading data. Please try refreshing the page.',
        duration: 10000
      });
    }
  };

  // Handle route selection
  const handleSelectRoute = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      setCurrentRoute(route);
      saveCurrentRouteId(routeId);
    }
  };

  // Handle route creation
  const handleCreateRoute = () => {
    // Generate a unique ID for the new route
    const routeId = uuidv4();
    const newRoute: Route = {
      id: routeId,
      name: 'New Route',
      description: '',
      stops: [],
      completedRuns: 0
    };

    // Save the new route to the database
    saveRoute(newRoute);
    
    // Add the new route to the routes array
    setRoutes(prevRoutes => [...prevRoutes, newRoute]);
    
    // Set as current route
    setCurrentRoute(newRoute);
    saveCurrentRouteId(newRoute.id);
    
    // Switch to editor view
    setView('editor');
    
    // Show a notification
    showNotification({
      type: 'success',
      message: 'New route created successfully',
      duration: 3000
    });
  };

  // Handle route deletion
  const handleDeleteRoute = async (routeId: string) => {
    try {
      const confirmed = await confirm({
        title: 'Delete Route',
        message: 'Are you sure you want to delete this route? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmButtonClass: 'btn-error'
      });

      if (confirmed) {
        await deleteRoute(routeId);
        
        // Update routes list
        setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== routeId));
        
        // Clear current route if it was deleted
        if (currentRoute && currentRoute.id === routeId) {
          setCurrentRoute(null);
          saveCurrentRouteId(null);
        }
        
        showNotification({
          type: 'success',
          message: 'Route deleted successfully',
          duration: 3000
        });
      }
    } catch (err) {
      console.error('Error deleting route:', err);
      showNotification({
        type: 'error',
        message: 'Error deleting route',
        duration: 5000
      });
    }
  };

  // Handle route duplication
  const handleDuplicateRoute = (routeId: string) => {
    const routeToDuplicate = routes.find(route => route.id === routeId);
    if (!routeToDuplicate) return;

    const duplicatedRoute: Route = {
      ...JSON.parse(JSON.stringify(routeToDuplicate)),
      id: uuidv4(),
      name: `${routeToDuplicate.name} (Copy)`,
      completedRuns: 0
    };

    handleUpdateRoute(duplicatedRoute);
    setCurrentRoute(duplicatedRoute);
    setView('editor');
  };

  // Handle route editing
  const handleEditRoute = (routeId: string) => {
    const routeToEdit = routes.find(route => route.id === routeId);
    if (!routeToEdit) return;
    
    setCurrentRoute(routeToEdit);
    setView('editor');
  };

  // Handle route update
  const handleUpdateRoute = (updatedRoute: Route) => {
    try {
      // Save route to database
      saveRoute(updatedRoute);
      
      // Update routes list
      setRoutes(prevRoutes => {
        const index = prevRoutes.findIndex(route => route.id === updatedRoute.id);
        if (index >= 0) {
          return [
            ...prevRoutes.slice(0, index),
            updatedRoute,
            ...prevRoutes.slice(index + 1)
          ];
        } else {
          return [...prevRoutes, updatedRoute];
        }
      });
      
      // Update current route if it was updated
      if (currentRoute && currentRoute.id === updatedRoute.id) {
        setCurrentRoute(updatedRoute);
      }
      
      showNotification({
        type: 'success',
        message: 'Route saved successfully',
        duration: 3000
      });
    } catch (err) {
      console.error('Error updating route:', err);
      showNotification({
        type: 'error',
        message: 'Error saving route',
        duration: 5000
      });
    }
  };

  // Handle adding a stop to a route
  const handleAddStop = (routeId: string) => {
    
    // Create a new stop with a guaranteed name
    const newStop: Stop = {
      id: uuidv4(),
      name: 'New Stop',  // Ensure this is set
      description: '',
      items: []
    };

    
    // First, check if the routeId matches the currentRoute
    if (currentRoute && (currentRoute.id === routeId)) {
      
      // Add the stop to the current route
      const updatedRoute = {
        ...currentRoute,
        stops: [...currentRoute.stops, newStop]
      };

      // Immediately save the updated route to the database
      saveRoute(updatedRoute);
      
      // Update routes list
      setRoutes(prevRoutes => {
        const index = prevRoutes.findIndex(r => r.id === routeId);
        if (index >= 0) {
          return [
            ...prevRoutes.slice(0, index),
            updatedRoute,
            ...prevRoutes.slice(index + 1)
          ];
        }
        return [...prevRoutes, updatedRoute]; // Add the route if it doesn't exist in the array
      });
      
      // Update current route
      setCurrentRoute(updatedRoute);
      
      // Set the current stop and switch to stop editor view
      setCurrentStop(newStop);
      setView('stopEditor');
      
      // Show a success notification
      showNotification({
        type: 'success',
        message: 'Stop added successfully. Now you can edit its details.',
        duration: 3000
      });
      
      return;
    }
    
    // If we get here, try to find the route in the routes array
    let route = routes.find(r => r.id === routeId);
    
    // If route is still not found, show an error and return
    if (!route) {
      showNotification({
        type: 'error',
        message: 'Route not found',
        duration: 3000
      });
      return;
    }

    // Add the stop to the route
    const updatedRoute = {
      ...route,
      stops: [...route.stops, newStop]
    };

    // Immediately save the updated route to the database
    saveRoute(updatedRoute);
    
    // Update routes list and current route in state
    setRoutes(prevRoutes => {
      const index = prevRoutes.findIndex(r => r.id === routeId);
      if (index >= 0) {
        return [
          ...prevRoutes.slice(0, index),
          updatedRoute,
          ...prevRoutes.slice(index + 1)
        ];
      }
      return [...prevRoutes, updatedRoute]; // Add the route if it doesn't exist in the array
    });
    
    // Update current route if it was the one modified
    if (currentRoute && currentRoute.id === routeId) {
      setCurrentRoute(updatedRoute);
    }

    // Set the current stop and switch to stop editor view
    setCurrentStop(newStop);
    setView('stopEditor');
    
    // Show a success notification
    showNotification({
      type: 'success',
      message: 'Stop added successfully. Now you can edit its details.',
      duration: 3000
    });
  };

  // Handle editing a stop
  const handleEditStop = (routeId: string, stopId: string) => {
    // Find the route - first check the routes array, then fall back to currentRoute
    let route = routes.find(r => r.id === routeId);
    
    // If route is not found in the routes array but matches currentRoute's ID, use currentRoute
    if (!route && currentRoute && currentRoute.id === routeId) {
      route = currentRoute;
    }
    
    // If route is still not found, show an error and return
    if (!route) {
      showNotification({
        type: 'error',
        message: 'Route not found',
        duration: 3000
      });
      return;
    }

    // Find the stop
    const stop = route.stops.find(s => s.id === stopId);
    if (!stop) {
      showNotification({
        type: 'error',
        message: 'Stop not found',
        duration: 3000
      });
      return;
    }

    // Set the current stop and switch to stop editor view
    setCurrentStop(stop);
    setView('stopEditor');
  };

  // Handle deleting a stop
  const handleDeleteStop = (routeId: string, stopId: string) => {
    // Find the route - first check the routes array, then fall back to currentRoute
    let route = routes.find(r => r.id === routeId);
    
    // If route is not found in the routes array but matches currentRoute's ID, use currentRoute
    if (!route && currentRoute && currentRoute.id === routeId) {
      route = currentRoute;
    }
    
    // If route is still not found, show an error and return
    if (!route) {
      showNotification({
        type: 'error',
        message: 'Route not found',
        duration: 3000
      });
      return;
    }

    // Remove the stop from the route
    const updatedRoute = {
      ...route,
      stops: route.stops.filter(s => s.id !== stopId)
    };

    // Immediately save the updated route to the database
    saveRoute(updatedRoute);
    
    // Update routes list and current route in state
    setRoutes(prevRoutes => {
      const index = prevRoutes.findIndex(r => r.id === routeId);
      if (index >= 0) {
        return [
          ...prevRoutes.slice(0, index),
          updatedRoute,
          ...prevRoutes.slice(index + 1)
        ];
      }
      return [...prevRoutes, updatedRoute]; // Add the route if it doesn't exist in the array
    });
    
    // Update current route if it was the one modified
    if (currentRoute && currentRoute.id === routeId) {
      setCurrentRoute(updatedRoute);
    }
    
    // Show a notification
    showNotification({
      type: 'success',
      message: 'Stop deleted successfully',
      duration: 3000
    });
  };

  // Handle starting route tracking
  const handleStartTracking = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (!route) return;

    // Initialize tracking
    const newTracking: RouteProgress = {
      routeId,
      startTime: Date.now(),
      currentStopIndex: 0,
      collectedItems: {},
      collectedQuantities: {},
      inventoryData: {
        routeInventory: {}
      }
    };

    // Initialize collected items
    route.stops.forEach(stop => {
      stop.items.forEach(item => {
        newTracking.collectedItems[item.id] = false;
        newTracking.collectedQuantities[item.id] = 0;
      });
    });

    // Save tracking to database
    saveActiveTracking(newTracking);
    setActiveTracking(newTracking);
    setView('tracker');
  };

  // Handle updating tracking
  const handleUpdateTracking = async (updatedTracking: RouteProgress & { route: Route }) => {
    try {
      // Extract the route property before saving
      const { route, ...trackingData } = updatedTracking;
      
      // Ensure we have a routeId
      if (!trackingData.routeId && route?.id) {
        trackingData.routeId = route.id;
      }
      
      // Save to IndexedDB first
      await saveActiveTracking(trackingData);
      
      // Then update local state
      setActiveTracking(trackingData);
    } catch (error) {
      console.error('Error updating tracking:', error);
      // Show error notification
      showNotification({
        type: 'error',
        message: 'Failed to update tracking data',
        duration: 3000
      });
    }
  };

  // Handle updating inventory
  const handleUpdateInventory = (inventory: Record<string, number>) => {
    if (!activeTracking) return;

    const updatedTracking = {
      ...activeTracking,
      collectedQuantities: activeTracking.collectedQuantities || {},
      inventoryData: {
        ...activeTracking.inventoryData,
        routeInventory: inventory
      }
    };

    saveActiveTracking(updatedTracking);
    setActiveTracking(updatedTracking);
  };

  // Handle completing tracking
  const handleCompleteTracking = async () => {
    try {
      const confirmed = await confirm({
        title: 'Complete Route',
        message: 'Are you sure you want to complete this route? This will save your progress and update the route statistics.',
        confirmText: 'Complete',
        cancelText: 'Cancel'
      });

      if (confirmed && activeTracking) {
        // Find the route
        const route = routes.find(r => r.id === activeTracking.routeId);
        if (!route) return;

        // Update route completed runs
        const updatedRoute = {
          ...route,
          completedRuns: (route.completedRuns || 0) + 1
        };

        // Save updated route
        saveRoute(updatedRoute);
        
        // Update routes list
        setRoutes(prevRoutes => {
          const index = prevRoutes.findIndex(r => r.id === updatedRoute.id);
          if (index >= 0) {
            return [
              ...prevRoutes.slice(0, index),
              updatedRoute,
              ...prevRoutes.slice(index + 1)
            ];
          }
          return prevRoutes;
        });

        // Save route history
        const endTime = Date.now();
        const routeHistory = {
          id: uuidv4(),
          routeId: activeTracking.routeId,
          routeName: route.name,
          startTime: activeTracking.startTime,
          endTime: endTime,
          duration: endTime - activeTracking.startTime,
          collectedItems: { ...activeTracking.collectedItems },
          collectedQuantities: activeTracking.collectedQuantities ? { ...activeTracking.collectedQuantities } : {},
          itemAnswers: activeTracking.itemAnswers ? { ...activeTracking.itemAnswers } : undefined,
          collectibleDetails: activeTracking.collectibleDetails ? { ...activeTracking.collectibleDetails } : undefined,
          inventoryData: activeTracking.inventoryData ? {
            preRoute: activeTracking.inventoryData.preRoute ? { ...activeTracking.inventoryData.preRoute } : undefined,
            postRoute: activeTracking.inventoryData.postRoute ? { ...activeTracking.inventoryData.postRoute } : undefined,
            addedItems: calculateAddedItems(
              activeTracking.inventoryData.preRoute || {},
              activeTracking.inventoryData.postRoute || {}
            ),
            stops: activeTracking.inventoryData.stops ? { ...activeTracking.inventoryData.stops } : undefined
          } : undefined
        };
        
        await saveRouteHistory(routeHistory);

        // Clear active tracking
        await saveActiveTracking(null);
        setActiveTracking(null);
        
        // Also clear the current route ID to prevent reloading on refresh
        await saveCurrentRouteId(null);
        setCurrentRoute(null);
        
        setView('list');
        
        showNotification({
          type: 'success',
          message: 'Route completed successfully',
          duration: 3000
        });
      }
    } catch (err) {
      console.error('Error completing route:', err);
      showNotification({
        type: 'error',
        message: 'Error completing route',
        duration: 5000
      });
    }
  };

  // Handle canceling tracking
  const handleCancelTracking = async () => {
    try {
      const confirmed = await confirm({
        title: 'Cancel Route',
        message: 'Are you sure you want to cancel this route? Your progress will be lost.',
        confirmText: 'Cancel Route',
        cancelText: 'Keep Tracking',
        confirmButtonClass: 'btn-warning'
      });

      if (confirmed) {
        
        // Clear active tracking and current route reference
        await saveActiveTracking(null);
        setActiveTracking(null);
        
        // Also clear the current route ID to prevent reloading on refresh
        await saveCurrentRouteId(null);
        setCurrentRoute(null);
        
        // Clear tracking
        await loadActiveTracking();
        
        setView('list');
        
        showNotification({
          type: 'info',
          message: 'Route tracking canceled',
          duration: 3000
        });
      }
    } catch (err) {
      console.error('Error canceling route:', err);
    }
  };

  // Handle importing data
  const handleImportData = async (
    importedRoutes: Route[], 
    importedCurrentRouteId: string | null, 
    importedActiveTracking: RouteProgress | null
  ) => {
    try {
      // Confirm import if there are existing routes
      let shouldMerge = false;
      if (routes.length > 0) {
        const result = await confirm({
          title: 'Import Data',
          message: 'Do you want to merge the imported data with your existing data or replace it?',
          confirmText: 'Merge',
          cancelText: 'Replace',
          showCancel: true
        });
        shouldMerge = result;
      }

      // Merge or replace routes
      if (shouldMerge) {
        // Create a map of existing routes by ID
        const routeMap = new Map(routes.map(route => [route.id, route]));
        
        // Add or update imported routes
        importedRoutes.forEach(importedRoute => {
          routeMap.set(importedRoute.id, importedRoute);
        });
        
        // Convert map back to array
        const mergedRoutes = Array.from(routeMap.values());
        
        // Save merged routes
        for (const route of mergedRoutes) {
          await saveRoute(route);
        }
        
        setRoutes(mergedRoutes);
      } else {
        // Replace all routes
        for (const route of importedRoutes) {
          await saveRoute(route);
        }
        
        setRoutes(importedRoutes);
      }

      // Set current route
      if (importedCurrentRouteId) {
        const currentRoute = importedRoutes.find(route => route.id === importedCurrentRouteId);
        if (currentRoute) {
          setCurrentRoute(currentRoute);
          saveCurrentRouteId(importedCurrentRouteId);
        }
      }

      // Set active tracking
      if (importedActiveTracking) {
        setActiveTracking(importedActiveTracking);
        saveActiveTracking(importedActiveTracking);
        setView('tracker');
      }

      showNotification({
        type: 'success',
        message: 'Data imported successfully',
        duration: 3000
      });
    } catch (err) {
      console.error('Error importing data:', err);
      showNotification({
        type: 'error',
        message: 'Error importing data',
        duration: 5000
      });
    }
  };

  // Toggle import/export tools
  const toggleTools = () => {
    setShowTools(!showTools);
  };

  // Toggle inventory tracker
  const toggleInventory = () => {
    setShowInventory(!showInventory);
  };

  // Handle deleting route history
  const handleDeleteRouteHistory = async (historyId: string) => {
    try {
      const confirmed = await confirm({
        title: 'Delete History',
        message: 'Are you sure you want to delete this history entry? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmButtonClass: 'btn-danger'
      });
      
      if (confirmed) {
        await deleteRouteHistory(historyId);
        
        // Update local state
        setRouteHistories(prevHistories => 
          prevHistories.filter(history => history.id !== historyId)
        );
        
        showNotification({
          type: 'success',
          message: 'History entry deleted successfully',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error deleting route history:', error);
      showNotification({
        type: 'error',
        message: 'Failed to delete history entry',
        duration: 3000
      });
    }
  };

  // Handle resetting all history for a route
  const handleResetAllHistory = async () => {
    if (!currentRoute) return;
    
    try {
      const confirmed = await confirm({
        title: 'Reset All History',
        message: `Are you sure you want to delete ALL history entries for "${currentRoute.name}"? This action cannot be undone.`,
        confirmText: 'Reset All',
        cancelText: 'Cancel',
        confirmButtonClass: 'btn-danger'
      });
      
      if (confirmed) {
        await deleteAllRouteHistoryByRouteId(currentRoute.id);
        
        // Clear the local state
        setRouteHistories([]);
        
        showNotification({
          type: 'success',
          message: 'All history entries have been deleted',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error resetting route history:', error);
      showNotification({
        type: 'error',
        message: 'Failed to reset history',
        duration: 3000
      });
    }
  };

  // Handle viewing route details from history
  const handleViewRouteDetails = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      setCurrentRoute(route);
      setView('editor');
    } else {
      showNotification({
        type: 'warning',
        message: 'Route not found. It may have been deleted.',
        duration: 3000
      });
    }
  };

  // Add new handler functions for route-level statistics and history
  const handleViewRouteStats = (routeId: string) => {
    // Find the route
    const route = routes.find(r => r.id === routeId);
    if (!route) return;
    
    // Set as current route
    setCurrentRoute(route);
    
    // Switch to route stats view
    setView('routeStats');
  };
  
  const handleViewRouteHistory = async (routeId: string) => {
    // Find the route
    const route = routes.find(r => r.id === routeId);
    if (!route) return;
    
    // Set as current route
    setCurrentRoute(route);
    
    // Load route histories for this specific route
    setIsLoadingHistories(true);
    try {
      const histories = await loadRouteHistoryByRouteId(routeId);
      setRouteHistories(histories);
    } catch (error) {
      console.error('Failed to load route histories:', error);
      showNotification({
        type: 'error',
        message: 'Failed to load route histories',
        duration: 5000
      });
    } finally {
      setIsLoadingHistories(false);
    }
    
    // Switch to route history view
    setView('routeHistory');
  };

  return (
    <div className="farming-tracker">
      {/* Notification component */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={hideNotification} 
        />
      )}
      
      {/* Confirm dialog */}
      <ConfirmDialog {...dialogProps} />
      
      {/* Loading state */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading your routes...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="error-message card p-4 mb-4 bg-red-100 border border-red-300 rounded-lg">
          <h3 className="text-red-700 font-semibold mb-2">Error</h3>
          <p className="text-red-600">Error loading data: {error.toString()}</p>
          {!isStorageReliable && (
            <p className="mt-2 text-red-600">
              Your browser's storage may be restricted. In private browsing mode, data will be lost when you close the browser.
            </p>
          )}
          <button 
            className="btn btn-primary mt-3"
            onClick={loadData}
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Main content */}
      <div className="farming-tracker-container">
        {/* View content */}
        <div className="view-content">
          {view === 'list' && (
            <div className="route-management-view">
              <RouteList 
                routes={routes}
                currentRouteId={currentRoute?.id || null}
                onSelectRoute={handleSelectRoute}
                onCreateRoute={handleCreateRoute}
                onEditRoute={handleEditRoute}
                onDeleteRoute={handleDeleteRoute}
                onStartTracking={handleStartTracking}
                onDuplicateRoute={handleDuplicateRoute}
                onViewRouteStats={handleViewRouteStats}
                onViewRouteHistory={handleViewRouteHistory}
              />
              
              <div className="mt-4 flex justify-end space-x-2">
                <button 
                  className="btn btn-secondary"
                  onClick={toggleTools}
                >
                  Import/Export
                </button>
                <button 
                  style={{display: 'none'}}
                  className="btn btn-secondary"
                  onClick={toggleInventory}
                >
                  Inventory
                </button>
              </div>
              
              {showTools && (
                <div className="card mt-4">
                  <div className="card-header">
                    <h2>Import/Export Tools</h2>
                  </div>
                  <div className="card-body">
                    <ImportExportTools 
                      routes={routes}
                      currentRouteId={currentRoute?.id || null}
                      activeTracking={activeTracking}
                      onImportData={handleImportData}
                      onConfirm={confirm}
                      onNotify={showNotification}
                    />
                  </div>
                </div>
              )}
              
              {showInventory && (
                <div className="card mt-4">
                  <div className="card-header">
                    <h2>Inventory Tracker</h2>
                  </div>
                  <div className="card-body">
                    {/* Inventory tracker component is currently disabled
                    <InventoryTracker 
                      onNotify={showNotification}
                    />
                    */}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {view === 'editor' && currentRoute && (
            <div className="card">
              <div className="card-header flex justify-between items-center">
                <h2>Edit Route: {currentRoute.name}</h2>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setView('list')}
                >
                  Back to Routes
                </button>
              </div>
              <div className="card-body">
                <RouteEditor 
                  route={currentRoute}
                  onSave={handleUpdateRoute}
                  onCancel={() => setView('list')}
                  onAddStop={handleAddStop}
                  onEditStop={handleEditStop}
                  onDeleteStop={handleDeleteStop}
                />
              </div>
            </div>
          )}
          
          {view === 'stopEditor' && currentStop && currentRoute && (
            <div className="card">
              <div className="card-header flex justify-between items-center">
                <h2>Edit Stop: {currentStop.name}</h2>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setCurrentStop(null);
                    setView('editor');
                  }}
                >
                  Back to Route Editor
                </button>
              </div>
              <div className="card-body">
                <StopEditor 
                  stop={currentStop}
                  onSave={(updatedStop, isAutoSave = false) => {
                    // Find the route
                    if (!currentRoute) return;

                    // Update the stops array with the updated stop
                    const updatedStops = currentRoute.stops.map(stop => 
                      stop.id === updatedStop.id ? updatedStop : stop
                    );

                    // Create the updated route
                    const updatedRoute = {
                      ...currentRoute,
                      stops: updatedStops
                    };

                    // Save the updated route
                    saveRoute(updatedRoute);
                    
                    // Update routes list
                    setRoutes(prevRoutes => {
                      const index = prevRoutes.findIndex(r => r.id === currentRoute.id);
                      if (index >= 0) {
                        return [
                          ...prevRoutes.slice(0, index),
                          updatedRoute,
                          ...prevRoutes.slice(index + 1)
                        ];
                      }
                      return prevRoutes;
                    });
                    
                    // Update current route
                    setCurrentRoute(updatedRoute);
                    
                    // Only return to route editor view if it's not an auto-save
                    if (!isAutoSave) {
                      setCurrentStop(null);
                      setView('editor');
                      
                      // Show notification
                      showNotification({
                        type: 'success',
                        message: 'Stop updated successfully',
                        duration: 3000
                      });
                    }
                  }}
                  onCancel={() => {
                    setCurrentStop(null);
                    setView('editor');
                  }}
                />
              </div>
            </div>
          )}
          
          {view === 'tracker' && activeTracking && (
            <>
              <RouteTracker 
                tracking={{
                  ...activeTracking,
                  route: routes.find(r => r.id === activeTracking.routeId) || {
                    id: '',
                    name: 'Unknown Route',
                    description: '',
                    stops: []
                  }
                }}
                onUpdateTracking={handleUpdateTracking}
                onUpdateInventory={handleUpdateInventory}
                onComplete={handleCompleteTracking}
                onCancel={handleCancelTracking}
              />
              
              <div className="mt-4 flex justify-end">
                <button 
                  className="btn btn-secondary"
                  onClick={toggleInventory}
                >
                  {showInventory ? 'Hide Inventory' : 'Show Inventory'}
                </button>
              </div>
              
              {showInventory && (
                <div className="card mt-4">
                  <div className="card-header">
                    <h2>Inventory Tracker</h2>
                  </div>
                  <div className="card-body">
                    {/* Inventory tracker component is currently disabled
                    <InventoryTracker 
                      onNotify={showNotification}
                    />
                    */}
                  </div>
                </div>
              )}
            </>
          )}
          
          {view === 'routeStats' && currentRoute && (
            <div className="card">
              <div className="card-header flex justify-between items-center">
                <h2>Statistics for {currentRoute.name}</h2>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setView('list')}
                >
                  Back to Routes
                </button>
              </div>
              <div className="card-body">
                <RouteStatistics 
                  routes={routes} 
                  selectedRouteId={currentRoute.id}
                />
              </div>
            </div>
          )}
          
          {view === 'routeHistory' && currentRoute && (
            <div className="card">
              <div className="card-header flex justify-between items-center">
                <h2>History for {currentRoute.name}</h2>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setView('list')}
                >
                  Back to Routes
                </button>
              </div>
              <div className="card-body">
                {isLoadingHistories ? (
                  <div className="text-center p-4">
                    <div className="spinner"></div>
                    <p>Loading history...</p>
                  </div>
                ) : (
                  <RouteHistory 
                    histories={routeHistories}
                    onDeleteHistory={handleDeleteRouteHistory}
                    onViewRouteDetails={handleViewRouteDetails}
                    onResetAllHistory={handleResetAllHistory}
                    currentRoute={currentRoute}
                    getRouteById={async (routeId) => {
                      // Find the route in the routes array
                      const route = routes.find(r => r.id === routeId);
                      return route || null;
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmingTrackerApp; 