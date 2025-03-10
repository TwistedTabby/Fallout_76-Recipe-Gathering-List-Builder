import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheck } from '@fortawesome/free-solid-svg-icons';
import { MAGAZINE_TITLES, generateMagazineIssues, BOBBLEHEADS } from '../constants/collectibles';

interface CollectibleSelectorProps {
  type: 'magazine' | 'bobblehead';
  onSelect: (value: string, issueNumber?: number) => void;
  onCancel: () => void;
}

/**
 * Component for selecting magazines or bobbleheads with searchable dropdowns
 */
const CollectibleSelector: React.FC<CollectibleSelectorProps> = ({
  type,
  onSelect,
  onCancel
}) => {
  // State for magazine selection
  const [selectedMagazine, setSelectedMagazine] = useState<string>('');
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [availableIssues, setAvailableIssues] = useState<number[]>([]);
  
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>(
    type === 'magazine' ? MAGAZINE_TITLES : BOBBLEHEADS
  );

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
    } else {
      // For bobbleheads, complete the selection immediately
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
    <div className="collectible-selector-overlay">
      <div className="collectible-selector-dialog">
        <div className="collectible-selector-title">
          {type === 'magazine' ? 'Select Magazine' : 'Select Bobblehead'}
        </div>
        
        <div className="collectible-selector-content">
          {/* Search input */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder={`Search ${type === 'magazine' ? 'magazines' : 'bobbleheads'}...`}
                value={searchTerm}
                onChange={handleSearchChange}
                autoFocus
              />
            </div>
          </div>
          
          {/* Options list */}
          <div className="options-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <button
                  key={option}
                  className={`option-button ${
                    (type === 'magazine' && selectedMagazine === option) ? 'selected' : ''
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                  {(type === 'magazine' && selectedMagazine === option) && (
                    <FontAwesomeIcon icon={faCheck} className="selected-icon" />
                  )}
                </button>
              ))
            ) : (
              <div className="no-results">No matches found</div>
            )}
          </div>
          
          {/* Issue selection for magazines */}
          {type === 'magazine' && selectedMagazine && selectedMagazine !== 'Holotape' && (
            <div className="issue-selection">
              <div className="issue-selection-title">Select Issue Number:</div>
              <div className="issue-buttons">
                {availableIssues.map(issue => (
                  <button
                    key={issue}
                    className={`issue-button ${selectedIssue === issue ? 'selected' : ''}`}
                    onClick={() => handleIssueSelect(issue)}
                  >
                    {issue}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="collectible-selector-buttons">
          <button 
            className="collectible-selector-button collectible-selector-button-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          {type === 'magazine' && selectedMagazine && selectedMagazine !== 'Holotape' && (
            <button 
              className="collectible-selector-button collectible-selector-button-confirm"
              onClick={() => selectedIssue && onSelect(selectedMagazine, selectedIssue)}
              disabled={!selectedIssue}
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectibleSelector; 