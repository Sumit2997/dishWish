// src/app/app/cookbooks/[id]/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  Search,
  Filter,
  LayoutGrid,
  UserPlus,
  Plus,
  MoreVertical,
  ChefHat, // Icon for empty state
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import RecipeCard from '@/components/recipe/recipe-card'; // Reuse recipe card
import type { Recipe } from '@/app/app/layout'; // Import Recipe type
import { useAppContext } from '@/app/app/layout'; // Import app context

// Placeholder interfaces (adjust as needed)
interface CookbookMember {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface CookbookData {
  id: string;
  name: string;
  members: CookbookMember[];
  recipes: Recipe[]; // Recipes associated with this cookbook
}

// Mock data fetching function (replace with actual data source)
const getCookbookData = (id: string): CookbookData | null => {
  // Simulate finding cookbook data
  const cookbooks: CookbookData[] = [
     {
       id: 'family',
       name: 'Family Recipes',
       members: [
         { id: '1', name: 'Sumit Narayan', avatarUrl: '/placeholder-user.jpg' },
         { id: '2', name: 'Alice', avatarUrl: `https://picsum.photos/seed/alice/40/40`},
         { id: '3', name: 'Bob', avatarUrl: `https://picsum.photos/seed/bob/40/40`},
       ],
       recipes: [
          // Assume some recipes are linked here from the global context or fetched
          {
            name: 'Palak Paneer',
            description: 'Creamy spinach curry with paneer cubes.',
            ingredients: 'Spinach, Paneer, Onion, Tomato, Spices',
            instructions: '1. Blanch spinach... 2. Sauté onions...',
            estimatedCookingTime: '45 minutes',
            proteinContent: '18g Protein',
            youtubeVideos: [{ title: 'Palak Paneer Video', url: '#', thumbnailUrl: 'https://picsum.photos/seed/palak-paneer-vid/320/180' }],
            imagePrompt: 'Creamy palak paneer in a bowl',
            imageDataUri: 'https://picsum.photos/seed/palak-paneer/400/300'
          },
       ],
     },
      {
       id: 'quick-meals',
       name: 'Quick Meals',
       members: [{ id: '1', name: 'Sumit Narayan', avatarUrl: '/placeholder-user.jpg' }],
       recipes: [], // Empty cookbook
     },
      {
       id: 'vegetarian-delights',
       name: 'Vegetarian Delights',
        members: [
         { id: '1', name: 'Sumit Narayan', avatarUrl: '/placeholder-user.jpg' },
         { id: '4', name: 'Charlie', avatarUrl: `https://picsum.photos/seed/charlie/40/40` },
       ],
       recipes: [
          // Add more recipes if needed
       ],
     },
  ];
  return cookbooks.find(cb => cb.id === id) || null;
};

const CookbookDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { handleOpenAddRecipeModal } = useAppContext(); // Get modal opener

  const cookbookId = params?.id ? decodeURIComponent(params.id as string) : null;
  const [cookbookData, setCookbookData] = useState<CookbookData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    if (cookbookId) {
      const data = getCookbookData(cookbookId);
      if (data) {
        setCookbookData(data);
      } else {
        // Handle case where cookbook is not found
        // notFound(); // Use this if it should be a 404 page
        console.warn(`Cookbook with id "${cookbookId}" not found. Displaying empty state.`);
        // Set a dummy state to prevent errors, or redirect
         setCookbookData({ id: cookbookId, name: 'Unknown Cookbook', members: [], recipes: [] });
      }
    }
  }, [cookbookId]);

  // Filter recipes within the cookbook
  const filteredRecipes = cookbookData?.recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Utility to get initials
   const getInitials = (name: string | null | undefined) => {
     if (!name) return '?';
     const names = name.split(' ');
     if (names.length === 1) return names[0][0].toUpperCase();
     return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
   };


  if (!cookbookData) {
    // Optional: Show a loading skeleton
    return (
         <div className="flex flex-col h-full items-center justify-center">
            <p>Loading cookbook...</p>
         </div>
     );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b border-border/50 bg-muted/30 px-6 sticky top-0 z-30 mb-6 -mx-6 md:-mx-8 lg:-mx-10">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:inline-flex" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex-1 flex items-center gap-4">
          <h1 className="text-xl font-semibold text-foreground">{cookbookData.name}</h1>
          {/* Member Avatars */}
          <div className="flex items-center -space-x-2">
            {cookbookData.members.slice(0, 3).map(member => ( // Show first 3 members
              <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback className="text-xs bg-muted-foreground/30 text-foreground">
                   {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {cookbookData.members.length > 3 && (
               <Avatar className="h-7 w-7 border-2 border-background bg-muted text-muted-foreground">
                  <AvatarFallback className="text-[10px] font-medium">
                    +{cookbookData.members.length - 3}
                  </AvatarFallback>
               </Avatar>
            )}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-muted-foreground/30">
            <UserPlus className="mr-1.5 h-4 w-4" /> Invite others
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleOpenAddRecipeModal} // Open the add recipe modal
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add recipes
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
             <MoreVertical className="h-4 w-4" />
             <span className="sr-only">Cookbook options</span>
          </Button>
        </div>
      </header>

      {/* Search and Filter */}
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

      {/* Main Content Area */}
      {filteredRecipes.length > 0 ? (
         // Display recipes in a grid
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {filteredRecipes.map((recipe, index) => (
             <RecipeCard key={`${recipe.name}-${index}`} recipe={recipe} />
           ))}
         </div>
      ) : (
         // Empty state for the cookbook
         <div className="flex-1 flex flex-col items-center justify-center text-center p-10 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20 mt-10">
             <div className="p-3 rounded-full bg-primary/10 border border-primary/30 mb-4 inline-block">
                <ChefHat className="h-8 w-8 text-primary" />
             </div>
             <h2 className="text-xl font-semibold text-foreground mb-2">Add recipes</h2>
             <p className="text-muted-foreground mb-6 max-w-md">
               Organize recipes and cook together with friends and family.
             </p>
             <Button
               className="bg-primary text-primary-foreground hover:bg-primary/90"
               onClick={handleOpenAddRecipeModal} // Open the add recipe modal
             >
               <Plus className="mr-1.5 h-4 w-4" /> Add recipes
             </Button>
          </div>
      )}
    </div>
  );
};

export default CookbookDetailPage;
