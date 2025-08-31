import { useState, useCallback, useMemo } from 'react';
import { UserInputForm, FormValidation } from '../types/recipe';
import { validateIngredientForm, sanitizeIngredient, isDuplicateIngredient } from '../utils/formValidation';

export const useIngredientForm = () => {
  const [formData, setFormData] = useState<UserInputForm>({
    ingredients: [],
    dietaryPreferences: [],
    servingSize: 2,
    cuisineType: '',
    cookingTime: 30
  });

  const [customIngredient, setCustomIngredient] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Validation state
  const validation = useMemo(() => validateIngredientForm(formData), [formData]);

  // Add ingredient to the list
  const addIngredient = useCallback((ingredient: string) => {
    const sanitized = sanitizeIngredient(ingredient);
    
    if (!sanitized || sanitized.length === 0) {
      return { success: false, error: 'Please enter a valid ingredient name' };
    }

    setFormData(prev => {
      if (isDuplicateIngredient(prev.ingredients, sanitized)) {
        return prev; // Don't update if duplicate
      }

      if (prev.ingredients.length >= 20) {
        return prev; // Don't update if at limit
      }

      return {
        ...prev,
        ingredients: [...prev.ingredients, sanitized]
      };
    });

    setCustomIngredient('');
    setSearchTerm('');
    setTouched(prev => new Set([...prev, 'ingredients']));

    return { success: true };
  }, []);

  // Remove ingredient from the list
  const removeIngredient = useCallback((ingredientToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ingredient => ingredient !== ingredientToRemove)
    }));
    setTouched(prev => new Set([...prev, 'ingredients']));
  }, []);

  // Toggle dietary preference
  const toggleDietaryPreference = useCallback((preferenceId: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(preferenceId)
        ? prev.dietaryPreferences.filter(id => id !== preferenceId)
        : [...prev.dietaryPreferences, preferenceId]
    }));
    setTouched(prev => new Set([...prev, 'dietaryPreferences']));
  }, []);

  // Update form field
  const updateField = useCallback((field: keyof UserInputForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => new Set([...prev, field]));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      ingredients: [],
      dietaryPreferences: [],
      servingSize: 2,
      cuisineType: '',
      cookingTime: 30
    });
    setCustomIngredient('');
    setSearchTerm('');
    setTouched(new Set());
  }, []);

  // Check if field has been touched and has errors
  const getFieldError = useCallback((field: string): string | null => {
    if (!touched.has(field)) return null;
    
    const fieldErrors = validation.errors.filter(error => 
      error.toLowerCase().includes(field.toLowerCase())
    );
    
    return fieldErrors.length > 0 ? fieldErrors[0] : null;
  }, [touched, validation.errors]);

  // Get form submission state
  const canSubmit = useMemo(() => {
    return validation.isValid && formData.ingredients.length > 0;
  }, [validation.isValid, formData.ingredients.length]);

  return {
    formData,
    customIngredient,
    searchTerm,
    validation,
    canSubmit,
    
    // Actions
    addIngredient,
    removeIngredient,
    toggleDietaryPreference,
    updateField,
    resetForm,
    
    // Setters
    setCustomIngredient,
    setSearchTerm,
    
    // Utilities
    getFieldError,
    touched
  };
}; 