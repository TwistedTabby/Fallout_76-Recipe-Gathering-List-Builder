import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faEdit, faTrash, faPlus, faCopy, faChartBar, faHistory } from '@fortawesome/free-solid-svg-icons';
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
  onViewRouteStats?: (routeId: string) => void;
  onViewRouteHistory?: (routeId: string) => void;
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
  onDuplicateRoute,
  onViewRouteStats,
  onViewRouteHistory
}) => {
  return (
    <div className="card route-list-container">
      <div className="card-header route-list-header flex-col sm:flex-row items-start sm:items-center">
        <h2 className="mb-3 sm:mb-0">Your Routes</h2>
        <button 
          className="btn mt-2 mt-md-0 btn-primary create-route-button w-full sm:w-auto text-sm"
          onClick={onCreateRoute}
        >
          <FontAwesomeIcon icon={faPlus} /> <span className="sm:inline">Create New Route</span>
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
                  className="route-info flex flex-col sm:flex-row w-full"
                  onClick={() => onSelectRoute(route.id)}
                >
                  <div className="route-name text-lg mb-1 sm:mb-0 w-full">{route.name}</div>
                  <div className="route-meta flex sm:ml-auto">
                    <div className="flex items-center">
                      <span className="mr-2">{route.stops.length} stops</span>
                      <span>{route.completedRuns || 0} runs</span>
                    </div>
                  </div>
                </div>
                <div className="route-actions mt-2 sm:mt-0 flex justify-between sm:justify-end w-full">
                  <div className="flex-1 flex justify-start">
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
                  </div>
                  
                  <div className="flex-1 flex justify-center gap-2">
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
                  </div>
                  
                  <div className="flex-1 flex justify-end gap-2">
                    {onViewRouteStats && (
                      <button 
                        className="btn-icon-sm btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewRouteStats(route.id);
                        }}
                        aria-label="View statistics for this route"
                        title="Route Statistics"
                      >
                        <FontAwesomeIcon icon={faChartBar} />
                      </button>
                    )}
                    
                    {onViewRouteHistory && (
                      <button 
                        className="btn-icon-sm btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewRouteHistory(route.id);
                        }}
                        aria-label="View history for this route"
                        title="Route History"
                      >
                        <FontAwesomeIcon icon={faHistory} />
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