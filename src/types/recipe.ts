export interface Ingredient {
  id: string;
  name: string;
  category: string;
  nutritionalValue?: NutritionalInfo;
}

export interface DietaryPreference {
  id: string;
  name: string;
  description: string;
  restrictions: string[];
}

export interface UserInputForm {
  ingredients: string[];
  dietaryPreferences: string[];
  servingSize: number;
  cuisineType: string;
  cookingTime: number;
}

export interface FormValidation {
  isValid: boolean;
  errors: string[];
}

// New Recipe Types
export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  nutritionalInfo: NutritionalInfo;
  cookingTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisineType: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  tags: string[];
  imageUrl?: string;
  rating: number;
  totalRatings: number;
  servings: number;
  prepTime: number;
  totalTime: number;
  recommendationScore?: number;
}

export interface RecipeIngredient {
  ingredient: string;
  amount: number;
  unit: string;
  notes?: string;
  isOptional: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  timeMinutes?: number;
  tips?: string;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  vitamins?: VitaminInfo;
  minerals?: MineralInfo;
}

export interface VitaminInfo {
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  vitaminB6?: number;
  vitaminB12?: number;
  folate?: number;
}

export interface MineralInfo {
  calcium?: number;
  iron?: number;
  magnesium?: number;
  phosphorus?: number;
  potassium?: number;
  zinc?: number;
}

// Recipe Matching Types
export interface RecipeMatch {
  recipe: Recipe;
  matchScore: number;
  ingredientMatches: IngredientMatch[];
  dietaryCompatibility: number;
  cuisineMatch: number;
  timeMatch: number;
  explanation: string;
}

export interface IngredientMatch {
  userIngredient: string;
  recipeIngredient: string;
  matchType: 'exact' | 'similar' | 'substitute' | 'missing';
  confidence: number;
  substitution?: string;
}

export interface RecipeFilters {
  maxCookingTime: number;
  cuisineType: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'any';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'any';
  maxCalories?: number;
  dietaryRestrictions?: string[];
}

export interface RecipeGenerationRequest {
  ingredients: string[];
  dietaryPreferences: string[];
  servingSize: number;
  cuisineType: string;
  cookingTime: number;
  filters?: RecipeFilters;
}

export interface RecipeGenerationResponse {
  recipes: RecipeMatch[];
  totalFound: number;
  generationTime: number;
  suggestions: string[];
} 