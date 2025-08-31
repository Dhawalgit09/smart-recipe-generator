'use client';

import { useState, useEffect } from 'react';
import IngredientInputForm from '../components/IngredientInputForm';
import RecipeGenerator from '../modules/recipeGeneration/RecipeGenerator';
import PersonalizedRecommendations from '../components/PersonalizedRecommendations';
import ImageRecipeGenerator from '../components/ImageRecipeGenerator';
import { UserInputForm } from '../types/recipe';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserInputForm | null>(null);
  const [showRecipeGenerator, setShowRecipeGenerator] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  // Generate or retrieve user ID on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('chefai_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chefai_user_id', newUserId);
      setUserId(newUserId);
    }
  }, []);

  const handleFormSubmit = async (data: UserInputForm) => {
    setIsLoading(true);
    setFormData(data);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Form submitted with data:', data);
      setShowRecipeGenerator(true);
    } catch (error) {
      console.error('Error generating recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setShowRecipeGenerator(false);
    setShowRecommendations(false);
    setShowImageGenerator(false);
    setFormData(null);
    setSelectedRecipe(null);
  };

  const handleShowRecommendations = () => {
    setShowRecommendations(true);
    setShowRecipeGenerator(false);
    setShowImageGenerator(false);
  };

  const handleShowImageGenerator = () => {
    setShowImageGenerator(true);
    setShowRecipeGenerator(false);
    setShowRecommendations(false);
  };

  const handleRecipeSelect = (recipe: any) => {
    setSelectedRecipe(recipe);
  };

  return (
    <div className="min-h-screen bg-[#0f0f23]">
      {/* Navigation Bar - Exact ChefAI Style */}
      <nav className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">👨‍🍳</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ChefAI
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => {
                  setShowRecipeGenerator(false);
                  setShowRecommendations(false);
                  setShowImageGenerator(false);
                  setFormData(null);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                Create Recipe
              </button>
              <button
                onClick={handleShowImageGenerator}
                className="text-white/80 hover:text-white transition-colors"
              >
                📸 AI Recipe Generator
              </button>
              <button
                onClick={handleShowRecommendations}
                className="text-white/80 hover:text-white transition-colors"
              >
                Recommendations
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {!showRecipeGenerator && !showRecommendations && !showImageGenerator ? (
        /* Recipe Form Section - Only This Section */
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Start Creating Your Recipe
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Use our advanced form to customize your recipe preferences
              </p>
            </div>
            
            <IngredientInputForm 
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
            />
          </div>
        </section>
      ) : showImageGenerator ? (
        /* Image-Based Recipe Generator Section */
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Back to Form Button */}
            <div className="mb-8">
              <button
                onClick={handleBackToForm}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300"
              >
                <span>←</span>
                <span>Back to Form</span>
              </button>
            </div>
            
            <ImageRecipeGenerator />
          </div>
        </section>
      ) : showRecommendations ? (
        /* Recommendations Section */
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Back to Form Button */}
            <div className="mb-8">
              <button
                onClick={handleBackToForm}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300"
              >
                <span>←</span>
                <span>Back to Form</span>
              </button>
            </div>
            
            <PersonalizedRecommendations
              userId={userId}
              onRecipeSelect={handleRecipeSelect}
            />
          </div>
        </section>
      ) : (
        /* Recipe Generation Section */
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Back to Form Button */}
            <div className="mb-8">
              <button
                onClick={handleBackToForm}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300"
              >
                <span>←</span>
                <span>Back to Form</span>
              </button>
            </div>
            
            <RecipeGenerator
              userIngredients={formData!.ingredients}
              dietaryPreferences={formData!.dietaryPreferences}
              servingSize={formData!.servingSize}
              cuisineType={formData!.cuisineType}
              cookingTime={formData!.cookingTime}
              userId={userId}
            />
          </div>
        </section>
      )}

      {/* Success Modal - Exact ChefAI Style */}
      {formData && !isLoading && !showRecipeGenerator && !showRecommendations && !showImageGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] backdrop-blur-md rounded-3xl p-8 max-w-2xl mx-4 transform animate-bounce-in border border-[#2d2d5a]">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Recipe Request Sent!
              </h3>
              <div className="text-left space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong className="text-purple-400">Ingredients:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {formData.ingredients.map((ingredient, index) => (
                        <li key={index} className="text-gray-300">✨ {ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-purple-400">Dietary Preferences:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {formData.dietaryPreferences.length > 0 ? (
                        formData.dietaryPreferences.map((pref, index) => (
                          <li key={index} className="text-gray-300">✨ {pref}</li>
                        ))
                      ) : (
                        <li className="text-gray-500">✨ None selected</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-purple-400">Serving Size:</strong> ✨ {formData.servingSize} people
                  </div>
                  <div>
                    <strong className="text-purple-400">Cuisine Type:</strong> ✨ {formData.cuisineType || 'Any cuisine'}
                  </div>
                  <div>
                    <strong className="text-purple-400">Max Cooking Time:</strong> ✨ {formData.cookingTime} minutes
                  </div>
                </div>
              </div>
              <div className="mt-6 space-x-4">
                <button
                  onClick={() => setFormData(null)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-all duration-300"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowRecipeGenerator(true)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300"
                >
                  🍳 View Recipe Suggestions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
