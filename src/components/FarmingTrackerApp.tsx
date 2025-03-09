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
import InventoryTracker from './InventoryTracker';
import RouteStatistics from './RouteStatistics';
import { Route, RouteProgress } from '../types/farmingTracker';

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
    loadActiveTracking
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
  const [view, setView] = useState<'list' | 'editor' | 'tracker' | 'stats'>('list');
  
  // State for showing import/export tools
  const [showTools, setShowTools] = useState(false);

  // State for showing inventory tracker
  const [showInventory, setShowInventory] = useState(false);

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
    const newRoute: Route = {
      id: uuidv4(),
      name: 'New Route',
      description: '',
      stops: [],
      completedRuns: 0,
      autoInventoryChecks: false
    };

    setCurrentRoute(newRoute);
    setView('editor');
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
      notes: '',
      inventoryData: {
        routeInventory: {}
      }
    };

    // Initialize collected items
    route.stops.forEach(stop => {
      stop.items.forEach(item => {
        newTracking.collectedItems[item.id] = false;
      });
    });

    // Save tracking to database
    saveActiveTracking(newTracking);
    setActiveTracking(newTracking);
    setView('tracker');
  };

  // Handle updating tracking
  const handleUpdateTracking = (updatedTracking: RouteProgress) => {
    saveActiveTracking(updatedTracking);
    setActiveTracking(updatedTracking);
  };

  // Handle updating inventory
  const handleUpdateInventory = (inventory: Record<string, number>) => {
    if (!activeTracking) return;

    const updatedTracking = {
      ...activeTracking,
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
        console.log('Canceling route tracking...');
        
        // Clear active tracking and current route reference
        await saveActiveTracking(null);
        setActiveTracking(null);
        
        // Also clear the current route ID to prevent reloading on refresh
        await saveCurrentRouteId(null);
        setCurrentRoute(null);
        
        // Verify that tracking is cleared
        const verifyTracking = await loadActiveTracking();
        console.log('After cancellation, tracking exists:', !!verifyTracking);
        
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

  // Toggle statistics view
  const toggleStats = () => {
    setView(view === 'stats' ? 'list' : 'stats');
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="alert alert-error">
          <span>Error loading data: {error}</span>
        </div>
        <button className="btn btn-primary mt-4" onClick={loadData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="farming-tracker-app p-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Farming Tracker</h1>
        
        <div className="flex gap-2">
          {view === 'tracker' && activeTracking && (
            <>
              <button 
                className="btn btn-sm btn-primary"
                onClick={toggleInventory}
              >
                {showInventory ? 'Hide Inventory' : 'Show Inventory'}
              </button>
              <button 
                className="btn btn-sm btn-success"
                onClick={handleCompleteTracking}
              >
                Complete
              </button>
              <button 
                className="btn btn-sm btn-warning"
                onClick={handleCancelTracking}
              >
                Cancel
              </button>
            </>
          )}
          
          {view === 'editor' && (
            <button 
              className="btn btn-sm btn-warning"
              onClick={() => setView('list')}
            >
              Back to List
            </button>
          )}
          
          {(view === 'list' || view === 'stats') && (
            <>
              <button 
                className="btn btn-sm btn-primary"
                onClick={toggleStats}
              >
                {view === 'stats' ? 'Show Routes' : 'Show Stats'}
              </button>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={toggleTools}
              >
                {showTools ? 'Hide Tools' : 'Import/Export'}
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Import/Export Tools */}
      {showTools && (
        <div className="mb-4">
          <ImportExportTools
            routes={routes}
            currentRouteId={currentRoute?.id || null}
            activeTracking={activeTracking}
            onImport={handleImportData}
          />
        </div>
      )}
      
      {/* Main Content */}
      <div className="main-content">
        {view === 'list' && (
          <RouteList
            routes={routes}
            currentRouteId={currentRoute?.id || null}
            onSelectRoute={handleSelectRoute}
            onDeleteRoute={handleDeleteRoute}
            onDuplicateRoute={handleDuplicateRoute}
            onCreateRoute={handleCreateRoute}
            onStartTracking={handleStartTracking}
            onEditRoute={handleEditRoute}
          />
        )}
        
        {view === 'stats' && (
          <RouteStatistics
            routes={routes}
            selectedRouteId={currentRoute?.id || null}
          />
        )}
        
        {view === 'editor' && currentRoute && (
          <RouteEditor
            route={currentRoute}
            onSave={handleUpdateRoute}
            onCancel={() => setView('list')}
          />
        )}
        
        {view === 'tracker' && activeTracking && (
          <div className="grid grid-cols-1 gap-4">
            <RouteTracker
              activeTracking={activeTracking}
              routes={routes}
              onUpdateTracking={handleUpdateTracking}
            />
            
            {showInventory && (
              <InventoryTracker
                activeTracking={activeTracking}
                onUpdateInventory={handleUpdateInventory}
              />
            )}
          </div>
        )}
      </div>
      
      {/* Notification */}
      {notification && (
        <Notification
          notification={notification}
          onClose={hideNotification}
        />
      )}
      
      {/* Confirm Dialog */}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default FarmingTrackerApp; 