import React, { useState } from 'react';
import { Recipe } from '../types';

const RecipeList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [buffFilter, setBuffFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  return (
    <div>
      <h1>Recipe List</h1>
      <div className="filters">
        {/* Filter controls will go here */}
      </div>
      <div className="recipe-grid">
        {/* Recipe cards will go here */}
      </div>
    </div>
  );
};

export default RecipeList; 