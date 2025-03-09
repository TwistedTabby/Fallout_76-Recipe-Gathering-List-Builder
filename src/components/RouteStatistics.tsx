import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkedAlt, faStopwatch, faCheckCircle, faListAlt, faBoxes } from '@fortawesome/free-solid-svg-icons';
import { Route } from '../types/farmingTracker';

interface RouteStatisticsProps {
  routes: Route[];
  selectedRouteId: string | null;
}

/**
 * Component for visualizing route statistics
 */
const RouteStatistics: React.FC<RouteStatisticsProps> = ({
  routes,
  selectedRouteId
}) => {
  // Calculate statistics for all routes
  const globalStats = useMemo(() => {
    if (!routes.length) {
      return {
        totalRoutes: 0,
        totalStops: 0,
        totalItems: 0,
        totalRuns: 0,
        avgStopsPerRoute: 0,
        avgItemsPerRoute: 0
      };
    }

    const totalStops = routes.reduce((sum, route) => sum + route.stops.length, 0);
    const totalItems = routes.reduce((sum, route) => {
      return sum + route.stops.reduce((itemSum, stop) => itemSum + stop.items.length, 0);
    }, 0);
    const totalRuns = routes.reduce((sum, route) => sum + (route.completedRuns || 0), 0);

    return {
      totalRoutes: routes.length,
      totalStops,
      totalItems,
      totalRuns,
      avgStopsPerRoute: totalStops / routes.length,
      avgItemsPerRoute: totalItems / routes.length
    };
  }, [routes]);

  // Calculate statistics for selected route
  const selectedRouteStats = useMemo(() => {
    if (!selectedRouteId) {
      return null;
    }

    const route = routes.find(r => r.id === selectedRouteId);
    if (!route) {
      return null;
    }

    const totalItems = route.stops.reduce((sum, stop) => sum + stop.items.length, 0);
    const itemTypes = new Set<string>();
    route.stops.forEach(stop => {
      stop.items.forEach(item => {
        itemTypes.add(item.type);
      });
    });

    return {
      routeName: route.name,
      totalStops: route.stops.length,
      totalItems,
      completedRuns: route.completedRuns || 0,
      itemTypes: Array.from(itemTypes),
      itemsPerStop: route.stops.length ? (totalItems / route.stops.length).toFixed(1) : '0'
    };
  }, [routes, selectedRouteId]);

  return (
    <div className="route-statistics">
      <div className="stats shadow w-full mb-4">
        <div className="stat">
          <div className="stat-figure text-primary">
            <FontAwesomeIcon icon={faMapMarkedAlt} size="2x" />
          </div>
          <div className="stat-title">Total Routes</div>
          <div className="stat-value text-primary">{globalStats.totalRoutes}</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-secondary">
            <FontAwesomeIcon icon={faListAlt} size="2x" />
          </div>
          <div className="stat-title">Total Stops</div>
          <div className="stat-value text-secondary">{globalStats.totalStops}</div>
          <div className="stat-desc">Avg {globalStats.avgStopsPerRoute.toFixed(1)} per route</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-accent">
            <FontAwesomeIcon icon={faBoxes} size="2x" />
          </div>
          <div className="stat-title">Total Items</div>
          <div className="stat-value text-accent">{globalStats.totalItems}</div>
          <div className="stat-desc">Avg {globalStats.avgItemsPerRoute.toFixed(1)} per route</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-info">
            <FontAwesomeIcon icon={faCheckCircle} size="2x" />
          </div>
          <div className="stat-title">Completed Runs</div>
          <div className="stat-value text-info">{globalStats.totalRuns}</div>
        </div>
      </div>
      
      {selectedRouteStats && (
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-2">{selectedRouteStats.routeName} Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Stops</div>
                <div className="stat-value">{selectedRouteStats.totalStops}</div>
              </div>
              
              <div className="stat">
                <div className="stat-title">Items</div>
                <div className="stat-value">{selectedRouteStats.totalItems}</div>
                <div className="stat-desc">{selectedRouteStats.itemsPerStop} per stop</div>
              </div>
            </div>
            
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Completed Runs</div>
                <div className="stat-value">{selectedRouteStats.completedRuns}</div>
              </div>
              
              <div className="stat">
                <div className="stat-title">Item Types</div>
                <div className="stat-value">{selectedRouteStats.itemTypes.length}</div>
              </div>
            </div>
          </div>
          
          {selectedRouteStats.itemTypes.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold mb-2">Item Types</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRouteStats.itemTypes.map(type => (
                  <span key={type} className="badge badge-primary badge-lg">{type}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteStatistics; 