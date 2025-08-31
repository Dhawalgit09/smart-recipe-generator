'use client';

import React from 'react';

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

interface ImageRecipeDetailsProps {
  recipe: ImageRecipe;
  onClose: () => void;
}

export default function ImageRecipeDetails({ recipe, onClose }: ImageRecipeDetailsProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCuisineIcon = (cuisine: string) => {
    switch (cuisine.toLowerCase()) {
      case 'italian': return '🍝';
      case 'chinese': return '🥢';
      case 'mexican': return '🌮';
      case 'indian': return '🍛';
      case 'thai': return '🍜';
      case 'mediterranean': return '🫔';
      case 'japanese': return '🍱';
      case 'french': return '🥖';
      default: return '🍽️';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a2e] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#2d2d5a]">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a2e] p-6 border-b border-[#2d2d5a] rounded-t-3xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{recipe.title}</h2>
              
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <span>{getCuisineIcon(recipe.cuisine)}</span>
                  <span className="text-gray-300 capitalize">{recipe.cuisine}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`w-3 h-3 rounded-full ${getDifficultyColor(recipe.difficulty)}`}></span>
                  <span className="text-gray-300 capitalize">{recipe.difficulty}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>⏱️</span>
                  <span className="text-gray-300">{recipe.cook_time_min} minutes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>👥</span>
                  <span className="text-gray-300">{recipe.servings} servings</span>
                </div>
              </div>

              {/* Dietary Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {recipe.dietary_tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-all duration-300 ml-4"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Recipe Image Placeholder */}
          <div className="w-full h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
            <div className="text-8xl opacity-40">🍳</div>
          </div>

          {/* Nutrition Information */}
          <div className="bg-[#0f0f23] rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Nutrition Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{recipe.nutrition.calories}</div>
                <div className="text-gray-400">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{recipe.nutrition.protein_g}g</div>
                <div className="text-gray-400">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{recipe.nutrition.carbs_g}g</div>
                <div className="text-gray-400">Carbohydrates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{recipe.nutrition.fat_g}g</div>
                <div className="text-gray-400">Fat</div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Ingredients</h3>
            <div className="bg-[#0f0f23] rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <span className="text-white font-medium">
                        {ingredient.amount} {ingredient.unit} {ingredient.ingredient}
                      </span>
                      {ingredient.notes && (
                        <span className="text-gray-400 ml-2">({ingredient.notes})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Instructions</h3>
            <div className="bg-[#0f0f23] rounded-2xl p-6">
              <div className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white leading-relaxed">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-xl font-bold text-white mb-3">💡 Cooking Tips</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Read through all instructions before starting</li>
              <li>• Prepare all ingredients before beginning to cook</li>
              <li>• Adjust seasoning to your taste preferences</li>
              <li>• Don&apos;t be afraid to experiment with the recipe</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
