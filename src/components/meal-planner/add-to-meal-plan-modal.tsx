// src/components/meal-planner/add-to-meal-plan-modal.tsx
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
import { Search, Filter, X, BookOpen, Tag, ChefHat, Star, Clock, Heart, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Recipe } from '@/app/app/layout'; // Import Recipe type
import { Badge } from '@/components/ui/badge'; // Import Badge
import { format } from 'date-fns';

interface AddToMealPlanModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  selectedDate: Date | null;
  selectedMealType: string | null;
}

// Filter Chip Component
const FilterChip: FC<{ icon: React.ElementType; label: string }> = ({ icon: Icon, label }) => (
  <Button
    variant="outline"
    size="sm"
    className="h-8 px-3 rounded-full border-muted-foreground/30 text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-primary"
  >
    <Icon className="h-3.5 w-3.5 mr-1.5" />
    {label}
  </Button>
);


const AddToMealPlanModal: FC<AddToMealPlanModalProps> = ({
  isOpen,
  setIsOpen,
  recipes,
  onSelectRecipe,
  selectedDate,
  selectedMealType
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter recipes based on search term
  const filteredRecipes = recipes.filter(
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


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col bg-card border-border/50 rounded-lg shadow-xl text-card-foreground p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/30 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Add to Meal Plan
            </DialogTitle>
            {selectedDate && selectedMealType && (
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                    Adding recipe for {selectedMealType} on {format(selectedDate, 'eeee, MMM d')}
                </DialogDescription>
             )}
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
            <div className="flex items-center gap-4 mb-3">
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
             <div className="flex flex-wrap gap-2">
                <FilterChip icon={Heart} label="Favorites" />
                <FilterChip icon={BookOpen} label="Cookbook" />
                <FilterChip icon={Tag} label="Tags" />
                <FilterChip icon={ChefHat} label="Cuisine" />
                <FilterChip icon={ChefHat} label="Difficulty" /> {/* Placeholder icon */}
                <FilterChip icon={Star} label="Rating" />
                <FilterChip icon={Clock} label="Total time" />
             </div>
        </div>

        {/* Recipe Grid */}
        <ScrollArea className="flex-1 px-6 py-4">
          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredRecipes.map((recipe) => {
                  const imageUrl = getImageUrl(recipe);
                  const isDataUri = imageUrl.startsWith('data:');
                  return (
                      <button
                        key={recipe.name}
                        onClick={() => onSelectRecipe(recipe)}
                        className="group rounded-lg overflow-hidden border border-border/40 hover:border-primary/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-card bg-secondary/30 hover:bg-accent"
                      >
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
                        </div>
                        <div className="p-3">
                          <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {recipe.name}
                          </h4>
                          {/* Optional: Add short description or badges here */}
                           <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                             {recipe.description || 'Select this recipe'}
                           </p>
                        </div>
                      </button>
                  );
                })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-10">
              {searchTerm ? `No recipes found matching "${searchTerm}".` : 'No recipes available.'}
            </p>
          )}
        </ScrollArea>

        {/* Footer (optional, can be removed) */}
        {/* <DialogFooter className="px-6 py-4 border-t border-border/30">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};

export default AddToMealPlanModal;
