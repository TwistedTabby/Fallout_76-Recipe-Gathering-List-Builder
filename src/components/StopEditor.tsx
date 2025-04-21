import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faPlus, faEdit, faTrash, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
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
    name: stop?.name || 'New Stop',
    description: stop?.description || '',
    items: stop?.items || []
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
  // Reference to the item type select for refocusing after add/edit
  const itemTypeSelectRef = useRef<HTMLSelectElement>(null);
  
  // Auto-focus the name field when the component mounts
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
      
      // If it's a new stop (default name), select all text to make it easy to replace
      if (editedStop.name === 'New Stop') {
        nameInputRef.current.select();
      }
    }
    
    // Show the item form by default if there are no items
    if (editedStop.items.length === 0) {
      setShowItemForm(true);
    }
  }, []);

  // Clear name field when switching from a default name type to a non-default name type
  useEffect(() => {
    // If switching from a default name type to a non-default name type
    // and the name is currently set to the previous type, clear it
    if (!ITEM_TYPES_WITH_DEFAULT_NAME.includes(newItemType) && 
        newItemName && ITEM_TYPES_WITH_DEFAULT_NAME.some(type => type === newItemName)) {
      setNewItemName('');
    }
  }, [newItemType]);

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
    // Validate item name for types that require it or types that don't have default names
    if ((ITEM_TYPES_REQUIRING_NAME.includes(newItemType) || !ITEM_TYPES_WITH_DEFAULT_NAME.includes(newItemType)) && !newItemName.trim()) {
      setValidationError('Item name is required for this type');
      return;
    }

    // Create new item
    const newItem: Item = {
      id: uuidv4(),
      type: newItemType,
      name: ITEM_TYPES_WITH_DEFAULT_NAME.includes(newItemType)
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

    // Validate item name for types that require it or types that don't have default names
    if ((ITEM_TYPES_REQUIRING_NAME.includes(newItemType) || !ITEM_TYPES_WITH_DEFAULT_NAME.includes(newItemType)) && !newItemName.trim()) {
      setValidationError('Item name is required for this type');
      return;
    }

    // Update the item and auto-save
    const updatedItems = editedStop.items.map(item => 
      item.id === editingItemId
        ? {
            ...item,
            type: newItemType,
            name: ITEM_TYPES_WITH_DEFAULT_NAME.includes(newItemType)
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

  // Handle moving an item up in the list
  const handleMoveItemUp = (index: number) => {
    if (index === 0) return; // Already at the top
    
    const updatedItems = [...editedStop.items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[index - 1];
    updatedItems[index - 1] = temp;
    
    const updatedStop = {
      ...editedStop,
      items: updatedItems
    };
    
    setEditedStop(updatedStop);
    onSave(updatedStop, true);
  };

  // Handle moving an item down in the list
  const handleMoveItemDown = (index: number) => {
    if (index === editedStop.items.length - 1) return; // Already at the bottom
    
    const updatedItems = [...editedStop.items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[index + 1];
    updatedItems[index + 1] = temp;
    
    const updatedStop = {
      ...editedStop,
      items: updatedItems
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
      
      // Set focus back to the item type select after a short delay
      // to allow the form to reset
      setTimeout(() => {
        if (itemTypeSelectRef.current) {
          itemTypeSelectRef.current.focus();
        }
      }, 50);
    }
  };

  return (
    <div className="card route-editor-container bg-secondary-accent">
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
            className={`route-editor-field form-control ${validationError && validationError.includes('Stop name') ? 'validation-error' : ''}`}
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
            <div className="validation-error mt-1 text-sm">{validationError}</div>
          )}
        </div>
        
        <div className="form-row md:grid-cols-2">
          <div className="form-group">
            <label htmlFor="stop-description" className="form-label">Notes:</label>
            <textarea
              id="stop-description"
              className="form-control route-editor-field"
              value={editedStop.description}
              onChange={handleDescriptionChange}
              rows={3}
              placeholder="Add any notes about this stop here..."
              style={{height: "100%"}}
            />
          </div>
        </div>
        
        {editedStop.name === 'New Stop' && editedStop.items.length === 0 && (
          <div className="p-3 rounded-md mb-4 bg-secondary-accent">
            <p className="text-sm">
              <strong>Tip:</strong> Give this stop a meaningful name and add items that can be found here.
              You can add items using the form below.
            </p>
          </div>
        )}
        
        <div className="stops-section">
          <div className="stops-header">
            <h3 className="text-lg sm:text-xl">Items at this Stop</h3>
            {!showItemForm && !editingItemId && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowItemForm(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add Item
              </button>
            )}
          </div>
          
          {/* Item Form - Only shown when adding a new item or editing an existing one */}
          {showItemForm || editingItemId ? (
            <div className={`add-item-form p-3 sm:p-4 rounded-md mb-3 sm:mb-4 ${editingItemId ? 'border border-secondary-accent' : ''}`}>
              <h4 className="text-md font-semibold mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                {editingItemId ? (
                  <span className="px-2 py-1 rounded-md inline-flex items-center bg-secondary-accent text-light-contrast mb-2 sm:mb-0">
                    <FontAwesomeIcon icon={faEdit} className="mr-1" /> Editing
                  </span>
                ) : (
                  <span className="mb-2 sm:mb-0">
                    <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add New Item
                  </span>
                )}
                
                <span className="hidden sm:inline-block text-sm text-dark-contrast opacity-80">
                  <FontAwesomeIcon icon={faSave} className="mr-1" /> Tip: Press <kbd className="px-1 py-0.5 rounded bg-secondary-accent text-light-contrast border border-secondary-accent">CTRL+Enter</kbd> to {editingItemId ? "update" : "add"}
                </span>
              </h4>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {ITEM_TYPES_WITHOUT_QUANTITY.includes(newItemType) && !ITEM_TYPES_REQUIRING_NAME.includes(newItemType) ? (
                  // For items without quantity AND without required name, stack type and description vertically in a single column
                  <div>
                    <div className="form-group mb-3 sm:mb-4">
                      <label htmlFor="item-type" className="form-label">
                        {editingItemId ? "Item Type:" : "New Item Type:"}
                      </label>
                      <select
                        id="item-type"
                        value={newItemType}
                        onChange={(e) => setNewItemType(e.target.value as ItemType)}
                        className="form-control route-editor-field h-10 sm:h-auto"
                        onKeyDown={handleKeyDown}
                        ref={itemTypeSelectRef}
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
                        className="form-control route-editor-field h-10 sm:h-auto"
                        value={newItemDescription}
                        onChange={(e) => setNewItemDescription(e.target.value)}
                        placeholder="Optional description or location hint"
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                  </div>
                ) : (
                  // For items with quantity OR required name, use a single column on mobile, two-column on larger screens
                  <>
                    <div className="form-group mb-3 sm:mb-0">
                      <label htmlFor="item-type" className="form-label">
                        {editingItemId ? "Item Type:" : "New Item Type:"}
                      </label>
                      <select
                        id="item-type"
                        value={newItemType}
                        onChange={(e) => setNewItemType(e.target.value as ItemType)}
                        className="form-control route-editor-field h-10 sm:h-auto"
                        onKeyDown={handleKeyDown}
                        ref={itemTypeSelectRef}
                      >
                        {DEFAULT_ITEM_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    {(ITEM_TYPES_REQUIRING_NAME.includes(newItemType) || !ITEM_TYPES_WITH_DEFAULT_NAME.includes(newItemType)) && (
                      <div className="form-group mb-3 sm:mb-0">
                        <label htmlFor="item-name" className="form-label">Item Name:</label>
                        <input
                          id="item-name"
                          type="text"
                          className={`form-control route-editor-field h-10 sm:h-auto ${validationError && validationError.includes('Item name') ? 'validation-error' : ''}`}
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="Enter item name"
                          onKeyDown={handleKeyDown}
                        />
                        {validationError && validationError.includes('Item name') && (
                          <div className="validation-error mt-1 text-sm">{validationError}</div>
                        )}
                      </div>
                    )}
                    
                    {!ITEM_TYPES_WITHOUT_QUANTITY.includes(newItemType) ? (
                      <div className="form-group">
                        <label htmlFor="item-quantity" className="form-label">Quantity:</label>
                        <input
                          id="item-quantity"
                          type="number"
                          className="form-control route-editor-field h-10 sm:h-auto"
                          min="1"
                          value={newItemQuantity}
                          onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                          onKeyDown={handleKeyDown}
                        />
                      </div>
                    ) : (
                      // If no quantity field, add an empty div to maintain the grid layout on larger screens
                      <div className="form-group hidden sm:block">
                        <label className="form-label">&nbsp;</label>
                        <div className="h-10">&nbsp;</div>
                      </div>
                    )}
                    
                    <div className="form-group sm:col-span-2">
                      <label htmlFor="item-description" className="form-label">Description:</label>
                      <input
                        id="item-description"
                        type="text"
                        className="form-control route-editor-field h-10 sm:h-auto"
                        value={newItemDescription}
                        onChange={(e) => setNewItemDescription(e.target.value)}
                        placeholder="Optional description or location hint"
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="form-actions mt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
                {editingItemId ? (
                  <>
                    <button 
                      className="btn btn-danger w-full sm:w-auto order-1 sm:order-none"
                      onClick={() => setEditingItemId(null)}
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel Edit
                    </button>
                    <button 
                      className="btn btn-primary w-full sm:w-auto order-0 sm:order-none mb-2 sm:mb-0"
                      onClick={handleSaveEditedItem}
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-1" /> Update Item
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="btn btn-outline w-full sm:w-auto order-1 sm:order-none"
                      onClick={() => {
                        resetNewItemForm();
                        setShowItemForm(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                    </button>
                    <button 
                      className="btn btn-primary w-full sm:w-auto order-0 sm:order-none mb-2 sm:mb-0"
                      onClick={handleAddItem}
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add to Stop
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : null}
          
          {/* Items List */}
          {editedStop.items.length > 0 ? (
            <ul className="stops-list mt-2">
              {editedStop.items.map((item, index) => (
                <li key={item.id} className="stop-item p-2 sm:p-3">
                  <div className="stop-info flex-1">
                    {!ITEM_TYPES_WITH_DEFAULT_NAME.includes(item.type) && (
                      <div className="stop-name font-medium text-base">{item.name}</div>
                    )}
                    <div className="stop-description text-sm">
                      <span className="item-type font-medium">{item.type}</span>
                      {!ITEM_TYPES_WITHOUT_QUANTITY.includes(item.type) && item.quantity > 1 && 
                        <span className="item-quantity ml-2">× {item.quantity}</span>
                      }
                      {item.description && <span className="item-description ml-2">{item.description}</span>}
                    </div>
                  </div>
                  <div className="stop-actions flex gap-1 sm:gap-2">
                    <button 
                      className="btn-icon-sm btn-primary reorder-button"
                      onClick={() => handleMoveItemUp(index)}
                      disabled={index === 0}
                      aria-label="Reorder: Move item up"
                      title="Move Up"
                    >
                      <FontAwesomeIcon icon={faArrowUp} />
                    </button>
                    <button 
                      className="btn-icon-sm btn-secondary reorder-button"
                      onClick={() => handleMoveItemDown(index)}
                      disabled={index === editedStop.items.length - 1}
                      aria-label="Reorder: Move item down"
                      title="Move Down"
                    >
                      <FontAwesomeIcon icon={faArrowDown} />
                    </button>
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
              <div className="no-stops-message p-4 text-center rounded-lg">
                <p className="text-sm mb-3">No items added to this stop yet.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowItemForm(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add First Item
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