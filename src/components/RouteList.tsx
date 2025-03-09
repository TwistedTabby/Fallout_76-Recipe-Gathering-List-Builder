import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faEdit, faTrash, faPlus, faCopy } from '@fortawesome/free-solid-svg-icons';
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
    <div className="card route-list-container">
      <div className="card-header route-list-header">
        <h2>Your Routes</h2>
        <button 
          className="btn btn-primary create-route-button"
          onClick={onCreateRoute}
        >
          <FontAwesomeIcon icon={faPlus} /> Create New Route
        </button>
      </div>
      
      <div className="card-body">
        {routes.length === 0 ? (
          <div className="no-routes-message p-4 text-center bg-gray-50 rounded-lg">
            <p className="text-gray-600">You don't have any routes yet. Create your first route to get started!</p>
          </div>
        ) : (
          <ul className="route-list">
            {routes.map(route => (
              <li 
                key={route.id} 
                className={`route-item ${currentRouteId === route.id ? 'active' : ''}`}
              >
                <div 
                  className="route-info"
                  onClick={() => onSelectRoute(route.id)}
                >
                  <div className="route-name">{route.name}</div>
                  <div className="route-meta">
                    <span>{route.stops.length} stops</span>
                    <span>{route.completedRuns || 0} runs</span>
                  </div>
                </div>
                <div className="route-actions">
                  <button 
                    className="btn-icon-sm start-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartTracking(route.id);
                    }}
                    aria-label="Start tracking this route"
                    title="Start Tracking"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                  </button>
                  <button 
                    className="btn-icon-sm edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditRoute(route.id);
                    }}
                    aria-label="Edit this route"
                    title="Edit Route"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  {onDuplicateRoute && (
                    <button 
                      className="btn-icon-sm btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateRoute(route.id);
                      }}
                      aria-label="Duplicate this route"
                      title="Duplicate Route"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                  )}
                  <button 
                    className="btn-icon-sm delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRoute(route.id);
                    }}
                    aria-label="Delete this route"
                    title="Delete Route"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RouteList; 