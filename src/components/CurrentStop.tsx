import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheck, faQuestionCircle, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { Stop, Item, Route } from '../types/farmingTracker';
import { getItemType, areAllStopItemsCollected } from '../utils/itemUtils';

interface CurrentStopProps {
  stop: Stop;
  currentStopIndex: number;
  totalStops: number;
  collectedItems: Record<string, boolean>;
  collectedQuantities?: Record<string, number>;
  itemAnswers?: Record<string, 'yes' | 'no'>;
  onItemClick: (item: Item) => void;
  onShowDescription: (e: React.MouseEvent, description: string) => void;
  onPreviousStop: () => void;
  onNextStop: () => void;
  route?: Route;
}

/**
 * Component for displaying the current stop and its items
 */
const CurrentStop: React.FC<CurrentStopProps> = ({
  stop,
  currentStopIndex,
  totalStops,
  collectedItems,
  collectedQuantities = {},
  itemAnswers = {},
  onItemClick,
  onShowDescription,
  onPreviousStop,
  onNextStop,
  route
}) => {
  const isFirstStop = currentStopIndex === 0;
  const isLastStop = currentStopIndex === totalStops - 1;
  const allItemsCollected = areAllStopItemsCollected(stop, collectedItems);

  // Separate items into uncollected and collected
  const uncollectedItems = stop.items.filter(item => !collectedItems[item.id]);
  const collectedItems2 = stop.items.filter(item => collectedItems[item.id]);
  
  // Get the next stop name if available
  const nextStop = !isLastStop && route?.stops?.[currentStopIndex + 1];
  const nextStopName = nextStop ? nextStop.name : '';

  // Render an item button
  const renderItemButton = (item: Item, isCollected: boolean) => {
    const itemType = getItemType(item);
    const collectedQuantity = collectedQuantities[item.id] || 0;
    const itemAnswer = itemAnswers[item.id];
    const showAnswer = isCollected && itemAnswer && (itemType === 'bobblehead' || itemType === 'magazine' || itemType === 'event' || itemType === 'spawned');
    
    return (
      <button 
        key={item.id}
        className={`item-collection-button ${isCollected ? 'collected' : ''} ${itemType ? `item-type-${itemType}` : ''}`}
        onClick={() => onItemClick(item)}
        aria-label={`${item.name} ${isCollected ? '(collected - click to uncollect)' : '(not collected)'}`}
        title={isCollected ? "Click to uncollect" : "Click to collect"}
      >
        <div className="item-content">
          {item.description && (
            <span 
              className="item-description-icon"
              onClick={(e) => onShowDescription(e, item.description || '')}
              onMouseDown={(e) => e.stopPropagation()} // Prevent button click on mouse down
            >
              <FontAwesomeIcon icon={faQuestionCircle} />
            </span>
          )}
          <span className="item-name">{item.name}</span>
          {showAnswer && (
            <span className={`item-answer ${itemAnswer === 'yes' ? 'answer-yes' : 'answer-no'}`}>
              <FontAwesomeIcon icon={itemAnswer === 'yes' ? faThumbsUp : faThumbsDown} />
              <span className="answer-text">{itemAnswer === 'yes' ? 'Yes' : 'No'}</span>
            </span>
          )}
          {!isCollected && (itemType === 'consumable' || item.quantity > 1) && (
            <span className="item-quantity">({item.quantity})</span>
          )}
          {isCollected && itemType === 'consumable' && (
            <span className="item-quantity">({collectedQuantity})</span>
          )}
          {isCollected && itemType !== 'consumable' && item.quantity > 1 && (
            <span className="item-quantity">({item.quantity})</span>
          )}
        </div>
        <div className="item-status">
          {isCollected && (
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCheck} className="item-check-icon" />
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="current-stop mb-4">
      <div className="card">
        <div className="card-header flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-0">Current Stop: {stop.name}</h3>
          <div className="flex space-x-2 w-full sm:w-auto">
            <button 
              className="btn btn-primary btn-sm flex-1 sm:flex-none"
              onClick={onPreviousStop}
              disabled={isFirstStop}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-1" /> Previous
            </button>
            <button 
              className="btn btn-primary btn-sm flex-1 sm:flex-none"
              onClick={onNextStop}
              disabled={isLastStop}
            >
              Next <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
            </button>
          </div>
        </div>
        
        <div className="card-body">
          {stop.description && (
            <div className="stop-description-container mb-4 p-3 rounded-md bg-secondary-accent border-l-4 border-main-accent">
              <h4 className="font-semibold mb-1 flex items-center">
                <FontAwesomeIcon icon={faQuestionCircle} className="mr-2" /> 
                Location Notes
              </h4>
              <p className="text-sm">{stop.description}</p>
            </div>
          )}
          
          {/* Progress indicator removed as per request */}
          
          <h4 className="font-semibold mb-2">Todo:</h4>
          {uncollectedItems.length === 0 ? (
            <p className="help-text">Tasks complete!</p>
          ) : (
            <div className="item-collection-grid">
              {uncollectedItems.map(item => renderItemButton(item, false))}
            </div>
          )}
          
          {collectedItems2.length > 0 && (
            <>
              <h4 className="font-semibold mb-2 mt-4">Complete:</h4>
              <div className="item-collection-grid completed-items">
                {collectedItems2.map(item => renderItemButton(item, true))}
              </div>
              <p className="text-sm">Click any item above to immediately remove it from the completed list.</p>
            </>
          )}
        </div>
        
        {allItemsCollected && !isLastStop && (
          <div className="card-footer">
            <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-2">
              {nextStopName && (
                <div className="text-sm sm:text-base font-medium bg-secondary-accent px-3 py-1 rounded-md w-full sm:w-auto text-center sm:text-left">
                  <span className="font-bold">Next Stop:</span> {nextStopName}
                </div>
              )}
              <button 
                className="btn btn-primary w-full sm:w-auto"
                onClick={onNextStop}
              >
                Next Stop <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentStop; 