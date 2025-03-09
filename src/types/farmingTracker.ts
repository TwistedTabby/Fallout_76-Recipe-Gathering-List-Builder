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
    value: RouteProgress & { id?: string };
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
  collectData?: boolean; // Flag to indicate if baseline inventory data should be collected
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
  autoInventoryChecks?: boolean; // Flag to indicate if inventory should be checked before first and after last stop
}

/**
 * Tracks progress through a route during an active farming run
 */
export interface RouteProgress {
  routeId: string;
  startTime: number;
  currentStopIndex: number;
  collectedItems: Record<string, boolean>; // Maps item IDs to collection status
  notes: string;
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
 * Default item types available in the application
 */
export const DEFAULT_ITEM_TYPES = [
  'Bobblehead',
  'Magazine',
  'Event',
  'Consumable',
  'Harvestable',
  'Task'
];

/**
 * Item types that require a custom name to be specified
 */
export const ITEM_TYPES_REQUIRING_NAME = ['Event', 'Task', 'Harvestable', 'Consumable'];

/**
 * Item types that use their type as the default name
 */
export const ITEM_TYPES_WITH_DEFAULT_NAME = ['Bobblehead', 'Magazine']; 