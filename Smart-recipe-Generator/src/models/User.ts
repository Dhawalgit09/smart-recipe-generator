import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  email?: string;
  name?: string;
  preferences: {
    dietaryRestrictions: string[];
    favoriteCuisines: string[];
    preferredCookingTime: number;
    spiceLevel: 'mild' | 'medium' | 'hot';
    servingSize: number;
  };
  feedbackHistory: mongoose.Types.ObjectId[];
  favoriteRecipes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    sparse: true
  },
  name: String,
  preferences: {
    dietaryRestrictions: [String],
    favoriteCuisines: [String],
    preferredCookingTime: {
      type: Number,
      default: 30
    },
    spiceLevel: {
      type: String,
      enum: ['mild', 'medium', 'hot'],
      default: 'medium'
    },
    servingSize: {
      type: Number,
      default: 4
    }
  },
  feedbackHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'RecipeFeedback'
  }],
  favoriteRecipes: [{
    type: Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
