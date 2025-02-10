import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addRecipe } from '../utils/recipeStorage'
import { verifyGitHubToken } from '../utils/auth'

export function ImportRecipe() {
  const [recipeJson, setRecipeJson] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const userData = await verifyGitHubToken()
      if (!userData) {
        // If not authenticated, redirect to login
        navigate('/login')
        return
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [navigate])

  const handleImport = async () => {
    try {
      const recipe = JSON.parse(recipeJson)
      await addRecipe(recipe)
      navigate('/')
    } catch (e) {
      setError('Invalid JSON format')
    }
  }

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Import Recipe</h1>
      <div className="mb-4">
        <textarea
          className="w-full h-64 p-2 border rounded"
          value={recipeJson}
          onChange={(e) => setRecipeJson(e.target.value)}
          placeholder="Paste recipe JSON here..."
        />
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleImport}
      >
        Import Recipe
      </button>
    </div>
  )
} 