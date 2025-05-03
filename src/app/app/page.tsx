// src/app/app/page.tsx
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react'; // Added useEffect
import { Loader2, ChefHat, Search, Filter, LayoutGrid, BookMarked } from 'lucide-react';
import RecipeCard from '@/components/recipe/recipe-card';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
// import { generateRecipes } from '@/ai/flows/generate-recipes'; // Not used directly in this component anymore
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SelectRecipeModal from '@/components/recipe/select-recipe-modal';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from './layout'; // Import context hook


// Define the Recipe type based on GenerateRecipesOutput
type Recipe = GenerateRecipesOutput['recipes'][0];

// Mock initial recipes (replace with actual data fetching if needed)
const initialRecipes: Recipe[] = [
   {
       name: 'Classic French Potato Gratin',
       ingredients: 'Potatoes, Cream, Garlic, Gruyere Cheese, Nutmeg, Salt, Pepper',
       instructions: '1. Slice potatoes thinly.\n2. Layer with cream, garlic, and cheese.\n3. Bake until golden and bubbly.',
       estimatedCookingTime: '1 hour 15 minutes',
       proteinContent: '8g',
       youtubeVideos: [
         { title: 'Perfect Potato Gratin', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/gratin1/320/180' },
         { title: 'Easy Cheesy Potato Bake', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/gratin2/320/180' }
       ],
       imagePrompt: 'A beautifully baked classic French potato gratin in a ceramic dish, topped with melted Gruyere cheese, bubbling hot.',
       // imageDataUri: 'https://picsum.photos/seed/gratin/400/300', // Removed image URI
       description: 'A rich, cheesy baked potato dish layered with cream and herbs, perfect for elegant dinners or special occasions.',
     },
     {
       name: 'Spicy Chicken Tikka Masala',
       ingredients: 'Chicken, Yogurt, Tikka Masala Paste, Onions, Tomatoes, Cream, Ginger, Garlic, Spices',
       instructions: '1. Marinate chicken in yogurt and spices.\n2. Grill or pan-fry chicken.\n3. Simmer onions, tomatoes, and masala paste.\n4. Add chicken and cream, cook until heated through.',
       estimatedCookingTime: '45 minutes',
       proteinContent: '35g',
       youtubeVideos: [
         { title: 'Authentic Chicken Tikka Masala', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/tikka1/320/180' },
         { title: 'Quick & Easy Tikka Masala', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/tikka2/320/180' }
       ],
       imagePrompt: 'A vibrant bowl of creamy Chicken Tikka Masala curry, garnished with fresh cilantro, served with basmati rice.',
       // imageDataUri: 'https://picsum.photos/seed/tikka/400/300', // Removed image URI
       description: 'Tender chicken pieces in a rich, creamy, spiced tomato sauce - a universally loved Indian classic.',
     },
     {
        name: 'Palak Paneer',
        ingredients: 'Paneer, Spinach, Onions, Tomatoes, Ginger, Garlic, Cream, Spices (Garam Masala, Turmeric)',
        instructions: '1. Blanch spinach and blend into a puree.\n2. Sauté onions, ginger, garlic, and tomatoes.\n3. Add spices and spinach puree, cook for a few minutes.\n4. Add paneer cubes and cream, simmer until heated.',
        estimatedCookingTime: '30 minutes',
        proteinContent: '18g',
        youtubeVideos: [
          { title: 'Creamy Palak Paneer Recipe', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/palak1/320/180' },
          { title: 'Healthy Palak Paneer at Home', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/palak2/320/180' }
        ],
        imagePrompt: 'A deep green Palak Paneer curry in a traditional bowl, with soft paneer cubes visible, garnished with cream swirls.',
        // imageDataUri: 'https://picsum.photos/seed/palak/400/300', // Removed image URI
        description: 'A popular vegetarian dish featuring soft Indian cheese cubes in a smooth, creamy spinach gravy.',
      },
     // Add more initial mock recipes if desired
];


const AppPage: FC = () => {
  // Use recipes and isLoading state from context
  const context = useAppContext(); // Get context once

  // Destructure only necessary values from context
  const {
    recipes: contextRecipes,
    setRecipes: setContextRecipes,
    isLoading: contextIsLoading,
    searchTerm,
    setSearchTerm,
    // handleGenerateRecipes is not needed here anymore
    // isSelectRecipeModalOpen and setIsSelectRecipeModalOpen are needed for the modal instance here
    // generatedRecipeOptions and handleRecipeSelection are needed for the modal instance here
    // handleOpenAIGeneration is needed for the button
    handleOpenAIGeneration,
    isSelectRecipeModalOpen,
    setIsSelectRecipeModalOpen,
    generatedRecipeOptions,
    handleRecipeSelection
  } = context;


   // Correctly initialize initial recipes using useEffect
   useEffect(() => {
     if (contextRecipes.length === 0) {
       setContextRecipes(initialRecipes);
     }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []); // Run only once on mount


   // Filter recipes based on search term from context
   const filteredRecipes = contextRecipes.filter(recipe =>
     recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
     recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase())
   );

  return (
    <div className="flex flex-col h-full">
       {/* Search and Filter Header */}
       <div className="flex items-center gap-4 mb-6 px-0"> {/* Removed px specific to header */}
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               type="search"
               placeholder="Search by title, ingredients or content..."
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

        {/* Loading Indicator - Use context isLoading */}
       {contextIsLoading && (
          <div className="flex flex-col justify-center items-center text-center my-10 p-10 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
             <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
             <p className="text-lg font-semibold text-foreground">Generating recipe suggestions...</p>
             <p className="text-sm text-muted-foreground mt-1">AI is whipping up some ideas for you!</p>
          </div>
       )}


      {/* Recipe Grid */}
      {!contextIsLoading && filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe, index) => (
            <RecipeCard key={`${recipe.name}-${index}`} recipe={recipe} /> // Use more stable key if possible
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
                       Try refining your search terms or clear the search to see all recipes.
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
                       Let's get cooking! Add your first recipe or use the AI generator to discover new ones.
                   </p>
                    <Button onClick={handleOpenAIGeneration} className="bg-primary text-primary-foreground hover:bg-primary/90">
                       Generate AI Recipes
                   </Button>
                </>
             )}

         </div>
      )}

       {/* Select Recipe Modal - Now controlled by context, rendered in layout */}
       {/* The modal instance needs to be rendered in the layout to be triggered from there */}
       {/* <SelectRecipeModal
         isOpen={isSelectRecipeModalOpen}
         setIsOpen={setIsSelectRecipeModalOpen}
         recipes={generatedRecipeOptions}
         onSelectRecipe={handleRecipeSelection}
         onTryAgain={() => {
           setIsSelectRecipeModalOpen(false);
           handleOpenAIGeneration(); // Re-open the AI form
         }}
       /> */}
    </div>
  );
};

export default AppPage;
    