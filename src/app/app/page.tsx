// src/app/app/page.tsx
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Loader2, ChefHat, Search, Filter, LayoutGrid } from 'lucide-react'; // Added Search, Filter, LayoutGrid
import RecipeCard from '@/components/recipe/recipe-card';
import type { GenerateRecipesOutput, GenerateRecipesInput } from '@/ai/flows/generate-recipes';
import { generateRecipes } from '@/ai/flows/generate-recipes'; // Ensure generateRecipes is imported
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input'; // Added Input
import { Button } from '@/components/ui/button'; // Added Button
import SelectRecipeModal from '@/components/recipe/select-recipe-modal'; // Import the new modal

// Define the Recipe type based on GenerateRecipesOutput
type Recipe = GenerateRecipesOutput['recipes'][0];

// Mock initial recipes (replace with actual data fetching if needed)
const initialRecipes: Recipe[] = [
   {
       name: 'Classic French Potato Gratin',
       ingredients: 'Potatoes, Cream, Garlic, Gruyere Cheese, Nutmeg, Salt, Pepper',
       instructions: 'Slice potatoes thinly. Layer with cream, garlic, and cheese. Bake until golden and bubbly.',
       estimatedCookingTime: '1 hour 15 minutes',
       proteinContent: '8g',
       youtubeVideos: [
         { title: 'Perfect Potato Gratin', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/gratin1/320/180' },
         { title: 'Easy Cheesy Potato Bake', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/gratin2/320/180' }
       ],
       imagePrompt: 'A beautifully baked classic French potato gratin in a ceramic dish, topped with melted Gruyere cheese, bubbling hot.',
       imageDataUri: 'https://picsum.photos/seed/gratin/400/300',
       description: 'A rich, cheesy baked potato dish layered with cream and herbs, perfect for elegant dinners or special occasions.',
     },
     // Add more initial mock recipes if desired
];

const AppPage: FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectRecipeModalOpen, setIsSelectRecipeModalOpen] = useState(false);
  const [generatedRecipeOptions, setGeneratedRecipeOptions] = useState<Recipe[]>([]);

  const { toast } = useToast();

  // This function is passed to the AppLayout and called when the AI form is submitted
  const handleGenerateRecipes = async (data: { description?: string; ingredientImage?: string; tags?: string[] }) => {
     setIsLoading(true);
     try {
       const input: GenerateRecipesInput = {
         vegetableName: data.description,
         vegetableImage: data.ingredientImage,
         // tags: data.tags, // Assuming tags are handled in the flow
       };
       console.log("Generating recipes with input:", input);
       const result = await generateRecipes(input);

       if (result && result.recipes && result.recipes.length > 0) {
          toast({
             title: "Recipes Generated!",
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
         setGeneratedRecipeOptions([]); // Clear options if none found
       }
     } catch (err) {
       console.error('Error generating recipes:', err);
       const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during generation.';
       toast({
         variant: "destructive",
         title: "Error Generating Recipes",
         description: errorMessage,
       });
        setGeneratedRecipeOptions([]); // Clear options on error
     } finally {
       setIsLoading(false);
     }
  };

   // Function to handle selecting a recipe from the modal
   const handleRecipeSelection = (selectedRecipe: Recipe) => {
     setRecipes(prevRecipes => [selectedRecipe, ...prevRecipes]); // Add the selected recipe to the main list
     setIsSelectRecipeModalOpen(false); // Close the modal
     setGeneratedRecipeOptions([]); // Clear the temporary options
     toast({
       title: `Recipe Added: ${selectedRecipe.name}`,
       description: "The new recipe has been added to your list.",
     });
   };

   // Filter recipes based on search term
   const filteredRecipes = recipes.filter(recipe =>
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

        {/* Loading Indicator */}
       {isLoading && (
          <div className="flex justify-center items-center my-10">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="ml-3 text-muted-foreground">Generating recipe suggestions...</p>
          </div>
       )}


      {/* Recipe Grid */}
      {!isLoading && filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe, index) => (
            <RecipeCard key={index} recipe={recipe} />
          ))}
        </div>
      )}

       {/* No Recipes Message */}
      {!isLoading && filteredRecipes.length === 0 && (
         <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
            <ChefHat className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">No Recipes Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
                {searchTerm
                 ? "Couldn't find any recipes matching your search. Try different keywords."
                 : "Your recipe book is empty! Click 'Add recipe' to start generating or adding your own."}
            </p>
             {/* Optionally add a button here to trigger Add Recipe */}
            {/* <Button onClick={() => {/* Logic to open Add Recipe Modal */}}>
                Add Your First Recipe
            </Button> */}
         </div>
      )}

       {/* Select Recipe Modal */}
      <SelectRecipeModal
         isOpen={isSelectRecipeModalOpen}
         setIsOpen={setIsSelectRecipeModalOpen}
         recipes={generatedRecipeOptions}
         onSelectRecipe={handleRecipeSelection}
         onTryAgain={() => {
           // Optionally re-open the AI generation form or just close
           setIsSelectRecipeModalOpen(false);
           // Potentially trigger handleOpenAIGeneration() again if needed
           // handleOpenAIGeneration(); // You'd need to lift this state/function up or use context
           toast({ title: "Try Again", description: "Feel free to generate recipes again with different inputs."})
         }}
       />
    </div>
  );
};

export default AppPage;
