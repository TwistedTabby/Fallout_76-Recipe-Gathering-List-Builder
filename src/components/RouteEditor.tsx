import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Route, Stop } from '../types/farmingTracker';
import { v4 as uuidv4 } from 'uuid';

interface RouteEditorProps {
  route: Route;
  onSave: (route: Route) => void;
  onCancel: () => void;
}

/**
 * Component for editing a route and its stops
 */
const RouteEditor: React.FC<RouteEditorProps> = ({ route, onSave, onCancel }) => {
  // Local state for editing
  const [editedRoute, setEditedRoute] = useState<Route>({ ...route });
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [newStopName, setNewStopName] = useState('');
  const [newStopDescription, setNewStopDescription] = useState('');

  // Update local state when route prop changes
  useEffect(() => {
    setEditedRoute({ ...route });
  }, [route]);

  // Handle route name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedRoute(prev => ({ ...prev, name: e.target.value }));
  };

  // Handle route description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedRoute(prev => ({ ...prev, description: e.target.value }));
  };

  // Handle auto inventory checks toggle
  const handleAutoInventoryChecksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedRoute(prev => ({ ...prev, autoInventoryChecks: e.target.checked }));
  };

  // Handle adding a new stop
  const handleAddStop = () => {
    if (!newStopName.trim()) {
      return; // Don't add empty stops
    }

    const newStop: Stop = {
      id: uuidv4(),
      name: newStopName.trim(),
      description: newStopDescription.trim(),
      items: []
    };

    setEditedRoute(prev => ({
      ...prev,
      stops: [...prev.stops, newStop]
    }));

    // Reset form
    setNewStopName('');
    setNewStopDescription('');
    setIsAddingStop(false);
  };

  // Handle deleting a stop
  const handleDeleteStop = (stopId: string) => {
    setEditedRoute(prev => ({
      ...prev,
      stops: prev.stops.filter(stop => stop.id !== stopId)
    }));
  };

  // Handle saving the route
  const handleSave = () => {
    // Validate route has a name
    if (!editedRoute.name.trim()) {
      alert('Route must have a name');
      return;
    }

    onSave(editedRoute);
  };

  return (
    <div className="route-editor">
      <div className="route-editor-header">
        <h2>{route.id ? 'Edit Route' : 'Create Route'}</h2>
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
            <FontAwesomeIcon icon={faSave} /> Save
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
            placeholder="Enter route name"
            className="route-name-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="route-description">Description:</label>
          <textarea
            id="route-description"
            value={editedRoute.description}
            onChange={handleDescriptionChange}
            placeholder="Enter route description"
            className="route-description-input"
            rows={3}
          />
        </div>

        <div className="form-group checkbox-group">
          <input
            id="auto-inventory-checks"
            type="checkbox"
            checked={editedRoute.autoInventoryChecks || false}
            onChange={handleAutoInventoryChecksChange}
          />
          <label htmlFor="auto-inventory-checks">
            Automatically check inventory before first and after last stop
          </label>
        </div>
      </div>

      <div className="stops-section">
        <div className="stops-header">
          <h3>Stops</h3>
          <button 
            className="add-stop-button"
            onClick={() => setIsAddingStop(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Stop
          </button>
        </div>

        {isAddingStop && (
          <div className="add-stop-form">
            <h4>Add New Stop</h4>
            <div className="form-group">
              <label htmlFor="new-stop-name">Stop Name:</label>
              <input
                id="new-stop-name"
                type="text"
                value={newStopName}
                onChange={(e) => setNewStopName(e.target.value)}
                placeholder="Enter stop name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-stop-description">Description:</label>
              <textarea
                id="new-stop-description"
                value={newStopDescription}
                onChange={(e) => setNewStopDescription(e.target.value)}
                placeholder="Enter stop description"
                rows={2}
              />
            </div>
            <div className="add-stop-actions">
              <button 
                className="cancel-button"
                onClick={() => {
                  setIsAddingStop(false);
                  setNewStopName('');
                  setNewStopDescription('');
                }}
              >
                Cancel
              </button>
              <button 
                className="add-button"
                onClick={handleAddStop}
                disabled={!newStopName.trim()}
              >
                Add Stop
              </button>
            </div>
          </div>
        )}

        {editedRoute.stops.length === 0 ? (
          <div className="no-stops-message">
            <p>This route has no stops yet. Add stops to define your farming route.</p>
          </div>
        ) : (
          <ul className="stops-list">
            {editedRoute.stops.map((stop, index) => (
              <li key={stop.id} className="stop-item">
                <div className="stop-header">
                  <span className="stop-number">{index + 1}</span>
                  <h4 className="stop-name">{stop.name}</h4>
                  <div className="stop-actions">
                    <button 
                      className="delete-stop-button"
                      onClick={() => handleDeleteStop(stop.id)}
                      title="Delete Stop"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
                {stop.description && (
                  <p className="stop-description">{stop.description}</p>
                )}
                <div className="stop-items-summary">
                  <span>{stop.items.length} items</span>
                  {/* We'll add an edit button here later when we implement the StopEditor */}
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