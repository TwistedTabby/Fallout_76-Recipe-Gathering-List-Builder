import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { Item } from '../types/farmingTracker';
import CollectibleSelector from './CollectibleSelector';

interface ItemConfirmationDialogProps {
  item: Item;
  confirmationType: 'bobblehead' | 'magazine' | 'consumable' | 'event' | 'spawned' | null;
  onConfirm: (quantity?: number, answer?: 'yes' | 'no', collectibleDetails?: { name: string, issueNumber?: number }) => void;
  onCancel: () => void;
}

/**
 * Dialog for confirming item collection
 */
const ItemConfirmationDialog: React.FC<ItemConfirmationDialogProps> = ({
  item,
  confirmationType,
  onConfirm,
  onCancel
}) => {
  const [quantityCollected, setQuantityCollected] = useState<number>(item.quantity || 1);
  const [showCollectibleSelector, setShowCollectibleSelector] = useState<boolean>(false);

  const handleConfirm = () => {
    if (confirmationType === 'consumable') {
      onConfirm(quantityCollected);
    } else if (confirmationType === 'bobblehead' || confirmationType === 'magazine') {
      // For bobbleheads and magazines, show the collectible selector
      setShowCollectibleSelector(true);
    } else {
      onConfirm();
    }
  };

  const handleYes = () => {
    if (confirmationType === 'bobblehead' || confirmationType === 'magazine') {
      // For bobbleheads and magazines, show the collectible selector
      setShowCollectibleSelector(true);
    } else {
      onConfirm(undefined, 'yes');
    }
  };

  const handleNo = () => {
    onConfirm(undefined, 'no');
  };

  const handleCollectibleSelect = (value: string, issueNumber?: number) => {
    onConfirm(undefined, 'yes', { name: value, issueNumber });
    setShowCollectibleSelector(false);
  };

  const handleCollectibleCancel = () => {
    setShowCollectibleSelector(false);
  };

  // If showing collectible selector, render it instead of the confirmation dialog
  if (showCollectibleSelector) {
    return (
      <CollectibleSelector
        type={confirmationType as 'bobblehead' | 'magazine'}
        onSelect={handleCollectibleSelect}
        onCancel={handleCollectibleCancel}
        itemName={item.name}
      />
    );
  }

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <div className="confirm-dialog-title">
          {confirmationType === 'bobblehead' && 'Confirm Bobblehead Collection'}
          {confirmationType === 'magazine' && 'Confirm Magazine Collection'}
          {confirmationType === 'consumable' && 'Specify Quantity Collected'}
          {confirmationType === 'event' && 'Confirm Event Completion'}
          {confirmationType === 'spawned' && 'Confirm Item Spawn'}
        </div>
        
        <div className="confirm-dialog-content">
          {confirmationType === 'bobblehead' && (
            <>
              <p>Did you collect a bobblehead?</p>
              {item.description && (
                <div className="item-description-box">
                  <p>{item.description}</p>
                </div>
              )}
            </>
          )}
          {confirmationType === 'magazine' && (
            <>
              <p>Did you collect a magazine?</p>
              {item.description && (
                <div className="item-description-box">
                  <p>{item.description}</p>
                </div>
              )}
            </>
          )}
          {confirmationType === 'consumable' && (
            <div className="quantity-selector">
              <p>How many {item.name} did you collect? (0 is valid)</p>
              <div className="quantity-controls">
                <button 
                  className="btn-icon-sm"
                  onClick={() => setQuantityCollected(Math.max(0, quantityCollected - 1))}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span className="quantity-value">{quantityCollected}</span>
                <button 
                  className="btn-icon-sm"
                  onClick={() => setQuantityCollected(quantityCollected + 1)}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
              {item.description && (
                <div className="item-description-box mt-3">
                  <p>{item.description}</p>
                </div>
              )}
            </div>
          )}
          {confirmationType === 'event' && (
            <>
              <p>Did the event "{item.name}" occur?</p>
              {item.description && (
                <div className="item-description-box">
                  <p>{item.description}</p>
                </div>
              )}
            </>
          )}
          {confirmationType === 'spawned' && (
            <>
              <p>Did "{item.name}" spawn?</p>
              {item.description && (
                <div className="item-description-box">
                  <p>{item.description}</p>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="confirm-dialog-buttons">
          {confirmationType === 'consumable' ? (
            <>
              <button 
                className="confirm-dialog-button confirm-dialog-button-cancel"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button 
                className="confirm-dialog-button confirm-dialog-button-confirm"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </>
          ) : (
            <>
              <button 
                className="confirm-dialog-button confirm-dialog-button-cancel"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button 
                className="confirm-dialog-button confirm-dialog-button-no"
                onClick={handleNo}
              >
                No
              </button>
              <button 
                className="confirm-dialog-button confirm-dialog-button-yes"
                onClick={handleYes}
              >
                Yes
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemConfirmationDialog; 