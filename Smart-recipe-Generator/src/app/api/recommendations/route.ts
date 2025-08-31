import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Recipe from '@/models/Recipe';
import RecipeFeedback from '@/models/RecipeFeedback';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await User.findOne({ userId });
    if (!user) {
      console.log(`Creating new user with ID: ${userId}`);
      // Create new user with default preferences
      user = await User.create({
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
      console.log(`✅ New user created: ${userId}`);
    }

    // Get user's feedback history
    const userFeedback = await RecipeFeedback.find({ userId })
      .populate('recipeId')
      .sort({ createdAt: -1 })
      .limit(20);

    // Extract user preferences
    const userPreferences = user.preferences;
    const favoriteCuisines = userPreferences.favoriteCuisines;
    const preferredCookingTime = userPreferences.preferredCookingTime;
    const dietaryRestrictions = userPreferences.dietaryRestrictions;

    // Get recipes the user has already rated
    const ratedRecipeIds = userFeedback.map(feedback => feedback.recipeId);

    // Build recommendation query
    let query: any = {
      recipeId: { $nin: ratedRecipeIds } // Exclude already rated recipes
    };

    // Filter by favorite cuisines if available
    if (favoriteCuisines.length > 0) {
      query.cuisineType = { $in: favoriteCuisines };
    }

    // Filter by cooking time preference (within 20% range)
    const timeRange = preferredCookingTime * 0.2;
    query.cookingTime = {
      $gte: Math.max(15, preferredCookingTime - timeRange),
      $lte: preferredCookingTime + timeRange
    };

    // Get recommended recipes
    let recommendedRecipes = await Recipe.find(query)
      .sort({ rating: -1, totalRatings: -1 })
      .limit(limit * 2); // Get more recipes for ranking

    // If no recipes found with preferences, get general recommendations
    if (recommendedRecipes.length === 0) {
      console.log('No recipes found with user preferences, getting general recommendations');
      recommendedRecipes = await Recipe.find({ recipeId: { $nin: ratedRecipeIds } })
        .sort({ rating: -1, totalRatings: -1 })
        .limit(limit * 2);
    }

    // If still no recipes in database, use sample recipes
    if (recommendedRecipes.length === 0) {
      console.log('No recipes in database, using sample recipes');
      const { sampleRecipes } = await import('@/data/sampleRecipes');
      
      // Convert sample recipes to database format
      recommendedRecipes = sampleRecipes.map(recipe => ({
        recipeId: recipe.id,
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        nutritionalInfo: recipe.nutritionalInfo,
        cookingTime: recipe.cookingTime,
        difficulty: recipe.difficulty,
        cuisineType: recipe.cuisineType,
        mealType: recipe.mealType,
        tags: recipe.tags,
        rating: recipe.rating,
        totalRatings: Math.floor(Math.random() * 50) + 10, // Random rating count
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        totalTime: recipe.totalTime,
        isAIGenerated: false,
        source: 'sample'
      }));
    }

    // Rank recommendations based on user preferences and feedback patterns
    const rankedRecipes = rankRecommendations(recommendedRecipes, userPreferences, userFeedback);

    // Get collaborative recommendations if user has feedback history
    let collaborativeRecipes: any[] = [];
    if (userFeedback.length > 0) {
      collaborativeRecipes = await getCollaborativeRecommendations(userId, ratedRecipeIds, limit);
    }

    // Combine and deduplicate recommendations
    const allRecommendations = [...rankedRecipes, ...collaborativeRecipes];
    const uniqueRecommendations = allRecommendations.filter((recipe, index, self) => 
      index === self.findIndex(r => r.recipeId === recipe.recipeId)
    );

    // Limit final results
    const finalRecommendations = uniqueRecommendations.slice(0, limit);

    return NextResponse.json({
      recommendations: finalRecommendations,
      userPreferences: {
        favoriteCuisines: userPreferences.favoriteCuisines,
        preferredCookingTime: userPreferences.preferredCookingTime,
        dietaryRestrictions: userPreferences.dietaryRestrictions,
        totalFeedback: userFeedback.length
      },
      totalFound: finalRecommendations.length
    });

  } catch (error) {
    console.error('Recommendations API Error:', error);
    return NextResponse.json(
      { error: 'Failed to load recommendations' },
      { status: 500 }
    );
  }
}

// Get collaborative recommendations based on similar users
async function getCollaborativeRecommendations(userId: string, ratedRecipeIds: string[], limit: number) {
  try {
    // Find users with similar feedback patterns
    const similarUsers = await RecipeFeedback.aggregate([
      {
        $match: {
          userId: { $ne: userId },
          rating: { $gte: 4 } // Users who rated highly
        }
      },
      {
        $group: {
          _id: '$userId',
          favoriteRecipes: { $push: '$recipeId' },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $match: {
          avgRating: { $gte: 4.0 }
        }
      },
      {
        $limit: 10
      }
    ]);

    if (similarUsers.length === 0) {
      return [];
    }

    // Get recipes that similar users liked but current user hasn't rated
    const recommendedRecipeIds = similarUsers.flatMap(user => user.favoriteRecipes);
    const uniqueRecipeIds = [...new Set(recommendedRecipeIds)].filter(id => 
      !ratedRecipeIds.includes(id)
    );

    if (uniqueRecipeIds.length === 0) {
      return [];
    }

    // Get the actual recipes
    const collaborativeRecipes = await Recipe.find({
      recipeId: { $in: uniqueRecipeIds }
    })
    .sort({ rating: -1 })
    .limit(limit);

    return collaborativeRecipes;

  } catch (error) {
    console.error('Collaborative recommendations error:', error);
    return [];
  }
}

// Rank recommendations based on user preferences and feedback patterns
function rankRecommendations(recipes: any[], userPreferences: any, userFeedback: any[]) {
  return recipes.map(recipe => {
    let score = 0;

    // Base score from recipe rating
    score += recipe.rating * 2;

    // Cuisine preference bonus
    if (userPreferences.favoriteCuisines.includes(recipe.cuisineType)) {
      score += 10;
    }

    // Cooking time preference bonus
    const timeDiff = Math.abs(recipe.cookingTime - userPreferences.preferredCookingTime);
    if (timeDiff <= 10) {
      score += 5;
    } else if (timeDiff <= 20) {
      score += 2;
    }

    // Popularity bonus (more ratings = more trusted)
    score += Math.min(recipe.totalRatings / 10, 5);

    // Difficulty preference (assume users prefer similar difficulty levels)
    const userDifficultyPreference = getUserDifficultyPreference(userFeedback);
    if (userDifficultyPreference === recipe.difficulty) {
      score += 3;
    }

    return {
      ...recipe.toObject ? recipe.toObject() : recipe,
      recommendationScore: score
    };
  }).sort((a, b) => b.recommendationScore - a.recommendationScore);
}

// Determine user's preferred difficulty level based on feedback
function getUserDifficultyPreference(userFeedback: any[]) {
  if (userFeedback.length === 0) return 'medium';

  const difficultyCounts = userFeedback.reduce((acc, feedback) => {
    const difficulty = feedback.recipeId?.difficulty || 'medium';
    acc[difficulty] = (acc[difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(difficultyCounts)
    .sort(([,a], [,b]) => b - a)[0][0];
}
