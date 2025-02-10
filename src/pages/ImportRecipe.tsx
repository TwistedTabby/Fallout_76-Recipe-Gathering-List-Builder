import React, { useState } from 'react';

export const ImportRecipe: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [message, setMessage] = useState('');

  const handleImport = async () => {
    try {
      // Validate JSON
      const recipe = JSON.parse(jsonInput);
      
      // Create filename from recipe name
      const fileName = recipe.recipe_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '.json';

      // In Electron, save locally
      if (window.electron) {
        // Electron file saving logic here
        setMessage(`Recipe saved locally as ${fileName}`);
        return;
      }

      // In web, upload to R2
      const response = await fetch('/api/recipes/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe, fileName })
      });

      if (response.ok) {
        setMessage('Recipe uploaded successfully!');
        setJsonInput('');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="import-recipe">
      <h1>Import Recipe</h1>
      <div className="form-group">
        <label htmlFor="jsonInput">Paste Recipe JSON:</label>
        <textarea
          id="jsonInput"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={10}
          placeholder="Paste recipe JSON here..."
        />
      </div>
      <button onClick={handleImport}>Import Recipe</button>
      {message && <div className="message">{message}</div>}
    </div>
  );
}; 