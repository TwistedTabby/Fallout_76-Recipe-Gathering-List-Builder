export interface Recipe {
  recipe_name: string;
  ingredients: {
    ingredient: string;
    quantity: number;
  }[];
  buffs: {
    buff: string;
    SPECIAL: 'STR' | 'PER' | 'END' | 'CHR' | 'INT' | 'AGI' | 'LCK';
    duration: string;
  }[];
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