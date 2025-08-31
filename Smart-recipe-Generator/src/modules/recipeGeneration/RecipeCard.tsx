'use client';

import React from 'react';
import { RecipeMatch } from '../../types/recipe';

interface RecipeCardProps {
  recipe: RecipeMatch;
  index: number;
  onSelect: () => void;
  userIngredients: string[];
}

export default function RecipeCard({ recipe, index, onSelect, userIngredients }: RecipeCardProps) {
  const { recipe: recipeData, matchScore, ingredientMatches } = recipe;
  
  // Calculate ingredient match statistics
  const exactMatches = ingredientMatches.filter(m => m.matchType === 'exact').length;
  const similarMatches = ingredientMatches.filter(m => m.matchType === 'similar').length;
  const substituteMatches = ingredientMatches.filter(m => m.matchType === 'substitute').length;
  const missingIngredients = ingredientMatches.filter(m => m.matchType === 'missing').length;
  
  // Calculate match percentage
  const matchPercentage = Math.round(matchScore * 100);
  
  // Get match color based on score
  const getMatchColor = (score: number) => {
    if (score >= 0.8) return 'from-green-500 to-emerald-500';
    if (score >= 0.6) return 'from-yellow-500 to-orange-500';
    if (score >= 0.4) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-500';
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get meal type icon
  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🌞';
      case 'dinner': return '🌙';
      case 'snack': return '🍿';
      case 'dessert': return '🍰';
      default: return '🍽️';
    }
  };

  return (
    <div 
      className="bg-[#1a1a2e] rounded-2xl border border-[#2d2d5a] p-6 hover:border-purple-500/50 transform hover:scale-105 transition-all duration-300 cursor-pointer group"
      onClick={onSelect}
    >
      {/* Match Score Badge */}
      <div className="flex justify-between items-start mb-4">
        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getMatchColor(matchScore)} text-white text-sm font-bold`}>
          {matchPercentage}% Match
        </div>
        <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">
          {getMealTypeIcon(recipeData.mealType)}
        </div>
      </div>

      {/* Recipe Image Placeholder */}
      <div className="w-full h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl mb-4 flex items-center justify-center">
        <div className="text-6xl opacity-40">🍳</div>
      </div>

      {/* Recipe Title */}
      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
        {recipeData.name}
      </h3>

      {/* Recipe Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {recipeData.description}
      </p>

      {/* Recipe Meta Information */}
      <div className="space-y-3 mb-4">
        {/* Rating and Match Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">★</span>
            <span className="text-white font-semibold">{recipeData.rating}</span>
            <span className="text-gray-400 text-sm">({recipeData.totalRatings || 0})</span>
          </div>
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getMatchColor(matchScore)} text-white text-sm font-bold`}>
            {matchPercentage}% Match
          </div>
        </div>

        {/* Difficulty and Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${getDifficultyColor(recipeData.difficulty)}`}></span>
            <span className="text-gray-300 text-sm capitalize">{recipeData.difficulty}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-400">
            <span className="text-sm">⏱️</span>
            <span className="text-sm">{recipeData.cookingTime}m</span>
          </div>
        </div>

        {/* Cuisine Type */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">🌍</span>
          <span className="text-gray-300 text-sm capitalize">{recipeData.cuisineType}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold text-sm"
        >
          View Recipe
        </button>
      </div>

      {/* Ingredient Match Summary */}
      <div className="bg-[#0f0f23] rounded-xl p-4 mb-4">
        <h4 className="text-sm font-semibold text-white mb-3">Ingredient Match</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-300">{exactMatches} exact</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="text-gray-300">{similarMatches} similar</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span className="text-gray-300">{substituteMatches} substitute</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="text-gray-300">{missingIngredients} missing</span>
          </div>
        </div>
      </div>

      {/* Nutritional Preview */}
      <div className="bg-[#0f0f23] rounded-xl p-4 mb-4">
        <h4 className="text-sm font-semibold text-white mb-3">Nutrition (per serving)</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-purple-400 font-bold">{recipeData.nutritionalInfo.calories}</div>
            <div className="text-gray-400">calories</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-bold">{recipeData.nutritionalInfo.protein}g</div>
            <div className="text-gray-400">protein</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-bold">{recipeData.nutritionalInfo.carbs}g</div>
            <div className="text-gray-400">carbs</div>
          </div>
        </div>
      </div>

      {/* Recipe Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {recipeData.tags.slice(0, 3).map((tag, index) => (
          <span 
            key={index}
            className="px-2 py-1 bg-[#2d2d5a] text-gray-300 text-xs rounded-full border border-[#2d2d5a]"
          >
            {tag}
          </span>
        ))}
        {recipeData.tags.length > 3 && (
          <span className="px-2 py-1 bg-[#2d2d5a] text-gray-400 text-xs rounded-full">
            +{recipeData.tags.length - 3}
          </span>
        )}
      </div>

      {/* View Recipe Button */}
      <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 font-semibold">
        View Recipe
      </button>
    </div>
  );
} 