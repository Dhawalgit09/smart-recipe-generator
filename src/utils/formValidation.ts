import { UserInputForm, FormValidation } from '../types/recipe';

export const validateIngredientForm = (formData: UserInputForm): FormValidation => {
  const errors: string[] = [];

  // Validate ingredients
  if (formData.ingredients.length === 0) {
    errors.push('Please add at least one ingredient');
  }

  if (formData.ingredients.length > 20) {
    errors.push('Maximum 20 ingredients allowed');
  }

  // Validate serving size
  if (formData.servingSize < 1 || formData.servingSize > 20) {
    errors.push('Serving size must be between 1 and 20 people');
  }

  // Validate cooking time
  if (formData.cookingTime && (formData.cookingTime < 5 || formData.cookingTime > 480)) {
    errors.push('Cooking time must be between 5 and 480 minutes');
  }

  // Validate ingredient names
  const invalidIngredients = formData.ingredients.filter(
    ingredient => ingredient.trim().length === 0 || ingredient.length > 50
  );
  
  if (invalidIngredients.length > 0) {
    errors.push('All ingredients must be between 1 and 50 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeIngredient = (ingredient: string): string => {
  return ingredient
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/^[a-z]/, (match) => match.toUpperCase()); // Capitalize first letter
};

export const isDuplicateIngredient = (ingredients: string[], newIngredient: string): boolean => {
  const normalizedNew = sanitizeIngredient(newIngredient).toLowerCase();
  return ingredients.some(
    existing => sanitizeIngredient(existing).toLowerCase() === normalizedNew
  );
};

export const formatCookingTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
};

export const getDietaryConflicts = (dietaryPreferences: string[]): string[] => {
  const conflicts: string[] = [];
  
  // Check for conflicting preferences
  if (dietaryPreferences.includes('vegan') && dietaryPreferences.includes('vegetarian')) {
    conflicts.push('Vegan already includes vegetarian restrictions');
  }
  
  if (dietaryPreferences.includes('keto') && dietaryPreferences.includes('low-carb')) {
    conflicts.push('Keto is already a low-carb diet');
  }
  
  return conflicts;
}; 