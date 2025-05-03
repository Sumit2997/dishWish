// src/app/app/page.tsx
'use client';

import { useEffect, useState } from 'react'; // Added useState
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { BookMarked, ChefHat, Filter, LayoutGrid, ListChecks, Plus, Printer, Search, SortAsc, SortDesc, Trash2 } from 'lucide-react'; // Added BookMarked
import RecipeCard from '@/components/recipe/recipe-card';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppContext } from './layout'; // Import context hook
import RecipeCardSkeleton from '@/components/recipe/recipe-card-skeleton'; // Import the skeleton component
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Define the Recipe type based on GenerateRecipesOutput
type Recipe = GenerateRecipesOutput['recipes'][0];

const AppDashBoard: React.FC = () => {
  // Use recipes and isLoading state from context
  const context = useAppContext(); // Get context once

  // Destructure only necessary values from context
  const {
    recipes: contextRecipes,
    isLoading: contextIsLoading,
    searchTerm,
    setSearchTerm,
    handleOpenAIGeneration,
  } = context;

   // Filter recipes based on search term from context
   const filteredRecipes = contextRecipes.filter(recipe =>
     recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
     recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase())
   );

  return (
    <div className="flex flex-col h-full">
       {/* Search and Filter Header */}
       <div className="flex items-center gap-4 mb-6 px-0">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               type="search"
               placeholder="Search by title, ingredients or content..." // Updated placeholder
               className="pl-9 w-full bg-muted border-muted-foreground/20 focus:bg-background focus:border-primary"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Button variant="outline" className="border-muted-foreground/30">
             <Filter className="mr-1.5 h-4 w-4" /> Filters
          </Button>
          <Button variant="outline" className="border-muted-foreground/30">
             <LayoutGrid className="mr-1.5 h-4 w-4" /> View
          </Button>
       </div>

        {/* Loading Indicator - Show Skeleton Grid */}
       {contextIsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {Array.from({ length: 4 }).map((_, index) => ( // Show 4 skeletons for loading
                <RecipeCardSkeleton key={index} />
             ))}
          </div>
       )}


      {/* Recipe Grid */}
      {!contextIsLoading && filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe, index) => (
            <RecipeCard key={`${recipe.name}-${index}`} recipe={recipe} />
          ))}
        </div>
      )}

       {/* No Recipes Message */}
      {!contextIsLoading && filteredRecipes.length === 0 && (
         <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
             {searchTerm ? (
                <>
                   <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
                   <h3 className="text-xl font-semibold mb-2 text-foreground">No Recipes Found Matching "{searchTerm}"</h3>
                   <p className="text-muted-foreground mb-6 max-w-md">
                       Try refining your search terms or clear the search to see all saved recipes.
                   </p>
                   <Button variant="outline" onClick={() => setSearchTerm('')}>
                       Clear Search
                   </Button>
                </>
             ) : (
                <>
                   <BookMarked className="h-16 w-16 text-muted-foreground/50 mb-4" />
                   <h3 className="text-xl font-semibold mb-2 text-foreground">Your Recipe Book is Empty</h3>
                   <p className="text-muted-foreground mb-6 max-w-md">
                       Let's get cooking! Use the AI generator to discover and save new recipes.
                   </p>
                    <Button onClick={handleOpenAIGeneration} className="bg-primary text-primary-foreground hover:bg-primary/90">
                       Generate AI Recipes
                   </Button>
                </>
             )}

         </div>
      )}

       {/* Select Recipe Modal - Rendered in layout */}

    </div>
  );
};

export default AppDashBoard;
    
