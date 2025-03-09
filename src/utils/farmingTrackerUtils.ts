import { ITEM_TYPES_REQUIRING_NAME, ITEM_TYPES_WITH_DEFAULT_NAME } from '../types/farmingTracker';

/**
 * Checks if an item type requires a custom name to be specified
 * @param itemType The type of item to check
 * @returns True if the item type requires a custom name
 */
export const requiresCustomName = (itemType: string): boolean => {
  return ITEM_TYPES_REQUIRING_NAME.includes(itemType);
};

/**
 * Checks if an item type uses its type as the default name
 * @param itemType The type of item to check
 * @returns True if the item type uses its type as the default name
 */
export const usesDefaultName = (itemType: string): boolean => {
  return ITEM_TYPES_WITH_DEFAULT_NAME.includes(itemType);
};

/**
 * Gets the appropriate name for an item based on its type and provided name
 * @param itemName The name provided for the item
 * @param itemType The type of the item
 * @returns The appropriate name for the item
 */
export const getItemNameOrDefault = (itemName: string, itemType: string): string => {
  // If the item type uses a default name (like Bobblehead or Magazine), return the type as the name
  if (usesDefaultName(itemType)) {
    return itemType;
  }
  // Otherwise, return the provided name or the type as fallback
  return itemName.trim() || itemType;
};

/**
 * Validates that an item has an appropriate name based on its type
 * @param itemName The name provided for the item
 * @param itemType The type of the item
 * @returns True if the item name is valid for its type
 */
export const validateItemName = (itemName: string, itemType: string): boolean => {
  // If the item type requires a custom name, make sure one is provided
  if (requiresCustomName(itemType)) {
    return !!itemName.trim();
  }
  // For types that use default names, no validation needed
  return true;
};

/**
 * Checks if IndexedDB is available in the current browser
 * @returns True if IndexedDB is available
 */
export const isIndexedDBAvailable = (): boolean => {
  try {
    // This will throw an error in browsers where IndexedDB is not available
    // or is disabled (e.g., in private browsing mode in some browsers)
    return typeof window !== 'undefined' && 
           'indexedDB' in window && 
           window.indexedDB !== null;
  } catch (e) {
    return false;
  }
}; 