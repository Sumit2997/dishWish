'use client';

import { useState } from 'react';
import RecipeForm from '@/components/recipe/recipe-form';
import RecipeCard from '@/components/recipe/recipe-card';
import { generateRecipes, type GenerateRecipesInput, type GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function Home() {
  const [recipes, setRecipes] = useState<GenerateRecipesOutput['recipes']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (data: GenerateRecipesInput) => {
    setIsLoading(true);
    setError(null);
    setRecipes([]); // Clear previous recipes

    try {
      console.log('Submitting to generateRecipes:', data);
      const result = await generateRecipes(data);
      console.log('Received from generateRecipes:', result);

      if (result && result.recipes && result.recipes.length > 0) {
        setRecipes(result.recipes);
         toast({
          title: "Recipes Generated!",
          description: `Found ${result.recipes.length} delicious recipes for you.`,
        });
      } else {
        setError('No recipes found for the provided input. Try a different vegetable or image.');
        toast({
          variant: "destructive",
          title: "Uh oh! No Recipes Found",
          description: "Couldn't find any recipes. Please try again.",
        });
      }
    } catch (err) {
       console.error('Error generating recipes:', err);
       const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
       setError(`Failed to generate recipes: ${errorMessage}`);
       toast({
         variant: "destructive",
         title: "Error Generating Recipes",
         description: errorMessage,
       });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-12">
        <RecipeForm onSubmit={handleFormSubmit} isLoading={isLoading} />
      </div>

      {error && (
         <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                 <Skeleton className="h-4 w-[150px]" />
                 <Skeleton className="h-4 w-[180px]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && recipes.length > 0 && (
        <div>
           <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-primary">
             Your Delicious Recipes
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} />
            ))}
           </div>
        </div>
      )}
    </div>
  );
}
