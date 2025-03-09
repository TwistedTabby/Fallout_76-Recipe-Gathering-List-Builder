import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Stop, Item, ItemType } from '../types/farmingTracker';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_ITEM_TYPES, ITEM_TYPES_REQUIRING_NAME, ITEM_TYPES_WITH_DEFAULT_NAME, ITEM_TYPES_WITHOUT_QUANTITY } from '../types/farmingTracker';

interface StopEditorProps {
  stop: Stop | null;
  onSave: (updatedStop: Stop, isAutoSave?: boolean) => void;
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
  const [showItemForm, setShowItemForm] = useState(true);
  
  // Reference to the name input field for auto-focus
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // Auto-focus the name field when the component mounts
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
      
      // If it's a new stop (default name), select all text to make it easy to replace
      if (editedStop.name === 'New Stop') {
        nameInputRef.current.select();
      }
    }
  }, []);

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedStop = { ...editedStop, name: e.target.value };
    setEditedStop(updatedStop);
    if (validationError) setValidationError(null);
    
    // Auto-save if name is not empty
    if (e.target.value.trim()) {
      onSave(updatedStop, true);
    }
  };

  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedStop = { ...editedStop, description: e.target.value };
    setEditedStop(updatedStop);
    onSave(updatedStop, true);
  };

  // Handle collect data change
  const handleCollectDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedStop = { ...editedStop, collectData: e.target.checked };
    setEditedStop(updatedStop);
    onSave(updatedStop, true);
  };

  // Reset new item form
  const resetNewItemForm = () => {
    setNewItemType(DEFAULT_ITEM_TYPES[0] as ItemType);
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemDescription('');
    setEditingItemId(null);
    if (validationError) setValidationError(null);
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
      quantity: ITEM_TYPES_WITHOUT_QUANTITY.includes(newItemType) ? 1 : newItemQuantity,
      collected: false,
      description: newItemDescription.trim()
    };

    // Add to items list and auto-save
    const updatedStop = {
      ...editedStop,
      items: [...editedStop.items, newItem]
    };
    
    setEditedStop(updatedStop);
    onSave(updatedStop, true);

    // Reset form but keep it open
    resetNewItemForm();
    setShowItemForm(true);
  };

  // Handle editing an item
  const handleEditItem = (itemId: string) => {
    const item = editedStop.items.find(item => item.id === itemId);
    if (!item) return;

    // Reset any validation errors
    if (validationError) setValidationError(null);

    // Set form values to match the item being edited
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

    // Update the item and auto-save
    const updatedItems = editedStop.items.map(item => 
      item.id === editingItemId
        ? {
            ...item,
            type: newItemType,
            name: ITEM_TYPES_REQUIRING_NAME.includes(newItemType) 
              ? newItemName.trim() 
              : ITEM_TYPES_WITH_DEFAULT_NAME.includes(newItemType)
                ? newItemType
                : newItemName.trim() || newItemType,
            quantity: ITEM_TYPES_WITHOUT_QUANTITY.includes(newItemType) ? 1 : newItemQuantity,
            description: newItemDescription.trim()
          }
        : item
    );
    
    const updatedStop = {
      ...editedStop,
      items: updatedItems
    };
    
    setEditedStop(updatedStop);
    onSave(updatedStop, true);

    // Reset form but keep it open
    resetNewItemForm();
    setShowItemForm(true);
  };

  // Handle deleting an item
  const handleDeleteItem = (itemId: string) => {
    const updatedStop = {
      ...editedStop,
      items: editedStop.items.filter(item => item.id !== itemId)
    };
    
    setEditedStop(updatedStop);
    onSave(updatedStop, true);
  };

  // Validate the stop
  const validateStop = () => {
    // Validate required fields
    if (!editedStop.name.trim()) {
      setValidationError('Stop name is required');
      return false;
    }
    return true;
  };

  // Handle final save and return to route editor
  const handleDone = () => {
    // Validate the stop
    if (!validateStop()) return;
    
    // Save the stop and return to route editor
    onSave(editedStop, false);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // CTRL+Enter to add/update item
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      if (editingItemId) {
        handleSaveEditedItem();
      } else {
        handleAddItem();
      }
    }
  };

  return (
    <div className="card route-editor">
      <div className="card-header route-editor-header">
        <h2>{editedStop.id ? 'Edit Stop' : 'Create Stop'}</h2>
        <div className="route-editor-actions">
          <button 
            className="btn btn-outline mr-2"
            onClick={onCancel}
            title="Cancel"
          >
            <FontAwesomeIcon icon={faTimes} /> Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleDone}
            title="Done"
          >
            <FontAwesomeIcon icon={faSave} /> Done
          </button>
        </div>
      </div>
      
      <div className="card-body">
        <div className="form-group">
          <label htmlFor="stop-name" className="form-label">Stop Name:</label>
          <input
            id="stop-name"
            type="text"
            className="form-control"
            value={editedStop.name}
            onChange={handleNameChange}
            onBlur={() => {
              if (!editedStop.name.trim()) {
                setValidationError('Stop name is required');
              }
            }}
            placeholder="Enter stop name"
            ref={nameInputRef}
          />
          {validationError && validationError.includes('Stop name') && (
            <div className="text-red-500 mt-1 text-sm">{validationError}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="stop-description" className="form-label">Notes:</label>
          <textarea
            id="stop-description"
            className="form-control"
            value={editedStop.description}
            onChange={handleDescriptionChange}
            rows={3}
            placeholder="Add any notes about this stop here..."
          />
        </div>
        
        <div className="form-group">
          <div className="flex items-center">
            <input
              id="collect-data"
              type="checkbox"
              className="mr-2"
              checked={editedStop.collectData}
              onChange={handleCollectDataChange}
            />
            <label htmlFor="collect-data" className="form-label mb-0">
              Collect inventory data at this stop
            </label>
          </div>
        </div>
        
        {editedStop.name === 'New Stop' && editedStop.items.length === 0 && (
          <div className="p-3 rounded-md mb-4" style={{ 
            backgroundColor: 'var(--secondary-accent)',
            color: 'var(--light-contrast)',
            opacity: 0.8
          }}>
            <p className="text-sm">
              <strong>Tip:</strong> Give this stop a meaningful name and add items that can be found here.
              You can add items using the form below.
            </p>
          </div>
        )}
        
        <div className="stops-section">
          <div className="stops-header">
            <h3>Items at this Stop</h3>
          </div>
          
          {/* Item Form - Only shown when adding a new item or editing an existing one */}
          {showItemForm || editingItemId ? (
            <div className={`add-item-form p-4 rounded-md mb-4 ${editingItemId ? 'bg-gray-50 border border-gray-200' : 'bg-gray-50'}`}>
              <h4 className="text-md font-semibold mb-2 flex justify-between items-center">
                {editingItemId ? (
                  <span className="px-2 py-1 rounded-md inline-flex items-center" style={{ 
                    backgroundColor: 'var(--secondary-accent)',
                    color: 'var(--light-contrast)'
                  }}>
                    <FontAwesomeIcon icon={faEdit} className="mr-1" /> Editing
                  </span>
                ) : (
                  <span>
                    <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add New Item
                  </span>
                )}
                
                <span className="text-sm text-gray-600">
                  <FontAwesomeIcon icon={faSave} className="mr-1" /> Tip: Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded">CTRL+Enter</kbd> to {editingItemId ? "update" : "add"}
                </span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ITEM_TYPES_WITHOUT_QUANTITY.includes(newItemType) ? (
                  // For items without quantity, stack type and description vertically in a single column
                  <div className="md:col-span-2">
                    <div className="form-group mb-4">
                      <label htmlFor="item-type" className="form-label">
                        {editingItemId ? "Item Type:" : "New Item Type:"}
                      </label>
                      <select
                        id="item-type"
                        value={newItemType}
                        onChange={(e) => setNewItemType(e.target.value as ItemType)}
                        className="form-control"
                        onKeyDown={handleKeyDown}
                      >
                        {DEFAULT_ITEM_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="item-description" className="form-label">Description:</label>
                      <input
                        id="item-description"
                        type="text"
                        className="form-control"
                        value={newItemDescription}
                        onChange={(e) => setNewItemDescription(e.target.value)}
                        placeholder="Optional description or location hint"
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                  </div>
                ) : (
                  // For items with quantity, keep the original grid layout
                  <>
                    <div className="form-group">
                      <label htmlFor="item-type" className="form-label">
                        {editingItemId ? "Item Type:" : "New Item Type:"}
                      </label>
                      <select
                        id="item-type"
                        value={newItemType}
                        onChange={(e) => setNewItemType(e.target.value as ItemType)}
                        className="form-control"
                        onKeyDown={handleKeyDown}
                      >
                        {DEFAULT_ITEM_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    {(ITEM_TYPES_REQUIRING_NAME.includes(newItemType) || !ITEM_TYPES_WITH_DEFAULT_NAME.includes(newItemType)) && (
                      <div className="form-group">
                        <label htmlFor="item-name" className="form-label">Item Name:</label>
                        <input
                          id="item-name"
                          type="text"
                          className={`form-control ${validationError && validationError.includes('Item name') ? 'border-red-500' : ''}`}
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="Enter item name"
                          onKeyDown={handleKeyDown}
                        />
                        {validationError && validationError.includes('Item name') && (
                          <div className="text-red-500 mt-1 text-sm">{validationError}</div>
                        )}
                      </div>
                    )}
                    
                    <div className="form-group">
                      <label htmlFor="item-quantity" className="form-label">Quantity:</label>
                      <input
                        id="item-quantity"
                        type="number"
                        className="form-control"
                        min="1"
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="item-description" className="form-label">Description:</label>
                      <input
                        id="item-description"
                        type="text"
                        className="form-control"
                        value={newItemDescription}
                        onChange={(e) => setNewItemDescription(e.target.value)}
                        placeholder="Optional description or location hint"
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="form-actions mt-4 flex justify-end">
                <button 
                  className="btn btn-outline mr-2"
                  onClick={() => {
                    resetNewItemForm();
                    setShowItemForm(false);
                  }}
                >
                  Cancel
                </button>
                {editingItemId ? (
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      handleSaveEditedItem();
                      setShowItemForm(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-1" /> Update
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      handleAddItem();
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add to Stop
                  </button>
                )}
              </div>
            </div>
          ) : null}
          
          {/* Items List */}
          {editedStop.items.length > 0 ? (
            <ul className="stops-list">
              {editedStop.items.map(item => (
                <li key={item.id} className="stop-item">
                  <div className="stop-info">
                    <div className="stop-name">{item.name}</div>
                    <div className="stop-description">
                      <span className="item-type">{item.type}</span>
                      {!ITEM_TYPES_WITHOUT_QUANTITY.includes(item.type) && item.quantity > 1 && 
                        <span className="item-quantity ml-2">× {item.quantity}</span>
                      }
                      {item.description && <span className="item-description ml-2">- {item.description}</span>}
                    </div>
                  </div>
                  <div className="stop-actions">
                    <button 
                      className="btn-icon-sm edit-button"
                      onClick={() => {
                        handleEditItem(item.id);
                        setShowItemForm(true);
                      }}
                      title="Edit Item"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="btn-icon-sm delete-button"
                      onClick={() => handleDeleteItem(item.id)}
                      title="Delete Item"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            !showItemForm && !editingItemId ? (
              <div className="p-4 text-center bg-gray-50 rounded-lg">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowItemForm(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add Item
                </button>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

export default StopEditor; 