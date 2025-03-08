# FarmingTracker Componentization Plan

## Current Structure Analysis

The current `FarmingTracker.tsx` file is very large and contains:
- Multiple interfaces and type definitions
- Database initialization and management
- Utility functions
- A main component with numerous state variables
- Many handler functions for different operations
- Complex UI rendering logic

## Componentization Goals

1. **Improve maintainability** by breaking down the monolithic component
2. **Enhance readability** through logical separation of concerns
3. **Facilitate testing** with smaller, focused components
4. **Enable reusability** of common UI patterns and functionality

## Proposed Component Structure

### 1. Types and Interfaces

Move all interfaces and types to a separate file:

```typescript
// src/types/farmingTracker.ts
export interface Item {...}
export interface Stop {...}
export interface Route {...}
export interface RouteProgress {...}
// Include all other interfaces
```

### 2. Database Layer

Create a custom hook for database operations:

```typescript
// src/hooks/useFarmingTrackerDB.ts
export function useFarmingTrackerDB() {
  // DB initialization logic
  // CRUD operations for routes, tracking, etc.
  return {
    initDB,
    loadRoutes,
    saveRoute,
    deleteRoute,
    // Other DB operations
  };
}
```

### 3. Component Hierarchy

#### Core Components

1. **FarmingTrackerApp** (Main container)
   - Manages global state
   - Handles routing between different views

2. **RouteList**
   - Displays list of available routes
   - Handles route selection

3. **RouteEditor**
   - Manages route creation and editing
   - Contains StopList component

4. **StopEditor**
   - Manages individual stop editing
   - Contains ItemList component

5. **ItemEditor**
   - Handles item creation and editing

6. **RouteTracker**
   - Manages active route tracking
   - Shows current progress
   - Handles item collection

7. **InventoryTracker**
   - Manages inventory data collection
   - Shows inventory changes

#### Utility Components

1. **ConfirmDialog**
   - Reusable confirmation dialog

2. **Notification**
   - Toast notifications system

3. **DragDropList**
   - Reusable component for drag-and-drop reordering

4. **ImportExportTools**
   - Handles data import/export functionality

## Implementation Plan

### Phase 1: Extract Types and Utilities

1. Move interfaces and types to `src/types/farmingTracker.ts`
2. Extract utility functions to `src/utils/farmingTrackerUtils.ts`
3. Create database hook in `src/hooks/useFarmingTrackerDB.ts`

### Phase 2: Create Core UI Components

1. Create basic UI components without logic:
   - RouteList
   - RouteEditor
   - StopEditor
   - ItemEditor
   - RouteTracker

2. Implement shared components:
   - ConfirmDialog
   - Notification

### Phase 3: Connect Components with Logic

1. Implement state management (Context API or Redux)
2. Connect components to database operations
3. Implement event handlers for each component

### Phase 4: Implement Advanced Features

1. Drag and drop reordering
2. Import/export functionality
3. Inventory tracking

## Detailed Component Breakdown

### FarmingTrackerApp Component

```typescript
// src/components/FarmingTrackerApp.tsx
import React, { useState } from 'react';
import { useFarmingTrackerDB } from '../hooks/useFarmingTrackerDB';
import RouteList from './RouteList';
import RouteEditor from './RouteEditor';
import RouteTracker from './RouteTracker';
// ...

const FarmingTrackerApp: React.FC = () => {
  const [view, setView] = useState<'list' | 'editor' | 'tracker'>('list');
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const db = useFarmingTrackerDB();
  
  // Main app logic
  
  return (
    <div className="farming-tracker-app">
      {/* Render appropriate view based on state */}
    </div>
  );
};
```

### RouteList Component

```typescript
// src/components/RouteList.tsx
import React from 'react';
import { Route } from '../types/farmingTracker';

interface RouteListProps {
  routes: Route[];
  onSelectRoute: (routeId: string) => void;
  onCreateRoute: () => void;
  onDeleteRoute: (routeId: string) => void;
  onStartTracking: (routeId: string) => void;
}

const RouteList: React.FC<RouteListProps> = ({ routes, onSelectRoute, onCreateRoute, onDeleteRoute, onStartTracking }) => {
  // Route list rendering and handlers
};
```

### RouteEditor Component

```typescript
// src/components/RouteEditor.tsx
import React, { useState } from 'react';
import { Route, Stop } from '../types/farmingTracker';
import StopList from './StopList';

interface RouteEditorProps {
  route: Route;
  onSave: (route: Route) => void;
  onCancel: () => void;
}

const RouteEditor: React.FC<RouteEditorProps> = ({ route, onSave, onCancel }) => {
  // Route editing logic
};
```

## File Structure

```
src/
├── components/
│   ├── FarmingTrackerApp.tsx
│   ├── RouteList.tsx
│   ├── RouteEditor.tsx
│   ├── StopEditor.tsx
│   ├── ItemEditor.tsx
│   ├── RouteTracker.tsx
│   ├── InventoryTracker.tsx
│   ├── ui/
│   │   ├── ConfirmDialog.tsx
│   │   ├── Notification.tsx
│   │   └── DragDropList.tsx
│   └── tools/
│       └── ImportExportTools.tsx
├── hooks/
│   ├── useFarmingTrackerDB.ts
│   └── useNotification.ts
├── types/
│   └── farmingTracker.ts
├── utils/
│   └── farmingTrackerUtils.ts
└── pages/
    └── FarmingTracker.tsx (new simplified version)
```

## Code Migration Strategy

1. **Create new files** without modifying the original
2. **Gradually move functionality** from the original file to new components
3. **Test each component** individually before integration
4. **Update the main component** to use the new structure
5. **Remove redundant code** from the original file

## Specific Function Mappings

| Current Function | Target Component/File |
|------------------|----------------------|
| `initDB`, `loadData`, etc. | `useFarmingTrackerDB.ts` |
| `createRoute`, `updateRouteDetails` | `RouteEditor.tsx` |
| `addStop`, `editStop` | `StopEditor.tsx` |
| `addItemToStop`, `editItem` | `ItemEditor.tsx` |
| `startRouteTracking`, `toggleItemCollected` | `RouteTracker.tsx` |
| `saveInventoryData` | `InventoryTracker.tsx` |
| `customConfirm` | `ConfirmDialog.tsx` |
| `showNotification` | `useNotification.ts` |
| `downloadAllData`, `loadDataFromFile` | `ImportExportTools.tsx` |

## Next Steps

1. Begin with extracting types and interfaces
2. Create the database hook
3. Implement the basic UI components
4. Gradually migrate functionality while maintaining the existing app

This plan provides a roadmap for breaking down the large component into smaller, more manageable pieces while maintaining functionality throughout the process.
