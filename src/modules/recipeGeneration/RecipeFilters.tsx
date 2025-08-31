'use client';

import React from 'react';
import { RecipeFilters as RecipeFiltersType } from '../../types/recipe';

interface RecipeFiltersProps {
  filters: {
    maxCookingTime: number;
    cuisineType: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'any';
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'any';
  };
  onFiltersChange: (filters: RecipeFiltersType) => void;
  totalRecipes: number;
  filteredCount: number;
}

export default function RecipeFilters({ 
  filters, 
  onFiltersChange, 
  totalRecipes, 
  filteredCount 
}: RecipeFiltersProps) {
  
  const handleFilterChange = (key: keyof RecipeFiltersType, value: string | number) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      maxCookingTime: 120,
      cuisineType: 'any',
      difficulty: 'any',
      mealType: 'any'
    });
  };

  return (
    <div className="bg-[#1a1a2e] rounded-2xl border border-[#2d2d5a] p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Filter Recipes</h3>
          <p className="text-gray-300 text-sm">
            Showing {filteredCount} of {totalRecipes} recipes
          </p>
        </div>
        
        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 text-sm"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Cooking Time Filter */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            ⏱️ Max Cooking Time
          </label>
          <div className="relative">
            <input
              type="range"
              min="15"
              max="180"
              step="15"
              value={filters.maxCookingTime}
              onChange={(e) => handleFilterChange('maxCookingTime', parseInt(e.target.value))}
              className="w-full h-2 bg-[#0f0f23] rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>15m</span>
              <span className="text-white font-medium">{filters.maxCookingTime}m</span>
              <span>180m</span>
            </div>
          </div>
        </div>

        {/* Cuisine Type Filter */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            🌍 Cuisine Type
          </label>
          <select
            value={filters.cuisineType}
            onChange={(e) => handleFilterChange('cuisineType', e.target.value)}
            className="w-full bg-[#0f0f23] border border-[#2d2d5a] rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
          >
            <option value="any">Any Cuisine</option>
            <option value="italian">Italian</option>
            <option value="chinese">Chinese</option>
            <option value="mexican">Mexican</option>
            <option value="indian">Indian</option>
            <option value="thai">Thai</option>
            <option value="mediterranean">Mediterranean</option>
            <option value="american">American</option>
            <option value="french">French</option>
            <option value="japanese">Japanese</option>
            <option value="greek">Greek</option>
            <option value="spanish">Spanish</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            🎯 Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => handleFilterChange('difficulty', difficulty)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filters.difficulty === difficulty
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#0f0f23] text-gray-300 hover:bg-[#2d2d5a] border border-[#2d2d5a]'
                }`}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleFilterChange('difficulty', 'any')}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              filters.difficulty === 'any'
                ? 'bg-purple-600 text-white'
                : 'bg-[#0f0f23] text-gray-300 hover:bg-[#2d2d5a] border border-[#2d2d5a]'
            }`}
          >
            Any Difficulty
          </button>
        </div>

        {/* Meal Type Filter */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            🍽️ Meal Type
          </label>
          <div className="space-y-2">
            {([
              { value: 'breakfast', icon: '🌅', label: 'Breakfast' },
              { value: 'lunch', icon: '🌞', label: 'Lunch' },
              { value: 'dinner', icon: '🌙', label: 'Dinner' },
              { value: 'snack', icon: '🍿', label: 'Snack' },
              { value: 'dessert', icon: '🍰', label: 'Dessert' }
            ] as const).map((mealType) => (
              <button
                key={mealType.value}
                onClick={() => handleFilterChange('mealType', mealType.value)}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filters.mealType === mealType.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#0f0f23] text-gray-300 hover:bg-[#2d2d5a] border border-[#2d2d5a]'
                }`}
              >
                <span>{mealType.icon}</span>
                <span>{mealType.label}</span>
              </button>
            ))}
            <button
              onClick={() => handleFilterChange('mealType', 'any')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                filters.mealType === 'any'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#0f0f23] text-gray-300 hover:bg-[#2d2d5a] border border-[#2d2d5a]'
              }`}
            >
              <span>🍽️</span>
              <span>Any Meal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="mt-6 pt-6 border-t border-[#2d2d5a]">
        <h4 className="text-sm font-medium text-white mb-3">Active Filters:</h4>
        <div className="flex flex-wrap gap-2">
          {filters.maxCookingTime < 180 && (
            <span className="px-3 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
              ⏱️ Max {filters.maxCookingTime}m
            </span>
          )}
          {filters.cuisineType !== 'any' && (
            <span className="px-3 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
              🌍 {filters.cuisineType.charAt(0).toUpperCase() + filters.cuisineType.slice(1)}
            </span>
          )}
          {filters.difficulty !== 'any' && (
            <span className="px-3 py-1 bg-green-600/20 text-green-300 text-xs rounded-full border border-green-500/30">
              🎯 {filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1)}
            </span>
          )}
          {filters.mealType !== 'any' && (
            <span className="px-3 py-1 bg-orange-600/20 text-orange-300 text-xs rounded-full border border-orange-500/30">
              🍽️ {filters.mealType.charAt(0).toUpperCase() + filters.mealType.slice(1)}
            </span>
          )}
          {Object.values(filters).every(value => value === 'any' || value === 180) && (
            <span className="px-3 py-1 bg-gray-600/20 text-gray-300 text-xs rounded-full border border-gray-500/30">
              No filters applied
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 