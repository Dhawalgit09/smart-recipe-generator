import { GoogleGenerativeAI } from "@google/generative-ai";
import { Recipe, RecipeGenerationRequest } from "../types/recipe";

/**
 * Define types for Gemini API response
 */
interface GeminiIngredient {
  ingredient: string;
  amount: number;
  unit: string;
  notes?: string;
  isOptional?: boolean;
}

interface GeminiRecipe {
  name: string;
  description: string;
  ingredients: GeminiIngredient[];
  instructions: string[];
  [key: string]: unknown;
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export class GeminiRecipeService {
  /**
   * Generate AI-powered recipes using Gemini
   */
  static async generateRecipes(request: RecipeGenerationRequest): Promise<Recipe[]> {
    try {
      const ingredients = request.ingredients.join(", ");
      const dietaryPrefs = request.dietaryPreferences.length > 0 
        ? request.dietaryPreferences.join(", ") 
        : "any dietary preference";
      
      const prompt = `
      You are a professional recipe generator.
      Generate exactly 3 unique recipes using the given inputs.
      Each recipe must contain VERY detailed, step-by-step detailed cooking instructions
      (like a cooking book, each step should be clear and thorough).

      Return ONLY valid JSON (no extra text, no markdown, no explanations)
      following this structure exactly:

      {
        "recipes": [
          {
            "name": "Creative Recipe Name",
            "description": "Brief description of the dish",
            "ingredients": [
              {
                "ingredient": "ingredient name",
                "amount": 2,
                "unit": "pieces",
                "notes": "optional notes",
                "isOptional": false
              }
            ],
            "instructions": [
              "Step 1: Very detailed cooking instruction with timing and technique",
              "Step 2: Next detailed step with specific measurements and tips",
              "Step 3: Continue with clear, thorough instructions"
            ],
            "nutrition": {
              "calories": 350,
              "protein": 25,
              "carbs": 30,
              "fat": 15,
              "fiber": 8,
              "sugar": 5
            },
            "difficulty": "Easy",
            "cookingTime": 25,
            "cuisineType": "cuisine style",
            "mealType": "dinner",
            "tags": ["tag1", "tag2", "tag3"],
            "rating": 4.5,
            "servings": 4,
            "prepTime": 15,
            "totalTime": 40
          }
        ]
      }

      Input Ingredients: ${ingredients}
      Dietary Preference: ${dietaryPrefs}
      Serving Size: ${request.servingSize} people
      Cuisine Preference: ${request.cuisineType || 'any cuisine'}
      Max Cooking Time: ${request.cookingTime} minutes

      Requirements:
      - Use primarily the provided ingredients
      - Ensure recipes are suitable for the specified diet
      - Keep cooking time within ${request.cookingTime} minutes
      - Make instructions detailed and beginner-friendly
      - Include realistic nutritional information
      - Add creative recipe names and descriptions

      REMEMBER: Return ONLY the JSON object, nothing else!
      `;

      console.log("📝 Sending prompt to Gemini...");
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      console.log("🤖 Gemini API Response:", text);
      
      // Simple JSON parsing with fallback
      let parsed;
      try {
        // Clean the response
        const cleanedText = text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        
        parsed = JSON.parse(cleanedText);
      } catch (error) {
        console.error("❌ JSON Parse Error:", error);
        console.log("Raw Output:", text);
        
        // Return fallback recipes if parsing fails
        return this.getFallbackRecipes();
      }
      
      if (!parsed.recipes || !Array.isArray(parsed.recipes)) {
        console.warn("⚠️ Invalid response format, using fallback recipes");
        return this.getFallbackRecipes();
      }
      
      // Convert to Recipe format
      return this.convertToRecipeFormat(parsed.recipes, request);
      
    } catch (error) {
      console.error("❌ Gemini API Error:", error);
      return this.getFallbackRecipes();
    }
  }



  /**
   * Convert Gemini response to Recipe format
   */
  private static convertToRecipeFormat(geminiRecipes: GeminiRecipe[], request: RecipeGenerationRequest): Recipe[] {
    return geminiRecipes.map((geminiRecipe: GeminiRecipe, index: number) => ({
      id: `gemini-${Date.now()}-${index}`,
      name: geminiRecipe.name || `AI Generated Recipe ${index + 1}`,
      description: geminiRecipe.description || "Delicious AI-generated recipe",
      ingredients: geminiRecipe.ingredients?.map((ing: GeminiIngredient) => ({
        ingredient: ing.ingredient || "ingredient",
        amount: ing.amount || 1,
        unit: ing.unit || "piece",
        notes: ing.notes || "",
        isOptional: ing.isOptional || false
      })) || [],
      instructions: geminiRecipe.instructions?.map((instruction: string, stepIndex: number) => ({
        stepNumber: stepIndex + 1,
        instruction: instruction,
        timeMinutes: undefined,
        tips: undefined
      })) || [],
      nutritionalInfo: {
        calories: (geminiRecipe.nutrition as { calories?: number })?.calories || 300,
        protein: (geminiRecipe.nutrition as { protein?: number })?.protein || 20,
        carbs: (geminiRecipe.nutrition as { carbs?: number })?.carbs || 25,
        fat: (geminiRecipe.nutrition as { fat?: number })?.fat || 15,
        fiber: (geminiRecipe.nutrition as { fiber?: number })?.fiber || 5,
        sugar: (geminiRecipe.nutrition as { sugar?: number })?.sugar || 3
      },
      cookingTime: geminiRecipe.cookingTime || 30,
      difficulty: (geminiRecipe.difficulty || "Easy").toLowerCase() as 'easy' | 'medium' | 'hard',
      cuisineType: geminiRecipe.cuisineType || "international",
      mealType: (geminiRecipe.mealType || "dinner") as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert',
      tags: geminiRecipe.tags || ["ai-generated", "quick", "delicious"],
      imageUrl: undefined,
      rating: geminiRecipe.rating || 4.0,
      servings: geminiRecipe.servings || request.servingSize,
      prepTime: geminiRecipe.prepTime || 15,
      totalTime: geminiRecipe.totalTime || (geminiRecipe.cookingTime || 30)
    }));
  }

  /**
   * Get fallback recipes when AI fails
   */
  private static getFallbackRecipes(): Recipe[] {
    console.log("🔄 Using fallback recipes");
    
    return [
      {
        id: "fallback-1",
        name: "Quick Stir-Fry",
        description: "A simple and delicious stir-fry using your available ingredients",
        ingredients: [
          {
            ingredient: "vegetables",
            amount: 2,
            unit: "cups",
            notes: "Use any vegetables you have",
            isOptional: false
          },
          {
            ingredient: "protein",
            amount: 1,
            unit: "cup",
            notes: "Chicken, tofu, or any protein you have",
            isOptional: false
          }
        ],
        instructions: [
          {
            stepNumber: 1,
            instruction: "Heat oil in a large pan over medium-high heat",
            timeMinutes: 2
          },
          {
            stepNumber: 2,
            instruction: "Add protein and cook until browned, about 5-7 minutes",
            timeMinutes: 7
          },
          {
            stepNumber: 3,
            instruction: "Add vegetables and stir-fry for 3-4 minutes",
            timeMinutes: 4
          }
        ],
        nutritionalInfo: {
          calories: 300,
          protein: 25,
          carbs: 20,
          fat: 15
        },
        cookingTime: 20,
        difficulty: "easy",
        cuisineType: "international",
        mealType: "dinner",
        tags: ["quick", "easy", "healthy"],
        rating: 4.0,
        servings: 2,
        prepTime: 10,
        totalTime: 30
      }
    ];
  }
}