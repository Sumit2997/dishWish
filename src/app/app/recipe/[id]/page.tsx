// src/app/app/recipe/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Clock,
  Scale,
  Youtube,
  CalendarDays,
  BarChart3,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

import { useAppContext } from '@/app/app/layout';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getYouTubeVideos, YouTubeVideo } from '@/services/youtube';

type Recipe = GenerateRecipesOutput['recipes'][0];

// Helper to format ingredient list with checkboxes
const formatIngredients = (ingredients: string | undefined) => {
  if (!ingredients) return <p className="text-sm text-muted-foreground italic">Not available.</p>;
  const items = ingredients.split(/[\n•*-]/)
                      .map(item => item.trim())
                      .filter(Boolean);

  if (items.length === 0) return <p className="text-sm text-muted-foreground italic">Not available.</p>;

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-center gap-3">
          <Checkbox id={`ingredient-${index}`} className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"/>
          <label htmlFor={`ingredient-${index}`} className="text-sm text-foreground/90 leading-snug cursor-pointer hover:text-primary">
            {item}
          </label>
        </li>
      ))}
    </ul>
  );
};

// Helper to format instructions as numbered steps
const formatInstructions = (instructions: string | undefined) => {
  if (!instructions) return <p className="text-sm text-muted-foreground italic">Not available.</p>;
  const steps = instructions.split(/\d+\.\s/) // Split by number followed by dot and space
                      .map(step => step.trim())
                      .filter(Boolean);

  if (steps.length === 0) return <p className="text-sm text-muted-foreground italic">Not available.</p>;

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li key={index} className="flex gap-3">
          <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {index + 1}
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">{step}</p>
        </li>
      ))}
    </ol>
  );
};

const RecipeDetailPage = () => {
  const params = useParams();
  const { recipes: allRecipes } = useAppContext();
  const router = useRouter();
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [recipeNotFound, setRecipeNotFound] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  
  // State for YouTube videos
  const [suggestedVideos, setSuggestedVideos] = useState<YouTubeVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  // Find recipe and handle loading state
  useEffect(() => {
    if (!params?.id) {
      console.log("No recipe ID found in params");
      setRecipeNotFound(true);
      setIsLoading(false);
      setDebugInfo("No recipe ID found in URL parameters");
      return;
    }

    const recipeId = decodeURIComponent(params.id as string);
    setDebugInfo(`Looking for recipe ID: ${recipeId}, Available recipes: ${allRecipes.length}`);
    console.log("Recipe information:", { recipeId, availableRecipes: allRecipes.length });

    // If we already found the recipe, don't search again
    if (currentRecipe) {
      setIsLoading(false);
      return;
    }
    
    if (allRecipes.length === 0) {
      console.warn("No recipes available yet, waiting for context to load");
      // Don't immediately set loading to false - we'll let the timeout handle it
      return;
    }
      
    // Look for the recipe by name first (for URL compatibility), then by ID if not found
    const recipe = allRecipes.find((r) => 
      r.name === recipeId || // Match by name (original URL format)
      r.id === recipeId || // Match by ID
      encodeURIComponent(r.name) === recipeId // Match by encoded name
    );

    if (recipe) {
      console.log("Recipe found:", recipe.name);
      setCurrentRecipe(recipe);
      setRecipeNotFound(false);
      setIsLoading(false);
      setDebugInfo(`Recipe found: ${recipe.name}`);
    } else {
      console.warn("Recipe not found in available recipes");
      if (allRecipes.length > 0) {
        // Only mark as not found if we have recipes but didn't find a match
        setRecipeNotFound(true);
        setIsLoading(false);
        setDebugInfo(`Recipe not found. Available recipes: ${allRecipes.map(r => r.name).join(', ')}`);
      }
    }
  }, [params?.id, allRecipes, currentRecipe]);

  // Set a timeout to prevent indefinite loading
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        if (isLoading) {
          console.warn("Loading timeout reached - forcing display of available information");
          
          if (allRecipes.length > 0 && params?.id) {
            // Try one more time to find the recipe
            const recipeId = decodeURIComponent(params.id as string);
            const recipe = allRecipes.find((r) => 
              r.name === recipeId || r.id === recipeId || encodeURIComponent(r.name) === recipeId
            );
            
            if (recipe) {
              setCurrentRecipe(recipe);
              setRecipeNotFound(false);
              setDebugInfo(`Recipe found on timeout retry: ${recipe.name}`);
            } else {
              setRecipeNotFound(true);
              setDebugInfo("Recipe not found after timeout");
            }
          } else {
            // If there are still no recipes available, mark as not found
            setRecipeNotFound(true);
            setDebugInfo(`Timeout with ${allRecipes.length} recipes available`);
          }
          
          setIsLoading(false);
        }
      }, 5000); // 5 seconds timeout
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, allRecipes, params?.id]);

  // Fetch YouTube videos when recipe is found
  useEffect(() => {
    if (currentRecipe) {
      const fetchVideos = async () => {
        setIsLoadingVideos(true);
        try {
          // Fetch suggested YouTube videos
          const videos = await getYouTubeVideos(currentRecipe.name, 15);
          setSuggestedVideos(videos);
        } catch (error) {
          console.error('Error fetching YouTube videos:', error);
        } finally {
          setIsLoadingVideos(false);
        }
      };

      fetchVideos();
    }
  }, [currentRecipe]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading recipe details...</p>
        <p className="text-sm text-muted-foreground mt-2">{debugInfo}</p>
        <p className="text-xs text-muted-foreground mt-4">Available recipes: {allRecipes.length}</p>
      </div>
    );
  }

  // Show not found state with debugging info
  if (recipeNotFound) {
    return (
      <div className="container mx-auto max-w-6xl py-20 flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Recipe Not Found</h1>
        <p className="text-muted-foreground mb-6">{debugInfo}</p>
        <Button onClick={() => router.push('/app')}>
          Return to Recipes
        </Button>
      </div>
    );
  }

  // Safety check - shouldn't happen due to the checks above
  if (!currentRecipe) {
    return (
      <div className="container mx-auto max-w-6xl py-20 flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong</h1>
        <p className="text-muted-foreground mb-2">We couldn't load the recipe details.</p>
        <p className="text-sm text-muted-foreground mb-6">{debugInfo}</p>
        <Button onClick={() => router.push('/app')}>
          Return to Recipes
        </Button>
      </div>
    );
  }

  // Recipe data is available, proceed with rendering
  const recipe = currentRecipe;
  
  // Fallback image using picsum with recipe name as seed
  const fallbackImageUrl = `https://picsum.photos/seed/${encodeURIComponent(recipe.name)}/800/600`;
  // Use generated image if available, otherwise fallback
  console.log("Recipe image data:", fallbackImageUrl);
  const imageUrl = recipe.imageDataUri || fallbackImageUrl;
  const isDataUri = imageUrl.startsWith('data:');

  // Mock data for demo purposes
  const addedDate = new Date().toLocaleDateString();

  // Placeholder nutrient data - Replace with actual data
  const nutrientData = [
    { name: 'Protein', value: recipe.proteinContent || '15g Protein' },
    { name: 'Calories', value: '450 kcal' },
    { name: 'Fat', value: '20g' },
    { name: 'Carbohydrates', value: '40g' },
    { name: 'Fiber', value: '8g' },
    { name: 'Sugar', value: '10g' },
  ];

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 md:px-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
        </div>
        
        {/* Main Recipe Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column (Image & Ingredients) */}
            <div className="lg:col-span-1 space-y-6">
                {/* Image */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-border/50">
                    <Image
                        src={imageUrl}
                        alt={`Image of ${recipe.name}`}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={recipe.imagePrompt || recipe.name}
                        unoptimized={isDataUri}
                        onError={(e) => {
                            if (e.currentTarget.src !== fallbackImageUrl) {
                                e.currentTarget.src = fallbackImageUrl;
                                e.currentTarget.srcset = "";
                            }
                        }}
                    />
                </div>

                {/* Ingredients */}
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-foreground">Ingredients</h2>
                    </div>
                    {formatIngredients(recipe.ingredients)}
                </div>

                {/* Nutritional Information Card */}
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold text-foreground">Nutritional Information</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {nutrientData.map((nutrient) => (
                            <div key={nutrient.name} className="space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-foreground">{nutrient.name}</span>
                                    <span className="text-primary font-semibold">{nutrient.value}</span>
                                </div>
                                <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${
                                            nutrient.name === 'Protein' ? 'bg-primary' : 
                                            nutrient.name === 'Calories' ? 'bg-orange-500' :
                                            nutrient.name === 'Fat' ? 'bg-yellow-500' :
                                            nutrient.name === 'Carbohydrates' ? 'bg-blue-500' :
                                            nutrient.name === 'Fiber' ? 'bg-green-500' : 'bg-purple-500'
                                        }`}
                                        style={{ 
                                            width: `${
                                                nutrient.name === 'Protein' ? '70%' : 
                                                nutrient.name === 'Calories' ? '85%' :
                                                nutrient.name === 'Fat' ? '60%' :
                                                nutrient.name === 'Carbohydrates' ? '75%' :
                                                nutrient.name === 'Fiber' ? '40%' : '50%'
                                            }`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-border/30">
                        <h3 className="text-sm font-medium mb-2">Daily Value %</h3>
                        <p className="text-xs text-muted-foreground">
                            These values are estimates based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column (Title, Details, Instructions) */}
            <div className="lg:col-span-2 space-y-6">
                {/* Title and Meta */}
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                    <h1 className="text-3xl font-bold text-primary mb-3">{recipe.name}</h1>
                    <p className="text-base text-muted-foreground mb-4">{recipe.description || 'A delicious recipe.'}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" /> {recipe.estimatedCookingTime || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" /> {addedDate}
                        </div>
                        <div className="flex items-center gap-1">
                            <Scale className="h-4 w-4" /> {recipe.proteinContent || 'Protein N/A'}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Instructions</h2>
                    {formatInstructions(recipe.instructions)}
                </div>
                
                {/* YouTube Videos - Show from recipe.youtubeVideos if available */}
                {recipe.youtubeVideos && recipe.youtubeVideos.length > 0 && (
                    <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Youtube className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold text-foreground">Related Videos</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recipe.youtubeVideos.map((video, index) => (
                                <a 
                                    key={index}
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col bg-muted/30 border border-border/30 rounded-md overflow-hidden hover:border-primary/50 transition-colors"
                                >
                                    {video.thumbnailUrl && (
                                        <div className="relative w-full aspect-video">
                                            <Image
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                layout="fill"
                                                objectFit="cover"
                                            />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <div className="h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center">
                                                    <Youtube className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-3">
                                        <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Suggested YouTube Videos - Dynamically fetched */}
                {/* <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Youtube className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold text-foreground">Suggested YouTube Videos</h2>
                        </div>
                        {isLoadingVideos && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Loading videos...</span>
                            </div>
                        )}
                    </div>

                    {isLoadingVideos ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="flex flex-col bg-muted/30 border border-border/30 rounded-md overflow-hidden animate-pulse">
                                    <div className="w-full aspect-video bg-muted"></div>
                                    <div className="p-3">
                                        <div className="h-5 bg-muted rounded w-3/4 mb-1"></div>
                                        <div className="h-4 bg-muted rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : suggestedVideos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {suggestedVideos.map((video, index) => (
                                <a 
                                    key={index}
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col bg-muted/30 border border-border/30 rounded-md overflow-hidden hover:border-primary/50 transition-colors"
                                >
                                    {video.thumbnailUrl && (
                                        <div className="relative w-full aspect-video">
                                            <Image
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                layout="fill"
                                                objectFit="cover"
                                            />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <div className="h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center">
                                                    <Youtube className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-3">
                                        <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No videos found for this recipe.</p>
                        </div>
                    )}
                </div> */}
            </div>
        </div>   
    </div>
  );
};

export default RecipeDetailPage;
