import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Route } from '../types/farmingTracker';

interface RouteListProps {
  routes: Route[];
  currentRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
  onCreateRoute: () => void;
  onEditRoute: (routeId: string) => void;
  onDeleteRoute: (routeId: string) => void;
  onStartTracking: (routeId: string) => void;
  onDuplicateRoute?: (routeId: string) => void;
}

/**
 * Component for displaying and managing the list of routes
 */
const RouteList: React.FC<RouteListProps> = ({
  routes,
  currentRouteId,
  onSelectRoute,
  onCreateRoute,
  onEditRoute,
  onDeleteRoute,
  onStartTracking,
  onDuplicateRoute
}) => {
  return (
    <div className="route-list-container">
      <div className="route-list-header">
        <h2>Your Routes</h2>
        <button 
          className="create-route-button"
          onClick={onCreateRoute}
        >
          <FontAwesomeIcon icon={faPlus} /> Create New Route
        </button>
      </div>
      
      {routes.length === 0 ? (
        <div className="no-routes-message">
          <p>You don't have any routes yet. Create your first route to get started!</p>
        </div>
      ) : (
        <ul className="route-list">
          {routes.map(route => (
            <li 
              key={route.id} 
              className={`route-item ${currentRouteId === route.id ? 'active' : ''}`}
              onClick={() => onSelectRoute(route.id)}
            >
              <div className="route-item-content">
                <div className="route-item-info">
                  <h3 className="route-name">{route.name}</h3>
                  <p className="route-description">{route.description}</p>
                  <div className="route-stats">
                    <span className="route-stops-count">{route.stops.length} stops</span>
                    {route.completedRuns !== undefined && route.completedRuns > 0 && (
                      <span className="route-completed-runs">
                        {route.completedRuns} {route.completedRuns === 1 ? 'run' : 'runs'} completed
                      </span>
                    )}
                  </div>
                </div>
                <div className="route-item-actions">
                  <button 
                    className="route-action-button route-edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditRoute(route.id);
                    }}
                    title="Edit Route"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    className="route-action-button route-start-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartTracking(route.id);
                    }}
                    title="Start Tracking"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                  </button>
                  <button 
                    className="route-action-button route-delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRoute(route.id);
                    }}
                    title="Delete Route"
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
  );
};

export default RouteList; 