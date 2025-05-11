// src/app/app/page.tsx
'use client';

import { useEffect } from 'react';
import { BookMarked, Compass, Filter, LayoutGrid, Plus, Search } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import RecipeCard from '@/components/recipe/recipe-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppContext } from './layout';

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  instructions: string;
  estimatedCookingTime: string;
  proteinContent: string;
  youtubeVideos: {
    title: string;
    url: string;
    thumbnailUrl?: string;
  }[];
  imagePrompt: string;
  imageDataUri?: string;
}

const AppDashboard: React.FC = () => {
  const {
    recipes,
    setRecipes,
    isLoading: contextIsLoading,
    searchTerm,
    setSearchTerm,
    handleOpenAIGeneration,
    handleOpenAddRecipeModal,
  } = useAppContext();

  // Fetch recipes from Firestore
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipesCollection = collection(db, 'recipes');
        const querySnapshot = await getDocs(recipesCollection);

        const fetchedRecipes: Recipe[] = [];
        querySnapshot.forEach((doc) => {
          fetchedRecipes.push({ id: doc.id, ...doc.data() } as Recipe);
        });

        setRecipes(fetchedRecipes);
      } catch (err) {
        console.error('Error fetching recipes:', err);
      }
    };

    fetchRecipes();
  }, [setRecipes]);

  // Show a loading spinner while loading
  if (contextIsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <Search className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Render the dashboard
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b border-border/50 bg-muted/30 px-6 sticky top-0 z-30 mb-6 -mx-6 md:-mx-8 lg:-mx-10">
        <div className="md:hidden">
          <Compass />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-xl text-foreground">My Recipes</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-muted-foreground/30 text-foreground"
          >
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

      {/* Search and Filter Header */}
      <div className="flex items-center gap-4 mb-6 px-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title, ingredients or content..."
            className="pl-9 w-full bg-muted border-muted-foreground/20 focus:bg-background focus:border-primary h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="border-muted-foreground/30 h-9">
          <Filter className="mr-1.5 h-4 w-4" /> Filters
        </Button>
        <Button variant="outline" className="border-muted-foreground/30 h-9">
          <LayoutGrid className="mr-1.5 h-4 w-4" /> View
        </Button>
      </div>

      {/* Recipe Grid */}
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20 mt-10">
          <BookMarked className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-foreground">Your Recipe Book is Empty</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Let's get cooking! Use the AI generator to discover and save new recipes.
          </p>
          <Button
            onClick={handleOpenAIGeneration}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Generate AI Recipes
          </Button>
        </div>
      )}
    </div>
  );
};

export default AppDashboard;
