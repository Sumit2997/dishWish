// src/components/cookbooks/add-recipes-to-cookbook-modal.tsx
'use client';

import type { Dispatch, FC, SetStateAction } from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Search, Filter, X, LayoutGrid, CheckCircle, Circle } from 'lucide-react'; // Added CheckCircle, Circle
import { cn } from '@/lib/utils';
import type { Recipe } from '@/app/app/layout'; // Import Recipe type
import { Badge } from '@/components/ui/badge'; // Import Badge
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface AddRecipesToCookbookModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  availableRecipes: Recipe[];
  cookbookName: string;
  onAddRecipes: (selectedRecipes: Recipe[]) => void; // Callback with selected recipe objects
}

const AddRecipesToCookbookModal: FC<AddRecipesToCookbookModalProps> = ({
  isOpen,
  setIsOpen,
  availableRecipes,
  cookbookName,
  onAddRecipes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(new Set()); // Use recipe name as ID for now
  const { toast } = useToast();

  // Filter recipes based on search term
  const filteredRecipes = availableRecipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fallback image
  const getImageUrl = (recipe: Recipe) => {
    const fallbackImageUrl = `https://picsum.photos/seed/${encodeURIComponent(recipe.name)}/200/150`;
    const imageUrl = recipe.imageDataUri || fallbackImageUrl;
    return imageUrl;
  };

   // Toggle recipe selection
   const handleToggleSelect = (recipeName: string) => {
     setSelectedRecipeIds((prevSelected) => {
       const newSelected = new Set(prevSelected);
       if (newSelected.has(recipeName)) {
         newSelected.delete(recipeName);
       } else {
         newSelected.add(recipeName);
       }
       return newSelected;
     });
   };

   const handleSave = () => {
      if (selectedRecipeIds.size === 0) {
         toast({
            variant: 'destructive',
            title: 'No Recipes Selected',
            description: 'Please select at least one recipe to add.',
         });
         return;
      }
      const selectedRecipes = availableRecipes.filter(recipe => selectedRecipeIds.has(recipe.name));
      onAddRecipes(selectedRecipes);
      setIsOpen(false); // Close modal after saving
      setSelectedRecipeIds(new Set()); // Reset selection
   };

   // Reset state when modal opens/closes
   const onOpenChange = (open: boolean) => {
     if (!open) {
       setSearchTerm('');
       setSelectedRecipeIds(new Set());
     }
     setIsOpen(open);
   };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
       {/* Adjusted size and styling based on image */}
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl h-[85vh] flex flex-col bg-card border-border/50 rounded-lg shadow-xl text-card-foreground p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/30 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Add recipes
            </DialogTitle>
             <DialogDescription className="text-sm text-muted-foreground mt-1">
                Select recipes to add to "{cookbookName}"
             </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <LayoutGrid className="h-4 w-4" />
             </Button>
             <DialogClose asChild>
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-8 w-8 opacity-70 hover:opacity-100"
               >
                 <X className="h-4 w-4" />
                 <span className="sr-only">Close</span>
               </Button>
             </DialogClose>
           </div>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-border/30">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by title, ingredients or content..."
                        className="pl-9 w-full h-9 bg-input border-border/50 focus:border-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-9 border-muted-foreground/50">
                    <Filter className="mr-1.5 h-4 w-4" /> Filters
                </Button>
            </div>
             {/* Filter Chips - can be added later */}
             {/* <div className="flex flex-wrap gap-2 mt-3"> ... </div> */}
        </div>

        {/* Recipe Grid */}
        <ScrollArea className="flex-1 px-6 py-4">
          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredRecipes.map((recipe) => {
                  const imageUrl = getImageUrl(recipe);
                  const isDataUri = imageUrl.startsWith('data:');
                  const isSelected = selectedRecipeIds.has(recipe.name);
                  return (
                      <button
                        key={recipe.name}
                        onClick={() => handleToggleSelect(recipe.name)}
                        className={cn(
                           "group relative rounded-lg overflow-hidden border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-card bg-secondary/30 hover:bg-accent",
                           isSelected ? "border-primary/70 ring-2 ring-primary/50" : "border-border/40 hover:border-primary/50"
                        )}
                      >
                         {/* Selection Overlay */}
                         <div className={cn(
                            "absolute top-2 right-2 z-10 h-5 w-5 rounded-full flex items-center justify-center border transition-colors",
                             isSelected
                               ? "bg-primary border-primary text-primary-foreground"
                               : "bg-background/50 border-muted-foreground/50 text-muted-foreground group-hover:border-primary"
                           )}>
                             {isSelected ? <CheckCircle className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                         </div>

                        <div className="relative w-full aspect-[4/3] bg-muted">
                          <Image
                            src={imageUrl}
                            alt={recipe.name}
                            layout="fill"
                            objectFit="cover"
                            unoptimized={isDataUri}
                             onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const fallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(recipe.name)}/200/150`;
                                if (target.src !== fallbackUrl) {
                                  target.src = fallbackUrl;
                                  target.srcset = "";
                                }
                             }}
                          />
                           {/* Optional: Dark overlay for text contrast */}
                           {/* <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" /> */}
                        </div>
                        <div className="p-3">
                          <h4 className={cn(
                              "text-sm font-medium truncate transition-colors",
                               isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                           )}>
                            {recipe.name}
                          </h4>
                        </div>
                      </button>
                  );
                })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-10">
              {searchTerm ? `No recipes found matching "${searchTerm}".` : 'No recipes available in your collection.'}
            </p>
          )}
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border/30 flex justify-end bg-card">
             {/* Cancel button removed, use X */}
             {/* <DialogClose asChild>
               <Button variant="outline">Cancel</Button>
             </DialogClose> */}
           <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={selectedRecipeIds.size === 0}
            >
              Save Recipe ({selectedRecipeIds.size})
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecipesToCookbookModal;
