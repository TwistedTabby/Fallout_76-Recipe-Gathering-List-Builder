import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Recipe, Ingredient } from '../types';

const GatheringList: React.FC = () => {
  const [selectedRecipes] = useLocalStorage<Recipe[]>('selectedRecipes', []);

  const calculateIngredients = (recipes: Recipe[]): Ingredient[] => {
    // Combine and calculate total ingredients needed
    return [];
  };

  return (
    <div>
      <h1>Gathering List</h1>
      <div className="gathering-list">
        {/* Gathering list content will go here */}
      </div>
    </div>
  );
};

export default GatheringList; 