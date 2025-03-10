import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Route } from '../types/farmingTracker';
import { getStopCompletionStatus } from '../utils/itemUtils';

interface StopsListProps {
  route: Route;
  currentStopIndex: number;
  collectedItems: Record<string, boolean>;
  onSelectStop: (index: number) => void;
}

/**
 * Component for displaying a list of all stops in a route
 */
const StopsList: React.FC<StopsListProps> = ({
  route,
  currentStopIndex,
  collectedItems,
  onSelectStop
}) => {
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
          
          // Count items that have been found
          const foundItems = stop.items.filter(item => collectedItems[item.id]).length;
          const hasFoundItems = foundItems > 0;
          
          return (
            <li 
              key={stop.id}
              className={`tracker-stop-item ${status}`}
              onClick={() => onSelectStop(index)}
            >
              <div className="tracker-stop-info">
                <div className="tracker-stop-name">
                  {index + 1}. {stop.name}
                </div>
                <div className="tracker-stop-description">
                  {stop.items.length} items
                  {hasFoundItems ? ` - ${foundItems} found` : ''}
                </div>
              </div>
              <div className="tracker-stop-actions">
                {status === 'completed' && (
                  <span className="text-green-500">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </span>
                )}
                {status === 'current' && (
                  <span className="text-blue-500">
                    Current
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default StopsList; 