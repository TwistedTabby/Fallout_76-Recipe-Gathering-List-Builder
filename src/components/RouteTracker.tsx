import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Route, RouteProgress, Item } from '../types/farmingTracker';

// Import extracted components
import TrackingStats from './TrackingStats';
import CurrentStop from './CurrentStop';
import StopsList from './StopsList';
import ItemConfirmationDialog from './ItemConfirmationDialog';
import ItemDescriptionTooltip from './ItemDescriptionTooltip';

// Import utility functions
import { formatElapsedTime } from '../utils/timeUtils';
import { getItemType, findItemById } from '../utils/itemUtils';

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
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [confirmationType, setConfirmationType] = useState<'bobblehead' | 'magazine' | 'consumable' | 'event' | 'spawned' | null>(null);
  const [showItemDescription, setShowItemDescription] = useState<string | null>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  
  // Refs for scroll detection
  const statsRef = useRef<HTMLDivElement>(null);
  
  // Get the current stop
  const currentStop = tracking?.route?.stops?.[tracking?.currentStopIndex] || null;
  
  // Calculate elapsed time
  useEffect(() => {
    if (!tracking?.startTime) return;

    const updateElapsedTime = () => {
      const elapsed = Date.now() - tracking.startTime;
      setElapsedTime(formatElapsedTime(elapsed));
    };
    
    // Update immediately
    updateElapsedTime();
    
    // Update every second
    const interval = setInterval(updateElapsedTime, 1000);
    
    return () => clearInterval(interval);
  }, [tracking?.startTime]);
  
  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (statsRef.current) {
        const statsPosition = statsRef.current.getBoundingClientRect().top;
        const shouldShowHeader = statsPosition < 0;
        setShowStickyHeader(shouldShowHeader);
        
        // Add or remove body class for padding
        if (shouldShowHeader) {
          document.body.classList.add('has-sticky-header');
        } else {
          document.body.classList.remove('has-sticky-header');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Clean up body class when component unmounts
      document.body.classList.remove('has-sticky-header');
    };
  }, []);
  
  // Handle showing item description
  const handleShowDescription = (e: React.MouseEvent, description: string) => {
    e.stopPropagation(); // Prevent triggering the button click
    e.preventDefault(); // Prevent any default behavior
    setShowItemDescription(description);
  };
  
  // Close item description tooltip
  const handleCloseDescription = () => {
    setShowItemDescription(null);
  };
  
  // Handle item click
  const handleItemClick = (item: Item) => {
    setCurrentItem(item);
    const itemType = getItemType(item);
    const isCollected = tracking.collectedItems[item.id];
    
    // If the item is already collected, just uncollect it without confirmation
    if (isCollected) {
      toggleItemCollected(item.id, item.quantity);
      return;
    }
    
    // For special items that need confirmation when collecting
    if (itemType === 'bobblehead' || itemType === 'magazine' || 
        itemType === 'consumable' || itemType === 'event' || itemType === 'spawned') {
      setConfirmationType(itemType);
      setShowConfirmDialog(true);
    } else {
      // For regular items, just toggle collected status
      toggleItemCollected(item.id, item.quantity);
    }
  };
  
  // Confirm item collection
  const confirmItemCollection = (quantity?: number, answer?: 'yes' | 'no', collectibleDetails?: { name: string, issueNumber?: number }) => {
    if (!currentItem) return;
    
    // For consumables, use the quantity collected
    // Use nullish coalescing to allow for quantity of 0
    const itemQuantity = quantity !== undefined ? quantity : currentItem.quantity;
    
    // Create or update itemAnswers if we have a yes/no answer
    let updatedItemAnswers = tracking.itemAnswers || {};
    if (answer) {
      updatedItemAnswers = {
        ...updatedItemAnswers,
        [currentItem.id]: answer
      };
    }
    
    // Create or update collectibleDetails if we have collectible information
    let updatedCollectibleDetails = tracking.collectibleDetails || {};
    if (collectibleDetails && answer === 'yes') {
      updatedCollectibleDetails = {
        ...updatedCollectibleDetails,
        [currentItem.id]: {
          type: confirmationType || 'unknown',
          name: collectibleDetails.name,
          issueNumber: collectibleDetails.issueNumber
        }
      };
    }
    
    // If we have collectible details, update the item name
    if (collectibleDetails) {
      // For magazines with issue numbers, format the name as "Magazine Title #X"
      const formattedName = confirmationType === 'magazine' && collectibleDetails.issueNumber 
        ? `${collectibleDetails.name} #${collectibleDetails.issueNumber}` 
        : collectibleDetails.name;
      
      // Find the item in the route and update its name
      const itemIndex = tracking.route.stops[tracking.currentStopIndex].items.findIndex(
        item => item.id === currentItem?.id
      );
      
      if (itemIndex !== -1) {
        // Create a new stops array with the updated item
        const updatedStops = [...tracking.route.stops];
        const updatedItems = [...updatedStops[tracking.currentStopIndex].items];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          name: formattedName
        };
        updatedStops[tracking.currentStopIndex] = {
          ...updatedStops[tracking.currentStopIndex],
          items: updatedItems
        };
        
        // Update the route with the new stops
        const updatedRoute = {
          ...tracking.route,
          stops: updatedStops
        };
        
        // Update the tracking with the new route
        const updatedTracking = {
          ...tracking,
          route: updatedRoute,
          collectibleDetails: updatedCollectibleDetails
        };
        
        // Toggle the item collected status with the updated tracking
        toggleItemCollected(currentItem.id, itemQuantity, updatedItemAnswers, updatedTracking);
        
        setShowConfirmDialog(false);
        setCurrentItem(null);
        setConfirmationType(null);
        return;
      }
    }
    
    // Toggle the item collected status
    toggleItemCollected(
      currentItem.id, 
      itemQuantity, 
      updatedItemAnswers, 
      { ...tracking, collectibleDetails: updatedCollectibleDetails }
    );
    
    setShowConfirmDialog(false);
    setCurrentItem(null);
    setConfirmationType(null);
  };
  
  // Cancel item collection
  const cancelItemCollection = () => {
    setShowConfirmDialog(false);
    setCurrentItem(null);
    setConfirmationType(null);
  };
  
  // Toggle item collected status
  const toggleItemCollected = (
    itemId: string, 
    quantity: number = 1, 
    itemAnswers?: Record<string, 'yes' | 'no'>,
    updatedTracking?: RouteProgress & { route: Route }
  ) => {
    // Use the provided tracking or the current tracking
    const trackingToUpdate = updatedTracking || tracking;
    
    // If already collected, uncollect it
    const isCollected = trackingToUpdate.collectedItems[itemId];
    
    // Create a new object for collectedItems to ensure React detects the change
    const updatedCollectedItems = {
      ...trackingToUpdate.collectedItems,
      [itemId]: !isCollected
    };
    
    // Create or update collectedQuantities
    const updatedCollectedQuantities = {
      ...trackingToUpdate.collectedQuantities || {},
      [itemId]: !isCollected ? quantity : 0
    };
    
    // Create a completely new tracking object to ensure state updates properly
    const newTracking = {
      ...trackingToUpdate,
      collectedItems: updatedCollectedItems,
      collectedQuantities: updatedCollectedQuantities,
      itemAnswers: itemAnswers || trackingToUpdate.itemAnswers
    };
    
    // Call the update function with the new tracking object
    onUpdateTracking(newTracking);
    
    // If the item is collected, update inventory
    const item = findItemById(itemId, trackingToUpdate.route);
    if (item) {
      if (!isCollected) {
        // Item is being collected - add to inventory only if quantity > 0
        // Get current inventory
        const currentInventory = trackingToUpdate.inventoryData?.routeInventory || {};
        
        // Only update inventory if quantity is greater than 0
        if (quantity > 0) {
          // Update inventory with collected item
          const updatedInventory = {
            ...currentInventory,
            [item.name]: (currentInventory[item.name] || 0) + quantity
          };
          
          // Call onUpdateInventory with the updated inventory
          onUpdateInventory(updatedInventory);
        }
      } else {
        // Item is being uncollected - remove from inventory
        const currentInventory = trackingToUpdate.inventoryData?.routeInventory || {};
        
        // Only update if the item exists in inventory
        if (currentInventory[item.name]) {
          // Calculate new quantity, ensuring it doesn't go below 0
          const newQuantity = Math.max(0, (currentInventory[item.name] || 0) - quantity);
          
          // Create updated inventory
          const updatedInventory = {
            ...currentInventory,
            [item.name]: newQuantity
          };
          
          // If quantity is 0, remove the item from inventory
          if (newQuantity === 0) {
            delete updatedInventory[item.name];
          }
          
          // Call onUpdateInventory with the updated inventory
          onUpdateInventory(updatedInventory);
        }
      }
    }
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
  
  // Handle stop selection
  const handleSelectStop = (index: number) => {
    onUpdateTracking({
      ...tracking,
      currentStopIndex: index
    });
  };
  
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <div className="card route-tracker-container">
      {/* Sticky header for mobile */}
      {showStickyHeader && (
        <div 
          className="sticky-header fixed top-0 left-0 right-0 bg-secondary-accent text-dark-contrast p-3 z-50 sm:hidden"
          onClick={scrollToTop}
        >
          <div className="container mx-auto">
            {/* Route title row */}
            <div className="font-semibold text-base mb-2 break-words">
              Tracking: {tracking.route.name}
            </div>
            
            {/* Info row */}
            <div className="flex justify-between items-center text-xs mb-2">
              <div className="flex items-center">
                <span>Stop {tracking.currentStopIndex + 1}/{tracking.route.stops.length}</span>
              </div>
              
              {currentStop && (
                <div className="truncate mx-2 flex-1 max-w-[50%]">
                  <span className="opacity-75 mr-1">Current:</span> {currentStop.name}
                </div>
              )}
              
              <div className="font-mono whitespace-nowrap">
                {elapsedTime}
              </div>
            </div>
            
            {/* Navigation and action buttons row */}
            <div className="flex justify-between items-center">
              {/* Navigation buttons */}
              <div className="flex space-x-3">
                <button 
                  className="btn-nav-sticky bg-main-accent text-white rounded-full w-9 h-9 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveToPreviousStop();
                  }}
                  disabled={tracking.currentStopIndex === 0}
                  aria-label="Previous stop"
                >
                  <FontAwesomeIcon icon={faArrowLeft} size="sm" />
                </button>
                <button 
                  className="btn-nav-sticky bg-main-accent text-white rounded-full w-9 h-9 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveToNextStop();
                  }}
                  disabled={tracking.currentStopIndex === tracking.route.stops.length - 1}
                  aria-label="Next stop"
                >
                  <FontAwesomeIcon icon={faArrowRight} size="sm" />
                </button>
              </div>
              
              {/* Action buttons */}
              <div className="flex space-x-3 text-xs">
                <button 
                  className="btn btn-outline btn-xs py-1 px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel();
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                </button>
                <button 
                  className="btn btn-success btn-xs py-1 px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} className="mr-1" /> Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="card-header route-tracker-header flex-col sm:flex-row">
        <h2 className="text-white font-semibold text-xl mb-2 sm:mb-0 break-words">Tracking: {tracking.route.name}</h2>
        <div className="route-tracker-actions flex justify-center sm:justify-end w-full sm:w-auto mt-2 sm:mt-0">
          <button 
            className="btn btn-outline mr-2"
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
        <div ref={statsRef}>
          <TrackingStats 
            elapsedTime={elapsedTime}
            currentStopIndex={tracking.currentStopIndex}
            totalStops={tracking.route.stops.length}
          />
        </div>
        
        {/* Current stop */}
        <div className="route-tracker-main">
          {currentStop && (
            <CurrentStop 
              stop={currentStop}
              currentStopIndex={tracking.currentStopIndex}
              totalStops={tracking.route.stops.length}
              collectedItems={tracking.collectedItems}
              collectedQuantities={tracking.collectedQuantities || {}}
              itemAnswers={tracking.itemAnswers || {}}
              onItemClick={handleItemClick}
              onShowDescription={handleShowDescription}
              onPreviousStop={moveToPreviousStop}
              onNextStop={moveToNextStop}
              route={tracking.route}
            />
          )}
        </div>
        
        {/* All stops */}
        <StopsList 
          route={tracking.route}
          currentStopIndex={tracking.currentStopIndex}
          collectedItems={tracking.collectedItems}
          onSelectStop={handleSelectStop}
        />
      </div>
      
      {/* Item Description Tooltip */}
      {showItemDescription && (
        <ItemDescriptionTooltip 
          description={showItemDescription}
          onClose={handleCloseDescription}
        />
      )}
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && currentItem && (
        <ItemConfirmationDialog 
          item={currentItem}
          confirmationType={confirmationType}
          onConfirm={confirmItemCollection}
          onCancel={cancelItemCollection}
        />
      )}
    </div>
  );
};

export default RouteTracker; 