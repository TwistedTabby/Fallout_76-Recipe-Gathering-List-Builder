import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faArrowLeft, faArrowRight, faCheckCircle, faStopwatch, faClipboard } from '@fortawesome/free-solid-svg-icons';
import { Route, RouteProgress, Stop, Item } from '../types/farmingTracker';

interface RouteTrackerProps {
  tracking: RouteProgress & { route: Route };
  onUpdateTracking: (tracking: RouteProgress & { route: Route }) => void;
  onUpdateInventory: (inventory: Record<string, number>) => void;
  onComplete: () => void;
  onCancel: () => void;
}

/**
 * Component for tracking progress through a route
 */
const RouteTracker: React.FC<RouteTrackerProps> = ({
  tracking,
  onUpdateTracking,
  onUpdateInventory,
  onComplete,
  onCancel
}) => {
  // Local state
  const [notes, setNotes] = useState(tracking?.notes || '');
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  // Get the current stop
  const currentStop = tracking?.route?.stops?.[tracking?.currentStopIndex] || null;
  
  // Calculate elapsed time
  useEffect(() => {
    if (!tracking?.startTime) return;

    const updateElapsedTime = () => {
      const elapsed = Date.now() - tracking.startTime;
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
      
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };
    
    // Update immediately
    updateElapsedTime();
    
    // Update every second
    const interval = setInterval(updateElapsedTime, 1000);
    
    return () => clearInterval(interval);
  }, [tracking?.startTime]);
  
  // Update notes in tracking
  useEffect(() => {
    if (notes !== tracking?.notes) {
      onUpdateTracking({
        ...tracking,
        notes
      });
    }
  }, [notes, tracking, onUpdateTracking]);
  
  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };
  
  // Toggle item collected status
  const toggleItemCollected = (itemId: string) => {
    const updatedCollectedItems = {
      ...tracking.collectedItems,
      [itemId]: !tracking.collectedItems[itemId]
    };
    
    // Update tracking
    onUpdateTracking({
      ...tracking,
      collectedItems: updatedCollectedItems
    });
    
    // If the item is collected, update inventory
    const item = findItemById(itemId);
    if (item && updatedCollectedItems[itemId]) {
      // Get current inventory
      const currentInventory = tracking.inventoryData?.routeInventory || {};
      
      // Update inventory with collected item
      const updatedInventory = {
        ...currentInventory,
        [item.name]: (currentInventory[item.name] || 0) + item.quantity
      };
      
      // Call onUpdateInventory with the updated inventory
      onUpdateInventory(updatedInventory);
    }
  };
  
  // Helper function to find an item by ID
  const findItemById = (itemId: string): Item | undefined => {
    for (const stop of tracking.route.stops) {
      const item = stop.items.find(item => item.id === itemId);
      if (item) return item;
    }
    return undefined;
  };
  
  // Move to next stop
  const moveToNextStop = () => {
    if (tracking.currentStopIndex < tracking.route.stops.length - 1) {
      onUpdateTracking({
        ...tracking,
        currentStopIndex: tracking.currentStopIndex + 1
      });
    }
  };
  
  // Move to previous stop
  const moveToPreviousStop = () => {
    if (tracking.currentStopIndex > 0) {
      onUpdateTracking({
        ...tracking,
        currentStopIndex: tracking.currentStopIndex - 1
      });
    }
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!tracking.route.stops.length) return 0;
    
    const totalItems = tracking.route.stops.reduce((total: number, stop: Stop) => 
      total + stop.items.length, 0);
    
    if (totalItems === 0) return 0;
    
    const collectedCount = Object.keys(tracking.collectedItems).length;
    return Math.round((collectedCount / totalItems) * 100);
  };
  
  // Check if all items in current stop are collected
  const areAllCurrentStopItemsCollected = () => {
    if (!currentStop) return false;
    
    return currentStop.items.every((item: Item) => 
      tracking.collectedItems[item.id]
    );
  };
  
  // Get completion status for a stop
  const getStopCompletionStatus = (stopIndex: number) => {
    const stop = tracking.route.stops[stopIndex];
    if (!stop) return 'incomplete';
    
    const allCollected = stop.items.every((item: Item) => 
      tracking.collectedItems[item.id]
    );
    
    if (allCollected) return 'completed';
    if (stopIndex < tracking.currentStopIndex) return 'skipped';
    if (stopIndex === tracking.currentStopIndex) return 'current';
    return 'incomplete';
  };
  
  return (
    <div className="card route-tracker">
      <div className="card-header route-tracker-header">
        <h2>Tracking: {tracking.route.name}</h2>
        <div className="route-tracker-actions">
          <button 
            className="btn btn-outline"
            onClick={onCancel}
          >
            <FontAwesomeIcon icon={faTimes} /> Cancel
          </button>
          <button 
            className="btn btn-success"
            onClick={onComplete}
          >
            <FontAwesomeIcon icon={faCheck} /> Complete
          </button>
        </div>
      </div>
      
      <div className="card-body">
        {/* Progress information */}
        <div className="tracking-info mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="tracking-stat p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-1">
                <FontAwesomeIcon icon={faStopwatch} className="mr-2 text-secondary-accent" />
                <span className="font-semibold">Elapsed Time</span>
              </div>
              <div className="text-xl font-mono">{elapsedTime}</div>
            </div>
            
            <div className="tracking-stat p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-1">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-secondary-accent" />
                <span className="font-semibold">Progress</span>
              </div>
              <div className="text-xl">{calculateProgress()}%</div>
              <div className="progress-bar-container mt-1">
                <div 
                  className="progress-bar" 
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
            
            <div className="tracking-stat p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-1">
                <FontAwesomeIcon icon={faClipboard} className="mr-2 text-secondary-accent" />
                <span className="font-semibold">Current Stop</span>
              </div>
              <div className="text-xl">
                {tracking.currentStopIndex + 1} of {tracking.route.stops.length}
              </div>
            </div>
          </div>
        </div>
        
        {/* Current stop */}
        {currentStop && (
          <div className="current-stop mb-4">
            <div className="card">
              <div className="card-header">
                <h3>Current Stop: {currentStop.name}</h3>
                <div className="flex space-x-2">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={moveToPreviousStop}
                    disabled={tracking.currentStopIndex === 0}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} /> Previous
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={moveToNextStop}
                    disabled={tracking.currentStopIndex === tracking.route.stops.length - 1}
                  >
                    Next <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                {currentStop.description && (
                  <p className="mb-4">{currentStop.description}</p>
                )}
                
                <h4 className="font-semibold mb-2">Items to Collect:</h4>
                {currentStop.items.length === 0 ? (
                  <p className="text-gray-500">No items to collect at this stop.</p>
                ) : (
                  <ul className="space-y-2">
                    {currentStop.items.map(item => (
                      <li 
                        key={item.id}
                        className="flex items-center p-2 rounded-lg hover:bg-gray-50"
                      >
                        <input 
                          type="checkbox"
                          id={`item-${item.id}`}
                          checked={!!tracking.collectedItems[item.id]}
                          onChange={() => toggleItemCollected(item.id)}
                          className="mr-3 h-5 w-5"
                        />
                        <label 
                          htmlFor={`item-${item.id}`}
                          className={`flex-1 cursor-pointer ${tracking.collectedItems[item.id] ? 'line-through text-gray-500' : ''}`}
                        >
                          {item.name}
                          {item.quantity > 1 && ` (${item.quantity})`}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              {areAllCurrentStopItemsCollected() && tracking.currentStopIndex < tracking.route.stops.length - 1 && (
                <div className="card-footer">
                  <button 
                    className="btn btn-primary"
                    onClick={moveToNextStop}
                  >
                    Next Stop <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* All stops */}
        <div className="all-stops mb-4">
          <h3 className="font-semibold mb-2">All Stops</h3>
          <ul className="tracker-stops-list">
            {tracking.route.stops.map((stop, index) => {
              const status = getStopCompletionStatus(index);
              return (
                <li 
                  key={stop.id}
                  className={`tracker-stop-item ${status}`}
                  onClick={() => onUpdateTracking({
                    ...tracking,
                    currentStopIndex: index
                  })}
                >
                  <div className="tracker-stop-info">
                    <div className="tracker-stop-name">
                      {index + 1}. {stop.name}
                    </div>
                    <div className="tracker-stop-description">
                      {stop.items.length} items - 
                      {stop.items.filter(item => tracking.collectedItems[item.id]).length} collected
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
        
        {/* Notes */}
        <div className="notes-section">
          <h3 className="font-semibold mb-2">Notes</h3>
          <textarea
            className="form-control"
            value={notes}
            onChange={handleNotesChange}
            placeholder="Add notes about your run here..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default RouteTracker; 