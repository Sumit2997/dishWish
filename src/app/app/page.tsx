// src/app/app/page.tsx
'use client';

import { useEffect } from 'react';
import { ChefHat, Sparkles } from 'lucide-react';
import RecipeForm from '@/components/recipe/recipe-form';
import { Button } from '@/components/ui/button';
import { useAppContext } from './layout';
import RecipeCard from '@/components/recipe/recipe-card';
import { useRouter } from 'next/navigation';
import type { Recipe } from './layout'; // Import Recipe type

const AppDashboard: React.FC = () => {
  const router = useRouter();
  const {
    handleGenerateRecipes,
    isLoading,
    selectedRecipe,
    setSelectedRecipe,
    recipes: previousRecipes,
  } = useAppContext();

  // Open AI generation modal automatically when page loads
  useEffect(() => {
    // We'll show the form directly on the page instead of in a modal
  }, []);

  // Handle recipe selection
  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    // Navigate to recipe detail page
    const recipeUrlParam = recipe.id || encodeURIComponent(recipe.name);
    router.push(`/app/recipe/${recipeUrlParam}`);
  };

  // Show the selected recipe if one is available
  if (selectedRecipe) {
    return (
      <div className="flex flex-col max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Your Recipe</h1>
          <Button
            variant="outline"
            onClick={() => setSelectedRecipe(null)}
            className="text-sm"
          >
            Generate Another Recipe
          </Button>
        </div>

        <div className="bg-card rounded-lg border border-border/50 p-6 shadow-md cursor-pointer" 
             onClick={() => handleRecipeClick(selectedRecipe)}>
          <RecipeCard recipe={selectedRecipe} />
        </div>
      </div>
    );
  }

  // Otherwise show the recipe generator form
  return (
    <div className="flex flex-col max-w-2xl mx-auto">
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <div className="bg-primary/10 p-3 rounded-full mb-4">
          <ChefHat className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Generate Indian Recipes</h1>
        <p className="text-muted-foreground max-w-md">
          Describe the ingredients you have or upload a photo, and we'll create delicious Indian recipe suggestions for you.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border/50 p-6 shadow-md">
        <RecipeForm onSubmit={handleGenerateRecipes} isLoading={isLoading} />
      </div>

      {previousRecipes.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
            <Sparkles className="h-5 w-5 text-primary mr-2" />
            Your Previous Recipes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {previousRecipes.slice(0, 4).map((recipe, index) => (
              <div 
                key={`${recipe.id || recipe.name}-${index}`}
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleRecipeClick(recipe)}
              >
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppDashboard;
