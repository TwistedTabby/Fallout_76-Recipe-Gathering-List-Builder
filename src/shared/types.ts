export interface Category {
  name: string;
  pipBoyTab: string;
}

export interface Type {
  name: string;
  description: string;
}

export interface Ingredient {
  item: string;
  quantity: number;
}

export interface Buff {
  quantity: string;
  duration: number;
  category: 'S' | 'P' | 'E' | 'C' | 'I' | 'A' | 'L';
}

export interface Recipe {
  name: string;
  ingredients: Ingredient[];
}

export interface GatheringList {
  id: string;
  name: string;
  recipes: Recipe[];
  createdAt: Date;
  updatedAt: Date;
} 