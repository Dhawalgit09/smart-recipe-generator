import { Recipe, RecipeMatch, IngredientMatch, RecipeGenerationRequest } from '../types/recipe';

export class RecipeMatchingAlgorithm {
  private static readonly INGREDIENT_MATCH_WEIGHT = 0.60;
  private static readonly DIETARY_PREFERENCE_WEIGHT = 0.25;
  private static readonly CUISINE_MATCH_WEIGHT = 0.10;
  private static readonly COOKING_TIME_WEIGHT = 0.05;

  /**
   * Main recipe matching algorithm
   * Uses a hybrid scoring system to find the best recipes
   */
  static async findMatchingRecipes(
    request: RecipeGenerationRequest,
    availableRecipes: Recipe[]
  ): Promise<RecipeMatch[]> {
    const startTime = Date.now();
    
    // Generate matches for all available recipes
    const matches: RecipeMatch[] = availableRecipes.map(recipe => 
      this.calculateRecipeMatch(recipe, request)
    );

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Filter out very low matches (below 0.3)
    const filteredMatches = matches.filter(match => match.matchScore >= 0.3);

    // Limit results to top 20 matches
    const topMatches = filteredMatches.slice(0, 20);

    console.log(`Recipe matching completed in ${Date.now() - startTime}ms`);
    console.log(`Found ${topMatches.length} good matches out of ${availableRecipes.length} recipes`);

    return topMatches;
  }

  /**
   * Calculate overall match score for a recipe
   */
  private static calculateRecipeMatch(recipe: Recipe, request: RecipeGenerationRequest): RecipeMatch {
    // Calculate ingredient match score
    const ingredientMatches = this.calculateIngredientMatches(recipe, request.ingredients);
    const ingredientScore = this.calculateIngredientScore(ingredientMatches, request.ingredients.length);

    // Calculate dietary compatibility score
    const dietaryScore = this.calculateDietaryCompatibility(recipe, request.dietaryPreferences);

    // Calculate cuisine match score
    const cuisineScore = this.calculateCuisineMatch(recipe.cuisineType, request.cuisineType);

    // Calculate cooking time match score
    const timeScore = this.calculateTimeMatch(recipe.cookingTime, request.cookingTime);

    // Calculate weighted total score
    const totalScore = 
      ingredientScore * this.INGREDIENT_MATCH_WEIGHT +
      dietaryScore * this.DIETARY_PREFERENCE_WEIGHT +
      cuisineScore * this.CUISINE_MATCH_WEIGHT +
      timeScore * this.COOKING_TIME_WEIGHT;

    // Generate explanation for the match
    const explanation = this.generateMatchExplanation(
      ingredientScore,
      dietaryScore,
      cuisineScore,
      timeScore,
      ingredientMatches
    );

    return {
      recipe,
      matchScore: totalScore,
      ingredientMatches,
      dietaryCompatibility: dietaryScore,
      cuisineMatch: cuisineScore,
      timeMatch: timeScore,
      explanation
    };
  }

  /**
   * Calculate ingredient matches between user ingredients and recipe requirements
   */
  private static calculateIngredientMatches(recipe: Recipe, userIngredients: string[]): IngredientMatch[] {
    const matches: IngredientMatch[] = [];
    const userIngredientsLower = userIngredients.map(ing => ing.toLowerCase());

    recipe.ingredients.forEach(recipeIngredient => {
      const recipeIngredientLower = recipeIngredient.ingredient.toLowerCase();
      
      // Check for exact match
      if (userIngredientsLower.includes(recipeIngredientLower)) {
        matches.push({
          userIngredient: recipeIngredient.ingredient,
          recipeIngredient: recipeIngredient.ingredient,
          matchType: 'exact',
          confidence: 1.0
        });
        return;
      }

      // Check for similar ingredients (partial matches)
      const similarMatch = this.findSimilarIngredient(recipeIngredientLower, userIngredientsLower);
      if (similarMatch) {
        matches.push({
          userIngredient: similarMatch,
          recipeIngredient: recipeIngredient.ingredient,
          matchType: 'similar',
          confidence: 0.8
        });
        return;
      }

      // Check for common substitutions
      const substitution = this.findSubstitution(recipeIngredientLower, userIngredientsLower);
      if (substitution) {
        matches.push({
          userIngredient: substitution,
          recipeIngredient: recipeIngredient.ingredient,
          matchType: 'substitute',
          confidence: 0.6,
          substitution: substitution
        });
        return;
      }

      // Missing ingredient
      matches.push({
        userIngredient: 'missing',
        recipeIngredient: recipeIngredient.ingredient,
        matchType: 'missing',
        confidence: 0.0
      });
    });

    return matches;
  }

  /**
   * Calculate ingredient match score based on available ingredients
   */
  private static calculateIngredientScore(matches: IngredientMatch[], totalUserIngredients: number): number {
    if (matches.length === 0) return 0;

    const exactMatches = matches.filter(m => m.matchType === 'exact').length;
    const similarMatches = matches.filter(m => m.matchType === 'similar').length;
    const substituteMatches = matches.filter(m => m.matchType === 'substitute').length;
    // Count of missing ingredients (not used in score calculation but useful for debugging)
    const missingIngredients = matches.filter(m => m.matchType === 'missing').length;

    // Calculate score with different weights for different match types
    const score = (
      exactMatches * 1.0 +
      similarMatches * 0.8 +
      substituteMatches * 0.6
    ) / matches.length;

    // Bonus for recipes that use most of user's ingredients
    const ingredientUtilization = (exactMatches + similarMatches + substituteMatches) / totalUserIngredients;
    const utilizationBonus = Math.min(ingredientUtilization * 0.2, 0.2);

    return Math.min(score + utilizationBonus, 1.0);
  }

  /**
   * Calculate dietary compatibility score
   */
  private static calculateDietaryCompatibility(recipe: Recipe, userPreferences: string[]): number {
    if (userPreferences.length === 0) return 1.0;

    // Define dietary restrictions and their compatibility
    const dietaryCompatibility: Record<string, string[]> = {
      'vegan': ['vegan', 'plant-based'],
      'vegetarian': ['vegan', 'vegetarian', 'plant-based'],
      'gluten-free': ['gluten-free', 'celiac-safe'],
      'dairy-free': ['dairy-free', 'lactose-free', 'vegan'],
      'keto': ['keto', 'low-carb', 'high-fat'],
      'paleo': ['paleo', 'grain-free', 'dairy-free'],
      'low-sodium': ['low-sodium', 'heart-healthy'],
      'low-calorie': ['low-calorie', 'weight-loss'],
      'high-protein': ['high-protein', 'muscle-building'],
      'low-carb': ['low-carb', 'keto', 'diabetic-friendly']
    };

    let compatibilityScore = 0;
    let totalChecks = 0;

    userPreferences.forEach(preference => {
      const compatibleDiets = dietaryCompatibility[preference] || [];
      const recipeTags = recipe.tags.map(tag => tag.toLowerCase());
      
      // Check if recipe is compatible with user preference
      const isCompatible = compatibleDiets.some(diet => 
        recipeTags.includes(diet.toLowerCase())
      );

      if (isCompatible) {
        compatibilityScore += 1.0;
      } else {
        // Check if recipe explicitly violates the preference
        const violates = this.checkDietaryViolation(preference, recipe);
        if (violates) {
          compatibilityScore += 0.0; // No points for violating preferences
        } else {
          compatibilityScore += 0.5; // Partial compatibility
        }
      }
      
      totalChecks++;
    });

    return totalChecks > 0 ? compatibilityScore / totalChecks : 1.0;
  }

  /**
   * Check if recipe violates specific dietary preferences
   */
  private static checkDietaryViolation(preference: string, recipe: Recipe): boolean {
    const violations: Record<string, string[]> = {
      'vegan': ['meat', 'dairy', 'eggs', 'honey', 'gelatin'],
      'vegetarian': ['meat', 'fish', 'poultry'],
      'gluten-free': ['wheat', 'barley', 'rye', 'gluten'],
      'dairy-free': ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
      'keto': ['sugar', 'grains', 'high-carb'],
      'paleo': ['grains', 'legumes', 'dairy', 'processed-foods']
    };

    const forbiddenIngredients = violations[preference] || [];
    const recipeIngredients = recipe.ingredients.map(ing => ing.ingredient.toLowerCase());

    return forbiddenIngredients.some(forbidden => 
      recipeIngredients.some(ingredient => ingredient.includes(forbidden))
    );
  }

  /**
   * Calculate cuisine match score
   */
  private static calculateCuisineMatch(recipeCuisine: string, userCuisine: string): number {
    if (userCuisine === 'any' || userCuisine === '') return 1.0;
    if (recipeCuisine.toLowerCase() === userCuisine.toLowerCase()) return 1.0;
    
    // Check for similar cuisines
    const cuisineSimilarity: Record<string, string[]> = {
      'italian': ['mediterranean', 'european'],
      'chinese': ['asian', 'oriental'],
      'indian': ['south-asian', 'spicy'],
      'mexican': ['latin-american', 'tex-mex'],
      'french': ['european', 'continental'],
      'japanese': ['asian', 'oriental'],
      'thai': ['asian', 'southeast-asian'],
      'greek': ['mediterranean', 'european'],
      'spanish': ['mediterranean', 'european'],
      'american': ['western', 'comfort-food']
    };

    const similarCuisines = cuisineSimilarity[userCuisine.toLowerCase()] || [];
    if (similarCuisines.some(cuisine => 
      recipeCuisine.toLowerCase().includes(cuisine.toLowerCase())
    )) {
      return 0.7;
    }

    return 0.3; // Low score for unrelated cuisines
  }

  /**
   * Calculate cooking time match score
   */
  private static calculateTimeMatch(recipeTime: number, userTime: number): number {
    if (userTime === 0) return 1.0; // User has no time preference
    
    const timeDifference = Math.abs(recipeTime - userTime);
    const maxDifference = Math.max(recipeTime, userTime);
    
    if (timeDifference === 0) return 1.0;
    if (recipeTime <= userTime) return 1.0; // Recipe is faster than user's preference
    
    // Penalize recipes that take longer than user's preference
    const penalty = timeDifference / maxDifference;
    return Math.max(0.1, 1.0 - penalty);
  }

  /**
   * Find similar ingredients using fuzzy matching
   */
  private static findSimilarIngredient(recipeIngredient: string, userIngredients: string[]): string | null {
    // Simple similarity check - can be enhanced with more sophisticated algorithms
    for (const userIngredient of userIngredients) {
      const similarity = this.calculateStringSimilarity(recipeIngredient, userIngredient);
      if (similarity > 0.7) {
        return userIngredient;
      }
    }
    return null;
  }

  /**
   * Find ingredient substitutions
   */
  private static findSubstitution(recipeIngredient: string, userIngredients: string[]): string | null {
    const substitutions: Record<string, string[]> = {
      'butter': ['olive oil', 'coconut oil', 'margarine'],
      'eggs': ['flax seeds', 'chia seeds', 'banana'],
      'milk': ['almond milk', 'soy milk', 'oat milk'],
      'flour': ['almond flour', 'coconut flour', 'gluten-free flour'],
      'sugar': ['honey', 'maple syrup', 'stevia'],
      'salt': ['herbs', 'spices', 'lemon juice'],
      'onion': ['shallots', 'leeks', 'garlic'],
      'tomato': ['bell pepper', 'zucchini', 'eggplant'],
      'chicken': ['tofu', 'tempeh', 'seitan'],
      'beef': ['lentils', 'mushrooms', 'beans']
    };

    for (const [original, substitutes] of Object.entries(substitutions)) {
      if (recipeIngredient.includes(original)) {
        for (const substitute of substitutes) {
          if (userIngredients.some(ing => ing.toLowerCase().includes(substitute))) {
            return substitute;
          }
        }
      }
    }
    return null;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private static calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    return matrix[str2.length][str1.length];
  }

  /**
   * Generate human-readable explanation for recipe match
   */
  private static generateMatchExplanation(
    ingredientScore: number,
    dietaryScore: number,
    cuisineScore: number,
    timeScore: number,
    ingredientMatches: IngredientMatch[]
  ): string {
    const explanations: string[] = [];
    
    if (ingredientScore > 0.8) {
      explanations.push("Excellent ingredient match");
    } else if (ingredientScore > 0.6) {
      explanations.push("Good ingredient compatibility");
    } else if (ingredientScore > 0.4) {
      explanations.push("Moderate ingredient match");
    } else {
      explanations.push("Limited ingredient overlap");
    }

    if (dietaryScore > 0.9) {
      explanations.push("Perfect for your dietary preferences");
    } else if (dietaryScore > 0.7) {
      explanations.push("Compatible with your diet");
    } else if (dietaryScore < 0.3) {
      explanations.push("May not meet dietary requirements");
    }

    if (cuisineScore > 0.8) {
      explanations.push("Matches your cuisine preference");
    }

    if (timeScore > 0.8) {
      explanations.push("Fits your time constraints");
    }

    const missingCount = ingredientMatches.filter(m => m.matchType === 'missing').length;
    if (missingCount > 0) {
      explanations.push(`Requires ${missingCount} additional ingredients`);
    }

    return explanations.join('. ') + '.';
  }
}