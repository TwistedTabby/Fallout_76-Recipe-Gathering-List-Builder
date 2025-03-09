import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Stop, Item, DEFAULT_ITEM_TYPES } from '../types/farmingTracker';
import { v4 as uuidv4 } from 'uuid';
import { validateItemName } from '../utils/farmingTrackerUtils';

interface StopEditorProps {
  stop: Stop;
  onSave: (updatedStop: Stop) => void;
  onCancel: () => void;
}

/**
 * Component for editing a stop and its items
 */
const StopEditor: React.FC<StopEditorProps> = ({ stop, onSave, onCancel }) => {
  // Local state for editing
  const [editedStop, setEditedStop] = useState<Stop>({ ...stop });
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  // New item form state
  const [newItemType, setNewItemType] = useState(DEFAULT_ITEM_TYPES[0]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemDescription, setNewItemDescription] = useState('');
  
  // Update local state when stop prop changes
  useEffect(() => {
    setEditedStop({ ...stop });
  }, [stop]);

  // Handle stop name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedStop(prev => ({ ...prev, name: e.target.value }));
  };

  // Handle stop description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedStop(prev => ({ ...prev, description: e.target.value }));
  };

  // Handle collect data toggle
  const handleCollectDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedStop(prev => ({ ...prev, collectData: e.target.checked }));
  };

  // Reset new item form
  const resetNewItemForm = () => {
    setNewItemType(DEFAULT_ITEM_TYPES[0]);
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemDescription('');
    setIsAddingItem(false);
  };

  // Handle adding a new item
  const handleAddItem = () => {
    // Validate item name based on type
    if (!validateItemName(newItemName, newItemType)) {
      alert(`Please provide a name for items of type ${newItemType}`);
      return;
    }

    const newItem: Item = {
      id: uuidv4(),
      type: newItemType,
      name: newItemName || newItemType,
      quantity: newItemQuantity,
      collected: false,
      description: newItemDescription
    };

    setEditedStop(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Reset form
    resetNewItemForm();
  };

  // Handle editing an item
  const handleEditItem = (itemId: string) => {
    const item = editedStop.items.find(item => item.id === itemId);
    if (item) {
      setEditingItemId(itemId);
      setNewItemType(item.type);
      setNewItemName(item.name);
      setNewItemQuantity(item.quantity);
      setNewItemDescription(item.description || '');
    }
  };

  // Handle saving an edited item
  const handleSaveEditedItem = () => {
    // Validate item name based on type
    if (!validateItemName(newItemName, newItemType)) {
      alert(`Please provide a name for items of type ${newItemType}`);
      return;
    }

    setEditedStop(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === editingItemId 
          ? {
              ...item,
              type: newItemType,
              name: newItemName || newItemType,
              quantity: newItemQuantity,
              description: newItemDescription
            }
          : item
      )
    }));

    // Reset form
    setEditingItemId(null);
    resetNewItemForm();
  };

  // Handle deleting an item
  const handleDeleteItem = (itemId: string) => {
    setEditedStop(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));

    // If we were editing this item, cancel editing
    if (editingItemId === itemId) {
      setEditingItemId(null);
      resetNewItemForm();
    }
  };

  // Handle saving the stop
  const handleSave = () => {
    // Validate stop has a name
    if (!editedStop.name.trim()) {
      alert('Stop must have a name');
      return;
    }

    onSave(editedStop);
  };

  return (
    <div className="stop-editor">
      <div className="stop-editor-header">
        <h2>{stop.id ? 'Edit Stop' : 'Create Stop'}</h2>
        <div className="stop-editor-actions">
          <button 
            className="stop-editor-action-button cancel-button" 
            onClick={onCancel}
            title="Cancel"
          >
            <FontAwesomeIcon icon={faTimes} /> Cancel
          </button>
          <button 
            className="stop-editor-action-button save-button" 
            onClick={handleSave}
            title="Save Stop"
          >
            <FontAwesomeIcon icon={faSave} /> Save
          </button>
        </div>
      </div>

      <div className="stop-editor-form">
        <div className="form-group">
          <label htmlFor="stop-name">Stop Name:</label>
          <input
            id="stop-name"
            type="text"
            value={editedStop.name}
            onChange={handleNameChange}
            placeholder="Enter stop name"
            className="stop-name-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="stop-description">Description:</label>
          <textarea
            id="stop-description"
            value={editedStop.description}
            onChange={handleDescriptionChange}
            placeholder="Enter stop description"
            className="stop-description-input"
            rows={3}
          />
        </div>

        <div className="form-group checkbox-group">
          <input
            id="collect-data"
            type="checkbox"
            checked={editedStop.collectData || false}
            onChange={handleCollectDataChange}
          />
          <label htmlFor="collect-data">
            Collect inventory data at this stop
          </label>
        </div>
      </div>

      <div className="items-section">
        <div className="items-header">
          <h3>Items</h3>
          <button 
            className="add-item-button"
            onClick={() => {
              setIsAddingItem(true);
              setEditingItemId(null);
            }}
            disabled={isAddingItem || editingItemId !== null}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Item
          </button>
        </div>

        {(isAddingItem || editingItemId !== null) && (
          <div className="item-form">
            <h4>{editingItemId ? 'Edit Item' : 'Add New Item'}</h4>
            <div className="form-group">
              <label htmlFor="item-type">Item Type:</label>
              <select
                id="item-type"
                value={newItemType}
                onChange={(e) => setNewItemType(e.target.value)}
              >
                {DEFAULT_ITEM_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="item-name">Item Name:</label>
              <input
                id="item-name"
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter item name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="item-quantity">Quantity:</label>
              <input
                id="item-quantity"
                type="number"
                min="1"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="item-description">Description/Location:</label>
              <textarea
                id="item-description"
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Enter item description or location"
                rows={2}
              />
            </div>
            <div className="item-form-actions">
              <button 
                className="cancel-button"
                onClick={() => {
                  resetNewItemForm();
                  setEditingItemId(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="save-button"
                onClick={editingItemId ? handleSaveEditedItem : handleAddItem}
              >
                {editingItemId ? 'Save Item' : 'Add Item'}
              </button>
            </div>
          </div>
        )}

        {editedStop.items.length === 0 ? (
          <div className="no-items-message">
            <p>This stop has no items yet. Add items to collect during your farming run.</p>
          </div>
        ) : (
          <ul className="items-list">
            {editedStop.items.map((item) => (
              <li key={item.id} className="item">
                <div className="item-details">
                  <div className="item-name-type">
                    <span className="item-name">{item.name}</span>
                    <span className="item-type">{item.type}</span>
                  </div>
                  {item.description && (
                    <div className="item-description">{item.description}</div>
                  )}
                  <div className="item-quantity">
                    Quantity: {item.quantity}
                  </div>
                </div>
                <div className="item-actions">
                  <button 
                    className="edit-item-button"
                    onClick={() => handleEditItem(item.id)}
                    disabled={isAddingItem || editingItemId !== null}
                    title="Edit Item"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    className="delete-item-button"
                    onClick={() => handleDeleteItem(item.id)}
                    title="Delete Item"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StopEditor; 