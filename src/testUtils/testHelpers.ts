// This file contains test utilities and is not a test file itself
// It provides mock data and helper functions for tests

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock IndexedDB
import 'fake-indexeddb/auto';

// Mock data
export const mockRoutes = [
  {
    id: 'route-1',
    name: 'Test Route 1',
    description: 'Test route description 1',
    stops: [
      {
        id: 'stop-1',
        name: 'Test Stop 1',
        description: 'Test stop description 1',
        items: [
          {
            id: 'item-1',
            type: 'Bobblehead',
            name: 'Bobblehead',
            quantity: 1,
            collected: false,
            description: 'Test item description 1'
          }
        ]
      }
    ],
    completedRuns: 0
  },
  {
    id: 'route-2',
    name: 'Test Route 2',
    description: 'Test route description 2',
    stops: [],
    completedRuns: 2
  }
];

export const mockActiveTracking = {
  routeId: 'route-1',
  startTime: Date.now() - 3600000, // 1 hour ago
  currentStopIndex: 0,
  collectedItems: {
    'item-1': false
  },
  collectedQuantities: {
    'item-1': 0
  },
  inventoryData: {
    routeInventory: {}
  }
};

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string): string | null => {
      return store[key] || null;
    },
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    getAllItems: (): Record<string, string> => {
      return { ...store };
    }
  };
})();

// Setup mock localStorage before tests
export const setupMockLocalStorage = (): void => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });
};

// Reset mock localStorage after tests
export const resetMockLocalStorage = (): void => {
  mockLocalStorage.clear();
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'queries'> {
  // Add any custom options here
}

export function customRender(
  ui: React.ReactElement,
  options?: CustomRenderOptions
) {
  return render(ui, { ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render }; 