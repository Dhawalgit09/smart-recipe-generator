'use client';

import React, { useState, useEffect } from 'react';
import { Recipe, IngredientMatch } from '../../types/recipe';
import RecipeFeedback from '../../components/RecipeFeedback';

interface RecipeDetailsProps {
  recipe: Recipe;
  userIngredients: string[];
  onClose: () => void;
  userId?: string;
}

export default function RecipeDetails({ recipe, userIngredients, onClose, userId }: RecipeDetailsProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [userFeedback, setUserFeedback] = useState<any>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  // Check for existing user feedback
  useEffect(() => {
    if (userId) {
      checkUserFeedback();
    }
  }, [userId, recipe.id]);

  const checkUserFeedback = async () => {
    setIsLoadingFeedback(true);
    try {
      const response = await fetch(`/api/feedback?userId=${userId}&recipeId=${recipe.id}`);
      const data = await response.json();
      
      if (data.success && data.feedback.length > 0) {
        setUserFeedback(data.feedback[0]);
      }
    } catch (error) {
      console.error('Error checking user feedback:', error);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  // Group ingredient matches by type for better display
  const ingredientMatches = userIngredients.map(userIngredient => {
    const recipeIngredient = recipe.ingredients.find(ing => 
      ing.ingredient.toLowerCase().includes(userIngredient.toLowerCase()) ||
      userIngredient.toLowerCase().includes(ing.ingredient.toLowerCase())
    );
    
    if (recipeIngredient) {
      return {
        userIngredient,
        recipeIngredient: recipeIngredient.ingredient,
        matchType: 'exact' as const,
        confidence: 1.0
      };
    }
    
    return {
      userIngredient,
      recipeIngredient: 'Not found',
      matchType: 'missing' as const,
      confidence: 0.0
    };
  });

  const exactMatches = ingredientMatches.filter(m => m.matchType === 'exact');
  // Get missing ingredients for display purposes
  const missingIngredientsForDisplay = recipe.ingredients.filter(ing => 
    !userIngredients.some(userIng => 
      userIng.toLowerCase().includes(ing.ingredient.toLowerCase()) ||
      ing.ingredient.toLowerCase().includes(userIng.toLowerCase())
    )
  );

  const handleFeedbackSubmitted = () => {
    checkUserFeedback(); // Refresh feedback data
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a2e] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#2d2d5a]">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a2e] p-6 border-b border-[#2d2d5a] rounded-t-3xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{recipe.name}</h2>
              <p className="text-gray-300 text-lg mb-4">{recipe.description}</p>
              
              {/* Rating Display */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="text-white font-bold text-lg">{recipe.rating}</span>
                  <span className="text-gray-400">({recipe.totalRatings} ratings)</span>
                </div>
                
                {/* User's Rating */}
                {userFeedback && (
                  <div className="flex items-center space-x-1">
                    <span className="text-purple-400 text-sm">Your rating:</span>
                    <span className="text-yellow-400">★</span>
                    <span className="text-white font-semibold">{userFeedback.rating}</span>
                    {userFeedback.isFavorite && (
                      <span className="text-red-400 ml-2">♥</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Feedback Button */}
              {userId && (
                <button
                  onClick={() => setShowFeedback(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold"
                >
                  {userFeedback ? 'Update Rating' : 'Rate Recipe'}
                </button>
              )}
              
              <button
                onClick={onClose}
                className="w-10 h-10 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-all duration-300"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Recipe Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl mb-1">⏱️</div>
              <div className="text-white font-semibold">{recipe.cookingTime}m</div>
              <div className="text-gray-400 text-sm">Cook Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">👥</div>
              <div className="text-white font-semibold">{recipe.servings}</div>
              <div className="text-gray-400 text-sm">Servings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-white font-semibold capitalize">{recipe.difficulty}</div>
              <div className="text-gray-400 text-sm">Difficulty</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🌍</div>
              <div className="text-white font-semibold capitalize">{recipe.cuisineType}</div>
              <div className="text-gray-400 text-sm">Cuisine</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Ingredient Analysis */}
          <div className="bg-[#0f0f23] rounded-2xl p-6 border border-[#2d2d5a]">
            <h3 className="text-xl font-bold text-white mb-4">📋 Ingredient Analysis</h3>
            
            {/* Your Ingredients */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">Your Ingredients ({userIngredients.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ingredientMatches.map((match, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${
                      match.matchType === 'exact' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-gray-300">{match.userIngredient}</span>
                    <span className="text-gray-500 text-sm">
                      {match.matchType === 'exact' ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recipe Ingredients */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Recipe Ingredients ({recipe.ingredients.length})</h4>
              <div className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`w-3 h-3 rounded-full ${
                        userIngredients.some(userIng => 
                          userIng.toLowerCase().includes(ingredient.ingredient.toLowerCase()) ||
                          ingredient.ingredient.toLowerCase().includes(userIng.toLowerCase())
                        ) ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-white font-medium">{ingredient.ingredient}</span>
                      {ingredient.isOptional && (
                        <span className="text-purple-400 text-sm">(Optional)</span>
                      )}
                    </div>
                    <div className="text-gray-300 text-sm">
                      {ingredient.amount} {ingredient.unit}
                      {ingredient.notes && (
                        <span className="text-gray-500 ml-2">- {ingredient.notes}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-[#0f0f23] rounded-2xl p-6 border border-[#2d2d5a]">
            <h3 className="text-xl font-bold text-white mb-4">👨‍🍳 Cooking Instructions</h3>
            <div className="space-y-4">
              {recipe.instructions.map((step, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1">
                    <p className="text-white leading-relaxed">{step.instruction}</p>
                    {step.timeMinutes && (
                      <p className="text-gray-400 text-sm mt-1">⏱️ {step.timeMinutes} minutes</p>
                    )}
                    {step.tips && (
                      <p className="text-purple-300 text-sm mt-1">💡 {step.tips}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nutritional Information */}
          <div className="bg-[#0f0f23] rounded-2xl p-6 border border-[#2d2d5a]">
            <h3 className="text-xl font-bold text-white mb-4">📊 Nutritional Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{recipe.nutritionalInfo.calories}</div>
                <div className="text-gray-400 text-sm">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{recipe.nutritionalInfo.protein}g</div>
                <div className="text-gray-400 text-sm">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{recipe.nutritionalInfo.carbs}g</div>
                <div className="text-gray-400 text-sm">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{recipe.nutritionalInfo.fat}g</div>
                <div className="text-gray-400 text-sm">Fat</div>
              </div>
            </div>
            
            {/* Additional Nutritional Info */}
            {(recipe.nutritionalInfo.fiber || recipe.nutritionalInfo.sugar) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#2d2d5a]">
                {recipe.nutritionalInfo.fiber && (
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{recipe.nutritionalInfo.fiber}g</div>
                    <div className="text-gray-400 text-sm">Fiber</div>
                  </div>
                )}
                {recipe.nutritionalInfo.sugar && (
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{recipe.nutritionalInfo.sugar}g</div>
                    <div className="text-gray-400 text-sm">Sugar</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recipe Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="bg-[#0f0f23] rounded-2xl p-6 border border-[#2d2d5a]">
              <h3 className="text-xl font-bold text-white mb-4">🏷️ Tags</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && userId && (
        <RecipeFeedback
          recipe={recipe}
          userId={userId}
          onFeedbackSubmitted={handleFeedbackSubmitted}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}