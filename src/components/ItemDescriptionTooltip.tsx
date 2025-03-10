import React from 'react';

interface ItemDescriptionTooltipProps {
  description: string;
  onClose: () => void;
}

/**
 * Tooltip for displaying item descriptions
 */
const ItemDescriptionTooltip: React.FC<ItemDescriptionTooltipProps> = ({
  description,
  onClose
}) => {
  return (
    <div className="item-description-tooltip" onClick={onClose}>
      <div className="item-description-content" onClick={(e) => e.stopPropagation()}>
        <p>{description}</p>
        <button className="btn btn-sm btn-primary mt-2" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ItemDescriptionTooltip; 