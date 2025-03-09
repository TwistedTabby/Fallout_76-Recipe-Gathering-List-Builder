import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Stop, Item, ItemType } from '../types/farmingTracker';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_ITEM_TYPES, ITEM_TYPES_REQUIRING_NAME, ITEM_TYPES_WITH_DEFAULT_NAME } from '../types/farmingTracker';

interface StopEditorProps {
  stop: Stop | null;
  onSave: (updatedStop: Stop) => void;
  onCancel: () => void;
}

/**
 * Component for editing a stop and its items
 */
const StopEditor: React.FC<StopEditorProps> = ({ stop, onSave, onCancel }) => {
  // Initialize with stop data or empty values
  const [editedStop, setEditedStop] = useState<Stop>({
    id: stop?.id || '',
    name: stop?.name || '',
    description: stop?.description || '',
    items: stop?.items || [],
    collectData: stop?.collectData || false
  });
  
  const [validationError, setValidationError] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<ItemType>(DEFAULT_ITEM_TYPES[0] as ItemType);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemDescription, setNewItemDescription] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedStop(prev => ({ ...prev, name: e.target.value }));
    if (validationError) setValidationError(null);
  };

  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedStop(prev => ({ ...prev, description: e.target.value }));
  };

  // Handle collect data change
  const handleCollectDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedStop(prev => ({ ...prev, collectData: e.target.checked }));
  };

  // Reset new item form
  const resetNewItemForm = () => {
    setNewItemType(DEFAULT_ITEM_TYPES[0] as ItemType);
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemDescription('');
    setEditingItemId(null);
  };

  // Handle adding a new item
  const handleAddItem = () => {
    // Validate item name for types that require it
    if (ITEM_TYPES_REQUIRING_NAME.includes(newItemType) && !newItemName.trim()) {
      setValidationError('Item name is required for this type');
      return;
    }

    // Create new item
    const newItem: Item = {
      id: uuidv4(),
      type: newItemType,
      name: ITEM_TYPES_REQUIRING_NAME.includes(newItemType) 
        ? newItemName.trim() 
        : ITEM_TYPES_WITH_DEFAULT_NAME.includes(newItemType)
          ? newItemType
          : newItemName.trim() || newItemType,
      quantity: newItemQuantity,
      collected: false,
      description: newItemDescription.trim()
    };

    // Add to items list
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
    if (!item) return;

    setNewItemType(item.type as ItemType);
    setNewItemName(item.name || '');
    setNewItemQuantity(item.quantity || 1);
    setNewItemDescription(item.description || '');
    setEditingItemId(itemId);
  };

  // Handle saving an edited item
  const handleSaveEditedItem = () => {
    if (!editingItemId) return;

    // Validate item name for types that require it
    if (ITEM_TYPES_REQUIRING_NAME.includes(newItemType) && !newItemName.trim()) {
      setValidationError('Item name is required for this type');
      return;
    }

    // Update the item
    setEditedStop(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === editingItemId
          ? {
              ...item,
              type: newItemType,
              name: ITEM_TYPES_REQUIRING_NAME.includes(newItemType) 
                ? newItemName.trim() 
                : ITEM_TYPES_WITH_DEFAULT_NAME.includes(newItemType)
                  ? newItemType
                  : newItemName.trim() || newItemType,
              quantity: newItemQuantity,
              description: newItemDescription.trim()
            }
          : item
      )
    }));

    // Reset form
    resetNewItemForm();
  };

  // Handle deleting an item
  const handleDeleteItem = (itemId: string) => {
    setEditedStop(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // Handle saving the stop
  const handleSave = () => {
    // Validate required fields
    if (!editedStop.name.trim()) {
      setValidationError('Stop name is required');
      return;
    }

    onSave(editedStop);
  };

  return (
    <div className="stop-editor">
      <div className="stop-editor-header">
        <h2>{editedStop.id ? 'Edit Stop' : 'Create Stop'}</h2>
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
            className={validationError && validationError.includes('Stop name') ? 'error' : ''}
          />
          {validationError && validationError.includes('Stop name') && (
            <div className="error-message">{validationError}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="stop-description">Notes:</label>
          <textarea
            id="stop-description"
            value={editedStop.description}
            onChange={handleDescriptionChange}
            rows={3}
          />
        </div>
        
        <div className="form-group checkbox-group">
          <label htmlFor="collect-data">
            <input
              id="collect-data"
              type="checkbox"
              checked={editedStop.collectData}
              onChange={handleCollectDataChange}
            />
            Collect inventory data at this stop
          </label>
        </div>
      </div>
      
      <div className="items-section">
        <h3>Items</h3>
        
        <div className="add-item-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="item-type">Item Type:</label>
              <select
                id="item-type"
                value={newItemType}
                onChange={(e) => setNewItemType(e.target.value as ItemType)}
              >
                {DEFAULT_ITEM_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {(ITEM_TYPES_REQUIRING_NAME.includes(newItemType) || !ITEM_TYPES_WITH_DEFAULT_NAME.includes(newItemType)) && (
              <div className="form-group">
                <label htmlFor="item-name">Item Name:</label>
                <input
                  id="item-name"
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Enter item name"
                  className={validationError && validationError.includes('Item name') ? 'error' : ''}
                />
                {validationError && validationError.includes('Item name') && (
                  <div className="error-message">{validationError}</div>
                )}
              </div>
            )}
            
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
          </div>
          
          <div className="form-group">
            <label htmlFor="item-description">Description:</label>
            <input
              id="item-description"
              type="text"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              placeholder="Optional description or location hint"
            />
          </div>
          
          <div className="add-item-actions">
            {editingItemId ? (
              <button 
                className="save-item-button"
                onClick={handleSaveEditedItem}
              >
                <FontAwesomeIcon icon={faSave} /> Update Item
              </button>
            ) : (
              <button 
                className="add-item-button"
                onClick={handleAddItem}
                disabled={ITEM_TYPES_REQUIRING_NAME.includes(newItemType) && !newItemName.trim()}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Item
              </button>
            )}
            
            {editingItemId && (
              <button 
                className="cancel-edit-button"
                onClick={resetNewItemForm}
              >
                <FontAwesomeIcon icon={faTimes} /> Cancel Edit
              </button>
            )}
          </div>
        </div>
        
        {editedStop.items.length === 0 ? (
          <div className="no-items-message">
            <p>No items added yet. Add items to this stop using the form above.</p>
          </div>
        ) : (
          <ul className="items-list">
            {editedStop.items.map(item => (
              <li key={item.id} className="item">
                <div className="item-info">
                  <div className="item-type-badge">{item.type}</div>
                  <div className="item-name">{item.name}</div>
                  {item.quantity > 1 && (
                    <div className="item-quantity">x{item.quantity}</div>
                  )}
                  {item.description && (
                    <div className="item-description">{item.description}</div>
                  )}
                </div>
                <div className="item-actions">
                  <button 
                    className="edit-item-button"
                    onClick={() => handleEditItem(item.id)}
                    title="Edit Item"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    className="delete-item-button"
                    onClick={() => handleDeleteItem(item.id)}
                    title="Delete Item"
                  >
                    <FontAwesomeIcon icon={faTrash} />
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