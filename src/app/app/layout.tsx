
'use client';

import type { FC, ReactNode } from 'react';
import { useState } from 'react'; // Import useState
import AppSidebar from '@/components/layout/sidebar';
import { SidebarInset, SidebarRail, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Compass, Plus } from 'lucide-react';
import { AddRecipeModal } from '@/components/recipe/add-recipe-modal'; // Import AddRecipeModal
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'; // Import Dialog components
import RecipeForm from '@/components/recipe/recipe-form'; // Import RecipeForm
import { generateRecipes, type GenerateRecipesInput } from '@/ai/flows/generate-recipes'; // Import generateRecipes
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const [isAIGenerationModalOpen, setIsAIGenerationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state for AI generation
  const { toast } = useToast();

  // Function to open the Add Recipe selection modal
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
     setIsAIGenerationModalOpen(false); // Close AI form modal

     try {
       const result = await generateRecipes(data);
       // Assuming the generated recipes should be displayed on the page inside {children}
       // We might need a way to pass these recipes down or use context/state management
       // For now, just show a toast message.
       if (result && result.recipes && result.recipes.length > 0) {
          toast({
           title: "Recipes Generated!",
           description: `Found ${result.recipes.length} new recipes. They should appear in your list shortly.`, // Adjust message as needed
         });
         // TODO: Add logic to refresh or update the recipe list in the child component (AppPage)
       } else {
         toast({
           variant: "destructive",
           title: "No Recipes Found",
           description: "Couldn't generate recipes for that input.",
         });
       }
     } catch (err) {
        console.error('Error generating recipes:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
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
    <div className="flex h-screen">
      <AppSidebar />
      <SidebarRail />
      {/* Main content area with SidebarInset */}
      <SidebarInset className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 md:h-16 lg:px-8">
           {/* Mobile Sidebar Trigger */}
           <div className="md:hidden">
              <SidebarTrigger />
           </div>
           <div className="flex-1 font-semibold text-lg">My Recipes</div>
             {/* Action buttons */}
             <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm">
                   <Compass className="mr-1.5 h-4 w-4" /> Discover
                </Button>
                 {/* Updated Add Recipe button */}
                 <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleOpenAddRecipeModal} // Open the selection modal
                 >
                    <Plus className="mr-1.5 h-4 w-4" /> Add recipe
                 </Button>
             </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
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
         <DialogContent className="sm:max-w-lg">
             <DialogHeader>
                 <DialogTitle>AI Recipe Suggestions</DialogTitle>
                 <DialogDescription>
                     Enter a vegetable name or upload an image to get recipe ideas.
                  </DialogDescription>
             </DialogHeader>
             <RecipeForm onSubmit={handleGenerateRecipe} isLoading={isLoading} />
         </DialogContent>
       </Dialog>

    </div>
  );
};

export default AppLayout;
