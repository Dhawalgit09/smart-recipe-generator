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
    - If vegetarian is specified: ABSOLUTELY NO MEAT, FISH, CHICKEN, BEEF, PORK, LAMB, OR ANY ANIMAL PRODUCTS
    - If vegetarian is specified: Use only plant-based ingredients like vegetables, fruits, grains, legumes, nuts, seeds
    - If vegetarian is specified: For protein, use tofu, tempeh, beans, lentils, chickpeas, quinoa, nuts, seeds
    - If vegetarian is specified: NEVER include chicken, beef, pork, fish, or any meat
    - If vegan is specified: NO DAIRY, EGGS, HONEY, OR ANY ANIMAL PRODUCTS
    - If gluten-free is specified: NO WHEAT, BARLEY, RYE, OR GLUTEN-CONTAINING INGREDIENTS
    - If dairy-free is specified: NO MILK, CHEESE, BUTTER, YOGURT, OR DAIRY PRODUCTS

    IMPORTANT: Create 3 COMPLETELY DIFFERENT recipe types:
    1. One pasta/noodle dish
    2. One soup/stew dish  
    3. One salad/appetizer dish

    Return ONLY valid JSON (no markdown, no explanations) following this structure exactly:

    {
      "recipes": [
        {
          "id": "recipe-1",
          "title": "Creative Recipe Name",
          "cuisine": "cuisine style",
          "difficulty": "easy",
          "cook_time_min": 25,
          "servings": 4,
          "ingredients": [
            {
              "ingredient": "ingredient name",
              "amount": 2,
              "unit": "pieces",
              "notes": "optional notes"
            }
          ],
          "steps": [
            "Step 1: Detailed cooking instruction",
            "Step 2: Next detailed step",
            "Step 3: Continue with clear instructions"
          ],
          "nutrition": {
            "calories": 350,
            "protein_g": 25,
            "carbs_g": 30,
            "fat_g": 15
          },
          "dietary_tags": ["vegetarian", "quick", "healthy"]
        }
      ]
    }

    Input Ingredients: ${ingredientsList}
    Dietary Preferences: ${dietaryPrefs}

    Requirements:
    - Use primarily the provided ingredients
    - STRICTLY follow dietary restrictions: ${dietaryRestrictions || 'None'}
    - Create 3 DIFFERENT recipe types (pasta, soup, salad)
    - Each recipe must be UNIQUE and CREATIVE
    - Include common pantry ingredients if needed (respecting dietary restrictions)
    - Make instructions detailed and beginner-friendly
    - Include realistic nutritional information
    - Add appropriate dietary tags that match the restrictions
    - Keep cooking time reasonable (15-60 minutes)
    - Ensure recipes are practical and delicious
    - If vegetarian/vegan, use plant-based protein sources like beans, lentils, tofu, nuts, seeds
    - AVOID repetitive recipes - make each one distinct
    - NEVER include meat, fish, or animal products if vegetarian is selected
    - FOR VEGETARIAN: Replace any meat with tofu, tempeh, or legumes

    REMEMBER: Return ONLY the JSON object, nothing else!`;

    console.log('Sending prompt to Gemini with dietary restrictions:', dietaryRestrictions);

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      console.log('Gemini Recipe Response:', text);

      // Clean and parse the response
      let cleanedText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      // Try to find JSON in the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }

      let parsed;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Raw Response:', text);
        console.log('Cleaned Text:', cleanedText);
        
        // Return fallback recipes
        console.log('Using fallback recipes with dietary preferences:', dietaryPreferences);
        return NextResponse.json({
          recipes: getFallbackRecipes(ingredients, dietaryPreferences)
        });
      }

      // Validate response structure
      if (!parsed.recipes || !Array.isArray(parsed.recipes)) {
        console.warn('Invalid response structure, using fallback');
        return NextResponse.json({
          recipes: getFallbackRecipes(ingredients, dietaryPreferences)
        });
      }

      // Clean and validate recipes
      let cleanRecipes = parsed.recipes
        .filter((recipe: any) => 
          recipe && 
          recipe.title && 
          recipe.ingredients && 
          Array.isArray(recipe.ingredients) &&
          recipe.steps &&
          Array.isArray(recipe.steps)
        )
        .map((recipe: any, index: number) => ({
          id: recipe.id || `recipe-${index + 1}`,
          title: recipe.title || `Recipe ${index + 1}`,
          cuisine: recipe.cuisine || 'international',
          difficulty: recipe.difficulty || 'medium',
          cook_time_min: recipe.cook_time_min || 30,
          servings: recipe.servings || 4,
          ingredients: recipe.ingredients.map((ing: any) => ({
            ingredient: ing.ingredient || 'ingredient',
            amount: ing.amount || 1,
            unit: ing.unit || 'piece',
            notes: ing.notes || ''
          })),
          steps: recipe.steps.map((step: string, stepIndex: number) => 
            step || `Step ${stepIndex + 1}`
          ),
          nutrition: {
            calories: recipe.nutrition?.calories || 300,
            protein_g: recipe.nutrition?.protein_g || 20,
            carbs_g: recipe.nutrition?.carbs_g || 25,
            fat_g: recipe.nutrition?.fat_g || 15
          },
          dietary_tags: recipe.dietary_tags || ['quick', 'delicious']
        }))
        .slice(0, 3); // Ensure exactly 3 recipes

      // POST-PROCESSING: Filter out meat ingredients for vegetarian diets
      if (dietaryPreferences.includes('vegetarian')) {
        console.log('Applying vegetarian filter to recipes...');
        cleanRecipes = cleanRecipes.map(recipe => {
          // Check if recipe contains meat ingredients
          const hasMeat = recipe.ingredients.some((ing: any) => 
            MEAT_INGREDIENTS.some(meat => 
              ing.ingredient.toLowerCase().includes(meat.toLowerCase())
            )
          );

          if (hasMeat) {
            console.log(`Recipe "${recipe.title}" contains meat, replacing with vegetarian alternatives...`);
            
            // Replace meat ingredients with vegetarian alternatives
            const vegetarianIngredients = recipe.ingredients.map((ing: any) => {
              const ingredientLower = ing.ingredient.toLowerCase();
              
              // Replace common meat ingredients
              if (ingredientLower.includes('chicken')) {
                return { ...ing, ingredient: 'tofu', notes: 'firm tofu, cubed' };
              }
              if (ingredientLower.includes('beef') || ingredientLower.includes('pork')) {
                return { ...ing, ingredient: 'tempeh', notes: 'crumbled tempeh' };
              }
              if (ingredientLower.includes('fish') || ingredientLower.includes('salmon') || ingredientLower.includes('tuna')) {
                return { ...ing, ingredient: 'chickpeas', notes: 'cooked chickpeas' };
              }
              if (ingredientLower.includes('shrimp') || ingredientLower.includes('prawn')) {
                return { ...ing, ingredient: 'mushrooms', notes: 'sliced mushrooms' };
              }
              
              return ing;
            });

            // Update recipe title to remove meat references
            let newTitle = recipe.title;
            if (newTitle.toLowerCase().includes('chicken')) {
              newTitle = newTitle.replace(/chicken/gi, 'Tofu');
            }
            if (newTitle.toLowerCase().includes('beef') || newTitle.toLowerCase().includes('pork')) {
              newTitle = newTitle.replace(/beef|pork/gi, 'Tempeh');
            }
            if (newTitle.toLowerCase().includes('fish') || newTitle.toLowerCase().includes('salmon') || newTitle.toLowerCase().includes('tuna')) {
              newTitle = newTitle.replace(/fish|salmon|tuna/gi, 'Chickpea');
            }

            // Update steps to reflect vegetarian ingredients
            const vegetarianSteps = recipe.steps.map((step: string) => {
              let newStep = step;
              if (newStep.toLowerCase().includes('chicken')) {
                newStep = newStep.replace(/chicken/gi, 'tofu');
              }
              if (newStep.toLowerCase().includes('beef') || newStep.toLowerCase().includes('pork')) {
                newStep = newStep.replace(/beef|pork/gi, 'tempeh');
              }
              if (newStep.toLowerCase().includes('fish') || newStep.toLowerCase().includes('salmon') || newStep.toLowerCase().includes('tuna')) {
                newStep = newStep.replace(/fish|salmon|tuna/gi, 'chickpeas');
              }
              return newStep;
            });

            return {
              ...recipe,
              title: newTitle,
              ingredients: vegetarianIngredients,
              steps: vegetarianSteps,
              dietary_tags: [...(recipe.dietary_tags || []), 'vegetarian'].filter((tag, index, arr) => arr.indexOf(tag) === index)
            };
          }
          
          return recipe;
        });
      }

      console.log('Final recipes being returned:', cleanRecipes);

      return NextResponse.json({
        recipes: cleanRecipes
      });

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

// Fallback recipes when AI fails
function getFallbackRecipes(ingredients: string[], dietaryPreferences: string[] = []) {
  const ingredientsList = ingredients.join(', ');
  const isVegetarian = dietaryPreferences.includes('vegetarian');
  const isVegan = dietaryPreferences.includes('vegan');
  
  console.log('Creating fallback recipes with:', { ingredients, dietaryPreferences, isVegetarian, isVegan });
  
  // Get the main ingredient for recipe customization
  const mainIngredient = ingredients[0] || 'vegetables';
  
  return [
    {
      id: "fallback-1",
      title: `${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} Pasta`,
      cuisine: "italian",
      difficulty: "easy",
      cook_time_min: 25,
      servings: 4,
      ingredients: [
        {
          ingredient: "pasta",
          amount: 8,
          unit: "oz",
          notes: "any type"
        },
        {
          ingredient: mainIngredient,
          amount: 2,
          unit: "cups",
          notes: "chopped"
        },
        {
          ingredient: "olive oil",
          amount: 3,
          unit: "tbsp",
          notes: "for cooking"
        },
        {
          ingredient: "garlic",
          amount: 3,
          unit: "cloves",
          notes: "minced"
        },
        {
          ingredient: isVegan ? "nutritional yeast" : "parmesan cheese",
          amount: 0.5,
          unit: "cup",
          notes: isVegan ? "for cheesy flavor" : "grated"
        }
      ],
      steps: [
        "Bring a large pot of salted water to boil and cook pasta according to package directions",
        "Heat olive oil in a large pan over medium heat",
        "Add minced garlic and sauté for 1 minute until fragrant",
        `Add ${mainIngredient} and cook for 5-7 minutes until tender`,
        "Drain pasta and add to the pan with vegetables",
        `Toss with ${isVegan ? 'nutritional yeast' : 'parmesan cheese'} and season with salt and pepper`,
        "Serve hot with extra cheese on top"
      ],
      nutrition: {
        calories: 450,
        protein_g: 18,
        carbs_g: 65,
        fat_g: 15
      },
      dietary_tags: isVegetarian ? ["vegetarian", "pasta", "quick"] : ["pasta", "quick", "delicious"]
    },
    {
      id: "fallback-2",
      title: `${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} Soup`,
      cuisine: "international",
      difficulty: "easy",
      cook_time_min: 35,
      servings: 4,
      ingredients: [
        {
          ingredient: mainIngredient,
          amount: 3,
          unit: "cups",
          notes: "chopped"
        },
        {
          ingredient: "vegetable broth",
          amount: 4,
          unit: "cups",
          notes: "vegetarian broth"
        },
        {
          ingredient: "onion",
          amount: 1,
          unit: "medium",
          notes: "diced"
        },
        {
          ingredient: "carrots",
          amount: 2,
          unit: "medium",
          notes: "chopped"
        },
        {
          ingredient: "celery",
          amount: 2,
          unit: "stalks",
          notes: "chopped"
        },
        {
          ingredient: "herbs",
          amount: 1,
          unit: "tsp",
          notes: "dried thyme or basil"
        }
      ],
      steps: [
        "Heat oil in a large pot over medium heat",
        "Add diced onion, carrots, and celery. Sauté for 5 minutes until softened",
        `Add ${mainIngredient} and cook for 3 minutes`,
        "Pour in vegetable broth and add herbs",
        "Bring to a boil, then reduce heat and simmer for 20 minutes",
        "Season with salt and pepper to taste",
        "Serve hot with crusty bread"
      ],
      nutrition: {
        calories: 180,
        protein_g: 8,
        carbs_g: 25,
        fat_g: 6
      },
      dietary_tags: ["vegetarian", "comforting", "healthy"]
    },
    {
      id: "fallback-3",
      title: `${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} Salad`,
      cuisine: "international",
      difficulty: "easy",
      cook_time_min: 15,
      servings: 2,
      ingredients: [
        {
          ingredient: mainIngredient,
          amount: 2,
          unit: "cups",
          notes: "chopped"
        },
        {
          ingredient: "mixed greens",
          amount: 4,
          unit: "cups",
          notes: "lettuce, spinach, arugula"
        },
        {
          ingredient: "cucumber",
          amount: 1,
          unit: "medium",
          notes: "sliced"
        },
        {
          ingredient: "olive oil",
          amount: 2,
          unit: "tbsp",
          notes: "for dressing"
        },
        {
          ingredient: "lemon juice",
          amount: 1,
          unit: "tbsp",
          notes: "for dressing"
        },
        {
          ingredient: isVegan ? "tofu" : "feta cheese",
          amount: 0.25,
          unit: "cup",
          notes: isVegan ? "crumbled" : "crumbled"
        }
      ],
      steps: [
        `Wash and prepare ${mainIngredient}`,
        "In a large bowl, combine mixed greens, cucumber, and main ingredient",
        "In a small bowl, whisk together olive oil, lemon juice, salt, and pepper",
        "Pour dressing over salad and toss gently",
        `Sprinkle with ${isVegan ? 'crumbled tofu' : 'feta cheese'}`,
        "Serve immediately"
      ],
      nutrition: {
        calories: 150,
        protein_g: 5,
        carbs_g: 10,
        fat_g: 8
      },
      dietary_tags: ["vegetarian", "fresh", "healthy"]
    }
  ];
}
