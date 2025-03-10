import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CollectibleSelector from '../components/CollectibleSelector';
import { MAGAZINE_TITLES, BOBBLEHEADS } from '../constants/collectibles';

describe('CollectibleSelector', () => {
  const mockOnSelect = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders magazine selector correctly', () => {
    render(
      <CollectibleSelector 
        type="magazine" 
        onSelect={mockOnSelect} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByText('Select Magazine')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search magazines...')).toBeInTheDocument();
    
    // Check that magazine options are rendered
    MAGAZINE_TITLES.forEach(magazine => {
      expect(screen.getByText(magazine)).toBeInTheDocument();
    });
  });

  test('renders bobblehead selector correctly', () => {
    render(
      <CollectibleSelector 
        type="bobblehead" 
        onSelect={mockOnSelect} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByText('Select Bobblehead')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search bobbleheads...')).toBeInTheDocument();
    
    // Check that bobblehead options are rendered
    BOBBLEHEADS.forEach(bobblehead => {
      expect(screen.getByText(bobblehead)).toBeInTheDocument();
    });
  });

  test('search functionality filters options correctly', () => {
    render(
      <CollectibleSelector 
        type="magazine" 
        onSelect={mockOnSelect} 
        onCancel={mockOnCancel} 
      />
    );

    const searchInput = screen.getByPlaceholderText('Search magazines...');
    fireEvent.change(searchInput, { target: { value: 'Tesla' } });
    
    // Should only show Tesla Science Magazine
    expect(screen.getByText('Tesla Science Magazine')).toBeInTheDocument();
    expect(screen.queryByText('Backwoodsman')).not.toBeInTheDocument();
  });

  test('selecting a magazine shows issue numbers', () => {
    render(
      <CollectibleSelector 
        type="magazine" 
        onSelect={mockOnSelect} 
        onCancel={mockOnCancel} 
      />
    );

    // Click on Tesla Science Magazine
    fireEvent.click(screen.getByText('Tesla Science Magazine'));
    
    // Should show issue selection
    expect(screen.getByText('Select Issue Number:')).toBeInTheDocument();
    
    // Should show 9 issues for Tesla Science Magazine
    for (let i = 1; i <= 9; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  test('selecting a holotape immediately calls onSelect', () => {
    render(
      <CollectibleSelector 
        type="magazine" 
        onSelect={mockOnSelect} 
        onCancel={mockOnCancel} 
      />
    );

    // Click on Holotape
    fireEvent.click(screen.getByText('Holotape'));
    
    // Should call onSelect immediately
    expect(mockOnSelect).toHaveBeenCalledWith('Holotape');
  });

  test('selecting a bobblehead immediately calls onSelect', () => {
    render(
      <CollectibleSelector 
        type="bobblehead" 
        onSelect={mockOnSelect} 
        onCancel={mockOnCancel} 
      />
    );

    // Click on a bobblehead
    fireEvent.click(screen.getByText('Bobblehead: Strength'));
    
    // Should call onSelect immediately
    expect(mockOnSelect).toHaveBeenCalledWith('Bobblehead: Strength');
  });

  test('selecting a magazine and issue calls onSelect with both values', () => {
    render(
      <CollectibleSelector 
        type="magazine" 
        onSelect={mockOnSelect} 
        onCancel={mockOnCancel} 
      />
    );

    // Click on Tesla Science Magazine
    fireEvent.click(screen.getByText('Tesla Science Magazine'));
    
    // Click on issue 3
    fireEvent.click(screen.getByText('3'));
    
    // Should call onSelect with magazine and issue
    expect(mockOnSelect).toHaveBeenCalledWith('Tesla Science Magazine', 3);
  });

  test('cancel button calls onCancel', () => {
    render(
      <CollectibleSelector 
        type="magazine" 
        onSelect={mockOnSelect} 
        onCancel={mockOnCancel} 
      />
    );

    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Should call onCancel
    expect(mockOnCancel).toHaveBeenCalled();
  });
}); 