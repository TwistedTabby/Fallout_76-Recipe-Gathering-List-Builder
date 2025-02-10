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

export function addRecipe(recipe: Recipe) {
  const recipes = getRecipes();
  recipes.push(recipe);
  localStorage.setItem('recipes', JSON.stringify(recipes));
  return recipes;
}

export async function loadRecipes(): Promise<Recipe[]> {
  const recipesJson = localStorage.getItem('recipes');
  return recipesJson ? JSON.parse(recipesJson) : [];
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const recipes = await loadRecipes();
  recipes.push(recipe);
  localStorage.setItem('recipes', JSON.stringify(recipes));
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  const recipes = await loadRecipes();
  const updatedRecipes = recipes.filter(recipe => recipe.recipeId !== recipeId);
  localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
}