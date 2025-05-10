// src/app/app/recipe/[id]/page.tsx
'use client';

import React, { useState } from 'react'; // Import useState
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  Scale,
  Youtube,
  Star,
  User,
  CalendarDays,
  BarChart,
  MoreVertical,
  Trash2,
  Plus,
  Edit,
  Share2,
  BookCopy,
  ListPlus,
  ThumbsUp,
  ThumbsDown,
  Wand2,
  Send,
  BarChart3, // Import BarChart3
} from 'lucide-react';

import { useAppContext } from '@/app/app/layout'; // Adjust import path as needed
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import RecipeCard from '@/components/recipe/recipe-card'; // For Discover More section
import { NutrientAnalysisModal } from '@/components/recipe/nutrient-analysis-modal'; // Import the modal

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
  const { recipes: allRecipes } = useAppContext(); // Get recipes from context
  const [isNutrientModalOpen, setIsNutrientModalOpen] = useState(false); // State for modal

  const recipeId = params?.id ? decodeURIComponent(params.id as string) : null;

  const recipe = allRecipes.find((r) => r.name === recipeId);

  if (!recipe) {
    notFound(); // Use Next.js notFound function for 404
  }

  // Fallback image using picsum with recipe name as seed
  const fallbackImageUrl = `https://picsum.photos/seed/${encodeURIComponent(recipe.name)}/800/600`;
  // Use generated image if available, otherwise fallback
  const imageUrl = recipe.imageDataUri || fallbackImageUrl;
  const isDataUri = imageUrl.startsWith('data:');

   // Mock data for demo purposes
   const addedBy = { name: 'SUMIT NARAYAN', avatarUrl: '/placeholder-user.jpg' }; // Replace with actual user data if available
   const addedDate = '5/3/2025'; // Replace with actual date if available

  // Filter for "Discover more recipes" (exclude the current one)
  const discoverRecipes = allRecipes.filter(r => r.name !== recipe.name).slice(0, 4); // Show up to 4 other recipes

  return (
    <>
      <div className="container mx-auto max-w-6xl py-8 px-4 md:px-6">
          {/* Header Section */}

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
                      {/* Optional overlay/icons */}
                  </div>

                  {/* Ingredients */}
                  <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-semibold text-foreground">Ingredients</h2>
                      </div>
                      {formatIngredients(recipe.ingredients)}
                      <Button className="w-full mt-6 bg-primary/90 hover:bg-primary text-primary-foreground">
                          <ListPlus className="mr-2 h-4 w-4" /> Add to shopping list
                      </Button>
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
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {/* Example rating */}
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <Star className="h-4 w-4 text-muted-foreground/50" />
                              <span className="ml-1">0 ratings</span> {/* Placeholder */}
                          </div>
                          <div className="flex items-center gap-1">
                              <Scale className="h-4 w-4"/> {recipe.proteinContent || 'N/A'} {/* Protein */}
                          </div>
                          <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" /> {recipe.estimatedCookingTime || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1">
                              <CalendarDays className="h-4 w-4" /> {addedDate}
                          </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-4">
                          <Avatar className="h-6 w-6">
                              <AvatarImage src={addedBy.avatarUrl} alt={addedBy.name} />
                              <AvatarFallback>{addedBy.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground">Added by:</span>
                          <span className="font-medium text-foreground">{addedBy.name}</span>
                      </div>
                      <Button variant="outline" onClick={() => setIsNutrientModalOpen(true)}> {/* Trigger modal */}
                          <BarChart3 className="mr-2 h-4 w-4"/> View Nutrient Analysis
                      </Button>
                  </div>

                  {/* Instructions */}
                  <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                      <h2 className="text-xl font-semibold text-foreground mb-4">Instructions</h2>
                      {formatInstructions(recipe.instructions)}
                  </div>
              </div>
          </div>


          {/* Discover More Recipes Section */}
          <Separator className="my-12" />
          <div className="mb-8">
              <Link href="/app" passHref>
                  <Button variant="link" className="text-lg font-semibold text-foreground p-0 h-auto mb-4 hover:text-primary">
                      Discover more recipes &gt;
                  </Button>
              </Link>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-1">
                  {discoverRecipes.map((discoverRecipe, index) => (
                      <RecipeCard key={index} recipe={discoverRecipe} />
                  ))}
              </div>
          </div>
      </div>

      {/* Nutrient Analysis Modal */}
      <NutrientAnalysisModal
        isOpen={isNutrientModalOpen}
        setIsOpen={setIsNutrientModalOpen}
        recipeName={recipe.name}
      />
    </>
  );
};

export default RecipeDetailPage;
