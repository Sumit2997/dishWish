// src/app/app/layout.tsx
'use client';

import React, { useState, useCallback } from 'react'; // Added React import
import type { FC, ReactNode } from 'react';
import AppSidebar from '@/components/layout/sidebar';
import { SidebarInset, SidebarRail, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button'; // Import Button
import { Compass, Plus, Sparkles, Search, Filter, LayoutGrid, ChefHat, X } from 'lucide-react'; // Import X
import { AddRecipeModal } from '@/components/recipe/add-recipe-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import RecipeForm from '@/components/recipe/recipe-form';
import { generateRecipes, type GenerateRecipesInput, type GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { useToast } from '@/hooks/use-toast';
import SelectRecipeModal from '@/components/recipe/select-recipe-modal'; // Import the SelectRecipeModal

// Define the Recipe type based on GenerateRecipesOutput
type Recipe = GenerateRecipesOutput['recipes'][0];

// Create a context to share state and functions
interface AppContextProps {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  handleGenerateRecipes: (data: { description?: string; ingredientImage?: string; tags?: string[] }) => Promise<void>;
   // Add modal control states to context
  isSelectRecipeModalOpen: boolean;
  setIsSelectRecipeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  generatedRecipeOptions: Recipe[];
  handleRecipeSelection: (selectedRecipe: Recipe) => void;
  handleOpenAIGeneration: () => void; // Expose the function to open AI modal
}

const AppContext = React.createContext<AppContextProps | null>(null);

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};


interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const [isAIGenerationModalOpen, setIsAIGenerationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Search term state
  const [recipes, setRecipes] = useState<Recipe[]>([]); // Main recipes list managed here
  const [isSelectRecipeModalOpen, setIsSelectRecipeModalOpen] = useState(false); // State for selection modal
  const [generatedRecipeOptions, setGeneratedRecipeOptions] = useState<Recipe[]>([]); // State for generated options

  const { toast } = useToast();

  const handleOpenAddRecipeModal = () => setIsAddRecipeModalOpen(true);

  const handleOpenAIGeneration = useCallback(() => {
    setIsAddRecipeModalOpen(false); // Close selection modal if open
    setIsAIGenerationModalOpen(true); // Open AI form modal
  }, []);

  const handleGenerateRecipes = useCallback(async (data: { description?: string; ingredientImage?: string; tags?: string[] }) => {
     setIsLoading(true);
     setIsAIGenerationModalOpen(false); // Close AI form modal immediately

     try {
       const input: GenerateRecipesInput = {
         vegetableName: data.description,
         vegetableImage: data.ingredientImage,
         tags: data.tags,
       };
       console.log("Generating recipes with input:", input);

       const result = await generateRecipes(input);

       if (result && result.recipes && result.recipes.length > 0) {
         toast({
           title: "Recipe Suggestions Ready!",
           description: `Select one of the ${result.recipes.length} suggestions.`,
         });
         setGeneratedRecipeOptions(result.recipes); // Store generated options
         setIsSelectRecipeModalOpen(true); // Open the selection modal
       } else {
         toast({
           variant: "destructive",
           title: "No Recipes Found",
           description: "Couldn't generate recipes for that input. Try refining your description or image.",
         });
         setGeneratedRecipeOptions([]);
       }
     } catch (err) {
        console.error('Error generating recipes:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during generation.';
        toast({
          variant: "destructive",
          title: "Error Generating Recipes",
          description: errorMessage,
        });
        setGeneratedRecipeOptions([]);
     } finally {
       setIsLoading(false);
     }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [toast]); // Dependencies for useCallback

   // Function to handle selecting a recipe from the modal
   const handleRecipeSelection = useCallback((selectedRecipe: Recipe) => {
     setRecipes(prevRecipes => [selectedRecipe, ...prevRecipes]); // Add the selected recipe to the main list
     setIsSelectRecipeModalOpen(false); // Close the modal
     setGeneratedRecipeOptions([]); // Clear the temporary options
     toast({
       title: `Recipe Added: ${selectedRecipe.name}`,
       description: "The new recipe has been added to your list.",
     });
   }, [toast]); // Added toast as dependency


   // Provide context value
   const contextValue: AppContextProps = {
     recipes,
     setRecipes,
     isLoading,
     searchTerm,
     setSearchTerm,
     handleGenerateRecipes, // Pass down the generation handler
     isSelectRecipeModalOpen, // Pass modal state
     setIsSelectRecipeModalOpen, // Pass modal setter
     generatedRecipeOptions, // Pass generated options
     handleRecipeSelection, // Pass selection handler
     handleOpenAIGeneration, // Pass handler to open AI modal
   };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="flex h-screen bg-background"> {/* Ensure background color */}
        <AppSidebar />
        <SidebarRail />
        {/* Main content area with SidebarInset */}
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
           <header className="flex h-16 items-center gap-4 border-b border-border/50 bg-muted/30 px-6 sticky top-0 z-30"> {/* Adjusted styling */}
             {/* Mobile Sidebar Trigger */}
             <div className="md:hidden">
                <SidebarTrigger />
             </div>
             {/* Page Title */}
             <div className="flex-1">
               <h1 className="font-semibold text-xl text-foreground">My Recipes</h1>
             </div>

              {/* Header Actions */}
             <div className="ml-auto flex items-center gap-2">
                 <Button variant="outline" size="sm" className="border-muted-foreground/30 text-foreground">
                    <Compass className="mr-1.5 h-4 w-4" /> Discover
                 </Button>
                  <Button
                     size="sm"
                     className="bg-primary text-primary-foreground hover:bg-primary/90"
                     onClick={handleOpenAddRecipeModal}
                  >
                     <Plus className="mr-1.5 h-4 w-4" /> Add recipe
                  </Button>
             </div>
           </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
             {/* Search and Filter moved inside main, rendered by page */}
             {/* Children will now render the page content which includes search/filter and grid */}
            {children}
          </main>

        </SidebarInset>

        {/* Add Recipe Selection Modal */}
        <AddRecipeModal
           isOpen={isAddRecipeModalOpen}
           setIsOpen={setIsAddRecipeModalOpen}
           onSelectAIGeneration={handleOpenAIGeneration}
        />

         {/* AI Generation Form Modal (using Dialog) */}
         <Dialog open={isAIGenerationModalOpen} onOpenChange={setIsAIGenerationModalOpen}>
           <DialogContent className="sm:max-w-xl md:max-w-2xl bg-card border-border/50 rounded-lg shadow-xl">
               <DialogHeader className="flex-row items-center justify-between space-y-0 pr-10 border-b border-border/30 pb-4 mb-4">
                   <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <DialogTitle className="text-lg font-semibold text-foreground">AI Recipe Generator</DialogTitle>
                       {/* Badge removed as per UI preference */}
                   </div>
                   <DialogClose asChild>
                     <Button variant="ghost" size="icon" className="h-7 w-7 opacity-70 hover:opacity-100">
                       <X className="h-4 w-4" />
                     </Button>
                   </DialogClose>
               </DialogHeader>
               {/* Recipe Form takes onSubmit and isLoading */}
               <RecipeForm onSubmit={handleGenerateRecipes} isLoading={isLoading} />
           </DialogContent>
         </Dialog>

          {/* Select Recipe Modal - Rendered here as it's triggered from layout */}
          <SelectRecipeModal
             isOpen={isSelectRecipeModalOpen}
             setIsOpen={setIsSelectRecipeModalOpen}
             recipes={generatedRecipeOptions}
             onSelectRecipe={handleRecipeSelection}
             onTryAgain={() => {
               setIsSelectRecipeModalOpen(false);
               handleOpenAIGeneration(); // Re-open the generation form
             }}
           />

      </div>
    </AppContext.Provider>
  );
};

// Export the context provider as well if needed elsewhere, though AppLayout wraps everything under /app
// export { AppProvider };
export default AppLayout;
