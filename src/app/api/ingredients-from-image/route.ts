import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.match(/image\/(jpeg|jpg|png)/)) {
      return NextResponse.json(
        { error: 'Only JPG and PNG images are supported' },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageFile.type;

    // Create image part for Gemini
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    };

    // Gemini Vision prompt
    const prompt = `You are an ingredient recognizer. Detect all edible items in this photo. Return ONLY valid JSON in the format: { "ingredients": ["ingredient1","ingredient2",...] }

    Important:
    - Only return valid JSON, no markdown, no explanations
    - List only edible ingredients that can be used in cooking
    - Use common ingredient names (e.g., "tomato" not "red tomato fruit")
    - Include all visible food items
    - If no clear food items are visible, return empty array: { "ingredients": [] }
    - Maximum 15 ingredients
    - Be specific but use standard cooking ingredient names`;

    try {
      // Call Gemini Vision API
      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text();
      
      console.log('Gemini Vision Response:', text);

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
        
        // Fallback: try to extract ingredients from text
        const fallbackIngredients = extractIngredientsFromText(text);
        return NextResponse.json({
          ingredients: fallbackIngredients
        });
      }

      // Validate response structure
      if (!parsed.ingredients || !Array.isArray(parsed.ingredients)) {
        console.warn('Invalid response structure, using fallback');
        const fallbackIngredients = extractIngredientsFromText(text);
        return NextResponse.json({
          ingredients: fallbackIngredients
        });
      }

      // Clean and validate ingredients
      const cleanIngredients = (parsed.ingredients as string[])
        .filter((ingredient: string) => 
          typeof ingredient === 'string' && 
          ingredient.trim().length > 0
        )
        .map((ingredient: string) => ingredient.trim().toLowerCase())
        .slice(0, 15); // Limit to 15 ingredients

      return NextResponse.json({
        ingredients: cleanIngredients
      });

    } catch (geminiError) {
      console.error('Gemini Vision API Error:', geminiError);
      return NextResponse.json(
        { error: 'Image recognition failed' },
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Fallback function to extract ingredients from text
function extractIngredientsFromText(text: string): string[] {
  const commonIngredients = [
    'tomato', 'onion', 'garlic', 'potato', 'carrot', 'bell pepper', 'mushroom',
    'chicken', 'beef', 'pork', 'fish', 'shrimp', 'egg', 'cheese', 'milk',
    'rice', 'pasta', 'bread', 'flour', 'oil', 'butter', 'salt', 'pepper',
    'basil', 'oregano', 'thyme', 'lemon', 'lime', 'apple', 'banana', 'orange',
    'lettuce', 'spinach', 'kale', 'cucumber', 'avocado', 'corn', 'peas',
    'broccoli', 'cauliflower', 'zucchini', 'eggplant', 'asparagus'
  ];

  const lowerText = text.toLowerCase();
  const foundIngredients: string[] = [];

  for (const ingredient of commonIngredients) {
    if (lowerText.includes(ingredient)) {
      foundIngredients.push(ingredient);
    }
  }

  return foundIngredients.slice(0, 10); // Return max 10 ingredients
}
