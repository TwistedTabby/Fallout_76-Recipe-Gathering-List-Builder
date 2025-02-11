import { useState, useEffect } from 'react';
import { strings } from '../constants/strings';
import { Layout } from '../components/Layout';

export default function ImportRecipe() {
  const [jsonInput, setJsonInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const response = await fetch('/api/auth/check');
      console.log('Auth response:', response);
      const data = await response.json();
      console.log('Auth data:', data);
      setIsAuthenticated(data.isAuthenticated);
    } catch (error) {
      console.error('Auth check failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/github';
  };

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

  if (error) {
    return <Layout title={strings.importRecipe.title}>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    </Layout>;
  }

  if (isLoading) {
    return <Layout title={strings.importRecipe.title}>
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    </Layout>;
  }

  const content = !isAuthenticated ? (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{strings.importRecipe.title}</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">You need to be authenticated as a project collaborator to import recipes.</p>
        <button
          onClick={handleGitHubLogin}
          className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10A10 10 0 0010 0z" clipRule="evenodd" />
          </svg>
          Login with GitHub
        </button>
      </div>
    </div>
  ) : (
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