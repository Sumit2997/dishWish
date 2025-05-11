// src/app/app/layout.tsx
'use client';

import React, { useState, useCallback } from 'react';
import type { FC, ReactNode } from 'react';
import AppSidebar from '@/components/layout/sidebar';
import { SidebarInset, SidebarRail, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Compass, Plus, Sparkles, X } from 'lucide-react';
import { AddRecipeModal } from '@/components/recipe/add-recipe-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import RecipeForm from '@/components/recipe/recipe-form';
import { generateRecipes, type GenerateRecipesInput, type GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { useToast } from '@/hooks/use-toast';
import SelectRecipeModal from '@/components/recipe/select-recipe-modal';
import { db } from "@/lib/firebase/config";
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context'; // Import auth context

// Define the base recipe type from GenerateRecipesOutput
type BaseRecipe = GenerateRecipesOutput['recipes'][0];

// Define the Recipe type with additional fields
export type Recipe = BaseRecipe & {
  id: string;
  createdAt?: string;
};

// Define structure for a planned meal
export interface PlannedMeal {
  recipeName: string;
  recipeId: string;
}

// Define structure for daily plan
export interface DailyPlan {
  date: Date;
  meals: {
    Breakfast?: PlannedMeal | null;
    Lunch?: PlannedMeal | null;
    Dinner?: PlannedMeal | null;
    Snack?: PlannedMeal | null;
  };
}

// Create a context to share state and functions
interface AppContextProps {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  handleGenerateRecipes: (data: { description?: string; ingredientImage?: string; tags?: string[] }) => Promise<void>;
  isSelectRecipeModalOpen: boolean;
  setIsSelectRecipeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  generatedRecipeOptions: Recipe[];
  handleRecipeSelection: (selectedRecipe: Recipe) => void;
  handleOpenAIGeneration: () => void;
  weeklyPlan: DailyPlan[];
  setWeeklyPlan: React.Dispatch<React.SetStateAction<DailyPlan[]>>;
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
  const { user } = useAuth(); // Get the current user
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const [isAIGenerationModalOpen, setIsAIGenerationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isSelectRecipeModalOpen, setIsSelectRecipeModalOpen] = useState(false);
  const [generatedRecipeOptions, setGeneratedRecipeOptions] = useState<Recipe[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<DailyPlan[]>([]);

  const { toast } = useToast();

  const handleOpenAddRecipeModalInternal = () => setIsAddRecipeModalOpen(true);

  const handleOpenAIGeneration = useCallback(() => {
    setIsAddRecipeModalOpen(false);
    setIsAIGenerationModalOpen(true);
  }, []);

  const handleGenerateRecipes = useCallback(async (data: { description?: string; ingredientImage?: string; tags?: string[] }) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Authenticated',
        description: 'You must be logged in to generate recipes.',
      });
      return;
    }

    setIsLoading(true);
    setIsAIGenerationModalOpen(false);
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

        // Save generated recipes to Firestore
        const recipesCollection = collection(db, 'recipes');
        const newRecipes: Recipe[] = [];
        for (const recipe of result.recipes) {
          const docRef = await addDoc(recipesCollection, {
            ...recipe,
            userId: user.uid, // Reference to the user
            createdAt: new Date().toISOString(),
          });
          newRecipes.push({ id: docRef.id, ...recipe });
        }

        setGeneratedRecipeOptions(newRecipes);
        // Update the recipes state with the newly added recipes
        setRecipes((prevRecipes) => [...newRecipes, ...prevRecipes]);
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
  }, [toast, user]);

  const handleRecipeSelection = useCallback((selectedRecipe: Recipe) => {
    setRecipes(prevRecipes => {
      if (!prevRecipes.some(r => r.name === selectedRecipe.name)) {
        return [selectedRecipe, ...prevRecipes];
      }
      return prevRecipes;
    });

    setIsSelectRecipeModalOpen(false);
    setGeneratedRecipeOptions([]);
    toast({
      title: `Recipe Added: ${selectedRecipe.name}`,
      description: 'The new recipe has been added to your collection.',
    });
  }, [toast]);

  const contextValue: AppContextProps = {
    recipes,
    setRecipes,
    isLoading,
    searchTerm,
    setSearchTerm,
    handleGenerateRecipes,
    isSelectRecipeModalOpen,
    setIsSelectRecipeModalOpen,
    generatedRecipeOptions,
    handleRecipeSelection,
    handleOpenAIGeneration,
    weeklyPlan,
    setWeeklyPlan,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <SidebarRail />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {/* Header removed from layout - will be added to individual pages */}
          {/* Header logic moved to individual pages like src/app/app/page.tsx */}

          <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
            {/* Show loading overlay or skeleton *here* if needed while recipes load on page */}
            {/* For general page loading, App Page component handles skeletons */}
            {children}
          </main>
        </SidebarInset>

        <AddRecipeModal
          isOpen={isAddRecipeModalOpen}
          setIsOpen={setIsAddRecipeModalOpen}
          onSelectAIGeneration={handleOpenAIGeneration}
        />

        <Dialog open={isAIGenerationModalOpen} onOpenChange={setIsAIGenerationModalOpen}>
          <DialogContent className="sm:max-w-xl md:max-w-2xl bg-card border-border/50 rounded-lg shadow-xl">
            <DialogHeader className="flex-row items-center justify-between space-y-0 pr-10 border-b border-border/30 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <DialogTitle className="text-lg font-semibold text-foreground">AI Recipe Generator</DialogTitle>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-70 hover:opacity-100">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogHeader>
            <RecipeForm onSubmit={handleGenerateRecipes} isLoading={isLoading} />
          </DialogContent>
        </Dialog>

        <SelectRecipeModal
          isOpen={isSelectRecipeModalOpen}
          setIsOpen={setIsSelectRecipeModalOpen}
          recipes={generatedRecipeOptions}
          onSelectRecipe={handleRecipeSelection}
          isLoading={isLoading}
          onTryAgain={() => {
            setIsSelectRecipeModalOpen(false);
            handleOpenAIGeneration();
          }}
        />
      </div>
    </AppContext.Provider>
  );
};

export default AppLayout;
