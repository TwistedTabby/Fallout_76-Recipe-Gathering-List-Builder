import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkedAlt, faCheckCircle, faListAlt, faBoxes, faWineBottle, faLeaf } from '@fortawesome/free-solid-svg-icons';
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
  // Calculate statistics for selected route
  const selectedRouteStats = useMemo(() => {
    if (!selectedRouteId) {
      return null;
    }

    const route = routes.find(r => r.id === selectedRouteId);
    if (!route) {
      return null;
    }

    const totalStops = route.stops.length;
    const totalItems = route.stops.reduce((sum, stop) => sum + stop.items.length, 0);
    const totalRuns = route.completedRuns || 0;
    const avgItemsPerStop = totalStops > 0 ? totalItems / totalStops : 0;
    
    // Calculate item statistics by type
    const itemStatsByType = {
      consumables: [] as { name: string, count: number, totalQuantity: number }[],
      bobbleheads: { total: 0, uniqueCount: 0, stopCount: 0, stopsWithBobbleheads: new Set<string>() },
      magazines: { total: 0, uniqueCount: 0, stopCount: 0, stopsWithMagazines: new Set<string>() },
      harvestables: [] as { name: string, stopCount: number }[]
    };
    
    // Process each stop
    route.stops.forEach(stop => {
      // Track harvestables in this stop to avoid counting duplicates
      const harvestablesInStop = new Set<string>();
      let hasBobblehead = false;
      let hasMagazine = false;
      
      stop.items.forEach(item => {
        const itemType = item.type;
        
        // Process by item type
        switch (itemType) {
          case 'Consumable':
            // Group consumables by name (case-insensitive)
            const normalizedName = item.name.toLowerCase();
            const existingConsumable = itemStatsByType.consumables.find(
              c => c.name.toLowerCase() === normalizedName
            );
            
            if (existingConsumable) {
              existingConsumable.count++;
              existingConsumable.totalQuantity += item.quantity;
            } else {
              itemStatsByType.consumables.push({ 
                name: item.name, 
                count: 1,
                totalQuantity: item.quantity
              });
            }
            break;
            
          case 'Bobblehead':
            itemStatsByType.bobbleheads.total++;
            hasBobblehead = true;
            break;
            
          case 'Magazine':
            itemStatsByType.magazines.total++;
            hasMagazine = true;
            break;
            
          case 'Harvestable':
            // Only count each harvestable once per stop
            if (!harvestablesInStop.has(item.name)) {
              harvestablesInStop.add(item.name);
              
              // Find or create entry for this harvestable
              const existingHarvestable = itemStatsByType.harvestables.find(
                h => h.name === item.name
              );
              
              if (existingHarvestable) {
                existingHarvestable.stopCount++;
              } else {
                itemStatsByType.harvestables.push({ name: item.name, stopCount: 1 });
              }
            }
            break;
            
          default:
            // Ignore other types (Task, Event, etc.)
            break;
        }
      });
      
      // After processing all items in the stop, update stop counts for bobbleheads and magazines
      if (hasBobblehead) {
        itemStatsByType.bobbleheads.stopsWithBobbleheads.add(stop.id);
      }
      
      if (hasMagazine) {
        itemStatsByType.magazines.stopsWithMagazines.add(stop.id);
      }
    });
    
    // Calculate final stop counts
    itemStatsByType.bobbleheads.stopCount = itemStatsByType.bobbleheads.stopsWithBobbleheads.size;
    itemStatsByType.magazines.stopCount = itemStatsByType.magazines.stopsWithMagazines.size;
    
    // Sort consumables by total quantity (descending)
    itemStatsByType.consumables.sort((a, b) => b.totalQuantity - a.totalQuantity);
    
    // Sort harvestables by stop count (descending)
    itemStatsByType.harvestables.sort((a, b) => b.stopCount - a.stopCount);
    
    return {
      totalStops,
      totalItems,
      totalRuns,
      avgItemsPerStop,
      itemStatsByType,
      routeName: route.name,
      routeDescription: route.description
    };
  }, [routes, selectedRouteId]);

  if (!selectedRouteStats) {
    return (
      <div className="text-center p-4">
        <p>Select a route to view statistics</p>
      </div>
    );
  }

  return (
    <div className="route-statistics">
      <div className="route-stats-header mb-4">
        
        {selectedRouteStats.routeDescription && (
          <p className="text-gray-600">{selectedRouteStats.routeDescription}</p>
        )}
      </div>
      
      <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="stat-card p-4 bg-white rounded-lg shadow">
          <div className="stat-icon mb-2">
            <FontAwesomeIcon icon={faMapMarkedAlt} size="lg" />
          </div>
          <div className="stat-value text-2xl font-bold">{selectedRouteStats.totalStops}</div>
          <div className="stat-label text-gray-600">Total Stops</div>
        </div>
        
        <div className="stat-card p-4 bg-white rounded-lg shadow">
          <div className="stat-icon mb-2">
            <FontAwesomeIcon icon={faBoxes} size="lg" />
          </div>
          <div className="stat-value text-2xl font-bold">{selectedRouteStats.totalItems}</div>
          <div className="stat-label text-gray-600">Total Items</div>
        </div>
        
        <div className="stat-card p-4 bg-white rounded-lg shadow">
          <div className="stat-icon mb-2">
            <FontAwesomeIcon icon={faCheckCircle} size="lg" />
          </div>
          <div className="stat-value text-2xl font-bold">{selectedRouteStats.totalRuns}</div>
          <div className="stat-label text-gray-600">Completed Runs</div>
        </div>
        
        <div className="stat-card p-4 bg-white rounded-lg shadow">
          <div className="stat-icon mb-2">
            <FontAwesomeIcon icon={faListAlt} size="lg" />
          </div>
          <div className="stat-value text-2xl font-bold">{selectedRouteStats.avgItemsPerStop.toFixed(1)}</div>
          <div className="stat-label text-gray-600">Avg Items per Stop</div>
        </div>
      </div>
      
      <div className="resource-summary-section">
        <h4>Route Resource Summary</h4>
        
        {/* Bobbleheads & Magazines */}
        <div className="mb-4">
          <h5 className="resource-section-title">Collectibles</h5>
          {selectedRouteStats.itemStatsByType.bobbleheads.total > 0 || 
           selectedRouteStats.itemStatsByType.magazines.total > 0 ? (
            <div className="stats-grid grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedRouteStats.itemStatsByType.bobbleheads.total > 0 && (
                <div className="stat-card">
                  <div className="stat-value">{selectedRouteStats.itemStatsByType.bobbleheads.total} Bobbleheads</div>
                  <div className="stat-label">{selectedRouteStats.itemStatsByType.bobbleheads.stopCount} {selectedRouteStats.itemStatsByType.bobbleheads.stopCount === 1 ? 'stop' : 'stops'}</div>
                </div>
              )}
              
              {selectedRouteStats.itemStatsByType.magazines.total > 0 && (
                <div className="stat-card">
                  <div className="stat-value">{selectedRouteStats.itemStatsByType.magazines.total} Magazines</div>
                  <div className="stat-label">{selectedRouteStats.itemStatsByType.magazines.stopCount} {selectedRouteStats.itemStatsByType.magazines.stopCount === 1 ? 'stop' : 'stops'}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="resource-empty-message">No Collectibles in this route</div>
          )}
        </div>
        
        {/* Resource sections - full width, stacked vertically */}
        <div className="resource-sections">
          {/* Consumables Section */}
          <div className="resource-section consumables-section">
            <h5 className="resource-section-title">Consumables</h5>
            <div className="resource-items-grid">
              {selectedRouteStats.itemStatsByType.consumables.length > 0 ? (
                selectedRouteStats.itemStatsByType.consumables.map((item, index) => (
                  <div 
                    key={item.name} 
                    className={`resource-item ${index % 2 === 0 ? 'resource-item-even' : 'resource-item-odd'}`}
                  >
                    <div className="resource-item-content">
                      <div className="resource-item-icon">
                        <FontAwesomeIcon icon={faWineBottle} />
                      </div>
                      <div className="resource-item-details">
                        <div className="resource-item-name">{item.name}</div>
                        <div className="resource-item-count">{item.totalQuantity}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="resource-empty-message">No consumables in this route</div>
              )}
            </div>
          </div>
          
          {/* Harvestables Section */}
          <div className="resource-section harvestables-section">
            <h5 className="resource-section-title">Harvestables</h5>
            <div className="resource-items-grid">
              {selectedRouteStats.itemStatsByType.harvestables.length > 0 ? (
                selectedRouteStats.itemStatsByType.harvestables.map((item, index) => (
                  <div 
                    key={item.name} 
                    className={`resource-item ${index % 2 === 0 ? 'resource-item-even' : 'resource-item-odd'}`}
                  >
                    <div className="resource-item-content">
                      <div className="resource-item-icon">
                        <FontAwesomeIcon icon={faLeaf} />
                      </div>
                      <div className="resource-item-details">
                        <div className="resource-item-name">{item.name}</div>
                        <div className="resource-item-count">{item.stopCount} {item.stopCount === 1 ? 'stop' : 'stops'}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="resource-empty-message">No harvestables in this route</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteStatistics; 