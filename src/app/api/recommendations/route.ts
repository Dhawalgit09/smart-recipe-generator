import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Recipe from '@/models/Recipe';
import RecipeFeedback from '@/models/RecipeFeedback';

interface UserPreferences {
  dietaryRestrictions: string[];
  favoriteCuisines: string[];
  preferredCookingTime: number;
  spiceLevel: string;
  servingSize: number;
}

interface RecipeType {
  recipeId: string;
  name: string;
  description: string;
  ingredients: any[]; // keep as-is, could refine later
  instructions: string[];
  nutritionalInfo: any;
  cookingTime: number;
  difficulty: string;
  cuisineType: string;
  mealType: string;
  tags: string[];
  rating: number;
  totalRatings: number;
  servings: number;
  prepTime: number;
  totalTime: number;
  isAIGenerated: boolean;
  source: string;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Get or create user
    let user = await User.findOne({ userId });
    if (!user) {
      console.log(`Creating new user with ID: ${userId}`);
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

    const userPreferences: UserPreferences = user.preferences;
    const favoriteCuisines = userPreferences.favoriteCuisines;
    const preferredCookingTime = userPreferences.preferredCookingTime;
    // dietaryRestrictions is unused → safe to remove

    const userFeedback = await RecipeFeedback.find({ userId })
      .populate('recipeId')
      .sort({ createdAt: -1 })
      .limit(20);

    const ratedRecipeIds = userFeedback.map(feedback => feedback.recipeId);

    const query: Record<string, any> = {
      recipeId: { $nin: ratedRecipeIds }
    };

    if (favoriteCuisines.length > 0) {
      query.cuisineType = { $in: favoriteCuisines };
    }

    const timeRange = preferredCookingTime * 0.2;
    query.cookingTime = {
      $gte: Math.max(15, preferredCookingTime - timeRange),
      $lte: preferredCookingTime + timeRange
    };

    let recommendedRecipes: RecipeType[] = await Recipe.find(query)
      .sort({ rating: -1, totalRatings: -1 })
      .limit(limit * 2);

    if (recommendedRecipes.length === 0) {
      recommendedRecipes = await Recipe.find({ recipeId: { $nin: ratedRecipeIds } })
        .sort({ rating: -1, totalRatings: -1 })
        .limit(limit * 2);
    }

    if (recommendedRecipes.length === 0) {
      console.log('No recipes in database, using sample recipes');
      const { sampleRecipes } = await import('@/data/sampleRecipes');
      recommendedRecipes = sampleRecipes.map((recipe: any) => ({
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
        totalRatings: Math.floor(Math.random() * 50) + 10,
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        totalTime: recipe.totalTime,
        isAIGenerated: false,
        source: 'sample'
      }));
    }

    const rankedRecipes = rankRecommendations(recommendedRecipes, userPreferences, userFeedback);

    const collaborativeRecipes: RecipeType[] = userFeedback.length > 0
      ? await getCollaborativeRecommendations(userId, ratedRecipeIds, limit)
      : [];

    const allRecommendations = [...rankedRecipes, ...collaborativeRecipes];
    const uniqueRecommendations = allRecommendations.filter(
      (recipe, index, self) => index === self.findIndex(r => r.recipeId === recipe.recipeId)
    );

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
    return NextResponse.json({ error: 'Failed to load recommendations' }, { status: 500 });
  }
}

// Collaborative recommendations
async function getCollaborativeRecommendations(userId: string, ratedRecipeIds: string[], limit: number): Promise<RecipeType[]> {
  try {
    const similarUsers = await RecipeFeedback.aggregate([
      { $match: { userId: { $ne: userId }, rating: { $gte: 4 } } },
      { $group: { _id: '$userId', favoriteRecipes: { $push: '$recipeId' }, avgRating: { $avg: '$rating' } } },
      { $match: { avgRating: { $gte: 4.0 } } },
      { $limit: 10 }
    ]);

    if (similarUsers.length === 0) return [];

    const recommendedRecipeIds = similarUsers.flatMap(user => user.favoriteRecipes);
    const uniqueRecipeIds = [...new Set(recommendedRecipeIds)].filter(id => !ratedRecipeIds.includes(id));

    if (uniqueRecipeIds.length === 0) return [];

    return await Recipe.find({ recipeId: { $in: uniqueRecipeIds } })
      .sort({ rating: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Collaborative recommendations error:', error);
    return [];
  }
}

// Ranking recommendations
function rankRecommendations(recipes: RecipeType[], userPreferences: UserPreferences, userFeedback: RecipeFeedback[]) {
  return recipes.map(recipe => {
    let score = 0;
    score += recipe.rating * 2;

    if (userPreferences.favoriteCuisines.includes(recipe.cuisineType)) score += 10;

    const timeDiff = Math.abs(recipe.cookingTime - userPreferences.preferredCookingTime);
    if (timeDiff <= 10) score += 5;
    else if (timeDiff <= 20) score += 2;

    score += Math.min(recipe.totalRatings / 10, 5);

    const userDifficultyPreference = getUserDifficultyPreference(userFeedback);
    if (userDifficultyPreference === recipe.difficulty) score += 3;

    return {
      ...('toObject' in recipe ? recipe.toObject() : recipe),
      recommendationScore: score
    };
  }).sort((a, b) => b.recommendationScore - a.recommendationScore);
}

// Determine difficulty preference
function getUserDifficultyPreference(userFeedback: RecipeFeedback[]): string {
  if (userFeedback.length === 0) return 'medium';

  const difficultyCounts = userFeedback.reduce((acc, feedback) => {
    const difficulty = feedback.recipeId?.difficulty || 'medium';
    acc[difficulty] = (acc[difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(difficultyCounts).sort(([,a],[,b]) => b - a)[0][0];
}
