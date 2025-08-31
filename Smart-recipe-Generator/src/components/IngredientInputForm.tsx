'use client';

import React, { useCallback } from 'react';
import { UserInputForm } from '../types/recipe';
import { commonIngredients, dietaryPreferences, cuisineTypes } from '../data/ingredients';
import { useIngredientForm } from '../hooks/useIngredientForm';

interface IngredientInputFormProps {
  onSubmit: (formData: UserInputForm) => void;
  isLoading?: boolean;
}

export default function IngredientInputForm({ onSubmit, isLoading = false }: IngredientInputFormProps) {
  const {
    formData,
    customIngredient,
    searchTerm,
    validation,
    canSubmit,
    addIngredient,
    removeIngredient,
    toggleDietaryPreference,
    updateField,
    setCustomIngredient,
    setSearchTerm,
    getFieldError
  } = useIngredientForm();

  // Filter ingredients based on search term
  const filteredIngredients = commonIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (validation.isValid) {
      onSubmit(formData);
    }
  }, [formData, validation.isValid, onSubmit]);

  // Handle custom ingredient submission
  const handleCustomIngredientSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const result = addIngredient(customIngredient);
    if (!result.success) {
      console.error('Failed to add ingredient:', result.error);
    }
  }, [customIngredient, addIngredient]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Professional Form Container - Exact ChefAI Style */}
      <div className="relative">
        {/* Subtle Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur opacity-50"></div>
        
        <div className="relative bg-[#0f0f23] backdrop-blur-xl rounded-3xl border border-[#2d2d5a] p-8 shadow-2xl">
          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              🍳 Recipe Creation Form
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Input your ingredients and preferences to generate personalized recipes
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Ingredients Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                  <span className="text-2xl">🥕</span>
                  Available Ingredients
                  <span className="text-2xl">🥕</span>
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
              </div>
              
              {/* Custom Ingredient Input */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative flex gap-3 bg-[#1a1a2e] backdrop-blur-md rounded-2xl p-4 border border-[#2d2d5a]">
                  <input
                    type="text"
                    value={customIngredient}
                    onChange={(e) => setCustomIngredient(e.target.value)}
                    placeholder="Type a custom ingredient..."
                    className="flex-1 px-4 py-3 bg-transparent text-white placeholder-white/60 border-none outline-none text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const result = addIngredient(customIngredient);
                      if (!result.success) {
                        console.error('Failed to add ingredient:', result.error);
                      }
                    }}
                    disabled={!customIngredient.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Search and Select Common Ingredients */}
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search common ingredients..."
                    className="w-full px-6 py-4 bg-[#1a1a2e] backdrop-blur-md border border-[#2d2d5a] rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-lg transition-all duration-300"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60">
                    🔍
                  </div>
                </div>
                
                {searchTerm && (
                  <div className="max-h-64 overflow-y-auto bg-[#1a1a2e] backdrop-blur-md rounded-2xl border border-[#2d2d5a]">
                    {filteredIngredients.map(ingredient => (
                      <button
                        key={ingredient.id}
                        type="button"
                        onClick={() => addIngredient(ingredient.name)}
                        className="w-full text-left px-6 py-4 hover:bg-[#0f0f23] border-b border-[#2d2d5a] last:border-b-0 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                              {ingredient.name}
                            </span>
                            <span className="text-sm text-white/60 ml-3">({ingredient.category})</span>
                          </div>
                          <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            +
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Ingredients */}
              {formData.ingredients.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-white text-center">
                    Selected Ingredients ({formData.ingredients.length})
                  </h4>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {formData.ingredients.map(ingredient => (
                      <span
                        key={ingredient}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md text-white rounded-full border border-[#2d2d5a] hover:from-purple-500/30 hover:to-pink-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg"
                      >
                        {ingredient}
                        <button
                          type="button"
                          onClick={() => removeIngredient(ingredient)}
                          className="text-purple-300 hover:text-purple-100 transition-colors ml-2"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dietary Preferences Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                  <span className="text-2xl">🥗</span>
                  Dietary Preferences
                  <span className="text-2xl">🥗</span>
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-400 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dietaryPreferences.map(preference => (
                  <label
                    key={preference.id}
                    className="group cursor-pointer"
                  >
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600/30 to-blue-600/30 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
                      <div className="relative p-4 bg-[#1a1a2e] backdrop-blur-md rounded-xl border border-[#2d2d5a] hover:bg-[#0f0f23] transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={formData.dietaryPreferences.includes(preference.id)}
                            onChange={() => toggleDietaryPreference(preference.id)}
                            className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-[#2d2d5a] rounded bg-[#0f0f23]"
                          />
                          <div>
                            <div className="font-semibold text-white group-hover:text-green-300 transition-colors">
                              {preference.name}
                            </div>
                            <div className="text-sm text-white/70 mt-1">
                              {preference.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                  <span className="text-2xl">⚙️</span>
                  Recipe Settings
                  <span className="text-2xl">⚙️</span>
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-white text-center">
                    👥 Serving Size
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.servingSize}
                      onChange={(e) => updateField('servingSize', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 bg-[#1a1a2e] border border-[#2d2d5a] rounded-xl text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60">
                      👥
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-white text-center">
                    🌍 Cuisine Type
                  </label>
                  <div className="relative">
                    <select
                      value={formData.cuisineType}
                      onChange={(e) => updateField('cuisineType', e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a1a2e] border border-[#2d2d5a] rounded-xl text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent appearance-none"
                    >
                      <option value="" className="bg-[#0f0f23] text-white">Any cuisine</option>
                      {cuisineTypes.map(cuisine => (
                        <option key={cuisine} value={cuisine} className="bg-[#0f0f23] text-white">
                          {cuisine}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none">
                      🌍
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-white text-center">
                    ⏰ Cooking Time
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={formData.cookingTime}
                      onChange={(e) => updateField('cookingTime', parseInt(e.target.value) || 30)}
                      className="w-full px-4 py-3 bg-[#1a1a2e] border border-[#2d2d5a] rounded-xl text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60">
                      ⏰
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {!validation.isValid && validation.errors.length > 0 && (
              <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-2xl p-6">
                <h4 className="text-red-300 font-semibold mb-3 text-center">
                  ⚠️ Please fix the following issues:
                </h4>
                <ul className="list-disc list-inside text-red-200 space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center pt-6">
              <button
                type="submit"
                disabled={isLoading || !canSubmit}
                className="group relative px-12 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-2xl hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-2xl font-bold transform hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-purple-500/25 disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="spinner"></div>
                    <span>Generating Recipe...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-3">
                    🚀 Generate Recipe
                  </span>
                )}
                
                {/* Button Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 -z-10"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 