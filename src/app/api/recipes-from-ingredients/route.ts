import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Meat ingredients to filter out for vegetarian diets
const MEAT_INGREDIENTS = [
  'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'goose', 'quail', 'pheasant',
  'steak', 'ground beef', 'ground pork', 'bacon', 'ham', 'sausage', 'hot dog',
  'fish', 'salmon', 'tuna', 'cod', 'tilapia', 'shrimp', 'prawn', 'crab', 'lobster',
  'mussel', 'clam', 'oyster', 'scallop', 'anchovy', 'sardine', 'mackerel',
  'meat', 'poultry', 'seafood', 'shellfish', 'game meat', 'venison', 'rabbit'
];

// Types for recipes
interface Ingredient {
  ingredient: string;
  amount: number;
  unit: string;
  notes: string;
}

interface Nutrition {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Recipe {
  id: string;
  title: string;
  cuisine: string;
  difficulty: string;
  cook_time_min: number;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  nutrition: Nutrition;
  dietary_tags: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, dietaryPreferences = [] } = body;

    console.log('API Request - Ingredients:', ingredients);
    console.log('API Request - Dietary Preferences:', dietaryPreferences);

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Ingredients array is required' },
        { status: 400 }
      );
    }

    const ingredientsList = ingredients.join(', ');
    const dietaryPrefs = dietaryPreferences.length > 0 ? dietaryPreferences.join(', ') : 'any dietary preference';

    // Create dietary restrictions text
    let dietaryRestrictions = '';
    if (dietaryPreferences.includes('vegetarian')) {
      dietaryRestrictions += 'STRICTLY NO MEAT, FISH, OR ANIMAL PRODUCTS. Use only plant-based ingredients. ';
    }
    if (dietaryPreferences.includes('vegan')) {
      dietaryRestrictions += 'STRICTLY VEGAN - NO ANIMAL PRODUCTS, DAIRY, EGGS, OR HONEY. Use only plant-based ingredients. ';
    }
    if (dietaryPreferences.includes('gluten-free')) {
      dietaryRestrictions += 'GLUTEN-FREE - Avoid wheat, barley, rye, and any gluten-containing ingredients. ';
    }
    if (dietaryPreferences.includes('dairy-free')) {
      dietaryRestrictions += 'DAIRY-FREE - No milk, cheese, butter, or dairy products. ';
    }

    console.log('Dietary Restrictions:', dietaryRestrictions);

    const prompt = `You are a professional recipe generator. Generate exactly 3 unique recipes using the provided ingredients.

    DIETARY RESTRICTIONS: ${dietaryRestrictions || 'No specific dietary restrictions'}

    CRITICAL DIETARY RULES - YOU MUST FOLLOW THESE EXACTLY:
    ... (rest of the prompt remains unchanged)
    `;

    console.log('Sending prompt to Gemini with dietary restrictions:', dietaryRestrictions);

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      console.log('Gemini Recipe Response:', text);

      // Clean and parse the response
      let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleanedText = jsonMatch[0];

      let parsed: { recipes: Recipe[] };
      try {
        parsed = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Using fallback recipes');
        return NextResponse.json({
          recipes: getFallbackRecipes(ingredients, dietaryPreferences)
        });
      }

      if (!parsed.recipes || !Array.isArray(parsed.recipes)) {
        console.warn('Invalid response structure, using fallback');
        return NextResponse.json({
          recipes: getFallbackRecipes(ingredients, dietaryPreferences)
        });
      }

      // Clean and validate recipes
      let cleanRecipes: Recipe[] = parsed.recipes
        .filter((recipe: Recipe) => 
          recipe &&
          recipe.title &&
          recipe.ingredients &&
          Array.isArray(recipe.ingredients) &&
          recipe.steps &&
          Array.isArray(recipe.steps)
        )
        .map((recipe: Recipe, index: number) => ({
          id: recipe.id || `recipe-${index + 1}`,
          title: recipe.title || `Recipe ${index + 1}`,
          cuisine: recipe.cuisine || 'international',
          difficulty: recipe.difficulty || 'medium',
          cook_time_min: recipe.cook_time_min || 30,
          servings: recipe.servings || 4,
          ingredients: recipe.ingredients.map((ing: Ingredient) => ({
            ingredient: ing.ingredient || 'ingredient',
            amount: ing.amount || 1,
            unit: ing.unit || 'piece',
            notes: ing.notes || ''
          })),
          steps: recipe.steps.map((step: string, stepIndex: number) => step || `Step ${stepIndex + 1}`),
          nutrition: {
            calories: recipe.nutrition?.calories || 300,
            protein_g: recipe.nutrition?.protein_g || 20,
            carbs_g: recipe.nutrition?.carbs_g || 25,
            fat_g: recipe.nutrition?.fat_g || 15
          },
          dietary_tags: recipe.dietary_tags || ['quick', 'delicious']
        }))
        .slice(0, 3);

      // Vegetarian filter
      if (dietaryPreferences.includes('vegetarian')) {
        cleanRecipes = cleanRecipes.map(recipe => {
          const hasMeat = recipe.ingredients.some(ing =>
            MEAT_INGREDIENTS.some(meat => ing.ingredient.toLowerCase().includes(meat.toLowerCase()))
          );

          if (hasMeat) {
            const vegetarianIngredients = recipe.ingredients.map((ing: Ingredient) => {
              const ingredientLower = ing.ingredient.toLowerCase();
              if (ingredientLower.includes('chicken')) return { ...ing, ingredient: 'tofu', notes: 'firm tofu, cubed' };
              if (ingredientLower.includes('beef') || ingredientLower.includes('pork')) return { ...ing, ingredient: 'tempeh', notes: 'crumbled tempeh' };
              if (ingredientLower.includes('fish') || ingredientLower.includes('salmon') || ingredientLower.includes('tuna')) return { ...ing, ingredient: 'chickpeas', notes: 'cooked chickpeas' };
              if (ingredientLower.includes('shrimp') || ingredientLower.includes('prawn')) return { ...ing, ingredient: 'mushrooms', notes: 'sliced mushrooms' };
              return ing;
            });

            let newTitle = recipe.title.replace(/chicken/gi, 'Tofu')
                                       .replace(/beef|pork/gi, 'Tempeh')
                                       .replace(/fish|salmon|tuna/gi, 'Chickpea');

            const vegetarianSteps = recipe.steps.map(step =>
              step.replace(/chicken/gi, 'tofu')
                  .replace(/beef|pork/gi, 'tempeh')
                  .replace(/fish|salmon|tuna/gi, 'chickpeas')
            );

            return { ...recipe, title: newTitle, ingredients: vegetarianIngredients, steps: vegetarianSteps, dietary_tags: [...(recipe.dietary_tags || []), 'vegetarian'] };
          }

          return recipe;
        });
      }

      console.log('Final recipes being returned:', cleanRecipes);

      return NextResponse.json({ recipes: cleanRecipes });

    } catch (geminiError) {
      console.error('Gemini API Error:', geminiError);
      return NextResponse.json({
        recipes: getFallbackRecipes(ingredients, dietaryPreferences)
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Fallback recipes function remains unchanged
function getFallbackRecipes(ingredients: string[], dietaryPreferences: string[] = []): Recipe[] {
  // ...same as before, no changes needed
  return []; // placeholder for brevity
}
