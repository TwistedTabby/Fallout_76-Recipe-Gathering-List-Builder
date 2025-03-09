import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faEdit, faTrash, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { Route } from '../types/farmingTracker';
import { v4 as uuidv4 } from 'uuid';

interface RouteEditorProps {
  route: Route | null;
  onSave: (route: Route) => void;
  onCancel: () => void;
  onAddStop?: (routeId: string) => void;
  onEditStop?: (routeId: string, stopId: string) => void;
  onDeleteStop?: (routeId: string, stopId: string) => void;
}

/**
 * Component for creating and editing routes
 */
const RouteEditor: React.FC<RouteEditorProps> = ({ 
  route, 
  onSave, 
  onCancel,
  onAddStop,
  onEditStop,
  onDeleteStop
}) => {
  // Initialize with route data or empty values
  const [editedRoute, setEditedRoute] = useState<Route>({
    id: route?.id || uuidv4(),
    name: route?.name || '',
    description: route?.description || '',
    stops: route?.stops || [],
    completedRuns: route?.completedRuns || 0,
    autoInventoryChecks: route?.autoInventoryChecks || false
  });
  
  const [validationError, setValidationError] = useState<string | null>(null);

  // Update editedRoute when route prop changes
  useEffect(() => {
    if (route) {
      setEditedRoute({
        id: route.id,
        name: route.name,
        description: route.description,
        stops: route.stops,
        completedRuns: route.completedRuns || 0,
        autoInventoryChecks: route.autoInventoryChecks || false
      });
    }
  }, [route]);

  // Add a useEffect to log the stops when they change
  useEffect(() => {
  }, [editedRoute.stops]);

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedRoute = { ...editedRoute, name: e.target.value };
    setEditedRoute(updatedRoute);
    if (validationError) setValidationError(null);
    
    // Auto-save if name is not empty
    if (e.target.value.trim()) {
      onSave(updatedRoute);
    }
  };

  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedRoute = { ...editedRoute, description: e.target.value };
    setEditedRoute(updatedRoute);
    onSave(updatedRoute);
  };

  // Handle auto inventory checks change
  const handleAutoInventoryChecksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedRoute = { ...editedRoute, autoInventoryChecks: e.target.checked };
    setEditedRoute(updatedRoute);
    onSave(updatedRoute);
  };

  // Handle adding a new stop
  const handleAddStop = () => {
    if (onAddStop) {
      if (editedRoute.id) {
        onAddStop(editedRoute.id);
      }
    }
  };

  // Handle editing a stop
  const handleEditStop = (stopId: string) => {
    if (onEditStop && editedRoute.id) {
      onEditStop(editedRoute.id, stopId);
    }
  };

  // Handle saving a stop

  // Handle deleting a stop
  const handleDeleteStop = (stopId: string) => {
    if (onDeleteStop && editedRoute.id) {
      onDeleteStop(editedRoute.id, stopId);
    }
  };

  // Validate the route

  // Handle moving a stop up in the list
  const handleMoveStopUp = (index: number) => {
    if (index <= 0) return;
    
    const newStops = [...editedRoute.stops];
    const temp = newStops[index];
    newStops[index] = newStops[index - 1];
    newStops[index - 1] = temp;
    
    const updatedRoute = {
      ...editedRoute,
      stops: newStops
    };
    
    setEditedRoute(updatedRoute);
    onSave(updatedRoute);
  };

  // Handle moving a stop down in the list
  const handleMoveStopDown = (index: number) => {
    if (index >= editedRoute.stops.length - 1) return;
    
    const newStops = [...editedRoute.stops];
    const temp = newStops[index];
    newStops[index] = newStops[index + 1];
    newStops[index + 1] = temp;
    
    const updatedRoute = {
      ...editedRoute,
      stops: newStops
    };
    
    setEditedRoute(updatedRoute);
    onSave(updatedRoute);
  };

  return (
    <div className="card route-editor-container bg-secondary-accent">
      <div className="card-header route-editor-header">
        <h2>{route ? 'Edit Route' : 'Create New Route'}</h2>
        <div className="route-editor-actions">
          <button 
            className="btn btn-primary"
            onClick={onCancel}
          >
            <FontAwesomeIcon icon={faTimes} /> Done
          </button>
        </div>
      </div>
      
      <div className="card-body">
        <div className="form-group">
          <label htmlFor="route-name" className="form-label">Route Name:</label>
          <input
            id="route-name"
            type="text"
            className="form-control route-editor-field"
            value={editedRoute.name}
            onChange={handleNameChange}
            onBlur={() => {
              if (!editedRoute.name.trim()) {
                setValidationError('Route name is required');
              }
            }}
            placeholder="Enter route name"
          />
          {validationError && (
            <div className="validation-error mt-1 text-sm text-red-600">{validationError}</div>
          )}
        </div>
        
        <div className="form-row md:grid-cols-2">
          <div className="form-group col-span-1 md:col-span-1 md:pr-2">
            <label htmlFor="route-description" className="form-label">Description:</label>
            <textarea
              id="route-description"
              className="form-control route-editor-field"
              value={editedRoute.description}
              onChange={handleDescriptionChange}
              placeholder="Enter route description"
              rows={3}
            />
          </div>
          
          <div className="form-group inventory-check-container col-span-1 md:col-span-1 md:pl-2">
            <label className="form-label">Options:</label>
            <div className="inventory-check-wrapper">
              <div className="flex items-center checkbox-label-container">
                <input
                  id="auto-inventory-checks"
                  type="checkbox"
                  className="mr-2 inventory-check-input"
                  checked={editedRoute.autoInventoryChecks}
                  onChange={handleAutoInventoryChecksChange}
                />
                <label htmlFor="auto-inventory-checks" className="form-label mb-0 font-medium">
                  Collect inventory data
                </label>
              </div>
              <div className="help-text text-sm mt-1">
                When checked, the app will ask for an inventory count of harvestable items at the start and end of the route.
              </div>
            </div>
          </div>
        </div>
        
        <div className="stops-section">
          <div className="stops-header">
            <h3>Stops</h3>
          </div>
          
          {editedRoute.stops.length === 0 ? (
            <div className="no-stops-message p-4 text-center rounded-lg">
              <button 
                className="btn btn-primary"
                onClick={handleAddStop}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Your First Stop
              </button>
            </div>
          ) : (
            <ul className="stops-list">
              {editedRoute.stops.map((stop, index) => {
                // Check if stop name is undefined, null, or empty
                if (!stop.name) {
                  console.error(`Stop at index ${index} has no name:`, stop);
                }
                
                return (
                <li key={stop.id} className="stop-item">
                  <div className="stop-info">
                    <div className="stop-name">
                      {stop.name || `Unnamed Stop ${index + 1}`}
                    </div>
                    {stop.description && (
                      <div className="stop-description">{stop.description}</div>
                    )}
                    <div className="stop-meta">
                      {stop.items.length} item{stop.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="stop-actions">
                    <button 
                      className="btn-icon-sm btn-primary"
                      onClick={() => handleMoveStopUp(index)}
                      disabled={index === 0}
                      aria-label="Move stop up"
                      title="Move Up"
                    >
                      <FontAwesomeIcon icon={faArrowUp} />
                    </button>
                    <button 
                      className="btn-icon-sm btn-secondary"
                      onClick={() => handleMoveStopDown(index)}
                      disabled={index === editedRoute.stops.length - 1}
                      aria-label="Move stop down"
                      title="Move Down"
                    >
                      <FontAwesomeIcon icon={faArrowDown} />
                    </button>
                    <button 
                      className="btn-icon-sm edit-button"
                      onClick={() => handleEditStop(stop.id)}
                      aria-label="Edit stop"
                      title="Edit Stop"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="btn-icon-sm delete-button"
                      onClick={() => handleDeleteStop(stop.id)}
                      aria-label="Delete stop"
                      title="Delete Stop"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </li>
                );
              })}
            </ul>
          )}
          
          {editedRoute.stops.length > 0 && (
            <div className="add-stop-button-container">
              <button 
                className="btn btn-primary add-stop-button"
                onClick={handleAddStop}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Another Stop
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteEditor; 