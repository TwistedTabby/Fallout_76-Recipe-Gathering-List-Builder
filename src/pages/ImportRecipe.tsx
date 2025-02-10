import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addRecipe } from '../utils/recipeStorage';
import { verifyGitHubToken } from '../utils/auth';
import styles from '../styles/ImportRecipe.module.css';

interface ImportMessage {
  type: 'error' | 'success';
  text: string;
}

export function ImportRecipe() {
  const [recipeText, setRecipeText] = useState('');
  const [message, setMessage] = useState<ImportMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const userData = await verifyGitHubToken();
      if (!userData) {
        navigate('/login');
        return;
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleImport = async () => {
    try {
      // First try to parse as JSON
      let recipeData;
      try {
        recipeData = JSON.parse(recipeText);
      } catch {
        // If JSON parse fails, try to parse as plain text format
        recipeData = parseRecipeText(recipeText);
      }

      if (!validateRecipeData(recipeData)) {
        setMessage({
          type: 'error',
          text: 'Invalid recipe format. Please check the format and try again.'
        });
        return;
      }

      await addRecipe(recipeData);
      setMessage({
        type: 'success',
        text: 'Recipe imported successfully!'
      });
      
      // Navigate after a brief delay to show success message
      setTimeout(() => navigate('/'), 1500);
    } catch (e) {
      setMessage({
        type: 'error',
        text: e instanceof Error ? e.message : 'Failed to import recipe'
      });
    }
  };

  const parseRecipeText = (text: string) => {
    // Split the text into lines and remove empty lines
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('Recipe must include at least a name and one ingredient');
    }

    // First line is the recipe name
    const name = lines[0].trim();
    
    // Remaining lines are ingredients
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

    return {
      name,
      ingredients
    };
  };

  const validateRecipeData = (data: any): boolean => {
    return (
      data &&
      typeof data.name === 'string' &&
      Array.isArray(data.ingredients) &&
      data.ingredients.every((ing: any) =>
        ing &&
        typeof ing.item === 'string' &&
        typeof ing.quantity === 'number'
      )
    );
  };

  if (isLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Import Recipe</h1>
      
      <div className={styles.importArea}>
        <textarea
          className={styles.textArea}
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
        <div className={message.type === 'error' ? styles.error : styles.success}>
          {message.text}
        </div>
      )}

      <button
        className={styles.button}
        onClick={handleImport}
        disabled={!recipeText.trim()}
      >
        Import Recipe
      </button>
    </div>
  );
} 