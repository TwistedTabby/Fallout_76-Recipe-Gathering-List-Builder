import { useState } from 'react';
import { Layout } from '../components/Layout';
import { strings } from '../constants/strings';

export default function ImportRecipe() {
  const [jsonInput, setJsonInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedJson = JSON.parse(jsonInput);
      console.log('Parsed JSON:', parsedJson);
      // TODO: Add logic to handle the imported recipe
    } catch (error) {
      console.error('Invalid JSON:', error);
      // TODO: Add error handling
    }
  };

  const content = (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{strings.importRecipe.title}</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="jsonInput" 
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            {strings.importRecipe.pasteRecipeJSON}
          </label>
          <textarea
            id="jsonInput"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={strings.importRecipe.pasteRecipeJSON}
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          {strings.importRecipe.import}
        </button>
      </form>
    </div>
  );

  return <Layout title={strings.importRecipe.title}>{content}</Layout>;
} 