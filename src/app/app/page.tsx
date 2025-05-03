'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RecipeForm from '@/components/recipe/recipe-form';
import RecipeCard from '@/components/recipe/recipe-card';
import { generateRecipes, type GenerateRecipesInput, type GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/auth-context'; // Import useAuth
import { Button } from '@/components/ui/button';
import { LoginModal } from '@/components/auth/login-modal';

export default function AppPage() {
  const [recipes, setRecipes] = useState<GenerateRecipesOutput['recipes']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth(); // Use auth state
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

   // Protect the page - redirect if not logged in and not loading
  useEffect(() => {
    if (!authLoading && !user) {
      // Option 1: Redirect to landing page
      // router.push('/');
      // Option 2: Show login prompt (handled below)
    }
  }, [user, authLoading, router]);


  const handleFormSubmit = async (data: GenerateRecipesInput) => {
    if (!user) {
       toast({ variant: "destructive", title: "Login Required", description: "Please log in to generate recipes." });
       setIsLoginModalOpen(true);
       return;
    }

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

   // Loading state for authentication
   if (authLoading) {
     return (
       <div className="flex flex-1 items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }

   // If not logged in, show login prompt
   if (!user) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
           <h2 className="text-2xl font-semibold mb-4">Login Required</h2>
           <p className="text-muted-foreground mb-6">Please log in or sign up to access the recipe generator.</p>
           <Button onClick={() => setIsLoginModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Log in / Sign up
           </Button>
            {/* Render Login Modal */}
            <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />
        </div>
     );
   }

  // If logged in, show the recipe generator content
  return (
    <div
        className="flex-1 bg-cover bg-center bg-fixed"
        // Using a specific, attractive Indian food image
        style={{ backgroundImage: "url('https://picsum.photos/seed/indianfoodspread/1920/1080')" }}
        data-ai-hint="indian food variety platter spices colorful delicious table setting"
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-[-1]" />

        <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
            <div className="mb-12">
              <RecipeForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>

            {error && (
              <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto bg-card/90">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex flex-col space-y-3 p-4 bg-card/80 rounded-lg shadow-md backdrop-blur-sm">
                    <Skeleton className="h-[125px] w-full rounded-xl bg-muted/50" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px] bg-muted/50" />
                      <Skeleton className="h-4 w-[200px] bg-muted/50" />
                      <Skeleton className="h-4 w-[150px] bg-muted/50" />
                      <Skeleton className="h-4 w-[180px] bg-muted/50" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && recipes.length > 0 && (
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-primary drop-shadow-lg">
                  Your Delicious Recipes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {recipes.map((recipe, index) => (
                    <RecipeCard key={index} recipe={recipe} />
                  ))}
                </div>
              </div>
            )}
         </div>
          {/* Render Login Modal in case triggered by form submission */}
         <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />
    </div>
  );
}