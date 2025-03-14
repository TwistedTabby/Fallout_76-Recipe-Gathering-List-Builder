import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheck, faTag, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { MAGAZINE_TITLES, generateMagazineIssues, BOBBLEHEADS } from '../constants/collectibles';

interface CollectibleSelectorProps {
  type: 'magazine' | 'bobblehead';
  onSelect: (value: string, issueNumber?: number) => void;
  onCancel: () => void;
  itemName?: string; // Optional item name for the "Just mark as found" option
}

/**
 * Component for selecting magazines or bobbleheads with searchable dropdowns
 */
const CollectibleSelector: React.FC<CollectibleSelectorProps> = ({
  type,
  onSelect,
  onCancel,
  itemName
}) => {
  // State for magazine selection
  const [selectedMagazine, setSelectedMagazine] = useState<string>('');
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [availableIssues, setAvailableIssues] = useState<number[]>([]);
  
  // State for bobblehead selection
  const [selectedBobblehead, setSelectedBobblehead] = useState<string>('');
  
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>(
    type === 'magazine' ? MAGAZINE_TITLES : BOBBLEHEADS
  );

  // Handle "Just mark as found" option
  const handleJustMarkAsFound = () => {
    // Use the provided item name or a generic name based on the type
    const genericName = itemName || (type === 'magazine' ? 'Magazine' : 'Bobblehead');
    onSelect(genericName);
  };

  // Update available issues when magazine selection changes
  useEffect(() => {
    if (type === 'magazine' && selectedMagazine) {
      // Special case for holotapes
      if (selectedMagazine === 'Holotape') {
        setAvailableIssues([]);
        setSelectedIssue(null);
      } else {
        const issues = generateMagazineIssues(selectedMagazine);
        setAvailableIssues(issues);
        setSelectedIssue(null);
      }
    }
  }, [selectedMagazine, type]);

  // Filter options based on search term
  useEffect(() => {
    const options = type === 'magazine' ? MAGAZINE_TITLES : BOBBLEHEADS;
    if (!searchTerm) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option => 
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, type]);

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    if (type === 'magazine') {
      setSelectedMagazine(option);
      // If it's a holotape, we can complete the selection immediately
      if (option === 'Holotape') {
        onSelect(option);
      }
    } else if (type === 'bobblehead') {
      // For bobbleheads, set the selected bobblehead
      setSelectedBobblehead(option);
      // Complete the selection immediately
      onSelect(option);
    }
  };

  // Handle issue selection for magazines
  const handleIssueSelect = (issue: number) => {
    setSelectedIssue(issue);
    onSelect(selectedMagazine, issue);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="collectible-selector-overlay fixed inset-0 flex items-center justify-center z-50">
      <div className="collectible-selector-dialog w-full max-w-md flex flex-col bg-background rounded-lg shadow-xl overflow-hidden" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="collectible-selector-title py-3 px-4 bg-mainAccent text-darkContrast font-semibold text-lg">
          {type === 'magazine' ? 'Select Magazine' : 'Select Bobblehead'}
        </div>
        
        {/* Main content area */}
        <div className="bg-secondary-accent text-lightContrast p-4 flex flex-col overflow-hidden">
          {/* "Just mark as found" option */}
          <div className="just-mark-option mb-4 text-center">
            <button
              className="just-mark-button bg-secondary-accent hover:bg-activeButtonBg text-lightContrast font-medium py-3 px-4 rounded border border-white border-opacity-20 w-full flex items-center justify-center transition-colors duration-200"
              onClick={handleJustMarkAsFound}
            >
              <FontAwesomeIcon icon={faTag} className="mr-2" />
              Just mark as found
              <div className="relative ml-2 group">
                <span 
                  className="w-5 h-5 rounded-full bg-mainAccent text-darkContrast flex items-center justify-center cursor-help"
                  aria-label="More information about just marking as found"
                >
                  <FontAwesomeIcon icon={faQuestionCircle} className="text-xs" />
                </span>
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-darkContrast text-lightContrast text-xs rounded p-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-10">
                  Select this if you don't want to specify which {type} you found
                  <div className="absolute bottom-0 right-3 transform translate-y-1/2 rotate-45 w-2 h-2 bg-darkContrast"></div>
                </div>
              </div>
            </button>
          </div>
          
          <div className="divider my-1 flex items-center justify-center">
            <div className="border-t border-white opacity-30 w-1/3"></div>
            <span className="mx-4 text-lightContrast opacity-80 text-sm">OR</span>
            <div className="border-t border-white opacity-30 w-1/3"></div>
          </div>
          
          {/* Search input */}
          <div className="search-container mb-3">
            
          </div>
          
          {/* Options list - with fixed height and scrollable */}
          <div 
            className="options-list overflow-y-auto" 
            style={{ 
              maxHeight: type === 'magazine' ? '30vh' : '40vh',
              minHeight: '150px'
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <button
                  key={option}
                  className={`option-button w-full text-left py-3 px-4 mb-1 rounded transition-colors duration-150 flex justify-between items-center ${
                    (type === 'magazine' && selectedMagazine === option) || 
                    (type === 'bobblehead' && selectedBobblehead === option) 
                      ? 'bg-activeButtonBg text-lightContrast' 
                      : 'bg-lightContrast bg-opacity-10 text-lightContrast hover:bg-opacity-20'
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                  {((type === 'magazine' && selectedMagazine === option) || 
                    (type === 'bobblehead' && selectedBobblehead === option)) && (
                    <FontAwesomeIcon icon={faCheck} className="selected-icon" />
                  )}
                </button>
              ))
            ) : (
              <div className="no-results text-center py-4 text-lightContrast opacity-70">No matches found</div>
            )}
          </div>
          
          {/* Issue selection for magazines */}
          {type === 'magazine' && selectedMagazine && selectedMagazine !== 'Holotape' && (
            <div className="issue-selection mt-4 border-t border-white border-opacity-20 pt-4">
              <div className="issue-selection-title text-lightContrast mb-2 font-medium">Select Issue Number:</div>
              <div className="issue-buttons flex flex-wrap gap-2">
                {availableIssues.map(issue => (
                  <button
                    key={issue}
                    className={`issue-button px-3 py-2 rounded ${
                      selectedIssue === issue 
                        ? 'bg-activeButtonBg text-lightContrast' 
                        : 'bg-lightContrast bg-opacity-10 text-lightContrast hover:bg-opacity-20'
                    }`}
                    onClick={() => handleIssueSelect(issue)}
                  >
                    {issue}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="collectible-selector-buttons p-4 flex justify-end space-x-3 bg-mainAccent">
          <button 
            className="collectible-selector-button-cancel px-6 py-2 rounded bg-darkContrast bg-opacity-20 text-darkContrast hover:bg-opacity-30 transition-colors duration-150 font-medium"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectibleSelector; 