import { DBSchema } from 'idb';

/**
 * Database schema for the Farming Tracker application
 */
export interface FarmingTrackerDB extends DBSchema {
  routes: {
    key: string;
    value: Route;
    indexes: { 'by-name': string };
  };
  activeTracking: {
    key: string;
    value: RouteProgress;
  };
  currentRouteId: {
    key: string;
    value: { id: string; value: string };
  };
  itemInventory: {
    key: string; // item name
    value: {
      name: string;
      currentAmount: number;
      lastUpdated: number;
    };
  };
  routeHistory: {
    key: string; // unique ID for the history entry
    value: RouteHistory;
    indexes: { 'by-routeId': string; 'by-date': number };
  };
}

/**
 * Represents an item that can be collected during a farming run
 */
export interface Item {
  id: string;
  type: string;
  name: string;
  quantity: number;
  collected: boolean;
  description?: string; // Optional description field for location information
}

/**
 * Represents a stop on a farming route
 */
export interface Stop {
  id: string;
  name: string;
  description: string;
  items: Item[];
}

/**
 * Represents a complete farming route with multiple stops
 */
export interface Route {
  id: string;
  name: string;
  description: string;
  stops: Stop[];
  completedRuns?: number; // Track the number of completed runs
}

/**
 * Tracks progress through a route during an active farming run
 */
export interface RouteProgress {
  routeId: string;
  startTime: number;
  currentStopIndex: number;
  collectedItems: Record<string, boolean>; // Maps item IDs to collection status
  collectedQuantities: Record<string, number>; // Maps item IDs to collected quantities
  itemAnswers?: Record<string, 'yes' | 'no'>; // Maps item IDs to yes/no answers for special items
  collectibleDetails?: Record<string, { 
    type: string;
    name: string; 
    issueNumber?: number;
  }>; // Maps item IDs to detailed collectible information
  inventoryData?: {
    preRoute?: Record<string, number>; // Maps item names to pre-route inventory counts
    postRoute?: Record<string, number>; // Maps item names to post-route inventory counts
    routeInventory?: Record<string, number>; // Current inventory levels by item name
    stops?: Record<string, {
      preStop?: Record<string, number>; // Maps item names to pre-stop inventory counts
      postStop?: Record<string, number>; // Maps item names to post-stop inventory counts
      addedAmount?: Record<string, number>; // Amount added during this stop by item name
    }>;
  };
}

/**
 * Represents a completed route run that is saved to history
 */
export interface RouteHistory {
  id: string;
  routeId: string;
  routeName: string;
  startTime: number;
  endTime: number;
  duration: number;
  collectedItems: Record<string, boolean>;
  collectedQuantities: Record<string, number>;
  itemAnswers?: Record<string, 'yes' | 'no'>;
  collectibleDetails?: Record<string, { 
    type: string;
    name: string; 
    issueNumber?: number;
  }>; // Maps item IDs to detailed collectible information
  inventoryData?: {
    preRoute?: Record<string, number>;
    postRoute?: Record<string, number>;
    addedItems?: Record<string, number>; // Calculated difference between pre and post
    stops?: Record<string, {
      preStop?: Record<string, number>;
      postStop?: Record<string, number>;
      addedAmount?: Record<string, number>;
    }>;
  };
}

/**
 * Default item types available in the application
 */
export const DEFAULT_ITEM_TYPES = [
  'Bobblehead',
  'Magazine',
  'Event',
  'Consumable',
  'Harvestable',
  'Task'
] as const;

/**
 * Type representing the available item types
 */
export type ItemType = typeof DEFAULT_ITEM_TYPES[number];

/**
 * Item types that require a custom name to be specified
 */
export const ITEM_TYPES_REQUIRING_NAME = ['Event', 'Task', 'Harvestable', 'Consumable'];

/**
 * Item types that use their type as the default name
 */
export const ITEM_TYPES_WITH_DEFAULT_NAME = ['Bobblehead', 'Magazine'];

/**
 * Item types that don't need a quantity field
 */
export const ITEM_TYPES_WITHOUT_QUANTITY = ['Bobblehead', 'Magazine', 'Event', 'Task', 'Harvestable']; 