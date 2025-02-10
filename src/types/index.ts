export interface Recipe {
  id: string;
  name: string;
  category: Category;
  types: Type[];
  ingredients: Ingredient[];
  buffs: Buff[];
}

export interface Category {
  id: string;
  name: string;
  pipboyTab: string;
}

export interface Type {
  id: string;
  name: string;
  description: string;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
}

export interface Buff {
  id: string;
  quantity: string;
  duration: number;
  category: string; // S.P.E.C.I.A.L
} 