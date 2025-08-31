'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Recipe, RecipeMatch, IngredientMatch } from '../../types/recipe';
import { useRecipeMatching } from '../../hooks/useRecipeMatching';
import RecipeCard from './RecipeCard';
import RecipeFilters from './RecipeFilters';
import RecipeDetails from './RecipeDetails';
import { RecipeMatchingAlgorithm } from '../../utils/recipeMatchingAlgorithm';

interface RecipeGeneratorProps {
  userIngredients: string[];
  dietaryPreferences: string[];
  servingSize: number;
  cuisineType: string;
  cookingTime: number;
  userId?: string;
}

export default function RecipeGenerator({
  userIngredients,
  dietaryPreferences,
  servingSize,
  cuisineType,
  cookingTime,
  userId
}: RecipeGeneratorProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [filters, setFilters] = useState({
    maxCookingTime: Math.max(cookingTime, 60), // Ensure minimum of 60 minutes
    cuisineType: 'any', // Start with 'any' instead of the specific cuisine
    difficulty: 'any' as 'easy' | 'medium' | 'hard' | 'any',
    mealType: 'any' as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'any'
  });

  // Use the recipe matching hook
  const {
    recipes,
    isLoading,
    error,
    generateRecipes,
    clearRecipes
  } = useRecipeMatching();

  // Debug logging
  console.log('🔍 RecipeGenerator Debug:', {
    recipes: recipes,
    recipesLength: recipes.length,
    isLoading,
    error,
    userIngredients,
    filteredRecipes: recipes.filter(recipe => {
      if (filters.maxCookingTime && recipe.recipe.cookingTime > filters.maxCookingTime) return false;
      if (filters.cuisineType !== 'any' && recipe.recipe.cuisineType !== filters.cuisineType) return false;
      if (filters.difficulty !== 'any' && recipe.recipe.difficulty !== filters.difficulty) return false;
      if (filters.mealType !== 'any' && recipe.recipe.mealType !== filters.mealType) return false;
      return true;
    })
  });

  // Generate recipes when component mounts or inputs change
  const handleGenerateRecipes = useCallback(async () => {
    console.log('🚀 Generating recipes with:', { userIngredients, dietaryPreferences, servingSize, cuisineType, cookingTime });
    await generateRecipes({
      ingredients: userIngredients,
      dietaryPreferences,
      servingSize,
      cuisineType,
      cookingTime
    });
  }, [userIngredients, dietaryPreferences, servingSize, cuisineType, cookingTime, generateRecipes]);

  // Filter recipes based on user preferences
  const filteredRecipes = useMemo(() => {
    if (!recipes.length) {
      console.log('⚠️ No recipes to filter');
      return [];
    }
    
    const filtered = recipes.filter(recipe => {
      // Cooking time filter - be more lenient
      if (filters.maxCookingTime && recipe.recipe.cookingTime > filters.maxCookingTime * 1.5) {
        console.log(`❌ Recipe ${recipe.recipe.name} filtered out due to cooking time: ${recipe.recipe.cookingTime} > ${filters.maxCookingTime * 1.5}`);
        return false;
      }
      
      // Cuisine type filter - only filter if specific cuisine is selected
      if (filters.cuisineType !== 'any' && filters.cuisineType !== '' && 
          recipe.recipe.cuisineType.toLowerCase() !== filters.cuisineType.toLowerCase()) {
        console.log(`❌ Recipe ${recipe.recipe.name} filtered out due to cuisine: ${recipe.recipe.cuisineType} !== ${filters.cuisineType}`);
        return false;
      }
      
      // Difficulty filter - only filter if specific difficulty is selected
      if (filters.difficulty !== 'any' && recipe.recipe.difficulty !== filters.difficulty) {
        console.log(`❌ Recipe ${recipe.recipe.name} filtered out due to difficulty: ${recipe.recipe.difficulty} !== ${filters.difficulty}`);
        return false;
      }
      
      // Meal type filter - only filter if specific meal type is selected
      if (filters.mealType !== 'any' && recipe.recipe.mealType !== filters.mealType) {
        console.log(`❌ Recipe ${recipe.recipe.name} filtered out due to meal type: ${recipe.recipe.mealType} !== ${filters.mealType}`);
        return false;
      }
      
      console.log(`✅ Recipe ${recipe.recipe.name} passed all filters`);
      return true;
    });

    console.log('🔍 Filtered recipes:', filtered.length, 'out of', recipes.length);
    return filtered;
  }, [recipes, filters]);

  // Auto-generate recipes when component mounts
  React.useEffect(() => {
    if (userIngredients.length > 0) {
      console.log('🔄 Auto-generating recipes on mount');
      handleGenerateRecipes();
    }
  }, [userIngredients, handleGenerateRecipes]);

  return (
    <div className="space-y-8">
      {/* Recipe Generation Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          🍳 Recipe Suggestions
        </h2>
        <p className="text-gray-300">
          Based on your {userIngredients.length} ingredients and preferences
        </p>
        
        {/* Generate Button */}
        <div className="mt-6">
          <button
            onClick={handleGenerateRecipes}
            disabled={isLoading || userIngredients.length === 0}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transform hover:scale-105 transition-all duration-300"
          >
            {isLoading ? '🔄 Generating Recipes...' : '✨ Generate New Recipes'}
          </button>
          
          {recipes.length > 0 && (
            <button
              onClick={clearRecipes}
              className="ml-4 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300"
            >
              Clear Results
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Analyzing your ingredients and finding perfect recipes...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 text-center">
          <p className="text-red-300 font-semibold mb-2">Recipe Generation Failed</p>
          <p className="text-red-200 text-sm">{error}</p>
          <button
            onClick={handleGenerateRecipes}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Recipe Results */}
      {filteredRecipes.length > 0 && (
        <div className="space-y-6">
          {/* Filters */}
          <RecipeFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalRecipes={recipes.length}
            filteredCount={filteredRecipes.length}
          />

          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              Found {filteredRecipes.length} Perfect Recipes!
            </h3>
            <p className="text-gray-300">
              Sorted by best match to your ingredients and preferences
            </p>
          </div>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipeMatch, index) => (
              <RecipeCard
                key={recipeMatch.recipe.id}
                recipe={recipeMatch}
                index={index}
                onSelect={() => setSelectedRecipe(recipeMatch.recipe)}
                userIngredients={userIngredients}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {recipes.length === 0 && !isLoading && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Recipes Generated Yet</h3>
          <p className="text-gray-300 mb-6">
            Click the generate button above to create recipes from your ingredients
          </p>
        </div>
      )}

      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <RecipeDetails
          recipe={selectedRecipe}
          userIngredients={userIngredients}
          onClose={() => setSelectedRecipe(null)}
          userId={userId}
        />
      )}
    </div>
  );
} 