import { Item, Route, Stop } from '../types/farmingTracker';

/**
 * Utility functions for item-related operations
 */

/**
 * Determine item type for confirmation dialog
 * @param item The item to check
 * @returns The type of the item or null if not a special type
 */
export const getItemType = (item: Item): 'bobblehead' | 'magazine' | 'consumable' | 'event' | 'spawned' | null => {
  if (!item) return null;
  
  // Use the item's type property if available
  if (item.type) {
    const lowerType = item.type.toLowerCase();
    if (lowerType === 'bobblehead') return 'bobblehead';
    if (lowerType === 'magazine') return 'magazine';
    if (lowerType === 'event') return 'event';
    if (lowerType === 'consumable') return 'consumable';
    if (lowerType === 'spawned') return 'spawned';
  }
  
  // Fallback to quantity-based detection for consumables
  if (item.quantity > 1) return 'consumable';
  
  return null;
};

/**
 * Find an item by ID across all stops in a route
 * @param itemId The ID of the item to find
 * @param route The route containing the stops to search
 * @returns The found item or undefined
 */
export const findItemById = (itemId: string, route: Route): Item | undefined => {
  for (const stop of route.stops) {
    const item = stop.items.find(item => item.id === itemId);
    if (item) return item;
  }
  return undefined;
};

/**
 * Calculate progress percentage for a route
 * @param route The route to calculate progress for
 * @param collectedItems Record of collected items
 * @returns Progress percentage (0-100)
 */
export const calculateProgress = (route: Route, collectedItems: Record<string, boolean>): number => {
  if (!route.stops.length) return 0;
  
  const totalItems = route.stops.reduce((total: number, stop: Stop) => 
    total + stop.items.length, 0);
  
  if (totalItems === 0) return 0;
  
  const collectedCount = Object.keys(collectedItems).length;
  return Math.round((collectedCount / totalItems) * 100);
};

/**
 * Check if all items in a stop are collected
 * @param stop The stop to check
 * @param collectedItems Record of collected items
 * @returns True if all items are collected, false otherwise
 */
export const areAllStopItemsCollected = (stop: Stop, collectedItems: Record<string, boolean>): boolean => {
  if (!stop) return false;
  
  return stop.items.every((item: Item) => 
    collectedItems[item.id]
  );
};

/**
 * Get completion status for a stop
 * @param stop The stop to check
 * @param stopIndex The index of the stop
 * @param currentStopIndex The index of the current stop
 * @param collectedItems Record of collected items
 * @returns The completion status of the stop
 */
export const getStopCompletionStatus = (
  stop: Stop,
  stopIndex: number, 
  currentStopIndex: number, 
  collectedItems: Record<string, boolean>
): 'completed' | 'skipped' | 'current' | 'incomplete' => {
  if (!stop) return 'incomplete';
  
  const allCollected = stop.items.every((item: Item) => 
    collectedItems[item.id]
  );
  
  if (allCollected) return 'completed';
  if (stopIndex < currentStopIndex) return 'skipped';
  if (stopIndex === currentStopIndex) return 'current';
  return 'incomplete';
}; 