import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faChevronDown, faChevronUp, faHistory, faBookOpen, faCube, faCalendarDay, faWineBottle, faEraser } from '@fortawesome/free-solid-svg-icons';
import { RouteHistory as RouteHistoryType, Route } from '../types/farmingTracker';
import { formatElapsedTime } from '../utils/timeUtils';

interface RouteHistoryProps {
  histories: RouteHistoryType[];
  onDeleteHistory: (historyId: string) => Promise<void>;
  onViewRouteDetails: (routeId: string) => void;
  onResetAllHistory?: () => Promise<void>;
  getRouteById?: (routeId: string) => Promise<any>;
  currentRoute?: Route;
}

// Item type categories we want to track specifically
const TRACKED_ITEM_TYPES = ['Magazine', 'Bobblehead', 'Consumable', 'Event', 'Spawned'];

// Icons for each item type
const ITEM_TYPE_ICONS: Record<string, any> = {
  'Event': faCalendarDay,
  'Magazine': faBookOpen,
  'Bobblehead': faCube,
  'Consumable': faWineBottle,
  'Spawned': faCube // Using the same icon as Bobblehead for now
};

// Colors for each item type
const ITEM_TYPE_COLORS: Record<string, { bg: string, border: string }> = {
  'Bobblehead': { 
    bg: 'rgba(var(--main-accent-rgb), 0.1)', 
    border: '3px solid var(--main-accent)' 
  },
  'Magazine': { 
    bg: 'rgba(var(--extra-pop-rgb), 0.1)', 
    border: '3px solid var(--extraPop)' 
  },
  'Consumable': { 
    bg: 'rgba(var(--actionPositive-rgb), 0.1)', 
    border: '3px solid var(--actionPositive)' 
  },
  'Event': { 
    bg: 'rgba(var(--secondary-accent-rgb), 0.1)', 
    border: '3px solid var(--secondary-accent)' 
  },
  'Spawned': { 
    bg: 'rgba(var(--main-accent-rgb), 0.1)', 
    border: '3px solid var(--main-accent)' 
  }
};

/**
 * Component for displaying route history
 */
const RouteHistory: React.FC<RouteHistoryProps> = ({ 
  histories, 
  onDeleteHistory,
  onResetAllHistory,
  onViewRouteDetails,
  getRouteById,
  currentRoute
}) => {
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'date' | 'duration'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortedHistories, setSortedHistories] = useState<RouteHistoryType[]>(histories);
  const [activeItemTypeFilter, setActiveItemTypeFilter] = useState<string | null>(null);
  // const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [routeCache, setRouteCache] = useState<Record<string, any>>({});
  const [loadingRoutes, setLoadingRoutes] = useState<Record<string, boolean>>({});
  

  // Update sorted histories when histories, sortField, or sortDirection changes
  useEffect(() => {
    let sorted = [...histories];
    
    // Apply sorting
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = a.startTime - b.startTime;
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setSortedHistories(sorted);
  }, [histories, sortField, sortDirection]);

  // Preload route data for visible history entries
  useEffect(() => {
    const preloadRouteData = async () => {
      if (!getRouteById || histories.length === 0) return;
      
      // Get unique route IDs from the first few history entries
      const visibleRouteIds = [...new Set(
        sortedHistories
          .slice(0, 5) // Preload data for the first 5 visible entries
          .map(history => history.routeId)
      )];
      
      // Preload route data for each unique route ID
      for (const routeId of visibleRouteIds) {
        // Skip if we already have this route in cache, if it's already loading, or if it matches currentRoute
        if (routeCache[routeId] || loadingRoutes[routeId] || (currentRoute && currentRoute.id === routeId)) continue;
        
        try {
          setLoadingRoutes(prev => ({ ...prev, [routeId]: true }));
          const routeData = await getRouteById(routeId);
          
          if (routeData) {
            setRouteCache(prev => ({ ...prev, [routeId]: routeData }));
          }
        } catch (error) {
          console.error(`Error preloading route data for ${routeId}:`, error);
        } finally {
          setLoadingRoutes(prev => ({ ...prev, [routeId]: false }));
        }
      }
    };
    
    preloadRouteData();
  }, [getRouteById, histories, sortedHistories, routeCache, loadingRoutes, currentRoute]);

  // Fetch route data when a history entry is expanded
  useEffect(() => {
    const fetchRouteData = async () => {
      if (!expandedHistoryId || !getRouteById) return;
      
      const history = histories.find(h => h.id === expandedHistoryId);
      if (!history) return;
      
      const routeId = history.routeId;
      
      // Skip if we already have this route in cache, if it's already loading, or if it matches currentRoute
      if (routeCache[routeId] || loadingRoutes[routeId] || (currentRoute && currentRoute.id === routeId)) return;
      
      try {
        setLoadingRoutes(prev => ({ ...prev, [routeId]: true }));
        const routeData = await getRouteById(routeId);
        
        if (routeData) {
          setRouteCache(prev => ({ ...prev, [routeId]: routeData }));
        }
      } catch (error) {
        console.error(`Error fetching route data for ${routeId}:`, error);
      } finally {
        setLoadingRoutes(prev => ({ ...prev, [routeId]: false }));
      }
    };
    
    fetchRouteData();
  }, [expandedHistoryId, getRouteById, histories, routeCache, loadingRoutes, currentRoute]);

  const handleSort = (field: 'date' | 'duration') => {
    if (field === sortField) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleExpand = (historyId: string) => {
    setExpandedHistoryId(expandedHistoryId === historyId ? null : historyId);
    
    // If we're expanding and have getRouteById function, ensure we fetch the route data
    if (historyId !== expandedHistoryId && getRouteById) {
      const history = histories.find(h => h.id === historyId);
      // Skip fetching if the history matches the current route
      if (history && !routeCache[history.routeId] && !(currentRoute && currentRoute.id === history.routeId)) {
        // The useEffect will handle the actual fetching
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const calculateCollectionRate = (history: RouteHistoryType) => {
    const totalItems = Object.entries(history.collectedItems)
      .filter(([_, collected]) => collected === true)
      .length;
    const minutes = history.duration / 60000; // Convert ms to minutes
    return minutes > 0 ? (totalItems / minutes).toFixed(1) : '0';
  };

  // Calculate collection statistics for specific item types across all histories
  const itemTypeStats = useMemo(() => {
    const stats: Record<string, { total: number, runs: number }> = {};
    const consumableStats: Record<string, { total: number, runs: number }> = {};
    const eventStats: Record<string, { total: number, runs: number }> = {};
    const spawnedStats: Record<string, { total: number, runs: number }> = {};
    
    // Initialize stats for tracked item types
    TRACKED_ITEM_TYPES.forEach(type => {
      stats[type] = { total: 0, runs: 0 };
    });
    
    // Get all consumables from the current route if available
    const routeConsumables: Record<string, string> = {}; // Maps item IDs to names
    const routeEvents: Record<string, string> = {}; // Maps item IDs to names
    const routeSpawned: Record<string, string> = {}; // Maps item IDs to names
    
    if (currentRoute) {
      currentRoute.stops.forEach(stop => {
        stop.items.forEach(item => {
          if (item.type.toLowerCase() === 'consumable') {
            routeConsumables[item.id] = item.name;
          } else if (item.type.toLowerCase() === 'event') {
            routeEvents[item.id] = item.name;
          } else if (item.type.toLowerCase() === 'spawned') {
            routeSpawned[item.id] = item.name;
          }
        });
      });
    }
    
    // Process each history
    histories.forEach(history => {
      // We need to check if any items of each type were collected
      const typeCollected: Record<string, boolean> = {};
      const consumableCollected: Record<string, boolean> = {};
      const eventCollected: Record<string, boolean> = {};
      const spawnedCollected: Record<string, boolean> = {};
      
      // Process collected items
      Object.entries(history.collectedItems).forEach(([itemId, collected]) => {
        if (!collected) return;
        
        let itemType: string;
        let itemName: string = '';
        
        // First check if we have detailed collectible information
        if (history.collectibleDetails && history.collectibleDetails[itemId]) {
          // Use the type from collectibleDetails
          itemType = history.collectibleDetails[itemId].type;
          // Convert to proper case to match TRACKED_ITEM_TYPES
          itemType = itemType.charAt(0).toUpperCase() + itemType.slice(1).toLowerCase();
          // Get the name for consumables
          itemName = history.collectibleDetails[itemId].name;
          
        } else if (routeConsumables[itemId]) {
          // If we have this item in the current route's consumables
          itemType = 'Consumable';
          itemName = routeConsumables[itemId];
        } else if (routeEvents[itemId]) {
          // If we have this item in the current route's events
          itemType = 'Event';
          itemName = routeEvents[itemId];
        } else if (routeSpawned[itemId]) {
          // If we have this item in the current route's spawned items
          itemType = 'Spawned';
          itemName = routeSpawned[itemId];
        } else {
          // Default to unknown type if no details available
          itemType = 'Unknown';
          
        }
        
        if (TRACKED_ITEM_TYPES.includes(itemType)) {
          // For consumables, use the quantity from collectedQuantities
          const quantity = itemType === 'Consumable' ? (history.collectedQuantities?.[itemId] || 1) : 1;
          stats[itemType].total += quantity;
          typeCollected[itemType] = true;
          
          // For consumables, track by name
          if (itemType === 'Consumable' && itemName) {
            if (!consumableStats[itemName]) {
              consumableStats[itemName] = { total: 0, runs: 0 };
            }
            consumableStats[itemName].total += quantity;
            consumableCollected[itemName] = true;
          }
          
          // For events, track by name
          if (itemType === 'Event' && itemName) {
            if (!eventStats[itemName]) {
              eventStats[itemName] = { total: 0, runs: 0 };
            }
            eventStats[itemName].total += quantity;
            eventCollected[itemName] = true;
          }
          
          // For spawned items, track by name
          if (itemType === 'Spawned' && itemName) {
            if (!spawnedStats[itemName]) {
              spawnedStats[itemName] = { total: 0, runs: 0 };
            }
            spawnedStats[itemName].total += quantity;
            spawnedCollected[itemName] = true;
          }
        }
      });
      
      // Count runs where each type was collected
      Object.entries(typeCollected).forEach(([type, wasCollected]) => {
        if (wasCollected) {
          stats[type].runs += 1;
        }
      });
      
      // Count runs for each consumable type
      Object.entries(consumableCollected).forEach(([name, wasCollected]) => {
        if (wasCollected && consumableStats[name]) {
          consumableStats[name].runs += 1;
        }
      });
      
      // Count runs for each event type
      Object.entries(eventCollected).forEach(([name, wasCollected]) => {
        if (wasCollected && eventStats[name]) {
          eventStats[name].runs += 1;
        }
      });
      
      // Count runs for each spawned item type
      Object.entries(spawnedCollected).forEach(([name, wasCollected]) => {
        if (wasCollected && spawnedStats[name]) {
          spawnedStats[name].runs += 1;
        }
      });
    });
    
    return { itemStats: stats, consumableStats, eventStats, spawnedStats };
  }, [histories, currentRoute]);

  if (histories.length === 0) {
    return (
      <div className="route-history-container">
        <div className="route-history-header flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--light-contrast)' }}>
            {currentRoute ? `History for ${currentRoute.name}` : 'Route History'}
          </h2>
          <button 
            className="btn btn-sm"
            onClick={() => onViewRouteDetails('')}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--light-contrast)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem'
            }}
          >
            Back to Routes
          </button>
        </div>
        
        <div className="text-center p-6 rounded-lg" style={{ backgroundColor: '#00539C' }}>
          <FontAwesomeIcon icon={faHistory} style={{ color: 'var(--light-contrast)', fontSize: '3rem', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--light-contrast)', fontSize: '1.25rem' }}>
            {currentRoute 
              ? `No history records found for "${currentRoute.name}".` 
              : 'No history records found for this route.'}
          </p>
          <p style={{ color: 'var(--light-contrast)', opacity: 0.7, marginTop: '0.5rem' }}>Complete a run to start tracking history.</p>
          
          {/* Display route details when currentRoute is available */}
          {currentRoute && (
            <div className="route-summary mt-4 p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--light-contrast)' }}>Route Details</h4>
              <div className="text-left">
                <p style={{ color: 'var(--light-contrast)', marginBottom: '0.5rem' }}>
                  <span className="font-medium">Stops:</span> {currentRoute.stops.length}
                </p>
                {currentRoute.description && (
                  <p style={{ color: 'var(--light-contrast)', fontSize: '0.9rem' }}>
                    <span className="font-medium">Description:</span> {currentRoute.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="route-history-container">
      <div className="route-history" style={{ backgroundColor: '#00539C', padding: '1rem', borderRadius: '0.5rem' }}>
        {/* Route Summary when currentRoute is available */}
        {currentRoute && (
          <div className="route-summary mb-4 p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold" style={{ color: 'var(--light-contrast)' }}>{currentRoute.name}</h3>
              <div className="text-sm" style={{ color: 'var(--light-contrast)' }}>
                {currentRoute.stops.length} {currentRoute.stops.length === 1 ? 'stop' : 'stops'}
              </div>
            </div>
            {currentRoute.description && (
              <p className="text-sm mb-2" style={{ color: 'var(--light-contrast)', opacity: 0.9 }}>
                {currentRoute.description}
              </p>
            )}
            <div className="text-sm" style={{ color: 'var(--light-contrast)', opacity: 0.8 }}>
              {histories.length} {histories.length === 1 ? 'run' : 'runs'} completed
              {currentRoute.completedRuns !== undefined && currentRoute.completedRuns > 0 && (
                <span> (Total: {currentRoute.completedRuns})</span>
              )}
            </div>
          </div>
        )}

        {/* Item type statistics */}
        {Object.keys(itemTypeStats.itemStats).length > 0 && (
          <div className="item-type-stats mb-4">
            <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--light-contrast)' }}>Collection History by Type</h4>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Display non-consumable, non-event item types */}
              {TRACKED_ITEM_TYPES.filter(type => type !== 'Consumable' && type !== 'Event' && type !== 'Spawned').map(type => {
                // Determine icon and colors based on type
                const icon = ITEM_TYPE_ICONS[type] || faHistory;
                let iconColor = 'var(--main-accent)';
                let borderColor = 'var(--main-accent)';
                
                // Set specific colors for each type
                if (type === 'Bobblehead') {
                  iconColor = '#FFCC00'; // Gold for bobbleheads
                  borderColor = '#FFCC00';
                } else if (type === 'Magazine') {
                  iconColor = '#333333'; // Dark for magazines
                  borderColor = '#333333';
                }
                
                return (
                  <div 
                    key={type} 
                    className="item-type-card p-3 rounded-lg shadow cursor-pointer"
                    onClick={() => setActiveItemTypeFilter(activeItemTypeFilter === type ? null : type)}
                    style={{
                      backgroundColor: 'var(--light-contrast)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease-in-out',
                      transform: activeItemTypeFilter === type ? 'translateY(-2px)' : 'none',
                      border: activeItemTypeFilter === type ? `2px solid ${borderColor}` : '1px solid transparent',
                      borderLeft: `4px solid ${borderColor}`
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <div className="item-type-icon mr-2" style={{ color: iconColor, fontSize: '1.25rem' }}>
                        <FontAwesomeIcon icon={icon} />
                      </div>
                      <div className="item-type-name font-medium" style={{ color: 'var(--dark-contrast)' }}>{type}s</div>
                    </div>
                    <div className="item-type-stats">
                      <div className="text-4xl font-bold mb-1" style={{ color: 'var(--dark-contrast)' }}>
                        {itemTypeStats.itemStats[type]?.total || 0}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--dark-contrast)', opacity: 0.7 }}>
                        Found in {itemTypeStats.itemStats[type]?.runs || 0} of {histories.length} {histories.length === 1 ? 'run' : 'runs'} ({Math.round((itemTypeStats.itemStats[type]?.runs || 0) / histories.length * 100)}%)
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Display all individual consumables */}
              {Object.entries(itemTypeStats.consumableStats)
                .sort((a, b) => b[1].total - a[1].total) // Sort by total quantity (descending)
                .map(([name, stats]) => {
                  const iconColor = 'var(--actionPositive)'; // Green for consumables
                  const borderColor = 'var(--actionPositive)';
                  
                  return (
                    <div 
                      key={`consumable-${name}`} 
                      className="item-type-card p-3 rounded-lg shadow cursor-pointer"
                      onClick={() => setActiveItemTypeFilter(activeItemTypeFilter === 'Consumable' ? null : 'Consumable')}
                      style={{
                        backgroundColor: 'var(--light-contrast)',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s ease-in-out',
                        transform: activeItemTypeFilter === 'Consumable' ? 'translateY(-2px)' : 'none',
                        border: activeItemTypeFilter === 'Consumable' ? `2px solid ${borderColor}` : '1px solid transparent',
                        borderLeft: `4px solid ${borderColor}`
                      }}
                    >
                      <div className="flex items-center mb-2">
                        <div className="item-type-icon mr-2" style={{ color: iconColor, fontSize: '1.25rem' }}>
                          <FontAwesomeIcon icon={ITEM_TYPE_ICONS['Consumable']} />
                        </div>
                        <div className="item-type-name font-medium text-sm" style={{ color: 'var(--dark-contrast)' }}>{name}</div>
                      </div>
                      <div className="item-type-stats">
                        <div className="text-4xl font-bold mb-1" style={{ color: 'var(--dark-contrast)' }}>
                          {stats.total || 0}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--dark-contrast)', opacity: 0.7 }}>
                          Found in {stats.runs || 0} of {histories.length} {histories.length === 1 ? 'run' : 'runs'} ({Math.round((stats.runs / histories.length) * 100)}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Display all individual events */}
                {Object.entries(itemTypeStats.eventStats)
                  .sort((a, b) => b[1].total - a[1].total) // Sort by total quantity (descending)
                  .map(([name, stats]) => {
                    const iconColor = '#0066CC'; // Blue for events
                    const borderColor = '#0066CC';
                    
                    return (
                      <div 
                        key={`event-${name}`} 
                        className="item-type-card p-3 rounded-lg shadow cursor-pointer"
                        onClick={() => setActiveItemTypeFilter(activeItemTypeFilter === 'Event' ? null : 'Event')}
                        style={{
                          backgroundColor: 'var(--light-contrast)',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.2s ease-in-out',
                          transform: activeItemTypeFilter === 'Event' ? 'translateY(-2px)' : 'none',
                          border: activeItemTypeFilter === 'Event' ? `2px solid ${borderColor}` : '1px solid transparent',
                          borderLeft: `4px solid ${borderColor}`
                        }}
                      >
                        <div className="flex items-center mb-2">
                          <div className="item-type-icon mr-2" style={{ color: iconColor, fontSize: '1.25rem' }}>
                            <FontAwesomeIcon icon={ITEM_TYPE_ICONS['Event']} />
                          </div>
                          <div className="item-type-name font-medium text-sm" style={{ color: 'var(--dark-contrast)' }}>{name}</div>
                        </div>
                        <div className="item-type-stats">
                          <div className="text-4xl font-bold mb-1" style={{ color: 'var(--dark-contrast)' }}>
                            {stats.total || 0}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--dark-contrast)', opacity: 0.7 }}>
                            Found in {stats.runs || 0} of {histories.length} {histories.length === 1 ? 'run' : 'runs'} ({Math.round((stats.runs / histories.length) * 100)}%)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                {/* Display all individual spawned items */}
                {Object.entries(itemTypeStats.spawnedStats)
                  .sort((a, b) => b[1].total - a[1].total) // Sort by total quantity (descending)
                  .map(([name, stats]) => {
                    const iconColor = '#9933CC'; // Purple for spawned items
                    const borderColor = '#9933CC';
                    
                    return (
                      <div 
                        key={`spawned-${name}`} 
                        className="item-type-card p-3 rounded-lg shadow cursor-pointer"
                        onClick={() => setActiveItemTypeFilter(activeItemTypeFilter === 'Spawned' ? null : 'Spawned')}
                        style={{
                          backgroundColor: 'var(--light-contrast)',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.2s ease-in-out',
                          transform: activeItemTypeFilter === 'Spawned' ? 'translateY(-2px)' : 'none',
                          border: activeItemTypeFilter === 'Spawned' ? `2px solid ${borderColor}` : '1px solid transparent',
                          borderLeft: `4px solid ${borderColor}`
                        }}
                      >
                        <div className="flex items-center mb-2">
                          <div className="item-type-icon mr-2" style={{ color: iconColor, fontSize: '1.25rem' }}>
                            <FontAwesomeIcon icon={ITEM_TYPE_ICONS['Spawned']} />
                          </div>
                          <div className="item-type-name font-medium text-sm" style={{ color: 'var(--dark-contrast)' }}>{name}</div>
                        </div>
                        <div className="item-type-stats">
                          <div className="text-4xl font-bold mb-1" style={{ color: 'var(--dark-contrast)' }}>
                            {stats.total || 0}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--dark-contrast)', opacity: 0.7 }}>
                            Found in {stats.runs || 0} of {histories.length} {histories.length === 1 ? 'run' : 'runs'} ({Math.round((stats.runs / histories.length) * 100)}%)
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
            
            {/* Reset History Button - Moved here */}
            {onResetAllHistory && (
              <div className="flex justify-between items-center mt-3">
                <div className="history-count text-sm" style={{ color: 'var(--light-contrast)' }}>
                  {histories.length} {histories.length === 1 ? 'run' : 'runs'}
                </div>
                <button 
                  className="btn btn-sm"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all history? This action cannot be undone.')) {
                      onResetAllHistory();
                    }
                  }}
                  style={{
                    backgroundColor: '#D42E35',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem'
                  }}
                  title="Reset All History"
                >
                  <FontAwesomeIcon icon={faEraser} className="mr-2" />
                  Reset History
                </button>
              </div>
            )}
          </div>
        )}

        <div className="history-controls mb-4">
          <div className="flex flex-col">
            <div className="flex flex-wrap justify-between items-center mb-2">
              <div className="sort-controls flex items-center">
                <span className="mr-2 text-sm whitespace-nowrap" style={{ color: 'var(--light-contrast)' }}>Sort by:</span>
                <div className="flex">
                  <button 
                    className={`btn btn-sm mr-2 py-1 px-3`}
                    onClick={() => handleSort('date')}
                    style={{
                      backgroundColor: sortField === 'date' ? '#0078D7' : 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--light-contrast)',
                      border: 'none',
                      borderRadius: '0.25rem',
                      fontWeight: sortField === 'date' ? 'bold' : 'normal',
                      fontSize: '0.875rem'
                    }}
                  >
                    Date {sortField === 'date' && (
                      <FontAwesomeIcon icon={sortDirection === 'asc' ? faChevronUp : faChevronDown} className="ml-1" />
                    )}
                  </button>
                  <button 
                    className={`btn btn-sm py-1 px-3`}
                    onClick={() => handleSort('duration')}
                    style={{
                      backgroundColor: sortField === 'duration' ? '#0078D7' : 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--light-contrast)',
                      border: 'none',
                      borderRadius: '0.25rem',
                      fontWeight: sortField === 'duration' ? 'bold' : 'normal',
                      fontSize: '0.875rem'
                    }}
                  >
                    Duration {sortField === 'duration' && (
                      <FontAwesomeIcon icon={sortDirection === 'asc' ? faChevronUp : faChevronDown} className="ml-1" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Filter indicator moved to its own row */}
              {activeItemTypeFilter && (
                <div className="filter-indicator flex items-center mt-2">
                  <div className="px-3 py-1 rounded-full flex items-center"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--light-contrast)'
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={ITEM_TYPE_ICONS[activeItemTypeFilter] || faHistory} 
                      className="mr-2" 
                      style={{ color: 'var(--light-contrast)' }}
                    />
                    <span className="whitespace-nowrap">Filtering: {activeItemTypeFilter}s</span>
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs" style={{ 
                      backgroundColor: 'var(--main-accent)', 
                      color: 'var(--dark-contrast)'
                    }}
                    >
                      {sortedHistories.filter(history => {
                        return Object.entries(history.collectedItems).some(([itemId, collected]) => {
                          if (!collected) return false;
                          
                          let itemType = '';
                          
                          // First check if we have detailed collectible information
                          if (history.collectibleDetails && history.collectibleDetails[itemId]) {
                            // Use the type from collectibleDetails (lowercase for comparison)
                            itemType = history.collectibleDetails[itemId].type.toLowerCase();
                          } else {
                            // Fall back to extracting type from the item ID
                            itemType = itemId.split('-')[0].toLowerCase();
                          }
                          
                          return itemType === activeItemTypeFilter.toLowerCase();
                        });
                      }).length}
                    </span>
                    <button 
                      className="ml-2 text-lg"
                      onClick={() => setActiveItemTypeFilter(null)}
                      style={{ color: 'var(--light-contrast)' }}
                      aria-label="Clear filter"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="history-list">
          {sortedHistories
            .filter(history => {
              // If no filter is active, show all histories
              if (!activeItemTypeFilter) return true;
              
              // Check if this history has items of the filtered type
              return Object.entries(history.collectedItems).some(([itemId, collected]) => {
                if (!collected) return false;
                
                let itemType = '';
                
                // First check if we have detailed collectible information
                if (history.collectibleDetails && history.collectibleDetails[itemId]) {
                  // Use the type from collectibleDetails (lowercase for comparison)
                  itemType = history.collectibleDetails[itemId].type.toLowerCase();
                } else {
                  // Fall back to extracting type from the item ID
                  itemType = itemId.split('-')[0].toLowerCase();
                }
                
                return itemType === activeItemTypeFilter.toLowerCase();
              });
            })
            .map(history => (
              <div key={history.id} className="history-item mb-2 rounded-lg shadow overflow-hidden" style={{
                backgroundColor: 'white',
                border: 'none'
              }}>
                <div 
                  className="history-header p-2 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(history.id)}
                  style={{
                    backgroundColor: expandedHistoryId === history.id 
                      ? 'rgba(0, 0, 0, 0.03)' 
                      : 'white',
                    borderBottom: expandedHistoryId === history.id 
                      ? '1px solid rgba(0, 0, 0, 0.1)' 
                      : 'none',
                    transition: 'background-color 0.2s ease-in-out'
                  }}
                >
                  <div className="history-info">
                    <div className="history-date font-medium text-sm" style={{ color: 'var(--dark-contrast)' }}>
                      {formatDate(history.startTime)}
                    </div>
                    <div className="history-meta text-xs" style={{ color: 'var(--dark-contrast)', opacity: 0.7 }}>
                      <span className="mr-3">Duration: {formatElapsedTime(history.duration)}</span>
                      <span>Items: {Object.entries(history.collectedItems)
                        .filter(([_, collected]) => collected === true)
                        .length}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button 
                      className="btn-icon-sm mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistory(history.id);
                      }}
                      aria-label="Delete history"
                      title="Delete History"
                      style={{ 
                        color: 'var(--actionNegative)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: '0.25rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <FontAwesomeIcon 
                      icon={expandedHistoryId === history.id ? faChevronUp : faChevronDown} 
                      className="text-gray-500"
                      style={{ color: 'var(--dark-contrast)', opacity: 0.5 }}
                    />
                  </div>
                </div>
                
                {expandedHistoryId === history.id && (
                  <div className="history-details p-2 border-t border-gray-100" style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    borderTop: '1px solid rgba(0, 0, 0, 0.1)'
                  }}>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="detail-card p-2 rounded" style={{
                        backgroundColor: 'white',
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                      }}>
                        <div className="detail-label text-xs mb-1" style={{ color: 'var(--dark-contrast)', opacity: 0.7 }}>Collection Rate</div>
                        <div className="detail-value font-bold text-sm" style={{ color: 'var(--dark-contrast)' }}>{calculateCollectionRate(history)} items/min</div>
                      </div>
                      <div className="detail-card p-2 rounded" style={{
                        backgroundColor: 'white',
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                      }}>
                        <div className="detail-label text-xs mb-1" style={{ color: 'var(--dark-contrast)', opacity: 0.7 }}>Completed</div>
                        <div className="detail-value font-bold text-sm" style={{ color: 'var(--dark-contrast)' }}>{formatDate(history.startTime + history.duration)}</div>
                      </div>
                    </div>
                    
                    {/* Item type summary for this run */}
                    <div className="item-type-summary mb-2">
                      <h5 className="text-sm font-semibold mb-1" style={{ color: 'var(--dark-contrast)' }}>Items by Type</h5>
                      <div className="flex flex-wrap gap-1">
                        {TRACKED_ITEM_TYPES.map(type => {
                          // Count items of this type that were collected
                          const typeCount = Object.entries(history.collectedItems)
                            .filter(([itemId, collected]) => {
                              if (!collected) return false;
                              
                              // First check if we have detailed collectible information
                              if (history.collectibleDetails && history.collectibleDetails[itemId]) {
                                // Use the type from collectibleDetails (lowercase for comparison)
                                return history.collectibleDetails[itemId].type.toLowerCase() === type.toLowerCase();
                              }
                              
                              // Fall back to extracting type from the item ID
                              const itemType = itemId.split('-')[0];
                              return itemType === type;
                            }).length;
                          
                          // Get the specific collectibles of this type
                          const collectiblesOfType = history.collectibleDetails 
                            ? Object.entries(history.collectibleDetails)
                                .filter(([itemId, detail]) => {
                                  return detail.type.toLowerCase() === type.toLowerCase() && history.collectedItems[itemId];
                                })
                                .map(([_, detail]) => {
                                  // Format magazine names with issue numbers
                                  return detail.issueNumber 
                                    ? `${detail.name} #${detail.issueNumber}` 
                                    : detail.name;
                                })
                            : [];
                          
                          // Create a tooltip text with the list of collectibles
                          const tooltipText = collectiblesOfType.length > 0 
                            ? `${type}s: ${collectiblesOfType.join(', ')}` 
                            : `${typeCount} ${type}${typeCount !== 1 ? 's' : ''}`;
                          
                          // Determine the color based on the type
                          const typeColor = 'var(--dark-contrast)';
                          
                          const typeBgColor = type === 'Bobblehead' 
                            ? 'rgba(var(--main-accent-rgb), 0.1)' 
                            : type === 'Magazine' 
                              ? 'rgba(var(--extra-pop-rgb), 0.1)' 
                              : type === 'Consumable' 
                                ? 'rgba(var(--actionPositive-rgb), 0.1)' 
                                : 'rgba(var(--secondary-accent-rgb), 0.1)';
                          
                          return typeCount > 0 ? (
                            <div key={type} 
                              className="type-badge px-2 py-0.5 rounded-full flex items-center text-xs"
                              style={{ 
                                backgroundColor: typeBgColor,
                                border: `1px solid ${typeColor}`
                              }}
                              title={tooltipText}
                            >
                              <FontAwesomeIcon 
                                icon={ITEM_TYPE_ICONS[type] || faHistory} 
                                className="mr-1" 
                                style={{ color: typeColor, fontSize: '0.75rem' }}
                              />
                              <span style={{ color: 'var(--dark-contrast)' }}>{type}s: {typeCount}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                    
                    {/* Collectible Details section is kept */}
                    {history.collectibleDetails && Object.keys(history.collectibleDetails).length > 0 && (
                      <div className="collectible-stats mb-2">
                        <h5 className="text-sm font-semibold mb-1" style={{ color: 'var(--dark-contrast)' }}>Collectible Details</h5>
                        <div className="grid grid-cols-1 gap-2">
                          {/* Bobbleheads */}
                          {Object.values(history.collectibleDetails)
                            .filter(detail => detail.type === 'bobblehead')
                            .length > 0 && (
                            <div className="collectible-group p-2 rounded" style={{ 
                              backgroundColor: ITEM_TYPE_COLORS['Bobblehead'].bg,
                              borderLeft: ITEM_TYPE_COLORS['Bobblehead'].border,
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                            }}>
                              <h6 className="font-medium text-xs mb-1 flex justify-between" style={{ color: 'var(--dark-contrast)' }}>
                                {(() => {
                                  const bobbleheadCount = Object.values(history.collectibleDetails).filter(detail => detail.type === 'bobblehead').length;
                                  return <span>{bobbleheadCount} {bobbleheadCount === 1 ? 'Bobblehead' : 'Bobbleheads'}</span>;
                                })()}
                              </h6>
                              <ul className="list-disc pl-4 mb-0">
                                {(() => {
                                  // Group bobbleheads by name with counts
                                  const groupedBobbleheads: Record<string, number> = {};
                                  
                                  // Count occurrences of each bobblehead
                                  Object.values(history.collectibleDetails)
                                    .filter(detail => detail.type === 'bobblehead')
                                    .forEach(detail => {
                                      // Use "Unspecified" as the name if the bobblehead name is missing or empty
                                      const bobbleheadName = detail.name ? detail.name.trim() : '';
                                      // Check if name is empty or just "Bobblehead" without a specific type
                                      const displayName = bobbleheadName === '' || bobbleheadName.toLowerCase() === 'bobblehead' 
                                        ? 'Unspecified Bobblehead' 
                                        : bobbleheadName;
                                      groupedBobbleheads[displayName] = (groupedBobbleheads[displayName] || 0) + 1;
                                    });
                                  
                                  // Return list items for each unique bobblehead with count
                                  return Object.entries(groupedBobbleheads)
                                    .sort((a, b) => {
                                      // Put "Unspecified Bobblehead" at the bottom
                                      if (a[0] === 'Unspecified Bobblehead') return 1;
                                      if (b[0] === 'Unspecified Bobblehead') return -1;
                                      // Otherwise sort alphabetically
                                      return a[0].localeCompare(b[0]);
                                    })
                                    .map(([name, count], index) => (
                                      <li key={index} className="text-xs flex justify-between" style={{ color: 'var(--dark-contrast)' }}>
                                        <span>{count} x {name}</span>
                                      </li>
                                    ));
                                })()}
                              </ul>
                            </div>
                          )}
                          
                          {/* Magazines */}
                          {Object.values(history.collectibleDetails)
                            .filter(detail => detail.type === 'magazine')
                            .length > 0 && (
                            <div className="collectible-group p-2 rounded" style={{ 
                              backgroundColor: ITEM_TYPE_COLORS['Magazine'].bg,
                              borderLeft: ITEM_TYPE_COLORS['Magazine'].border,
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                            }}>
                              <h6 className="font-medium text-xs mb-1 flex justify-between" style={{ color: 'var(--dark-contrast)' }}>
                                <span>{Object.values(history.collectibleDetails).filter(detail => detail.type === 'magazine').length} Magazines</span>
                              </h6>
                              <ul className="list-disc pl-4 mb-0">
                                {(() => {
                                  // Group magazines by display name with counts
                                  const groupedMagazines: Record<string, number> = {};
                                  
                                  // Count occurrences of each magazine
                                  Object.values(history.collectibleDetails)
                                    .filter(detail => detail.type === 'magazine')
                                    .forEach(detail => {
                                      // Check if magazine name is missing or empty
                                      const magazineName = detail.name ? detail.name.trim() : '';
                                      let displayName;
                                      
                                      if (magazineName === '' || magazineName.toLowerCase() === 'magazine') {
                                        displayName = 'Unspecified Magazine';
                                      } else if (detail.issueNumber) {
                                        displayName = `${magazineName} #${detail.issueNumber}`;
                                      } else {
                                        displayName = magazineName;
                                      }
                                      
                                      groupedMagazines[displayName] = (groupedMagazines[displayName] || 0) + 1;
                                    });
                                  
                                  // Return list items for each unique magazine with count
                                  return Object.entries(groupedMagazines)
                                    .sort((a, b) => {
                                      // Put "Unspecified Magazine" at the bottom
                                      if (a[0] === 'Unspecified Magazine') return 1;
                                      if (b[0] === 'Unspecified Magazine') return -1;
                                      // Otherwise sort alphabetically
                                      return a[0].localeCompare(b[0]);
                                    })
                                    .map(([displayName, count], index) => (
                                      <li key={index} className="text-xs flex justify-between" style={{ color: 'var(--dark-contrast)' }}>
                                        <span>{count} x {displayName}</span>
                                      </li>
                                    ));
                                })()}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Consumables Section - Combined from collectibleDetails and other sources */}
                    {(() => {
                      // Get consumables from collectibleDetails
                      const consumablesFromDetails = history.collectibleDetails 
                        ? Object.entries(history.collectibleDetails)
                            .filter(([itemId, detail]) => 
                              detail.type.toLowerCase() === 'consumable' && history.collectedItems[itemId]
                            )
                        : [];
                      
                      // Get consumables without collectibleDetails
                      const consumablesWithoutDetails = Object.entries(history.collectedItems)
                        .filter(([itemId, collected]) => {
                          if (!collected) return false;
                          
                          // Skip items that already have collectibleDetails
                          if (history.collectibleDetails && history.collectibleDetails[itemId]) {
                            return false;
                          }
                          
                          // Check if it's a consumable based on item ID
                          const itemType = itemId.split('-')[0];
                          return itemType === 'Consumable';
                        });
                      
                      // If we have any consumables, show the section
                      if (consumablesFromDetails.length > 0 || consumablesWithoutDetails.length > 0) {
                        // Group consumables by name with counts
                        const groupedConsumables: Record<string, number> = {};
                        
                        // Process consumables from collectibleDetails
                        consumablesFromDetails.forEach(([itemId, detail]) => {
                          const quantity = history.collectedQuantities?.[itemId] || 1;
                          // Check if consumable name is missing or empty
                          const consumableName = detail.name ? detail.name.trim() : '';
                          const displayName = consumableName === '' || consumableName.toLowerCase() === 'consumable' 
                            ? 'Unspecified Consumable' 
                            : consumableName;
                          groupedConsumables[displayName] = (groupedConsumables[displayName] || 0) + quantity;
                        });
                        
                        // Process consumables without collectibleDetails
                        consumablesWithoutDetails.forEach(([itemId, _]) => {
                          // Extract name from itemId (format: Consumable-name)
                          const namePart = itemId.split('-').slice(1).join('-');
                          const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                          const quantity = history.collectedQuantities?.[itemId] || 1;
                          groupedConsumables[name] = (groupedConsumables[name] || 0) + quantity;
                        });
                        
                        return (
                          <div className="consumables-stats mb-2">
                            <h5 className="text-sm font-semibold mb-1" style={{ color: 'var(--dark-contrast)' }}>Consumables</h5>
                            <div className="collectible-group p-2 rounded" style={{ 
                              backgroundColor: ITEM_TYPE_COLORS['Consumable'].bg,
                              borderLeft: ITEM_TYPE_COLORS['Consumable'].border,
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                            }}>
                              <h6 className="font-medium text-xs mb-1 flex justify-between" style={{ color: 'var(--dark-contrast)' }}>
                                <span>Consumables</span>
                                <span className="font-bold" style={{ color: 'var(--actionPositive)' }}>
                                  {Object.values(groupedConsumables).reduce((sum, count) => sum + count, 0)} total
                                </span>
                              </h6>
                              <ul className="list-disc pl-4 mb-0">
                                {Object.entries(groupedConsumables)
                                  .sort((a, b) => {
                                    // Put "Unspecified Consumable" at the bottom
                                    if (a[0] === 'Unspecified Consumable') return 1;
                                    if (b[0] === 'Unspecified Consumable') return -1;
                                    // Otherwise sort alphabetically
                                    return a[0].localeCompare(b[0]);
                                  })
                                  .map(([name, quantity], index) => (
                                    <li key={index} className="text-xs flex justify-between" style={{ color: 'var(--dark-contrast)' }}>
                                      <span>{name}</span>
                                      <span className="font-semibold ml-2" style={{ color: 'var(--actionPositive)' }}>
                                        ×{quantity}
                                      </span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          </div>
                        );
                      }
                      
                      return null;
                    })()}
                    
                    {/* Events Section - Combined from collectibleDetails and other sources */}
                    {(() => {
                      // Get events from collectibleDetails
                      const eventsFromDetails = history.collectibleDetails 
                        ? Object.entries(history.collectibleDetails)
                            .filter(([itemId, detail]) => 
                              detail.type.toLowerCase() === 'event' && history.collectedItems[itemId]
                            )
                        : [];
                        
                      // Get events without collectibleDetails
                      const eventsWithoutDetails = Object.entries(history.collectedItems)
                        .filter(([itemId, collected]) => {
                          if (!collected) return false;
                          
                          // Skip items that already have collectibleDetails
                          if (history.collectibleDetails && history.collectibleDetails[itemId]) {
                            return false;
                          }
                          
                          // Check if it's an event based on item ID
                          const itemType = itemId.split('-')[0];
                          return itemType === 'Event';
                        });
                        
                      // If we have any events, show the section
                      if (eventsFromDetails.length > 0 || eventsWithoutDetails.length > 0) {
                        // Group events by name
                        const groupedEvents: Record<string, { count: number, answers: string[] }> = {};
                        
                        // Process events from collectibleDetails
                        eventsFromDetails.forEach(([itemId, detail]) => {
                          const answer = history.itemAnswers?.[itemId];
                          // Check if event name is missing or empty
                          const eventName = detail.name ? detail.name.trim() : '';
                          const displayName = eventName === '' || eventName.toLowerCase() === 'event' 
                            ? 'Unspecified Event' 
                            : eventName;
                          
                          if (!groupedEvents[displayName]) {
                            groupedEvents[displayName] = { count: 0, answers: [] };
                          }
                          groupedEvents[displayName].count++;
                          if (answer) {
                            groupedEvents[displayName].answers.push(answer);
                          }
                        });
                        
                        // Process events without collectibleDetails
                        eventsWithoutDetails.forEach(([itemId, _]) => {
                          // Extract name from itemId (format: Event-name)
                          const namePart = itemId.split('-').slice(1).join('-');
                          const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                          const answer = history.itemAnswers?.[itemId];
                          
                          if (!groupedEvents[name]) {
                            groupedEvents[name] = { count: 0, answers: [] };
                          }
                          groupedEvents[name].count++;
                          if (answer) {
                            groupedEvents[name].answers.push(answer);
                          }
                        });
                        
                        return (
                          <div className="events-stats mb-2">
                            <h5 className="text-sm font-semibold mb-1" style={{ color: 'var(--dark-contrast)' }}>Events</h5>
                            <div className="collectible-group p-2 rounded" style={{ 
                              backgroundColor: ITEM_TYPE_COLORS['Event'].bg,
                              borderLeft: ITEM_TYPE_COLORS['Event'].border,
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                            }}>
                              <h6 className="font-medium text-xs mb-1 flex justify-between" style={{ color: 'var(--dark-contrast)' }}>
                                <span>Events</span>
                                <span className="font-bold" style={{ color: 'var(--secondary-accent)' }}>
                                  {Object.values(groupedEvents).reduce((sum, event) => sum + event.count, 0)} total
                                </span>
                              </h6>
                              <ul className="list-disc pl-4 mb-0">
                                {Object.entries(groupedEvents)
                                  .sort((a, b) => {
                                    // Put "Unspecified Event" at the bottom
                                    if (a[0] === 'Unspecified Event') return 1;
                                    if (b[0] === 'Unspecified Event') return -1;
                                    // Otherwise sort alphabetically
                                    return a[0].localeCompare(b[0]);
                                  })
                                  .map(([name, { count, answers }], index) => (
                                    <li key={index} className="text-xs flex justify-between" style={{ color: 'var(--dark-contrast)' }}>
                                      <span>
                                        {name}
                                        {answers.length > 0 && ` (${answers.join(', ')})`}
                                      </span>
                                      <span className="font-semibold ml-2" style={{ color: 'var(--secondary-accent)' }}>
                                        ×{count}
                                      </span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          </div>
                        );
                      }
                      
                      return null;
                    })()}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RouteHistory; 