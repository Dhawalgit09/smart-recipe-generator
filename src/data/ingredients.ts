import { Ingredient, DietaryPreference } from '../types/recipe';

export const commonIngredients: Ingredient[] = [
  { id: '1', name: 'chicken breast', category: 'protein' },
  { id: '2', name: 'ground beef', category: 'protein' },
  { id: '3', name: 'salmon', category: 'protein' },
  { id: '4', name: 'eggs', category: 'protein' },
  { id: '5', name: 'tofu', category: 'protein' },
  { id: '6', name: 'quinoa', category: 'grain' },
  { id: '7', name: 'rice', category: 'grain' },
  { id: '8', name: 'pasta', category: 'grain' },
  { id: '9', name: 'bread', category: 'grain' },
  { id: '10', name: 'onion', category: 'vegetable' },
  { id: '11', name: 'garlic', category: 'vegetable' },
  { id: '12', name: 'tomato', category: 'vegetable' },
  { id: '13', name: 'bell pepper', category: 'vegetable' },
  { id: '14', name: 'spinach', category: 'vegetable' },
  { id: '15', name: 'kale', category: 'vegetable' },
  { id: '16', name: 'carrot', category: 'vegetable' },
  { id: '17', name: 'potato', category: 'vegetable' },
  { id: '18', name: 'sweet potato', category: 'vegetable' },
  { id: '19', name: 'broccoli', category: 'vegetable' },
  { id: '20', name: 'cauliflower', category: 'vegetable' },
  { id: '21', name: 'mushroom', category: 'vegetable' },
  { id: '22', name: 'zucchini', category: 'vegetable' },
  { id: '23', name: 'eggplant', category: 'vegetable' },
  { id: '24', name: 'cucumber', category: 'vegetable' },
  { id: '25', name: 'lettuce', category: 'vegetable' },
  { id: '26', name: 'apple', category: 'fruit' },
  { id: '27', name: 'banana', category: 'fruit' },
  { id: '28', name: 'orange', category: 'fruit' },
  { id: '29', name: 'strawberry', category: 'fruit' },
  { id: '30', name: 'blueberry', category: 'fruit' },
  { id: '31', name: 'milk', category: 'dairy' },
  { id: '32', name: 'cheese', category: 'dairy' },
  { id: '33', name: 'yogurt', category: 'dairy' },
  { id: '34', name: 'butter', category: 'dairy' },
  { id: '35', name: 'olive oil', category: 'oil' },
  { id: '36', name: 'coconut oil', category: 'oil' },
  { id: '37', name: 'vegetable oil', category: 'oil' },
  { id: '38', name: 'salt', category: 'spice' },
  { id: '39', name: 'black pepper', category: 'spice' },
  { id: '40', name: 'chili powder', category: 'spice' },
  { id: '41', name: 'cumin', category: 'spice' },
  { id: '42', name: 'oregano', category: 'spice' },
  { id: '43', name: 'basil', category: 'spice' },
  { id: '44', name: 'thyme', category: 'spice' },
  { id: '45', name: 'rosemary', category: 'spice' }
];

export const dietaryPreferences: DietaryPreference[] = [
  { 
    id: 'vegetarian', 
    name: 'Vegetarian', 
    description: 'No meat, fish, or poultry',
    restrictions: ['meat', 'fish', 'poultry']
  },
  { 
    id: 'vegan', 
    name: 'Vegan', 
    description: 'No animal products including dairy and eggs',
    restrictions: ['meat', 'fish', 'poultry', 'dairy', 'eggs', 'honey', 'gelatin']
  },
  { 
    id: 'gluten-free', 
    name: 'Gluten-Free', 
    description: 'No wheat, barley, or rye',
    restrictions: ['wheat', 'barley', 'rye', 'gluten']
  },
  { 
    id: 'dairy-free', 
    name: 'Dairy-Free', 
    description: 'No milk, cheese, or dairy products',
    restrictions: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'dairy']
  },
  { 
    id: 'keto', 
    name: 'Keto', 
    description: 'Low-carb, high-fat diet',
    restrictions: ['sugar', 'grains', 'high-carb-foods']
  },
  { 
    id: 'paleo', 
    name: 'Paleo', 
    description: 'No processed foods, grains, or legumes',
    restrictions: ['grains', 'legumes', 'processed-foods', 'dairy']
  },
  { 
    id: 'low-sodium', 
    name: 'Low-Sodium', 
    description: 'Reduced salt intake',
    restrictions: ['high-sodium-foods', 'processed-foods']
  },
  { 
    id: 'low-calorie', 
    name: 'Low-Calorie', 
    description: 'Calorie-restricted diet',
    restrictions: ['high-calorie-foods', 'sugary-foods']
  },
  { 
    id: 'high-protein', 
    name: 'High-Protein', 
    description: 'Protein-rich diet',
    restrictions: ['low-protein-foods']
  },
  { 
    id: 'low-carb', 
    name: 'Low-Carb', 
    description: 'Reduced carbohydrate intake',
    restrictions: ['sugar', 'grains', 'high-carb-foods']
  }
];

export const cuisineTypes = [
  'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai',
  'Mediterranean', 'French', 'American', 'Greek', 'Spanish', 'Korean',
  'Vietnamese', 'Middle Eastern', 'African', 'Caribbean'
]; 