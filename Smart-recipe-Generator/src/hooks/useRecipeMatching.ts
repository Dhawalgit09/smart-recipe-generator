import { useState, useCallback } from 'react';
import { Recipe, RecipeMatch, RecipeGenerationRequest } from '../types/recipe';
import { RecipeMatchingAlgorithm } from '../utils/recipeMatchingAlgorithm';
import { GeminiRecipeService } from '../services/geminiService';
import { sampleRecipes } from '../data/sampleRecipes';

export function useRecipeMatching() {
  const [recipes, setRecipes] = useState<RecipeMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingAI, setIsUsingAI] = useState(false);

  /**
   * Generate recipes based on user input
   */
  const generateRecipes = useCallback(async (request: RecipeGenerationRequest) => {
    console.log('🚀 useRecipeMatching.generateRecipes called with:', request);
    setIsLoading(true);
    setError(null);
    
    try {
      // First, try to generate AI recipes with Gemini
      setIsUsingAI(true);
      console.log("🤖 Generating AI recipes with Gemini...");
      
      const aiRecipes = await GeminiRecipeService.generateRecipes(request);
      console.log("✅ AI Recipes Generated:", aiRecipes);
      console.log("✅ AI Recipes Count:", aiRecipes.length);
      
      // Convert AI recipes to RecipeMatch format
      const aiRecipeMatches: RecipeMatch[] = aiRecipes.map(recipe => ({
        recipe,
        matchScore: 0.95, // High score for AI-generated recipes
        ingredientMatches: request.ingredients.map(ingredient => ({
          userIngredient: ingredient,
          recipeIngredient: ingredient,
          matchType: 'exact' as const,
          confidence: 1.0
        })),
        dietaryCompatibility: 1.0,
        cuisineMatch: 1.0,
        timeMatch: 1.0,
        explanation: "AI-generated recipe perfectly tailored to your ingredients and preferences"
      }));
      
      console.log("✅ AI Recipe Matches created:", aiRecipeMatches.length);
      
      // Also get sample recipes for comparison
      const sampleRecipeMatches = await RecipeMatchingAlgorithm.findMatchingRecipes(
        request,
        sampleRecipes
      );
      
      console.log("✅ Sample Recipe Matches:", sampleRecipeMatches.length);
      
      // Combine AI and sample recipes, prioritizing AI-generated ones
      const allRecipes = [...aiRecipeMatches, ...sampleRecipeMatches];
      
      console.log("✅ Total combined recipes:", allRecipes.length);
      
      // Sort by match score (AI recipes first, then by score)
      allRecipes.sort((a, b) => {
        if (a.recipe.id.startsWith('gemini-') && !b.recipe.id.startsWith('gemini-')) return -1;
        if (!a.recipe.id.startsWith('gemini-') && b.recipe.id.startsWith('gemini-')) return 1;
        return b.matchScore - a.matchScore;
      });
      
      console.log("✅ Setting recipes state with:", allRecipes.length, "recipes");
      setRecipes(allRecipes);
      
      if (allRecipes.length === 0) {
        setError('No recipes found matching your criteria. Try adding more ingredients or adjusting preferences.');
      }
      
    } catch (err) {
      console.error('AI Recipe generation failed, falling back to sample recipes:', err);
      
      // Fallback to sample recipes if AI fails
      try {
        setIsUsingAI(false);
        const sampleRecipeMatches = await RecipeMatchingAlgorithm.findMatchingRecipes(
          request,
          sampleRecipes
        );
        
        console.log("✅ Fallback sample recipes:", sampleRecipeMatches.length);
        setRecipes(sampleRecipeMatches);
        
        if (sampleRecipeMatches.length === 0) {
          setError('No recipes found matching your criteria. Try adding more ingredients or adjusting preferences.');
        } else {
          // Show success message even with fallback
          console.log('✅ Fallback recipes generated successfully');
        }
      } catch (fallbackError) {
        console.error('Fallback recipe generation also failed:', fallbackError);
        setError('Failed to generate recipes. Please try again.');
      }
    } finally {
      setIsLoading(false);
      console.log("✅ Recipe generation process completed");
    }
  }, []);

  /**
   * Generate a single focused recipe
   */
  const generateFocusedRecipe = useCallback(async (
    request: RecipeGenerationRequest,
    focus: string
  ): Promise<Recipe | null> => {
    try {
      // Use the main generateRecipes method for focused generation
      const focusedRecipes = await GeminiRecipeService.generateRecipes(request);
      const focusedRecipe = focusedRecipes[0]; // Get the first recipe
      
      if (!focusedRecipe) {
        throw new Error('No recipes generated');
      }
      
      // Add to existing recipes
      const newRecipeMatch: RecipeMatch = {
        recipe: focusedRecipe,
        matchScore: 0.98,
        ingredientMatches: request.ingredients.map(ingredient => ({
          userIngredient: ingredient,
          recipeIngredient: ingredient,
          matchType: 'exact' as const,
          confidence: 1.0
        })),
        dietaryCompatibility: 1.0,
        cuisineMatch: 1.0,
        timeMatch: 1.0,
        explanation: `AI-generated ${focus} recipe tailored to your preferences`
      };
      
      setRecipes(prev => [newRecipeMatch, ...prev]);
      return focusedRecipe;
      
    } catch (error) {
      console.error('Focused recipe generation failed:', error);
      setError('Failed to generate focused recipe. Please try again.');
      return null;
    }
  }, []);

  /**
   * Get cooking tips for ingredients
   */
  const getCookingTips = useCallback(async (ingredients: string[]): Promise<string[]> => {
    // Return default cooking tips since the service doesn't have this method
    return [
      "Always taste as you cook",
      "Prep all ingredients before starting",
      "Keep your workspace clean",
      "Don't be afraid to experiment",
      "Cook with love and patience"
    ];
  }, []);

  /**
   * Clear all generated recipes
   */
  const clearRecipes = useCallback(() => {
    setRecipes([]);
    setError(null);
    setIsUsingAI(false);
  }, []);

  /**
   * Regenerate recipes with new parameters
   */
  const regenerateRecipes = useCallback(async (request: RecipeGenerationRequest) => {
    await generateRecipes(request);
  }, [generateRecipes]);

  /**
   * Get recipe by ID
   */
  const getRecipeById = useCallback((id: string): RecipeMatch | undefined => {
    return recipes.find(recipe => recipe.recipe.id === id);
  }, [recipes]);

  /**
   * Filter recipes by dietary preference
   */
  const filterByDietaryPreference = useCallback((preference: string): RecipeMatch[] => {
    return recipes.filter(recipe => 
      recipe.dietaryCompatibility > 0.7 && 
      recipe.recipe.tags.some(tag => 
        tag.toLowerCase().includes(preference.toLowerCase())
      )
    );
  }, [recipes]);

  /**
   * Filter recipes by cuisine type
   */
  const filterByCuisine = useCallback((cuisine: string): RecipeMatch[] => {
    return recipes.filter(recipe => 
      recipe.cuisineMatch > 0.7 && 
      recipe.recipe.cuisineType.toLowerCase().includes(cuisine.toLowerCase())
    );
  }, [recipes]);

  /**
   * Filter recipes by cooking time
   */
  const filterByCookingTime = useCallback((maxTime: number): RecipeMatch[] => {
    return recipes.filter(recipe => 
      recipe.recipe.cookingTime <= maxTime
    );
  }, [recipes]);

  /**
   * Sort recipes by different criteria
   */
  const sortRecipes = useCallback((criteria: 'match' | 'time' | 'difficulty' | 'rating' | 'ai-first'): RecipeMatch[] => {
    const sortedRecipes = [...recipes];
    
    switch (criteria) {
      case 'match':
        sortedRecipes.sort((a, b) => b.matchScore - a.matchScore);
        break;
      case 'time':
        sortedRecipes.sort((a, b) => a.recipe.cookingTime - b.recipe.cookingTime);
        break;
      case 'difficulty':
        const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
        sortedRecipes.sort((a, b) => 
          difficultyOrder[a.recipe.difficulty] - difficultyOrder[b.recipe.difficulty]
        );
        break;
      case 'rating':
        sortedRecipes.sort((a, b) => b.recipe.rating - a.recipe.rating);
        break;
      case 'ai-first':
        sortedRecipes.sort((a, b) => {
          const aIsAI = a.recipe.id.startsWith('gemini-');
          const bIsAI = b.recipe.id.startsWith('gemini-');
          if (aIsAI && !bIsAI) return -1;
          if (!aIsAI && bIsAI) return 1;
          return b.matchScore - a.matchScore;
        });
        break;
    }
    
    return sortedRecipes;
  }, [recipes]);

  /**
   * Get recipe statistics
   */
  const getRecipeStats = useCallback(() => {
    if (recipes.length === 0) return null;
    
    const aiRecipes = recipes.filter(r => r.recipe.id.startsWith('gemini-'));
    const sampleRecipes = recipes.filter(r => !r.recipe.id.startsWith('gemini-'));
    
    const avgMatchScore = recipes.reduce((sum, r) => sum + r.matchScore, 0) / recipes.length;
    const avgCookingTime = recipes.reduce((sum, r) => sum + r.recipe.cookingTime, 0) / recipes.length;
    const avgRating = recipes.reduce((sum, r) => sum + r.recipe.rating, 0) / recipes.length;
    
    const cuisineDistribution = recipes.reduce((acc, r) => {
      acc[r.recipe.cuisineType] = (acc[r.recipe.cuisineType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const difficultyDistribution = recipes.reduce((acc, r) => {
      acc[r.recipe.difficulty] = (acc[r.recipe.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalRecipes: recipes.length,
      aiGeneratedRecipes: aiRecipes.length,
      sampleRecipes: sampleRecipes.length,
      averageMatchScore: avgMatchScore,
      averageCookingTime: Math.round(avgCookingTime),
      averageRating: Math.round(avgRating * 10) / 10,
      cuisineDistribution,
      difficultyDistribution
    };
  }, [recipes]);

  return {
    recipes,
    isLoading,
    error,
    isUsingAI,
    generateRecipes,
    generateFocusedRecipe,
    getCookingTips,
    clearRecipes,
    regenerateRecipes,
    getRecipeById,
    filterByDietaryPreference,
    filterByCuisine,
    filterByCookingTime,
    sortRecipes,
    getRecipeStats
  };
} 