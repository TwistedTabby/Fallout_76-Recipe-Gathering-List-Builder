import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Route, RouteProgress, Item } from '../types/farmingTracker';

interface RouteTrackerProps {
  route: Route;
  tracking: RouteProgress;
  onUpdateTracking: (tracking: RouteProgress) => void;
  onComplete: () => void;
  onCancel: () => void;
}

/**
 * Component for tracking progress through a route
 */
const RouteTracker: React.FC<RouteTrackerProps> = ({
  route,
  tracking,
  onUpdateTracking,
  onComplete,
  onCancel
}) => {
  // Local state
  const [notes, setNotes] = useState(tracking.notes || '');
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  // Get the current stop
  const currentStop = route.stops[tracking.currentStopIndex] || null;
  
  // Calculate elapsed time
  useEffect(() => {
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
  }, [tracking.startTime]);

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    onUpdateTracking({
      ...tracking,
      notes: newNotes
    });
  };

  // Toggle item collected status
  const toggleItemCollected = (itemId: string) => {
    const newCollectedItems = { ...tracking.collectedItems };
    newCollectedItems[itemId] = !newCollectedItems[itemId];
    
    onUpdateTracking({
      ...tracking,
      collectedItems: newCollectedItems
    });
  };

  // Move to the next stop
  const moveToNextStop = () => {
    if (tracking.currentStopIndex < route.stops.length - 1) {
      onUpdateTracking({
        ...tracking,
        currentStopIndex: tracking.currentStopIndex + 1
      });
    }
  };

  // Move to the previous stop
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
    if (route.stops.length === 0) return 0;
    
    // Count collected items
    const totalItems = route.stops.reduce((total, stop) => total + stop.items.length, 0);
    if (totalItems === 0) return 0;
    
    const collectedCount = Object.values(tracking.collectedItems).filter(Boolean).length;
    return Math.round((collectedCount / totalItems) * 100);
  };

  // Check if all items in the current stop are collected
  const areAllCurrentStopItemsCollected = () => {
    if (!currentStop || currentStop.items.length === 0) return true;
    
    return currentStop.items.every(item => tracking.collectedItems[item.id] === true);
  };

  return (
    <div className="route-tracker">
      <div className="route-tracker-header">
        <h2>Tracking: {route.name}</h2>
        <div className="route-tracker-stats">
          <div className="elapsed-time">
            <span className="stat-label">Elapsed Time:</span>
            <span className="stat-value">{elapsedTime}</span>
          </div>
          <div className="progress-percentage">
            <span className="stat-label">Progress:</span>
            <span className="stat-value">{calculateProgress()}%</span>
          </div>
        </div>
      </div>

      <div className="route-tracker-content">
        {route.stops.length === 0 ? (
          <div className="no-stops-message">
            <p>This route has no stops defined. You can complete it or cancel tracking.</p>
          </div>
        ) : (
          <>
            <div className="stop-navigation">
              <button 
                className="nav-button prev-button" 
                onClick={moveToPreviousStop}
                disabled={tracking.currentStopIndex === 0}
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Previous Stop
              </button>
              <div className="stop-indicator">
                Stop {tracking.currentStopIndex + 1} of {route.stops.length}
              </div>
              <button 
                className="nav-button next-button" 
                onClick={moveToNextStop}
                disabled={tracking.currentStopIndex === route.stops.length - 1}
              >
                Next Stop <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>

            {currentStop && (
              <div className="current-stop">
                <div className="stop-header">
                  <h3>{currentStop.name}</h3>
                  {areAllCurrentStopItemsCollected() && (
                    <span className="all-collected-badge">
                      <FontAwesomeIcon icon={faCheck} /> All Items Collected
                    </span>
                  )}
                </div>
                
                {currentStop.description && (
                  <p className="stop-description">{currentStop.description}</p>
                )}

                {currentStop.items.length === 0 ? (
                  <p className="no-items-message">This stop has no items defined.</p>
                ) : (
                  <ul className="items-list">
                    {currentStop.items.map(item => (
                      <li 
                        key={item.id} 
                        className={`item ${tracking.collectedItems[item.id] ? 'collected' : ''}`}
                        onClick={() => toggleItemCollected(item.id)}
                      >
                        <div className="item-checkbox">
                          {tracking.collectedItems[item.id] ? (
                            <FontAwesomeIcon icon={faCheck} />
                          ) : null}
                        </div>
                        <div className="item-details">
                          <span className="item-name">{item.name}</span>
                          <span className="item-type">{item.type}</span>
                          {item.description && (
                            <span className="item-description">{item.description}</span>
                          )}
                        </div>
                        <div className="item-quantity">
                          {item.quantity > 1 ? `x${item.quantity}` : ''}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}

        <div className="notes-section">
          <h3>Notes</h3>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Add notes about your run here..."
            rows={4}
          />
        </div>

        <div className="tracker-actions">
          <button 
            className="cancel-button" 
            onClick={onCancel}
          >
            <FontAwesomeIcon icon={faTimes} /> Cancel Tracking
          </button>
          <button 
            className="complete-button" 
            onClick={onComplete}
          >
            <FontAwesomeIcon icon={faCheck} /> Complete Route
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteTracker; 