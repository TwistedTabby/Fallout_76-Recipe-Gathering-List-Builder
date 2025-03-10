import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { RouteProgress } from '../types/farmingTracker';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

interface InventoryTrackerProps {
  activeTracking: RouteProgress;
  onUpdateInventory: (updatedInventory: Record<string, number>) => void;
}

/**
 * Component for tracking inventory changes during route runs
 */
const InventoryTracker: React.FC<InventoryTrackerProps> = ({
  activeTracking,
  onUpdateInventory
}) => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  // Initialize inventory items from active tracking
  useEffect(() => {
    if (activeTracking.inventoryData?.routeInventory) {
      const items = Object.entries(activeTracking.inventoryData.routeInventory).map(
        ([name, quantity]) => ({
          id: name,
          name,
          quantity
        })
      );
      setInventoryItems(items);
    }
  }, [activeTracking.inventoryData?.routeInventory]);

  // Update inventory in parent component
  const updateInventory = (items: InventoryItem[]) => {
    const inventory: Record<string, number> = {};
    items.forEach(item => {
      inventory[item.name] = item.quantity;
    });
    onUpdateInventory(inventory);
  };

  // Add a new item to inventory
  const handleAddItem = () => {
    if (!newItemName.trim()) {
      return;
    }

    // Check if item already exists
    const existingItemIndex = inventoryItems.findIndex(
      item => item.name.toLowerCase() === newItemName.toLowerCase()
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...inventoryItems];
      updatedItems[existingItemIndex].quantity += newItemQuantity;
      setInventoryItems(updatedItems);
      updateInventory(updatedItems);
    } else {
      // Add new item
      const newItem: InventoryItem = {
        id: newItemName,
        name: newItemName,
        quantity: newItemQuantity
      };
      const updatedItems = [...inventoryItems, newItem];
      setInventoryItems(updatedItems);
      updateInventory(updatedItems);
    }

    // Reset form
    setNewItemName('');
    setNewItemQuantity(1);
  };

  // Update item quantity
  const handleUpdateQuantity = (id: string, change: number) => {
    const updatedItems = inventoryItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    // Filter out items with zero quantity
    const filteredItems = updatedItems.filter(item => item.quantity > 0);
    
    setInventoryItems(filteredItems);
    updateInventory(filteredItems);
  };

  // Remove an item from inventory
  const handleRemoveItem = (id: string) => {
    const updatedItems = inventoryItems.filter(item => item.id !== id);
    setInventoryItems(updatedItems);
    updateInventory(updatedItems);
  };

  return (
    <div className="inventory-tracker bg-base-200 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Inventory Tracker</h3>
      
      {/* Add new item form */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          className="input input-bordered flex-grow"
          placeholder="Item name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <input
          type="number"
          className="input input-bordered w-24"
          min="1"
          value={newItemQuantity}
          onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
        />
        <button
          className="btn btn-primary"
          onClick={handleAddItem}
          disabled={!newItemName.trim()}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add
        </button>
      </div>
      
      {/* Inventory list */}
      {inventoryItems.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No items in inventory yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td className="flex gap-2">
                    <button
                      className="btn btn-sm btn-circle btn-ghost"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                    <button
                      className="btn btn-sm btn-circle btn-ghost"
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <button
                      className="btn btn-sm btn-circle btn-ghost text-error"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryTracker; 