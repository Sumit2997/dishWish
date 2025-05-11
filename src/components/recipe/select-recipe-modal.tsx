// src/components/recipe/select-recipe-modal.tsx
'use client';

import type { Dispatch, FC, SetStateAction } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

type Recipe = GenerateRecipesOutput['recipes'][0];

// Skeleton Component for loading state
const SelectRecipeSkeleton: FC = () => (
  <div className="p-4 rounded-md border border-border/40 bg-secondary/30">
    <Skeleton className="h-5 w-3/4 mb-2" /> {/* Skeleton for title */}
    <Skeleton className="h-4 w-full" /> {/* Skeleton for description line 1 */}
    <Skeleton className="h-4 w-5/6 mt-1" /> {/* Skeleton for description line 2 */}
  </div>
);


interface SelectRecipeModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onTryAgain: () => void;
  isLoading?: boolean; // Add isLoading prop
}

const SelectRecipeModal: FC<SelectRecipeModalProps> = ({
  isOpen,
  setIsOpen,
  recipes,
  onSelectRecipe,
  onTryAgain,
  isLoading = false, // Default to false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg bg-card border-border/50 rounded-lg shadow-xl text-card-foreground p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/30 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {isLoading ? 'Generating Recipes...' : 'Select a recipe'}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-70 hover:opacity-100"
            onClick={() => setIsOpen(false)}
            disabled={isLoading} // Disable close button while loading
          >
            
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        {/* Recipe Options List */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            // Show shimmer effect when loading
             <>
               <SelectRecipeSkeleton />
               <SelectRecipeSkeleton />
               <SelectRecipeSkeleton />
             </>
           ) : recipes.length > 0 ? (
              // Show actual recipes when loaded
            recipes.map((recipe, index) => (
              <button
                key={index}
                onClick={() => onSelectRecipe(recipe)}
                className={cn(
                  'block w-full text-left p-4 rounded-md border border-border/40 bg-secondary/30 hover:bg-accent hover:border-primary/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-card'
                )}
              >
                <h3 className="font-semibold text-base mb-1 text-foreground">
                  {recipe.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {recipe.description || 'No description available.'}
                </p>
              </button>
            ))
          ) : (
            // Show message if no recipes were generated (and not loading)
            <p className="text-center text-muted-foreground py-8">
              No recipe suggestions were generated.
            </p>
          )}
        </div>

        {/* Footer */}
        {!isLoading && ( // Hide footer while loading
          <DialogFooter className="px-6 py-4 border-t border-border/30 flex justify-center">
            <Button
              variant="link"
              className="text-muted-foreground hover:text-primary"
              onClick={() => {
                setIsOpen(false); // Close current modal
                onTryAgain(); // Trigger the try again action (e.g., re-open generation form)
              }}
            >
              Nothing found? Try again
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SelectRecipeModal;
