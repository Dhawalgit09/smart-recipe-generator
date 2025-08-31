import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
  recipeId: string;
  name: string;
  description: string;
  ingredients: Array<{
    ingredient: string;
    amount: number;
    unit: string;
    notes?: string;
    isOptional: boolean;
  }>;
  instructions: Array<{
    stepNumber: number;
    instruction: string;
    timeMinutes?: number;
    tips?: string;
  }>;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    cholesterol?: number;
  };
  cookingTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisineType: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  tags: string[];
  imageUrl?: string;
  rating: number;
  totalRatings: number;
  servings: number;
  prepTime: number;
  totalTime: number;
  isAIGenerated: boolean;
  source: 'user' | 'ai' | 'sample';
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema = new Schema<IRecipe>({
  recipeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  ingredients: [{
    ingredient: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    notes: String,
    isOptional: {
      type: Boolean,
      default: false
    }
  }],
  instructions: [{
    stepNumber: {
      type: Number,
      required: true
    },
    instruction: {
      type: String,
      required: true
    },
    timeMinutes: Number,
    tips: String
  }],
  nutritionalInfo: {
    calories: {
      type: Number,
      required: true
    },
    protein: {
      type: Number,
      required: true
    },
    carbs: {
      type: Number,
      required: true
    },
    fat: {
      type: Number,
      required: true
    },
    fiber: Number,
    sugar: Number,
    sodium: Number,
    cholesterol: Number
  },
  cookingTime: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  cuisineType: {
    type: String,
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'],
    required: true
  },
  tags: [String],
  imageUrl: String,
  rating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  servings: {
    type: Number,
    required: true
  },
  prepTime: {
    type: Number,
    required: true
  },
  totalTime: {
    type: Number,
    required: true
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['user', 'ai', 'sample'],
    default: 'ai'
  }
}, {
  timestamps: true
});

// Index for better query performance
RecipeSchema.index({ cuisineType: 1, difficulty: 1, mealType: 1 });
RecipeSchema.index({ tags: 1 });
RecipeSchema.index({ rating: -1 });

export default mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);
