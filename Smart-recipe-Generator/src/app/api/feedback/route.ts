import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RecipeFeedback from '@/models/RecipeFeedback';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { userId, recipeId, rating, review, isFavorite, cookingNotes, difficultyRating, tasteRating, presentationRating, wouldCookAgain, tags } = body;

    // Validate required fields
    if (!userId || !recipeId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, recipeId, rating' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if feedback already exists
    const existingFeedback = await RecipeFeedback.findOne({ userId, recipeId });
    
    if (existingFeedback) {
      // Update existing feedback
      const updatedFeedback = await RecipeFeedback.findOneAndUpdate(
        { userId, recipeId },
        {
          rating,
          review,
          isFavorite,
          cookingNotes,
          difficultyRating,
          tasteRating,
          presentationRating,
          wouldCookAgain,
          tags
        },
        { new: true }
      );

      // Update recipe average rating
      await updateRecipeRating(recipeId);
      
      // Update user preferences based on feedback
      await updateUserPreferences(userId, recipeId, rating, isFavorite);

      return NextResponse.json({
        success: true,
        message: 'Feedback updated successfully',
        feedback: updatedFeedback
      });
    } else {
      // Create new feedback
      const newFeedback = new RecipeFeedback({
        userId,
        recipeId,
        rating,
        review,
        isFavorite,
        cookingNotes,
        difficultyRating,
        tasteRating,
        presentationRating,
        wouldCookAgain,
        tags
      });

      await newFeedback.save();

      // Update recipe average rating
      await updateRecipeRating(recipeId);
      
      // Update user preferences based on feedback
      await updateUserPreferences(userId, recipeId, rating, isFavorite);

      return NextResponse.json({
        success: true,
        message: 'Feedback submitted successfully',
        feedback: newFeedback
      });
    }

  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const recipeId = searchParams.get('recipeId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    let query: any = { userId };

    if (recipeId) {
      query.recipeId = recipeId;
    }

    const feedback = await RecipeFeedback.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      feedback
    });

  } catch (error) {
    console.error('Feedback retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update recipe average rating
async function updateRecipeRating(recipeId: string) {
  try {
    const feedbacks = await RecipeFeedback.find({ recipeId });
    
    if (feedbacks.length > 0) {
      const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
      const averageRating = totalRating / feedbacks.length;

      await Recipe.findOneAndUpdate(
        { recipeId },
        {
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
          totalRatings: feedbacks.length
        }
      );
    }
  } catch (error) {
    console.error('Error updating recipe rating:', error);
  }
}

// Helper function to update user preferences based on feedback
async function updateUserPreferences(userId: string, recipeId: string, rating: number, isFavorite: boolean) {
  try {
    const recipe = await Recipe.findOne({ recipeId });
    if (!recipe) return;

    let user = await User.findOne({ userId });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        userId,
        preferences: {
          dietaryRestrictions: [],
          favoriteCuisines: [],
          preferredCookingTime: 30,
          spiceLevel: 'medium',
          servingSize: 4
        },
        feedbackHistory: [],
        favoriteRecipes: []
      });
    }

    // Add feedback to history
    const feedback = await RecipeFeedback.findOne({ userId, recipeId });
    if (feedback && !user.feedbackHistory.includes(feedback._id)) {
      user.feedbackHistory.push(feedback._id);
    }

    // Update favorite recipes
    if (isFavorite && !user.favoriteRecipes.includes(recipe._id)) {
      user.favoriteRecipes.push(recipe._id);
    } else if (!isFavorite) {
      user.favoriteRecipes = user.favoriteRecipes.filter(
        (id: mongoose.Types.ObjectId) => !id.equals(recipe._id as mongoose.Types.ObjectId)
      );
      
    }

    // Update preferences based on high-rated recipes
    if (rating >= 4) {
      // Add cuisine to favorites if not already there
      if (!user.preferences.favoriteCuisines.includes(recipe.cuisineType)) {
        user.preferences.favoriteCuisines.push(recipe.cuisineType);
      }

      // Update preferred cooking time based on successful recipes
      if (recipe.cookingTime > 0) {
        const currentTime = user.preferences.preferredCookingTime;
        user.preferences.preferredCookingTime = Math.round((currentTime + recipe.cookingTime) / 2);
      }
    }

    await user.save();
  } catch (error) {
    console.error('Error updating user preferences:', error);
  }
}
