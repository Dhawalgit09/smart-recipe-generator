'use client';

import React, { useState, useEffect } from 'react';
import { Recipe } from '../types/recipe';

interface RecipeFeedbackProps {
  recipe: Recipe;
  userId: string;
  onFeedbackSubmitted?: () => void;
  onClose?: () => void;
}

interface FeedbackData {
  rating: number;
  review: string;
  isFavorite: boolean;
  cookingNotes: string;
  difficultyRating: number;
  tasteRating: number;
  presentationRating: number;
  wouldCookAgain: boolean;
  tags: string[];
}

export default function RecipeFeedback({ recipe, userId, onFeedbackSubmitted, onClose }: RecipeFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    review: '',
    isFavorite: false,
    cookingNotes: '',
    difficultyRating: 0,
    tasteRating: 0,
    presentationRating: 0,
    wouldCookAgain: true,
    tags: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  // Check for existing feedback
  useEffect(() => {
    const checkExistingFeedback = async () => {
      try {
        const response = await fetch(`/api/feedback?userId=${userId}&recipeId=${recipe.id}`);
        const data = await response.json();
        
        if (data.success && data.feedback.length > 0) {
          const existing = data.feedback[0];
          setExistingFeedback(existing);
          setFeedback({
            rating: existing.rating,
            review: existing.review || '',
            isFavorite: existing.isFavorite,
            cookingNotes: existing.cookingNotes || '',
            difficultyRating: existing.difficultyRating || 0,
            tasteRating: existing.tasteRating || 0,
            presentationRating: existing.presentationRating || 0,
            wouldCookAgain: existing.wouldCookAgain,
            tags: existing.tags || []
          });
        }
      } catch (error) {
        console.error('Error checking existing feedback:', error);
      }
    };

    checkExistingFeedback();
  }, [userId, recipe.id]);

  const handleRatingChange = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleInputChange = (field: keyof FeedbackData, value: any) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFeedback(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (feedback.rating === 0) {
      alert('Please provide a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          recipeId: recipe.id,
          ...feedback
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(existingFeedback ? 'Feedback updated successfully!' : 'Feedback submitted successfully!');
        onFeedbackSubmitted?.();
        onClose?.();
      } else {
        alert('Error submitting feedback: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickTags = [
    'Delicious', 'Easy to make', 'Quick', 'Healthy', 'Family favorite',
    'Impressive', 'Budget-friendly', 'Meal prep', 'Weeknight dinner', 'Special occasion'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a2e] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#2d2d5a]">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a2e] p-6 border-b border-[#2d2d5a] rounded-t-3xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {existingFeedback ? 'Update Feedback' : 'Rate This Recipe'}
              </h2>
              <p className="text-gray-300">{recipe.name}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-all duration-300"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Overall Rating */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-white">
              Overall Rating *
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className={`text-3xl transition-all duration-200 ${
                    star <= feedback.rating
                      ? 'text-yellow-400 hover:text-yellow-300'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              {feedback.rating > 0 && (
                <>
                  {feedback.rating === 1 && 'Poor'}
                  {feedback.rating === 2 && 'Fair'}
                  {feedback.rating === 3 && 'Good'}
                  {feedback.rating === 4 && 'Very Good'}
                  {feedback.rating === 5 && 'Excellent'}
                </>
              )}
            </p>
          </div>

          {/* Detailed Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Taste Rating */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Taste</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleInputChange('tasteRating', star)}
                    className={`text-lg transition-all duration-200 ${
                      star <= feedback.tasteRating
                        ? 'text-yellow-400'
                        : 'text-gray-400'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Rating */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Difficulty</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleInputChange('difficultyRating', star)}
                    className={`text-lg transition-all duration-200 ${
                      star <= feedback.difficultyRating
                        ? 'text-blue-400'
                        : 'text-gray-400'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Presentation Rating */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Presentation</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleInputChange('presentationRating', star)}
                    className={`text-lg transition-all duration-200 ${
                      star <= feedback.presentationRating
                        ? 'text-green-400'
                        : 'text-gray-400'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Favorite Toggle */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleInputChange('isFavorite', !feedback.isFavorite)}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                feedback.isFavorite
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'border-gray-400 text-transparent'
              }`}
            >
              {feedback.isFavorite && '♥'}
            </button>
            <label className="text-white font-medium">Add to Favorites</label>
          </div>

          {/* Would Cook Again */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleInputChange('wouldCookAgain', !feedback.wouldCookAgain)}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                feedback.wouldCookAgain
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-400 text-transparent'
              }`}
            >
              {feedback.wouldCookAgain && '✓'}
            </button>
            <label className="text-white font-medium">Would cook again</label>
          </div>

          {/* Quick Tags */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white">Quick Tags</label>
            <div className="flex flex-wrap gap-2">
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    feedback.tags.includes(tag)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Review */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white">
              Review (Optional)
            </label>
            <textarea
              value={feedback.review}
              onChange={(e) => handleInputChange('review', e.target.value)}
              placeholder="Share your thoughts about this recipe..."
              className="w-full h-24 bg-[#0f0f23] border border-[#2d2d5a] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors resize-none"
              maxLength={1000}
            />
            <p className="text-gray-400 text-xs text-right">
              {feedback.review.length}/1000
            </p>
          </div>

          {/* Cooking Notes */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white">
              Cooking Notes (Optional)
            </label>
            <textarea
              value={feedback.cookingNotes}
              onChange={(e) => handleInputChange('cookingNotes', e.target.value)}
              placeholder="Any modifications, tips, or notes for next time..."
              className="w-full h-20 bg-[#0f0f23] border border-[#2d2d5a] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors resize-none"
              maxLength={500}
            />
            <p className="text-gray-400 text-xs text-right">
              {feedback.cookingNotes.length}/500
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || feedback.rating === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isSubmitting ? 'Submitting...' : (existingFeedback ? 'Update Feedback' : 'Submit Feedback')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
