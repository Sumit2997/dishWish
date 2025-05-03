
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RecipeForm from '@/components/recipe/recipe-form';
import RecipeCard from '@/components/recipe/recipe-card';
import { generateRecipes, type GenerateRecipesInput, type GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2, Search, Filter, LayoutGrid, List, Plus, Compass, BookMarked } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoginModal } from '@/components/auth/login-modal';
import { AddRecipeModal } from '@/components/recipe/add-recipe-modal'; // Import the new modal

export default function AppPage() {
  const [recipes, setRecipes] = useState<GenerateRecipesOutput['recipes']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false); // State for Add Recipe modal
  const [isAIGenerationModalOpen, setIsAIGenerationModalOpen] = useState(false); // State for AI form modal
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // State for view mode


  // Protect the page - Show login modal if not logged in and not loading
  useEffect(() => {
    if (!authLoading && !user) {
      setIsLoginModalOpen(true);
    }
  }, [user, authLoading]);

  // Function to open the Add Recipe modal
  const handleOpenAddRecipeModal = () => {
    setIsAddRecipeModalOpen(true);
  };

  // Function to open the AI Generation form/modal
  const handleOpenAIGeneration = () => {
     setIsAddRecipeModalOpen(false); // Close the selection modal
     setIsAIGenerationModalOpen(true); // Open the AI form
  };

  // Handle recipe generation when AI form is submitted
  const handleGenerateRecipe = async (data: GenerateRecipesInput) => {
     setIsLoading(true);
     setError(null);
     setIsAIGenerationModalOpen(false); // Close AI form modal
     // setRecipes([]); // Keep existing recipes or clear? Depends on UX

     try {
       const result = await generateRecipes(data);
       if (result && result.recipes && result.recipes.length > 0) {
         setRecipes(prev => [...result.recipes, ...prev]); // Add new recipes
          toast({
           title: "Recipes Generated!",
           description: `Found ${result.recipes.length} new recipes.`,
         });
       } else {
         setError('No recipes found for the provided input.');
         toast({
           variant: "destructive",
           title: "No Recipes Found",
           description: "Couldn't generate recipes for that input.",
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


   // --- Render Logic ---

   // Loading state for authentication
   if (authLoading) {
     return (
       <div className="flex flex-1 items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }

   // If not logged in (should be handled by redirect or modal via useEffect, but added as fallback)
   if (!user) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
           <h2 className="text-2xl font-semibold mb-4">Login Required</h2>
           <p className="text-muted-foreground mb-6">Please log in or sign up to view your recipes.</p>
           <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />
        </div>
     );
   }

   // If logged in, show the "My Recipes" dashboard
  return (
    <div className="flex flex-col h-full">
       {/* Search and Filter Bar */}
       <div className="flex items-center gap-4 mb-6">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             type="search"
             placeholder="Search by title, ingredients or content..."
             className="pl-10 w-full bg-input" // Use input bg color from theme
             // Add state and onChange handler for search
           />
         </div>
         <Button variant="outline" className="shrink-0">
           <Filter className="mr-2 h-4 w-4" />
           Filters
         </Button>
         {/* View Mode Toggle */}
         <div className="flex items-center rounded-md border bg-secondary p-1">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="icon"
              className={`h-7 w-7 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
             <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="icon"
              className={`h-7 w-7 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setViewMode('list')}
             >
               <List className="h-4 w-4" />
             </Button>
         </div>
       </div>

        {/* Recipe Display Area */}
        {error && (
          <Alert variant="destructive" className="mb-8 bg-card/90">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          // Skeleton loading state based on view mode
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" : "flex flex-col gap-4"}>
             {[...Array(5)].map((_, index) => (
               <div key={index} className="flex flex-col space-y-3 p-4 bg-card rounded-lg shadow-md">
                 <Skeleton className="h-[125px] w-full rounded-xl bg-muted/50" />
                 <div className="space-y-2">
                   <Skeleton className="h-4 w-[80%] bg-muted/50" />
                   <Skeleton className="h-4 w-[60%] bg-muted/50" />
                 </div>
               </div>
             ))}
           </div>
        )}

        {!isLoading && recipes.length > 0 && (
           <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" : "flex flex-col gap-4"}>
             {recipes.map((recipe, index) => (
               <RecipeCard key={index} recipe={recipe} />
             ))}
           </div>
        )}

         {!isLoading && recipes.length === 0 && !error && (
           <div className="flex flex-1 flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-lg">
             <BookMarked className="h-12 w-12 text-muted-foreground mb-4" />
             <h3 className="text-xl font-semibold text-foreground mb-2">No Recipes Yet</h3>
             <p className="text-muted-foreground mb-4">Add your first recipe or discover new ones!</p>
             <div className="flex gap-3">
                {/* Updated button to open the AddRecipeModal */}
                <Button onClick={handleOpenAddRecipeModal} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> Add Recipe
                </Button>
                 {/* Placeholder for Discover button action */}
                 <Button variant="outline">
                    <Compass className="mr-2 h-4 w-4" /> Discover
                 </Button>
             </div>
           </div>
         )}

      {/* Login Modal (rendered conditionally) */}
      <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />

      {/* Add Recipe Modal (selection modal) */}
      <AddRecipeModal
         isOpen={isAddRecipeModalOpen}
         setIsOpen={setIsAddRecipeModalOpen}
         onSelectAIGeneration={handleOpenAIGeneration}
      />

      {/* AI Generation Form Modal (using Dialog for simplicity) */}
      {/* You might want a dedicated component for this */}
      <Dialog open={isAIGenerationModalOpen} onOpenChange={setIsAIGenerationModalOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>AI Recipe Suggestions</DialogTitle>
                <DialogDescription>
                    Enter a vegetable name or upload an image to get recipe ideas.
                 </DialogDescription>
            </DialogHeader>
            <RecipeForm onSubmit={handleGenerateRecipe} isLoading={isLoading} />
             {/* Close button handled by DialogContent */}
        </DialogContent>
      </Dialog>

    </div>
  );
}
