import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Recipe } from '../shared/types';

interface ImportMessage {
  type: 'error' | 'success';
  text: string;
}

export const ImportRecipe: React.FC = () => {
  const [recipeText, setRecipeText] = useState('');
  const [message, setMessage] = useState<ImportMessage | null>(null);
  const navigate = useNavigate();

  const handleImport = async () => {
    try {
      let recipeData: Recipe;
      try {
        recipeData = JSON.parse(recipeText);
      } catch {
        recipeData = parseRecipeText(recipeText);
      }

      if (!validateRecipeData(recipeData)) {
        setMessage({
          type: 'error',
          text: 'Invalid recipe format. Please check the format and try again.'
        });
        return;
      }

      // TODO: Implement recipe storage
      setMessage({
        type: 'success',
        text: 'Recipe imported successfully!'
      });
      
      setTimeout(() => navigate('/recipes'), 1500);
    } catch (e) {
      setMessage({
        type: 'error',
        text: e instanceof Error ? e.message : 'Failed to import recipe'
      });
    }
  };

  const parseRecipeText = (text: string): Recipe => {
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('Recipe must include at least a name and one ingredient');
    }

    const name = lines[0].trim();
    const ingredients = lines.slice(1).map(line => {
      const [quantity, item] = line.split('x').map(part => part.trim());
      if (!quantity || !item) {
        throw new Error(`Invalid ingredient format: ${line}`);
      }
      return {
        item,
        quantity: parseInt(quantity, 10)
      };
    });

    return { name, ingredients };
  };

  const validateRecipeData = (data: unknown): data is Recipe => {
    if (!data || typeof data !== 'object') return false;
    const recipe = data as Recipe;
    return (
      typeof recipe.name === 'string' &&
      Array.isArray(recipe.ingredients) &&
      recipe.ingredients.every(ing =>
        ing &&
        typeof ing.item === 'string' &&
        typeof ing.quantity === 'number'
      )
    );
  };

  return (
    <div className="prose max-w-3xl mx-auto">
      <h1>Import Recipe</h1>
      
      <div className="form-control w-full">
        <textarea
          className="textarea textarea-bordered h-64 font-mono"
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          placeholder={`Enter recipe in either JSON format or plain text format:

JSON Example:
{
  "name": "Stimpak",
  "ingredients": [
    { "item": "Antiseptic", "quantity": 2 },
    { "item": "Blood Pack", "quantity": 1 }
  ]
}

Plain Text Example:
Stimpak
2x Antiseptic
1x Blood Pack`}
        />
      </div>

      {message && (
        <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'} mt-4`}>
          {message.text}
        </div>
      )}

      <button
        className="btn btn-primary mt-4"
        onClick={handleImport}
        disabled={!recipeText.trim()}
      >
        Import Recipe
      </button>
    </div>
  );
}; 