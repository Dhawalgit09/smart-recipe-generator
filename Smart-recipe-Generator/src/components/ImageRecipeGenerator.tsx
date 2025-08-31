'use client';

import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import ImageRecipeCard from './ImageRecipeCard';
import ImageRecipeDetails from './ImageRecipeDetails';

interface ImageRecipe {
  id: string;
  title: string;
  cuisine: string;
  difficulty: string;
  cook_time_min: number;
  servings: number;
  ingredients: Array<{
    ingredient: string;
    amount: number;
    unit: string;
    notes?: string;
  }>;
  steps: string[];
  nutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  dietary_tags: string[];
}

export default function ImageRecipeGenerator() {
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<ImageRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<ImageRecipe | null>(null);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);

  const handleIngredientsDetected = (ingredients: string[]) => {
    setDetectedIngredients(ingredients);
  };

  const handleImageUpload = async (file: File) => {
    if (detectedIngredients.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recipes-from-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: detectedIngredients.filter(ing => ing.trim()),
          dietaryPreferences: dietaryPreferences
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to generate recipes');
      }

      const data = await response.json();
      
      if (data.recipes && Array.isArray(data.recipes)) {
        setRecipes(data.recipes);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error generating recipes:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeSelect = (recipe: ImageRecipe) => {
    setSelectedRecipe(recipe);
  };

  const handleCloseRecipeDetails = () => {
    setSelectedRecipe(null);
  };

  const resetFlow = () => {
    setDetectedIngredients([]);
    setRecipes([]);
    setError(null);
    setSelectedRecipe(null);
    setDietaryPreferences([]);
  };

  const toggleDietaryPreference = (preference: string) => {
    setDietaryPreferences(prev => 
      prev.includes(preference) 
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
    { id: 'dairy-free', label: 'Dairy-Free', icon: '🥛' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          📸 AI Recipe Generator
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Upload a photo of your ingredients and let AI create delicious recipes for you
        </p>
      </div>

      {/* Image Upload Section */}
      {recipes.length === 0 && (
        <div className="space-y-6">
          <ImageUpload
            onImageUpload={handleImageUpload}
            onIngredientsDetected={handleIngredientsDetected}
            isLoading={isLoading}
          />

          {/* Dietary Preferences Section */}
          {detectedIngredients.length > 0 && (
            <div className="bg-[#1a1a2e] rounded-2xl border border-[#2d2d5a] p-6">
              <h3 className="text-xl font-bold text-white mb-4">Dietary Preferences</h3>
              <p className="text-gray-300 text-sm mb-4">
                Select your dietary preferences to get personalized recipes
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {dietaryOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleDietaryPreference(option.id)}
                    className={`p-3 rounded-xl border transition-all duration-300 ${
                      dietaryPreferences.includes(option.id)
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-[#0f0f23] border-[#2d2d5a] text-gray-300 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                ))}
              </div>

              {dietaryPreferences.length > 0 && (
                <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-purple-300 text-sm">
                    <strong>Selected:</strong> {dietaryPreferences.map(pref => 
                      dietaryOptions.find(opt => opt.id === pref)?.label
                    ).join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 text-center">
          <p className="text-red-300 font-semibold mb-2">Error</p>
          <p className="text-red-200 text-sm mb-4">{error}</p>
          <button
            onClick={resetFlow}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Creating delicious recipes from your ingredients...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
        </div>
      )}

      {/* Recipe Results */}
      {recipes.length > 0 && !isLoading && (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              🍳 Generated Recipes
            </h2>
            <p className="text-gray-300 mb-6">
              Based on your {detectedIngredients.length} ingredients
              {dietaryPreferences.length > 0 && (
                <span> and dietary preferences</span>
              )}
            </p>
            
            {/* Detected Ingredients Summary */}
            <div className="bg-[#1a1a2e] rounded-2xl border border-[#2d2d5a] p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Detected Ingredients</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {detectedIngredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={resetFlow}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300"
              >
                Upload New Image
              </button>
              <button
                onClick={() => handleImageUpload(new File([], 'dummy'))}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Generate New Recipes
              </button>
            </div>
          </div>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <ImageRecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={() => handleRecipeSelect(recipe)}
              />
            ))}
          </div>

          {/* No Recipes */}
          {recipes.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍳</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Recipes Generated</h3>
              <p className="text-gray-300 mb-6">
                Try uploading a different image or adjusting your ingredients
              </p>
              <button
                onClick={resetFlow}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <ImageRecipeDetails
          recipe={selectedRecipe}
          onClose={handleCloseRecipeDetails}
        />
      )}
    </div>
  );
}
