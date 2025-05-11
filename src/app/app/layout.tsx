// src/app/app/layout.tsx
'use client';

import React, { useState, useCallback } from 'react';
import type { FC, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';
import RecipeForm from '@/components/recipe/recipe-form';
import { generateRecipes, type GenerateRecipesInput, type GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { useToast } from '@/hooks/use-toast';
import SelectRecipeModal from '@/components/recipe/select-recipe-modal';
import { db } from "@/lib/firebase/config";
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Define the base recipe type from GenerateRecipesOutput
type BaseRecipe = GenerateRecipesOutput['recipes'][0];

// Define the Recipe type with additional fields
export type Recipe = BaseRecipe & {
  id: string;
  createdAt?: string;
};

// Simplified context
interface AppContextProps {
  recipes: Recipe[];
  isLoading: boolean;
  handleGenerateRecipes: (data: { description?: string; ingredientImage?: string; tags?: string[] }) => Promise<void>;
  isSelectRecipeModalOpen: boolean;
  generatedRecipeOptions: Recipe[];
  selectedRecipe: Recipe | null;
  setSelectedRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
}

const AppContext = React.createContext<AppContextProps | null>(null);

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isSelectRecipeModalOpen, setIsSelectRecipeModalOpen] = useState(false);
  const [generatedRecipeOptions, setGeneratedRecipeOptions] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const { toast } = useToast();

  // Load previously generated recipes on mount
  React.useEffect(() => {
    const loadRecipes = async () => {
      try {
        const recipesCollection = collection(db, 'recipes');
        const q = query(recipesCollection, orderBy('createdAt', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        const loadedRecipes: Recipe[] = [];
        
        snapshot.forEach((doc) => {
          loadedRecipes.push({
            id: doc.id,
            ...doc.data() as BaseRecipe,
          });
        });
        
        setRecipes(loadedRecipes);
      } catch (error) {
        console.error('Error loading recipes:', error);
        // Don't let Firestore errors block the app functionality
        // Just continue with an empty recipes array
        setRecipes([]);
      }
    };
    
    loadRecipes();
  }, []);

  const handleGenerateRecipes = useCallback(async (data: { description?: string; ingredientImage?: string; tags?: string[] }) => {
    setIsLoading(true);
    setGeneratedRecipeOptions([]);
    setIsSelectRecipeModalOpen(true);

    try {
      const input: GenerateRecipesInput = {
        vegetableName: data.description,
        vegetableImage: data.ingredientImage,
        tags: data.tags,
      };

      console.log('Generating recipes with input:', input);

      const result = await generateRecipes(input);
      setIsLoading(false);

      if (result && result.recipes && result.recipes.length > 0) {
        toast({
          title: 'Recipe Suggestions Ready!',
          description: `Select one of the ${result.recipes.length} suggestions.`,
        });

        // Skip saving to Firestore which is causing errors
        // Instead, directly use the recipes with temporary IDs
        const newRecipes: Recipe[] = result.recipes.map(recipe => ({
            ...recipe,
          id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            createdAt: new Date().toISOString(),
        }));

        setGeneratedRecipeOptions(newRecipes);
      } else {
        toast({
          variant: 'destructive',
          title: 'No Recipes Found',
          description: "Couldn't generate recipes for that input. Try refining your description or image.",
        });
        setGeneratedRecipeOptions([]);
      }
    } catch (err) {
      console.error('Error generating recipes:', err);
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during generation.';
      toast({
        variant: 'destructive',
        title: 'Error Generating Recipes',
        description: errorMessage,
      });
      setGeneratedRecipeOptions([]);
    }
  }, [toast]);

  // Handle recipe selection
  const handleRecipeSelection = React.useCallback((recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsSelectRecipeModalOpen(false);
    
    // Add to recipes history if not already there
    setRecipes(prevRecipes => {
      if (!prevRecipes.some(r => r.id === recipe.id)) {
        return [recipe, ...prevRecipes];
      }
      return prevRecipes;
    });

    toast({
      title: `Recipe Selected: ${recipe.name}`,
      description: "Your recipe is ready.",
    });
  }, [toast]);

  const contextValue: AppContextProps = {
    recipes,
    isLoading,
    handleGenerateRecipes,
    isSelectRecipeModalOpen,
    generatedRecipeOptions,
    selectedRecipe,
    setSelectedRecipe
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto py-8 px-4">
            {children}
          </main>

        <SelectRecipeModal
          isOpen={isSelectRecipeModalOpen}
          setIsOpen={setIsSelectRecipeModalOpen}
          recipes={generatedRecipeOptions}
          onSelectRecipe={(recipe: BaseRecipe) => {
            if ('id' in recipe) {
              handleRecipeSelection(recipe as Recipe);
            } else {
              const recipeWithId = {
                ...recipe,
                id: `temp-${Date.now()}`,
              };
              handleRecipeSelection(recipeWithId);
            }
          }}
          isLoading={isLoading}
          onTryAgain={() => {
            setIsSelectRecipeModalOpen(false);
            setSelectedRecipe(null);
          }}
        />
      </div>
    </AppContext.Provider>
  );
};

export default AppLayout;
