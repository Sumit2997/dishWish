// src/app/app/recipe/[id]/page.tsx
'use client';

import React from 'react'; // Import React
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

  const recipeId = params?.id ? decodeURIComponent(params.id as string) : null;

  const recipe = allRecipes.find((r) => r.name === recipeId);

  if (!recipe) {
    // Optionally, you could show a loading state here if recipes are being fetched asynchronously
    // For now, assume recipes are available in context or show not found
    // console.log("Recipe not found for ID:", recipeId);
    // console.log("Available recipes:", allRecipes.map(r => r.name));
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
    <div className="container mx-auto max-w-6xl py-8 px-4 md:px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
            <div> {/* Back button or breadcrumbs could go here */} </div>
            <div className="flex items-center gap-2">
                <Button variant="outline"><Edit className="mr-1.5 h-4 w-4" /> Edit</Button>
                <Button variant="outline"><BookCopy className="mr-1.5 h-4 w-4" /> Cookbook</Button>
                <Button variant="outline"><Share2 className="mr-1.5 h-4 w-4" /> Share</Button>
                <Button variant="outline"><CalendarDays className="mr-1.5 h-4 w-4" /> Plan</Button>
                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
            </div>
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
                    {/* Optional overlay/icons */}
                </div>

                {/* Ingredients */}
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-foreground">Ingredients</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">4 servings</span> {/* Make dynamic if possible */}
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><Plus className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><Trash2 className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><MoreVertical className="h-4 w-4"/></Button>
                        </div>
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
                            <Scale className="h-4 w-4"/> {recipe.proteinContent || 'N/A'} {/* Prep time? */}
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
                    <Button variant="outline">
                        <BarChart className="mr-2 h-4 w-4"/> View Nutrient Analysis
                    </Button>
                </div>

                 {/* Instructions */}
                 <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Instructions</h2>
                    {formatInstructions(recipe.instructions)}
                 </div>

                 {/* AI Feedback */}
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Do you like this AI recipe?</p>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><ThumbsUp className="h-5 w-5"/></Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><ThumbsDown className="h-5 w-5"/></Button>
                    </div>
                </div>


                {/* Customize */}
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                     <h3 className="font-semibold text-foreground mb-1">Customize this recipe?</h3>
                     <p className="text-sm text-muted-foreground mb-4">Swap ingredients you don't have, make it spicier, find a vegan version, or get creative!</p>
                     <Button variant="outline">
                         <Wand2 className="mr-2 h-4 w-4"/> Customize Recipe
                     </Button>
                 </div>

                 {/* Comments */}
                 <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                     <h3 className="font-semibold text-foreground mb-4">Comments</h3>
                     <div className="flex gap-3">
                         <Avatar className="h-8 w-8">
                             <AvatarImage src={addedBy.avatarUrl} alt={addedBy.name} />
                             <AvatarFallback>{addedBy.name.charAt(0)}</AvatarFallback>
                         </Avatar>
                         <div className="flex-1 relative">
                            <Input placeholder="Write a comment..." className="pr-10 bg-input"/>
                            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary">
                                <Send className="h-4 w-4"/>
                            </Button>
                         </div>
                     </div>
                     {/* Add list of comments here */}
                 </div>


                 {/* AI Generation Disclaimer */}
                 <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm text-center">
                     <p className="text-xs text-muted-foreground mb-3">
                         Generated by the <span className="font-medium text-foreground">DishWish AI</span>.<br />
                         This recipe is AI-generated and DishWish has not reviewed it for accuracy or safety. Use your best judgment when preparing AI-generated dishes. Please rate this recipe to help others know if it's good or not.
                     </p>
                     <div className="flex justify-center gap-3">
                         <Button variant="link" size="sm" className="text-xs h-auto p-0">Rate recipe</Button>
                         <Button variant="link" size="sm" className="text-xs h-auto p-0">Generate recipe with AI</Button>
                         <Button variant="link" size="sm" className="text-xs h-auto p-0">Feedback</Button>
                     </div>
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
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {discoverRecipes.map((discoverRecipe, index) => (
                    // Use RecipeCard for consistency, but maybe a smaller version?
                    // Or create a dedicated DiscoverCard component
                    <RecipeCard key={index} recipe={discoverRecipe} />
                ))}
             </div>
        </div>

         {/* Report Post */}
         <div className="text-center mt-12">
             <Button variant="link" className="text-xs text-muted-foreground hover:text-destructive">Report post</Button>
         </div>
    </div>
  );
};

export default RecipeDetailPage;
