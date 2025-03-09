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
  const [view, setView] = useState<'list' | 'editor' | 'tracker'>('list');
  
  // State for showing import/export tools
  const [showTools, setShowTools] = useState(false);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load routes
        const allRoutes = await loadRoutes();
        if (allRoutes.length > 0) {
          setRoutes(allRoutes);
          
          // Load active tracking
          const activeTrackingData = await loadActiveTracking();
          if (activeTrackingData) {
            setActiveTracking(activeTrackingData);
            
            // Find and activate the route associated with the tracking session
            const trackedRoute = allRoutes.find(route => route.id === activeTrackingData.routeId);
            if (trackedRoute) {
              setCurrentRoute(trackedRoute);
              setView('tracker');
            }
          } else {
            // If no active tracking, check for current route ID or activate the only route
            if (allRoutes.length === 1) {
              // If there's only one route, activate it automatically
              setCurrentRoute(allRoutes[0]);
            } else {
              const currentRouteId = await loadCurrentRouteId();
              if (currentRouteId) {
                const route = allRoutes.find(r => r.id === currentRouteId);
                if (route) {
                  setCurrentRoute(route);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data. Please try again.', 'error');
      }
    };
    
    loadData();
    
    // Show storage reliability warning if needed
    if (!isStorageReliable) {
      showNotification(
        "Please export your data before refreshing or closing the tab as your browser's storage may not be reliable.", 
        'info'
      );
    }
  }, [loadRoutes, loadActiveTracking, loadCurrentRouteId, isStorageReliable, showNotification]);

  // Save current route ID when it changes
  useEffect(() => {
    if (currentRoute) {
      saveCurrentRouteId(currentRoute.id);
    }
  }, [currentRoute, saveCurrentRouteId]);

  // Save active tracking when it changes
  useEffect(() => {
    if (activeTracking) {
      saveActiveTracking(activeTracking);
    }
  }, [activeTracking, saveActiveTracking]);

  // Handle route selection
  const handleSelectRoute = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      setCurrentRoute(route);
    }
  };

  // Handle route creation
  const handleCreateRoute = () => {
    const newRoute: Route = {
      id: uuidv4(),
      name: 'New Route',
      description: 'Route description',
      stops: [],
      completedRuns: 0,
      autoInventoryChecks: false
    };
    
    const updatedRoutes = [...routes, newRoute];
    setRoutes(updatedRoutes);
    setCurrentRoute(newRoute);
    setView('editor');
    
    // Save the new route
    saveRoute(newRoute);
  };

  // Handle route deletion
  const handleDeleteRoute = async (routeId: string) => {
    const confirmed = await confirm('Are you sure you want to delete this route? This action cannot be undone.');
    
    if (confirmed) {
      // Remove the route from state
      const updatedRoutes = routes.filter(route => route.id !== routeId);
      setRoutes(updatedRoutes);
      
      // If the deleted route was the current route, clear current route
      if (currentRoute && currentRoute.id === routeId) {
        setCurrentRoute(null);
      }
      
      // Delete from database
      await deleteRoute(routeId);
      
      showNotification('Route deleted successfully', 'success');
    }
  };

  // Handle route update
  const handleUpdateRoute = (updatedRoute: Route) => {
    const updatedRoutes = routes.map(route => 
      route.id === updatedRoute.id ? updatedRoute : route
    );
    
    setRoutes(updatedRoutes);
    setCurrentRoute(updatedRoute);
    
    // Save the updated route
    saveRoute(updatedRoute);
    
    showNotification('Route updated successfully', 'success');
  };

  // Handle starting route tracking
  const handleStartTracking = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      // Initialize tracking
      const newTracking: RouteProgress = {
        routeId: route.id,
        startTime: Date.now(),
        currentStopIndex: 0,
        collectedItems: {},
        notes: '',
        inventoryData: {
          routeInventory: {}
        }
      };
      
      setActiveTracking(newTracking);
      setCurrentRoute(route);
      setView('tracker');
      
      // Save tracking state
      saveActiveTracking(newTracking);
      
      showNotification(`Started tracking route: ${route.name}`, 'success');
    }
  };

  // Handle updating tracking data
  const handleUpdateTracking = (updatedTracking: RouteProgress) => {
    setActiveTracking(updatedTracking);
    saveActiveTracking(updatedTracking);
  };

  // Handle completing route tracking
  const handleCompleteTracking = async () => {
    const confirmed = await confirm('Are you sure you want to complete this route? This will record it as a finished run.');
    
    if (confirmed && currentRoute && activeTracking) {
      // Update the route's completed runs counter
      const updatedRoute = {
        ...currentRoute,
        completedRuns: (currentRoute.completedRuns || 0) + 1
      };
      
      // Update routes state
      const updatedRoutes = routes.map(route => 
        route.id === updatedRoute.id ? updatedRoute : route
      );
      
      setRoutes(updatedRoutes);
      setCurrentRoute(updatedRoute);
      setActiveTracking(null);
      setView('list');
      
      // Save changes
      await saveRoute(updatedRoute);
      await saveActiveTracking(null);
      
      showNotification('Route completed successfully!', 'success');
    }
  };

  // Handle canceling route tracking
  const handleCancelTracking = async () => {
    const confirmed = await confirm('Are you sure you want to cancel route tracking? All progress will be lost.');
    
    if (confirmed) {
      setActiveTracking(null);
      setView('list');
      
      // Clear tracking data
      await saveActiveTracking(null);
      
      showNotification('Route tracking canceled', 'info');
    }
  };

  // Handle importing data
  const handleImportData = async (
    importedRoutes: Route[], 
    importedCurrentRouteId: string | null, 
    importedActiveTracking: RouteProgress | null
  ) => {
    // Update routes
    setRoutes(importedRoutes);
    
    // Update current route if available
    if (importedCurrentRouteId) {
      const currentRoute = importedRoutes.find(r => r.id === importedCurrentRouteId);
      if (currentRoute) {
        setCurrentRoute(currentRoute);
      }
    }
    
    // Update active tracking if available
    if (importedActiveTracking) {
      setActiveTracking(importedActiveTracking);
      
      // If we have active tracking, switch to tracker view
      const trackedRoute = importedRoutes.find(r => r.id === importedActiveTracking.routeId);
      if (trackedRoute) {
        setCurrentRoute(trackedRoute);
        setView('tracker');
      }
    }
    
    // Save all data to storage
    for (const route of importedRoutes) {
      await saveRoute(route);
    }
    
    if (importedCurrentRouteId) {
      await saveCurrentRouteId(importedCurrentRouteId);
    }
    
    if (importedActiveTracking) {
      await saveActiveTracking(importedActiveTracking);
    }
  };

  // Toggle import/export tools visibility
  const toggleTools = () => {
    setShowTools(!showTools);
  };

  // Render loading state
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  // Render error state
  if (error) {
    return (
      <div className="error">
        <h2>Error loading data</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="farming-tracker-app">
      {/* Notification component */}
      <Notification notification={notification} onClose={hideNotification} />
      
      {/* Confirm Dialog */}
      <ConfirmDialog {...dialogProps} />
      
      {/* Main content */}
      <div className="app-header">
        <h1>Fallout 76 Farming Tracker</h1>
        <div className="app-header-actions">
          {/* Navigation buttons */}
          {view !== 'list' && (
            <button 
              className="back-to-list-button"
              onClick={() => {
                if (view === 'tracker' && activeTracking) {
                  handleCancelTracking();
                } else {
                  setView('list');
                }
              }}
            >
              Back to List
            </button>
          )}
          
          {/* Import/Export toggle button */}
          <button 
            className={`tools-toggle-button ${showTools ? 'active' : ''}`}
            onClick={toggleTools}
          >
            {showTools ? 'Hide Tools' : 'Show Tools'}
          </button>
        </div>
      </div>
      
      {/* Import/Export Tools */}
      {showTools && (
        <ImportExportTools
          routes={routes}
          currentRouteId={currentRoute?.id || null}
          activeTracking={activeTracking}
          onImportData={handleImportData}
          onConfirm={confirm}
          onNotify={showNotification}
        />
      )}
      
      <div className="app-content">
        {view === 'list' && (
          <RouteList 
            routes={routes}
            currentRouteId={currentRoute?.id || null}
            onSelectRoute={handleSelectRoute}
            onCreateRoute={handleCreateRoute}
            onEditRoute={() => setView('editor')}
            onDeleteRoute={handleDeleteRoute}
            onStartTracking={handleStartTracking}
          />
        )}
        
        {view === 'editor' && currentRoute && (
          <RouteEditor
            route={currentRoute}
            onSave={(updatedRoute) => {
              handleUpdateRoute(updatedRoute);
              setView('list');
            }}
            onCancel={() => setView('list')}
          />
        )}
        
        {view === 'tracker' && currentRoute && activeTracking && (
          <RouteTracker
            route={currentRoute}
            tracking={activeTracking}
            onUpdateTracking={handleUpdateTracking}
            onComplete={handleCompleteTracking}
            onCancel={handleCancelTracking}
          />
        )}
      </div>
    </div>
  );
};

export default FarmingTrackerApp; 