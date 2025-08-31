import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipeFeedback extends Document {
  userId: string;
  recipeId: string;
  rating: number;
  review?: string;
  isFavorite: boolean;
  cookingNotes?: string;
  difficultyRating?: number;
  tasteRating?: number;
  presentationRating?: number;
  wouldCookAgain: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RecipeFeedbackSchema = new Schema<IRecipeFeedback>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  recipeId: {
    type: String,
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 1000
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  cookingNotes: {
    type: String,
    maxlength: 500
  },
  difficultyRating: {
    type: Number,
    min: 1,
    max: 5
  },
  tasteRating: {
    type: Number,
    min: 1,
    max: 5
  },
  presentationRating: {
    type: Number,
    min: 1,
    max: 5
  },
  wouldCookAgain: {
    type: Boolean,
    default: true
  },
  tags: [String]
}, {
  timestamps: true
});

// Compound index for unique user-recipe feedback
RecipeFeedbackSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

// Index for rating queries
RecipeFeedbackSchema.index({ rating: -1, createdAt: -1 });

export default mongoose.models.RecipeFeedback || mongoose.model<IRecipeFeedback>('RecipeFeedback', RecipeFeedbackSchema);
