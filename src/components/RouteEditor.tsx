import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Route, Stop } from '../types/farmingTracker';

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
    id: route?.id || '',
    name: route?.name || '',
    description: route?.description || '',
    stops: route?.stops || [],
    completedRuns: route?.completedRuns || 0,
    autoInventoryChecks: route?.autoInventoryChecks || false
  });
  
  const [validationError, setValidationError] = useState<string | null>(null);

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedRoute(prev => ({ ...prev, name: e.target.value }));
    if (validationError) setValidationError(null);
  };

  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedRoute(prev => ({ ...prev, description: e.target.value }));
  };

  // Handle auto inventory checks change
  const handleAutoInventoryChecksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedRoute(prev => ({ ...prev, autoInventoryChecks: e.target.checked }));
  };

  // Handle adding a new stop
  const handleAddStop = () => {
    if (onAddStop && editedRoute.id) {
      onAddStop(editedRoute.id);
    }
  };

  // Handle editing a stop
  const handleEditStop = (stopId: string) => {
    if (onEditStop && editedRoute.id) {
      onEditStop(editedRoute.id, stopId);
    }
  };

  // Handle saving a stop
  const handleSaveStop = (updatedStop: Stop) => {
    setEditedRoute(prev => ({
      ...prev,
      stops: prev.stops.map(stop => 
        stop.id === updatedStop.id ? updatedStop : stop
      )
    }));
  };

  // Handle deleting a stop
  const handleDeleteStop = (stopId: string) => {
    if (onDeleteStop && editedRoute.id) {
      onDeleteStop(editedRoute.id, stopId);
    }
  };

  // Handle saving the route
  const handleSave = () => {
    // Validate required fields
    if (!editedRoute.name.trim()) {
      setValidationError('Route name is required');
      return;
    }

    onSave(editedRoute);
  };

  return (
    <div className="route-editor">
      <div className="route-editor-header">
        <h2>{editedRoute.id ? 'Edit Route' : 'Create Route'}</h2>
        <div className="route-editor-actions">
          <button 
            className="route-editor-action-button cancel-button" 
            onClick={onCancel}
            title="Cancel"
          >
            <FontAwesomeIcon icon={faTimes} /> Cancel
          </button>
          <button 
            className="route-editor-action-button save-button" 
            onClick={handleSave}
            title="Save Route"
          >
            <FontAwesomeIcon icon={faSave} /> Save Route
          </button>
        </div>
      </div>
      
      <div className="route-editor-form">
        <div className="form-group">
          <label htmlFor="route-name">Route Name:</label>
          <input
            id="route-name"
            type="text"
            value={editedRoute.name}
            onChange={handleNameChange}
            className={validationError ? 'error' : ''}
          />
          {validationError && <div className="error-message">{validationError}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="route-description">Description:</label>
          <textarea
            id="route-description"
            value={editedRoute.description}
            onChange={handleDescriptionChange}
            rows={3}
          />
        </div>
        
        <div className="form-group checkbox-group">
          <label htmlFor="auto-inventory-checks">
            <input
              id="auto-inventory-checks"
              type="checkbox"
              checked={editedRoute.autoInventoryChecks}
              onChange={handleAutoInventoryChecksChange}
            />
            Automatically check inventory before first stop and after last stop
          </label>
        </div>
      </div>
      
      <div className="route-stops-section">
        <div className="route-stops-header">
          <h3>Stops</h3>
          <button 
            className="add-stop-button"
            onClick={handleAddStop}
            disabled={!editedRoute.id}
            title="Add Stop"
          >
            <FontAwesomeIcon icon={faPlus} /> Add Stop
          </button>
        </div>
        
        {editedRoute.stops.length === 0 ? (
          <div className="no-stops-message">
            <p>No stops added yet. Add a stop to get started.</p>
          </div>
        ) : (
          <ul className="stops-list">
            {editedRoute.stops.map(stop => (
              <li key={stop.id} className="stop-item">
                <div className="stop-item-content">
                  <div className="stop-item-info">
                    <h4 className="stop-name">{stop.name}</h4>
                    <p className="stop-description">{stop.description}</p>
                    <div className="stop-stats">
                      <span className="stop-items-count">
                        {stop.items.length} item{stop.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="stop-item-actions">
                    <button 
                      className="stop-action-button stop-edit-button"
                      onClick={() => handleEditStop(stop.id)}
                      title="Edit Stop"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="stop-action-button stop-delete-button"
                      onClick={() => handleDeleteStop(stop.id)}
                      title="Delete Stop"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RouteEditor; 