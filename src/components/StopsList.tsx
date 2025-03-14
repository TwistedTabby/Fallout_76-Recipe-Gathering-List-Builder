import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faChevronDown, faChevronRight, faTimesCircle, faQuestionCircle, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Route, Item } from '../types/farmingTracker';
import { getStopCompletionStatus, getItemType } from '../utils/itemUtils';

interface StopsListProps {
  route: Route;
  currentStopIndex: number;
  collectedItems: Record<string, boolean>;
  itemAnswers?: Record<string, 'yes' | 'no'>;
  onSelectStop: (index: number) => void;
}

/**
 * Component for displaying a list of all stops in a route with expandable item details
 */
const StopsList: React.FC<StopsListProps> = ({
  route,
  currentStopIndex,
  collectedItems,
  itemAnswers = {},
  onSelectStop
}) => {
  // State to track which stops are expanded to show items
  const [expandedStops, setExpandedStops] = useState<Record<string, boolean>>({});

  // Toggle expanded state for a stop
  const toggleStopExpanded = (stopId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the onSelectStop
    setExpandedStops(prev => ({
      ...prev,
      [stopId]: !prev[stopId]
    }));
  };

  // Determine if an item is actually found based on collected status and answers
  const isItemActuallyFound = (item: Item) => {
    const isCollected = collectedItems[item.id];
    const itemType = getItemType(item);
    
    // For special items that require confirmation, check the answer
    if (isCollected && (itemType === 'bobblehead' || itemType === 'magazine' || 
        itemType === 'consumable' || itemType === 'event' || itemType === 'spawned')) {
      // If there's an answer and it's "no", the item is not actually found
      return itemAnswers[item.id] !== 'no';
    }
    
    return isCollected;
  };

  // Get item type counts for a stop
  const getItemTypeCounts = (stop: { items: Item[] }) => {
    const typeCounts: Record<string, { total: number, found: number }> = {};
    
    stop.items.forEach(item => {
      const type = item.type || 'Other';
      if (!typeCounts[type]) {
        typeCounts[type] = { total: 0, found: 0 };
      }
      
      typeCounts[type].total += 1;
      if (isItemActuallyFound(item)) {
        typeCounts[type].found += 1;
      }
    });
    
    return typeCounts;
  };

  return (
    <div className="all-stops mb-4">
      <h3 className="font-semibold mb-2">All Stops</h3>
      <ul className="tracker-stops-list">
        {route.stops.map((stop, index) => {
          const status = getStopCompletionStatus(
            stop,
            index,
            currentStopIndex,
            collectedItems
          );
          
          const isExpanded = expandedStops[stop.id] || false;
          const itemTypeCounts = getItemTypeCounts(stop);
          
          return (
            <li 
              key={stop.id}
              className={`tracker-stop-item ${status}`}
            >
              <div 
                className="tracker-stop-info cursor-pointer flex flex-col sm:flex-row sm:items-center"
                onClick={() => onSelectStop(index)}
              >
                <div className="flex items-center flex-1">
                  {/* Status icon at the start */}
                  <span className="mr-2 w-6 text-center flex items-center justify-center">
                    {status === 'completed' ? (
                      <button 
                        className="text-green-600 hover:text-green-700 focus:outline-none"
                        onClick={(e) => toggleStopExpanded(stop.id, e)}
                        aria-label={isExpanded ? "Collapse stop" : "Expand stop"}
                      >
                        <FontAwesomeIcon icon={isExpanded ? faChevronDown : faCheckCircle} />
                      </button>
                    ) : status === 'current' ? (
                      <button 
                        className="text-blue-600 hover:text-blue-700 focus:outline-none"
                        onClick={(e) => toggleStopExpanded(stop.id, e)}
                        aria-label={isExpanded ? "Collapse stop" : "Expand stop"}
                      >
                        <FontAwesomeIcon icon={isExpanded ? faChevronDown : faArrowRight} />
                      </button>
                    ) : (
                      <button 
                        className="text-gray-600 hover:text-gray-800 focus:outline-none"
                        onClick={(e) => toggleStopExpanded(stop.id, e)}
                        aria-label={isExpanded ? "Collapse stop" : "Expand stop"}
                      >
                        <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
                      </button>
                    )}
                  </span>
                  <div className="tracker-stop-name font-medium">
                    {index + 1}. {stop.name}
                  </div>
                </div>
                
                {/* Item types display */}
                <div className="tracker-stop-description ml-6 sm:ml-0 mt-1 sm:mt-0 flex-1">
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {Object.entries(itemTypeCounts).map(([type, counts]) => {
                      // Determine badge color based on completion status
                      let badgeClass = 'bg-gray-100 text-gray-800';
                      if (counts.found === counts.total && counts.total > 0) {
                        badgeClass = 'bg-green-100 text-green-800';
                      } else if (counts.found > 0) {
                        badgeClass = 'bg-yellow-100 text-yellow-800';
                      }
                      
                      return (
                        <div 
                          key={type} 
                          className={`px-2 py-0.5 rounded-md ${badgeClass} border border-opacity-20`}
                        >
                          {type}: {counts.found}/{counts.total}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="tracker-stop-actions mt-1 sm:mt-0 ml-auto">
                  {/* Status text for current stop */}
                  {status === 'current' && (
                    <span className="text-blue-600 text-sm font-medium">
                      Current
                    </span>
                  )}
                </div>
              </div>
              
              {/* Expanded items list */}
              {isExpanded && (
                <div className="mt-2 border-t border-gray-200 pt-2">
                  <ul className="tracker-stop-items pl-8 space-y-1.5 text-sm">
                    {stop.items.map(item => {
                      const isFound = isItemActuallyFound(item);
                      const answer = itemAnswers[item.id];
                      
                      return (
                        <li 
                          key={item.id}
                          className={`flex items-center ${isFound ? 'text-green-600' : 'text-gray-600'}`}
                        >
                          {/* Status icon */}
                          <span className="mr-2 w-5 text-center">
                            {collectedItems[item.id] ? (
                              answer === 'no' ? (
                                <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />
                              ) : (
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                              )
                            ) : (
                              <FontAwesomeIcon icon={faQuestionCircle} className="text-gray-400" />
                            )}
                          </span>
                          
                          {/* Item type badge */}
                          {item.type && (
                            <span className="mr-2 px-1.5 py-0.5 text-xs rounded bg-gray-200 text-gray-700 border border-gray-300 border-opacity-30 min-w-16 text-center">
                              {item.type}
                            </span>
                          )}
                          
                          {/* Item name and quantity */}
                          <span className={`${collectedItems[item.id] && answer !== 'no' ? 'line-through' : ''} flex-1`}>
                            {item.name}
                            {item.quantity > 1 ? ` (${item.quantity})` : ''}
                          </span>
                          
                          {/* Show answer for special items */}
                          {collectedItems[item.id] && answer && (
                            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${answer === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {answer}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default StopsList; 