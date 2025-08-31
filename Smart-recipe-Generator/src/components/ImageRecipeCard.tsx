'use client';

import React, { useState } from 'react';

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

interface ImageRecipeCardProps {
  recipe: ImageRecipe;
  onSelect: () => void;
}

export default function ImageRecipeCard({ recipe, onSelect }: ImageRecipeCardProps) {
  const [showDetails, setShowDetails] = useState(false);

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
    <div className="bg-[#1a1a2e] rounded-2xl border border-[#2d2d5a] p-6 hover:border-purple-500/50 transform hover:scale-105 transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {recipe.title}
          </h3>
          <div className="flex items-center space-x-3 text-sm">
            <span className="flex items-center space-x-1">
              <span>{getCuisineIcon(recipe.cuisine)}</span>
              <span className="text-gray-300 capitalize">{recipe.cuisine}</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className={`w-2 h-2 rounded-full ${getDifficultyColor(recipe.difficulty)}`}></span>
              <span className="text-gray-300 capitalize">{recipe.difficulty}</span>
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl mb-1">⏱️</div>
          <div className="text-white font-semibold">{recipe.cook_time_min}m</div>
        </div>
      </div>

      {/* Recipe Image Placeholder */}
      <div className="w-full h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl mb-4 flex items-center justify-center">
        <div className="text-6xl opacity-40">🍳</div>
      </div>

      {/* Nutrition Info */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center">
          <div className="text-white font-bold">{recipe.nutrition.calories}</div>
          <div className="text-gray-400 text-xs">Cal</div>
        </div>
        <div className="text-center">
          <div className="text-white font-bold">{recipe.nutrition.protein_g}g</div>
          <div className="text-gray-400 text-xs">Protein</div>
        </div>
        <div className="text-center">
          <div className="text-white font-bold">{recipe.nutrition.carbs_g}g</div>
          <div className="text-gray-400 text-xs">Carbs</div>
        </div>
        <div className="text-center">
          <div className="text-white font-bold">{recipe.nutrition.fat_g}g</div>
          <div className="text-gray-400 text-xs">Fat</div>
        </div>
      </div>

      {/* Dietary Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {recipe.dietary_tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Servings */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-gray-400">👥</span>
        <span className="text-white">{recipe.servings} servings</span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
        <button
          onClick={onSelect}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold text-sm"
        >
          View Recipe
        </button>
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="mt-4 space-y-4 pt-4 border-t border-[#2d2d5a]">
          {/* Ingredients */}
          <div>
            <h4 className="text-white font-semibold mb-2">Ingredients:</h4>
            <div className="space-y-1">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="text-gray-300 text-sm">
                  • {ingredient.amount} {ingredient.unit} {ingredient.ingredient}
                  {ingredient.notes && (
                    <span className="text-gray-400 ml-2">({ingredient.notes})</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Steps Preview */}
          <div>
            <h4 className="text-white font-semibold mb-2">Steps:</h4>
            <div className="space-y-1">
              {recipe.steps.slice(0, 3).map((step, index) => (
                <div key={index} className="text-gray-300 text-sm">
                  {index + 1}. {step}
                </div>
              ))}
              {recipe.steps.length > 3 && (
                <div className="text-gray-400 text-sm">
                  ... and {recipe.steps.length - 3} more steps
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
