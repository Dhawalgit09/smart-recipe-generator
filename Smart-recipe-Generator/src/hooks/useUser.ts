import { useState, useEffect } from 'react';

interface UserPreferences {
  dietaryRestrictions: string[];
  favoriteCuisines: string[];
  preferredCookingTime: number;
  spiceLevel: 'mild' | 'medium' | 'hot';
  servingSize: number;
}

interface UserData {
  userId: string;
  preferences: UserPreferences;
  totalFeedback: number;
  favoriteRecipes: string[];
}

export function useUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = () => {
    const storedUserId = localStorage.getItem('chefai_user_id');
    let userId = storedUserId;

    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chefai_user_id', userId);
    }

    // Initialize with default preferences
    const defaultUser: UserData = {
      userId,
      preferences: {
        dietaryRestrictions: [],
        favoriteCuisines: [],
        preferredCookingTime: 30,
        spiceLevel: 'medium',
        servingSize: 4
      },
      totalFeedback: 0,
      favoriteRecipes: []
    };

    setUser(defaultUser);
    setIsLoading(false);
  };

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    if (user) {
      setUser(prev => ({
        ...prev!,
        preferences: {
          ...prev!.preferences,
          ...newPreferences
        }
      }));
    }
  };

  const addToFavorites = (recipeId: string) => {
    if (user && !user.favoriteRecipes.includes(recipeId)) {
      setUser(prev => ({
        ...prev!,
        favoriteRecipes: [...prev!.favoriteRecipes, recipeId]
      }));
    }
  };

  const removeFromFavorites = (recipeId: string) => {
    if (user) {
      setUser(prev => ({
        ...prev!,
        favoriteRecipes: prev!.favoriteRecipes.filter(id => id !== recipeId)
      }));
    }
  };

  const incrementFeedbackCount = () => {
    if (user) {
      setUser(prev => ({
        ...prev!,
        totalFeedback: prev!.totalFeedback + 1
      }));
    }
  };

  return {
    user,
    isLoading,
    updatePreferences,
    addToFavorites,
    removeFromFavorites,
    incrementFeedbackCount
  };
}
