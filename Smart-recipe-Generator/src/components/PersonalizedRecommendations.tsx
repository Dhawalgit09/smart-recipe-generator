'use client';

import React, { useState, useEffect } from 'react';
import { Recipe } from '../types/recipe';

interface PersonalizedRecommendationsProps {
  userId: string;
  onRecipeSelect: (recipe: Recipe) => void;
}

interface RecommendationData {
  recommendations: Recipe[];
  userPreferences: {
    favoriteCuisines: string[];
    preferredCookingTime: number;
    dietaryRestrictions: string[];
    totalFeedback: number;
  };
  totalFound: number;
}

export default function PersonalizedRecommendations({ userId, onRecipeSelect }: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/recommendations?userId=${userId}&limit=10`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load recommendations');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    }
  }, [userId]);

  const handleRefreshRecommendations = () => {
    fetchRecommendations();
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    onRecipeSelect(recipe);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading personalized recommendations...</p>
        <p className="text-gray-400 text-sm mt-2">Analyzing your taste preferences</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 text-center">
        <p className="text-red-300 font-semibold mb-2">Failed to Load Recommendations</p>
        <p className="text-red-200 text-sm mb-4">{error}</p>
        <button
          onClick={handleRefreshRecommendations}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍳</div>
        <h3 className="text-2xl font-bold text-white mb-2">No Recommendations Yet</h3>
        <p className="text-gray-300 mb-6">
          Start rating recipes to get personalized recommendations tailored to your taste!
        </p>
        <button
          onClick={handleRefreshRecommendations}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300"
        >
          Refresh Recommendations
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          🎯 Personalized Recommendations
        </h2>
        <p className="text-gray-300 mb-6">
          Based on your {recommendations.userPreferences.totalFeedback} ratings and preferences
        </p>

        {/* User Preferences Summary */}
        <div className="bg-[#1a1a2e] rounded-2xl border border-[#2d2d5a] p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Your Taste Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🌍</div>
              <div className="text-white font-semibold">Favorite Cuisines</div>
              <div className="text-gray-300 text-sm">
                {recommendations.userPreferences.favoriteCuisines.length > 0 
                  ? recommendations.userPreferences.favoriteCuisines.join(', ')
                  : 'None yet'
                }
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⏱️</div>
              <div className="text-white font-semibold">Preferred Time</div>
              <div className="text-gray-300 text-sm">
                {recommendations.userPreferences.preferredCookingTime} minutes
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-white font-semibold">Total Ratings</div>
              <div className="text-gray-300 text-sm">
                {recommendations.userPreferences.totalFeedback} recipes
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={handleRefreshRecommendations}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300"
          >
            🔄 Refresh Recommendations
          </button>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.recommendations.map((recipe, index) => (
          <div
            key={recipe.recipeId || recipe.id || index}
            className="bg-[#1a1a2e] rounded-2xl border border-[#2d2d5a] p-6 hover:border-purple-500/50 transform hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={() => handleRecipeSelect(recipe)}
          >
            {/* Recipe Image Placeholder */}
            <div className="w-full h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl mb-4 flex items-center justify-center">
              <div className="text-6xl opacity-40">🍳</div>
            </div>

            {/* Recipe Info */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white line-clamp-2">
                {recipe.name || recipe.title}
              </h3>
              
              <p className="text-gray-300 text-sm line-clamp-2">
                {recipe.description}
              </p>

              {/* Recipe Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-white">{recipe.rating?.toFixed(1) || '4.5'}</span>
                  <span className="text-gray-400">({recipe.totalRatings || 0})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400">⏱️</span>
                  <span className="text-white">{recipe.cookingTime || recipe.cook_time_min || 30}m</span>
                </div>
              </div>

              {/* Cuisine and Difficulty */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-300 capitalize">
                  {recipe.cuisineType || recipe.cuisine}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  recipe.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                  recipe.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {recipe.difficulty}
                </span>
              </div>

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {recipe.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No More Recommendations */}
      {recommendations.totalFound > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">
            Showing {recommendations.recommendations.length} of {recommendations.totalFound} recommendations
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Rate more recipes to get even better recommendations!
          </p>
        </div>
      )}
    </div>
  );
}
