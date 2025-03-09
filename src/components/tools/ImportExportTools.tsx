import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faUpload } from '@fortawesome/free-solid-svg-icons';
import { Route, RouteProgress } from '../../types/farmingTracker';

interface ImportExportToolsProps {
  routes: Route[];
  currentRouteId: string | null;
  activeTracking: RouteProgress | null;
  onImportData: (
    routes: Route[], 
    currentRouteId: string | null, 
    activeTracking: RouteProgress | null
  ) => void;
  onConfirm: (message: string) => Promise<boolean>;
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

/**
 * Component for importing and exporting data
 */
const ImportExportTools: React.FC<ImportExportToolsProps> = ({
  routes,
  currentRouteId,
  activeTracking,
  onImportData,
  onConfirm,
  onNotify
}) => {
  // References to file input elements
  const fullImportInputRef = useRef<HTMLInputElement>(null);
  const routesOnlyImportInputRef = useRef<HTMLInputElement>(null);

  /**
   * Download all data including routes and tracking information
   */
  const downloadAllData = () => {
    try {
      // Create a data object with all the important information
      const dataToSave = {
        routes,
        currentRouteId,
        activeTracking,
        version: '1.0.0', // Add a version number for future compatibility
        exportDate: new Date().toISOString()
      };
      
      // Convert to JSON
      const jsonData = JSON.stringify(dataToSave, null, 2);
      
      // Create a blob and download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element and trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `fallout76-routes-and-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      onNotify('Routes and history downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading data:', error);
      onNotify('Failed to download routes and history. Please try again.', 'error');
    }
  };

  /**
   * Download just the routes without tracking information
   */
  const downloadRoutesOnly = () => {
    try {
      // Create a data object with just the routes information
      const dataToSave = {
        routes,
        currentRouteId,
        version: '1.0.0',
        exportDate: new Date().toISOString()
      };
      
      // Convert to JSON
      const jsonData = JSON.stringify(dataToSave, null, 2);
      
      // Create a blob and download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element and trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `fallout76-routes-only-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      onNotify('Routes downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading routes:', error);
      onNotify('Failed to download routes. Please try again.', 'error');
    }
  };

  /**
   * Load data from a JSON file including routes and tracking information
   */
  const loadDataFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Get the selected file
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Create a file reader
    const reader = new FileReader();
    
    // Set up the onload event
    reader.onload = async (e) => {
      try {
        // Parse the JSON data
        const jsonData = e.target?.result as string;
        const parsedData = JSON.parse(jsonData);
        
        // Validate the data structure
        if (!parsedData.routes || !Array.isArray(parsedData.routes)) {
          throw new Error('Invalid data format: routes array not found');
        }
        
        // Check if we should merge with existing routes or replace them
        const confirmed = await onConfirm(
          'Do you want to merge with existing routes? Click OK to merge (update existing routes and add new ones), or Cancel to replace all routes.'
        );
        
        let updatedRoutes: Route[];
        
        if (confirmed) {
          // Merge approach: Update existing routes and add new ones
          const existingRouteMap = new Map(routes.map(route => [route.id, route]));
          
          // Process each imported route
          parsedData.routes.forEach((importedRoute: Route) => {
            if (existingRouteMap.has(importedRoute.id)) {
              // Update existing route
              existingRouteMap.set(importedRoute.id, importedRoute);
            } else {
              // Add new route
              existingRouteMap.set(importedRoute.id, importedRoute);
            }
          });
          
          // Convert map back to array
          updatedRoutes = Array.from(existingRouteMap.values());
        } else {
          // Replace approach: Use imported routes directly
          updatedRoutes = parsedData.routes;
        }
        
        // Import the data
        onImportData(
          updatedRoutes, 
          parsedData.currentRouteId || null, 
          parsedData.activeTracking || null
        );
        
        onNotify(`Routes and history ${confirmed ? 'merged' : 'imported'} successfully!`, 'success');
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        onNotify('Failed to import routes and history. Please check the file format.', 'error');
      }
    };
    
    // Read the file as text
    reader.readAsText(file);
    
    // Reset the input field so the same file can be selected again
    event.target.value = '';
  };

  /**
   * Load just routes from a JSON file without tracking information
   */
  const loadRoutesOnlyFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Get the selected file
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Create a file reader
    const reader = new FileReader();
    
    // Set up the onload event
    reader.onload = async (e) => {
      try {
        // Parse the JSON data
        const jsonData = e.target?.result as string;
        const parsedData = JSON.parse(jsonData);
        
        // Validate the data structure
        if (!parsedData.routes || !Array.isArray(parsedData.routes)) {
          throw new Error('Invalid data format: routes array not found');
        }
        
        // Check if we should merge with existing routes or replace them
        const confirmed = await onConfirm(
          'Do you want to merge with existing routes? Click OK to merge (update existing routes and add new ones), or Cancel to replace all routes.'
        );
        
        let updatedRoutes: Route[];
        
        if (confirmed) {
          // Merge approach: Update existing routes and add new ones
          const existingRouteMap = new Map(routes.map(route => [route.id, route]));
          
          // Process each imported route
          parsedData.routes.forEach((importedRoute: Route) => {
            if (existingRouteMap.has(importedRoute.id)) {
              // Update existing route
              existingRouteMap.set(importedRoute.id, importedRoute);
            } else {
              // Add new route
              existingRouteMap.set(importedRoute.id, importedRoute);
            }
          });
          
          // Convert map back to array
          updatedRoutes = Array.from(existingRouteMap.values());
        } else {
          // Replace approach: Use imported routes directly
          updatedRoutes = parsedData.routes;
        }
        
        // Import just the routes, keeping existing tracking data
        onImportData(
          updatedRoutes, 
          parsedData.currentRouteId || null, 
          activeTracking // Keep existing tracking
        );
        
        onNotify(`Routes ${confirmed ? 'merged' : 'imported'} successfully!`, 'success');
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        onNotify('Failed to import routes. Please check the file format.', 'error');
      }
    };
    
    // Read the file as text
    reader.readAsText(file);
    
    // Reset the input field so the same file can be selected again
    event.target.value = '';
  };

  return (
    <div className="import-export-tools">
      <div className="tools-section">
        <h3>Export Data</h3>
        <div className="export-buttons">
          <button 
            className="export-button export-all-button"
            onClick={downloadAllData}
            title="Export all data including routes and tracking information"
          >
            <FontAwesomeIcon icon={faDownload} /> Export All Data
          </button>
          <button 
            className="export-button export-routes-button"
            onClick={downloadRoutesOnly}
            title="Export just the routes without tracking information"
          >
            <FontAwesomeIcon icon={faDownload} /> Export Routes Only
          </button>
        </div>
      </div>

      <div className="tools-section">
        <h3>Import Data</h3>
        <div className="import-buttons">
          <button 
            className="import-button import-all-button"
            onClick={() => fullImportInputRef.current?.click()}
            title="Import all data including routes and tracking information"
          >
            <FontAwesomeIcon icon={faUpload} /> Import All Data
          </button>
          <input
            type="file"
            ref={fullImportInputRef}
            onChange={loadDataFromFile}
            accept=".json"
            style={{ display: 'none' }}
          />
          
          <button 
            className="import-button import-routes-button"
            onClick={() => routesOnlyImportInputRef.current?.click()}
            title="Import just the routes without tracking information"
          >
            <FontAwesomeIcon icon={faUpload} /> Import Routes Only
          </button>
          <input
            type="file"
            ref={routesOnlyImportInputRef}
            onChange={loadRoutesOnlyFromFile}
            accept=".json"
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImportExportTools; 