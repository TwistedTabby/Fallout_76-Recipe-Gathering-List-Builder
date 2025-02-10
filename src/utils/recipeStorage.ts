import { Recipe } from '../types';

const R2_BUCKET_URL = import.meta.env.VITE_R2_BUCKET_URL;

export async function getRecipe(recipeName: string): Promise<Recipe> {
  const response = await fetch(`${R2_BUCKET_URL}/recipes/${recipeName}.json`);
  if (!response.ok) throw new Error(`Recipe ${recipeName} not found`);
  return response.json();
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const response = await fetch(`${R2_BUCKET_URL}/recipes/index.json`);
  if (!response.ok) throw new Error('Failed to fetch recipe index');
  return response.json();
}

// For Electron, we'll add local caching
export async function cacheRecipes(): Promise<void> {
  if (!window.electron) return; // Skip if not in Electron
  const recipes = await getAllRecipes();
  localStorage.setItem('recipes-cache', JSON.stringify(recipes));
}